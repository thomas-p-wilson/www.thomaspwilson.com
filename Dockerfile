FROM node:11-alpine

COPY .docker/ /
COPY . /usr/src/app

WORKDIR /usr/src/app

RUN chmod +x /entrypoint \
 && apk add --no-cache build-base git python \
 && npm cache clean --force

ENTRYPOINT [ "/entrypoint" ]