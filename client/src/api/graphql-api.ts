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

const apiURL = process.env.REACT_APP_API_URL ?? "localhost:3001";

export function setupApollo() {
  const GRAPHQL_ENDPOINT = `http://${apiURL}/graphql`;
  const GRAPHQL_WS_ENDPOINT = `ws://${apiURL}/graphql`;
  const wsLink = new WebSocketLink({
    uri: GRAPHQL_WS_ENDPOINT,
    options: {
      reconnect: true,
      connectionParams: {
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
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
    $restaurantID: Int!
    $restaurantCollectionName: String!
  ) {
    addRestaurantToCollection(
      restaurantID: $restaurantID
      restaurantCollectionName: $restaurantCollectionName
    ) {
      id
      name
    }
  }
`;

export const SHARE_RESTAURANT_COLLECTION_TO_EMAIL = gql`
  mutation shareRestaurantCollectionToEmail(
    $restaurantCollectionID: Int!
    $targetEamil: String!
  ) {
    shareRestaurantCollectionToEmail(
      restaurantCollectionID: $restaurantCollectionID
      targetEamil: $targetEamil
    )
  }
`;

export const FETCH_RESTAURANT_COLLECTION_CONTENT = gql`
  query fetchRestaurantCollectionContent($restaurantCollectionID: Int!) {
    fetchRestaurantCollectionContent(
      restaurantCollectionID: $restaurantCollectionID
    ) {
      id
      name
      restaurants {
        id
        name
      }
      owners {
        id
        username
        email
      }
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

export const RESTAURANT_ADDED_INTO_COLLECTION = gql`
  subscription restaurantAddedIntoCollection {
    restaurantAddedIntoCollection {
      restaurantCollectionID
      restaurant {
        id
        name
      }
    }
  }
`;

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
    fetchPolicy: "network-only",
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

// push the event of restaurantAdded into collection
export async function subscriptionRestaurantChange(callback: any) {
  client
    .subscribe({
      query: RESTAURANT_ADDED_INTO_COLLECTION,
    })
    .subscribe({
      next(data) {
        // ... call updateQuery to integrate the new comment
        // into the existing list of comments
        callback(data);
      },
      error(err) {
        console.error("err", err);
      },
    });
}

export default {
  setupApollo,
  getProfile,
  query,
  mutation,
  subscriptionRestaurantChange,
};
