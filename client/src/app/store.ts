import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import accountReducer from "../features/account/accountSlice";

const store = configureStore({
  reducer: {
    counter: counterReducer,
    account: accountReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
