// import { DateContext } from "../../../UI/DateProvider"
// import { useContext, useEffect, useState } from "react"
// import { useFormikContext } from "formik";

// просто функция без хуков
const warehouse = {
  id: 1,
  name: "Sklad 1",
};

const partner = {
  id: 1,
  name: "partner 1",
};

const awto = {
  id: 1,
  name: "awto 1",
};

const products = [
  {
    id: 1,
    name: "Polisem",
  },
];

const wozwrat_or_prihod = "wozwrat";

const getDefaultValues = (id = null, dateProwodok = null) => {
  if (id) {
    return {
      id: id,
      invoice_date: "2025-09-07", // тестовое значение, можно заменить на API данные
      warehouse: warehouse,
      partner: partner,
      awto: awto,
      products: products,
      wozwrat_or_prihod: wozwrat_or_prihod,
      type_price: "reatil_price",
      send: true,
    };
  } else {
    let get_wozwrat_or_prihod;
    if (localStorage.getItem("wozwrat_or_prihod_purchase")) {
      get_wozwrat_or_prihod = localStorage.getItem("wozwrat_or_prihod_purchase");
    } else {
      get_wozwrat_or_prihod = "prihod";
      localStorage.setItem("wozwrat_or_prihod_purchase", "prihod");
    }

    let type_price = localStorage.getItem("type_price") || "wholesale_price";
    localStorage.setItem("type_price", type_price);

    return {
      id: null,
      invoice_date: dateProwodok || localStorage.getItem("dateProwodok"),
      warehouse: localStorage.getItem("purchaseWarehouse") ? JSON.parse(localStorage.getItem("purchaseWarehouse")) : null,
      partner: null,
      awto: null,
      products: [],
      wozwrat_or_prihod: get_wozwrat_or_prihod,
      type_price: type_price,
      send: true,
    };
  }
};

export default getDefaultValues;
