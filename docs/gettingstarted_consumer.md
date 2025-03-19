# API Usage for API Consumeres
When developing an application that requires our user data or updating it, you will need to run the code locally.

## Disclaimer
This API is currently only for internal use which is why there is no option for API keys to interact with the API in your own app. 

# Getting started for API consumers
You will need node, npm, and Docker Desktop for this.

1) Clone this repository
2) Enter the root directory
3) Create a `.env.production` file with the entries that are specified in `.env.example`
   1) You will need to create some of your own resources such as a Google Cloud App. You can refer to the [googlecloud](#google-cloud-app-setup) section
4) `npm run docker:dev` to start
   1) `npm run exitdocker:dev` to stop the server OR
   2) `npm run cleandocker:dev` to stop the server AND erase the persisting database
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

You should add the following URLs into redirect URL

![gauth](./images/gettingstarted_gauth.png)

You should also add the test gmail accounts you wish to use to create mock users. These will be the only users allowed to use your GAuth client.

![gauth2](./images/gettingstarted_gauth2.png)

You can also find your Google Client ID and Secret on this portal when you create an OAuth Client