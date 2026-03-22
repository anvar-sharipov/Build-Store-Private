import { useFormikContext } from "formik";
import { forwardRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../UI/formatNumber";
import calculateDiscount from "../../../UI/calculateDiscount";

const Quantity = forwardRef(({ product, index, onFocusQuantityRow, onBlurQuantityRow, setFocusedQuantityRow, setFocusedPriceRow, refs }, ref) => {
  const { values, setFieldValue } = useFormikContext();
  const { t } = useTranslation();
  // const [localErrorQuantity, setLocalErrorQuantity] = useState(() => {
  //   if (Number(product.selected_quantity) > (product.quantity_on_selected_warehouses || 0)) {
  //     setFieldValue("send", false);
  //     return `${t("OnStock")} ${product.quantity_on_selected_warehouses}`
  //   } else {
  //     return ""
  //   }
  // });
  const [localErrorQuantity, setLocalErrorQuantity] = useState("");

  useEffect(() => {
    if (
      Number(product.selected_quantity) > ((product.quantity_on_selected_warehouses || 0) - (product.qty_in_drafts || 0) || 0) &&
      (values.wozwrat_or_prihod === "rashod" || values.wozwrat_or_prihod === "transfer")
    ) {
      setLocalErrorQuantity(`${t("available")}: ${(product.quantity_on_selected_warehouses || 0) - (product.qty_in_drafts || 0)}`);
      setFieldValue("send", false);
    }
    // else {
    //   setLocalErrorQuantity("");
    //   setFieldValue("send", true);
    // }
  }, [product.selected_quantity, setFieldValue, t, values.wozwrat_or_prihod, product.qty_in_drafts]);

  //   useEffect(() => {
  //   console.log("values", values);
  // }, [values.wozwrat_or_prihod])

  useEffect(() => {
    setLocalValue(product.selected_quantity?.toString() || "");
  }, [product.selected_quantity]);

  const [localValue, setLocalValue] = useState(product.selected_quantity?.toString() || "");

  // console.log("fdfdfdfd", product);

  // const productIndex = values.products.findIndex((p) => p.id === product.id);
  const productIndex = index;

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
        // const prevProductId = values.products[productIndex - 1].id;
        // refs.quantityRefs.current[prevProductId]?.focus();
        // refs.quantityRefs.current[prevProductId]?.select();
        refs.quantityRefs.current[productIndex - 1]?.focus();
        refs.quantityRefs.current[productIndex - 1]?.select();
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
        // const nextProductId = values.products[productIndex + 1].id;
        // refs.quantityRefs.current[nextProductId]?.focus();
        // refs.quantityRefs.current[nextProductId]?.select();
        refs.quantityRefs.current[productIndex + 1]?.focus();
        refs.quantityRefs.current[productIndex + 1]?.select();
      }
      // Если это последний продукт, остаемся на месте (или можно добавить другую логику)
    } else if (e.key === "ArrowRight" && e.target.selectionStart === e.target.value.length) {
      e.preventDefault();
      // refs.priceRefs.current[product.id]?.focus();
      // refs.priceRefs.current[product.id]?.select();
      refs.priceRefs.current[productIndex]?.focus();
      refs.priceRefs.current[productIndex]?.select();
    }
  };

  // function calculateDiscount(product, qty) {
  //   let percent = 0;

  //   const rules = [...(product.quantity_discounts || [])].sort((a, b) => Number(a.min_quantity) - Number(b.min_quantity));

  //   rules.forEach((rule) => {
  //     if (qty >= Number(rule.min_quantity)) {
  //       percent = Number(rule.discount_percent);
  //     }
  //   });

  //   const price = Number(product.selected_price) || 0;

  //   // const price_after_discount = price * (1 - percent / 100);
  //   // const discount_amount = price - price_after_discount;

  //   const price_after_discount = +(price * (1 - percent / 100)).toFixed(3);
  //   const discount_amount = +(price - price_after_discount).toFixed(3);

  //   // console.log("pricePPPPPPPPPPP", price);
  //   // console.log("percentPPPPPPPPPPP", percent);

  //   // console.log("selected_priceEEEEEEE", price);
  //   // console.log("percentEEEEEEE", percent);
  //   // console.log("price_after_discountEEEEEEE", price);
  //   // console.log("discount_amountEEEEEEE", price);
  //   // console.log("price_after_discountTTTTTTTTTTTT", price_after_discount);

  //   return {
  //     discount_percent: percent,
  //     price_after_discount,
  //     discount_amount,
  //   };
  // }

  // console.log("product.selected_price II", product.selected_price);

  return (
    // <td className="p-0 m-0 text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  print:!text-black print:!border-black text-center font-mono tabular-nums">
    <td
      className={`p-0 m-0 text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  print:!text-black print:!border-black text-center font-mono tabular-nums ${product.stock_error ? "bg-red-100 dark:bg-red-900" : ""}`}
    >
      <input
        ref={ref} // сюда приходит ref из родителя
        type="text"
        inputMode="decimal" // для мобильных клавиатур с цифрами
        className="my-1 dark:bg-gray-900 w-[90%] print:hidden"
        value={localValue}
        onFocus={() => {
          onFocusQuantityRow(); // родительская функция
          setFocusedQuantityRow(productIndex);
          setFocusedPriceRow(null); // убрать подсветку price
        }}
        onBlur={() => {
          onBlurQuantityRow();
          setFocusedQuantityRow(null);
        }}
        disabled={product.is_gift}
        // onChange={(e) => handleChangeQuantity(e.target.value)}
        onChange={(e) => {
          // console.log("product ===", product);
          // console.log("tutuOOOOOOOOO");

          const rawValue = e.target.value;
          setLocalValue(rawValue); // всегда пишем то, что набрал пользователь

          const normalizedValue = rawValue.replace(",", ".");

          const qty = Number(normalizedValue);
          const isNumber = !isNaN(normalizedValue) && normalizedValue.trim() !== "";

          let total_dostupno = (product.quantity_on_selected_warehouses || 0) - (product.qty_in_drafts || 0);

          // console.log("values.wozwrat_or_prihodEEEEEEEEEEEE", values.wozwrat_or_prihod);
          // console.log("product.qty_in_drafts", (product.quantity_on_selected_warehouses || 0) - product.qty_in_drafts);
          if (!isNumber) {
            setLocalErrorQuantity(`${t("quantity must be a digit")}`);
            setFieldValue("send", false);
            // } else if (qty > (product.quantity_on_selected_warehouses || 0) - (product.qty_in_drafts || 0) && (values.wozwrat_or_prihod === "rashod" || values.wozwrat_or_prihod === "transfer")) {
          } else if (qty < 0.001) {
            setLocalErrorQuantity(`${t("only positive numbers")}`);
            setFieldValue("send", false);
            setFieldValue(`products[${productIndex}].selected_quantity`, qty);
          } else {
            setLocalErrorQuantity("");
            // setFieldValue("send", true);
            setFieldValue(`products[${productIndex}].selected_quantity`, qty);

            // const test = calculateDiscount(product, qty);
            // console.log("test", test);

            // const updatedProducts = values.products.map((p, idx) => (idx === productIndex ? { ...p, selected_quantity: qty } : p));

            let updatedProducts = values.products.map((p, idx) => {
              if (idx === productIndex) {
                const discount = calculateDiscount(p, qty, 0, values.type_price);
                

                const basePrice = values.type_price === "retail_price" ? Number(product.retail_price) : Number(product.wholesale_price);
                let selected_price = basePrice
                if (discount.percent > 0) {
                  selected_price = discount.price_after_discount
                }
                

                // console.log("discount tutuOOOOOOOOO", discount);
                if (values.wozwrat_or_prihod === "rashod") {
                  return {
                    ...p,
                    selected_quantity: qty,
                    price_after_discount: discount.price_after_discount,
                    discount_percent: discount.percent,
                    discount_amount: discount.discount_amount,
                    selected_price:selected_price
                  };
                } else {
                  return {
                    ...p,
                    selected_quantity: qty,
                    price_after_discount: 0,
                    discount_percent: 0,
                    discount_amount: 0,
                  };
                }
              }
              return p;
            });

            // пересчитываем gift
            const giftQuantities = {};

            updatedProducts.forEach((p) => {
              if (!p.is_gift && Array.isArray(p.free_items) && p.free_items?.length > 0) {
                const mainQty = Number(p.selected_quantity) || 0;

                p.free_items.forEach((free) => {
                  const giftId = free.gift_product;
                  const qtyPerUnit = Number(free.quantity_per_unit) || 0;

                  const calculated = Math.floor(mainQty * qtyPerUnit);

                  giftQuantities[giftId] = (giftQuantities[giftId] || 0) + calculated;
                });
              }
            });

            // обновляем gift
            // const recalculatedProducts = updatedProducts.map((p) => {
            //   if (p.is_gift) {
            //     return {
            //       ...p,
            //       selected_quantity: giftQuantities[p.id] || 0,
            //     };
            //   }
            //   return p;
            // });

            updatedProducts = updatedProducts.map((p) => {
              if (p.is_gift) {
                return {
                  ...p,
                  selected_quantity: giftQuantities[p.id] || 0,
                };
              }
              return p;
            });

            // setFieldValue("products", recalculatedProducts);
            // считаем ОБЩЕЕ количество товара (main + gift)
            // const totalRequested = recalculatedProducts.filter((p) => p.id === product.id).reduce((sum, p) => sum + (Number(p.selected_quantity) || 0), 0);
            const totalRequested = updatedProducts.filter((p) => p.id === product.id).reduce((sum, p) => sum + (Number(p.selected_quantity) || 0), 0);

            // проверка склада
            // if (totalRequested > total_dostupno && (values.wozwrat_or_prihod === "rashod" || values.wozwrat_or_prihod === "transfer")) {
            //   setLocalErrorQuantity(`${t("OnStock")} ${total_dostupno}`);
            //   setFieldValue("send", false);
            //   return;
            // }
            if (totalRequested > total_dostupno && (values.wozwrat_or_prihod === "rashod" || values.wozwrat_or_prihod === "transfer")) {
              setLocalErrorQuantity(`${t("available")}: ${total_dostupno}`);

              setFieldValue("send", false);

              // подсветим gift товары
              // const errorProducts = recalculatedProducts.map((p) => {
              //   if (p.id === product.id) {
              //     return { ...p, stock_error: true };
              //   }
              //   return { ...p, stock_error: false };
              // });
              // const updatedProducts = recalculatedProducts.map((p) => {
              //   if (p.id === product.id) {
              //     return { ...p, stock_error: true };
              //   }
              //   return { ...p, stock_error: false };
              // });

              updatedProducts = updatedProducts.map((p) => {
                if (p.id === product.id) {
                  return { ...p, stock_error: true };
                }
                return { ...p, stock_error: false };
              });

              setFieldValue("products", updatedProducts);

              return;
            }

            // ✅ ЕСЛИ ОШИБКИ НЕТ — СНИМАЕМ КРАСНЫЙ
            updatedProducts = updatedProducts.map((p) => ({
              ...p,
              stock_error: false,
            }));

            setFieldValue("products", updatedProducts);

            // recalcGiftQuantities(updatedProducts);

            let send = true;
            for (let i = 0; i < updatedProducts.length; i++) {
              const prod = updatedProducts[i];
              const maxQty = (prod.quantity_on_selected_warehouses || 0) - (prod.qty_in_drafts || 0);
              if ((values.wozwrat_or_prihod === "rashod" || values.wozwrat_or_prihod === "transfer") && Number(prod.selected_quantity) > maxQty) {
                send = false;
                break;
              }
            }
            setFieldValue("send", send);
          }
        }}
        onKeyDown={handleKeyNavigation}
      />
      <div className="hidden print:block">{formatNumber(localValue, 3)}</div>
      {!product.is_gift && product.free_items?.length > 0 && (
        <div className="text-[11px] text-gray-500 print:hidden">
          {(() => {
            const giftQty = values.products.filter((p) => p.is_gift && product.free_items.some((f) => f.gift_product === p.id)).reduce((sum, p) => sum + (Number(p.selected_quantity) || 0), 0);

            if (giftQty > 0) {
              return `(+${giftQty} ${t("gift")})`;
            }

            return null;
          })()}
        </div>
      )}
      {localErrorQuantity && <div className="text-red-500 text-xs print:hidden">{localErrorQuantity}</div>}
    </td>
  );
});

export default Quantity;
