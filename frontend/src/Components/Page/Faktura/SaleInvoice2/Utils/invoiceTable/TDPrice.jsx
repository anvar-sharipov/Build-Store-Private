import { useFormikContext } from "formik";
import refreshTable from "./refreshTable";
import { formatNumber } from "../../../../../UI/formatNumber";

const TDPrice = ({ product, index, productInputRef, productPriceRefs }) => {
  const { values, setFieldValue, errors, setFieldTouched, validateField, touched } = useFormikContext();

  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value || "0");
    const fieldName = `products[${index}].selected_price`;

    const updatedProducts = values.products.map((p, idx) => {
      if (idx === index) {
        return { ...p, selected_price: newPrice };
      }
      return p;
    });

    setFieldTouched(fieldName, true);
    setFieldValue(fieldName, newPrice);
    setFieldValue("products", updatedProducts);

    setTimeout(() => {
      validateField(fieldName);
    }, 0);

    refreshTable({ ...values, products: updatedProducts }, setFieldValue, values.warehouses.id, false, "TDPrice");
  };

  const fieldName = `products[${index}].selected_price`;
  const showError = (touched.products?.[index]?.selected_price || product.selected_price !== undefined) && errors.products?.[index]?.selected_price;

  return (
    <td className="px-3 py-2 border border-black dark:border-gray-600">
      <div className="relative">
        <input
          ref={(el) => (productPriceRefs.current[product.id] = el)}
          tabIndex={0}
          disabled={values.disabled}
          type="number"
          step="0.001"
          min="0"
          className={`
            w-full px-3 border rounded-md transition-colors
            dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent print:hidden
            ${showError ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500" : "border-gray-300 hover:border-gray-400 dark:hover:border-gray-500"}
          `.trim()}
          value={product.selected_price || ""}
          onChange={handlePriceChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              productInputRef.current?.focus();
            }
          }}
        />
        <div className="hidden print:block font-semibold">{formatNumber(product.selected_price)}</div>
        {showError && <div className="absolute top-full left-0 mt-1 text-xs text-red-600 dark:text-red-400 font-medium z-10">{errors.products[index].selected_price}</div>}
      </div>
    </td>
  );
};

export default TDPrice;
