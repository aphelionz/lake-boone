FROM node:18-alpine3.18

WORKDIR /home/node/app

COPY package.json .
COPY package-lock.json .
COPY ./pages ./pages
COPY ./public ./public
COPY ./components ./components
COPY ./data ./data

RUN npm install

RUN npm run build
CMD npm start
