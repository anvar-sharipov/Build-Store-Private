import myAxios from "../../../../../axios";
const refreshTable = async (values, setFieldValue, warehouse, changedPriceType = false, refreshFrom = "") => {
  if (refreshFrom === "TDPrice") {
    console.log('refreshFrom === "TDPrice"');
    let footerTotalPrice = 0;
    let footerTotalPricePurchae = 0;
    let footerTotalPriceDiscount = 0;

    // # weight volume length width height
    let footerTotalVolume = 0;
    let footerTotalWeight = 0;
    let footerTotalLength = 0;
    let footerTotalWidth = 0;
    let footerTotalHeight = 0;

    const updatedProducts = values.products.forEach((product) => {
      footerTotalPrice += product.selected_quantity * product.selected_price;
      footerTotalPricePurchae += product.selected_quantity * product.purchase_price;
      footerTotalPriceDiscount += product.selected_quantity * product.selected_price - product.selected_quantity * product.wholesale_price;

      footerTotalVolume += product.selected_quantity * product.volume;
      footerTotalWeight += product.selected_quantity * product.weight;
      footerTotalLength += product.selected_quantity * product.length;
      footerTotalWidth += product.selected_quantity * product.width;
      footerTotalHeight += product.selected_quantity * product.height;
    });
    setFieldValue("footerTotalPrice", footerTotalPrice);
    setFieldValue("footerTotalPricePurchae", footerTotalPricePurchae);
    setFieldValue("footerTotalPriceProfit", footerTotalPrice - footerTotalPricePurchae);
    setFieldValue("footerTotalPriceDiscount", footerTotalPriceDiscount);

    setFieldValue("footerTotalVolume", footerTotalVolume);
    setFieldValue("footerTotalWeight", footerTotalWeight);
    setFieldValue("footerTotalLength", footerTotalLength);
    setFieldValue("footerTotalWidth", footerTotalWidth);
    setFieldValue("footerTotalHeight", footerTotalHeight);
  } else if (refreshFrom === "TDQuantity" || refreshFrom === "deleteProduct") {
    console.log("tut TDQuantity");

    let footerTotalPrice = 0;
    let footerTotalPricePurchae = 0;
    let footerTotalPriceDiscount = 0;

    // # weight volume length width height
    let footerTotalVolume = 0;
    let footerTotalWeight = 0;
    let footerTotalLength = 0;
    let footerTotalWidth = 0;
    let footerTotalHeight = 0;

    const updatedProducts = values.products.map((product) => {
      footerTotalPrice += product.selected_quantity * product.selected_price;
      footerTotalPricePurchae += product.selected_quantity * product.purchase_price;
      footerTotalPriceDiscount += product.selected_quantity * product.selected_price - product.selected_quantity * product.wholesale_price;

      footerTotalVolume += product.selected_quantity * product.volume;
      footerTotalWeight += product.selected_quantity * product.weight;
      footerTotalLength += product.selected_quantity * product.length;
      footerTotalWidth += product.selected_quantity * product.width;
      footerTotalHeight += product.selected_quantity * product.height;

      const selected_price = product.selected_price;

      return {
        ...product,
        selected_quantity: product.selected_quantity,
        selected_price: selected_price,
      };
    });

    const newGifts = [];

    for (const p of updatedProducts) {
      if (p.free_items.length > 0) {
        p.free_items.forEach((gift) => {
          values.gifts.forEach((g) => {
            if (g.id === gift.gift_product) {
              newGifts.push({
                ...g,
                selected_quantity: p.selected_quantity * gift.quantity_per_unit,
                gift_product: gift.gift_product, // добавим для удобства
              });
            }
          });
        });
      }
    }

    const combinedGiftsMap = new Map();
    const newGifts2 = [];
    newGifts.forEach((g) => {
      if (g !== null) {
        if (combinedGiftsMap.has(g.id)) {
          footerTotalVolume += g.selected_quantity * g.volume;
          footerTotalWeight += g.selected_quantity * g.weight;
          footerTotalLength += g.selected_quantity * g.length;
          footerTotalWidth += g.selected_quantity * g.width;
          footerTotalHeight += g.selected_quantity * g.height;
          // Если подарок уже есть — суммируем количество
          const existingGift = combinedGiftsMap.get(g.id);
          existingGift.selected_quantity += g.selected_quantity;
          // Можно при необходимости обновить другие поля
        } else {
          footerTotalVolume += g.selected_quantity * g.volume;
          footerTotalWeight += g.selected_quantity * g.weight;
          footerTotalLength += g.selected_quantity * g.length;
          footerTotalWidth += g.selected_quantity * g.width;
          footerTotalHeight += g.selected_quantity * g.height;
          combinedGiftsMap.set(g.id, { ...g });
        }
      }
    });

    // Добавляем уникальные подарки из текущего продукта в итоговый массив
    newGifts2.push(...combinedGiftsMap.values());

    console.log("tut2", updatedProducts);

    setFieldValue("gifts", newGifts2);
    setFieldValue("products", updatedProducts);
    setFieldValue("footerTotalPrice", footerTotalPrice);
    setFieldValue("footerTotalPricePurchae", footerTotalPricePurchae);
    setFieldValue("footerTotalPriceProfit", footerTotalPrice - footerTotalPricePurchae);
    setFieldValue("footerTotalPriceDiscount", footerTotalPriceDiscount);

    setFieldValue("footerTotalVolume", footerTotalVolume);
    setFieldValue("footerTotalWeight", footerTotalWeight);
    setFieldValue("footerTotalLength", footerTotalLength);
    setFieldValue("footerTotalWidth", footerTotalWidth);
    setFieldValue("footerTotalHeight", footerTotalHeight);
  } else {
    let footerTotalPrice = 0;
    let footerTotalPricePurchae = 0;
    let footerTotalPriceDiscount = 0;

    // # weight volume length width height
    let footerTotalVolume = 0;
    let footerTotalWeight = 0;
    let footerTotalLength = 0;
    let footerTotalWidth = 0;
    let footerTotalHeight = 0;

    try {
      const updatedProducts = await Promise.all(
        values.products.map(async (product) => {
          const res = await myAxios.get(`search-products/?id=${product.id}&warehouse=${warehouse}`);

          footerTotalVolume += product.selected_quantity * product.volume;
          footerTotalWeight += product.selected_quantity * product.weight;
          footerTotalLength += product.selected_quantity * product.length;
          footerTotalWidth += product.selected_quantity * product.width;
          footerTotalHeight += product.selected_quantity * product.height;

          let selected_price = 0;
          if (changedPriceType) {
            if (values.priceType === "wholesale") {
              console.log("rtrtrt");

              footerTotalPrice += product.selected_quantity * product.wholesale_price;
              footerTotalPricePurchae += product.selected_quantity * product.purchase_price;
              footerTotalPriceDiscount += product.selected_quantity * product.wholesale_price - product.selected_quantity * product.wholesale_price;

              selected_price = product.wholesale_price;
            } else {
              footerTotalPrice += product.selected_quantity * product.retail_price;
              footerTotalPricePurchae += product.selected_quantity * product.purchase_price;
              footerTotalPriceDiscount += product.selected_quantity * product.retail_price - product.selected_quantity * product.wholesale_price;
              selected_price = product.retail_price;
            }
          } else {
            footerTotalPrice += product.selected_quantity * product.selected_price;
            footerTotalPricePurchae += product.selected_quantity * product.purchase_price;
            footerTotalPriceDiscount += product.selected_quantity * product.selected_price - product.selected_quantity * product.wholesale_price;
            selected_price = product.selected_price;
          }

          return {
            ...res.data[0],
            selected_quantity: product.selected_quantity,
            selected_price: selected_price,
          };
          // предполагаем, что res.data — массив с 1 элементом
        })
      );

      const newGifts = [];

      for (const p of updatedProducts) {
        if (p.free_items.length > 0) {
          const promises = p.free_items.map(async (gift) => {
            try {
              const res = await myAxios.get(`search-products/?id=${gift.gift_product}&warehouse=${warehouse}&search_in_invoice=yes`);

              return {
                ...res.data[0],
                selected_quantity: p.selected_quantity * gift.quantity_per_unit,
                gift_product: gift.gift_product, // добавим для удобства
              };
            } catch (error) {
              console.log("Ошибка при получении подарка:", error);
              return null;
            }
          });

          const giftResults = await Promise.all(promises);

          // Объединяем по gift_product, суммируя selected_quantity
          const combinedGiftsMap = new Map();

          giftResults.forEach((gift) => {
            if (gift !== null) {
              if (combinedGiftsMap.has(gift.gift_product)) {
                // Если подарок уже есть — суммируем количество
                const existingGift = combinedGiftsMap.get(gift.gift_product);
                existingGift.selected_quantity += gift.selected_quantity;

                // Можно при необходимости обновить другие поля
              } else {
                combinedGiftsMap.set(gift.gift_product, { ...gift });
              }
            }
          });

          // Добавляем уникальные подарки из текущего продукта в итоговый массив
          newGifts.push(...combinedGiftsMap.values());
        }
      }

      // После цикла у newGifts могут быть дубликаты, если одинаковые подарки есть у разных продуктов.
      // Чтобы объединить их глобально — сделаем объединение еще раз:

      const finalGiftsMap = new Map();

      newGifts.forEach((gift) => {
        if (finalGiftsMap.has(gift.gift_product)) {
          const existingGift = finalGiftsMap.get(gift.gift_product);
          existingGift.selected_quantity += gift.selected_quantity;

          footerTotalVolume += gift.selected_quantity * gift.volume;
          footerTotalWeight += gift.selected_quantity * gift.weight;
          footerTotalLength += gift.selected_quantity * gift.length;
          footerTotalWidth += gift.selected_quantity * gift.width;
          footerTotalHeight += gift.selected_quantity * gift.height;
        } else {
          footerTotalVolume += gift.selected_quantity * gift.volume;
          footerTotalWeight += gift.selected_quantity * gift.weight;
          footerTotalLength += gift.selected_quantity * gift.length;
          footerTotalWidth += gift.selected_quantity * gift.width;
          footerTotalHeight += gift.selected_quantity * gift.height;
          finalGiftsMap.set(gift.gift_product, { ...gift });
        }
      });

      const finalGifts = Array.from(finalGiftsMap.values());

      // Теперь finalGifts — массив уникальных подарков с суммированными selected_quantity

      setFieldValue("gifts", finalGifts);
      setFieldValue("products", updatedProducts);
      setFieldValue("footerTotalPrice", footerTotalPrice);
      setFieldValue("footerTotalPricePurchae", footerTotalPricePurchae);
      setFieldValue("footerTotalPriceProfit", footerTotalPrice - footerTotalPricePurchae);
      setFieldValue("footerTotalPriceDiscount", footerTotalPriceDiscount);

      setFieldValue("footerTotalVolume", footerTotalVolume);
      setFieldValue("footerTotalWeight", footerTotalWeight);
      setFieldValue("footerTotalLength", footerTotalLength);
      setFieldValue("footerTotalWidth", footerTotalWidth);
      setFieldValue("footerTotalHeight", footerTotalHeight);
    } catch (error) {
      console.error("Ошибка при обновлении продуктов:", error);
    }
  }
};

export default refreshTable;
