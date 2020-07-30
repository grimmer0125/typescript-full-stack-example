# FullStack example

## Installation

1. Install Node.js 12+ & [`yarn 1`](https://classic.yarnpkg.com/lang/en/)
2. Execute `yarn install` in client path.
3. Execute `yarn install` in server path.
4. Prepare [Docker](https://docs.docker.com/get-docker/) environment if you do not have

## Development

1. Execute `yarn start` in client path to launch dev react server, http://localhost:3000. You can also use `VSCode+F5` to use `Debugger for Chrome`.
2. To launch PostgreSQL database, execute `docker run -p 5432:5432 --name some-postgres -e POSTGRES_PASSWORD=test -d postgres:12.1`
3. Use `VSCode+F5` to launch and debug API server, http://localhost:3001 which mainly uses GraphQL and only uses RESTFUL for authentication part. Or just execute `yarn start` to launch it.

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

## Load data

Open http://localhost:3001/graphql, in the playground, use `mutation fetchRawData` to ask the server to load the Data.

## Real-time Auto Synchronization Data is via GraphQL Subscription

### Current done:

A user chooses a shared collection, B add a restaurant into this shared collection. A will see the added one without refreshing.

## Deployment

Not deploy yet.
