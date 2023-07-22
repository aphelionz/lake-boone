FROM node:18-alpine3.18

WORKDIR /home/node/app

COPY package.json .
COPY package-lock.json .
COPY ./src/ ./src/

RUN npm install

CMD npm start
