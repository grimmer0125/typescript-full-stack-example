import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client";

import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { split } from "@apollo/client";

import { setupApollo } from "./api/graphql-api";

// import { ApolloClient } from "apollo-client";
// import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
// import { createHttpLink } from "apollo-link-http";
// import { WebSocketLink } from "apollo-link-ws";
// import { ApolloLink, split } from "apollo-link";
// import { setContext } from "apollo-link-context";
// import { getMainDefinition } from "apollo-utilities";

import Test1 from "./Test1";
import { Counter } from "./features/counter/Counter";
import Signup from "./features/account/Signup";
import Login from "./features/account/Login";
import Dashboard from "./features/dashboard/Dashboard";

export default function App() {
  return (
    <ApolloProvider client={setupApollo()}>
      <Router>
        <div>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/dashboard">
              <Dashboard />
            </Route>
            <Route path="/counter_redux">
              <Counter />
            </Route>
            <Route path="/signup">
              <Signup />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/test1">
              <Test1 />
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/users">
              <Users />
            </Route>
            <Route path="/">
              <Login />
            </Route>
          </Switch>
        </div>
      </Router>
    </ApolloProvider>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}
