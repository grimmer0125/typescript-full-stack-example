import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import RestfulAccountAPI from "../../api/restful-auth";
import GraphQLAPI from "../../api/graphql-api";
import { RootState } from "../../app/store";
import { restaurantCollectionsSlice } from "../dashboard/restaurantsCollectionsSlice";

export enum LoginStatus {
  Logout,
  LoggingIn,
  LoggedIn,
  LoginFail,
}

export const signup = createAsyncThunk(
  "user/signup",
  async (user: { username: string; email: string; password: string }) => {
    const response = await RestfulAccountAPI.signup(user);
    return response;
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (user: { username: string; password: string }) => {
    const response = await RestfulAccountAPI.login(user);
    console.log("login resp:", response);
    return response;
  }
);

export const logout = createAsyncThunk("user/logout", async () => {
  console.log("logout reducer");
  await RestfulAccountAPI.logout();
});

// TODO: figure this apollo client's typing
export const getProfile = createAsyncThunk(
  "user/profile",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.account.email) {
      console.log("setup subscription");
      /**
       * setup subscription
       */
      GraphQLAPI.subscriptionRestaurantChange((response: any) => {
        console.log("get RestaurantAdded to my collection:", response);
        // const {
        //   data: { restaurantAddedIntoCollection },
        // } = response;
        // const {
        //   restaurant,
        //   restaurantCollectionID,
        // } = response.data.restaurantAddedIntoCollection;

        const {
          restaurantAddedIntoCollection,
        } = restaurantCollectionsSlice.actions;

        dispatch(
          restaurantAddedIntoCollection(
            response.data.restaurantAddedIntoCollection
          )
        );
      });
    }
    const response = await GraphQLAPI.getProfile();
    console.log("profile resp:", response);
    return response;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    loginStatus: LoginStatus.Logout, //false,
    email: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getProfile.fulfilled, (state, { payload }) => {
      state.email = payload?.data?.whoAmI?.email ?? "";
    });
    /**
     * Add signup.fulfilled/pending/rejected later
     */
    builder.addCase(login.fulfilled, (state, { payload }) => {
      if (payload.access_token) {
        state.loginStatus = LoginStatus.LoggedIn;
      } else {
        state.loginStatus = LoginStatus.LoginFail;
      }
    });
    builder.addCase(login.pending, (state, { payload }) => {
      state.loginStatus = LoginStatus.LoggingIn;
    });
    builder.addCase(login.rejected, (state, { payload }) => {
      /**
       * in the future, if payload is designed has some errorMessage, we can use it
       */
      state.loginStatus = LoginStatus.LoginFail;
    });
    builder.addCase(logout.fulfilled, (state, { payload }) => {
      state.email = "";
    });
  },
});

export default userSlice.reducer;
