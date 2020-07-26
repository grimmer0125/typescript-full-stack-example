import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Dispatch } from "redux";

import RestfulAccountAPI from "../../api/account-restful";
import GraphQLAPI from "../../api/graphql_api";
enum LoinStatus {
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
  async (client: any) => {
    const response = await GraphQLAPI.getProfile(client);
    console.log("profile resp:", response);
    return response;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    loginStatus: LoinStatus.Logout, //false,
    email: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signup.fulfilled, (state, { payload }) => {
      state.loginStatus = LoinStatus.LoggedIn;
    });
    builder.addCase(signup.pending, (state, { payload }) => {
      state.loginStatus = LoinStatus.LoggingIn;
    });
    builder.addCase(signup.rejected, (state, { payload }) => {
      state.loginStatus = LoinStatus.LoginFail;
      //   if (action.payload) {
      //     state.error = action.payload.errorMessage
      //   } else {
      //     state.error = action.error
      //   }
    });
    builder.addCase(logout.fulfilled, (state, { payload }) => {
      state.loginStatus = LoinStatus.Logout;
    });
  },
});

export default userSlice.reducer;
