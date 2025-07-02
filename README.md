# BostonHacks-API
API used for various applications such as judging, yearly website, etc. The goal of using this instead of Firebase as was done in the past for our backend logic is to make our codebase platform-agnostic. As a organization with constantly rotating members and limited access to some vital resources (like a phone number), deployments can move around-often times to personal accounts if a phone number/payment method is required. As such, the API is built using ExpressJS and interfaces with a PostgreSQL database that can be hosted anywhere interfaced with Prisma ORM. There is also the option to dockerize (preferred method) so that moving to a different deployment site if needed is easier. This code should work regardless of where it is moved to, and refrain from using platform specific APIs (and if so, make it easy to change the keys for). 

# Notes
In-depth documentation at [docs](docs/)

Follow this file structure [here](https://dev.to/mr_ali3n/folder-structure-for-nodejs-expressjs-project-435l)

Every time you update `prisma/schema.prisma`:
- If you want to test changes but not add to migration history, use `npm run dbpush`.
  - This runs `npx prisma db push` which is only used for prototyping. When changes are final, `npx prisma migrate dev` (run by `npm run build:dev`) should be run. This adds them to the migration history as a permanent snapshot.
- Update the Zod schemas within `app/database/Prisma.js` to add validation for the changes.

Please do not add any sensitive keys/info to the public repository. All private keys/values should be placed in an `.env.*` or added to `.gitignore`.

`app.js` holds the express app but `server.js` is the start routine. This is so tests can be run by supertest

# Getting Started
For [Developers](docs/gettingstarted_developer.md)
- If you are actively developing this repository
  
For [Consumers](docs/gettingstarted_consumer.md)
- If you are using this API for another application

This is a test
