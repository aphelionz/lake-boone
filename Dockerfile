FROM node:14-alpine3.10

WORKDIR /home/node/app

COPY package.json .
COPY package-lock.json .
COPY index.js .

RUN npm install

CMD npm start
