// tut list productow dlya wypadayushegosya okna pri poiske

import { useEffect, useState } from "react";
import { myClass } from "../../../tailwindClasses";
import myAxios from "../../../axios";
import { Volume } from "lucide-react";
import { motion } from "framer-motion";
import { message } from "antd";

const SearchedProductList = ({
  t,
  results,
  setResults,
  resultRefs,
  selectedProducts,
  setSelectedProducts,
  invoiceTable,
  setInvoiceTable,
  priceType,
  setPriceType,
  inputRef,
  quantityInputRefs,
  setQuery,
  setNotification,
  showNotification,
  notification,
  Notification,
  selectedWarehouseId,
  // setFreeProducts,
  // freeProducts,
}) => {
  async function handleFreeProducts(product) {
    if (product.free_items.length === 0) return;

    try {
      const free_products = product.free_items.map((g) => {
        return {
          id: g.gift_product,
          gift_quantity_per_unit: g.quantity_per_unit,
        };
      });

      const gift_results = [];

      for (const p of free_products) {
        // const res = await myAxios.get(`products/${p.id}`);
        const res = await myAxios.get(`search-products/?id=${p.id}&warehouse=${selectedWarehouseId}`)
        const free_product = res.data[0];
        // console.log("res.data", res.data);

        gift_results.push({
          ...free_product,
          gift_quantity: parseFloat(p.gift_quantity_per_unit) || 1,
          gift_for_product_id: product.id,
          gift_for_product_name: product.name,
        });
      }

      // // Обновляем стейт один раз
      // setFreeProducts((prev) => [...prev, ...gift_results]);

      // Добавляем каждый подарок в таблицу
      gift_results.forEach((gift) => {
        let selected_unit = null;
        // console.log('gift.units', gift.units);
        // console.log('gift.units', gift.units > 0);
        if (gift.units.length > 0) {
          // console.log('tut', gift);

          const defaultUnit = gift.units.find((u) => u.is_default_for_sale);
          // console.log('defaultUnit', defaultUnit);

          if (defaultUnit) {
            selected_unit = {
              id: defaultUnit.unit,
              name: defaultUnit.unit_name,
              conversion_factor: defaultUnit.conversion_factor,
            };
            // console.log("selected_unit", selected_unit);
          } else {
            selected_unit = {
              id: gift.base_unit_obj.id,
              name: gift.base_unit_obj.name,
              conversion_factor: 1,
            };
          }
        } else {
          selected_unit = {
            id: gift.base_unit_obj.id,
            name: gift.base_unit_obj.name,
            conversion_factor: 1,
          };
        }
        // console.log('gift', gift);
        

        // console.log("gift", gift);
        // console.log("selected_unit", selected_unit);

        setInvoiceTable((prev) => [
          ...prev,
          {
            // id: `${gift.id}-gift-${gift.gift_for_product_id}`, // уникальный id
            id: gift.id,
            qr_code: gift.qr_code,
            name: gift.name,
            gift_for_product_name: gift.gift_for_product_name,
            quantity_in_stok: gift.base_quantity_in_stock,
            selected_unit,
            selected_quantity: gift.gift_quantity, // учитываем количество подарка
            original_quantity_per_unit: gift.gift_quantity,
            base_quantity: gift.gift_quantity,
            wholesale_price_1pc: 0,
            original_wholesale_price_1pc: 0,
            wholesale_price_summ: 0,

            purchase_price_1pc: 0,
            purchase_price_summ: 0,

            retail_price_1pc: 0,
            original_retail_price_1pc: 0,
            retail_price_summ: 0,

            difference_price: 0,
            difference_price_summ: 0,

            original_difference_price_retail: 0,
            original_difference_price_wholesale: 0,
            original_discount_difference_price_retail: 0,
            original_discount_difference_price_wholesale: 0,

            discount_difference_price: 0,
            original_discount_difference_price: 0,
            discount_difference_price_summ: 0,

            units: gift.units,
            base_unit: gift.base_unit_obj,
            quantity_in_stock: gift.base_quantity_in_stock,

            manually_changed_fields: {
              price: false,
              quantity: false,
              not_enough: false,
            },

            is_gift: true,
            gift_for_product_id: gift.gift_for_product_id,

            volume: gift.volume,
            weight: gift.weight,
            length: gift.length,
            width: gift.width,
            height: gift.height,
          },
        ]);
      });
    } catch (error) {
      console.error("Ошибка при получении подарочных продуктов:", error);
    }
  }

  // esli najal na enter ili na click
  const handleSelectProduct = async (product) => {
    // console.log('productttttt', product);

    const alreadyExists = invoiceTable.some((p) => p.id === product.id);

    if (alreadyExists) {
      showNotification("Продукт уже добавлен", "error");
      return;
    }
    
    if (product.base_quantity_in_stock < parseFloat(1)) {
      showNotification("Продукт нет на складе", "error");
      return;
    }

    let selected_unit = null;
    if (product.units.length > 0) {
      const defaultUnit = product.units.find((u) => u.is_default_for_sale);
      if (defaultUnit) {
        selected_unit = {
          id: defaultUnit.unit,
          name: defaultUnit.unit_name,
          conversion_factor: defaultUnit.conversion_factor,
        };
      } else {
        selected_unit = {
          id: product.base_unit_obj.id,
          name: product.base_unit_obj.name,
          conversion_factor: 1,
        };
      }
    } else {
      selected_unit = {
        id: product.base_unit_obj.id,
        name: product.base_unit_obj.name,
        conversion_factor: 1,
      };
    }

    let difference_price;
    let discount_difference_price;
    const original_difference_price_wholesale =
      (product.wholesale_price - product.purchase_price) *
      selected_unit.conversion_factor;
    const original_difference_price_retail =
      (product.retail_price - product.purchase_price) *
      selected_unit.conversion_factor;
    const original_discount_difference_price_wholesale = 0;
    const original_discount_difference_price_retail =
      (product.retail_price -
        product.purchase_price -
        (product.wholesale_price - product.purchase_price)) *
      selected_unit.conversion_factor;

    if (priceType === "wholesale") {
      difference_price =
        (product.wholesale_price - product.purchase_price) *
        selected_unit.conversion_factor;
      discount_difference_price = 0;
    } else {
      difference_price =
        (product.retail_price - product.purchase_price) *
        selected_unit.conversion_factor;
      discount_difference_price =
        (product.retail_price -
          product.purchase_price -
          (product.wholesale_price - product.purchase_price)) *
        selected_unit.conversion_factor;
    }

    const wholesale_price_1pc =
      selected_unit.conversion_factor * product.wholesale_price;
    const retail_price_1pc =
      selected_unit.conversion_factor * product.retail_price;
    const purchase_price_1pc =
      selected_unit.conversion_factor * product.purchase_price;

    await handleFreeProducts(product);

    setInvoiceTable((prev) => [
      ...prev,
      {
        id: product.id,
        qr_code: product.qr_code,
        name: product.name,
        quantity_in_stok: product.base_quantity_in_stock,
        selected_unit,
        selected_quantity: 1,
        base_quantity: 1,

        wholesale_price_1pc,
        original_wholesale_price_1pc: wholesale_price_1pc,
        wholesale_price_summ: wholesale_price_1pc,

        purchase_price_1pc,
        purchase_price_summ: purchase_price_1pc,

        retail_price_1pc,
        original_retail_price_1pc: retail_price_1pc,
        retail_price_summ: retail_price_1pc,

        difference_price,
        difference_price_summ: difference_price,

        original_difference_price_retail,
        original_difference_price_wholesale,

        original_discount_difference_price_retail,
        original_discount_difference_price_wholesale,

        discount_difference_price,
        original_discount_difference_price: discount_difference_price,
        discount_difference_price_summ: discount_difference_price,

        units: product.units,
        base_unit: product.base_unit_obj,
        quantity_in_stock: product.base_quantity_in_stock,

        manually_changed_fields: {
          price: false,
          quantity: false,
          not_enough: false,
        },
        is_gift: false,
        volume: product.volume || 0,
        weight: product.weight || 0,
        length: product.length || 0,
        width: product.width || 0,
        height: product.height || 0,
      },
    ]);

    setResults("");
    setTimeout(() => {
      quantityInputRefs.current[product.id]?.focus();
      quantityInputRefs.current[product.id]?.select();
    }, 0);
    setQuery("");
  };

  return (
    <div>
      <ul className="print:hidden">
        {results.length > 0 &&
          results.map((product, index) => {
            // let quantity = parseFloat(product.quantity_on_selected_warehouses || product.total_quantity || 0);
            return (
              <li
                className={myClass.li3}
                key={product.id}
                ref={(el) => (resultRefs.current[index] = el)}
                tabIndex={0}
                onClick={() => handleSelectProduct(product)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    await handleSelectProduct(product);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (index === 0) {
                      inputRef.current?.focus();
                      inputRef.current?.select();
                    } else {
                      resultRefs.current[index - 1]?.focus();
                    }
                  } else if (
                    e.key === "ArrowDown" &&
                    index + 1 < results.length
                  ) {
                    e.preventDefault();
                    resultRefs.current[index + 1]?.focus();
                  }
                }}
              >
                <div className="flex justify-between w-full">
                  <div>{product.name}</div>
                  <div className="flex">
                    <div className="w-16">{product.quantity_on_selected_warehouses}</div>
                    <div>{product.unit_name_on_selected_warehouses}</div>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
      <Notification
        message={t(notification.message)}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
    </div>
  );
};

export default SearchedProductList;
