# BostonHacks-API
API used for various applications such as judging, yearly website, etc.

# Notes
Follow this file structure [here](https://dev.to/mr_ali3n/folder-structure-for-nodejs-expressjs-project-435l)


# To Run
`npm i` to install all packages

There are two ways to run this API
1. Locally on your computer using any PostgreSQL database you want. This should be used for active development
   1. If you do this, look at `.env.example` to create your own `.env.development` file
   2. Run `npm run sql:dev` to start a local db with Docker
   3. Look at "Prisma Migrations" section to sync the schemas with your own Postgres database
      1. Essentially just run `npm run build:dev`
   4. `npm run dev` to run locally
      - Must have `.env.development` file 
   5. Run `npm run exitsql:dev` to exit Docker container

2. With a Docker container. This should be used to test your changes to see if they work before you push code.
   1. All code must work in the Docker container since our work deploys with Docker containers.
   2. Refer to "Docker" section to understand more
   3. Create a `.env.production` file as specified in `.env.example`. This does and should not have production level configurations, it is just a local file for Docker to use.
   4. Run `npm run exitdocker:dev` to close Docker containers


You can look at `./package.json` to view the npm scripts used in these steps.

## Prisma Migrations
You must migrate Prisma schemas before working. This command should also be run if you change the Prisma schema. If there is a warning about data loss, revert and attempt to change schema to not prompt the issue (i.e. add default value for new field or make it optional) 

`npm run build:dev`

This runs `prisma migrate dev` and `prisma generate` to update your local database with any updated schemas and generates the client for your local environment.

If you are having issues, then try generating the prisma client if you are getting issues with an ungenerated client. This should be automatically run during the npm install phase, otherwise:

`npx prisma generate`

## Docker

Can look [here](https://docs.docker.com/guides/nodejs/develop/) for help

### Building and running your application with Docker

Run the application using:

<del>`docker-compose -f docker-compose.yml -f docker-compose.{dev/prod/staging}.yml up --build`<del>

`npm run docker:dev`

If you don't need to override the standard production compose file, start your application by running:

`docker-compose up --build`.

Your application will be available at http://localhost:8000.

To stop the application:

`docker compose down`

To remove containers:

`docker compose rm`




### Deploying your application to the cloud

First, build your image, e.g.: `docker build -t myapp .`.
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t myapp .`.

Then, push it to your registry, e.g. `docker push myregistry.com/myapp`.

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)