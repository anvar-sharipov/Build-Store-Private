// list of searched products  

export const handleProductKeyDown = ({
  e,
  index,
  product,
  results,
  inputRef,
  resultRefs,
  setFocusedIndex,
  selectedProducts,
  setSelectedProducts,
  setGiftProducts,
  setSelectedId,
  setQuery,
  showNotification,
}) => {
  if (e.key === "ArrowDown" && results.length > index + 1) {
    e.preventDefault();
    const nextIndex = index + 1;
    setFocusedIndex(nextIndex);
    resultRefs.current[nextIndex]?.focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (index > 0) {
      const prevIndex = index - 1;
      setFocusedIndex(prevIndex);
      resultRefs.current[prevIndex]?.focus();
    } else {
      inputRef.current?.focus();
      setFocusedIndex(0);
    }
  } else if (e.key === "Enter") {
    e.preventDefault();

    if (parseFloat(product.quantity) <= 0) {
    showNotification(`Товара "${product.name}" нет на складе`, "error")
      return;
    }

    const alreadySelected = selectedProducts.some((p) => p.id === product.id);
    if (!alreadySelected) {
      if (product.free_items.length > 0) { // berem gifts esli est
        const newGifts = product.free_items.map((gift) => ({
          gift_product_id: gift.gift_product,
          quantityPerItem: parseFloat(gift.quantity_per_unit) || 0,
          gift_name: gift.gift_product_name,
          main_product_id: product.id,
          main_product_name: product.name,
          gift_product_unit_name: gift.gift_product_unit_name,
          calculatedQuantity: gift.quantity_per_unit,
          baseUnitQuantity: gift.quantity_per_unit,
          gift_product_quantity_in_stock: gift.gift_product_quantity
        }));

        setGiftProducts((prev) => {
          const newGiftsFiltered = newGifts.filter( // 🧠 Что происходит? Мы создаём отфильтрованный список новых подарков, исключая дубликаты, которые уже есть в prev.
            (newGift) =>
              !prev.some( // ⛔ Только те подарки из newGifts, которых ещё нет в prev
                (gift) =>
                  gift.gift_product_id === newGift.gift_product_id &&
                  gift.main_product_id === newGift.main_product_id
              )
          );
          console.log("newGiftsFiltered", newGiftsFiltered);
          return [...prev, ...newGiftsFiltered];
        });
      }

      setSelectedId(product.id);

      const extendedUnits = [
        {
          id: `base-${product.base_unit_obj.id}`,
          unit: product.base_unit_obj.id,
          unit_name: product.base_unit_obj.name,
          conversion_factor: 1,
        },
        ...product.units,
      ];

      setSelectedProducts((prev) => [
        ...prev,
        {
          ...product,
          selected_unit: product.base_unit_obj,
          selected_quantity: 1,
          quantity_in_stock: product.quantity,
          base_quantity: 1,
          purchase_price: product.purchase_price,
          sale_price: product.retail_price,
          units: extendedUnits,
        },
      ]);
      setQuery("");
    } else {
        showNotification(`Товар "${product.name}" уже выбран`, "error")
    }
  }
};
