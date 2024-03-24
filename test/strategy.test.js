const WristbandStrategy = require('../lib/strategy')
  , WristbandError = require('../lib/errors/wristbandError')
  , SessionStore = require('../lib/state/sessionStore')
  , chai = require('chai')
  , sinon = require('sinon')
  , crypto = require('crypto')
  , expect = chai.expect;

describe('WristbandStrategy functional tests', function() {
  
  describe('authorization request test', function() {
    
    describe('redirect check on tenantDomain param', function() {
      var strategy = new WristbandStrategy({
          clientId: 'qoblahblahblahblahprw6u',
          clientSecret: 'a8blahblahblahblahblahblahblahcd',
          callbackUrl: 'http://localhost:8080/api/auth/callback',
          wristbandApplicationDomain: 'testdomain.wristband.dev',
        }, function(accessToken, refreshToken, profile, done) {});

      var url;
  
      before(function(done) {
        chai.passport.use(strategy)
          .redirect(function(u) {
            url = u;
            done();
          })
          .req(function(req) {
            req.query = {};
          })
          .authenticate();
      });
      
  
      it('should be redirected', function() {
        expect(url).to.equal('https://testdomain.wristband.dev/login');
      });
    }); // that redirect to login Url
  });
  
  describe('Store state and verifier before redirecting to authorizeUrl', function() {
    var url;
    var request;
    before(function(done) {
      var strategy = new WristbandStrategy({
        clientId: 'qoblahblahblahblahprw6u',
        clientSecret: 'a8blahblahblahblahblahblahblahcd',
        callbackUrl: 'http://localhost:8080/api/auth/callback',
        wristbandApplicationDomain: 'testdomain.wristband.dev',
      }, function(accessToken, refreshToken, profile, done) {});

      // Stub the randomUUID method of the SessionStore instance
      const randomUUIDStub = sinon.stub(strategy._sessionStore, 'randomUUID').returns('mocked-uuid');
      const createUniqueCryptoStrStub = sinon.stub(strategy._utils, 'createUniqueCryptoStr').returns('mockVerifier');
      sinon.stub(strategy._utils, 'createCodeChallenge').returns('mockCodeChallenge');
    
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
          request = req;
          req.query = {};
          req.session = {};
          req.query.tenant_domain = "tenantDomain"
        })
        .authenticate();
    });

    after(function() {
      // Restore all stubs and spies created by Sinon.js after each test
      sinon.restore();
    });

    it('store state in SessionStore', function() {
      expect(request.session).to.be.an.object;
      expect(request.session['wristband:testdomain.wristband.dev'].loginSession).to.be.an.object;
      expect(request.session['wristband:testdomain.wristband.dev'].loginSession.state).equal('mocked-uuid');
      expect(request.session['wristband:testdomain.wristband.dev'].loginSession.code_verifier).equal('mockVerifier');
      
    });
  }); 

  // describe('Store state and verifier before redirecting to authorizeUrl', function() {
  //   var url;
  //   var request;
  //   var sessionStateStoreStub;
  //   before(function(done) {
  //     var strategy = new WristbandStrategy({
  //       clientId: 'qoblahblahblahblahprw6u',
  //       clientSecret: 'a8blahblahblahblahblahblahblahcd',
  //       callbackUrl: 'http://localhost:8080/api/auth/callback',
  //       wristbandApplicationDomain: 'testdomain.wristband.dev',
  //     }, function(accessToken, refreshToken, profile, done) {});

  //     // Stub the randomUUID method of the SessionStore instance
  //     const randomUUIDStub = sinon.stub(strategy._sessionStore, 'randomUUID').returns('mocked-uuid');
  //     const createUniqueCryptoStrStub = sinon.stub(strategy._utils, 'createUniqueCryptoStr').returns('mockVerifier');
  //     sinon.stub(strategy._utils, 'createCodeChallenge').returns('mockCodeChallenge');
  //     sessionStateStoreStub = sinon.stub(strategy._sessionStore, 'store').rejects(new Error('mocked error'));
  //     chai.passport.use(strategy)
  //       .error(function(e) {
  //         err = e;
  //         done();
  //       })
  //       .req(function(req) {
  //         request = req;
  //         req.query = {};
  //         req.session = {};
  //         req.query.tenant_domain = "tenantDomain"
  //       })
  //       .authenticate();
  //   });

  //   after(function() {
  //     // Restore all stubs and spies created by Sinon.js after each test
  //     sinon.restore();
  //   });

  //   it('store state in SessionStore', function() {
  //     sinon.assert.calledOnce(sessionStateStoreStub);
  //   });
  // }); 


  describe('verify the state and get Token', function() {
    var user, info;
    before(function(done) {
      var strategy = new WristbandStrategy({
        clientId: 'qoblahblahblahblahprw6u',
        clientSecret: 'a8blahblahblahblahblahblahblahcd',
        callbackUrl: 'http://localhost:8080/api/auth/callback',
        wristbandApplicationDomain: 'testdomain.wristband.dev',
      }, function(accessToken, refreshToken, idToken, params, profile, done) {
        
        done(null, {  'accessToken': accessToken, 'refreshToken': refreshToken, 'idToken': idToken, 'profile': profile, 'userId': profile.sub
        , 'tenantId' : profile.tnt_id, 'identityProviderName': profile.idp_name, 'returnUrl': params.return_url});
      });

      // Stub the randomUUID method of the SessionStore instance
      const randomUUIDStub = sinon.stub(strategy._sessionStore, 'randomUUID').returns('mocked-uuid');
      const createUniqueCryptoStrStub = sinon.stub(strategy._utils, 'createUniqueCryptoStr').returns('mockVerifier');
      sinon.stub(strategy._utils, 'createCodeChallenge').returns('mockCodeChallenge');
      
      const token_resp = {
        access_token: 'accessToken',
        expires_in:1800,
        id_token:'idToken', 
        refresh_token:'refreshToken',
        scope:'openid offline_access email',
        token_type:'Bearer'
      }

      const userInfo_resp = {
        sub: 'sub', 
        tnt_id: 'tenantId', 
        app_id: 'appId', 
        idp_name: 'wristband', 
        email: 'user@wristband.dev',
        email_verified:true
      }
      sinon.stub(strategy._utils, 'getToken').returns(Promise.resolve(token_resp));
      sinon.stub(strategy._utils, 'getUserinfo').returns(Promise.resolve(userInfo_resp));
      
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          request = req;
          req.query = {};
          req.query.code = 'authCode';
          req.query.state = 'mocked-uuid';
          req.session = {};
          req.session['wristband:testdomain.wristband.dev'] = {};
          req.session['wristband:testdomain.wristband.dev']['loginSession'] = { state: 'mocked-uuid', code_verifier: 'mockVerifier' };
        })
        .authenticate();
    });

    after(function() {
      // Restore all stubs and spies created by Sinon.js after each test
      sinon.restore();
    });

    it('request.user verfication', function() {
      expect(user).to.be.an.object;
      expect(user.accessToken).to.equal('accessToken');
      expect(user.identityProviderName).to.equal('wristband');
      expect(user.idToken).to.equal('idToken');
      expect(user.refreshToken).to.equal('refreshToken');
      expect(user.tenantId).to.equal('tenantId');
      expect(user.userId).to.equal('sub');
      // check profile
      expect(user.profile).to.be.an.object;
      expect(user.profile.sub).to.equal('sub');
      expect(user.profile.tnt_id).to.equal('tenantId');
      expect(user.profile.app_id).to.equal('appId');
      expect(user.profile.idp_name).to.equal('wristband');
      expect(user.profile.email).to.equal('user@wristband.dev');
      expect(user.profile.email_verified).to.equal(true);

    });

  });
  
  describe('get Token exception', function() {
    var err;
    var getTokenStub;
    before(function(done) {
      var strategy = new WristbandStrategy({
        clientId: 'qoblahblahblahblahprw6u',
        clientSecret: 'a8blahblahblahblahblahblahblahcd',
        callbackUrl: 'http://localhost:8080/api/auth/callback',
        wristbandApplicationDomain: 'testdomain.wristband.dev',
      }, function(accessToken, refreshToken, idToken, params, profile, done) {
        
        done(null, {  'accessToken': accessToken, 'refreshToken': refreshToken, 'idToken': idToken, 'profile': profile, 'userId': profile.sub
        , 'tenantId' : profile.tnt_id, 'identityProviderName': profile.idp_name, 'returnUrl': params.return_url});
      });

      getTokenStub = sinon.stub(strategy._utils, 'getToken').rejects(new Error('mocked error'));
      
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          request = req;
          req.query = {};
          req.query.code = 'authCode';
          req.query.state = 'mocked-uuid';
          req.session = {};
          req.session['wristband:testdomain.wristband.dev'] = {};
          req.session['wristband:testdomain.wristband.dev']['loginSession'] = { state: 'mocked-uuid', code_verifier: 'mockVerifier' };
        })
        .authenticate();
      
      
    });

    after(function() {
      // Restore all stubs and spies created by Sinon.js after each test
      sinon.restore();
    });

    it('request.user verfication', function() {
      sinon.assert.calledOnce(getTokenStub);

    });

  });

  describe('get Token with WB exception', function() {
    var err;
    var getTokenStub;
    before(function(done) {
      var strategy = new WristbandStrategy({
        clientId: 'qoblahblahblahblahprw6u',
        clientSecret: 'a8blahblahblahblahblahblahblahcd',
        callbackUrl: 'http://localhost:8080/api/auth/callback',
        wristbandApplicationDomain: 'testdomain.wristband.dev',
      }, function(accessToken, refreshToken, idToken, params, profile, done) {
        
        done(null, {  'accessToken': accessToken, 'refreshToken': refreshToken, 'idToken': idToken, 'profile': profile, 'userId': profile.sub
        , 'tenantId' : profile.tnt_id, 'identityProviderName': profile.idp_name, 'returnUrl': params.return_url});
      });

      getTokenStub = sinon.stub(strategy._utils, 'getToken').rejects({response: {data: {error: "mock_exception", error_description: "Mock Exception"}}});
      
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          request = req;
          req.query = {};
          req.query.code = 'authCode';
          req.query.state = 'mocked-uuid';
          req.session = {};
          req.session['wristband:testdomain.wristband.dev'] = {};
          req.session['wristband:testdomain.wristband.dev']['loginSession'] = { state: 'mocked-uuid', code_verifier: 'mockVerifier' };
        })
        .authenticate();
      
      
    });

    after(function() {
      // Restore all stubs and spies created by Sinon.js after each test
      sinon.restore();
    });

    it('request.user verfication', function() {
      sinon.assert.calledOnce(getTokenStub);

    });

  });


  describe('get UserInfo exception', function() {
    var err;
    var getTokenStub;
    before(function(done) {
      var strategy = new WristbandStrategy({
        clientId: 'qoblahblahblahblahprw6u',
        clientSecret: 'a8blahblahblahblahblahblahblahcd',
        callbackUrl: 'http://localhost:8080/api/auth/callback',
        wristbandApplicationDomain: 'testdomain.wristband.dev',
      }, function(accessToken, refreshToken, idToken, params, profile, done) {
        
        done(null, {  'accessToken': accessToken, 'refreshToken': refreshToken, 'idToken': idToken, 'profile': profile, 'userId': profile.sub
        , 'tenantId' : profile.tnt_id, 'identityProviderName': profile.idp_name, 'returnUrl': params.return_url});
      });

      const token_resp = {
        access_token: 'accessToken',
        expires_in:1800,
        id_token:'idToken', 
        refresh_token:'refreshToken',
        scope:'openid offline_access email',
        token_type:'Bearer'
      }

      sinon.stub(strategy._utils, 'getToken').returns(Promise.resolve(token_resp));
      getUserInfoStub = sinon.stub(strategy._utils, 'getUserinfo').rejects(new Error('mocked error'));
      
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          request = req;
          req.query = {};
          req.query.code = 'authCode';
          req.query.state = 'mocked-uuid';
          req.session = {};
          req.session['wristband:testdomain.wristband.dev'] = {};
          req.session['wristband:testdomain.wristband.dev']['loginSession'] = { state: 'mocked-uuid', code_verifier: 'mockVerifier' };
        })
        .authenticate();
      
      
    });

    after(function() {
      // Restore all stubs and spies created by Sinon.js after each test
      sinon.restore();
    });

    it('request.user verfication', function() {
      sinon.assert.calledOnce(getUserInfoStub);

    });

  });
  describe('get UserInfo WB exception', function() {
    var err;
    var getTokenStub;
    before(function(done) {
      var strategy = new WristbandStrategy({
        clientId: 'qoblahblahblahblahprw6u',
        clientSecret: 'a8blahblahblahblahblahblahblahcd',
        callbackUrl: 'http://localhost:8080/api/auth/callback',
        wristbandApplicationDomain: 'testdomain.wristband.dev',
      }, function(accessToken, refreshToken, idToken, params, profile, done) {
        
        done(null, {  'accessToken': accessToken, 'refreshToken': refreshToken, 'idToken': idToken, 'profile': profile, 'userId': profile.sub
        , 'tenantId' : profile.tnt_id, 'identityProviderName': profile.idp_name, 'returnUrl': params.return_url});
      });

      const token_resp = {
        access_token: 'accessToken',
        expires_in:1800,
        id_token:'idToken', 
        refresh_token:'refreshToken',
        scope:'openid offline_access email',
        token_type:'Bearer'
      }
      
      sinon.stub(strategy._utils, 'getToken').returns(Promise.resolve(token_resp));
      getUserInfoStub = sinon.stub(strategy._utils, 'getUserinfo').rejects({response: {data: {error: "mock_exception", error_description: "Mock Exception"}}});
      
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          request = req;
          req.query = {};
          req.query.code = 'authCode';
          req.query.state = 'mocked-uuid';
          req.session = {};
          req.session['wristband:testdomain.wristband.dev'] = {};
          req.session['wristband:testdomain.wristband.dev']['loginSession'] = { state: 'mocked-uuid', code_verifier: 'mockVerifier' };
        })
        .authenticate();
      
      
    });

    after(function() {
      // Restore all stubs and spies created by Sinon.js after each test
      sinon.restore();
    });

    it('request.user verfication', function() {
      sinon.assert.calledOnce(getUserInfoStub);

    });

  });
    
});


