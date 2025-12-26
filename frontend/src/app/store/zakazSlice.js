import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: 0, // количество заказов
  items: [], // если хочешь хранить весь список
  selectedPartner: null,
};

export const zakazSlice = createSlice({
  name: "zakaz",
  initialState,
  reducers: {
    setZakazCount: (state, action) => {
      state.count = action.payload;
    },
    setZakazItems: (state, action) => {
      state.items = action.payload;
      state.count = action.payload.length; // автоматически обновляем count
    },
    setSelectedPartner: (state, action) => {
      state.selectedPartner = action.payload;
    },
    clearSelectedPartner: (state) => {
      state.selectedPartner = null;
    },
    setSelectedBuyer: (state, action) => {
        state.selectedBuyer = action.payload;
    },
    clearSelectedBuyer: (state) => {
        state.selectedBuyer = null;
    }

  },
});

export const { setZakazCount, setZakazItems, setSelectedPartner, clearSelectedPartner, setSelectedBuyer, clearSelectedBuyer } = zakazSlice.actions;
export default zakazSlice.reducer;
