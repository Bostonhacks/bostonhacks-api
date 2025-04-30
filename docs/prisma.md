# Prisma ORM

Prisma needs to apply migrations every time the schema is changed. You create migrations with the prisma cli, these are then applied to your database.
- In production, this is handled by running a GitHub action that runs on an update to "main". This will run `npx prisma migrate deploy` onto the deployment database. 
- In dev, this is handled automatically when running `npm run sql:dev`. Before you push your changes, they need to have a migration created. Do this with `npm run migrate:dev` which runs `npx prisma migrate dev` under the hood.

Prisma also needs to use this schema to build a Prisma Client. This should be done automatically when installing the `@prisma/client` node dependency. So this shouldn't need to be done manually.

