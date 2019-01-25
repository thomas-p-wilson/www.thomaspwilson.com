FROM node:9.11.2-alpine

COPY .docker/ /

RUN chmod +x /usr/local/bin/entrypoint

WORKDIR /srv

ENTRYPOINT [ "/usr/local/bin/entrypoint" ]
CMD [ "hexo", "server" ]