# API Usage for API Consumeres

When developing an application that requires our user data or updating it, you will need to run the code locally.

## Disclaimer

This API is currently only for internal use which is why there is no option for API keys to interact with the API in your own app.

# Getting started for API consumers

## Requirements

You will need node, npm, and Docker Desktop for this.

## To Run

1) Clone this repository
2) Enter the root directory
3) Create a `.env.development` file with the entries that are specified in `.env.example`
   1) You will need to create some of your own resources such as a Google Cloud App. You can refer to the [googlecloud](#google-cloud-app-setup) section
4) `npm run docker:ext` to start
   1) `npm run exitdocker:ext` to stop the server OR
   2) `npm run exitdocker:ext -- -v` to stop the server AND erase the persisting database
5) Go to `localhost:8000/docs` to view the documentation
6) Go to `localhost:5555` for Prisma Studio - this is a dev environment tool that lets you see and modify your data freely.
7) **Ensure you `git pull origin main` often so that you get the latest changes. There is currently no autoupdate mechanism.

## Populating Data

Your local copy will have no data associated with it. You should

Auth is handled with cookies so whichever user you are logged in with is automatically used for authorization for the endpoints. This means if you want to act under a certain account, you must logout, then login to get the new cookie.

1) Create a couple of users (either using GAuth or Email)
   1) One regular "USER" like a hacker
   2) One "ADMIN" which would be an organizer
      1) The ADMIN role needs to be hand changed in Prisma studio
2) Login as a regular user and create a couple of resources such as an Application.
3) Login as an admin and test the /admin routes (the only routes available to admins)

# Google Cloud App Setup

Head to [https://support.google.com/cloud/answer/6158849?hl=en](https://support.google.com/cloud/answer/6158849?hl=en) and follow the steps to create an OAuth client.

You should add the following URLs into redirect URL. You might need to add authorized Javascript origins such as where your NextJS app would run.

<!-- ![gauth](./images/gettingstarted_gauth.png) -->
<img src="./images/gettingstarted_gauth.png" alt="gauth1" width="250"/>

You should also add the test gmail accounts you wish to use to create mock users. These will be the only users allowed to use your GAuth client.

<!-- ![gauth2](./images/gettingstarted_gauth2.png) -->
<img src="./images/gettingstarted_gauth2.png" alt="gauth2" width="250"/>

You can also find your Google Client ID and Secret on this portal when you create an OAuth Client

# GAuth with REST Clients such as Insomnia

In order to go through the OAuth flow with these in order to get the cookies for authorization, you can use the OAuth 2.0 authorization method hosted in these clients. This is a workaround and this is not how the API works in the browser. In reality, you would make a GET request to `/auth/google/login` which handles all of this for you.

The following is an example of an auth flow in these rest clients. In a browser like Chrome/Firefox, this flow is different since the user will be redirected to the google oauth servers on a GET to `/auth/google/login`. This workaround is useful for REST clients since they don't always support the OAuth flow from third-parties. This is also possible with Postman, albeit in a slightly different UI.

In principle, you need to generate your own authorization code from Google auth servers, which then gets sent to the callback as part of the Authorization header as a Bearer token.

<img src="./images/gettingstarted_insomnia.png" width="400" />

You can use the following values here

```
Grant Type: Authorization Code

Authorization Url: https://accounts.google.com/o/oauth2/auth
https://accounts.google.com/o/oauth2/token

Access Token Url: https://accounts.google.com/o/oauth2/token

Client ID: <your google client id>

Client Secret: <your google client secret>

Redirect URL: http://localhost:8000

Scope: https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile

State: <anything you want>
```

Then click send, go through the Google Login process (making sure the email you use is added as a allowed user on the Google Cloud Console), and you should get a response of a successful login.
