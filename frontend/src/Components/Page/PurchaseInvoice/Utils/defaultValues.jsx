// import { DateContext } from "../../../UI/DateProvider"
// import { useContext, useEffect, useState } from "react"
// import { useFormikContext } from "formik";
import myAxios from "../../../axios";
import MyFormatDate from "../../../UI/MyFormatDate";
import { AuthContext } from "../../../../AuthContext";
import { useContext } from "react";

// // просто функция без хуков
// const warehouse = {
//   id: 1,
//   name: "Sklad 1",
// };

// const partner = {
//   id: 1,
//   name: "partner 1",
// };

// const awto = {
//   id: 1,
//   name: "awto 1",
// };

// const products = [
//   {
//     id: 1,
//     name: "Polisem",
//   },
// ];

// const wozwrat_or_prihod = "wozwrat";

const convertToISODate = (dateString) => {
  if (!dateString) return "";
  const [day, month, year] = dateString.split(".");
  return `${year}-${month}-${day}`; // "2025-01-02"
};

const getDefaultValues = async (id = null, dateProwodok = null, setDateProwodok) => {
  // const { authUser, authGroup } = useContext(AuthContext);


  if (id) {
    try {
      const res = await myAxios.get(`get-invoice-data/${id}/`);
      const data = res.data;
      
      
      



      const invoice_date = MyFormatDate(data.date); // 02.01.2025
      const isoDate = convertToISODate(invoice_date); // 2025-01-02


      

      const created_at = MyFormatDate(data.created_at_handle);
      const updated_at = MyFormatDate(data.updated_at_handle);

      let entry_created_at = null
      if (data.entry_created_at) {
        entry_created_at = MyFormatDate(data.entry_created_at_handle);
      }

      let entry_canceled_at = null
      if (data.canceled_at) {
        entry_canceled_at = MyFormatDate(data.canceled_at);
      }

      // localStorage.setItem("dateProwodok", convertToISODate(invoice_date));

      // if (setDateProwodok) {
      //   setDateProwodok(isoDate);
      // }

      const type_price = data.type_price;
      localStorage.setItem("type_price", type_price);

      const warehouse = data.warehouse;
   
      
      const warehouse2 = data.warehouse2;
      localStorage.setItem("purchaseWarehouse", JSON.stringify(warehouse));
      localStorage.setItem("purchaseWarehouse2", JSON.stringify(warehouse2));
      localStorage.setItem("wozwrat_or_prihod_purchase", data.wozwrat_or_prihod);
      
     

      return {
        awto: data.awto,
        awto_send: data.awto_send,
        comment: data.comment,
        invoice_date: invoice_date,
        invoice_date2: isoDate,
        is_entry: data.is_entry,
        already_entry:data.already_entry,
        partner: data.partner,
        partner_send: data.partner_send,
        send: data.send,
        type_price: type_price,
        warehouse: data.warehouse,
        warehouse2: data.warehouse2,
        wozwrat_or_prihod: data.wozwrat_or_prihod,
        created_by: data.created_by,
        entry_created_by: data.entry_created_by,
        canceled_comment: data.canceled_comment,
        created_at: created_at,
        updated_at: updated_at,
        entry_created_at: entry_created_at,
        products: data.products || [],

        canceled_by:data.canceled_by,
        canceled_at:entry_canceled_at,


        id: data.id,


        
      };
    } catch (error) {
      console.log("cant get invoice", error);
      return {};
    }

    // const data = await getData(id);


    // return {
    //   id: data.id,
    //   invoice_date: MyFormatDate(data.date), // тестовое значение, можно заменить на API данные
    //   warehouse: warehouse,
    //   partner: partner,
    //   awto: awto,
    //   products: [],
    //   wozwrat_or_prihod: wozwrat_or_prihod,
    //   type_price: "reatil_price",
    //   send: true,
    // };
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
      warehouse2: localStorage.getItem("purchaseWarehouse2") ? JSON.parse(localStorage.getItem("purchaseWarehouse2")) : null,
      partner: null,
      awto: null,
      products: [],
      wozwrat_or_prihod: get_wozwrat_or_prihod,
      type_price: type_price,
      send: true,
      awto_send: true,
      partner_send: true,
      is_entry: false,
      already_entry:false,
      comment: "",
    };
  }
};

export default getDefaultValues;
