import { configureStore } from "@reduxjs/toolkit";
import zakazReducer from "./zakazSlice";
import snowfallReducer from "./snowfallSlice";
import warehouseReducer from "./warehouseSlice";
import searchReducer from "./searchQuerySlice";

export const store = configureStore({
  reducer: {
    zakaz: zakazReducer,
    snowfall: snowfallReducer,
    warehouse: warehouseReducer,
    search: searchReducer,
  },
});
