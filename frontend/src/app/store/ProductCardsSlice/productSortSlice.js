import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  field: null, // 'prihod', 'rashod', 'wozwrat'
  order: "asc", // 'asc' или 'desc'
  partner: null, // 'asc' или 'desc'
  agent: null,
  printExcel: false,
};

const productSortSlice = createSlice({
  name: "productSort",
  initialState,
  reducers: {
    setSortField: (state, action) => {
      if (state.field === action.payload) {
        // если уже выбран этот же field, меняем порядок
        state.order = state.order === "asc" ? "desc" : "asc";
      } else {
        state.field = action.payload;
        state.order = "asc";
      }
    },

    setPartner: (state, action) => {
      state.partner = action.payload;
    },

    setAgent: (state, action) => {
      state.agent = action.payload;
    },

    setPrintExcel: (state, action) => {
      state.printExcel = action.payload; // true / false
    },

    resetSort: (state) => {
      state.field = null;
      state.order = "asc";
      state.partner = null;
      state.agent = null;
      state.printExcel = false;
    },
  },
});

export const { setSortField, resetSort, setPartner, setAgent, setPrintExcel, } = productSortSlice.actions;
export default productSortSlice.reducer;
