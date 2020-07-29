import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";

import { ApolloQueryResult } from "@apollo/client";
import GraphQLAPI, {
  FETCH_RESTAURANT_COLLECTION_LIST,
  ADD_RESTAURANT_TO_COLLECTION,
} from "../../api/graphql-api";

import { Restaurant, Loading } from "./restaurantsSlice";

interface User {
  id: number;
  username: string;
}

export interface RestaurantCollection {
  id: number;
  name: string;
  restaurants?: Restaurant[];
  owners?: User[];
}

const restaurantCollectionsAdapter = createEntityAdapter<RestaurantCollection>({
  selectId: (restaurant) => restaurant.id,
  sortComparer: (a, b) => a.id - b.id,
});

const INITIAL_PAGE = 1;
const initialState = restaurantCollectionsAdapter.getInitialState({
  status: Loading.Idle,
  error: null,
  perPage: 10,
  page: INITIAL_PAGE,
  total: 0,
});

export const addRestaurantToCollection = createAsyncThunk(
  "dashboard/addRestaurantToCollection",
  async (
    args: { restaurantName: string; restaurantCollectionName: string },
    { getState, dispatch }
  ) => {
    const { restaurantName, restaurantCollectionName } = args;
    const response = await GraphQLAPI.mutation(ADD_RESTAURANT_TO_COLLECTION, {
      restaurantName: restaurantName,
      restaurantCollectionName: restaurantCollectionName,
    });
    const {
      data: { addRestaurantToCollection },
    } = response;

    console.log("add restul:", addRestaurantToCollection);

    return addRestaurantToCollection;
  }
);

export const fetchRestaurantCollections = createAsyncThunk(
  "dashboard/fetchRestaurantCollections",
  async (args: {}, { getState, dispatch }) => {
    const response = await GraphQLAPI.query(
      FETCH_RESTAURANT_COLLECTION_LIST,
      {}
    );
    const {
      data: { fetchRestaurantCollectionList },
    } = response;

    return fetchRestaurantCollectionList;
  }
);

export const restaurantsSlice = createSlice({
  name: "restaurantCollections",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase("user/logout/fulfilled", (state, _) => {
      // TODO: add some code if need
      console.log("handle logout in dashboard reducer");
    });
    builder.addCase(
      addRestaurantToCollection.fulfilled,
      (state, { payload }) => {
        console.log("add payload:", payload);
        //[addNewPost.fulfilled]: postsAdapter.addOne,
        restaurantCollectionsAdapter.addOne(state, payload);
        //   restaurantCollectionsAdapter.setAll(
        //     state,
        //     payload.restaurantCollections
        //   );
        //   state.status = Loading.Succeeded;
        //   state.total = payload.total;
      }
    );
    builder.addCase(
      fetchRestaurantCollections.fulfilled,
      (state, { payload }) => {
        console.log("payload:", payload);
        restaurantCollectionsAdapter.setAll(
          state,
          payload.restaurantCollections
        );
        state.status = Loading.Succeeded;
        state.total = payload.total;
      }
    );
    /**
     * TODO: handle these cases
     */
    builder.addCase(fetchRestaurantCollections.pending, (state, _) => {});
    builder.addCase(fetchRestaurantCollections.rejected, (state, _) => {});
  },
});

export default restaurantsSlice.reducer;
