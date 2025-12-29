import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentWarehouse: null, // текущий выбранный склад
};

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setCurrentWarehouse: (state, action) => {
      state.currentWarehouse = action.payload;
    },
    clearCurrentWarehouse: (state) => {
      state.currentWarehouse = null;
    },
  },
});

export const { setCurrentWarehouse, clearCurrentWarehouse } =
  warehouseSlice.actions;

export default warehouseSlice.reducer;
