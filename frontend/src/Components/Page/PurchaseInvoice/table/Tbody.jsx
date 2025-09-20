import { useFormikContext } from "formik";
import QRDisplay from "../../../UI/QRDisplay";
import { formatNumber } from "../../../UI/formatNumber";
import Quantity from "./Quantity";
import { useState, useRef, useEffect } from "react";
import TDPrice from "./TDPrice";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Tbody = ({ id, printVisibleColumns, visibleColumns, refs }) => {
  const { values, setFieldValue, touched, errors } = useFormikContext();
  const [focusedQuantityRow, setFocusedQuantityRow] = useState(null);
  const [focusedPriceRow, setFocusedPriceRow] = useState(null);

  //   useEffect(() => {
  //     if (values.products.length === 0) return;

  //     const lastProduct = values.products[values.products.length - 1];
  //     const inputEl = quantityRefs.current[lastProduct.id];
  //     console.log('lastProduct',lastProduct);
  //     console.log('inputEl',inputEl);

  //     if (inputEl) {
  //       inputEl.focus();
  //       inputEl.select(); // если нужно сразу выделить текст
  //     }
  //   }, [values.products]);

  return (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {values.products.map((product, idx) => {
        return (
          <tr
            key={product.id}
            tabIndex={0}
            className={`focus:bg-indigo-200 dark:focus:bg-indigo-500 transition-colors ${focusedQuantityRow  === product.id || focusedPriceRow === product.id ? "bg-indigo-200 dark:bg-indigo-500" : "bg-white dark:bg-gray-900"}`}
          >
            <td className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black`}>{idx + 1}</td>
            <td className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black`}>{product.name}</td>

            <td
              className={`text-center text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.image ? "hidden" : ""} ${
                !printVisibleColumns.image ? "print:hidden" : ""
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
              className={`text-center mx-auto text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.qr_code ? "hidden" : ""} ${
                !printVisibleColumns.qr_code ? "print:hidden" : ""
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
              setFocusedPriceRow={setFocusedPriceRow }
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
            <td className="pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black"></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.purchase ? "hidden" : ""} ${
                !printVisibleColumns.purchase ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.purchase ? "hidden" : ""} ${
                !printVisibleColumns.purchase ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.income ? "hidden" : ""} ${
                !printVisibleColumns.income ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.income ? "hidden" : ""} ${
                !printVisibleColumns.income ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.discount ? "hidden" : ""} ${
                !printVisibleColumns.discount ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.discount ? "hidden" : ""} ${
                !printVisibleColumns.discount ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.volume ? "hidden" : ""} ${
                !printVisibleColumns.volume ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.weight ? "hidden" : ""} ${
                !printVisibleColumns.weight ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.dimensions ? "hidden" : ""} ${
                !printVisibleColumns.dimensions ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.dimensions ? "hidden" : ""} ${
                !printVisibleColumns.dimensions ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
            <td
              className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.dimensions ? "hidden" : ""} ${
                !printVisibleColumns.dimensions ? "print:hidden" : ""
              } print:!text-black print:!border-black`}
            ></td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default Tbody;
