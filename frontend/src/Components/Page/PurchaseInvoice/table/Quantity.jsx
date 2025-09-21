import { useFormikContext } from "formik";
import { forwardRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../UI/formatNumber";

const Quantity = forwardRef(({ product, onFocusQuantityRow, onBlurQuantityRow, setFocusedQuantityRow, setFocusedPriceRow, refs }, ref) => {
  const { values, setFieldValue } = useFormikContext();
  const { t } = useTranslation();
  const [localError, setLocalError] = useState("");
  const [localValue, setLocalValue] = useState(product.selected_quantity?.toString() || "");

  const productIndex = values.products.findIndex((p) => p.id === product.id);

  // useEffect(() => {
  //   if (Number(product.selected_quantity) > (product.quantity_on_selected_warehouses || 0)) {
  //     setLocalError(`${t("OnStock")} ${product.quantity_on_selected_warehouses}`);
  //     setFieldValue("send", false);
  //   }
  //   // else if (!Number(product.selected_quantity) || Number(Number(product.selected_quantity)) === 0) {
  //   //   setLocalError(`${t("CannotBeZero")}`);
  //   //   setFieldValue("send", false);
  //   // }
  //    else {
  //     setLocalError("");
  //     setFieldValue("send", true);
  //   }
  // }, [product.selected_quantity, product.quantity_on_selected_warehouses, setFieldValue]);

  const handleKeyNavigation = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      refs.productRef.current?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      // Находим индекс текущего продукта
      // const currentIndex = values.products.findIndex((p) => p.id === product.id);

      if (productIndex > 0) {
        // Есть продукт выше - фокусируемся на нем
        const prevProductId = values.products[productIndex - 1].id;
        refs.quantityRefs.current[prevProductId]?.focus();
        refs.quantityRefs.current[prevProductId]?.select();
      } else {
        // Нет продукта выше - идем в поле поиска продуктов
        refs.productRef.current?.focus();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();

      // Находим индекс текущего продукта
      // const currentIndex = values.products.findIndex((p) => p.id === product.id);

      if (productIndex < values.products.length - 1) {
        // Есть продукт ниже - фокусируемся на нем
        const nextProductId = values.products[productIndex + 1].id;
        refs.quantityRefs.current[nextProductId]?.focus();
        refs.quantityRefs.current[nextProductId]?.select();
      }
      // Если это последний продукт, остаемся на месте (или можно добавить другую логику)
    } else if (e.key === "ArrowRight" && e.target.selectionStart === e.target.value.length) {
      e.preventDefault();
      refs.priceRefs.current[product.id]?.focus();
      refs.priceRefs.current[product.id]?.select();
    }
  };

  return (
    <td className="p-0 m-0 text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  print:!text-black print:!border-black text-center">
      <input
        ref={ref} // сюда приходит ref из родителя
        type="text"
        inputMode="decimal" // для мобильных клавиатур с цифрами
        className="my-1 dark:bg-gray-900 w-[90%] print:hidden"
        value={localValue}
        onFocus={() => {
          onFocusQuantityRow(); // родительская функция
          setFocusedQuantityRow(product.id);
          setFocusedPriceRow(null); // убрать подсветку price
        }}
        onBlur={() => {
          onBlurQuantityRow();
          setFocusedQuantityRow(null);
        }}
        // onChange={(e) => handleChangeQuantity(e.target.value)}
        onChange={(e) => {
          const rawValue = e.target.value;
          setLocalValue(rawValue); // всегда пишем то, что набрал пользователь

          const normalizedValue = rawValue.replace(",", ".");
          const isNumber = !isNaN(normalizedValue) && normalizedValue.trim() !== "";

          if (!isNumber) {
            setLocalError(`${t("amount must be a digit")}`);
            setFieldValue("send", false);
          } else {
            setLocalError("");
            setFieldValue("send", true);
            setFieldValue(`products[${productIndex}].selected_quantity`, parseFloat(normalizedValue));
          }
        }}
        onKeyDown={handleKeyNavigation}
      />
      <div className="hidden print:block">{formatNumber(localValue, 3)}</div>
      {localError && <div className="text-red-500 text-xs print:hidden">{localError}</div>}
    </td>
  );
});

export default Quantity;
