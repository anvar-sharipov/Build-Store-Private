import { formatNumber } from "../../../../../UI/formatNumber";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import TDQuantity from "./TDQuantity";
import TDPrice from "./TDPrice";
import THead from "./THead";
import refreshTable from "./refreshTable";

const InvoiceTable = ({ showNotification, productListRefs, productQuantityRefs, productPriceRefs, productInputRef }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, validateField, setFieldTouched, errors } = useFormikContext();
  const handleDeleteProduct = (id) => {
    const newProducts = values.products.filter((p) => p.id !== id);
    setFieldValue("products", newProducts);
    refreshTable({ ...values, products: newProducts }, setFieldValue, values.warehouses.id, false, "deleteProduct");
  };

  const handleDeleteGift = (id) => {
    const newProducts = values.gifts.filter((p) => p.id !== id);
    setFieldValue("gifts", newProducts);
    // refreshTable({ ...values, products: newProducts }, setFieldValue, values.warehouses.id, false, "deleteProduct");
  };

  return (
    <div className="overflow-x-auto">
      {values.products.length > 0 && (
        <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600">
          <THead />
          <tbody>
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
                <tr
                  key={product.id}
                  ref={(el) => (productListRefs.current[product.id] = el)}
                  tabIndex={0}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 font-medium border border-gray-300 dark:border-gray-600">
                    {product.name}
                  </td>
                  <TDQuantity
                    product={product}
                    index={index}
                    showNotification={showNotification}
                    productQuantityRefs={productQuantityRefs}
                    productListRefs={productListRefs}
                    productInputRef={productInputRef}
                  />
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center border border-gray-300 dark:border-gray-600">
                    {product.unit_name_on_selected_warehouses}
                  </td>
                  <TDPrice product={product} index={index} productPriceRefs={productPriceRefs} />
                  <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total)}
                  </td>

                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(product.purchase_price)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_purchase)}
                  </td>

                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(product.selected_price - product.purchase_price)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_profit)}
                  </td>

                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(discount)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(discount_total)}
                  </td>

                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_volume, 3)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_weight)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_length)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_width)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_height)}
                  </td>

                  <td className="px-2 py-3 text-center border border-gray-300 dark:border-gray-600">
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
                </tr>
              );
            })}

            {values.gifts.map((product, index) => {
              // weight volume length width height
              const total_weight = product.selected_quantity * product.weight;
              const total_volume = product.selected_quantity * product.volume;
              const total_length = product.selected_quantity * product.length;
              const total_width = product.selected_quantity * product.width;
              const total_height = product.selected_quantity * product.height;

              return (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-green-50 dark:bg-green-900/20">
                  <td className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                    {index + 1 + values.products.length}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-medium border border-gray-300 dark:border-gray-600">
                    <span className="inline-flex items-center">
                      {product.name}
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full">
                        Gift
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                    <div>
                      {formatNumber(product.selected_quantity)}
                      {parseFloat(product.quantity_on_selected_warehouses) < parseFloat(product.selected_quantity) && (
                        <div className="text-red-500 text-xs mt-1 font-medium">
                          {t("OnStock")}: {formatNumber(product.quantity_on_selected_warehouses)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center border border-gray-300 dark:border-gray-600">
                    {product.unit_name_on_selected_warehouses}
                  </td>
                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-600"></td>
                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-600"></td>

                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-600"></td>
                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-600"></td>

                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-600"></td>
                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-600"></td>

                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-600"></td>
                  <td className="px-3 py-2 border border-gray-300 dark:border-gray-600"></td>

                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_volume, 3)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_weight)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_length)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_width)}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                    {formatNumber(total_height)}
                  </td>

                  <td className="px-2 py-3 text-center border border-gray-300 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => handleDeleteGift(product.id, index)}
                      className="inline-flex items-center justify-center w-7 h-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title="Удалить подарок"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <td className="px-4 py-4 border border-gray-300 dark:border-gray-600"></td>
              <td className="px-4 py-4 border border-gray-300 dark:border-gray-600"></td>
              <td className="px-4 py-4 border border-gray-300 dark:border-gray-600"></td>
              <td className="px-4 py-4 border border-gray-300 dark:border-gray-600"></td>
              <td className="px-4 py-4 text-sm font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                Итого:
              </td>

              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalPrice)}
              </td>

              <td className="px-4 py-4 border border-gray-300 dark:border-gray-600"></td>
              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalPricePurchae)}
              </td>

              <td className="px-4 py-4 border border-gray-300 dark:border-gray-600"></td>
              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalPriceProfit)}
              </td>

              <td className="px-4 py-4 border border-gray-300 dark:border-gray-600"></td>
              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalPriceDiscount)}
              </td>

              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalVolume, 3)}
              </td>
              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalWeight)}
              </td>
              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalLength)}
              </td>
              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalWidth)}
              </td>
              <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 text-right border border-gray-300 dark:border-gray-600">
                {formatNumber(values.footerTotalHeight)}
              </td>

              <td className="px-4 py-4 border border-gray-300 dark:border-gray-600"></td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default InvoiceTable;
