import { forwardRef, useEffect } from "react";
import { useFormikContext } from "formik";
import { formatNumber } from "../../../UI/formatNumber";

const TDPrice = forwardRef(({ product, onFocusPriceRow, onBlurPriceRow, setFocusedPriceRow, setFocusedQuantityRow, refs }, ref) => {
  const { values, setFieldValue } = useFormikContext();
  const productIndex = values.products.findIndex((p) => p.id === product.id);

  // Авто-подстановка selected_price при смене type_price или продуктов
  useEffect(() => {
    if (productIndex === -1) return;

    const typePrice = values.type_price;
    const price = typePrice === "retail_price" ? product.retail_price : product.wholesale_price;

    setFieldValue(`products[${productIndex}].selected_price`, price || 0);

    // Пересчет total_selected_price
    const totalSelected = values.products.reduce((sum, p) => {
      return sum + Number(p.selected_price || 0) * Number(p.selected_quantity || 0);
    }, 0);
    setFieldValue("total_selected_price", totalSelected);
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
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      refs.quantityRefs.current[product.id]?.focus();
      refs.quantityRefs.current[product.id]?.select();
    }
  };


  return (
    <td className="p-0 m-0 text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  print:!text-black print:!border-black text-center">
      <input
        ref={ref} // сюда приходит ref из родителя
        type="text"
        className="my-1 dark:bg-gray-900 w-[90%]"
        value={values.products[productIndex]?.selected_price || ""}
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
          // Найти индекс продукта в массиве для правильного setFieldValue
          setFieldValue(`products[${productIndex}].selected_price`, e.target.value);
        }}
        onKeyDown={handleKeyNavigation}
      />
    </td>
  );
});

export default TDPrice;
