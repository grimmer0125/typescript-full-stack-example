import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";

import { ApolloQueryResult } from "@apollo/client";
import GraphQLAPI, {
  FETCH_RESTAURANT_COLLECTION_LIST,
  ADD_RESTAURANT_TO_COLLECTION,
  FETCH_RESTAURANT_COLLECTION_CONTENT,
} from "../../api/graphql-api";

import { RootState } from "../../app/store";

import { Restaurant, Loading } from "./restaurantsSlice";

interface User {
  id: number;
  username: string;
  email?: string;
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
  selectedRestaurantCollectionID: Infinity, // workaround here
  status: Loading.Idle,
  error: null,
  // unused, we do no have pagination implementation here
  perPage: 10,
  page: INITIAL_PAGE,
  //currently total is the same as entities.length
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

    console.log(
      "add RestaurantToCollection restul:",
      addRestaurantToCollection
    );

    return addRestaurantToCollection;
  }
);

export const fetchRestaurantCollectionsInCollectionUI = createAsyncThunk(
  "dashboard/fetchRestaurantCollectionsInCollectionUI",
  async (args: {}, { getState, dispatch }) => {
    const resp = await dispatch(fetchRestaurantCollections({}));

    const {
      payload: { restaurantCollections },
    } = resp;

    if (restaurantCollections.length > 0) {
      console.log("query first restaurantCollection content");
      const restaurantCollection = restaurantCollections[0];
      const { id } = restaurantCollection;
      dispatch(
        fetchRestaurantCollectionContent({ restaurantCollectionID: id })
      );
    }
  }
);

export const fetchRestaurantCollectionContent = createAsyncThunk(
  "dashboard/fetchRestaurantCollectionContent",
  async (args: { restaurantCollectionID: number }, { getState, dispatch }) => {
    const { restaurantCollectionID } = args;
    const { selectRestaurantCollection } = restaurantCollectionsSlice.actions;

    dispatch(
      selectRestaurantCollection({
        selectedRestaurantCollectionID: restaurantCollectionID,
      })
    );
    const response = await GraphQLAPI.query(
      FETCH_RESTAURANT_COLLECTION_CONTENT,
      { restaurantCollectionID }
    );
    const {
      data: { fetchRestaurantCollectionContent },
    } = response;

    return fetchRestaurantCollectionContent;
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

export const restaurantCollectionsSlice = createSlice({
  name: "restaurantCollections",
  initialState: initialState,
  reducers: {
    selectRestaurantCollection(state, action) {
      ///
      console.log("selectRestaurantCollection action:", action);
      state.selectedRestaurantCollectionID =
        action.payload.selectedRestaurantCollectionID;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("user/logout/fulfilled", (state, _) => {
      // TODO: add some code if need
      console.log("handle logout in dashboard reducer");
    });
    builder.addCase(
      fetchRestaurantCollectionContent.fulfilled,
      (state, { payload }) => {
        console.log("fetchRestaurantCollectionContent paylaod:", payload);
        //        store.dispatch(bookUpdated({ id: 'a', changes: { title: 'First (altered)' } }))

        restaurantCollectionsAdapter.updateOne(state, {
          id: payload.id,
          changes: payload,
        });
        state.status = Loading.Succeeded;
      }
    );
    builder.addCase(
      addRestaurantToCollection.fulfilled,
      (state, { payload }) => {
        restaurantCollectionsAdapter.addOne(state, payload);
        state.status = Loading.Succeeded;
        state.total += 1;
      }
    );
    builder.addCase(
      fetchRestaurantCollections.fulfilled,
      (state, { payload }) => {
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

export default restaurantCollectionsSlice.reducer;
