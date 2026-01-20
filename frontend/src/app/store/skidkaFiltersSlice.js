import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  partners: [],
  users: [],
  agents: [],
  products: [],
  categories: [],
  warehouses: [],
  only: null,        // "skidka" | "nasenka"
  sortPrice: null,  // "asc" | "desc"
};

const skidkaFiltersSlice = createSlice({
  name: "skidkaFilters",
  initialState,
  reducers: {
    // ===== PARTNERS =====
    addPartner(state, action) {
      const partner = action.payload;
      if (!partner) return;

      const exists = state.partners.some(p => p.id === partner.id);
      if (!exists) {
        state.partners.push(partner);
      }
    },
    removePartner(state, action) {
      const partnerId = action.payload;
      state.partners = state.partners.filter(p => p.id !== partnerId);
    },

    // ===== WAREHOUSES =====
    addWarehouse(state, action) {
        const warehouse = action.payload;
        if (!warehouse) return

        const exists = state.warehouses.some(w=>w.id === warehouse.id)
        if (!exists) {
            state.warehouses.push(warehouse)
        }
    },
    removeWarehouse(state, action) {
        const warehouseId = action.payload
        state.warehouses = state.warehouses.filter(w => w.id !== warehouseId);
    },

    // ===== AGENTS =====
    addAgent(state, action) {
        const agent = action.payload;
        if (!agent) return

        const exists = state.agents.some(a => a.id === agent.id)
        if (!exists) {
            state.agents.push(agent)
        }
    },
    removeAgent(state, action) {
        const agentId = action.payload
        state.agents = state.agents.filter(a => a.id !== agentId);
    },

    // ===== USERS =====
    addUser(state, action) {
      const user = action.payload;
      if (!user) return;

      const exists = state.users.some(u => u.id === user.id);
      if (!exists) {
        state.users.push(user);
      }
    },
    removeUser(state, action) {
      const userId = action.payload;
      state.users = state.users.filter(u => u.id !== userId);
    },

    // ===== COMMON =====
    setOnly(state, action) {
      state.only = action.payload; // null | "skidka" | "nasenka"
    },
    setSortPrice(state, action) {
      state.sortPrice = action.payload; // null | "asc" | "desc"
    },

    resetSkidkaFilters() {
      return { ...initialState };
    },
  },
});

export const {
  addPartner,
  removePartner,
  addWarehouse,
  removeWarehouse,

  addAgent,
  removeAgent,

  addUser,
  removeUser,
  setOnly,
  setSortPrice,
  resetSkidkaFilters,
} = skidkaFiltersSlice.actions;

export default skidkaFiltersSlice.reducer;
