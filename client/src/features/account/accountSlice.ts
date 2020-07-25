import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Dispatch } from "redux";

import client from "../../api/account-restful";
enum LoinStatus {
  Logout,
  LoggingIn,
  LoggedIn,
  LoginFail,
}

export const signup = createAsyncThunk(
  "user/signup",
  async (user: { email: string; password: string }) => {
    const response = await client.signup(user);
    return response;
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (user: { email: string; password: string }) => {
    const response = await client.login(user);
    console.log("login resp:", response);
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
  },
});

export default userSlice.reducer;
