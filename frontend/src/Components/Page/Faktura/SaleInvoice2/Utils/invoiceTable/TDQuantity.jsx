import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatNumber } from "../../../../../UI/formatNumber";
import refreshTable from "./refreshTable";

const TDQuantity = ({ product, index, showNotification, productQuantityRefs }) => {
  const { values, setFieldValue, validateField, setFieldTouched, errors, touched } = useFormikContext();
  const { t } = useTranslation();

  const handleQuantityChange = async (e) => {
    const newQuantity = e.target.value;
    const fieldName = `products[${index}].selected_quantity`;
    
    // Обновляем продукты
    const updatedProducts = values.products.map((p, idx) => {
      if (idx === index) {
        return { ...p, selected_quantity: newQuantity };
      }
      return p;
    });

    // Обновляем Formik состояние
    await setFieldValue("products", updatedProducts, false);
    await setFieldValue(fieldName, newQuantity, false);

    // Помечаем поле как touched
    await setFieldTouched(fieldName, true, false);

    // Валидируем поле немедленно
    await validateField(fieldName);

    // Показываем уведомление о недостатке на складе
    if (parseFloat(product.quantity_on_selected_warehouses) < parseFloat(newQuantity) && newQuantity !== '') {
      showNotification(
        `${t("OnStock")} ${formatNumber(product.quantity_on_selected_warehouses)} ${t("pc")}`,
        "error"
      );
    }

    // Обновляем таблицу
    refreshTable(
      { ...values, products: updatedProducts }, 
      setFieldValue, 
      values.warehouses.id, 
      false, 
      "TDQuantity"
    );
  };

  const fieldName = `products[${index}].selected_quantity`;
  const hasError = touched.products?.[index]?.selected_quantity && errors.products?.[index]?.selected_quantity;

  return (
    <td>
      <input
        ref={(el) => (productQuantityRefs.current[product.id] = el)}
        tabIndex={0}
        className={`
          ${parseFloat(product.quantity_on_selected_warehouses) < parseFloat(product.selected_quantity) ? "bg-red-200" : ""}
          ${hasError ? "border-red-500" : ""}
        `.trim()}
        type="number"
        value={product.selected_quantity || ""}
        onChange={handleQuantityChange}
        onBlur={() => {
          // Дополнительная валидация при потере фокуса
          setFieldTouched(fieldName, true);
          validateField(fieldName);
        }}
      />

      {hasError && (
        <div className="text-red-400 text-sm relative">
          {errors.products[index].selected_quantity}
          {!errors.products[index].selected_quantity.includes("Минимум") && 
           !errors.products[index].selected_quantity.includes("Количество обязательно") && 
           <>: {formatNumber(product.quantity_on_selected_warehouses)}</>
          }
        </div>
      )}
    </td>
  );
};

export default TDQuantity;


// import { useFormikContext } from "formik";
// import { useTranslation } from "react-i18next";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { formatNumber } from "../../../../../UI/formatNumber";
// import refreshTable from "./refreshTable";

// const TDQuantity = ({ product, index, showNotification, productQuantityRefs }) => {
//   const { values, setFieldValue, validateField, setFieldTouched, errors } = useFormikContext();
//   const { t } = useTranslation();

//   return (
//     <td>
//       <input
//         ref={(el) => (productQuantityRefs.current[product.id] = el)}
//         tabIndex={0}
//         className={parseFloat(product.quantity_on_selected_warehouses) < parseFloat(product.selected_quantity) ? "bg-red-200" : ""}
//         type="number"
//         // value={product.selected_quantity?.toString().replace(/^0+(?=\d)/, "") || "0"}
//         value={product.selected_quantity}
//         onChange={async (e) => {
//         //   console.log("tut");

//           const newQuantity = e.target.value;
//           const updatedProducts = values.products.map((p, idx) => {
//             if (idx === index) {
//               return { ...p, selected_quantity: newQuantity };
//             }
//             return p;
//           });

//           setFieldValue("products", updatedProducts);

//           // Помечаем поле как touched, чтобы ошибки показывались, ( говорит Formik, что поле "трогали", и ошибки можно показывать)
//           setFieldTouched(`products[${index}].selected_quantity`, true, false);

//           // Валидируем поле сразу же (запускает валидацию конкретного поля немедленно)
//           await validateField(`products[${index}].selected_quantity`);

//           refreshTable({ ...values, products: updatedProducts }, setFieldValue, values.warehouses.id, false, "TDQuantity");
//         }}
//       />

//       {errors.products?.[index]?.selected_quantity && (
//         <div className="text-red-400 text-sm relative">
//           {errors.products[index].selected_quantity}
//           {!errors.products[index].selected_quantity.includes("Минимум") && !errors.products[index].selected_quantity.includes("Количество обязательно") && <>: {formatNumber(product.quantity_on_selected_warehouses)}</>}
//         </div>
//       )}
//     </td>
//   );
// };

// export default TDQuantity;
