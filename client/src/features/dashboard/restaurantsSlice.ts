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

export interface Restaurant {
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

const INITIAL_PAGE = 1;
const initialState = restaurantsAdapter.getInitialState({
  status: Loading.Idle,
  error: null,
  perPage: 10,
  page: INITIAL_PAGE,
  total: 0,
});

export const fetchRestaurants = createAsyncThunk(
  "restaurants/fetchRestaurants",
  async (
    args: {
      newPage: number;
      issueFilter?: boolean;
      filterWeekDay?: number;
      filterTime?: string;
      filterRestaurentName?: string;
    },
    { getState, dispatch }
  ) => {
    const {
      newPage,
      filterWeekDay,
      filterTime,
      filterRestaurentName,
      issueFilter,
    } = args;
    const state = getState() as RootState;
    const {
      restaurants: { perPage, page, status, total },
    } = state;
    let response: ApolloQueryResult<any>;
    const { switchPage, issueFilterRequest } = restaurantsSlice.actions;
    if (status === Loading.Idle || issueFilter) {
      if (issueFilter) {
        dispatch(issueFilterRequest({}));
      }
      response = await GraphQLAPI.query(FETCH_RESTAURANTS, {
        perPage,
        page: INITIAL_PAGE, // initail
        filterWeekDay: filterWeekDay ?? 0,
        filterTime: filterTime ?? "",
        filterRestaurentName: filterRestaurentName ?? "",
      });
    } else {
      // newPage >=1 is not necessary but just more safe in case
      if (newPage >= 1 && perPage * (newPage - 1) < total) {
        dispatch(switchPage({ page: newPage }));

        response = await GraphQLAPI.query(FETCH_RESTAURANTS, {
          perPage,
          page: newPage,
          filterWeekDay: filterWeekDay ?? 0,
          filterTime: filterTime ?? "",
          filterRestaurentName: filterRestaurentName ?? "",
        });
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
      state.page = action.payload.page;
    },
    issueFilterRequest(state, action) {
      state.total = Infinity;
      state.page = 1;
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

      const { restaurants } = payload;

      if (payload.total) {
        state.total = payload.total;
      } else {
        // filter case
        if (restaurants.length < state.perPage) {
          state.total = state.perPage * (state.page - 1) + restaurants.length;
        }
      }
    });
    /**
     * TODO: handle these cases
     */
    builder.addCase(fetchRestaurants.pending, (state, _) => {});
    builder.addCase(fetchRestaurants.rejected, (state, _) => {});
  },
});

export default restaurantsSlice.reducer;
