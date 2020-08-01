FROM node:14.2.0

WORKDIR /usr/server

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install 

COPY . .

RUN yarn build

EXPOSE 3001
CMD [ "node", "./dist/main.js" ]