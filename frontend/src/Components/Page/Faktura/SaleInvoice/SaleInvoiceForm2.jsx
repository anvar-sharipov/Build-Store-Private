import { useState } from "react";
import { formatNumber } from "../../../UI/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import SmartTooltip from "../../../SmartTooltip";
import QRDisplay from "../../../UI/QRDisplay";
import React from "react";

const columnAnim = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
};

const SaleInvoiceForm2 = ({
  visibleColumns,
  setVisibleColumns,
  defaultVisibleColumns,
  invoiceTable,
  setInvoiceTable,
  priceType,
  setPriceType,
  priceInputRefs,
  quantityInputRefs,
  unitSelectRefs,
}) => {
  const [showStockMessageIds, setShowStockMessageIds] = useState([]);
  const [numerateRow, setNumerateRow] = useState(1);

  const products = invoiceTable.filter((p) => !p.is_gift);
  const gifts = invoiceTable.filter((p) => p.is_gift);

  const calcGiftColSpan = () => {
    let span = 2; // цена и сумма
    if (visibleColumns.purchase) span += 2;
    if (visibleColumns.income) span += 2;
    if (visibleColumns.discount) span += 2;
    return span;
  };

  return (
    <>
      {/* radio input opt/roznisa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 print:hidden"
      >
        <label className="font-semibold">Тип цены:</label>

        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="priceType"
            value="wholesale"
            onChange={(e) => {
              setPriceType(e.target.value);
              setInvoiceTable((prev) =>
                prev.map((item) => {
                  return {
                    ...item,
                    selected_quantity: item.selected_quantity,
                    base_quantity: 1,
                    wholesale_price_1pc: item.original_wholesale_price_1pc,
                    wholesale_price_summ:
                      item.original_wholesale_price_1pc *
                      item.selected_quantity,
                    retail_price_1pc: item.original_retail_price_1pc,
                    retail_price_summ: item.original_retail_price_1pc,
                    purchase_price_summ:
                      item.purchase_price_1pc * item.selected_quantity,
                    difference_price: item.original_difference_price_wholesale,
                    difference_price_summ:
                      item.original_difference_price_wholesale *
                      item.selected_quantity,
                    discount_difference_price:
                      item.original_discount_difference_price_wholesale,
                    discount_difference_price_summ:
                      item.original_discount_difference_price_wholesale *
                      item.selected_quantity,
                    manually_changed_fields: {
                      ...item.manually_changed_fields,
                      price: false,
                    },
                  };
                })
              );
            }}
            checked={priceType === "wholesale"}
          />
          <span>Опт</span>
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="priceType"
            value="retail"
            onChange={(e) => {
              setPriceType(e.target.value);

              setInvoiceTable((prev) =>
                prev.map((item) => {
                  return {
                    ...item,
                    selected_quantity: item.selected_quantity,
                    base_quantity: 1,
                    wholesale_price_1pc: item.original_wholesale_price_1pc,
                    wholesale_price_summ: item.original_wholesale_price_1pc,
                    retail_price_1pc: item.original_retail_price_1pc,
                    retail_price_summ:
                      item.original_retail_price_1pc * item.selected_quantity,
                    purchase_price_summ:
                      item.purchase_price_1pc * item.selected_quantity,
                    difference_price: item.original_difference_price_retail,
                    difference_price_summ:
                      item.original_difference_price_retail *
                      item.selected_quantity,
                    discount_difference_price:
                      item.original_discount_difference_price_retail,
                    discount_difference_price_summ:
                      item.original_discount_difference_price_retail *
                      item.selected_quantity,
                    manually_changed_fields: {
                      ...item.manually_changed_fields,
                      price: false,
                    },
                  };
                })
              );
            }}
            checked={priceType === "retail"}
          />
          <span>Розница</span>
        </label>
      </motion.div>

      {/* 3. Галочки для UI: */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex gap-4 my-2 print:hidden"
      >
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={visibleColumns.qr_code}
            onChange={(e) =>
              setVisibleColumns((prev) => ({
                ...prev,
                qr_code: e.target.checked,
              }))
            }
          />
          QR code
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={visibleColumns.purchase}
            onChange={(e) =>
              setVisibleColumns((prev) => ({
                ...prev,
                purchase: e.target.checked,
              }))
            }
          />
          Приход
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={visibleColumns.income}
            onChange={(e) =>
              setVisibleColumns((prev) => ({
                ...prev,
                income: e.target.checked,
              }))
            }
          />
          Доход
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={visibleColumns.discount}
            onChange={(e) =>
              setVisibleColumns((prev) => ({
                ...prev,
                discount: e.target.checked,
              }))
            }
          />
          Скидка
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={visibleColumns.volume}
            onChange={(e) =>
              setVisibleColumns((prev) => ({
                ...prev,
                volume: e.target.checked,
              }))
            }
          />
          Объём (м³)
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={visibleColumns.dimensions}
            onChange={(e) =>
              setVisibleColumns((prev) => ({
                ...prev,
                dimensions: e.target.checked,
              }))
            }
          />
          Размеры
        </label>
      </motion.div>

      <div className="overflow-x-auto w-full max-w-full">
        <motion.table
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="table-auto border border-gray-300 border-collapse w-full print:border-black print:text-black print:text-[10px] print:leading-tight"
        >
          <thead className="bg-gray-100 print:bg-white">
            <tr className="bg-gray-100">
              <th className="p-2 border border-gray-300">№</th>

              <AnimatePresence>
                {/* QR колонка */}
                {visibleColumns.qr_code && (
                  <motion.th
                    key="qr_code"
                    {...columnAnim}
                    className="p-2 border border-gray-300"
                  >
                    QR
                  </motion.th>
                )}
              </AnimatePresence>

              {/* Статичные колонки */}
              <th className="p-2 border border-gray-300">Товар</th>
              <th className="p-2 border border-gray-300">Ед. изм</th>
              <th className="p-2 border border-gray-300">Кол-во</th>
              <th className="p-2 border border-gray-300">
                Цена {priceType === "wholesale" ? "опт" : "розн"} за шт.
              </th>
              <th className="p-2 border border-gray-300">
                Цена {priceType === "wholesale" ? "опт" : "розн"} сумма
              </th>

              {/* Динамические колонки с анимацией */}
              <AnimatePresence>
                {/* Группа колонок Purchase */}
                {visibleColumns.purchase && (
                  <React.Fragment key="purchase-group">
                    <motion.th
                      key="purchase_price"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Цена прих. за шт.
                    </motion.th>
                    <motion.th
                      key="purchase_sum"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Сумма прих.
                    </motion.th>
                  </React.Fragment>
                )}

                {/* Группа колонок Income */}
                {visibleColumns.income && (
                  <React.Fragment key="income-group">
                    <motion.th
                      key="income_price"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Доход. за шт.
                    </motion.th>
                    <motion.th
                      key="income_sum"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Доход. сумма
                    </motion.th>
                  </React.Fragment>
                )}

                {/* Группа колонок Discount */}
                {visibleColumns.discount && (
                  <React.Fragment key="discount-group">
                    <motion.th
                      key="discount_price"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Скидка за шт.
                    </motion.th>
                    <motion.th
                      key="discount_sum"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Скидка сумма
                    </motion.th>
                  </React.Fragment>
                )}

                {/* Колонка Volume */}
                {visibleColumns.volume && (
                  <motion.th
                    key="volume"
                    {...columnAnim}
                    className="p-2 border border-gray-300"
                  >
                    Объём (м³)
                  </motion.th>
                )}

                {/* Группа колонок Dimensions */}
                {visibleColumns.dimensions && (
                  <React.Fragment key="dimensions-group">
                    <motion.th
                      key="dimensions_length"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Длина (см)
                    </motion.th>
                    <motion.th
                      key="dimensions_width"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Ширина (см)
                    </motion.th>
                    <motion.th
                      key="dimensions_height"
                      {...columnAnim}
                      className="p-2 border border-gray-300"
                    >
                      Высота (см)
                    </motion.th>
                  </React.Fragment>
                )}
              </AnimatePresence>
            </tr>
          </thead>
          <tbody>
            {/* Основные продукты */}
            {products.map((p, idx) => {
              return (
                <tr key={p.id}>
                  <td className="p-2 border border-gray-300">{idx + 1}</td>

                  <AnimatePresence>
                    {visibleColumns.qr_code && (
                      <motion.td
                        key={`qr-${p.id}`}
                        {...columnAnim}
                        className="p-2 border border-gray-300"
                      >
                        <QRDisplay
                          code={p.qr_code}
                          mySize={64}
                          myClass="flex items-center justify-center w-20 h-20"
                        />
                      </motion.td>
                    )}
                  </AnimatePresence>

                  <td className="p-2 border border-gray-300">{p.name}</td>
                  <td className="p-2 border border-gray-300">
                    {p.selected_unit.name}
                  </td>

                  {/* quantity input */}
                  <td className="p-2 border border-gray-300">
                    <input
                      type="number"
                      className={`border px-2 py-1 rounded w-20 
                  ${
                    p.manually_changed_fields.not_enough
                      ? "bg-red-100 border-red-500"
                      : p.manually_changed_fields.quantity
                      ? "bg-yellow-100 border-yellow-500"
                      : ""
                  }
                `}
                      ref={(el) => (quantityInputRefs.current[p.id] = el)}
                      value={
                        p.selected_quantity
                          ?.toString()
                          .replace(/^0+(?=\d)/, "") || "0"
                      }
                      min={0}
                      step={1}
                      onChange={(e) => {
                        const new_quantity = parseFloat(e.target.value) || 0;
                        const factor = p.selected_unit.conversion_factor;
                        const new_base_quantity = new_quantity * factor;

                        let not_enough = false;
                        if (
                          parseFloat(p.quantity_in_stok) <
                          new_quantity * factor
                        ) {
                          not_enough = true;
                        }

                        if (not_enough) {
                          setShowStockMessageIds((prev) => [...prev, p.id]);
                          setTimeout(() => {
                            setShowStockMessageIds((prev) =>
                              prev.filter((id) => id !== p.id)
                            );
                          }, 3000);
                        }

                        const new_purchase_price_summ =
                          p.purchase_price_1pc * new_quantity;

                        const new_difference_price_summ =
                          new_quantity * (parseFloat(p.difference_price) || 0);

                        let new_price_summ;
                        if (priceType === "wholesale") {
                          new_price_summ = new_quantity * p.wholesale_price_1pc;
                        } else {
                          new_price_summ = new_quantity * p.retail_price_1pc;
                        }

                        const new_discount_price_summ =
                          new_quantity *
                          parseFloat(p.discount_difference_price);

                        const priceFieldSumm =
                          priceType === "wholesale"
                            ? "wholesale_price_summ"
                            : "retail_price_summ";

                        const updatedTable = invoiceTable.map((item) => {
                          if (item.id === p.id) {
                            return {
                              ...item,
                              selected_quantity: new_quantity,
                              base_quantity: new_base_quantity,
                              [priceFieldSumm]: new_price_summ,
                              purchase_price_summ: new_purchase_price_summ,
                              difference_price_summ: new_difference_price_summ,
                              discount_difference_price_summ:
                                new_discount_price_summ,
                              manually_changed_fields: {
                                ...item.manually_changed_fields,
                                quantity: true,
                                not_enough: not_enough,
                              },
                            };
                          } else {
                            if (item.gift_for_product_id === p.id) {
                              let not_enough_gift = false;
                              if (item.gift_for_product_id === p.id) {
                                const factor =
                                  item.selected_unit.conversion_factor;

                                if (
                                  item.quantity_in_stok / factor <
                                  item.original_quantity_per_unit * new_quantity
                                ) {
                                  not_enough_gift = true;
                                  setShowStockMessageIds((prev) => [
                                    ...prev,
                                    item.id,
                                  ]);
                                  setTimeout(() => {
                                    setShowStockMessageIds((prev) =>
                                      prev.filter((id) => id !== item.id)
                                    );
                                  }, 3000);
                                }
                              }

                              return {
                                ...item,
                                selected_quantity:
                                  item.original_quantity_per_unit *
                                  new_quantity,
                                manually_changed_fields: {
                                  ...item.manually_changed_fields,
                                  not_enough: not_enough_gift,
                                },
                              };
                            } else {
                              return item;
                            }
                          }
                        });

                        setInvoiceTable(updatedTable);
                      }}
                    />
                    {showStockMessageIds.includes(p.id) && (
                      <div className="text-sm text-red-600 mt-1 animate-pulse italic font-medium text-center">
                        На складе:{" "}
                        <span className="font-semibold">
                          {formatNumber(
                            Math.floor(
                              parseFloat(p.quantity_in_stok) /
                                parseFloat(p.selected_unit.conversion_factor)
                            )
                          )}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* price 1pc input */}
                  <td className="p-2 border border-gray-300">
                    <input
                      type="number"
                      className={`border px-2 py-1 rounded w-20 ${
                        p.manually_changed_fields.price
                          ? "bg-yellow-100 border-yellow-500"
                          : ""
                      }`}
                      value={
                        priceType === "wholesale"
                          ? p.wholesale_price_1pc
                              ?.toString()
                              .replace(/^0+(?=\d)/, "") || "0"
                          : p.retail_price_1pc
                              ?.toString()
                              .replace(/^0+(?=\d)/, "") || "0"
                      }
                      min={1}
                      step={1}
                      ref={(el) => (priceInputRefs.current[p.id] = el)}
                      onChange={(e) => {
                        const cleanedValue = e.target.value.replace(
                          /^0+(?=\d)/,
                          ""
                        );

                        const new_price_1pc = parseFloat(cleanedValue) || 0;

                        const priceField =
                          priceType === "wholesale"
                            ? "wholesale_price_1pc"
                            : "retail_price_1pc";

                        const priceFieldSumm =
                          priceType === "wholesale"
                            ? "wholesale_price_summ"
                            : "retail_price_summ";

                        const new_price_summ =
                          new_price_1pc * parseFloat(p.selected_quantity) || 0;

                        const new_discount_price =
                          new_price_1pc -
                          parseFloat(p.original_wholesale_price_1pc);

                        const new_discount_price_summ =
                          new_discount_price * parseFloat(p.selected_quantity);

                        const new_difference_price =
                          new_price_1pc -
                          (parseFloat(p.purchase_price_1pc) || 0);
                        const new_difference_price_summ =
                          new_difference_price *
                          (parseFloat(p.selected_quantity) || 0);

                        const updatedTable = invoiceTable.map((item) =>
                          item.id === p.id
                            ? {
                                ...item,
                                [priceField]: new_price_1pc,
                                [priceFieldSumm]: new_price_summ,
                                difference_price: new_difference_price,
                                difference_price_summ:
                                  new_difference_price_summ,
                                discount_difference_price: new_discount_price,
                                discount_difference_price_summ:
                                  new_discount_price_summ,
                                manually_changed_fields: {
                                  ...item.manually_changed_fields,
                                  price: true,
                                },
                              }
                            : item
                        );
                        setInvoiceTable(updatedTable);
                      }}
                    />
                  </td>

                  <td className="p-2 border border-gray-300">
                    {formatNumber(
                      priceType === "wholesale"
                        ? p.wholesale_price_summ
                        : p.retail_price_summ
                    )}
                  </td>

                  <AnimatePresence>
                    {/* Purchase колонки */}
                    {visibleColumns.purchase && (
                      <React.Fragment key={`purchase-${p.id}`}>
                        <motion.td
                          key={`purchase-price-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {formatNumber(p.purchase_price_1pc)}
                        </motion.td>
                        <motion.td
                          key={`purchase-sum-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {formatNumber(p.purchase_price_summ)}
                        </motion.td>
                      </React.Fragment>
                    )}

                    {/* Income колонки */}
                    {visibleColumns.income && (
                      <React.Fragment key={`income-${p.id}`}>
                        <motion.td
                          key={`income-price-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {formatNumber(p.difference_price)}
                        </motion.td>
                        <motion.td
                          key={`income-sum-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {formatNumber(p.difference_price_summ)}
                        </motion.td>
                      </React.Fragment>
                    )}

                    {/* Discount колонки */}
                    {visibleColumns.discount && (
                      <React.Fragment key={`discount-${p.id}`}>
                        <motion.td
                          key={`discount-price-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {formatNumber(p.discount_difference_price)}
                        </motion.td>
                        <motion.td
                          key={`discount-sum-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {formatNumber(p.discount_difference_price_summ)}
                        </motion.td>
                      </React.Fragment>
                    )}

                    {/* Volume колонка */}
                    {visibleColumns.volume && (
                      <motion.td
                        key={`volume-${p.id}`}
                        {...columnAnim}
                        className="p-2 border border-gray-300"
                      >
                        {p.volume * p.selected_quantity}
                      </motion.td>
                    )}

                    {/* Dimensions колонки */}
                    {visibleColumns.dimensions && (
                      <React.Fragment key={`dimensions-${p.id}`}>
                        <motion.td
                          key={`length-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {p.length * p.selected_quantity}
                        </motion.td>
                        <motion.td
                          key={`width-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {p.width * p.selected_quantity}
                        </motion.td>
                        <motion.td
                          key={`height-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300"
                        >
                          {p.height * p.selected_quantity}
                        </motion.td>
                      </React.Fragment>
                    )}
                  </AnimatePresence>
                </tr>
              );
            })}

            {/* Подарки */}
            {gifts.map((p, idx) => {
              if (p.is_gift === true) {
                return (
                  <tr key={p.id}>
                    <td className="p-2 border bg-indigo-100 border-gray-300">
                      {products.length + idx + 1}
                    </td>

                    <AnimatePresence>
                      {visibleColumns.qr_code && (
                        <motion.td
                          key={`qr-gift-${p.id}`}
                          {...columnAnim}
                          className="p-2 border border-gray-300 bg-indigo-100"
                        >
                          <QRDisplay
                            code={p.qr_code}
                            mySize={64}
                            myClass="flex items-center justify-center w-20 h-20 rounded"
                          />
                        </motion.td>
                      )}
                    </AnimatePresence>

                    <td className="p-2 border bg-indigo-100 border-gray-300">
                      {p.name}
                    </td>
                    <td className="p-2 border bg-indigo-100 border-gray-300">
                      {p.selected_unit.name}
                    </td>

                    <td
                      className={`border px-2 py-1 rounded w-20 border-gray-300
                  ${
                    p.manually_changed_fields.not_enough
                      ? "bg-red-100"
                      : "bg-indigo-100"
                  }
                `}
                    >
                      {p.selected_quantity}
                      {showStockMessageIds.includes(p.id) && (
                        <div className="text-sm text-red-600 mt-1 animate-pulse italic font-medium text-center">
                          На складе:{" "}
                          <span className="font-semibold">
                            {formatNumber(
                              Math.floor(
                                parseFloat(p.quantity_in_stok) /
                                  parseFloat(p.selected_unit.conversion_factor)
                              )
                            )}
                          </span>
                        </div>
                      )}
                    </td>

                    <td
                      className="p-3 border bg-indigo-100 text-indigo-800 italic font-medium border-gray-300"
                      colSpan={calcGiftColSpan()}
                    >
                      🎁 Бесплатно для{" "}
                      <span className="font-semibold">
                        {p.gift_for_product_name}
                      </span>
                    </td>

                    <AnimatePresence>
                      {visibleColumns.volume && (
                        <motion.td
                          key={`volume-gift-${p.id}`}
                          {...columnAnim}
                          className="p-2 border bg-indigo-100 border-gray-300"
                        >
                          {p.volume * p.selected_quantity}
                        </motion.td>
                      )}

                      {visibleColumns.dimensions && (
                        <React.Fragment key={`dimensions-gift-${p.id}`}>
                          <motion.td
                            key={`length-gift-${p.id}`}
                            {...columnAnim}
                            className="p-2 border bg-indigo-100 border-gray-300"
                          >
                            {p.length * p.selected_quantity}
                          </motion.td>
                          <motion.td
                            key={`width-gift-${p.id}`}
                            {...columnAnim}
                            className="p-2 border bg-indigo-100 border-gray-300"
                          >
                            {p.width * p.selected_quantity}
                          </motion.td>
                          <motion.td
                            key={`height-gift-${p.id}`}
                            {...columnAnim}
                            className="p-2 border bg-indigo-100 border-gray-300"
                          >
                            {p.height * p.selected_quantity}
                          </motion.td>
                        </React.Fragment>
                      )}
                    </AnimatePresence>
                  </tr>
                );
              }
            })}
          </tbody>
        </motion.table>
      </div>
    </>
  );
};

export default SaleInvoiceForm2;
