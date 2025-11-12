# Prisma ORM

Prisma needs to apply migrations every time the schema is changed. You create migrations with the prisma cli, these are then applied to your database.

- In production, this is handled by running a GitHub action that runs on an update to "main". This will run `npx prisma migrate deploy` onto the deployment database.
  - **NOTE**: `deploy` not `dev` in production. `dev` will run destructive changes so only use on development databases.
- In dev, this is handled automatically when running `npm run sql:dev`. Before you push your changes, they need to have a migration created. Do this with `npm run migrate:dev` which runs `npx prisma migrate dev` under the hood.
  - Please note, you will have to change your .env.development file to use the database at `@localhost:5432` rather than `@db:5432` since docker-compose running method doesnt expose the db container to the host machine.
  - If you get migration warnings, it's suggested that you delete your local database (either remove the docker volume or other volume) to start from scratch.
- Whenever you make queries in the codebase to Prisma, you can add in fields that are handled by the Prisma extension in `app/database/Prisma.js` (currently there is `userRole` that is default USER). You can pass in userRole: ADMIN to use the admin zod validations for example.

Prisma also needs to use this schema to build a Prisma Client. This should be done automatically when installing the `@prisma/client` node dependency. So this shouldn't need to be done manually.

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
