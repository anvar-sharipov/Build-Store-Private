import { useFormikContext } from "formik";
import QRDisplay from "../../../UI/QRDisplay";
import { formatNumber } from "../../../UI/formatNumber";
import Quantity from "./Quantity";
import { useState, useRef, useEffect } from "react";
import TDPrice from "./TDPrice";
import { HiX } from "react-icons/hi";

const BASE_URL = import.meta.env.VITE_BASE_URL;

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

  const handleRemove = (id) => {
    const updatedProducts = values.products.filter((p) => p.id !== id);
    // setFieldValue("products", updatedProducts);
    recalcGiftQuantities(updatedProducts);
    refs.productRef.current?.focus();
  };

  return (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {values.products.map((product, idx) => {
        const total_price = Number(product.selected_quantity) * Number(product.selected_price);
        const total_purchase = Number(product.selected_quantity) * Number(product.purchase_price);
        const income_1pc = Number(product.selected_price) - Number(product.purchase_price);
        const income_total = income_1pc * Number(product.selected_quantity);
        const discount_1pc = Number(product.selected_price) - Number(product.wholesale_price);
        const total_discount = discount_1pc * Number(product.selected_quantity);
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
                <span>{idx + 1}</span>
              </div>
            </td>

            <td className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black`}>{product.name}</td>

            <td
              className={`text-center text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.image ? "hidden" : "table-cell"} ${
                !printVisibleColumns.image ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {product.images.length > 0 &&
                (id ? (
                  <img src={`${product.images[0].image}`} alt={product.images[0].alt_text || "Product image"} className="w-20 h-20 object-cover rounded inline-block" />
                ) : (
                  <img src={`${BASE_URL}${product.images[0].image}`} alt={product.images[0].alt_text || "Product image"} className="w-20 h-20 object-cover rounded inline-block" />
                ))}
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
            <td className="pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black">{formatNumber(total_price, 3)}</td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.purchase ? "hidden" : "table-cell"} ${
                !printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(product.purchase_price, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.purchase ? "hidden" : "table-cell"} ${
                !printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(total_purchase, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.income ? "hidden" : "table-cell"} ${
                !printVisibleColumns.income ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(income_1pc, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.income ? "hidden" : "table-cell"} ${
                !printVisibleColumns.income ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(income_total, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.discount ? "hidden" : "table-cell"} ${
                !printVisibleColumns.discount ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(discount_1pc, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.discount ? "hidden" : "table-cell"} ${
                !printVisibleColumns.discount ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(total_discount, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.volume ? "hidden" : "table-cell"} ${
                !printVisibleColumns.volume ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(total_volume, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.weight ? "hidden" : "table-cell"} ${
                !printVisibleColumns.weight ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(total_weight, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.dimensions ? "hidden" : "table-cell"} ${
                !printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(total_length, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.dimensions ? "hidden" : "table-cell"} ${
                !printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(total_width, 3)}
            </td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.dimensions ? "hidden" : "table-cell"} ${
                !printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {formatNumber(total_height, 3)}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default Tbody;
