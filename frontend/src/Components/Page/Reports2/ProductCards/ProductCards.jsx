import { DateContext } from "../../../UI/DateProvider";
import { useContext, useEffect, useState, useRef } from "react";
import myAxios from "../../../axios";
import SearchInputWithLiFrontend from "../../../UI/Universal/SearchInputWithLiFrontend";
import { useSelector, useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatNumber2 } from "../../../UI/formatNumber2";
import { Coins } from "lucide-react";
import { ROUTES } from "../../../../routes";
import { setPrintExcel } from "../../../../app/store/ProductCardsSlice/productSortSlice";
import { ExportToExcel } from "./ExportToExcel";

const ProductCards = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { dateFrom, dateTo } = useContext(DateContext);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const { field, order, partner, agent, printExcel } = useSelector((state) => state.productSort);

  const handleOpenInvoice = (id) => {
    const url = id ? `/purchase-invoices/update/${id}` : ROUTES.PURCHASE_INVOICE_CREATE;
    window.open(url, "invoiceWindow", "width=1000,height=700,scrollbars=yes,resizable=yes");
  };

  useEffect(() => {
    document.title = t("product cards");
  }, [t]);

  useEffect(() => {
    if (printExcel && cards?.products?.length) {
      ExportToExcel(cards, dateFrom, dateTo);

      // сброс флага после экспорта
      dispatch(setPrintExcel(false));
    }
  }, [printExcel, cards]);

  const currentWarehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const query = useSelector((state) => state.search.query);

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!dateFrom || !dateTo || !currentWarehouse) return;
    // очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // ставим новый
    timeoutRef.current = setTimeout(async () => {
      setLoadingCards(true);

      try {
        const res = await myAxios.get("product_cards", {
          params: {
            warehouse_id: currentWarehouse.id,
            date_from: dateFrom,
            date_to: dateTo,
            query: query,
            field: field,
            order: order,
            partner: partner?.id,
            agent: agent?.id,
          },
        });

        setCards(res.data);
      } catch (error) {
        console.error("Ошибка загрузки карточек", error);
      } finally {
        setLoadingCards(false);
      }
    }, 800); // ⏱ 500 мс задержка

    // очистка при размонтировании
    return () => clearTimeout(timeoutRef.current);
  }, [dateFrom, dateTo, currentWarehouse, query, field, order, partner, agent]);

  useEffect(() => {
    console.log("cards", cards);
  }, [cards]);

  return (
    <div>
      {loadingCards ? (
        <div className="relative z-10 flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div>
          {cards?.warehouse_id &&
            (cards.products.length > 0 ? (
              <div>
                {cards?.products?.map((product) => {
                  let runningBalance = product.start_qty; // udalit potom

                  // table
                  let myRunningBalance = product.start_qty * product.retail_price; // na ostatok balance
                  let total_prihod = 0; // prihod itogo balance
                  let total_rashod = 0; // rashod itogo balance
                  let total_wozwrat = 0; // wozwrat itogo balance

                  return (
                    <div key={product.product_id} className="bg-white dark:bg-gray-900 mb-6 print:dark:!text-black print:dark:!border-black">
                      {/* Заголовок */}
                      {/* <div className="px-3 py-2 font-semibold text-sm border-b border-black dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-center">{product.product_name}</div> */}

                      <div className="overflow-x-auto print:dark:!text-black">
                        <table className="min-w-full border-collapse text-xs print:text-[10px] print:table-fixed break_table print_table tabular-nums">
                          <thead className="break_thead print_thead">
                            <tr className="break_tr">
                              <th className="border border-black print_th" colSpan={12}>
                                <div className="flex justify-center items-center gap-3 text-center">
                                  <span>{product.product_name}</span>
                                  <span className="flex items-center gap-1">
                                    <Coins className="w-4 h-4 text-orange-400" />
                                    {product.retail_price ? product.retail_price.toFixed(2) : "-"}
                                  </span>
                                </div>
                              </th>
                            </tr>
                            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black break_tr">
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black print_th">Дата</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black print_th">Партнёр</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black print_th">Комментарий</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black print_th">Цена</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black print_th" colSpan={2}>
                                Приход
                              </th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black print_th" colSpan={2}>
                                Возврат
                              </th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black print_th" colSpan={2}>
                                Расход
                              </th>
                              
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black print_th" colSpan={2}>
                                Остаток
                              </th>
                            </tr>

                            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black break_tr">
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th"></th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th"></th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th"></th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th"></th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th">Кол-во</th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th">Всего</th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th">Кол-во</th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th">Всего</th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th">Кол-во</th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th">Всего</th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th">Кол-во</th>
                              <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold print_th">Всего</th>
                            </tr>
                          </thead>

                          <tbody>
                            {/* Начальный остаток */}
                            <tr className="bg-gray-100 dark:bg-gray-800 font-medium break_tr">
                              <td className="border border-black px-2 py-1 print_td">Остаток на начало</td>
                              <td className="border border-black px-2 py-1 print_td" />
                              <td className="border border-black px-2 py-1 print_td" />
                              <td className="border border-black px-2 py-1 print_td"></td>
                              <td className="border border-black px-2 py-1 text-right print_td"></td>
                              <td className="border border-black px-2 py-1 text-right print_td"></td>
                              <td className="border border-black px-2 py-1 print_td" />
                              <td className="border border-black px-2 py-1 print_td" />
                              <td className="border border-black px-2 py-1 print_td" />
                              <td className="border border-black px-2 py-1 print_td" />
                              <td className="border border-black px-2 py-1 text-right print_td whitespace-nowrap">{product.start_qty}</td>
                              <td className="border border-black px-2 py-1 text-right print_td whitespace-nowrap">{formatNumber2(product.start_qty * product.retail_price)}</td>
                            </tr>

                            {/* Операции */}
                            {product.operations.map((op, idx) => {
                              if (op.type === "prihod") {
                                runningBalance += op.qty;
                                myRunningBalance += op.qty * op.price;
                                total_prihod += op.sum;
                              }
                              if (op.type === "rashod") {
                                runningBalance -= op.qty;
                                myRunningBalance -= op.qty * op.price;
                                total_rashod += op.sum;
                              }
                              if (op.type === "wozwrat") {
                                runningBalance += op.qty;
                                myRunningBalance += op.qty * op.price;
                                total_wozwrat += op.sum;
                              }
                            
                              
                              // {formatNumber2(myRunningBalance)}
                              return (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-800 break_tr cursor-pointer"
                                  onDoubleClick={() => {
                                    handleOpenInvoice(op.invoice_id);
                                  }}
                                >
                                  <td className="border border-black px-2 py-1 whitespace-nowrap print_td">{new Date(op.date).toLocaleDateString()}</td>
                                  <td className="border border-black px-2 py-1 print_td">{op.partner}</td>
                                  <td className="border border-black px-2 py-1 print_td">№{op.invoice_id} {op.comment}</td>
                                  <td
                                    className={`border border-black px-2 py-1 text-right print_td whitespace-nowrap ${
                                      op.price < product.retail_price ? "bg-red-200" : op.price > product.retail_price ? "bg-green-200" : ""
                                    }`}
                                  >
                                    {op.price ? formatNumber2(op.price) : "-"}
                                  </td>

                                  <td className="border border-black px-2 py-1 text-right text-green-700 dark:text-green-400 print_td whitespace-nowrap">{op.type === "prihod" ? op.qty : "-"}</td>
                                  <td className="border border-black px-2 py-1 text-right text-green-700 dark:text-green-400 print_td whitespace-nowrap">{op.type === "prihod" ? formatNumber2(op.qty * op.price) : "-"}</td>

                                  <td className="border border-black px-2 py-1 text-right text-red-700 dark:text-red-400 print_td whitespace-nowrap">{op.type === "wozwrat" ? op.qty : "-"}</td>
                                  <td className="border border-black px-2 py-1 text-right text-red-700 dark:text-red-400 print_td whitespace-nowrap">{op.type === "wozwrat" ? formatNumber2(op.qty * op.price) : "-"}</td>
                                  
                                  <td className="border border-black px-2 py-1 text-right text-blue-700 dark:text-blue-400 print_td whitespace-nowrap">{op.type === "rashod" ? op.qty : "-"}</td>
                                  <td className="border border-black px-2 py-1 text-right text-blue-700 dark:text-blue-400 print_td whitespace-nowrap">{op.type === "rashod" ? formatNumber2(op.qty * op.price) : "-"}</td>

                                  <td className="border border-black px-2 py-1 text-right font-semibold print_td whitespace-nowrap">{formatNumber2(runningBalance, 0)}</td>
                                  <td className="border border-black px-2 py-1 text-right font-semibold print_td whitespace-nowrap">{formatNumber2(runningBalance * product.retail_price)}</td>
                                </tr>
                              );
                            })}

                            {/* Итог */}
                            <tr className="bg-gray-200 dark:bg-gray-700 font-bold break_tr">
                              <td className="border border-black px-2 py-1 print_td">Итого</td>
                              <td className="border border-black px-2 py-1 print_td"></td>
                              <td className="border border-black px-2 py-1 print_td"></td>
                              <td className="border border-black px-2 py-1 print_td"></td>

                              <td className="border border-black px-2 py-1 print_td whitespace-nowrap">{product.prihod || "-"}</td>
                              <td className="border border-black px-2 py-1 print_td whitespace-nowrap">{formatNumber2(total_prihod)}</td>

                              <td className="border border-black px-2 py-1 text-right print_td whitespace-nowrap">{product.wozwrat || "-"}</td>
                              <td className="border border-black px-2 py-1 text-right print_td whitespace-nowrap">{formatNumber2(total_wozwrat)}</td>
                              
                              <td className="border border-black px-2 py-1 text-right print_td whitespace-nowrap">{product.rashod || "-"}</td>
                              <td className="border border-black px-2 py-1 text-right print_td whitespace-nowrap">{formatNumber2(total_rashod)}</td>

                              <td className="border border-black px-2 py-1 text-right print_td whitespace-nowrap">
                                {formatNumber2(runningBalance, 0) || "-"}
                                {/* product.end_qty*/}
                              </td>
                              <td className="border border-black px-2 py-1 text-right print_td whitespace-nowrap">
                                {formatNumber2(runningBalance * product.retail_price)}
                                {/* product.end_qty*/}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center">{t("no data")}</div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductCards;
