import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../../../UI/formatNumber";
import QRDisplay from "../../../../../UI/QRDisplay";
import TDQuantity from "./TDQuantity";
import TDPrice from "./TDPrice";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const td1 = "px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600 print:px-1 print:py-0.5 print:!text-black";

const TDProducts = ({ handleDeleteProduct, visibleColumns, printVisibleColumns, showNotification, productQuantityRefs, productListRefs, productInputRef, productPriceRefs, id }) => {
  const { values } = useFormikContext();
  const { t } = useTranslation();

  return (
    <>
      {values.products.map((product, index) => {
        const total = parseFloat(product.selected_quantity) * parseFloat(product.selected_price) || 0;
        const total_purchase = parseFloat(product.selected_quantity) * parseFloat(product.purchase_price) || 0;
        const total_profit = total - total_purchase;

        const discount = parseFloat(product.selected_price) - parseFloat(product.wholesale_price);
        const discount_total = discount * parseFloat(product.selected_quantity);

        // weight volume length width height
        const total_weight = product.selected_quantity * product.weight;
        const total_volume = product.selected_quantity * product.volume;
        const total_length = product.selected_quantity * product.length;
        const total_width = product.selected_quantity * product.width;
        const total_height = product.selected_quantity * product.height;

        return (
          <tr key={product.id} ref={(el) => (productListRefs.current[product.id] = el)} tabIndex={0} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td className={td1}>{index + 1}</td>
            <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 text-left border border-gray-300 dark:border-gray-600 print:px-1 print:py-0.5 print:text-[14px] print:!text-black">
              {product.name}
            </td>

            <td
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 print:px-1 print:py-0.5 print:!text-black text-center ${visibleColumns.image ? "table-cell" : "hidden"} ${
                printVisibleColumns.image ? "print:table-cell" : "print:hidden"
              }`}
            >
              {product.images.length > 0 &&
                (id ? (
                  <img src={`${product.images[0].image}`} alt={product.images[0].alt_text || "Product image"} className="w-24 h-24 object-cover rounded inline-block" />
                ) : (
                  <img src={`${BASE_URL}${product.images[0].image}`} alt={product.images[0].alt_text || "Product image"} className="w-24 h-24 object-cover rounded inline-block" />
                ))}
            </td>

            <td
              className={`px-3 py-2 border border-gray-300 dark:border-gray-600 print:px-1 print:py-0.5 print:!text-black text-center ${visibleColumns.qr_code ? "table-cell" : "hidden"} ${
                printVisibleColumns.qr_code ? "print:table-cell" : "print:hidden"
              }`}
            >
              <QRDisplay code={product.qr_code} mySize={44} myClass="flex items-center justify-center w-20 h-20 inline-block" />
            </td>

            <TDQuantity product={product} index={index} productQuantityRefs={productQuantityRefs} productInputRef={productInputRef} productPriceRefs={productPriceRefs} />
            <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-left border border-gray-300 dark:border-gray-600 print:px-1 print:py-0.5 print:!text-black">
              {product.unit_name_on_selected_warehouses}
            </td>
            <TDPrice product={product} index={index} productPriceRefs={productPriceRefs} productInputRef={productInputRef} />
            <td className={td1}>{formatNumber(total)}</td>

            <td className={`${td1} ${visibleColumns.purchase ? "table-cell" : "hidden"} ${printVisibleColumns.purchase ? "print:table-cell" : "print:hidden"}`}>
              {formatNumber(product.purchase_price)}
            </td>
            <td className={`${td1} ${visibleColumns.purchase ? "table-cell" : "hidden"} ${printVisibleColumns.purchase ? "print:table-cell" : "print:hidden"}`}>{formatNumber(total_purchase)}</td>

            <td className={`${td1} ${visibleColumns.income ? "table-cell" : "hidden"} ${printVisibleColumns.income ? "print:table-cell" : "print:hidden"}`}>
              {formatNumber(product.selected_price - product.purchase_price)}
            </td>
            <td className={`${td1} ${visibleColumns.income ? "table-cell" : "hidden"} ${printVisibleColumns.income ? "print:table-cell" : "print:hidden"}`}>{formatNumber(total_profit)}</td>

            <td className={`${td1} ${visibleColumns.discount ? "table-cell" : "hidden"} ${printVisibleColumns.discount ? "print:table-cell" : "print:hidden"}`}>{formatNumber(discount)}</td>
            <td className={`${td1} ${visibleColumns.discount ? "table-cell" : "hidden"} ${printVisibleColumns.discount ? "print:table-cell" : "print:hidden"}`}>{formatNumber(discount_total)}</td>

            <td className={`${td1} ${visibleColumns.volume ? "table-cell" : "hidden"} ${printVisibleColumns.volume ? "print:table-cell" : "print:hidden"}`}>{formatNumber(total_volume, 3)}</td>
            <td className={`${td1} ${visibleColumns.weight ? "table-cell" : "hidden"} ${printVisibleColumns.weight ? "print:table-cell" : "print:hidden"}`}>{formatNumber(total_weight)}</td>

            <td className={`${td1} ${visibleColumns.dimensions ? "table-cell" : "hidden"} ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}>{formatNumber(total_length)}</td>
            <td className={`${td1} ${visibleColumns.dimensions ? "table-cell" : "hidden"} ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}>{formatNumber(total_width)}</td>
            <td className={`${td1} ${visibleColumns.dimensions ? "table-cell" : "hidden"} ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}>{formatNumber(total_height)}</td>
            {!values.disabled && (
              <td className={`${td1} print:hidden`}>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(product.id, index)}
                  className="inline-flex items-center justify-center w-7 h-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors group"
                  title="Удалить товар"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            )}
          </tr>
        );
      })}
    </>
  );
};

export default TDProducts;
