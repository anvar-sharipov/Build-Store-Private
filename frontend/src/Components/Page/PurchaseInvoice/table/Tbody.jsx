import { useFormikContext } from "formik";
import QRDisplay from "../../../UI/QRDisplay";
import { formatNumber } from "../../../UI/formatNumber";
import Quantity from "./Quantity";
import { useState, useRef, useEffect } from "react";
import TDPrice from "./TDPrice";
import { HiX } from "react-icons/hi";
import { MyDecimalPrice } from "../../../UI/MyDecimalPrice";
import Decimal from "decimal.js";
import { formatNumber2 } from "../../../UI/formatNumber2";
import { useTranslation } from "react-i18next";
import calculateDiscount from "../../../UI/calculateDiscount";
import getNextDiscount from "../../../UI/getNextDiscount";

// const BASE_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const safeDecimal = (value) => {
  try {
    if (value === null || value === undefined) return new Decimal(0);

    const normalized = String(value).replace(",", ".").trim();

    if (!/^[-+]?\d*\.?\d+$/.test(normalized)) {
      return new Decimal(0);
    }

    return new Decimal(normalized);
  } catch {
    return new Decimal(0);
  }
};

const Tbody = ({ id, printVisibleColumns, visibleColumns, refs }) => {
  const { values, setFieldValue, touched, errors } = useFormikContext();
  const [focusedQuantityRow, setFocusedQuantityRow] = useState(null);
  const [focusedPriceRow, setFocusedPriceRow] = useState(null);
  const { t } = useTranslation();
  const discountRefs = useRef([]);

  const recalcGiftQuantities = (products) => {
    const giftQuantities = {};
    // Проходим по всем main товарам
    products.forEach((product) => {
      if (!product.is_gift && product.free_items?.length > 0) {
        const mainQty = Number(product.selected_quantity) || 0; // <-- используем quantity из values.products
        product.free_items.forEach((free) => {
          const giftId = free.gift_product;
          const qtyPerUnit = Number(free.quantity_per_unit) || 0;
          giftQuantities[giftId] = (giftQuantities[giftId] || 0) + mainQty * qtyPerUnit;
        });
      }
    });
    // Обновляем все gift товары
    products.forEach((product, idx) => {
      if (product.is_gift) {
        const newQty = giftQuantities[product.id] || 0;
        if (Number(product.selected_quantity) !== newQty) {
          // console.log('tut');
          // console.log('eeeee', values.products[idx]);
          products[idx].selected_quantity = newQty;
        }
      }
    });

    const updatedProducts = (products || []).filter((product) => Number(product.selected_quantity) > 0);

    // console.log("updatedProducts", updatedProducts);

    setFieldValue("products", updatedProducts);

    let send = true;
    for (let i = 0; i < updatedProducts.length; i++) {
      const product = updatedProducts[i];
      const maxQty = (product.quantity_on_selected_warehouses || 0) - (product.qty_in_drafts || 0);
      if ((values.wozwrat_or_prihod === "rashod" || values.wozwrat_or_prihod === "transfer") && Number(product.selected_quantity) > maxQty) {
        send = false;
        break;
      }
    }
    // console.log("send", send);

    // setFieldValue("send", true);
    setFieldValue("send", send);
  };

  useEffect(() => {
    if (values.wozwrat_or_prihod === "prihod") {
      const products_without_gifts = values.products.filter((p) => p.is_gift === false);
      setFieldValue("products", products_without_gifts);
      // console.log("products_without_gifts", products_without_gifts);
    }
  }, [values.wozwrat_or_prihod]);

  // const handleRemove = (id) => {
  //   const updatedProducts = values.products.filter((p) => p.id !== id);
  //   // setFieldValue("products", updatedProducts);
  //   recalcGiftQuantities(updatedProducts);
  //   refs.productRef.current?.focus();
  // };

  const handleRemove = (index) => {
    const updatedProducts = values.products.filter((_, i) => i !== index);
    recalcGiftQuantities(updatedProducts);
    refs.productRef.current?.focus();
  };

  return (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {values.products.map((product, idx) => {
        // const total_price = Number(product.selected_quantity) * Number(product.selected_price);
        // const total_purchase = Number(product.selected_quantity) * Number(product.purchase_price);
        // const income_1pc = Number(product.selected_price) - Number(product.purchase_price);
        // const income_total = income_1pc * Number(product.selected_quantity);
        // const discount_1pc = Number(product.selected_price) - Number(product.wholesale_price);
        // const total_discount = discount_1pc * Number(product.selected_quantity);
        // const total_volume = Number(product.volume) * Number(product.selected_quantity);
        // const total_weight = Number(product.weight) * Number(product.selected_quantity);
        // const total_length = Number(product.length) * Number(product.selected_quantity);
        // const total_width = Number(product.width) * Number(product.selected_quantity);
        // const total_height = Number(product.height) * Number(product.selected_quantity);

        let total_price = 0;
        if (product.discount_percent > 0) {
          total_price = MyDecimalPrice(product.selected_quantity, product.price_after_discount);
        } else {
          total_price = MyDecimalPrice(product.selected_quantity, product.selected_price);
        }

        const total_purchase = MyDecimalPrice(product.selected_quantity, product.purchase_price);

        // const income_1pc = new Decimal(product.selected_price || 0).minus(product.purchase_price || 0);

        // const discount_1pc = new Decimal(product.selected_price || 0).minus(product.wholesale_price || 0).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

        let income_1pc = 0;
        if (product.discount_percent > 0) {
          income_1pc = safeDecimal(product.price_after_discount).minus(safeDecimal(product.purchase_price));
        } else {
          income_1pc = safeDecimal(product.selected_price).minus(safeDecimal(product.purchase_price));
        }

        let discount_1pc = 0;
        if (product.discount_percent > 0) {
          discount_1pc = safeDecimal(product.price_after_discount).minus(safeDecimal(product.wholesale_price)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
        } else {
          discount_1pc = safeDecimal(product.selected_price).minus(safeDecimal(product.wholesale_price)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
        }

        const income_total = MyDecimalPrice(product.selected_quantity, income_1pc);

        const total_discount = MyDecimalPrice(product.selected_quantity, discount_1pc);

        const total_volume = Number(product.volume) * Number(product.selected_quantity);
        const total_weight = Number(product.weight) * Number(product.selected_quantity);
        const total_length = Number(product.length) * Number(product.selected_quantity);
        const total_width = Number(product.width) * Number(product.selected_quantity);
        const total_height = Number(product.height) * Number(product.selected_quantity);

        // console.log("productGGGGGG", product.quantity_discounts);

        // console.log("product.quantity_discountsYYYYYYYYY", product.quantity_discounts);

        const next_discount = getNextDiscount(product.selected_quantity, product.quantity_discounts);

        // console.log("next_discount", next_discount);

        // let disc_percent = 0;

        // const rules = [...(product.quantity_discounts || [])].sort((a, b) => Number(a.min_quantity) - Number(b.min_quantity));

        // console.log("values.products", values.products);

        // rules.forEach((rule) => {
        //   if (Number(product.selected_quantity) >= Number(rule.min_quantity)) {
        //     disc_percent = Number(rule.discount_percent);
        //   }
        // });

        // const price = Number(product.selected_price) || 0;
        // const price_after_discount = price * (1 - disc_percent / 100);
        // const discount_amount = price - price_after_discount;

        // const updatedProducts = [...values.products];

        // // обновляем строку
        // updatedProducts[idx] = {
        //   ...updatedProducts[idx],
        //   discount_percent: disc_percent,
        //   price_after_discount: price_after_discount,
        //   discount_amount: discount_amount,
        // };

        // setFieldValue("products", updatedProducts)

        // console.log("priceGGG", price);
        // console.log("disc_percentGGG", disc_percent);
        // console.log("price_after_discountGGG", price_after_discount);
        // console.log("discount_amountGGG", discount_amount);
        // console.log("values GGG", values);

        return (
          <tr
            key={`${product.id}_${idx}`}
            tabIndex={0}
            className={`focus:bg-indigo-200 dark:focus:bg-indigo-500 transition-colors ${
              focusedQuantityRow === idx || focusedPriceRow === idx ? "bg-indigo-200 dark:bg-indigo-500" : "bg-white dark:bg-gray-900"
            }`}
          >
            <td className={`pl-1 pr-2 text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black`}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)} // здесь твоя логика удаления
                  className="ml-2 text-red-500 hover:text-red-700 print:hidden"
                >
                  <HiX className="w-4 h-4" />
                </button>
                <span className="print:pl-2">{idx + 1}</span>
              </div>
            </td>

            <td className={`pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black`}>
              <div className="flex justify-between items-center">
                <span>
                  {product.is_gift && "🎁"} {product.name}
                </span>
                <span className="ml-6 print:hidden mr-10 text-sm">
                  <div className="flex justify-between">
                    <div>{t("balance_ostatok")}:</div>
                    <div className="font-medium pl-3">{formatNumber2(product.quantity_on_selected_warehouses, 0)}</div>
                  </div>

                  {/* {Number(product.qty_in_drafts) > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <div>{t("reserved")}:</div>
                      <div className="font-medium pl-3">{product.qty_in_drafts}</div>
                    </div>
                  )} */}
                  {Number(product.qty_in_drafts) > 0 && (
                    <div
                      className="flex justify-between text-amber-600 cursor-pointer hover:text-amber-800"
                      title={product.reserved_details?.length ? product.reserved_details.map((r) => `${t("faktura")} ${r.invoice_id}: ${r.qty}`).join("\n") : ""}
                    >
                      <div>{t("reserved")}:</div>
                      <div className="font-medium pl-3">{formatNumber2(product.qty_in_drafts, 0)}</div>
                    </div>
                  )}
                  {Number(product.qty_in_drafts) > 0 && (
                    <div className="flex justify-between font-semibold">
                      <div>{t("available")}:</div>
                      <div className={product.quantity_on_selected_warehouses - product.qty_in_drafts <= 0 ? "text-red-600 pl-3" : "text-green-600 pl-3"}>
                        {formatNumber2(product.quantity_on_selected_warehouses - product.qty_in_drafts, 0)}
                      </div>
                    </div>
                  )}
                </span>
              </div>
            </td>

            <td
              className={`text-center text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.image ? "hidden" : "table-cell"} ${
                !printVisibleColumns.image ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              {product.images && product.images.length > 0 && (
                <img src={`${BASE_URL}${product.images[0].image}`} alt={product.images[0].alt_text || "Product image"} className="w-20 h-20 object-cover rounded inline-block" />
              )}
            </td>

            <td
              className={`text-center mx-auto text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 ${!visibleColumns.qr_code ? "hidden" : "table-cell"} ${
                !printVisibleColumns.qr_code ? "print:hidden" : "print:table-cell"
              } print:!text-black print:!border-black`}
            >
              <QRDisplay code={product.qr_code} mySize={44} myClass="flex items-center text-center justify-center w-20 h-20 inline-block" />
            </td>
            {/* ####################################################################################################################################################################################################################### */}
            {/* ######################################################################################################################################################################################## quantity START */}
            <Quantity
              product={product}
              index={idx}
              onFocusQuantityRow={() => setFocusedQuantityRow(idx)}
              onBlurQuantityRow={() => setFocusedQuantityRow(null)}
              setFocusedQuantityRow={setFocusedQuantityRow}
              setFocusedPriceRow={setFocusedPriceRow}
              // ref={(el) => (refs.quantityRefs.current[product.id] = el)}
              ref={(el) => (refs.quantityRefs.current[idx] = el)}
              refs={refs}
            />
            {/* ######################################################################################################################################################################################## quantity END   */}
            {/* ####################################################################################################################################################################################################################### */}

            <td className="pl-1  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black">{product.unit_name_on_selected_warehouses}</td>
            <TDPrice
              product={product}
              index={idx}
              // ref={(el) => (refs.priceRefs.current[product.id] = el)}
              ref={(el) => (refs.priceRefs.current[idx] = el)}
              refs={refs}
              onFocusPriceRow={() => setFocusedPriceRow(idx)}
              onBlurPriceRow={() => setFocusedPriceRow(null)}
              setFocusedPriceRow={setFocusedPriceRow}
              setFocusedQuantityRow={setFocusedQuantityRow}
            />

            {/* discount_percent */}
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  text-left whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.discount_percent || values.wozwrat_or_prihod !== "rashod" ? "hidden" : "table-cell"
              } ${!printVisibleColumns.discount_percent || values.wozwrat_or_prihod !== "rashod" ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {product.is_gift ? (
                <div className="ml-3">-</div>
              ) : (
                <div className="flex items-start gap-4 ml-3">
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer print:hidden">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-600"
                      checked={values.products[idx]?.discount_auto}
                      disabled={values.wozwrat_or_prihod !== "rashod"}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        
                        setFieldValue(`products[${idx}].discount_auto`, checked);

                        const current = values.products[idx];
                        if (!checked) {
                          const basePrice = values.type_price === "wholesale_price" ? Number(product.wholesale_price) : Number(product.retail_price);

                          setFieldValue(`products[${idx}]`, {
                            ...current,
                            discount_auto: checked,
                            discount_percent: 0,
                            price_after_discount: 0,
                            discount_amount: 0,
                            selected_price: basePrice,
                          });

                          setTimeout(() => {
                            const input = discountRefs.current[idx];
                            if (input) {
                              input.value = 0;
                              input.focus();
                              input.select();
                            }
                          }, 0);
                        } else {
                          const qty = product.selected_quantity;
                          const { percent, price_after_discount, discount_amount } = calculateDiscount(product, qty, 0, values.type_price);
                          const basePrice = values.type_price === "wholesale_price" ? Number(product.wholesale_price) : Number(product.retail_price);
                          let paste_price = basePrice;
                          // console.log("ewewewewew percent", percent);

                          let is_custom_price = values.products[idx].is_custom_price;

                          if (percent === 0) {
                            paste_price = values.products[idx].selected_price;
                          } else {
                            is_custom_price = false;
                          }
                          // console.log("selected_price paste_price UUUUU", paste_price);
                          setFieldValue(`products[${idx}]`, {
                            ...current,
                            discount_percent: percent,
                            price_after_discount: price_after_discount,
                            discount_auto: checked,
                            selected_price: price_after_discount,
                            is_custom_price: is_custom_price,
                            discount_amount: discount_amount,
                          });
                        }
                      }}
                    />
                    <span className="text-gray-700">Auto</span>
                  </label>

                  {values.products[idx]?.discount_auto ? (
                    <div className="flex flex-col leading-tight">
                      <div className="font-medium">{values.products[idx]?.discount_percent} %</div>

                      {next_discount && (
                        <div className="text-[11px] text-green-600 font-semibold">
                          +{next_discount.need} → {next_discount.discount}%
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                      disabled={values.wozwrat_or_prihod !== "rashod"}
                        value={values.products[idx].discount_percent}
                        onChange={(e) => {
                          const value = e.target.value;
                          const num = Number(value);
                          console.log("num GGGGG", num);

                          if (!Number.isNaN(num) && num >= 0 && num <= 100) {
                            const qty = product.selected_quantity;

                            let price_after_discount = product.selected_price;
                            let discount_amount = 0;
                            if (num > 0) {
                              // console.log("values.type_price HHH", values.type_price);

                              const data = calculateDiscount(product, qty, num, values.type_price);
                              price_after_discount = data.price_after_discount;
                              console.log("price_after_discount GGGGG", price_after_discount);
                              
                              discount_amount = data.discount_amount;

                            }

                            // let selected_price = values.products[idx].selected_price;
                            let is_custom_price = values.products[idx].is_custom_price;
                            if (num > 0) {
                              // const originalPrice = values.type_price === "wholesale_price" ? Number(product.wholesale_price) : Number(product.retail_price);
                              // selected_price = originalPrice;
                              is_custom_price = false;
                              // setFieldValue(`products[${idx}].is_custom_price`, false)
                            }

                            const current = values.products[idx];

                            // console.log("selected_price UUUUU", selected_price);

                            setFieldValue(`products[${idx}]`, {
                              ...current,
                              discount_percent: num,
                              price_after_discount: price_after_discount,
                              selected_price: price_after_discount,
                              is_custom_price: is_custom_price,
                              discount_amount: discount_amount,
                            });
                          }
                        }}
                        ref={(el) => (discountRefs.current[idx] = el)}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-12 px-1 py-[1px] text-right text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono tabular-nums"
                      />
                      %
                    </div>
                  )}
                </div>
              )}
            </td>
            {/* цена всего */}
            <td className="pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 print:!text-black print:!border-black text-right whitespace-nowrap font-mono tabular-nums">
              {formatNumber2(total_price, 2)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400  text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.purchase ? "hidden" : "table-cell"
              } ${!printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(product.purchase_price, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.purchase ? "hidden" : "table-cell"
              } ${!printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_purchase, 2)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.income ? "hidden" : "table-cell"
              } ${!printVisibleColumns.income ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(income_1pc, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.income ? "hidden" : "table-cell"
              } ${!printVisibleColumns.income ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(income_total, 2)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.discount ? "hidden" : "table-cell"
              } ${!printVisibleColumns.discount ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(discount_1pc, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.discount ? "hidden" : "table-cell"
              } ${!printVisibleColumns.discount ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_discount, 2)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.volume ? "hidden" : "table-cell"
              } ${!printVisibleColumns.volume ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_volume, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.weight ? "hidden" : "table-cell"
              } ${!printVisibleColumns.weight ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_weight, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.dimensions ? "hidden" : "table-cell"
              } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_length, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.dimensions ? "hidden" : "table-cell"
              } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_width, 3)}
            </td>
            <td
              className={`pr-2  text-gray-800 dark:text-gray-200 border border-gray-900 dark:border-gray-400 text-right whitespace-nowrap font-mono tabular-nums ${
                !visibleColumns.dimensions ? "hidden" : "table-cell"
              } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"} print:!text-black print:!border-black`}
            >
              {formatNumber2(total_height, 3)}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default Tbody;
