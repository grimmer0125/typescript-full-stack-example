import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";

import GraphQLAPI, {
  FETCH_RESTAURANT_COLLECTION_LIST,
  ADD_RESTAURANT_TO_COLLECTION,
  FETCH_RESTAURANT_COLLECTION_CONTENT,
  SHARE_RESTAURANT_COLLECTION_TO_EMAIL,
} from "../../api/graphql-api";

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
  perPage: 10, // unused, we do no have pagination implementation here
  page: INITIAL_PAGE,
  total: 0, //currently total is the same as entities.length
});

export const shareRestaurantCollection = createAsyncThunk(
  "restaurantCollections/shareRestaurantCollection",
  async (
    args: { restaurantCollectionID: number; targetEamil: string },
    { getState, dispatch }
  ) => {
    const { restaurantCollectionID, targetEamil } = args;
    const response = await GraphQLAPI.mutation(
      SHARE_RESTAURANT_COLLECTION_TO_EMAIL,
      {
        restaurantCollectionID,
        targetEamil,
      }
    );
    return response;
  }
);

export const addRestaurantToCollection = createAsyncThunk(
  "restaurantCollections/addRestaurantToCollection",
  async (
    args: { restaurantID: number; restaurantCollectionName: string },
    { getState, dispatch }
  ) => {
    const { restaurantID, restaurantCollectionName } = args;
    const response = await GraphQLAPI.mutation(ADD_RESTAURANT_TO_COLLECTION, {
      restaurantID: restaurantID,
      restaurantCollectionName: restaurantCollectionName,
    });
    const {
      data: { addRestaurantToCollection },
    } = response;

    return addRestaurantToCollection;
  }
);

export const fetchRestaurantCollectionsInCollectionUI = createAsyncThunk(
  "restaurantCollections/fetchRestaurantCollectionsInCollectionUI",
  async (args: {}, { getState, dispatch }) => {
    const resp = await dispatch(fetchRestaurantCollections({}));

    const {
      payload: { restaurantCollections },
    } = resp;

    if (restaurantCollections.length > 0) {
      const restaurantCollection = restaurantCollections[0];
      const { id } = restaurantCollection;
      dispatch(
        fetchRestaurantCollectionContent({ restaurantCollectionID: id })
      );
    }
  }
);

export const fetchRestaurantCollectionContent = createAsyncThunk(
  "restaurantCollections/fetchRestaurantCollectionContent",
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
  "restaurantCollections/fetchRestaurantCollections",
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
      state.selectedRestaurantCollectionID =
        action.payload.selectedRestaurantCollectionID;
    },
    restaurantAddedIntoCollection(state, action) {
      const { restaurant, restaurantCollectionID } = action.payload;

      if (state.selectedRestaurantCollectionID === restaurantCollectionID) {
        if (state.entities[state.selectedRestaurantCollectionID]?.restaurants) {
          const collection =
            state.entities[state.selectedRestaurantCollectionID];
          if (collection?.restaurants) {
            collection.restaurants.push(restaurant);
          }
        }
      }
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
