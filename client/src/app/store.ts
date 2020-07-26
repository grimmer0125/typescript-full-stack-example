import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import accountReducer from "../features/account/accountSlice";
import dashboarReducer from "../features/dashboard/dashboardSlice";
const store = configureStore({
  reducer: {
    counter: counterReducer,
    account: accountReducer,
    dashboard: dashboarReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
