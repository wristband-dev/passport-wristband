<div align="center">
  <a href="https://wristband.dev">
    <picture>
      <img src="https://assets.wristband.dev/images/email_branding_logo_v1.png" alt="Github" width="297" height="64">
    </picture>
  </a>
  <p align="center">
    Enterprise-ready auth that is secure by default, truly multi-tenant, and ungated for small businesses.
  </p>
  <p align="center">
    <b>
      <a href="https://wristband.dev">Website</a> •
      <a href="https://docs.wristband.dev">Documentation</a>
    </b>
  </p>
</div>

<br/>

---

<br/>

# Wristband Multi-Tenant Authentication Strategy SDK for Passport

Wristband authentication strategy for [Passport](https://www.passportjs.org/).

This module lets you authenticate through Wristband.dev with its supported IDPs in your Node.js applications.
By plugging into Passport, Wristband will support login, authorize, callback, sessionStore, token management

---

[![npm package](https://img.shields.io/badge/npm%20i-passport--wristband-brightgreen)](https://www.npmjs.com/package/@wristband/passport-wristband)
[![version number](https://img.shields.io/github/v/release/wristband-dev/passport-wristband?color=green&label=version)](https://github.com/wristband-dev/passport-wristband/releases)
[![Actions Status](https://github.com/wristband-dev/express-auth/workflows/Test/badge.svg)](https://github.com/wristband-dev/passport-wristband/actions)
[![License](https://img.shields.io/github/license/wristband-dev/passport-wristband)](https://github.com/wristband-dev/passport-wristband/blob/main/LICENSE.md)

## Install

    $ npm install passport-wristband

## Usage

#### Configure Strategy

The Wristband authentication strategy authenticates users using a wristband
account credential to obtain access, refresh tokens, and user profile. The strategy
requires a callback, which receives an access token and profile,
and calls the callback function providing a req.user object with tokens, user profile and more. 

- [Auth Flow Walkthrough](https://docs.wristband.dev/docs/auth-flows-and-diagrams)
- [Login Workflow In Depth](https://docs.wristband.dev/docs/login-workflow)


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

#### Advanced Strategy Configuration

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

```

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

## Wristband Auth Configuration Options


| AuthConfig Field | Type | Required | Description |
| ---------- | ---- | -------- | ----------- |
| clientId | string | Yes | The client ID for the application. |
| clientSecret | string | Yes | The client secret for the application. |
| customApplicationLoginPageUrl | string | No | Custom Application-Level Login Page URL (Tenant Discovery) if you are building/self-hosting that portion of the UI. By default, the SDK will use your Wristband-hosted Application-Level Login pgae URL. The SDK will redirect to either the self-hosted or Wristband-hosted URL in certain cases where it cannot resolve a proper Tenant-Level Login URL. |
| redirectUri | string | Yes | The redirect URI for callback after authentication. |
| rootDomain | string | Depends | The root domain for your application. This value only needs to be specified if you use tenant subdomains in your login and redirect URLs. |
| scopes | string[] | No | The scopes required for authentication. Refer to the docs for [currently supported scopes](https://docs.wristband.dev/docs/oauth2-and-openid-connect-oidc#supported-openid-scopes). The default value is `[openid, offline_access, email]`. |
| useCustomDomains | boolean | No | Indicates whether custom domains are used for authentication. |
| useTenantSubdomains | boolean | No | Indicates whether tenant subdomains are used for authentication. |
| wristbandApplicationDomain | string | Yes | The vanity domain of the Wristband application. |

#### Login Hint

Wristband will redirect to your Express Login Endpoint for workflows like Application-Level Login (Tenant Discovery) and can pass the `login_hint` query parameter as part of the redirect request:

```sh
GET https://customer01.yourapp.io/auth/login?login_hint=user@wristband.dev
```

If Wristband passes this parameter, it will be appended as part of the redirect request to the Wristband Authorize Endpoint. Typically, the email form field on the Tenant-Level Login page is pre-filled when a user has previously entered their email on the Application-Level Login Page.

#### Return URL

It is possible that users will try to access a location within your application that is not some default landing page. In those cases, they would expect to immediately land back at that desired location after logging in.  This is a better experience for the user, especially in cases where they have application URLs bookmarked for convenience.  Given that your frontend will redirect users to your Express Login Endpoint, you can pass a `return_url` query parameter when redirecting to your Login Endpoint, and that URL will be available to you upon completion of the Callback Endpoint.

```sh
GET https://customer01.yourapp.io/auth/login?return_url=https://customer01.yourapp.io/settings/profile
```


## Test

    $ npm run test-with-coverage


## Questions

Reach out to the Wristband team at <support@wristband.dev> for any questions regarding this SDK.
