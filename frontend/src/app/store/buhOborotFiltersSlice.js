import { createSlice } from "@reduxjs/toolkit";

const initialState = {


  printExcel: false,
  printExcelBrand: false,
};

const buhOborotSlice = createSlice({
  name: "buhOborot",
  initialState,
  reducers: {
    // ===== EXCEL =====
    setPrintExcel(state, action) {
      state.printExcel = action.payload;
    },

    // ===== EXCEL BRAND =====
    setPrintExcelBrand(state, action) {
      state.printExcelBrand = action.payload;
    },

 
  },
});

export const {
  setPrintExcel,
  setPrintExcelBrand,
} = buhOborotSlice.actions;

export default buhOborotSlice.reducer;
