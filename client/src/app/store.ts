import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import accountReducer from "../features/account/accountSlice";
import restaurantsReducer from "../features/dashboard/restaurantsSlice";
import restaurantCollectionsReducer from "../features/dashboard/restaurantsCollectionsSlice";

const store = configureStore({
  reducer: {
    counter: counterReducer, // testing only
    account: accountReducer,
    restaurants: restaurantsReducer,
    restaurantCollections: restaurantCollectionsReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
