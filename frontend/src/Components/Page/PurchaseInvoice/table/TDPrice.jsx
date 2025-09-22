import { useTranslation } from "react-i18next";
import { forwardRef, useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { formatNumber } from "../../../UI/formatNumber";

const TDPrice = forwardRef(({ product, onFocusPriceRow, onBlurPriceRow, setFocusedPriceRow, setFocusedQuantityRow, refs }, ref) => {
  const { values, setFieldValue } = useFormikContext();
  const productIndex = values.products.findIndex((p) => p.id === product.id);
  const [localError, setLocalError] = useState("");
  const { t } = useTranslation();

  // Авто-подстановка selected_price при смене type_price или продуктов
  useEffect(() => {
    if (productIndex === -1) return;

    const typePrice = values.type_price;
    const price = typePrice === "retail_price" ? product.retail_price : product.wholesale_price;

    const currentProduct = values.products[productIndex];
    if (!currentProduct) return;

    // если кастомная цена — оставляем как есть

    if (!currentProduct?.is_custom_price) {
      if (currentProduct.is_gift) {
        setFieldValue(`products[${productIndex}].selected_price`, 0);
      } else {
        setFieldValue(`products[${productIndex}].selected_price`, price || 0);
      }
    }
  }, [values.type_price, values.products[productIndex]?.selected_quantity]);

  const handleKeyNavigation = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      refs.productRef.current?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      // Находим индекс текущего продукта
      const currentIndex = values.products.findIndex((p) => p.id === product.id);

      if (currentIndex > 0) {
        // Есть продукт выше - фокусируемся на нем
        const prevProductId = values.products[currentIndex - 1].id;
        refs.priceRefs.current[prevProductId]?.focus();
        refs.priceRefs.current[prevProductId]?.select();
      } else {
        // Нет продукта выше - идем в поле поиска продуктов
        refs.productRef.current?.focus();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();

      // Находим индекс текущего продукта
      const currentIndex = values.products.findIndex((p) => p.id === product.id);

      if (currentIndex < values.products.length - 1) {
        // Есть продукт ниже - фокусируемся на нем
        const nextProductId = values.products[currentIndex + 1].id;
        refs.priceRefs.current[nextProductId]?.focus();
        refs.priceRefs.current[nextProductId]?.select();
      }
      // Если это последний продукт, остаемся на месте (или можно добавить другую логику)
    } else if (e.key === "ArrowLeft" && e.target.selectionStart === 0) {
      e.preventDefault();
      refs.quantityRefs.current[product.id]?.focus();
      refs.quantityRefs.current[product.id]?.select();
    }
  };
  // console.log("ssfsfsfsf", values.products[productIndex]);

  return (
    <td className={`p-0 m-0 text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  print:!text-black print:!border-black text-center`}>
      <input
        ref={ref} // сюда приходит ref из родителя
        type="text"
        inputMode="decimal" // для мобильных клавиатур с цифрами
        className={`my-1 dark:bg-gray-900 w-[90%] ${product.is_custom_price ? "bg-green-300 dark:bg-green-900" : "bg-white dark:bg-gray-900"} print:hidden`}
        value={values.products[productIndex]?.selected_price ?? ""}
        onFocus={() => {
          onFocusPriceRow(); // родительская функция
          setFocusedPriceRow(product.id);
          setFocusedQuantityRow(null); // убрать подсветку quantity
        }}
        onBlur={() => {
          onBlurPriceRow();
          setFocusedPriceRow(null);
        }}
        onChange={(e) => {
          const rawValue = e.target.value;
          const normalizedValue = rawValue.replace(",", ".");
          const isNumber = !isNaN(normalizedValue) && normalizedValue.trim() !== "";
          if (!isNumber) {
            setLocalError(`${t("amount must be a digit")}`);
            setFieldValue("send", false);
          } else {
            setLocalError("");
            setFieldValue("send", true);
          }
          setFieldValue(`products[${productIndex}].selected_price`, e.target.value);
          setFieldValue(`products[${productIndex}].is_custom_price`, true);
        }}
        onKeyDown={handleKeyNavigation}
      />
      <div className="hidden print:block">{formatNumber(values.products[productIndex]?.selected_price, 3)}</div>
      {localError && <div className="text-red-500 text-xs print:hidden">{localError}</div>}
    </td>
  );
});

export default TDPrice;
