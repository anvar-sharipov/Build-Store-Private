import { useFormikContext } from "formik";
import { useCallback, useEffect, useRef } from "react";
import refreshTable from "./refreshTable";

const TDPrice = ({ product, index }) => {
  const { values, setFieldValue } = useFormikContext();
  const debounceRef = useRef(null);

  // Debounced функция для пересчета итогов (если нужно)
  const debouncedCalculateTotals = useCallback(
    (updatedProducts) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        // Здесь можно добавить логику для пересчета итоговых сумм
        // Например, обновление total_amount или других вычисляемых полей
        console.log("Пересчет итогов...", updatedProducts);
      }, 300); // Уменьшенная задержка для лучшего UX
    },
    [] // Убираем зависимости, так как функция не использует внешние переменные
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
        type="number"
        step="0.01" // Добавляем step для десятичных чисел
        min="0" // Минимальное значение
        value={product.selected_price}
        // value={
        //   values.priceType === "wholesale"
        //     ? product.wholesale_price?.toString().replace(/^0+(?=\d)/, "") || "0"
        //     : product.retail_price?.toString().replace(/^0+(?=\d)/, "") || "0"
        // }
        onChange={(e) => {
          const newPrice = e.target.value || "0";
          const updatedProducts = values.products.map((p, idx) => {
            if (idx === index) {
                return { ...p, selected_price: newPrice };
            //   if (values.priceType === "wholesale") {
            //     return { ...p, wholesale_price: newPrice };
            //   } else {
            //     return { ...p, retail_price: newPrice };
            //   }
            }
            return p;
          });

          setFieldValue("products", updatedProducts);
          refreshTable({...values, products: updatedProducts}, setFieldValue, values.warehouses.id, false, "TDPrice")

          // Вызываем debounced функцию для пересчета итогов (если нужно)
          debouncedCalculateTotals(updatedProducts);
        }}
      />
    </td>
  );
};

export default TDPrice;