import { configureStore } from "@reduxjs/toolkit";
import zakazReducer from "./zakazSlice";

export const store = configureStore({
  reducer: {
    zakaz: zakazReducer,
  },
});
