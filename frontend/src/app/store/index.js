import { configureStore } from "@reduxjs/toolkit";
import zakazReducer from "./zakazSlice";
import snowfallReducer from "./snowfallSlice";
import warehouseReducer from "./warehouseSlice";
import searchReducer from "./searchQuerySlice";
import productSortReducer from "./ProductCardsSlice/productSortSlice";
import skidkaFiltersReducer from "./skidkaFiltersSlice";
import analizProdajFilterReducer from "./analizProdajSlice";
import buhOborotReducer from "./buhOborotFiltersSlice"; 

export const store = configureStore({
  reducer: {
    zakaz: zakazReducer,
    snowfall: snowfallReducer,
    warehouse: warehouseReducer,
    search: searchReducer,
    productSort: productSortReducer, 
    skidkaFilters: skidkaFiltersReducer,
    analizProdajFilters: analizProdajFilterReducer,
    buhOborot: buhOborotReducer, 
  },
});
