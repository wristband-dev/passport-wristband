const WristbandStrategy = require('../lib/strategy')
  , WristbandError = require('../lib/errors/wristbandError')
  , chai = require('chai')
  , expect = chai.expect;


describe('WristbandStrategy', function() {
  
    describe('constructed', function() {
      
      describe('with basic option params', function() {
        var strategy = new WristbandStrategy({
            clientId: 'qoblahblahblahblahprw6u',
            clientSecret: 'a8blahblahblahblahblahblahblahcd',
            callbackUrl: 'http://localhost:8080/api/auth/callback',
            wristbandApplicationDomain: 'testdomain.wristband.dev',
          }, function() {});
      
        it('strategy name is wristband', function() {
          expect(strategy.name).to.equal('wristband');
        });
      }); 
      
      describe('without a verify callback', function() {
        it('throw if verify callback function is not present', function() {
          expect(function() {
            new WristbandStrategy({
                clientId: 'qoblahblahblahblahprw6u',
                clientSecret: 'a8blahblahblahblahblahblahblahcd',
                callbackUrl: 'http://localhost:8080/api/auth/callback',
                wristbandApplicationDomain: 'testdomain.wristband.dev',
            });
          }).to.throw(TypeError, 'WristbandStrategy requires a verify callback function');
        });
      }); 

      describe('without wristbandApplicationDomain option', function() {
        it('throw if wristbandApplicationDomain is not present', function() {
          expect(function() {
            new WristbandStrategy({
                clientId: 'qoblahblahblahblahprw6u',
                clientSecret: 'a8blahblahblahblahblahblahblahcd',
                callbackUrl: 'http://localhost:8080/api/auth/callback',
            }, function() {});
          }).to.throw(TypeError, 'WristbandStrategy requires a wristbandApplicationDomain option');
        });
      }); 

      describe('without clientSecret option', function() {
        it('throw if clientSecret is not present', function() {
          expect(function() {
            new WristbandStrategy({
                clientId: 'qoblahblahblahblahprw6u',
                callbackUrl: 'http://localhost:8080/api/auth/callback',
                wristbandApplicationDomain: 'testdomain.wristband.dev',
            }, function() {});
          }).to.throw(TypeError, 'WristbandStrategy requires a clientSecret option');
        });
      }); 

      describe('without clientId option', function() {
        it('throw if clientId is not present', function() {
          expect(function() {
            new WristbandStrategy({
                clientSecret: 'a8blahblahblahblahblahblahblahcd',
                callbackUrl: 'http://localhost:8080/api/auth/callback',
                wristbandApplicationDomain: 'testdomain.wristband.dev',
            }, function() {});
          }).to.throw(TypeError, 'WristbandStrategy requires a clientId option');
        });
      }); 

      describe('without rootDomain option set if useTenantSubdomains is set', function() {
        it('throw if rootDomain option not set but useTenantSubdomains is set', function() {
          expect(function() {
            new WristbandStrategy({
                clientId: 'qoblahblahblahblahprw6u',
                clientSecret: 'a8blahblahblahblahblahblahblahcd',
                callbackUrl: 'http://localhost:8080/api/auth/callback',
                useTenantSubdomains: true,
                wristbandApplicationDomain: 'auth.invotastic.com',
            }, function() {});
          }).to.throw(TypeError, 'WristbandStrategy requires a rootDomain option set if useTenantSubdomains is set to true');
        });
      });
  
    });
  });

