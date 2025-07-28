// import { useLoadOptions } from "./useLoadOptions";
import * as Yup from "yup";

// const { fetchs, loading } = useLoadOptions();

// const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const defaultInitialValues = (fetchs) => ({
  invoice_date: new Date().toISOString().slice(0, 10),
  awto: {},
  partner: {},
  warehouses: {
    id: fetchs.AllWarehouses[0]?.id || null,
    name: fetchs.AllWarehouses[0]?.name || "",
  },
  products: [],
  gifts: [],
  priceType: (() => {
    try {
      const saved = localStorage.getItem("priceType");
      return saved ? JSON.parse(saved) : "wholesale";
    } catch {
      return "wholesale";
    }
  })(),
});

const defaultValidationSchema = (t) => Yup.object({
  products: Yup.array().of(
  Yup.object().shape({
    selected_quantity: Yup.number()
      .required("Количество обязательно")
      .min(0.001, "Минимум 0.001")
      .test(
        "quantity-on-stock",
        "На складе недостаточно",
        function (value) {
          const { quantity_on_selected_warehouses } = this.parent;
          return parseFloat(value) <= parseFloat(quantity_on_selected_warehouses);
        }
      ),
    selected_price: Yup.number()
      .typeError("Цена должна быть числом")
      .required("Цена обязательна")
      .min(0.001, "Минимум 0.001")
  })
),
    
    // products: Yup.array().of(
    //   Yup.object().shape({
    //     selected_price: Yup.number()
    //       .typeError("Цена должна быть числом")
    //       .required("Цена обязательна")
    //       .min(0.001, "Минимум 0.001")
    //   })
    // ),
    gifts: Yup.array()
    .of(
      Yup.object().shape({
        selected_quantity: Yup.number()
          .required("Количество обязательно")
          .min(0.001, "Минимум 0.001")
          .test(
          "quantity-on-stock",
          "На складе",
          function (value) {
            const { quantity_on_selected_warehouses } = this.parent;
            return parseFloat(value) <= parseFloat(quantity_on_selected_warehouses);
          }
        ),
      })
    )
});



export {defaultInitialValues, defaultValidationSchema}