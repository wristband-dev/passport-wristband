const WristbandError = require('../lib/errors/wristbandError')
  , chai = require('chai')
  , sinon = require('sinon')
  , expect = chai.expect;

describe('Error tests', function() {
    
  describe('constructed without a message', function() {
    var err = new WristbandError();
    
    it('No need to have default', function() {
      expect(err.message).to.equal('');
      expect(err.code).to.equal(undefined);
      expect(err.status).to.equal(undefined);
    });
    
    it('should have proper name', function() {
      
      expect(err.toString()).to.equal('WristbandError');
      expect(err.name).to.equal('WristbandError');
    });
  });

    // describe('WristbandError', function() {
    //   after(function() {
    //     // Restore all stubs and spies created by Sinon.js after each test
    //     sinon.restore();
    //   });
  
    //   it('GetToken', async() => {
    //     const token_response = {
    //       data: { access_token: 'accessToken',
    //               expires_in:1800,
    //               id_token:'idToken', 
    //               refresh_token:'refreshToken',
    //               scope:'openid offline_access email',
    //               token_type:'Bearer'
    //             },
    //       status: 200
    //     }
    //     sinon.stub(Utils.apiClient, 'post').returns(Promise.resolve(token_response));
    //     const meta = {clientId: "clientId", clientSecret: "clientSecret", axiosBaseUrl: "axiosBaseUrl"};
    //     const BASIC_AUTH_AXIOS_CONFIG = {
    //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //       auth: { username: meta.clientId, password: meta.clientSecret },
    //     };
        
    //     const authData = Utils.createFormData({
    //       grant_type: 'authorization_code',
    //       code: 'code',
    //       redirect_uri: "redirectUri",
    //       code_verifier: "codeVerifier",
    //     });

    //     const responseData = await Utils.getToken("code", "redirectUri" , "codeVerifier", meta );
    //     sinon.assert.calledWithExactly(Utils.apiClient.post, `/oauth2/token`, authData, BASIC_AUTH_AXIOS_CONFIG);
    //     expect(responseData).to.be.an.object;  
    //     expect(responseData.access_token).to.equal(token_response.data.access_token);
    //     expect(responseData.expires_in).to.equal(token_response.data.expires_in);


    //   });
    // });

    // describe('getUserInfo', function() {
    //   after(function() {
    //     // Restore all stubs and spies created by Sinon.js after each test
    //     sinon.restore();
    //   });
  
    //   it('getUserInfo', async() => {
    //     const userInfo_resp = {
    //       sub: 'sub', 
    //       tnt_id: 'tenantId', 
    //       app_id: 'appId', 
    //       idp_name: 'wristband', 
    //       email: 'user@wristband.dev',
    //       email_verified:true
    //     }
            
    //     const userInfo_response = {
    //       data: { sub: 'sub', 
    //               tnt_id: 'tenantId', 
    //               app_id: 'appId', 
    //               idp_name: 'wristband', 
    //               email: 'user@wristband.dev',
    //               email_verified:true
    //             },
    //       status: 200
    //     }
    //     sinon.stub(Utils.apiClient, 'get').returns(Promise.resolve(userInfo_response));
    //     const meta = {clientId: "clientId", clientSecret: "clientSecret", axiosBaseUrl: "axiosBaseUrl"};
    //     const BASIC_AUTH_AXIOS_CONFIG = {
    //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //       auth: { username: meta.clientId, password: meta.clientSecret },
    //     };
        
        
    //     const responseData = await Utils.getUserinfo("accessToken", "axiosURL" );
    //     sinon.assert.calledWithExactly(Utils.apiClient.get, '/oauth2/userinfo', { headers: { Authorization: `Bearer accessToken` } });
    //     expect(responseData).to.be.an.object;  
    //     expect(responseData.sub).to.equal(userInfo_response.data.sub);
    //     expect(responseData.tnt_id).to.equal(userInfo_response.data.tnt_id);
    //     expect(responseData.app_id).to.equal(userInfo_response.data.app_id);
    //     expect(responseData.idp_name).to.equal(userInfo_response.data.idp_name);
    //     expect(responseData.email).to.equal(userInfo_response.data.email);
    //     expect(responseData.email_verified).to.equal(userInfo_response.data.email_verified);


    //   });
    
    // });

    // describe('createUniqueCryptoStr', function() {
    //   after(function() {
    //     // Restore all stubs and spies created by Sinon.js after each test
    //     sinon.restore();
    //   });
  
    //   var mockCrypto = {
    //     randomBytes: function(len) {
          
    //       return Buffer.from(
    //         [116, 24, 223, 180, 151, 153, 224, 37, 79, 250, 96, 125, 216, 173,
    //         187, 186, 22, 212, 37, 77, 105, 214, 191, 240, 91, 88, 5, 88, 83,
    //         132, 141, 121]
    //       );
    //     }
    //   }

    //   it('check Crypto', function() {
    //     var Utils = require('proxyquire')('../lib/utils', { crypto: mockCrypto })
    //     const random = Utils.createUniqueCryptoStr( );
    //     expect(random).to.be.an.object;  
        
    //   });
    
    // });
});
