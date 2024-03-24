const SessionStore = require('../lib/state/sessionStore'),
  WristbandError = require('../lib/errors/wristbandError')
  , chai = require('chai')
  , sinon = require('sinon')
  , expect = chai.expect;

describe('SessionStore tests', function() {
    
    

    describe('constructor check', function() {
      after(function() {
        // Restore all stubs and spies created by Sinon.js after each test
        sinon.restore();
      });
  
      it('check Key not present', function() {
        expect(function() {
          new SessionStore({  });
        }).to.throw(TypeError, 'For Session-based state store, the session key is required');
        
      });
    
    });

    describe('store function', function() {
      it('should return error if req.session is not available', function(done) {
        // Mock the request object
        const req = {};
  
        // Stub the callback function
        const callbackStub = sinon.stub();
  
        // Call the store method with the mocked request object and callback
        new SessionStore({ key : 'Wristband'  }).store(req, 'code_verifier', 'params', callbackStub);
  
        // Verify that the callback was called with an error
        sinon.assert.calledWithMatch(callbackStub, sinon.match.instanceOf(Error));
  
        done();
      });
  
      it('should call callback without error if req.session is available', function(done) {
        // Mock the request object with a session property
        const req = { session: {} };
  
        // Stub the callback function
        const callbackStub = sinon.stub();
  
        // Call the store method with the mocked request object and callback
        new SessionStore({ key : 'Wristband' }).store(req, 'code_verifier', 'params', callbackStub);
  
        // Verify that the callback was called without an error
        sinon.assert.calledWithMatch(callbackStub, null);
  
        done();
      });


      
    });
    describe('verify function', function() {
      it('should return session_configuration_issue error if req.session is not available', function(done) {
        // Mock the request object
        const req = {};

        // Stub the callback function
        const callbackStub = sinon.stub();

        // Call the verify method with the mocked request object and callback
        new SessionStore({ key : 'Wristband' }).verify(req, 'providedState', callbackStub);

        // Verify that the WristbandError constructor was called with the correct arguments
        sinon.assert.calledWithMatch(callbackStub, sinon.match.instanceOf(WristbandError).and(sinon.match.has('code', 'session_configuration_issue')));

        done();
      });

      it('should return session_configuration_issue error if req.session[this._key] is not available', function(done) {
        // Mock the request object with session but without this._key
        const req = { session: {} };

        // Stub the callback function
        const callbackStub = sinon.stub();

        // Call the verify method with the mocked request object and callback
        new SessionStore({ key : 'Wristband' }).verify(req, 'providedState', callbackStub);

        // Verify that the WristbandError constructor was called with the correct arguments
        sinon.assert.calledWithMatch(callbackStub, sinon.match.instanceOf(WristbandError).and(sinon.match.has('code', 'session_configuration_issue')));

        done();
      });

      it('should return session_configuration_issue error if loginSession is empty', function(done) {
        // Mock the request object with session['Wristabnd'] but without loginSession
        const req = { session: { ['Wristband']: {} } };

        // Stub the callback function
        const callbackStub = sinon.stub();

        // Call the verify method with the mocked request object and callback
        new SessionStore({ key : 'Wristband' }).verify(req, 'providedState', callbackStub);

        // Verify that the WristbandError constructor was called with the correct arguments
        sinon.assert.calledWithMatch(callbackStub, sinon.match.instanceOf(WristbandError).and(sinon.match.has('code', 'session_configuration_issue')));

        done();
      });

      it('should delete loginSession from req.session[this._key] if loginSession state matches provided state', function(done) {
        // Mock the request object with session['Wristband'] and loginSession with matching state
        const providedState = 'matchingState';
        const req = { session: { ['Wristband']: { loginSession: { state: providedState } } } };

        // Stub the callback function
        const callbackStub = sinon.stub();

        // Call the verify method with the mocked request object and callback
        new SessionStore({ key : 'Wristband' }).verify(req, providedState, callbackStub);

        // Verify that the callback was called without an error
        sinon.assert.calledWithMatch(callbackStub, null);

        // Verify that the loginSession was deleted from req.session['Wristband']
        sinon.assert.match(req.session['Wristband'], undefined);
        
        done();
      });

      it('should return authentication_error if loginSession state does not match provided state', function(done) {
        // Mock the request object with session[this._key] and loginSession with non-matching state
        const providedState = 'providedState';
        const loginSessionState = 'differentState';
        const req = { session: { ['Wristband']: { loginSession: { state: loginSessionState } } } };

        // Stub the callback function
        const callbackStub = sinon.stub();

        // Call the verify method with the mocked request object and callback
        new SessionStore({ key : 'Wristband' }).verify(req, providedState, callbackStub);

        // Verify that the WristbandError constructor was called with the correct arguments
        sinon.assert.calledWithMatch(callbackStub, sinon.match.instanceOf(WristbandError).and(sinon.match.has('code', 'authentication_error')));

        done();
      });
    });


});
