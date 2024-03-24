const Utils = require('../lib/utils')
  
  , chai = require('chai')
  , sinon = require('sinon')
  , expect = chai.expect;

describe('Utils tests', function() {
    
    describe('getToken', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      it('GetToken', async() => {
        const token_response = {
          data: { access_token: 'accessToken',
                  expires_in:1800,
                  id_token:'idToken', 
                  refresh_token:'refreshToken',
                  scope:'openid offline_access email',
                  token_type:'Bearer'
                },
          status: 200
        }
        sinon.stub(Utils.apiClient, 'post').returns(Promise.resolve(token_response));
        const meta = {clientId: "clientId", clientSecret: "clientSecret", axiosBaseUrl: "axiosBaseUrl"};
        const BASIC_AUTH_AXIOS_CONFIG = {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          auth: { username: meta.clientId, password: meta.clientSecret },
        };
        
        const authData = Utils.createFormData({
          grant_type: 'authorization_code',
          code: 'code',
          redirect_uri: "redirectUri",
          code_verifier: "codeVerifier",
        });

        const responseData = await Utils.getToken("code", "redirectUri" , "codeVerifier", meta );
        sinon.assert.calledWithExactly(Utils.apiClient.post, `/oauth2/token`, authData, BASIC_AUTH_AXIOS_CONFIG);
        expect(responseData).to.be.an.object;  
        expect(responseData.access_token).to.equal(token_response.data.access_token);
        expect(responseData.expires_in).to.equal(token_response.data.expires_in);


      });
    });

    describe('getUserInfo', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      it('getUserInfo', async() => {
        const userInfo_resp = {
          sub: 'sub', 
          tnt_id: 'tenantId', 
          app_id: 'appId', 
          idp_name: 'wristband', 
          email: 'user@wristband.dev',
          email_verified:true
        }
            
        const userInfo_response = {
          data: { sub: 'sub', 
                  tnt_id: 'tenantId', 
                  app_id: 'appId', 
                  idp_name: 'wristband', 
                  email: 'user@wristband.dev',
                  email_verified:true
                },
          status: 200
        }
        sinon.stub(Utils.apiClient, 'get').returns(Promise.resolve(userInfo_response));
        const meta = {clientId: "clientId", clientSecret: "clientSecret", axiosBaseUrl: "axiosBaseUrl"};
        const BASIC_AUTH_AXIOS_CONFIG = {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          auth: { username: meta.clientId, password: meta.clientSecret },
        };
        
        
        const responseData = await Utils.getUserinfo("accessToken", "axiosURL" );
        sinon.assert.calledWithExactly(Utils.apiClient.get, '/oauth2/userinfo', { headers: { Authorization: `Bearer accessToken` } });
        expect(responseData).to.be.an.object;  
        expect(responseData.sub).to.equal(userInfo_response.data.sub);
        expect(responseData.tnt_id).to.equal(userInfo_response.data.tnt_id);
        expect(responseData.app_id).to.equal(userInfo_response.data.app_id);
        expect(responseData.idp_name).to.equal(userInfo_response.data.idp_name);
        expect(responseData.email).to.equal(userInfo_response.data.email);
        expect(responseData.email_verified).to.equal(userInfo_response.data.email_verified);


      });
    
    });

    describe('createUniqueCryptoStr', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      it('check Crypto', function() {
        const randomBytesStub = sinon.stub(require('crypto'), 'randomBytes').returns(Buffer.alloc(32, 'mockedRandomBytes'));
        const random = Utils.createUniqueCryptoStr();
        expect(random).to.be.an.object;  
        
      });
    
    });

    describe('createCodeChallenge', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      
      it('check Crypto', function() {
        const cryptoStub = sinon.stub(require('crypto'), 'createHash');
        const updateStub = sinon.stub().returns({ digest: sinon.stub().returns('mockedDigest') });
        const digestStub = sinon.stub().returns('mockedDigest');
        cryptoStub.returns({ update: updateStub, digest: digestStub });
        const codeVerifier = 'mockedCodeVerifier';

        const result = Utils.createCodeChallenge(codeVerifier);
        expect(result).to.be.an.object;  
        
      });
    
    });

    describe('resolveTenantDomainName', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      
      it('check rootDomain', function() {
        
        const rootDomain = 'invotastic.com';
        const useTenantSubdomains  = true;
        const wristbandApplicationDomain = 'auth.invotastic.com';

        const result = Utils.resolveTenantDomainName(wristbandApplicationDomain, "tenantDomainParam", useTenantSubdomains, rootDomain);
        expect(result).to.be.an.object;  
        expect(result).to.equal("auth");  
        
      });
    
    });

    describe('createFormData', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      
      it('check empty formData', function() {
        
        const result = Utils.createFormData();
        expect(result).to.equal("");  
        
      });
    
    });

    describe('getAuthorizationUrl', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      
      it('useCustomDomains false', function() {
        const tenantDomainName = 'tenantDomainName';
        const appDomain = 'invotastic-testtenat.us.wristband.dev';
        const authorizationUrl = 'https://invotastic-testtenat.us.wristband.dev/api/v1/oauth2/authorize';
        const useCustomDomains = false;

        const result = Utils.getAuthorizationUrl(tenantDomainName, appDomain, authorizationUrl, useCustomDomains);
        expect(result).to.be.an.object; 
        expect(result).to.equal("https://tenantDomainName-invotastic-testtenat.us.wristband.dev/api/v1/oauth2/authorize")
      });

      it('useCustomDomains false', function() {
        const tenantDomainName = 'tenantDomainName';
        const appDomain = 'invotastic-testtenat.us.wristband.dev';
        const authorizationUrl = 'https://invotastic-testtenat.us.wristband.dev/api/v1/oauth2/authorize';
        const useCustomDomains = true;

        const result = Utils.getAuthorizationUrl(tenantDomainName, appDomain, authorizationUrl, useCustomDomains);
        expect(result).to.be.an.object; 
        expect(result).to.equal("https://tenantDomainName.invotastic-testtenat.us.wristband.dev/api/v1/oauth2/authorize")
      });
    
    });

    describe('mergeSearchParams', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      
      it('with same key', function() {
        const parsed = new URL("https://tenantDomainName.invotastic-testtenat.wristband.dev?foo=bar");
        const result = Utils.mergeSearchParams(parsed.searchParams, {"foo" : "par"});
        expect(result).to.be.an.object; 
        expect(result.get("foo")).to.equal("par");
        
      });

      
    
    });

    


});
