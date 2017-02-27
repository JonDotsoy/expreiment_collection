FROM node:7.6.0-alpine

RUN mkdir /app
WORKDIR /app


COPY package.json /app/package.json
RUN npm install --production

COPY . /app

RUN pwd
RUN ls -lah

CMD npm start --production
