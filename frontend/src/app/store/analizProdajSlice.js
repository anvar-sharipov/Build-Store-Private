import { createSlice } from "@reduxjs/toolkit";

// 📊 4 типа анализа:
// 📦 volume → по количеству
// 💰 revenue → по выручке
// 🏬 stock → залежавшийся товар
// 📉 dynamics → падение относительно прошлого периода

const initialState = {
  warehouses: [],
  analyzeBy: "revenue", // volume | revenue | stock | dynamics
  comparePrevious: false, // сравнивать с прошлым периодом
};

const analizProdajSlice = createSlice({
  name: "analizProdajFilters",
  initialState,
  reducers: {
    addWarehouse(state, action) {
      const warehouse = action.payload;
      if (!warehouse) return;

      const exists = state.warehouses.some((w) => w.id === warehouse.id);

      if (!exists) {
        state.warehouses.push(warehouse);
      }
    },

    removeWarehouse(state, action) {
      const warehouseId = action.payload;
      state.warehouses = state.warehouses.filter((w) => w.id !== warehouseId);
    },

    setAnalyzeBy(state, action) {
      state.analyzeBy = action.payload;
    },

    setComparePrevious(state, action) {
      state.comparePrevious = action.payload;
    },

    resetAnalizProdajFilters() {
      return initialState;
    },
  },
});

export const { addWarehouse, removeWarehouse, resetAnalizProdajFilters, setAnalyzeBy, setComparePrevious } = analizProdajSlice.actions;

export default analizProdajSlice.reducer;
