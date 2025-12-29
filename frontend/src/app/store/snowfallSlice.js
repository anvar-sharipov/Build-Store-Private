// redux/snowfallSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSnowfallOn: false,
};

const snowfallSlice = createSlice({
  name: "snowfall",
  initialState,
  reducers: {
    toggleSnowfall: (state) => {
      state.isSnowfallOn = !state.isSnowfallOn;
    },
    setSnowfall: (state, action) => {
      state.isSnowfallOn = action.payload;
    },
  },
});

export const { toggleSnowfall, setSnowfall } = snowfallSlice.actions;
export default snowfallSlice.reducer;
