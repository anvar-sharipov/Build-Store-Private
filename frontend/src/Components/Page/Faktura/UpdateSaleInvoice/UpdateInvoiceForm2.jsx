import { useRef, useState, useEffect } from "react";
import { formatNumber } from "../../../UI/formatNumber";
import { motion, AnimatePresence } from "framer-motion";
import SmartTooltip from "../../../SmartTooltip";
import QRDisplay from "../../../UI/QRDisplay";
import React from "react";
import { input } from "framer-motion/client";
import { AiOutlineClose } from "react-icons/ai";
import { AiOutlineDown } from "react-icons/ai";

const columnAnim = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
};

const UpdateInvoiceForm2 = ({
  visibleColumns,
  setVisibleColumns,
  invoiceTable,
  setInvoiceTable,
  priceType,
  setPriceType,
  priceInputRefs,
  quantityInputRefs,
  unitSelectRefs,
  inputRef,
  adminVisibleColumns,
  userVisibleColumns,
  handleDeleteProduct,
  setTotalPaySumm,
  invoice,
}) => {
  const [isOpen, setIsOpen] = useState(false); // dlya galochek
  const [showStockMessageIds, setShowStockMessageIds] = useState([]);
  const [numerateRow, setNumerateRow] = useState(1);

  const td_basic_class =
    "text-sm leading-tight border border-gray-300 dark:border-gray-700 " +
    "print:px-[3px] print:py-0 print:text-[13px] print:leading-none print:border-black";
  const th_basic_class =
    "print:p-[1px] print:text-[14px] print:leading-none border border-gray-300 dark:border-gray-600 dark:text-gray-200 print:border-black";

  // console.log('invoice', invoice);
  // console.log('invoiceTable', invoiceTable);

  // dlya tfoot summ START
  const products = invoiceTable.filter((p) => !p.is_gift);
  console.log("products", products);

  const gifts = invoiceTable.filter((p) => p.is_gift);

  const totalPurchaseSum = products.reduce(
    (sum, p) => sum + (p.purchase_price_summ || 0),
    0
  );
  const totalIncomeSum = products.reduce(
    (sum, p) => sum + (p.difference_price_summ || 0),
    0
  );
  const totalDiscountSum = products.reduce(
    (sum, p) => sum + (p.discount_difference_price_summ || 0),
    0
  );
  const totalMainSum = products.reduce((sum, p) => {
    return (
      sum +
      (priceType === "wholesale"
        ? p.wholesale_price_summ
        : p.retail_price_summ || 0)
    );
  }, 0);

  useEffect(() => {
    if (parseFloat(invoice.total_pay_summ) === parseFloat(totalMainSum)) {
      setTotalPaySumm(totalMainSum);
    } else {
      setTotalPaySumm(invoice.total_pay_summ);
    }
  }, [totalMainSum]);

  const totalMainVolume = products.reduce(
    (sum, p) => sum + (p.volume * p.selected_quantity || 0),
    0
  );
  const totalGiftVolume = gifts.reduce(
    (sum, p) => sum + (p.volume * p.selected_quantity || 0),
    0
  );
  const totalVolume = totalMainVolume + totalGiftVolume;

  const totalMainLength = products.reduce(
    (sum, p) => sum + (p.length * p.selected_quantity || 0),
    0
  );
  const totalGiftLength = gifts.reduce(
    (sum, p) => sum + (p.length * p.selected_quantity || 0),
    0
  );
  const totalLength = totalMainLength + totalGiftLength;

  const totalMainWidth = products.reduce(
    (sum, p) => sum + (p.width * p.selected_quantity || 0),
    0
  );
  const totalGiftWidth = gifts.reduce(
    (sum, p) => sum + (p.width * p.selected_quantity || 0),
    0
  );
  const totalWidth = totalMainWidth + totalGiftWidth;

  const totalMainHeight = products.reduce(
    (sum, p) => sum + (p.height * p.selected_quantity || 0),
    0
  );
  const totalGiftHeight = gifts.reduce(
    (sum, p) => sum + (p.height * p.selected_quantity || 0),
    0
  );
  const totalHeight = totalMainHeight + totalGiftHeight;

  // ####
  const totalMainWeight = products.reduce(
    (sum, p) => sum + (p.weight * p.selected_quantity || 0),
    0
  );
  const totalGiftWeight = gifts.reduce(
    (sum, p) => sum + (p.weight * p.selected_quantity || 0),
    0
  );
  const totalWeight = totalMainWeight + totalGiftWeight;

  // dlya tfoot summ END

  const calcGiftColSpan = () => {
    let span = 2; // цена и сумма
    if (visibleColumns.purchase) span += 2;
    if (visibleColumns.income) span += 2;
    if (visibleColumns.discount) span += 2;
    return span;
  };

  return (
    <>
      <div className="bg-yellow-400 dark:bg-gray-800 border dark:border-gray-700">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-600 hover:underline hover:text-blue-800 cursor-pointer transition flex items-center gap-1 print:hidden p-2"
        >
          <div className="flex text-center mx-auto items-center gap-2">
            <span>Настройки</span>
            <AiOutlineDown
              className={`transition-transform duration-300 transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="print:hidden p-4 shadow-sm dark:bg-gray-800 max-w-full flex flex-col gap-4 mt-2 print:p-0 print:m-0 bg-yellow-400"
            >
              {/* Тип цены и чекбоксы в одной строке, wrap для чекбоксов */}

              <div className="flex flex-wrap items-center gap-6">
                {/* Тип цены */}
                <div className="flex items-center gap-3 min-w-[180px]">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Тип цены:
                  </span>
                  <label className="flex items-center gap-1 cursor-pointer select-none text-gray-800 dark:text-gray-200">
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
                              wholesale_price_1pc:
                                item.original_wholesale_price_1pc,
                              wholesale_price_summ:
                                item.original_wholesale_price_1pc *
                                item.selected_quantity,
                              retail_price_1pc: item.original_retail_price_1pc,
                              retail_price_summ: item.original_retail_price_1pc,
                              purchase_price_summ:
                                item.purchase_price_1pc *
                                item.selected_quantity,
                              difference_price:
                                item.original_difference_price_wholesale,
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <span>Опт</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer select-none text-gray-800 dark:text-gray-200">
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
                              wholesale_price_1pc:
                                item.original_wholesale_price_1pc,
                              wholesale_price_summ:
                                item.original_wholesale_price_1pc,
                              retail_price_1pc: item.original_retail_price_1pc,
                              retail_price_summ:
                                item.original_retail_price_1pc *
                                item.selected_quantity,
                              purchase_price_summ:
                                item.purchase_price_1pc *
                                item.selected_quantity,
                              difference_price:
                                item.original_difference_price_retail,
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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <span>Розница</span>
                  </label>
                </div>

                {/* Чекбоксы */}
                <div className="flex flex-wrap gap-4 flex-1 min-w-[300px]">
                  {[
                    { key: "qr_code", label: "QR code" },
                    { key: "purchase", label: "Приход" },
                    { key: "income", label: "Доход" },
                    { key: "discount", label: "Скидка" },
                    { key: "volume", label: "Объём (м³)" },
                    { key: "weight", label: "Вес (кг)" },
                    { key: "dimensions", label: "Размеры" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer select-none text-gray-800 dark:text-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[key]}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Кнопки управления галочками с меньшими размерами */}
              <div className="flex gap-3">
                <button
                  onClick={() => setVisibleColumns(userVisibleColumns)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 text-white rounded text-sm transition"
                  type="button"
                >
                  Снять все галочки
                </button>
                <button
                  onClick={() => setVisibleColumns(adminVisibleColumns)}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400 text-white rounded transition"
                  type="button"
                >
                  Вставить все галочки
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="overflow-x-auto w-full max-w-full">
        <motion.table
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="table-auto border border-gray-300 border-collapse w-full print:border-black print:text-black print:text-[14px] print:leading-tight mt-2 print:mt-0 print:pt-0"
        >
          <thead className="bg-gray-100 dark:bg-gray-900 print:bg-white print:dark:bg-white">
            <tr className="bg-gray-100 dark:bg-gray-900">
              <th className={th_basic_class}>№</th>

              <AnimatePresence>
                {/* QR колонка */}
                {visibleColumns.qr_code && (
                  <motion.th
                    key="qr_code"
                    {...columnAnim}
                    className={th_basic_class}
                  >
                    QR
                  </motion.th>
                )}
              </AnimatePresence>

              {/* Статичные колонки */}
              <th className={th_basic_class}>Товар</th>
              <th className={th_basic_class}>Ед. изм</th>
              <th className={th_basic_class}>Кол-во</th>
              <th className={th_basic_class}>
                Цена {priceType === "wholesale" ? "опт" : "розн"} за шт.
              </th>
              <th className={th_basic_class}>
                Цена {priceType === "wholesale" ? "опт" : "розн"} сумма
              </th>

              {/* Динамические колонки с анимацией */}
              <AnimatePresence>
                {/* Purchase */}
                {visibleColumns.purchase && (
                  <React.Fragment key="purchase-group">
                    <motion.th
                      key="purchase_price"
                      {...columnAnim}
                      className={th_basic_class}
                    >
                      Цена прих. за шт.
                    </motion.th>
                    <motion.th
                      key="purchase_sum"
                      {...columnAnim}
                      className={th_basic_class}
                    >
                      Сумма прих.
                    </motion.th>
                  </React.Fragment>
                )}

                {/* Income */}
                {visibleColumns.income && (
                  <React.Fragment key="income-group">
                    <motion.th
                      key="income_price"
                      {...columnAnim}
                      className={th_basic_class}
                    >
                      Доход. за шт.
                    </motion.th>
                    <motion.th
                      key="income_sum"
                      {...columnAnim}
                      className={th_basic_class}
                    >
                      Доход. сумма
                    </motion.th>
                  </React.Fragment>
                )}

                {/* Discount */}
                {visibleColumns.discount && (
                  <React.Fragment key="discount-group">
                    <motion.th
                      key="discount_price"
                      {...columnAnim}
                      className={th_basic_class}
                    >
                      Скидка за шт.
                    </motion.th>
                    <motion.th
                      key="discount_sum"
                      {...columnAnim}
                      className={th_basic_class}
                    >
                      Скидка сумма
                    </motion.th>
                  </React.Fragment>
                )}

                {/* Volume */}
                {visibleColumns.volume && (
                  <motion.th
                    key="volume"
                    {...columnAnim}
                    className={th_basic_class}
                  >
                    Объём (м³)
                  </motion.th>
                )}

                {/* Weight */}
                {visibleColumns.weight && (
                  <motion.th
                    key="weight"
                    {...columnAnim}
                    className={th_basic_class}
                  >
                    Вес (кг)
                  </motion.th>
                )}

                {/* Dimensions */}
                {visibleColumns.dimensions && (
                  <React.Fragment key="dimensions-group">
                    <motion.th
                      key="dimensions_length"
                      {...columnAnim}
                      className={th_basic_class}
                    >
                      Длина (см)
                    </motion.th>
                    <motion.th
                      key="dimensions_width"
                      {...columnAnim}
                      className={th_basic_class}
                    >
                      Ширина (см)
                    </motion.th>
                    <motion.th
                      key="dimensions_height"
                      {...columnAnim}
                      className={th_basic_class}
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
                  <td className={td_basic_class}>
                    <div className="flex">
                      <span className="print:hidden">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="group relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                        >
                          <AiOutlineClose className="text-gray-600 dark:text-gray-300 group-hover:text-red-500 transform transition-transform duration-300 group-hover:rotate-90" />
                        </button>
                      </span>
                      <span className="relative flex items-center justify-center w-10 h-10">
                        {idx + 1}
                      </span>
                    </div>
                  </td>

                  <AnimatePresence>
                    {visibleColumns.qr_code && (
                      <motion.td
                        key={`qr-${p.id}`}
                        {...columnAnim}
                        className={td_basic_class}
                      >
                        <QRDisplay
                          code={p.qr_code}
                          mySize={44}
                          myClass="flex items-center justify-center w-20 h-20"
                        />
                      </motion.td>
                    )}
                  </AnimatePresence>

                  <td className={td_basic_class}>{p.name}</td>
                  <td className={td_basic_class}>{p.selected_unit.name}</td>

                  {/* quantity input ############################################### */}
                  <td className={td_basic_class}>
                    <input
                      disabled={invoice.isEntry}
                      type="number"
                      className={`border px-2 py-1 rounded w-20
                        ${
                          p.manually_changed_fields.not_enough
                            ? "bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-700 dark:text-red-300"
                            : p.manually_changed_fields.quantity
                            ? "bg-yellow-100 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300"
                            : "bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                        }
                        border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
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
                      onKeyDown={(e) => {
                        // Получаем список обычных товаров (не подарков)
                        const normalProducts = invoiceTable.filter(
                          (item) => item.is_gift === false
                        );

                        // Находим индекс текущего товара по id
                        const currentIndex = normalProducts.findIndex(
                          (item) => item.id === p.id
                        );
                        if (e.key === "ArrowUp") {
                          e.preventDefault();

                          if (currentIndex === 0) {
                            // Если это первый обычный товар — уходим в поле поиска
                            inputRef.current?.focus();
                            inputRef.current?.select();
                          } else if (currentIndex > 0) {
                            const prevId = normalProducts[currentIndex - 1].id;
                            setTimeout(() => {
                              quantityInputRefs.current[prevId]?.focus();
                              quantityInputRefs.current[prevId]?.select();
                            }, 0);
                          }
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextId = normalProducts[currentIndex + 1]?.id;
                          if (nextId) {
                            setTimeout(() => {
                              quantityInputRefs.current[nextId]?.focus();
                              quantityInputRefs.current[nextId]?.select();
                            }, 0);
                          }
                        } else if (e.key === "ArrowRight") {
                          e.preventDefault();
                          priceInputRefs.current[p.id]?.focus();
                          priceInputRefs.current[p.id]?.select();
                        } else if (e.key === "Enter") {
                          inputRef.current?.focus();
                          inputRef.current?.select();
                        }
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

                  {/* price 1pc input ############################################## */}
                  <td className={td_basic_class}>
                    <input
                      disabled={invoice.isEntry}
                      type="number"
                      className={`border px-2 py-1 rounded w-20
                        ${
                          p.manually_changed_fields.price
                            ? "bg-yellow-100 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300"
                            : "bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                        }
                        border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      `}
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
                      onKeyDown={(e) => {
                        // Получаем список обычных товаров (не подарков)
                        const normalProducts = invoiceTable.filter(
                          (item) => item.is_gift === false
                        );

                        // Находим индекс текущего товара по id
                        const currentIndex = normalProducts.findIndex(
                          (item) => item.id === p.id
                        );
                        if (e.key === "ArrowUp") {
                          e.preventDefault();

                          if (currentIndex === 0) {
                            // Если это первый обычный товар — уходим в поле поиска
                            inputRef.current?.focus();
                            inputRef.current?.select();
                          } else if (currentIndex > 0) {
                            const prevId = normalProducts[currentIndex - 1].id;
                            setTimeout(() => {
                              priceInputRefs.current[prevId]?.focus();
                              priceInputRefs.current[prevId]?.select();
                            }, 0);
                          }
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextId = normalProducts[currentIndex + 1]?.id;
                          if (nextId) {
                            setTimeout(() => {
                              priceInputRefs.current[nextId]?.focus();
                              priceInputRefs.current[nextId]?.select();
                            }, 0);
                          }
                        } else if (e.key === "ArrowLeft") {
                          e.preventDefault();
                          quantityInputRefs.current[p.id]?.focus();
                          quantityInputRefs.current[p.id]?.select();
                        } else if (e.key === "Enter") {
                          inputRef.current?.focus();
                          inputRef.current?.select();
                        }
                      }}
                    />
                  </td>

                  <td className={td_basic_class}>
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
                          className={td_basic_class}
                        >
                          {formatNumber(p.purchase_price_1pc)}
                        </motion.td>
                        <motion.td
                          key={`purchase-sum-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
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
                          className={td_basic_class}
                        >
                          {formatNumber(p.difference_price)}
                        </motion.td>
                        <motion.td
                          key={`income-sum-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
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
                          className={td_basic_class}
                        >
                          {formatNumber(p.discount_difference_price)}
                        </motion.td>
                        <motion.td
                          key={`discount-sum-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
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
                        className={td_basic_class}
                      >
                        {formatNumber(p.volume * p.selected_quantity, 4)}
                      </motion.td>
                    )}

                    {/* weight колонка */}
                    {visibleColumns.weight && (
                      <motion.td
                        key={`weight-${p.id}`}
                        {...columnAnim}
                        className={td_basic_class}
                      >
                        {formatNumber(p.weight * p.selected_quantity)}
                      </motion.td>
                    )}

                    {/* Dimensions колонки */}
                    {visibleColumns.dimensions && (
                      <React.Fragment key={`dimensions-${p.id}`}>
                        <motion.td
                          key={`length-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
                        >
                          {formatNumber(p.length * p.selected_quantity)}
                        </motion.td>
                        <motion.td
                          key={`width-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
                        >
                          {formatNumber(p.width * p.selected_quantity)}
                        </motion.td>
                        <motion.td
                          key={`height-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
                        >
                          {formatNumber(p.height * p.selected_quantity)}
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
                  <tr
                    key={p.id}
                    className={
                      idx === 0
                        ? "border-t-4 border-gray-300  dark:border-gray-700 print:border-black"
                        : ""
                    }
                  >
                    <td className={td_basic_class}>
                      <span className="relative flex items-center justify-center w-10 h-10">
                        {products.length + idx + 1}
                      </span>
                    </td>

                    <AnimatePresence>
                      {visibleColumns.qr_code && (
                        <motion.td
                          key={`qr-gift-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
                        >
                          <QRDisplay
                            code={p.qr_code}
                            mySize={44}
                            myClass="flex items-center justify-center w-20 h-20 rounded"
                          />
                        </motion.td>
                      )}
                    </AnimatePresence>

                    <td className={td_basic_class}>{p.name}</td>
                    <td className={td_basic_class}>{p.selected_unit.name}</td>

                    <td
                      className={`border px-2 py-1 rounded w-20 border-gray-300 dark:border-gray-700 print:border-black
                  ${p.manually_changed_fields.not_enough ? "bg-red-100" : ""}
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
                      className="p-3 border text-indigo-800 italic font-medium border-gray-300 dark:border-gray-700 dark:text-gray-400 print:border-black"
                      colSpan={calcGiftColSpan()}
                    >
                      {/* 🎁 Бесплатно для{" "}
                      <span className="font-semibold">
                        {p.gift_for_product_name}
                      </span> */}
                    </td>

                    <AnimatePresence>
                      {visibleColumns.volume && (
                        <motion.td
                          key={`volume-gift-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
                        >
                          {formatNumber(p.volume * p.selected_quantity, 4)}
                        </motion.td>
                      )}

                      {visibleColumns.weight && (
                        <motion.td
                          key={`weight-gift-${p.id}`}
                          {...columnAnim}
                          className={td_basic_class}
                        >
                          {formatNumber(p.weight * p.selected_quantity, 4)}
                        </motion.td>
                      )}

                      {visibleColumns.dimensions && (
                        <React.Fragment key={`dimensions-gift-${p.id}`}>
                          <motion.td
                            key={`length-gift-${p.id}`}
                            {...columnAnim}
                            className={td_basic_class}
                          >
                            {formatNumber(p.length * p.selected_quantity)}
                          </motion.td>
                          <motion.td
                            key={`width-gift-${p.id}`}
                            {...columnAnim}
                            className={td_basic_class}
                          >
                            {formatNumber(p.width * p.selected_quantity)}
                          </motion.td>
                          <motion.td
                            key={`height-gift-${p.id}`}
                            {...columnAnim}
                            className={td_basic_class}
                          >
                            {formatNumber(p.height * p.selected_quantity)}
                          </motion.td>
                        </React.Fragment>
                      )}
                    </AnimatePresence>
                  </tr>
                );
              }
            })}
          </tbody>
          <tfoot className="bg-gray-200 dark:bg-gray-800 font-semibold print:bg-white print:dark:bg-white">
            <tr>
              <td
                className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black text-right"
                colSpan={visibleColumns.qr_code ? 6 : 5}
              >
                Итого:
              </td>

              <td className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black">
                {formatNumber(totalMainSum)}
              </td>

              <AnimatePresence>
                {visibleColumns.purchase && (
                  <React.Fragment key="purchase-fragment">
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 print:border-black" />
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black">
                      {formatNumber(totalPurchaseSum)}
                    </motion.td>
                  </React.Fragment>
                )}

                {visibleColumns.income && (
                  <React.Fragment key="income-fragment">
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 print:border-black" />
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black">
                      {formatNumber(totalIncomeSum)}
                    </motion.td>
                  </React.Fragment>
                )}

                {visibleColumns.discount && (
                  <React.Fragment key="discount-fragment">
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 print:border-black" />
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black">
                      {formatNumber(totalDiscountSum)}
                    </motion.td>
                  </React.Fragment>
                )}

                {visibleColumns.volume && (
                  <motion.td className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black">
                    {formatNumber(totalVolume, 4)}
                  </motion.td>
                )}

                {visibleColumns.weight && (
                  <motion.td
                    key="weight"
                    className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black"
                  >
                    {formatNumber(totalWeight)}
                  </motion.td>
                )}

                {visibleColumns.dimensions && (
                  <React.Fragment key="dimensions-fragment">
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black">
                      {formatNumber(totalLength)}
                    </motion.td>
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black">
                      {formatNumber(totalWidth)}
                    </motion.td>
                    <motion.td className="p-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 print:border-black">
                      {formatNumber(totalHeight)}
                    </motion.td>
                  </React.Fragment>
                )}
              </AnimatePresence>
            </tr>
          </tfoot>
        </motion.table>
      </div>
    </>
  );
};

export default UpdateInvoiceForm2;
