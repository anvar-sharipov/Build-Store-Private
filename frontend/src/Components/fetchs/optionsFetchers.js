// fetchs/optionsFetchers.js
import myAxios from "../axios";

export const fetchUnits = async () => {
  try {
    const res = await myAxios.get("/units");
    return res.data;
  } catch (e) {
    console.error("Ошибка при загрузке:", e);
    return e;
  }
};

export const fetchCategories = async () => {
  try {
    const res = await myAxios.get("/categories");
    return res.data;
  } catch (e) {
    console.error("Ошибка при загрузке:", e);
    return e;
  }
};

export const fetchModels = async () => {
  try {
    const res = await myAxios.get("/models");
    return res.data;
  } catch (e) {
    console.error("Ошибка при загрузке:", e);
    return e;
  }
};


export const fetchBrands = async () => {
  try {
    const res = await myAxios.get("/brands");
    return res.data;
  } catch (e) {
    console.error("Ошибка при загрузке:", e);
    return e;
  }
};


export const fetchTags = async () => {
  try {
    const res = await myAxios.get("/tags");
    return res.data;
  } catch (e) {
    console.error("Ошибка при загрузке:", e);
    return e;
  }
};

export const fetchWarehouses = async () => {
  try {
    const res = await myAxios.get("/warehouses");
    return res.data;
  } catch (e) {
    console.error("Ошибка при загрузке warehouses:", e);
    return e;
  }
};


export const fetchPartners = async () => {
  try {
    const res = await myAxios.get("/partners");
    console.log('rrrreeeessss.data', res.data);
    
    return res.data;
  } catch (e) {
    console.error("Ошибка при загрузке partners:", e);
    return e;
  }
};

export const fetchEmployeers = async () => {
  try {
    const res = await myAxios.get("/employeers");
    return res.data;
  } catch (e) {
    console.error("Ошибка при загрузке employeers:", e);
    return e;
  }
};

