// import { useLoadOptions } from "./useLoadOptions";
import * as Yup from "yup";
// import refreshTable from "./invoiceTable/refreshTable";

// const { fetchs, loading } = useLoadOptions();

// const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const defaultInitialValues = (fetchs, data, dateProwodok) => {
  if (data) {
    console.log("data", data);

    let footerTotalPricePurchae = 0;
    let footerTotalPriceProfit = 0;
    let footerTotalPriceDiscount = 0;

    let footerTotalVolume = 0;
    let footerTotalWeight = 0;
    let footerTotalLength = 0;
    let footerTotalWidth = 0;
    let footerTotalHeight = 0;

    let disabled = false;
    if (data.isEntry) {
      disabled = true;
    }

    const products = data.items
      .filter((item) => !item.is_gift)
      .map((item) => {
        const product = item.product;

        if (data.isEntry) {
          footerTotalPricePurchae += item.quantity * item.purchase_price;
          footerTotalPriceProfit += item.quantity * item.sale_price - item.quantity * item.purchase_price;
          footerTotalPriceDiscount += item.quantity * item.sale_price - item.quantity * item.wholesale_price;
        } else {
          footerTotalPricePurchae += item.quantity * product.purchase_price;
          footerTotalPriceProfit += item.quantity * item.sale_price - item.quantity * product.purchase_price;
          footerTotalPriceDiscount += item.quantity * item.sale_price - item.quantity * product.wholesale_price;
        }

        footerTotalVolume += item.quantity * product.volume;
        footerTotalWeight += item.quantity * product.weight;
        footerTotalLength += item.quantity * product.length;
        footerTotalWidth += item.quantity * product.width;
        footerTotalHeight += item.quantity * product.height;

        let unit_name_on_selected_warehouses = product.base_unit_obj.name;
        const units = product.units;
        if (units.length > 0) {
          units.forEach((unit) => {
            if (unit.is_default_for_sale) {
              unit_name_on_selected_warehouses = unit.unit_name;
            }
          });
        }
        if (data.isEntry) {
          return {
            ...product,
            selected_quantity: item.quantity,
            selected_price: item.sale_price,
            purchase_price: item.purchase_price,
            wholesale_price: item.wholesale_price,
            retail_price: item.retail_price,
            unit_name_on_selected_warehouses: unit_name_on_selected_warehouses,
          };
        } else {
          return {
            ...product,
            selected_quantity: item.quantity,
            selected_price: item.sale_price,
            unit_name_on_selected_warehouses: unit_name_on_selected_warehouses,
          };
        }
      });

    const gifts = data.items
      .filter((product) => product.is_gift)
      .map((item) => {
        const product = item.product;

        footerTotalVolume += item.quantity * product.volume;
        footerTotalWeight += item.quantity * product.weight;
        footerTotalLength += item.quantity * product.length;
        footerTotalWidth += item.quantity * product.width;
        footerTotalHeight += item.quantity * product.height;

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
      // console.log('updatedadad', new Date(data.invoice_date).toISOString().slice(0, 10));
      
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
      disabled: disabled,
      comment: data.note,
      footerTotalPricePurchae: footerTotalPricePurchae,
      footerTotalPriceProfit: footerTotalPriceProfit,
      footerTotalPriceDiscount: footerTotalPriceDiscount,
      footerTotalVolume: footerTotalVolume,
      footerTotalWeight: footerTotalWeight,
      footerTotalLength: footerTotalLength,
      footerTotalWidth: footerTotalWidth,
      footerTotalHeight: footerTotalHeight,
      invoice_id: data.id,
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
    // Получаем склад из localStorage
    const savedWarehouse = JSON.parse(localStorage.getItem("selectedWarehouse"));
    // console.log("savedWarehouse", savedWarehouse);

    // Находим первый активный склад
    const firstActiveWarehouse = fetchs.AllWarehouses.find((w) => w.is_active);

    // console.log('firstActiveWarehouse', firstActiveWarehouse);

    if (savedWarehouse === null && firstActiveWarehouse) {
      const selectedWarehouse = { id: firstActiveWarehouse.id, name: firstActiveWarehouse.name };
      // Сохраняем в localStorage
      localStorage.setItem("selectedWarehouse", JSON.stringify(selectedWarehouse));
    }

    // console.log('createdadad', new Date().toISOString().slice(0, 10));

    return {
      invoice_date: dateProwodok, // localStorage.getItem("dateProwodok"), //new Date().toISOString().slice(0, 10),
      awto: {},
      partner: {},
      // Устанавливаем склад
      warehouses: {
        id: savedWarehouse?.id || firstActiveWarehouse?.id || null,
        name: savedWarehouse?.name || firstActiveWarehouse?.name || "",
      },
      products: [],
      gifts: [],
      withPosting: false,
      disabled: false,
      comment: "",
      invoice_id: false,
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
