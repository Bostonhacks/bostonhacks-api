# BostonHacks-API
API used for various applications such as judging, yearly website, etc.

# Notes
Follow this file structure [here](https://dev.to/mr_ali3n/folder-structure-for-nodejs-expressjs-project-435l)

Every time you update `prisma/schema.prisma`:
- If you want to test changes but not add to migration history, use `npm run dbpush`.
  - This runs `npx prisma db push` which is only used for prototyping. When changes are final, `npx prisma migrate dev` (run by `npm run build:dev`) should be run. This adds them to the migration history as a permanent snapshot.

Please do not add any sensitive keys/info to the public repository. All private keys/values should be placed in an `.env.*` or added to `.gitignore`.


# To Run
You must have NodeJS and Docker Desktop installed.

`npm i` to install all packages

There are two ways to run this API
1. For local, active development
   1. Look at `.env.example` to create your own `.env.development` file
   2. Run `npm run sql:dev` to start a local db with Docker
   3. Run `npm run build:dev` to run SQL migrations and build the Prisma Client
   4. `npm run dev` to run the server locally
      - Must have `.env.development` file 
   5. `npm run test:dev` to run local tests
   6. Run `npm run exitsql:dev` to exit Docker SQL container. Your data will persist even after closing the container.
      1. Optionally run `npm run cleansql:dev` to exit the SQL container and delete persistent storage **warning: this deletes all your persistent db data stored locally**.

2. With a Docker container. This should be used as the last step to test your changes to see if they work before you push code. You can try to actively develop with this, but will have some issues since code does not auto-update when developing locally and Schema changes will not be applied until you create a Prisma migration locally first.
   1. All code must work in the Docker container since our work deploys with Docker containers.
   2. Ensure no other programs are using ports 8000. If you run into issues, try closing containers first.
   3. Create a `.env.test` file as specified in `.env.example`
   4. If you changed schemas, run `npm run build:dev` to create a migration. If you don't do this, then your changes will not be reflected in the test environment.
   5. Run `npm run docker:dev` to start the docker container
      1. `npm run exitdocker:dev` to exit containers
      2. `npm run cleandocker:dev` to exit containers and remove created volumes
      3. Sometimes you might have to docker-compose down (exitdocker) to start again.
      4. Refer to [Docker](#docker) section to understand more
   6. Run `npm run exitdocker:dev` to close Docker containers

Before you push any changes, please make sure to check if your changes work by running them in the Docker containers in (2). Then add your changes to a branch, push to the GitHub repo and create a pull request. You might have to run `npm run build:dev` if you updated `/prisma/schema.prisma`
**Do not push directly into main**

You can look at `./package.json` to view the npm scripts used in these steps.

# Documentation
Documentation is automated with Swagger-JSDoc and Swagger-UI and availble at `{base_url}/api/docs`. Please refer to: 
- [OpenAPI Docs](https://swagger.io/docs/specification/v3_0/about/) for OpenAPI documentation spec
- [How to Document an Express API with Swagger UI and JSDoc](https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do) for a tutorial on using JSDoc with Swagger. 
- `./app/routes/OpenAPISchemas.js` and `./app/routes/User.routes.js` for some examples

## Logging
Logging is done with winston. Ensure that there is an environment variable with `LOG_LEVEL` set so that the logger logs at the correct level.

## Linting
Linting is done with eslint. Please run `npx eslint .` or `npx eslint yourfile.js` to check for linting errors. This is also done on pull request

## Testing
Testing is done with Supertest and Jest. Run tests locally with `npm run test:dev`

# Deployment
Deployment can be done either direct code deploy or Dockerized. The Dockerfile along with the root directory is all you need to give a hosting service to start the server. Currently, the server is running as a Docker container in a cloud hosting provider.

## CI/CD
Tests are done on Pull requests which require the use of multiple secrets. Please check the repository's environment->secrets settings to see these if you are an admin. You might need to change/add to this list, along with the associated workflow files, if environment variables get added or changed.

<br/>

# Extra Resources

## Prisma Migrations
You must migrate Prisma schemas before working and after every time you update `/prisma/schema.prisma`. This command should also be run if you change the Prisma schema. If there is a warning about data loss, revert and attempt to change schema to not prompt the issue (i.e. add default value for new field or make it optional) 

`npm run build:dev`

This runs `prisma migrate dev` and `prisma generate` to update your local database with any updated schemas and generates the client for your local environment.

If you are having issues, then try generating the prisma client if you are getting issues with an ungenerated client. This should be automatically run during the npm install phase, otherwise:

`npx prisma generate`

### How Prisma works (if you want to know)
Prisma is an ORM for many different databases, one of which is PostgreSQL. We define our schemas in `/prisma/schema.prisma` and then create a migration and a Prisma client with the defined schemas.

You can refer to [here](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production) for more info on migrations.
- Essentially must have a migration history using `prisma migrate dev` and in production environments deploy migrations with `prisma migrate deploy`

## Docker

Can look [here](https://docs.docker.com/guides/nodejs/develop/) for help

### Building and running your application with Docker

Run the application using:

<del>`docker-compose -f docker-compose.yml -f docker-compose.{dev/prod/staging}.yml up --build`<del>

`npm run docker:dev`


If you don't need to override the standard compose file, start your application by running:

`docker-compose up --build`.

Your application will be available at http://localhost:8000


To stop the application:

`npm run exitdocker:dev`

To remove containers:

`npm run cleandocker:dev`




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
