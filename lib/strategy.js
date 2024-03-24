const passport = require('passport-strategy');
const url = require('url');
const utils = require('./utils');
const WristbandError = require('./errors/wristbandError');
const SessionStore = require('./state/sessionStore');

class WristbandStrategy extends passport.Strategy {
    constructor(options, callback) {
        super();

        options = options || {};

        if (!callback) {
            throw new TypeError('WristbandStrategy requires a verify callback function');
        }
        if (!options.wristbandApplicationDomain) {
            throw new TypeError('WristbandStrategy requires a wristbandApplicationDomain option');
        }
        if (!options.clientId) {
            throw new TypeError('WristbandStrategy requires a clientId option');
        }
        if (!options.clientSecret) {
            throw new TypeError('WristbandStrategy requires a clientSecret option');
        }

        if (options.useTenantSubdomains && !options.rootDomain) {
            throw new TypeError('WristbandStrategy requires a rootDomain option set if useTenantSubdomains is set to true');
        }



        this.name = 'wristband';
        this._callback = callback;

        this._metadata = {
            wristbandApplicationDomain: options.wristbandApplicationDomain,
            authorizationUrl: `https://${options.wristbandApplicationDomain}/api/v1/oauth2/authorize`,
            tokenUrl: `https://${options.wristbandApplicationDomain}/api/v1/oauth2/token`,
            clientId: options.clientId,
            rootDomain : options.rootDomain,
            useCustomDomains: options.useCustomDomains || false,
            useTenantSubdomains: options.useTenantSubdomains || false,
            callbackUrl: options.callbackUrl,
            clientSecret: options.clientSecret,
            customHeaders: options.customHeaders,
            axiosBaseUrl: `https://${options.wristbandApplicationDomain}/api/v1`
        };

        this._callbackUrl = options.callbackUrl;
        this._scope = options.scope || ['openid offline_access email'];
        this._scopeSeparator = options.scopeSeparator || ' ';
        this._pkceMethod = 'S256';

        this._key = options.sessionKey || ('wristband:' + new URL(this._metadata.authorizationUrl).hostname);
        this._sessionStore = new SessionStore({ key: this._key });
        this._utils = utils;
    }

    authenticate(req, options) {
        options = options || {};
        const self = this;

        const { tenant_domain: tenantDomainParam, return_url: returnUrl, login_hint: loginHint } = req.query;
        const { host } = req.headers;

        const applicationLoginUrl = `https://${this._metadata.wristbandApplicationDomain}/login`;
        const callbackUrl = options.callbackUrl || this._callbackUrl;

        if (req.query && req.query.code) {
            // Once AccessToken is acquired, load userProfile, and then trigger callback method of the strategy with tokenResponse + profile + params
            const handleAfterLoaded = function (err, code_verifier, state, return_url) {
                if (!code_verifier) {
                    return self.fail(state, 403);
                }
                const code = (req.query && req.query.code);

                const params = {};
                params.grant_type = 'authorization_code';
                if (callbackUrl) {
                    params.redirect_uri = callbackUrl;
                }

                self._utils.getToken(code, params.redirect_uri, code_verifier, self._metadata)
                    .then((tokenResponse) => {
                        self.userProfile(tokenResponse.access_token, function (err, profile) {
                            if (err) {
                                return self.error(err);
                            }

                            function verified(err, user, info) {
                                if (err) {
                                    return self.error(err);
                                }
                                if (!user) {
                                    return self.fail(info);
                                }
                                info = info || {};
                                self.success(user, info);
                            }

                            try {
                                params.return_url = return_url;
                                params.expires_in = tokenResponse.expires_in;
                                self._callback(tokenResponse.access_token, tokenResponse.refresh_token, tokenResponse.id_token, params, profile, verified);
                            } catch (ex) {
                                return self.error(ex);
                            }
                        })
                    })
                    .catch((err) => {
                        console.debug(err);
                        if (err && err.response && err.response.data) {
                            return self.error(new WristbandError(err.response.data.error, err.response.data.error_description));
                        }
                        return self.error(new Error("Failed to get tokens."));
                    });

            }
            // verify the state and then trigger callback to getToken, userProfile
            const state = (req.query && req.query.state);
            try {
                this._sessionStore.verify(req, state, handleAfterLoaded);
            } catch (ex) {
                return this.error(ex);
            }
        } else {
            // login flow
            const params = {};
            // Make sure domain is valid before attempting OAuth2 Auth Code flow for tenant-level login
            params.tenantDomainName = utils.resolveTenantDomainName(host, tenantDomainParam, this._metadata.useTenantSubdomains, this._metadata.rootDomain);
            if (!params.tenantDomainName) {
                return this.redirect(applicationLoginUrl);
            }

            params.return_url = returnUrl;
            params.login_hint = loginHint;

            params.response_type = 'code';
            if (callbackUrl) {
                params.redirect_uri = callbackUrl;
            }
            let scope = options.scope || this._scope;
            if (scope) {
                if (Array.isArray(scope)) {
                    scope = scope.join(this._scopeSeparator);
                }
                params.scope = scope;
            }

            const verifier = this._utils.createUniqueCryptoStr();
            params.code_challenge = this._utils.createCodeChallenge(verifier);
            params.code_challenge_method = this._pkceMethod;

            // After storing the state in SessionStore, redirect AuthUrl with all params. 
            const handleAfterStored = function (err, state) {
                if (err) {
                    return self.error(err);
                }
                const authorizationUrl = self._utils.getAuthorizationUrl(params.tenantDomainName, self._metadata.wristbandApplicationDomain, 
                    self._metadata.authorizationUrl, self._metadata.useCustomDomains);

                if (state) {
                    params.state = state;
                }
                const parsed = new URL(authorizationUrl);
                params.client_id = self._metadata.clientId;
                self._utils.mergeSearchParams(parsed.searchParams, params);
                const location = parsed.toString();
                self.redirect(location);
            }

            try {
                this._sessionStore.store(req, verifier, params, handleAfterStored);
            } catch (ex) {
                return this.error(ex);
            }
        }
    }

    userProfile(accessToken, done) {
        this._utils.getUserinfo(accessToken, this._metadata.axiosBaseUrl).then((userInfo) => {
            return done(null, userInfo);
        })
        .catch((err) => {
            console.debug(err);
            if (err && err.response && err.response.data) {
                return this.error(new WristbandError(err.response.data.error, err.response.data.error_description));
            }
            return this.error(new Error("Failed to get userInfo."));
        });
    }

}

module.exports = WristbandStrategy;
