# FullStack example

## Installation

1. Install Node.js 12+ & [`yarn 1`](https://classic.yarnpkg.com/lang/en/)
2. Execute `yarn install` in client path.
3. Execute `yarn install` in server path.
4. Prepare [Docker](https://docs.docker.com/get-docker/) environment if you do not have

## Development

1. Execute `yarn start` in client path to launch dev react server, http://localhost:3000. You can also use `VSCode+F5` to use `Debugger for Chrome`.
2. To launch PostgreSQL database, execute `docker run -p 5432:5432 --name some-postgres -d postgres:12.1`
3. Use `VSCode+F5` to launch and debug API server, http://localhost:3001 which mainly uses GraphQL and only uses RESTFUL for authentication part. Or just execute `yarn start` to launch it.
4. (optional) load the restaurant data, follow https://github.com/grimmer0125/full-stack-example#load-data

Open http://localhost:3000 to play this example.

## Tech Stack

- TypeScript (3.7+)
- React
- CRA (Create React App)
- Redux Hooks
- Redux Toolkit (which enhances Redux development, such as `write "mutating" logic in Redux Toolkit` since [Immer](https://immerjs.github.io/immer/docs/introduction) inside)
- PostgreSQL
- [NestJS](https://nestjs.com/) (a Node.js server framework)
- GraphQL
- TypeORM
- Passport (jwt)

## Functionality

### Load data

If you do not see restaurant list, please execute this step. If you already see, doing this will duplicate the data.

Open http://localhost:3001/graphql, in the playground, paste

```
mutation fetchRawData {
  etlRestaurantRawData(sourceURL:"https://gist.githubusercontent.com/seahyc/7ee4da8a3fb75a13739bdf5549172b1f/raw/f1c3084250b1cb263198e433ae36ba8d7a0d9ea9/hours.csv")
}
```

to ask the server to load the Data.

p.s. A few restuarants(~11) in the raw data has duplicate row. Currently the code just choose the first one.

### Signup and login

No email verification and password reset yet.

### Pagination of Restaurants

### Filter by WeekDay, Time, and restaurant Name

### Save restaurants to a named collection and browse collection list

In `/dashboard`, click the `+` button in a restaurant cell, input a restaurant collection, then click `submit` to store it. You can input a new or existing collection name. For existing collection, click a collection to copy its name to speed up.

To browse collection list, click `collection` link in the top bar to navigate to `/collection`. You can also click a collection to see its restaurant list in the right panel.

### Share a restaurant collection to others

1. Before doing this, your target user must signup first.
2. In `/collection`, click `+` to input the email of the target user.
3. The target user will be authorized to see this shared collection and able to add a restaurant into it !!

### Real-time Auto Synchronization Data

Current done:

1. User A chooses a shared collection to see its detailed restaurant list.
2. User B add a restaurant into this shared collection.
3. User A will see the added one without refreshing.

## Run this app locally via docker-compose

`docker-compose up -d`

## Testing on deployed site

Try http://fullstack.grimmer.io/, deployed on Azure.
You can use http://api.grimmer.io/graphql to import restaurant data if there is no data yet.

Command: https://github.com/grimmer0125/fullstack#load-data

### Use reverse proxy, traefik to deploy

traefik: https://docs.traefik.io/

Steps:

1. Install docker, docker-compose and login private docker registry.
2. Frontend setting: `export REACT_APP_API_URL=api.grimmer.io`
3. db setting:
   1. `export POSTGRES_USER=YOUR_USER`
   2. `export POSTGRES_PASSWORD=YOUR_PASSWORD`
   3. `export POSTGRES_DB=YOUR_DB`
4. `docker network create traefik_net`
5. `docker-compose -f traefik-docker-compose.yml up -d`
6. `docker-compose -f docker-compose.azure.yml up -d`
