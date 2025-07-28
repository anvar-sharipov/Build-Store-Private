import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef } from "react";
import { formatNumber } from "../../../../../UI/formatNumber";
import refreshTable from "./refreshTable";

const TDQuantity = ({ product, index, showNotification, productQuantityRefs }) => {
  const { values, setFieldValue } = useFormikContext();
  const { t } = useTranslation();
  const debounceRef = useRef(null);

  // Debounced функция для обновления таблицы
  const debouncedRefreshTable = useCallback(
    (updatedValues) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        refreshTable(updatedValues, setFieldValue, values.warehouses.id, false, "TDQuantity");
      }, 0); // 500ms задержка
    },
    [setFieldValue, values.warehouses.id]
  );

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <td>
      <input
        ref={(el) => (productQuantityRefs.current[product.id] = el)}
        tabIndex={0}
        className={parseFloat(product.quantity_on_selected_warehouses) < parseFloat(product.selected_quantity) ? "bg-red-200" : "bg-green-200"}
        type="number"
        value={product.selected_quantity?.toString().replace(/^0+(?=\d)/, "") || "0"}
        onChange={(e) => {
          const newQuantity = e.target.value || 0;
          const updatedProducts = values.products.map((p, idx) => {
            if (idx === index) {
              if (parseFloat(p.quantity_on_selected_warehouses) < parseFloat(newQuantity)) {
                showNotification(`${t("OnStock")} ${formatNumber(p.quantity_on_selected_warehouses)} ${t("pc")}`, "error");
              }
              return { ...p, selected_quantity: newQuantity };
            }
            return p;
          });

          setFieldValue("products", updatedProducts);

          // Вызываем debounced функцию
          debouncedRefreshTable({
            ...values,
            products: updatedProducts,
          });
        }}
      />
    </td>
  );
};

export default TDQuantity;
