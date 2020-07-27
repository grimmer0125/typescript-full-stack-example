import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";

import { ApolloQueryResult } from "@apollo/client";
import GraphQLAPI, { FETCH_RESTAURANTS } from "../../api/graphql-api";
import { RootState } from "../../app/store";

export interface OpenTime {
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
  perPage: 15,
  page: 1,
  total: 0,
});

export const fetchRestaurants = createAsyncThunk(
  "dashboard/fetchRestaurants",
  async (newPage: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    console.log("store:", state, newPage);
    const {
      restaurants: { perPage, page, status, total },
    } = state;
    let response: ApolloQueryResult<any>;
    if (status === Loading.Idle) {
      response = await GraphQLAPI.query(FETCH_RESTAURANTS, {
        perPage,
        page: page, // initail
      });
    } else {
      if (newPage >= 1 && perPage * (newPage - 1) < total) {
        response = await GraphQLAPI.query(FETCH_RESTAURANTS, {
          perPage,
          page: newPage,
        });
        const { switchPage } = restaurantsSlice.actions;
        dispatch(switchPage({ page: newPage }));
      } else {
        console.log("already final page");
        return;
      }
    }

    const {
      data: { fetchRestaurants },
    } = response;
    return fetchRestaurants;
  }
);

export const restaurantsSlice = createSlice({
  name: "restaurants",
  initialState: initialState,
  reducers: {
    // TODO: add action typing later
    switchPage(state, action) {
      console.log("switchPage action:", action);
      state.page = action.payload.page;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("user/logout/fulfilled", (state, _) => {
      // TODO: add some code if need
      console.log("handle logout in dashboard reducer");
    });
    builder.addCase(fetchRestaurants.fulfilled, (state, { payload }) => {
      restaurantsAdapter.setAll(state, payload.restaurants);
      state.status = Loading.Succeeded;
      state.total = payload.total;
    });
    builder.addCase(fetchRestaurants.pending, (state, _) => {});
    builder.addCase(fetchRestaurants.rejected, (state, _) => {});
  },
});

export default restaurantsSlice.reducer;
