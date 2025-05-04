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
   1) You will need to create some of your own resources such as a Google Cloud App. You can refer to the [Google Auth](googleauth.md#google-cloud-app-setup) section
4) `npm run docker:ext` to start
   1) `npm run exitdocker:ext` to stop the server OR
   2) `npm run exitdocker:ext -- -v` to stop the server AND erase the persisting database
5) Go to `localhost:8000/docs` to view the documentation
6) Go to `localhost:5555` for Prisma Studio - this is a dev environment tool that lets you see and modify your data freely.
7) **Ensure you `git pull origin main` often so that you get the latest changes. There is currently no autoupdate mechanism.

## Populating Data

Your local copy will have no data associated with it. You should try creating a few users and resources based off the documentation page.

Auth is handled with cookies so whichever user you are logged in with is automatically used for authorization for the endpoints. This means if you want to act under a certain account, you must logout (or use a different auth environment), then login to get the new cookie.

1) Create a couple of users (either using GAuth or Email)
   1) One regular "USER" like a hacker
   2) One "ADMIN" which would be an organizer
      1) The ADMIN role needs to be hand changed in Prisma studio
2) Login as a regular user and create a couple of resources such as an Application.
3) Login as an admin and test the /admin routes (the only routes available to admins)
