# To Run

You must have NodeJS and Docker (or Docker Desktop) installed.

`npm i` to install all packages

There are two ways to run this API

## Docker Watch

The preferred way to develop since it spins up all components for you in one command and follows your code changes automatically.

   1. All code must work in the Docker container since our work deploys with Docker containers.
   2. Ensure no other programs are using ports 8000. If you run into issues, try closing containers first.
   3. Create a `.env.development` file as specified in `.env.example`
      - For help with Google Auth, refer to the [Google Cloud App Setup](/docs/googleauth.md#google-cloud-app-setup) section
   4. If you changed schemas in `prisma/schema.prisma`, follow instructions [here](#changing-schemas) for more info on how to properly change schemas and run migrations.
      - You might need to change your `.env.development` file to use db `@localhost` since the build command uses the same `.env` file as the Docker container.
   5. Run `npm run docker:dev` to start the docker container
      1. `npm run exitdocker:dev` to exit containers
      2. `npm run cleandocker:dev` to exit containers and remove created volumes
      3. Sometimes you might have to docker compose down (exitdocker) to start again.
   6. Run tests with `npm run docker:test`
      - This uses the `docker-compose.test.yml` file.

## Local Machine Development

*Warning: This was not tested extensively unlike using Docker for development*

Optional: Docker (for using SQL Container)

   1. Look at `.env.example` to create your own `.env.development` file
   2. Run `npm run sql:dev` to start a local db with Docker.
      - You can also choose to spin up your own Postgres instance and change the .env file to reflect that endpoint.
   3. Run `npm run build:dev` to run SQL migrations and build the Prisma Client
      - This should not ask you to create a new migration, just to migrate changes to your blank database.
   4. `npm run dev` to run the server locally
   5. `npm run test:dev` to run local tests (must close dev server first)
   6. Run `npm run exitsql:dev` to exit Docker SQL container. Your data will persist even after closing the container.
      1. Optionally run `npm run cleansql:dev` to exit the SQL container and delete persistent storage **warning: this deletes all your persistent db data stored locally**.

Before you push any changes, please make sure to check if your changes work by running them in the Docker containers in (2). Then add your changes to a branch, push to the GitHub repo and create a pull request. You might have to run `npm run build:dev` if you updated `/prisma/schema.prisma`
**Do not push directly into main**

You can look at `./package.json` to view the npm scripts used in these steps.

# Documentation

Documentation is automated with Swagger-JSDoc and Swagger-UI and availble at `{base_url}/docs`. Please refer to:

- [OpenAPI Docs](https://swagger.io/docs/specification/v3_0/about/) for OpenAPI documentation spec
- [How to Document an Express API with Swagger UI and JSDoc](https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do) for a tutorial on using JSDoc with Swagger.
- `./app/config/swaggerconfig.js` and `./app/routes/User.routes.js` for some examples on reusable OpenAPI schemas and JSDoc documentation respectively

## Logging

Logging is done with winston. Ensure that there is an environment variable with `LOG_LEVEL` set so that the logger logs at the correct level.

## Linting

Linting is done with eslint. Please run `npx eslint .` or `npx eslint yourfile.js` to check for linting errors. This is also done on pull request

## Testing

Testing is done with Supertest and Jest. Run tests locally with `npm run test:dev`

## Validation

Zod is used for input validation. Some controllers require more control over validation, so Zod does not handle some fields in those cases.

# Deployment

Deployment can be done either direct code deploy or Dockerized. The Dockerfile along with the root directory is all you need to give a hosting service to start the server. Currently, the server is running as a Docker container in a cloud hosting provider.

On a commit to main, the code is automatically uploaded via Docker containers to a cloud hosting provider such as Azure, AWS, or Render.

- If `prisma/migrations` is changed (meaning you should have run the migrate dev command), then the migrations are automatically deployed with `prisma migrate deploy` to the cloud database provider via a GitHub action.

## CI/CD

Tests are done on Pull requests which require the use of multiple secrets. Please check the repository's environment->secrets settings to see these if you are an admin. You might need to change/add to this list, along with the associated workflow files, if environment variables get added or changed.

## DB

Deployment database is a PostgreSQL instance hosted on Supabase. Although Supabase has an API, we don't use this as Supabase might not be the best option in the future, so the only code to change if a migration occurs is the database URI.

Azure Blob Storage is used for file storage and the `.env.example` file should have the required environment variables to connect to the Azure Blob Storage account. If you change the file storage provider, you can change the Application controller and env files in CI/CD to match.

<br/>

# Extra Resources

## Changing schemas

1. Change the `priisma/schema.prisma` file to reflect your changes
   - New fields to existing models need either a default value or nullable. Once a default value is populated for every existing entry, you can remove the default value.
2. Go to [prisma.md](./prisma.md) and follow the instructions to create a migration and update your local database
3. Update `app/database/Prisma.js` by adding your fields to the zod validations
   - There is a main schema for each model and then a "user" and "admin" role that will remove/add in fields based on the role
   - Add to the Prisma extensions on the bottom similar to this existing snippet:
4. Add your schema changes to `app/config/swaggerconfig.js` to update the documentation.

```javascript
      async create({ args, query }) {
        // upon a creation, check the userRole (which needs to be passed in as userRole when performing a query)
        const role = args.userRole || Role.USER;

        delete args.userRole;

        if (role === Role.ADMIN) {
          args.data = adminUserCreateSchema.parse(args.data);
        } else {
          // Validate the data against the schema
          args.data = userCreateSchema.parse(args.data);
        }

        return query(args);

      },
```
