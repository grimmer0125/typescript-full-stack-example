import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Dispatch } from "redux";

import client from "../../api/account-restful";
enum LoinStatus {
  Logout,
  LoggingIn,
  LoggedIn,
  LoginFail,
}

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
// export const incrementAsync = (amount: number) => (dispatch: Dispatch) => {
//   setTimeout(() => {
//     dispatch(incrementByAmount(amount));
//   }, 1000);
// };

export const signup = createAsyncThunk(
  "user/signup",
  async (user: { email: string; password: string }) => {
    const response = await client.signup(user);

    console.log("sign up ok:", response);
    //   const response = await client.get("/fakeApi/posts");
    //return response.posts;
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
    });
    // builder.addCase(signup.rejected, (state, action) => {
    //   if (action.payload) {
    //     // Since we passed in `MyKnownError` to `rejectType` in `updateUser`, the type information will be available here.
    //     state.error = action.payload.errorMessage
    //   } else {
    //     state.error = action.error
    //   }
    // })
  },
  //   extraReducers: {
  //     [signup.pending]: (state, action) => {
  //       state.loginStatus = LoinStatus.LoggingIn;
  //     },
  //     [signup.fulfilled]: (state, action) => {
  //       state.loginStatus = LoinStatus.LoggingIn;
  //       //   state.push(...action.payload);
  //       //   // Sort with newest first
  //       //   state.sort((a, b) => b.date.localeCompare(a.date));
  //     },
  //   },
});

export default userSlice.reducer;
