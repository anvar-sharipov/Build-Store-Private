import { useTranslation } from "react-i18next";
import { forwardRef, useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { formatNumber } from "../../../UI/formatNumber";
import { formatNumber2 } from "../../../UI/formatNumber2";

const TDPrice = forwardRef(({ product, index, onFocusPriceRow, onBlurPriceRow, setFocusedPriceRow, setFocusedQuantityRow, refs }, ref) => {
  const { values, setFieldValue } = useFormikContext();
  // const productIndex = values.products.findIndex((p) => p.id === product.id);
  const productIndex = index;
  const [localError, setLocalError] = useState("");
  const { t } = useTranslation();

  // Авто-подстановка selected_price при смене type_price или продуктов
  useEffect(() => {
    if (productIndex === -1) return;

    const typePrice = values.type_price;
    const price = typePrice === "retail_price" ? product.retail_price : product.wholesale_price;

    const currentProduct = values.products[productIndex];
    if (!currentProduct) return;

    // 🔴 если есть скидка — не трогаем цену
    if (currentProduct.discount_percent > 0) return;

    // если кастомная цена — оставляем как есть

    if (!currentProduct?.is_custom_price) {
      if (currentProduct.is_gift) {
        setFieldValue(`products[${productIndex}].selected_price`, 0);
      } else {
        setFieldValue(`products[${productIndex}].selected_price`, price || 0);
      }
    }
    // }, [values.type_price, values.products[productIndex]?.selected_quantity]);
  }, [values.type_price]);

  const handleKeyNavigation = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      refs.productRef.current?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      // Находим индекс текущего продукта
      // const currentIndex = values.products.findIndex((p) => p.id === product.id);
      const currentIndex = productIndex;

      if (currentIndex > 0) {
        // Есть продукт выше - фокусируемся на нем
        // const prevProductId = values.products[currentIndex - 1].id;
        // refs.priceRefs.current[prevProductId]?.focus();
        // refs.priceRefs.current[prevProductId]?.select();
        refs.priceRefs.current[currentIndex - 1]?.focus();
        refs.priceRefs.current[currentIndex - 1]?.select();
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
        // const nextProductId = values.products[currentIndex + 1].id;
        // refs.priceRefs.current[nextProductId]?.focus();
        // refs.priceRefs.current[nextProductId]?.select();
        refs.priceRefs.current[currentIndex + 1]?.focus();
        refs.priceRefs.current[currentIndex + 1]?.select();
      }
      // Если это последний продукт, остаемся на месте (или можно добавить другую логику)
    } else if (e.key === "ArrowLeft" && e.target.selectionStart === 0) {
      e.preventDefault();
      // refs.quantityRefs.current[product.id]?.focus();
      // refs.quantityRefs.current[product.id]?.select();
      refs.quantityRefs.current[productIndex]?.focus();
      refs.quantityRefs.current[productIndex]?.select();
    }
  };
  // console.log("ssfsfsfsf", values.products[productIndex]);
  // console.log("product.price_after_discount IIIIIIIIIII", product.price_after_discount);
  // console.log("product.selected_price IIIIIIIIIII", product.selected_price);
  // console.log("product.discount_price IIIIIIIIIII", values.products[productIndex].discount_percent);

  // let price = values.products[productIndex]?.selected_price ?? "";
  // if (Number(product.price_after_discount) < Number(product.selected_price)) {
  // price = values.products[productIndex]?.price_after_discount ?? "";
  // }

  const price = values.products[productIndex]?.selected_price ?? "";
  // console.log("price UU", price);

  // console.log("values.products[index].is_custom_price", values.products[index].is_custom_price);

  return (
    <td className={`p-0 m-0 text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  print:!text-black print:!border-black text-center font-mono tabular-nums`}>
      <div>
        {/* {Number(product.price_after_discount) < Number(product.selected_price) ? (
          <div className="flex flex-col">
            {values.type_price === "wholesale_price" ? (
              <div className={`${product.discount_percent > 0 ? "line-through text-gray-400 text-xs" : "text-sm"}`}>{formatNumber2(product.wholesale_price, 3)}</div>
            ) : (
              <div className={`${product.discount_percent > 0 ? "line-through text-gray-400 text-xs" : "text-sm"}`}>{formatNumber2(product.retail_price, 3)}</div>
            )}

            <div className="text-sm font-semibold">{formatNumber2(product.price_after_discount, 3)}</div>
          </div>
        ) : ( */}
        <div>
          {values.products[index].discount_percent === 0 ? (
            <div>
              <input
                ref={ref} // сюда приходит ref из родителя
                type="text"
                inputMode="decimal" // для мобильных клавиатур с цифрами
                className={`my-1 dark:bg-gray-900 w-[90%] ${values.products[index].is_custom_price ? "bg-green-300 dark:bg-green-900" : "bg-white dark:bg-gray-900"} print:hidden`}
                // value={formatNumber2(values.products[productIndex]?.selected_price, 3, false) ?? ""}

                value={price}
                onFocus={() => {
                  onFocusPriceRow(); // родительская функция
                  setFocusedPriceRow(productIndex);
                  setFocusedQuantityRow(null); // убрать подсветку quantity
                }}
                disabled={product.is_gift}
                onBlur={() => {
                  onBlurPriceRow();
                  setFocusedPriceRow(null);
                }}
                // onChange={(e) => {
                //   const rawValue = e.target.value;
                //   const normalizedValue = rawValue.replace(",", ".");
                //   const isNumber = !isNaN(normalizedValue) && normalizedValue.trim() !== "";
                //   if (!isNumber) {
                //     setLocalError(`${t("amount must be a digit")}`);
                //     setFieldValue("send", false);
                //   } else {
                //     setLocalError("");
                //     setFieldValue("send", true);
                //   }
                //   setFieldValue(`products[${productIndex}].selected_price`, e.target.value);
                //   setFieldValue(`products[${productIndex}].is_custom_price`, true);
                // }}

                // onChange={(e) => {
                //   let rawValue = e.target.value;

                //   // 🔥 автоматически заменяем запятую на точку
                //   rawValue = rawValue.replace(",", ".");

                //   // разрешаем:
                //   // "", "0", "0.", ".", "0.1"
                //   const validPattern = /^[-+]?\d*\.?\d*$/;

                //   if (!validPattern.test(rawValue)) {
                //     return;
                //   }

                //   setLocalError("");
                //   setFieldValue("send", true);

                //   setFieldValue(`products[${productIndex}].selected_price`, rawValue);
                //   setFieldValue(`products[${productIndex}].is_custom_price`, true);
                // }}

                onChange={(e) => {
                  let rawValue = e.target.value;

                  rawValue = rawValue.replace(",", ".");

                  const validPattern = /^[-+]?\d*\.?\d*$/;
                  if (!validPattern.test(rawValue)) return;

                  const newPrice = Number(rawValue);
                  // setFieldValue(`products[${productIndex}].price_after_discount`, rawValue);

                  const basePrice = values.type_price === "wholesale_price" ? Number(product.wholesale_price) : Number(product.retail_price);

                  let discountPercent = 0;

                  if (basePrice > 0 && newPrice < basePrice) {
                    discountPercent = ((basePrice - newPrice) / basePrice) * 100;
                  }

                  // console.log("discountPercent", discountPercent);

                  setLocalError("");
                  setFieldValue("send", true);

                  setFieldValue(`products[${productIndex}].selected_price`, rawValue);
                  setFieldValue(`products[${productIndex}].price_after_discount`, rawValue);
                  if (values.wozwrat_or_prihod !== "rashod") {
                    setFieldValue(`products[${productIndex}].discount_auto`, true);
                  } else {
                    setFieldValue(`products[${productIndex}].discount_auto`, false);
                  }

                  // console.log("");

                  // if (values.type_price === "wholesale_price") {
                  //   if (newPrice !== Number(product.wholesale_price)) {
                  //     setFieldValue(`products[${productIndex}].is_custom_price`, true);
                  //   } else {
                  //     setFieldValue(`products[${productIndex}].is_custom_price`, false);
                  //   }
                  // } else {
                  //   if (newPrice !== Number(product.retail_price)) {
                  //     setFieldValue(`products[${productIndex}].is_custom_price`, true);
                  //   } else {
                  //     setFieldValue(`products[${productIndex}].is_custom_price`, false);
                  //   }
                  // }

                  const originalPrice = values.type_price === "wholesale_price" ? Number(product.wholesale_price) : Number(product.retail_price);

                  setFieldValue(`products[${productIndex}].is_custom_price`, newPrice !== originalPrice);

                  if (newPrice !== originalPrice) {
                    setFieldValue(`products[${productIndex}].discount_percent`, 0);
                  }

                  // console.log("newPrice rerere", newPrice);
                  // console.log("originalPrice rerere", originalPrice);
                  // console.log("originalPrice =====", originalPrice === newPrice);

                  // setFieldValue(`products[${productIndex}].discount_percent`, discountPercent.toFixed(2));

                  // if (newPrice !== originalPrice) {
                  //   setFieldValue(`products[${productIndex}].discount_percent`, 0);
                  // } else {
                  //   setFieldValue(`products[${productIndex}].discount_percent`, discountPercent.toFixed(2));
                  // }
                }}
                onKeyDown={handleKeyNavigation}
              />
              <div className="hidden print:block">{formatNumber2(values.products[productIndex]?.selected_price, 3)}</div>
              {localError && <div className="text-red-500 text-xs print:hidden">{localError}</div>}
            </div>
          ) : (
            <div className="text-left pl-1 print:text-center">
              {values.type_price === "wholesale_price" ? (
                <div>
                  <div>
                    <div className="line-through text-red-500 print:no-underline print:!text-black">{formatNumber2(values.products[index].wholesale_price)}</div>
                    <div className="print:hidden">{values.products[index].selected_price}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="line-through text-red-500 print:no-underline print:!text-black">{formatNumber2(values.products[index].retail_price)}</div>
                  <div className="print:hidden">{values.products[index].selected_price}</div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* )} */}
      </div>
    </td>
  );
});

export default TDPrice;
