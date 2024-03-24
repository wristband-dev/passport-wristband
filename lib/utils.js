const axios = require('axios');
const Agent = require('agentkeepalive');
const https = require('https');
const crypto = require('crypto');

class Utils {
  constructor() {
    this.apiClient = axios.create({
      httpAgent: new Agent({
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000,
      }),
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {'Content-Type': 'application/json;charset=UTF-8', Accept: 'application/json;charset=UTF-8'},
      maxRedirects: 0,
    });
  }

  async getToken(code, redirectUri, codeVerifier, meta) {
    const AUTH_CODE_GRANT_TYPE = 'authorization_code';
    const BASIC_AUTH_AXIOS_CONFIG = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: meta.clientId, password: meta.clientSecret },
    };
    const authData = this.createFormData({
      grant_type: AUTH_CODE_GRANT_TYPE,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });
    this.apiClient.defaults.baseURL = meta.axiosBaseUrl;
    const response = await this.apiClient.post(`/oauth2/token`, authData, BASIC_AUTH_AXIOS_CONFIG);
    return response.data;
  }

  async getUserinfo(accessToken, axiosURL) {
    this.apiClient.defaults.baseURL = axiosURL;
    const requestConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
    const response = await this.apiClient.get('/oauth2/userinfo', requestConfig);
    return response.data;
  }

  createFormData(formParams) {
    if (!formParams) {
      return '';
    }

    return Object.keys(formParams)
        .map((key) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(formParams[key])}`;
        })
        .join('&');
  }

  createUniqueCryptoStr() {
    return this.base64URLEncode(crypto.randomBytes(32));
  }

  createCodeChallenge(codeVerifier) {
    return this.base64URLEncode(
        crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest()
    );
  }

  base64URLEncode(strToEncode) {
    return strToEncode
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
  }

  resolveTenantDomainName(host, tenantDomainParam, useTenantSubdomains, rootDomain) {
    if (!useTenantSubdomains) {
      return tenantDomainParam;
    } else {
      if (host.substr(host.indexOf('.') + 1) === rootDomain) {
        return host.substr(0, host.indexOf('.'));
      }
    }
  }

  getAuthorizationUrl(tenantDomainName, appDomain, authorizationUrl, useCustomDomains) {
    let separator = '-';
    // check if it's custom domain name
    if (useCustomDomains) {
      separator = '.';
    }
    return tenantDomainName ? `https://${tenantDomainName}${separator}${appDomain}/api/v1/oauth2/authorize`: authorizationUrl;
  }

  mergeSearchParams(searchParams, params) {
    if (searchParams && params) {
      for (const key in params) {
        if (searchParams.has(key)) {
          if (params[key]) {
            searchParams.set(key, params[key]);
          }
        } else {
          if (params[key]) {
            searchParams.append(key, params[key]);
          }
        }
      }
    }
    return searchParams;
  }
}

module.exports = new Utils();