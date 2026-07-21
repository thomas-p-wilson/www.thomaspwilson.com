FROM node:20

RUN corepack enable \
 && yarn set version 4.0.2
