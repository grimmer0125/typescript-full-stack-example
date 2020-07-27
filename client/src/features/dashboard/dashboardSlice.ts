import { createSlice } from "@reduxjs/toolkit";

interface Restaurant {
  id: number;
  name: string;
  openTime: string[];
}

interface DashboardState {
  restaurants: Restaurant[];
}

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    restaurants: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase("user/logout/fulfilled", (state, _) => {
      // TODO: add some code if need
      console.log("handle logout in dashboard reducer");
    });
  },
});

export default dashboardSlice.reducer;
