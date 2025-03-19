# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
# ENV NODE_ENV production


WORKDIR /usr/src/app

ENV NODE_ENV=production

# Give the node user ownership of the app directory.
RUN chown -R node:node /usr/src/app

# install dependencies
COPY --chown=node:node package*.json ./
COPY --chown=node:node ./prisma prisma

# Run the application as a non-root user.
USER node

RUN npm ci --omit=dev


# RUN chown -R node:node /usr/src/app/node_modules/.prisma


# Copy the rest of the source files into the image.
COPY --chown=node:node . .

# RUN chown -R node:node /usr/src/app/prisma



# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD ["node", "server.js"]
