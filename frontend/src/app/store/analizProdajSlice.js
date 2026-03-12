import { createSlice } from "@reduxjs/toolkit";

// 📊 4 типа анализа:
// 📦 volume → по количеству
// 💰 revenue → по выручке
// 🏬 stock → залежавшийся товар
// 📉 dynamics → падение относительно прошлого периода

const initialState = {
  warehouses: [],
  selectedAnalyzType: null,
  lastDaysCount: null,
  searchTrigger: 0,
  excelTrigger: 0,
  loading: false,
  sortBrend: false,
  fullList: false,
  brands: [],
  categories: [],
  dontShowZero: false
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

    addBrand(state, action) {
      const brand = action.payload;
      if (!brand) return;

      const exists = state.brands.some((w) => w.id === brand.id);

      if (!exists) {
        state.brands.push(brand);
      }
    },

    removeBrand(state, action) {
      const brandId = action.payload;
      state.brands = state.brands.filter((w) => w.id !== brandId);
    },

    addCategory(state, action) {
      const category = action.payload;
      if (!category) return;

      const exists = state.categories.some((w) => w.id === category.id);

      if (!exists) {
        state.categories.push(category);
      }
    },

    removeCategory(state, action) {
      const categoryId = action.payload;
      state.categories = state.categories.filter((w) => w.id !== categoryId);
    },

    setSelectedAnalyzType(state, action) {
      state.selectedAnalyzType = action.payload;
    },

    setLastDaysCount(state, action) {
      state.lastDaysCount = action.payload;
    }, 

    triggerSearch(state) {
      state.searchTrigger += 1;
    },

    triggerExcel(state) {
      state.excelTrigger += 1;
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },

    setDontShowZero(state, action) {
      state.dontShowZero = action.payload;
    }, 
    

    setSortBrend(state, action) {
      state.sortBrend = action.payload;
    }, 

    setFullList(state, action) {
      state.fullList = action.payload;
    },

    resetAnalizProdajFilters() {
      return initialState;
    },
  },
});

export const {
  addWarehouse,
  removeWarehouse,
  resetAnalizProdajFilters,
  setSelectedAnalyzType,
  setLastDaysCount,
  triggerSearch,
  triggerExcel,
  setLoading,
  setDontShowZero,
  setSortBrend,
  setFullList,
  addBrand,
  removeBrand,
  addCategory,
  removeCategory,
} = analizProdajSlice.actions;

export default analizProdajSlice.reducer;
