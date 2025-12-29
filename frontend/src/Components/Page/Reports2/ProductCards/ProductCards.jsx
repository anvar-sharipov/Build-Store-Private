import { DateContext } from "../../../UI/DateProvider";
import { useContext, useEffect, useState, useRef } from "react";
import myAxios from "../../../axios";
import SearchInputWithLiFrontend from "../../../UI/Universal/SearchInputWithLiFrontend";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatNumber2 } from "../../../UI/formatNumber2";

const ProductCards = () => {
    const {t} = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    document.title = t("product cards")
  }, [t])

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
  }, [dateFrom, dateTo, currentWarehouse, query]);

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
                  let runningBalance = product.start_qty;

                  return (
                    <div key={product.product_id} className="border border-black dark:border-gray-600 bg-white dark:bg-gray-900 mb-6 print:dark:!text-black print:dark:!border-black">
                      {/* Заголовок */}
                      <div className="px-3 py-2 font-semibold text-sm border-b border-black dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-center">{product.product_name}</div>

                      <div className="overflow-x-auto print:dark:!text-black">
                        <table className="min-w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black">
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black">Дата</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black">Партнёр</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black">Комментарий</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black">Цена</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black" colSpan={2}>Приход</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black" colSpan={2}>Расход</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black" colSpan={2}>Возврат</th>
                              <th className="border border-black bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black" colSpan={2}>Остаток</th>
                            </tr>

                            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 print:dark:!text-black">
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold"></th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold"></th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold"></th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold"></th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold">Кол-во</th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold">Всего</th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold">Кол-во</th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold">Всего</th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold">Кол-во</th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold">Всего</th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold">Кол-во</th>
                                <th className="border border-black dark:border-gray-600 px-2 py-1 text-left font-semibold">Всего</th>
                            </tr>
                            
                          </thead>

                          <tbody>
                            {/* Начальный остаток */}
                            <tr className="bg-gray-100 dark:bg-gray-800 font-medium">
                              <td className="border border-black px-2 py-1">Остаток на начало</td>
                              <td className="border border-black px-2 py-1" />
                              <td className="border border-black px-2 py-1" />
                              <td className="border border-black px-2 py-1"></td>
                              <td className="border border-black px-2 py-1 text-right"></td>
                              <td className="border border-black px-2 py-1 text-right"></td>
                              <td className="border border-black px-2 py-1" />
                              <td className="border border-black px-2 py-1" />
                              <td className="border border-black px-2 py-1" />
                              <td className="border border-black px-2 py-1" />
                              <td className="border border-black px-2 py-1 text-right">{product.start_qty}</td>
                              <td className="border border-black px-2 py-1 text-right">{formatNumber2(product.start_qty*product.retail_price)}</td>
                            </tr>

                            {/* Операции */}
                            {product.operations.map((op, idx) => {
                              if (op.type === "prihod") runningBalance += op.qty;
                              if (op.type === "rashod") runningBalance -= op.qty;
                              if (op.type === "vozvrat") runningBalance += op.qty;

                              return (
                                <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                  <td className="border border-black px-2 py-1 whitespace-nowrap">{new Date(op.date).toLocaleDateString()}</td>
                                  <td className="border border-black px-2 py-1">{op.partner}</td>
                                  <td className="border border-black px-2 py-1">{op.comment}</td>
                                  <td className="border border-black px-2 py-1 text-right">{op.price ? op.price.toFixed(2) : "-"}</td>

                                  <td className="border border-black px-2 py-1 text-right text-green-600">{op.type === "prihod" ? op.qty : "-"}</td>
                                  <td className="border border-black px-2 py-1 text-right text-green-600">{op.type === "prihod" ? formatNumber2(op.qty * op.price) : "-"}</td>

                                  <td className="border border-black px-2 py-1 text-right text-red-600">{op.type === "rashod" ? op.qty : "-"}</td>
                                  <td className="border border-black px-2 py-1 text-right text-red-600">{op.type === "rashod" ? formatNumber2(op.qty * op.price) : "-"}</td>

                                  <td className="border border-black px-2 py-1 text-right text-blue-600">{op.type === "vozvrat" ? op.qty : "-"}</td>
                                  <td className="border border-black px-2 py-1 text-right text-blue-600">{op.type === "vozvrat" ? formatNumber2(op.qty * op.price) : "-"}</td>
                                  
                                  <td className="border border-black px-2 py-1 text-right font-semibold">{formatNumber2(runningBalance)}</td>
                                  <td className="border border-black px-2 py-1 text-right font-semibold">{formatNumber2(runningBalance * op.price)}</td>
                                </tr>
                              );
                            })}

                            {/* Итог */}
                            <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
                              <td className="border border-black px-2 py-1">Итого</td>
                              <td className="border border-black px-2 py-1"></td>
                              <td className="border border-black px-2 py-1"></td>
                              <td className="border border-black px-2 py-1"></td>

                              <td className="border border-black px-2 py-1">{product.prihod || "-"}</td>
                              <td className="border border-black px-2 py-1">{formatNumber2(product.prihod * product.retail_price)}</td>

                              <td className="border border-black px-2 py-1 text-right">{product.rashod || "-"}</td>
                              <td className="border border-black px-2 py-1 text-right">{formatNumber2(product.rashod * product.retail_price)}</td>

                              <td className="border border-black px-2 py-1 text-right">{product.vozvrat || "-"}</td>
                              <td className="border border-black px-2 py-1 text-right">{formatNumber2(product.vozvrat * product.retail_price)}</td>

                              <td className="border border-black px-2 py-1 text-right">{product.end_qty || "-"}</td>
                              <td className="border border-black px-2 py-1 text-right">{formatNumber2(product.end_qty * product.retail_price)}</td>

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
