import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";

import GraphQLAPI, { FETCH_RESTAURANTS } from "../../api/graphql-api";

interface OpenTime {
  id?: number;
  weekDay: number;
  openHour: string;
  closeHour: string;
}

interface Restaurant {
  id: number;
  name: string;
  openTimes?: OpenTime[];
  created?: Date;
}

export enum Loading {
  Idle,
  Pending,
  Succeeded,
  Failed,
}

const restaurantsAdapter = createEntityAdapter<Restaurant>({
  selectId: (restaurant) => restaurant.id,
  sortComparer: (a, b) => a.id - b.id,
});

const initialState = restaurantsAdapter.getInitialState({
  status: Loading.Idle,
  error: null,
});

export const fetchRestaurants = createAsyncThunk(
  "dashboard/fetchRestaurants",
  async () => {
    const response = await GraphQLAPI.query(FETCH_RESTAURANTS, {
      perPage: 100,
      page: 1,
    });
    console.log("respone:", response);
    const {
      data: { fetchRestaurants },
    } = response;
    return fetchRestaurants;
  }
);

export const restaurantsSlice = createSlice({
  name: "restaurants",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase("user/logout/fulfilled", (state, _) => {
      // TODO: add some code if need
      console.log("handle logout in dashboard reducer");
    });
    builder.addCase(fetchRestaurants.fulfilled, (state, { payload }) => {
      restaurantsAdapter.setAll(state, payload.restaurants);
      state.status = Loading.Succeeded;
    });
    builder.addCase(fetchRestaurants.pending, (state, _) => {});
    builder.addCase(fetchRestaurants.rejected, (state, _) => {});
  },
});

export default restaurantsSlice.reducer;
