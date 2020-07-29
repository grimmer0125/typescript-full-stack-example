import gql from "graphql-tag";
import { DocumentNode } from "graphql";

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { split } from "@apollo/client";

export let client: ApolloClient<NormalizedCacheObject>;

export function setupApollo() {
  const GRAPHQL_ENDPOINT = "http://localhost:3001/graphql";
  const GRAPHQL_WS_ENDPOINT = "ws://localhost:3001/graphql";
  const wsLink = new WebSocketLink({
    uri: GRAPHQL_WS_ENDPOINT,
    options: {
      reconnect: true,
      connectionParams: {
        authToken: localStorage.getItem("access_token"),
      },
    },
  });
  const httpLink = createHttpLink({
    uri: GRAPHQL_ENDPOINT,
    credentials: "same-origin",
  });
  const authLink = setContext((_, { headers }) => {
    const token: string | null = localStorage.getItem("access_token");
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    authLink.concat(httpLink)
  );
  const cache = new InMemoryCache();
  client = new ApolloClient({
    link: splitLink,
    cache,
  });

  return client;
}

export const GET_PROFILE = gql`
  query whoami {
    whoAmI {
      id
      email
      username
    }
  }
`;

/** assume one people can not have two same name collection */
export const ADD_RESTAURANT_TO_COLLECTION = gql`
  mutation addRestaurantToCollection(
    $restaurantName: String!
    $restaurantCollectionName: String!
  ) {
    addRestaurantToCollection(
      restaurantName: $restaurantName
      restaurantCollectionName: $restaurantCollectionName
    ) {
      id
      name
    }
  }
`;

export const FETCH_RESTAURANT_COLLECTION_LIST = gql`
  query fetchRestaurantCollectionList {
    fetchRestaurantCollectionList {
      total
      restaurantCollections {
        id
        name
      }
    }
  }
`;

// query parameter perPage, page
export const FETCH_RESTAURANTS = gql`
  query fetchRestaurants(
    $perPage: Int!
    $page: Int!
    $filterWeekDay: Int!
    $filterTime: String!
    $filterRestaurentName: String!
  ) {
    fetchRestaurants(
      perPage: $perPage
      page: $page
      filterWeekDay: $filterWeekDay
      filterTime: $filterTime
      filterRestaurentName: $filterRestaurentName
    ) {
      total
      # page
      restaurants {
        id
        name
        openTimes {
          weekDay
          openHour
          closeHour
        }
      }
    }
  }
`;

export async function query(cmd: DocumentNode, variables: any) {
  const result = await client.query({
    query: cmd,
    variables,
  });
  return result;
}
export async function mutation(cmd: DocumentNode, variables: any) {
  const result = await client.mutate({
    mutation: cmd,
    variables,
  });
  return result;
}

// TODO: use above query instead
export async function getProfile() {
  const result = await client.query({
    query: GET_PROFILE,
  });
  return result;
}

export default {
  setupApollo,
  getProfile,
  query,
  mutation,
};
