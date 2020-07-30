import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { ApolloProvider } from "@apollo/client";

import { setupApollo } from "./api/graphql-api";

import Signup from "./features/account/Signup";
import Login from "./features/account/Login";
import Dashboard from "./features/dashboard/Dashboard";
import CollectionBoard from "./features/dashboard/CollectionBoard";

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
            <Route path="/collection">
              <CollectionBoard />
            </Route>
            <Route path="/signup">
              <Signup />
            </Route>
            <Route path="/login">
              <Login />
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
