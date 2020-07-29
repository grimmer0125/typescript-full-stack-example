# FullStack example

## Installation

1. Install Node.js 12+ & [`yarn 1`](https://classic.yarnpkg.com/lang/en/)
2. Execute `yarn install` in client path.
3. Execute `yarn install` in server path.
4. Prepare [Docker](https://docs.docker.com/get-docker/) environment if you do not have

## Development

1. Execute `yarn start` in client path to launch dev react server, http://localhost:3000
2. To launch PostgreSQL datasbase, execute `docker run -p 5432:5432 --name some-postgres -e POSTGRES_PASSWORD=test -d postgres:12.1`
3. Use `VSCode+F5` to launch and debug API server, http://localhost:3001 which mainly uses GraphQL and only uses RESTFUL for authentication part. Or just execute `yarn start` to launch it.

Open http://localhost:3000 to play this example.

## Tech Stack

- TypeScript
- React
- Redux Hooks
- @reduxjs/toolkit
- PostgreSQL
- NestJS
- GraphQL
- TypeORM
- Passport (jwt)

## Load data

Open http://localhost:3001/graphql, in the playground, use `mutation fetchRawData` to ask the server to load the Data.
