import { createSlice } from "@reduxjs/toolkit";

const initialState = {


  printExcel: false,
};

const buhOborotSlice = createSlice({
  name: "buhOborot",
  initialState,
  reducers: {
    // ===== EXCEL =====
    setPrintExcel(state, action) {
      state.printExcel = action.payload;
    },

 
  },
});

export const {
  setPrintExcel,
} = buhOborotSlice.actions;

export default buhOborotSlice.reducer;
