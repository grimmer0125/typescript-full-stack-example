import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import accountReducer from "../features/account/accountSlice";
import restaurantsReducer from "../features/dashboard/restaurantsSlice";
const store = configureStore({
  reducer: {
    counter: counterReducer, // testing only
    account: accountReducer,
    restaurants: restaurantsReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
