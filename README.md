# passport-wristband

Wristband authentication strategy for [Passport](https://www.passportjs.org/).

This module lets you authenticate through Wristband.dev with its supported IDPs in your Node.js applications.
By plugging into Passport, Wristband will support login, authorize, callback, sessionStore, token management


<div align="center">

[How to setup a demo app with Wristband](https://wristband.stoplight.io/docs/documentation/lga1sdceq9ttg-setting-up-a-demo-app) 
[What does wristband offer](https://wristband.stoplight.io/docs/documentation/75dbhsj356jad-welcome) 


</div>
---

[![npm]](https://www.npmjs.com/package/passport-wristband)


## Install

    $ npm install passport-wristband

## Usage

#### Configure Strategy

The Wristband authentication strategy authenticates users using a wristband
account credential to obtain access, refresh tokens, and user profile. The strategy
requires a callback, which receives an access token and profile,
and calls the callback function providing a req.user object with tokens, user profile and more. 

```js
passport.use(new WristbandStrategy({
        clientId: 'qoblahblahblahblahprw6u',
        clientSecret: 'a8blahblahblahblahblahblahblahcd',
        callbackUrl: 'http://localhost:8080/api/auth/callback',
        wristbandApplicationDomain: 'testdomain.wristband.dev',
    },
    function (accessToken, refreshToken, idToken, params, profile, done) {
        const expiresAt = calculateExpTimeWithBuffer(params.expires_in);
        done(null, { 'expiresAt': expiresAt, 'accessToken': accessToken, 'refreshToken': refreshToken, 'idToken': idToken, 'profile': profile, 'userId': profile.sub
            , 'tenantId' : profile.tnt_id, 'identityProviderName': profile.idp_name, 'returnUrl': params.return_url});
    }
));


```

#### Adveanced Strategy Configuration

```js
passport.use(new WristbandStrategy({
        clientId: 'qoblahblahblahblahprw6u',
        clientSecret: 'a8blahblahblahblahblahblahblahcd',
        callbackUrl: 'http://{tenant_domain}.invotastic.com/api/auth/callback',
        rootDomain : 'invotastic.com',
        useCustomDomains: true,
        useTenantSubdomains: true,
        wristbandApplicationDomain: 'auth.invotastic.com',
    },
    function (accessToken, refreshToken, idToken, params, profile, done) {
        const expiresAt = calculateExpTimeWithBuffer(params.expires_in);
        done(null, { 'expiresAt': expiresAt, 'accessToken': accessToken, 'refreshToken': refreshToken, 'idToken': idToken, 'profile': profile, 'userId': profile.sub
            , 'tenantId' : profile.tnt_id, 'identityProviderName': profile.idp_name, 'returnUrl': params.return_url});
    }
));



#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'wristband'` strategy, to
authenticate requests.
Use router to ensure `login` and `callback` routes to authenticate through Wristband. 

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js

[Passport session setup](https://www.passportjs.org/concepts/authentication/sessions/) 

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    return done(null, user); 
});

router.get('/login', passport.authenticate('wristband'));

router.get('/callback', passport.authenticate('wristband', {failureRedirect: '/login'}),
    function (req, res) {
        // Successful authentication, redirect returnUrl or homepage.
        if(req.user && req.user.returnUrl){
            return res.redirect(req.user.returnUrl);
        }else{
            return res.redirect(`http://invotastic.com/home`);
        }
    });
```

## Related Modules

## Test

    $ npm run test-with-coverage

## Contributing


## License

[The MIT License](http://opensource.org/licenses/MIT)
[https://www.wristband.dev/](https://www.wristband.dev/)

Copyright (c) 2024 Apitopia, Inc.


