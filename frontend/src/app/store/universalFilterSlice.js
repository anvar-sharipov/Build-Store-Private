import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  faktura_type: [], // ["prihod", "rashod"]
  warehouses: [],
  partners: [],
  products: [],
  consolidated: false,
};

const fakturaFilterSlice = createSlice({
  name: "fakturaFilter",
  initialState,
  reducers: {
    toggleFakturaType: (state, action) => {
      const type = action.payload;

      if (state.faktura_type.includes(type)) {
        state.faktura_type = state.faktura_type.filter((item) => item !== type);
      } else {
        state.faktura_type.push(type);
      }
    },

    clearFakturaTypes: (state) => {
      state.faktura_type = [];
    },

    setFakturaTypes: (state, action) => {
      state.faktura_type = action.payload;
    },

    // ===== WAREHOUSES =====
    addWarehouse(state, action) {
      const warehouse = action.payload;
      if (!warehouse) return;

      const exists = state.warehouses.some((w) => w.id === warehouse.id);
      if (!exists) {
        state.warehouses.push(warehouse);
      }
    },

    addPartner(state, action) {
      const partner = action.payload;
      if (!partner) return;

      const exists = state.partners.some((p) => p.id === partner.id);
      if (!exists) {
        state.partners.push(partner);
      }
    },
    removePartner(state, action) {
      const partnerId = action.payload;
      state.partners = state.partners.filter((p) => p.id !== partnerId);
    },

    removeWarehouse(state, action) {
      const warehouseId = action.payload;
      state.warehouses = state.warehouses.filter((w) => w.id !== warehouseId);
    },

    // ===== PRODUCTS =====
    addProduct(state, action) {
      const product = action.payload;
      if (!product) return;

      const exists = state.products.some((a) => a.id === product.id);
      if (!exists) {
        state.products.push(product);
      }
    },

    // ===== CONSOLIDIROWANNYY =====
    setConsolidated(state, action) {
      state.consolidated = action.payload;
    },

    toggleConsolidated(state) {
      state.consolidated = !state.consolidated;
    },

    removeProduct(state, action) {
      const productId = action.payload;
      state.products = state.products.filter((p) => p.id !== productId);
    },

    resetUniversalFilter: () => ({
      faktura_type: [],
      warehouses: [],
      partners: [],
      products: [],
      consolidated: false,
    }),
  },
});

export const {
  toggleFakturaType,
  clearFakturaTypes,
  setFakturaTypes,
  addWarehouse,
  removeWarehouse,
  addPartner,
  removePartner,
  resetUniversalFilter,
  addProduct,
  setConsolidated,
  toggleConsolidated,
  removeProduct,
} = fakturaFilterSlice.actions;

export default fakturaFilterSlice.reducer;
