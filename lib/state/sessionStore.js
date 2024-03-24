const crypto = require('crypto');
const WristbandError = require('../errors/wristbandError');

class SessionStore {
    constructor(options) {
        if (!options.key) {
            throw new TypeError('For Session-based state store, the session key is required');
        }
        this._key = options.key;
    }

    store(req, code_verifier, params, callback) {
        if (!req.session) {
            return callback(new WristbandError('session_configuration_issue', 'Session is required in the SessionStore'));
        }

        const loginSession = {
            state : this.randomUUID(),
            code_verifier: code_verifier,
            return_url: params.return_url
        };

        if (!req.session[this._key]) {
            req.session[this._key] = {};
        }

        req.session[this._key].loginSession = loginSession;
        callback(null, loginSession.state);
    }

    verify(req, providedState, callback) {
        if (!req.session) {
            return callback(new WristbandError('session_configuration_issue', 'Session is required in the SessionStore'));
        }

        if (!req.session[this._key]) {
            return callback(new WristbandError('session_configuration_issue', 'LoginSession not found by session key'));
        }

        const loginSession = req.session[this._key].loginSession;
        if (!loginSession) {
            return callback(new WristbandError('session_configuration_issue', 'LoginSession is empty'));
        }

        delete req.session[this._key].loginSession;
        if (Object.keys(req.session[this._key]).length === 0) {
            delete req.session[this._key];
        }

        if (loginSession.state !== providedState) {
            return callback(new WristbandError('authentication_error', 'Provided state is not matching the saved state'));
        }

        return callback(null, loginSession.code_verifier, loginSession.state, loginSession.return_url);
    }

    randomUUID(){
        return crypto.randomUUID();
    }
}

module.exports = SessionStore;

