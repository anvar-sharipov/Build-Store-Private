// import { DateContext } from "../../../UI/DateProvider"
// import { useContext, useEffect, useState } from "react"
// import { useFormikContext } from "formik";

// просто функция без хуков
const warehouse = {
  id: 1,
  name: "Sklad 1"
}

const partner = {
  id: 1,
  name: "partner 1"
}

const awto = {
  id: 1,
  name: "awto 1"
}

const products = {
  id: 1,
  name: "Polisem"
}


const getDefaultValues = (id = null, dateProwodok = null) => {
  console.log('dateProwodok', dateProwodok);
  
  if (id) {
    return {
      id: id,
      invoice_date: "2025-09-07", // тестовое значение, можно заменить на API данные
      warehouse: warehouse,
      partner: partner,
      awto: awto,
      products: products,
    };
  } else {
    return {
      id: null,
      invoice_date: dateProwodok || localStorage.getItem("dateProwodok"),
      warehouse: localStorage.getItem("purchaseWarehouse") ? JSON.parse(localStorage.getItem("purchaseWarehouse")) : null,
      partner: null,
      awto: null,
      products: null,
    };
  }
};

export default getDefaultValues;