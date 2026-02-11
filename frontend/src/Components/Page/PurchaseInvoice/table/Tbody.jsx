import { useFormikContext } from "formik";
import QRDisplay from "../../../UI/QRDisplay";
import { formatNumber } from "../../../UI/formatNumber";
import Quantity from "./Quantity";
import { useState, useRef, useEffect } from "react";
import TDPrice from "./TDPrice";
import { HiX } from "react-icons/hi";
import { MyDecimalPrice } from "../../../UI/MyDecimalPrice";
import Decimal from "decimal.js";
import { formatNumber2 } from "../../../UI/formatNumber2";

// const BASE_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const safeDecimal = (value) => {
  try {
    if (value === null || value === undefined) return new Decimal(0);

    const normalized = String(value).replace(",", ".").trim();

    if (!/^[-+]?\d*\.?\d+$/.test(normalized)) {
      return new Decimal(0);
    }

    return new Decimal(normalized);
  } catch {
    return new Decimal(0);
  }
};

const Tbody = ({ id, printVisibleColumns, visibleColumns, refs }) => {
  const { values, setFieldValue, touched, errors } = useFormikContext();
  const [focusedQuantityRow, setFocusedQuantityRow] = useState(null);
  const [focusedPriceRow, setFocusedPriceRow] = useState(null);

  const recalcGiftQuantities = (products) => {
    const giftQuantities = {};
    // Проходим по всем main товарам
    products.forEach((product) => {
      if (!product.is_gift && product.free_items?.length > 0) {
        const mainQty = Number(product.selected_quantity) || 0; // <-- используем quantity из values.products
        product.free_items.forEach((free) => {
          const giftId = free.gift_product;
          const qtyPerUnit = Number(free.quantity_per_unit) || 0;
          giftQuantities[giftId] = (giftQuantities[giftId] || 0) + mainQty * qtyPerUnit;
        });
      }
    });
    // Обновляем все gift товары
    products.forEach((product, idx) => {
      if (product.is_gift) {
        const newQty = giftQuantities[product.id] || 0;
        if (Number(product.selected_quantity) !== newQty) {
          // console.log('tut');
          // console.log('eeeee', values.products[idx]);
          products[idx].selected_quantity = newQty;
        }
      }
    });

    const updatedProducts = (products || []).filter((product) => Number(product.selected_quantity) > 0);

    setFieldValue("products", updatedProducts);
  };

  useEffect(() => {
    if (values.wozwrat_or_prihod === "prihod") {
      const products_without_gifts = values.products.filter((p) => p.is_gift === false);
      setFieldValue("products", products_without_gifts);
      // console.log("products_without_gifts", products_without_gifts);
    }
  }, [values.wozwrat_or_prihod]);

  const handleRemove = (id) => {
    const updatedProducts = values.products.filter((p) => p.id !== id);
    // setFieldValue("products", updatedProducts);
    recalcGiftQuantities(updatedProducts);
    refs.productRef.current?.focus();
  };

  return (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {values.products.map((product, idx) => {
        // const total_price = Number(product.selected_quantity) * Number(product.selected_price);
        // const total_purchase = Number(product.selected_quantity) * Number(product.purchase_price);
        // const income_1pc = Number(product.selected_price) - Number(product.purchase_price);
        // const income_total = income_1pc * Number(product.selected_quantity);
        // const discount_1pc = Number(product.selected_price) - Number(product.wholesale_price);
        // const total_discount = discount_1pc * Number(product.selected_quantity);
        // const total_volume = Number(product.volume) * Number(product.selected_quantity);
        // const total_weight = Number(product.weight) * Number(product.selected_quantity);
        // const total_length = Number(product.length) * Number(product.selected_quantity);
        // const total_width = Number(product.width) * Number(product.selected_quantity);
        // const total_height = Number(product.height) * Number(product.selected_quantity);

        const total_price = MyDecimalPrice(product.selected_quantity, product.selected_price);

        const total_purchase = MyDecimalPrice(product.selected_quantity, product.purchase_price);

        // const income_1pc = new Decimal(product.selected_price || 0).minus(product.purchase_price || 0);

        // const discount_1pc = new Decimal(product.selected_price || 0).minus(product.wholesale_price || 0).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
        const income_1pc = safeDecimal(product.selected_price).minus(safeDecimal(product.purchase_price));

        const discount_1pc = safeDecimal(product.selected_price).minus(safeDecimal(product.wholesale_price)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

        const income_total = MyDecimalPrice(product.selected_quantity, income_1pc);

        const total_discount = MyDecimalPrice(product.selected_quantity, discount_1pc);

        const total_volume = Number(product.volume) * Number(product.selected_quantity);
        const total_weight = Number(product.weight) * Number(product.selected_quantity);
        const total_length = Number(product.length) * Number(product.selected_quantity);
        const total_width = Number(product.width) * Number(product.selected_quantity);
        const total_height = Number(product.height) * Number(product.selected_quantity);

        return (
          <tr
            key={product.id}
            tabIndex={0}
            className={`focus:bg-indigo-200 dark:focus:bg-indigo-500 transition-colors ${
              focusedQuantityRow === product.id || focusedPriceRow === product.id ? "bg-indigo-200 dark:bg-indigo-500" : "bg-white dark:bg-gray-900"
            }`}
          >
            <td className={`pl-1 pr-2 text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black`}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleRemove(product.id)} // здесь твоя логика удаления
                  className="ml-2 text-red-500 hover:text-red-700 print:hidden"
                >
                  <HiX className="w-4 h-4" />
                </button>
                <span className="print:pl-2">{idx + 1}</span>
              </div>
            </td>

            <td className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black`}>{product.name}</td>

            <td
              className={`text-center text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.image ? "hidden" : "table-cell"} ${
                !printVisibleColumns.image ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {product.images && product.images.length > 0 && (
                <img src={`${BASE_URL}${product.images[0].image}`} alt={product.images[0].alt_text || "Product image"} className="w-20 h-20 object-cover rounded inline-block" />
              )}
            </td>

            <td
              className={`text-center mx-auto text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.qr_code ? "hidden" : "table-cell"} ${
                !printVisibleColumns.qr_code ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              <QRDisplay code={product.qr_code} mySize={44} myClass="flex items-center text-center justify-center w-20 h-20 inline-block" />
            </td>
            {/* ####################################################################################################################################################################################################################### */}
            {/* ######################################################################################################################################################################################## quantity START */}
            <Quantity
              product={product}
              onFocusQuantityRow={() => setFocusedQuantityRow(product.id)}
              onBlurQuantityRow={() => setFocusedQuantityRow(null)}
              setFocusedQuantityRow={setFocusedQuantityRow}
              setFocusedPriceRow={setFocusedPriceRow}
              ref={(el) => (refs.quantityRefs.current[product.id] = el)}
              refs={refs}
            />
            {/* ######################################################################################################################################################################################## quantity END   */}
            {/* ####################################################################################################################################################################################################################### */}

            <td className="pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black">{product.unit_name_on_selected_warehouses}</td>
            <TDPrice
              product={product}
              ref={(el) => (refs.priceRefs.current[product.id] = el)}
              refs={refs}
              onFocusPriceRow={() => setFocusedPriceRow(product.id)}
              onBlurPriceRow={() => setFocusedPriceRow(null)}
              setFocusedPriceRow={setFocusedPriceRow}
              setFocusedQuantityRow={setFocusedQuantityRow}
            />
            <td className="pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black text-right whitespace-nowrap font-mono tabular-nums">
              {formatNumber2(total_price, 2)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.purchase ? "hidden" : "table-cell"
              } ${!printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(product.purchase_price, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.purchase ? "hidden" : "table-cell"
              } ${!printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_purchase, 2)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.income ? "hidden" : "table-cell"
              } ${!printVisibleColumns.income ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(income_1pc, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.income ? "hidden" : "table-cell"
              } ${!printVisibleColumns.income ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(income_total, 2)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.discount ? "hidden" : "table-cell"
              } ${!printVisibleColumns.discount ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(discount_1pc, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.discount ? "hidden" : "table-cell"
              } ${!printVisibleColumns.discount ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_discount, 2)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.volume ? "hidden" : "table-cell"
              } ${!printVisibleColumns.volume ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_volume, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.weight ? "hidden" : "table-cell"
              } ${!printVisibleColumns.weight ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_weight, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.dimensions ? "hidden" : "table-cell"
              } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_length, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.dimensions ? "hidden" : "table-cell"
              } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_width, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.dimensions ? "hidden" : "table-cell"
              } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_height, 3)}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default Tbody;
