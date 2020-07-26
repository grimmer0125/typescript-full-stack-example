import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

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
  extraReducers: (builder) => {},
});

export default dashboardSlice.reducer;
