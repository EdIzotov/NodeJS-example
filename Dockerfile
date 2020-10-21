FROM node:9-alpine

LABEL maintainer="devops@XXX"
LABEL organization="XXX https://XXX/"

RUN npm install mocha -g

ARG SOURCE_ROOT=.

ENV NODE_ENV=test
ENV LOG_LEVEL=info
ENV DELETE_ENTITIES=1

COPY ${SOURCE_ROOT}/ /opt/qa-sap-tests
RUN cat /dev/null > /opt/qa-sap-tests/.env

WORKDIR /opt/qa-sap-tests

CMD npm test
