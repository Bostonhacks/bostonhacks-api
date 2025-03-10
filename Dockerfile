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

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
COPY package*.json ./
COPY ./prisma prisma

# RUN npm ci --omit=dev
RUN npm ci


RUN chown -R node:node /usr/src/app/node_modules/.prisma


# Copy the rest of the source files into the image.
COPY . .

RUN chown -R node:node /usr/src/app/prisma

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD ["node", "server.js"]
