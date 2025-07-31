import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../../../UI/formatNumber";
import refreshTable from "./refreshTable";

const TDQuantity = ({ product, index, productQuantityRefs, productInputRef }) => {
  const { values, setFieldValue, validateField, setFieldTouched, errors, touched } = useFormikContext();
  const { t } = useTranslation();

  const handleQuantityChange = async (e) => {
    const newQuantity = e.target.value;
    const fieldName = `products[${index}].selected_quantity`;

    const updatedProducts = values.products.map((p, idx) => {
      if (idx === index) {
        return { ...p, selected_quantity: newQuantity };
      }
      return p;
    });

    await setFieldValue("products", updatedProducts, false);
    await setFieldValue(fieldName, newQuantity, false);
    await setFieldTouched(fieldName, true, false);
    await validateField(fieldName);

    refreshTable({ ...values, products: updatedProducts }, setFieldValue, values.warehouses.id, false, "TDQuantity");
  };

  const fieldName = `products[${index}].selected_quantity`;
  const hasError = touched.products?.[index]?.selected_quantity && errors.products?.[index]?.selected_quantity;
  const hasLowStock = parseFloat(product.quantity_on_selected_warehouses) < parseFloat(product.selected_quantity);

  return (
    <td className="px-3 py-2 border border-gray-300 dark:border-gray-600">
      <div className="relative">
        <input
          ref={(el) => (productQuantityRefs.current[product.id] = el)}
          tabIndex={0}
          className={`
            w-full px-3 border rounded-md transition-colors
            dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent print:hidden
            ${hasLowStock && !hasError ? "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-600" : ""}
            ${hasError ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500" : "border-gray-300"}
            ${!hasError && !hasLowStock ? "hover:border-gray-400 dark:hover:border-gray-500" : ""}
          `.trim()}
          type="number"
          min="0"
          step="0.001"
          value={product.selected_quantity || ""}
          onChange={handleQuantityChange}
          onBlur={() => {
            setFieldTouched(fieldName, true);
            validateField(fieldName);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              productInputRef.current?.focus();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              if (index === 0) {
                productInputRef.current?.focus();
                productInputRef.current?.select();
              } else {
                const prevProduct = values.products[index - 1];
                const prevInput = productQuantityRefs.current[prevProduct.id];
                if (prevInput) {
                  prevInput.focus();
                  prevInput.select(); // если хочешь выделить текст
                }
              }
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const nextProduct = values.products[index + 1];
              if (nextProduct) {
                const nextInput = productQuantityRefs.current[nextProduct.id];
                if (nextInput) {
                  nextInput.focus();
                  nextInput.select(); // если хочешь выделить текст
                }
              }
            }
          }}
        />

        <div className="hidden print:block font-semibold">{formatNumber(product.selected_quantity)}</div>

        {hasError && (
          <div className="absolute top-full left-0 text-xs text-red-600 dark:text-red-400 font-medium z-10">
            {errors.products[index].selected_quantity}
            {!errors.products[index].selected_quantity.includes("Минимум") &&
              !errors.products[index].selected_quantity.includes("Количество обязательно") && (
                <>: {formatNumber(product.quantity_on_selected_warehouses)}</>
              )}
          </div>
        )}

        {hasLowStock && !hasError && (
          <div className="absolute top-full left-0 text-xs text-amber-600 dark:text-amber-400 font-medium z-10">
            {t("OnStock")}: {formatNumber(product.quantity_on_selected_warehouses)}
          </div>
        )}
      </div>
    </td>
  );
};

export default TDQuantity;
