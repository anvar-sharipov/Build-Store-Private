import { useFormikContext } from "formik";
import refreshTable from "./refreshTable";

const TDPrice = ({ product, index }) => {
  const { values, setFieldValue, errors, setFieldTouched, validateField, touched } = useFormikContext();

  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value || "0");
    const fieldName = `products[${index}].selected_price`;
    
    // Обновляем продукты
    const updatedProducts = values.products.map((p, idx) => {
      if (idx === index) {
        return { ...p, selected_price: newPrice };
      }
      return p;
    });

    // Устанавливаем поле как touched и обновляем значение
    setFieldTouched(fieldName, true);
    setFieldValue(fieldName, newPrice);
    setFieldValue("products", updatedProducts);
    
    // Запускаем валидацию немедленно
    setTimeout(() => {
      validateField(fieldName);
    }, 0);
    
    // Обновляем таблицу
    refreshTable(
      { ...values, products: updatedProducts }, 
      setFieldValue, 
      values.warehouses.id, 
      false, 
      "TDPrice"
    );
  };

  const fieldName = `products[${index}].selected_price`;
  const showError = (touched.products?.[index]?.selected_price || product.selected_price !== undefined) && 
                   errors.products?.[index]?.selected_price;

  return (
    <td>
      <input
        type="number"
        step="0.001"
        min="0"
        className={`dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-400 border-gray-300 rounded focus:ring-blue-500 ${showError ? "border-red-500 bg-red-50" : ""}`}
        value={product.selected_price || ""}
        onChange={handlePriceChange}
      />
      {showError && (
        <div className="text-red-400 text-sm mt-1">
          {errors.products[index].selected_price}
        </div>
      )}
    </td>
  );
};

export default TDPrice;