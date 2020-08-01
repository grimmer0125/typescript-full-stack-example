FROM node:14.2.0

WORKDIR /usr/client

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install 

COPY . .

EXPOSE 3000

CMD [ "yarn", "start" ]