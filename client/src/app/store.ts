import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import accountReducer from "../features/account/accountSlice";

export default configureStore({
  reducer: {
    counter: counterReducer,
    account: accountReducer,
  },
});
