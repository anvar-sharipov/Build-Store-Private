import { useFormikContext } from "formik";
import { forwardRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../UI/formatNumber";

const Quantity = forwardRef(({ product, onFocusQuantityRow, onBlurQuantityRow, setFocusedQuantityRow, setFocusedPriceRow, refs }, ref) => {
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
    if (Number(product.selected_quantity) > (product.quantity_on_selected_warehouses || 0)) {
      setLocalErrorQuantity(`${t("OnStock")} ${product.quantity_on_selected_warehouses}`);
      setFieldValue("send", false);
    }
  }, [product.selected_quantity, setFieldValue, t]);

  useEffect(() => {
    setLocalValue(product.selected_quantity?.toString() || "");
  }, [product.selected_quantity]);

  const [localValue, setLocalValue] = useState(product.selected_quantity?.toString() || "");

  // console.log("fdfdfdfd", product);

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

  const recalcGiftQuantities = (products) => {
    const giftQuantities = {};

    // Проходим по всем main товарам
    products.forEach((product) => {
      if (!product.is_gift && product.free_items?.length > 0) {
        // console.log("GGGGGGGGGGGGGGGGGG", product.selected_quantity);
        
        const mainQty = Number(product.selected_quantity) || 0; // <-- используем quantity из values.products
        product.free_items.forEach((free) => {
          const giftId = free.gift_product;
          const qtyPerUnit = Number(free.quantity_per_unit) || 0;
          // console.log("GGGGGGGGGGGGGGGGGG", free.quantity_per_unit);

          giftQuantities[giftId] = (giftQuantities[giftId] || 0) + mainQty * qtyPerUnit;
        });
      }
    });
    console.log("GGGGGGGGGGGGGGGGGG", giftQuantities);
    


    // Обновляем все gift товары
    products.forEach((product, idx) => {
      if (product.is_gift) {
        const newQty = giftQuantities[product.id] || 0;
        
        if (Number(product.selected_quantity) !== newQty) {
          // console.log('tut');
          // console.log('eeeee', values.products[idx]);

          setFieldValue(`products[${idx}].selected_quantity`, newQty);
        }
      }
    });
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
          // console.log("product ===", product);

          const rawValue = e.target.value;
          setLocalValue(rawValue); // всегда пишем то, что набрал пользователь

          const normalizedValue = rawValue.replace(",", ".");

          const qty = Number(normalizedValue);
          const isNumber = !isNaN(normalizedValue) && normalizedValue.trim() !== "";

          if (!isNumber) {
            setLocalErrorQuantity(`${t("quantity must be a digit")}`);
            setFieldValue("send", false);
          } else if (qty > product.quantity_on_selected_warehouses) {
            setLocalErrorQuantity(`${t("OnStock")} ${product.quantity_on_selected_warehouses}`);
            setFieldValue("send", false);
          } else if (qty < 0.001) {
            setLocalErrorQuantity(`${t("only positive numbers")}`);
            setFieldValue("send", false);
          } else {
            setLocalErrorQuantity("");
            setFieldValue("send", true);
            setFieldValue(`products[${productIndex}].selected_quantity`, qty);

            const updatedProducts = values.products.map((p, idx) => (idx === productIndex ? { ...p, selected_quantity: qty } : p));

            recalcGiftQuantities(updatedProducts);
          }
        }}
        onKeyDown={handleKeyNavigation}
      />
      <div className="hidden print:block">{formatNumber(localValue, 3)}</div>
      {localErrorQuantity && <div className="text-red-500 text-xs print:hidden">{localErrorQuantity}</div>}
    </td>
  );
});

export default Quantity;
