// import { useLoadOptions } from "./useLoadOptions";
import * as Yup from "yup";
// import refreshTable from "./invoiceTable/refreshTable";

// const { fetchs, loading } = useLoadOptions();

// const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const defaultInitialValues = (fetchs, data) => {
  if (data) {
    console.log("s data", data);
    console.log("data.items", data.items);
    const products = data.items
      .filter((item) => !item.is_gift)
      .map((item) => {
        const product = item.product;
        let unit_name_on_selected_warehouses = product.base_unit_obj.name;
        const units = product.units;
        if (units.length > 0) {
          units.forEach((unit) => {
            if (unit.is_default_for_sale) {
              unit_name_on_selected_warehouses = unit.unit_name;
            }
          });
        }
        return {
          ...product,
          selected_quantity: item.quantity,
          selected_price: item.sale_price,
          unit_name_on_selected_warehouses: unit_name_on_selected_warehouses,
        };
      });

    const gifts = data.items
      .filter((product) => product.is_gift)
      .map((item) => {
        const product = item.product;
        let unit_name_on_selected_warehouses = product.base_unit_obj.name;
        const units = product.units;
        if (units.length > 0) {
          units.forEach((unit) => {
            if (unit.is_default_for_sale) {
              unit_name_on_selected_warehouses = unit.unit_name;
            }
          });
        }
        return {
          ...product,
          selected_quantity: item.quantity,
          selected_price: item.sale_price,
          unit_name_on_selected_warehouses: unit_name_on_selected_warehouses,
        };
      });

    return {
      invoice_date: new Date(data.invoice_date).toISOString().slice(0, 10),
      awto: data.delivered_by,
      partner: data.buyer,
      warehouses: {
        id: data.warehouse.id,
        name: data.warehouse.name,
      },
      products: products,
      gifts: gifts,
      footerTotalPrice: data.total_amount,
      withPosting: data.isEntry,
      comment: data.note,
      priceType: (() => {
        try {
          localStorage.setItem("priceType", JSON.stringify(data.type_price));
          return data.type_price;
        } catch {
          return "wholesale";
        }
      })(),
    };
  } else {
    // console.log('bez data fetchsAllWarehouses[0]', fetchs.AllWarehouses[0]);

    return {
      invoice_date: new Date().toISOString().slice(0, 10),
      awto: {},
      partner: {},
      warehouses: {
        id: fetchs.AllWarehouses[0]?.id || null,
        name: fetchs.AllWarehouses[0]?.name || "",
      },
      products: [],
      gifts: [],
      withPosting: false,
      comment: "",
      priceType: (() => {
        try {
          const saved = localStorage.getItem("priceType");
          return saved ? JSON.parse(saved) : "wholesale";
        } catch {
          return "wholesale";
        }
      })(),
    };
  }
};

const defaultValidationSchema = (t) =>
  Yup.object({
    products: Yup.array().of(
      Yup.object().shape({
        selected_quantity: Yup.number()
          .required("Количество обязательно")
          .min(0.001, "Минимум 0.001")
          .test("quantity-on-stock", "На складе недостаточно", function (value) {
            const { quantity_on_selected_warehouses } = this.parent;
            return parseFloat(value) <= parseFloat(quantity_on_selected_warehouses);
          }),
        selected_price: Yup.number().typeError("Цена должна быть числом").required("Цена обязательна").min(0.001, "Минимум 0.001"),
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
    gifts: Yup.array().of(
      Yup.object().shape({
        selected_quantity: Yup.number()
          .required("Количество обязательно")
          .min(0.001, "Минимум 0.001")
          .test("quantity-on-stock", "На складе", function (value) {
            const { quantity_on_selected_warehouses } = this.parent;
            return parseFloat(value) <= parseFloat(quantity_on_selected_warehouses);
          }),
      })
    ),
  });

export { defaultInitialValues, defaultValidationSchema };
