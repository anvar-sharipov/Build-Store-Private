import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  query: "",
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    clearQuery: (state) => {
      state.query = "";
    },
  },
});

export const { setQuery, clearQuery } = searchSlice.actions;

export default searchSlice.reducer;
