import { useContext, useEffect, useState, useRef } from "react";
import { DateContext } from "../../../UI/DateProvider";
import MyFormatDate from "../../../UI/MyFormatDate";
import myAxios from "../../../axios";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatNumber2 } from "../../../UI/formatNumber2";
import { useSearchParams } from "react-router-dom";
import { fetchWarehouses } from "../../../fetchs/optionsFetchers";
import { ROUTES_RAPORT } from "../../../../routes";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export const BuhOborotTowarow = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [loadingFetchProducts, setLoadingFetchProducts] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const selectedProductId = searchParams.get("selected");
  console.log("selectedProductId", selectedProductId);

  const warehouseId = searchParams.get("warehouse");
  const withWozwrat = searchParams.get("withWozwrat") === "1";
  const categories = searchParams.get("categories");
  const products_ids = searchParams.get("products");
  const emptyTurnovers = searchParams.get("emptyTurnovers");

  const rowRefs = useRef({});

  // Загрузка складов
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const data = await fetchWarehouses();
        setWarehouses(data);
      } catch (err) {
        console.error("Ошибка при загрузке складов:", err);
      }
    };
    loadWarehouses();
  }, []);

  // Установка выбранного склада
  useEffect(() => {
    if (!warehouseId) {
      setSelectedWarehouse(null);
      return;
    }
    const wh = warehouses.find((w) => String(w.id) === warehouseId);
    setSelectedWarehouse(wh);
  }, [warehouseId, warehouses]);

  // Fetch BUH OBOROT
  const fetchBuhOborotTowarow = async () => {
    setLoadingFetchProducts(true);
    try {
      const res = await myAxios.get("BuhOborotTowarow", {
        params: {
          dateFrom,
          dateTo,
          warehouse: warehouseId,
          withWozwrat: withWozwrat,
          categories: categories,
          products: products_ids,
          emptyTurnovers: emptyTurnovers,
        },
      });

      setProducts(res.data.data);

      // Группируем товары по категориям
      const grouped = [];
      let currentCategory = null;
      let counter = 1;
      let categoryTotal = {
        selected_quantity: 0,
        totalAmountStart: 0,
        oborot_selected_quantity_girdeji: 0,
        totalAmountIncome: 0,
        oborot_selected_quantity_chykdajy: 0,
        totalAmountOutcome: 0,
        end_selected_quantity: 0,
        totalAmountEnd: 0,
      };

      // Сортируем по категориям
      const sortedProducts = [...res.data.data].sort((a, b) => {
        const catA = a.category || "Без категории";
        const catB = b.category || "Без категории";
        return catA.localeCompare(catB);
      });

      // Создаем структуру с категориями и totals
      sortedProducts.forEach((product, idx) => {
        const category = product.category || "Без категории";
        const price = parseFloat(product.price) || 0;

        // Если категория меняется и это не первая категория
        if (category !== currentCategory && currentCategory !== null) {
          // Добавляем итог предыдущей категории
          grouped.push({
            type: "total",
            ...categoryTotal,
            id: currentCategory + "_total",
          });

          // Сбрасываем totals
          categoryTotal = {
            selected_quantity: 0,
            totalAmountStart: 0,
            oborot_selected_quantity_girdeji: 0,
            totalAmountIncome: 0,
            oborot_selected_quantity_chykdajy: 0,
            totalAmountOutcome: 0,
            end_selected_quantity: 0,
            totalAmountEnd: 0,
          };

          // Если хотите, чтобы каждая категория начиналась с 1, раскомментируйте:
          // counter = 1;
        }

        if (category !== currentCategory) {
          // Добавляем категорию
          grouped.push({
            type: "category",
            name: category,
            id: category,
          });
          currentCategory = category;
        }

        // Добавляем товар
        grouped.push({
          type: "product",
          ...product,
          displayNumber: counter++,
        });

        // Накопление totals для категории
        const selectedQty = parseFloat(product.selected_quantity) || 0;
        const girdejiQty = parseFloat(product.oborot_selected_quantity_girdeji) || 0;
        const chykdajyQty = parseFloat(product.oborot_selected_quantity_chykdajy) || 0;
        const endQty = parseFloat(product.end_selected_quantity) || 0;

        categoryTotal.selected_quantity += selectedQty;
        categoryTotal.totalAmountStart += price * selectedQty;

        categoryTotal.oborot_selected_quantity_girdeji += girdejiQty;
        categoryTotal.totalAmountIncome += price * girdejiQty;

        categoryTotal.oborot_selected_quantity_chykdajy += chykdajyQty;
        categoryTotal.totalAmountOutcome += price * chykdajyQty;

        categoryTotal.end_selected_quantity += endQty;
        categoryTotal.totalAmountEnd += price * endQty;

        // Если это последний товар
        if (idx === sortedProducts.length - 1) {
          // Добавляем итог последней категории
          grouped.push({
            type: "total",
            ...categoryTotal,
            id: currentCategory + "_total",
          });

          // Подсчитываем общий итог по всем категориям
          const grandTotal = {
            type: "grand_total",
            selected_quantity: 0,
            totalAmountStart: 0,
            oborot_selected_quantity_girdeji: 0,
            totalAmountIncome: 0,
            oborot_selected_quantity_chykdajy: 0,
            totalAmountOutcome: 0,
            end_selected_quantity: 0,
            totalAmountEnd: 0,
          };

          // Суммируем все totals
          grouped.forEach((item) => {
            if (item.type === "total") {
              grandTotal.selected_quantity += item.selected_quantity;
              grandTotal.totalAmountStart += item.totalAmountStart;
              grandTotal.oborot_selected_quantity_girdeji += item.oborot_selected_quantity_girdeji;
              grandTotal.totalAmountIncome += item.totalAmountIncome;
              grandTotal.oborot_selected_quantity_chykdajy += item.oborot_selected_quantity_chykdajy;
              grandTotal.totalAmountOutcome += item.totalAmountOutcome;
              grandTotal.end_selected_quantity += item.end_selected_quantity;
              grandTotal.totalAmountEnd += item.totalAmountEnd;
            }
          });

          // Добавляем общий итог в конце
          grouped.push({
            type: "grand_total",
            ...grandTotal,
            id: "grand_total",
          });
        }
      });

      setGroupedProducts(grouped);
    } catch (err) {
      console.log("cant getBuhOborotTowarow", err);
    } finally {
      setLoadingFetchProducts(false);
    }
  };

  useEffect(() => {
    document.title = t("BuhOborotTowarow");
  }, []);

  useEffect(() => {
    if (!dateFrom || !dateTo || !warehouseId) return;
    setGroupedProducts([]);
    fetchBuhOborotTowarow();
  }, [dateFrom, dateTo, warehouseId, withWozwrat, categories, products_ids, emptyTurnovers]);

  // const getDetailProductOborot = async (productId) => {
  //   try {
  //     const res = await myAxios.get("getDetailProductOborot", {
  //       params: {
  //         productId,}
  //       });
  //   } catch (err) {
  //     console.log("cant get getDetailProductOborot", err);

  //   }
  // }

  const showDetailProductOborot = (productId) => {
    const params = new URLSearchParams(location.search);
    params.set("selected", productId);

    // обновляем URL СПИСКА
    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );

    // переходим в detail
    // navigate(ROUTES_RAPORT.DETAIL_PRODUCT_OBOROT.replace(":id", productId));
    navigate(ROUTES_RAPORT.DETAIL_PRODUCT_OBOROT.replace(":id", productId).replace(":warehouseId", warehouseId));
  };

  useEffect(() => {
    if (!selectedProductId) return;

    const row = rowRefs.current[selectedProductId];

    if (row) {
      row.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      row.focus({ preventScroll: true });
    }
  }, [groupedProducts, selectedProductId]);

  return (
    <div className="p-4">
      {/* HEADER */}
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold dark:text-white text-gray-800">{t("buh oborot towar2")}</h1>
        {selectedWarehouse && (
          <div className="mt-2 text-gray-600 dark:text-gray-400">
            {t("choosed_warehouse")}: <span className="font-semibold">{selectedWarehouse?.name}</span>
          </div>
        )}
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {MyFormatDate(dateFrom)} — {MyFormatDate(dateTo)}
        </p>
        {!withWozwrat ? (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Отчет без учета возвратов</p>
        ) : (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Отчет с учетом возвратов</p>
        )}
      </motion.div>

      {/* CONTENT */}
      {groupedProducts.length > 0 ? (
        <div className="w-full bg-white dark:bg-gray-900 rounded-md p-2 overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200 dark:border-gray-700 text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th rowSpan={2} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">
                  №
                </th>
                <th rowSpan={2} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">
                  Haryt-maddy gymmatlyklar Ady, häsiýeti
                </th>
                <th rowSpan={2} className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                  Ölçeg birligi
                </th>
                <th rowSpan={2} className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                  SATYS BAHA
                </th>

                <th colSpan={2} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                  Hasabat döwrüniň başyna galyndy
                </th>
                <th colSpan={2} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                  Hasabat döwründäki girdeji
                </th>
                <th colSpan={2} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                  Hasabat döwründäki çykdajy
                </th>
                <th colSpan={2} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">
                  Hasabat döwrüniň ahyryna galyndy
                </th>
              </tr>

              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2">mukdary</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2">möçberi</th>

                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2">mukdary</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2">möçberi</th>

                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2">mukdary</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2">möçberi</th>

                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2">mukdary</th>
                <th className="border border-gray-200 dark:border-gray-700 px-3 py-2">möçberi</th>
              </tr>
            </thead>

            <tbody>
              {groupedProducts.map((item, idx) => {
                if (item.type === "category") {
                  // Строка категории
                  return (
                    <tr key={`cat-${item.id}`} className="bg-gray-100 dark:bg-gray-700 font-semibold">
                      <td colSpan={12} className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                        {item.name}
                      </td>
                    </tr>
                  );
                } else if (item.type === "total") {
                  // Итог по категории
                  return (
                    <tr key={`total-${item.id}`} className="bg-gray-200 dark:bg-gray-600 font-semibold">
                      <td colSpan={4} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">
                        Итого по категории:
                      </td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.selected_quantity, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.totalAmountStart)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.oborot_selected_quantity_girdeji, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.totalAmountIncome)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.oborot_selected_quantity_chykdajy, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.totalAmountOutcome)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.end_selected_quantity, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.totalAmountEnd)}</td>
                    </tr>
                  );
                } else if (item.type === "grand_total") {
                  // Общий итог
                  return (
                    <tr key="grand-total" className="bg-blue-50 dark:bg-blue-900/30 font-bold">
                      <td colSpan={4} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">
                        ВСЕГО:
                      </td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.selected_quantity, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.totalAmountStart)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.oborot_selected_quantity_girdeji, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.totalAmountIncome)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.oborot_selected_quantity_chykdajy, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.totalAmountOutcome)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.end_selected_quantity, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(item.totalAmountEnd)}</td>
                    </tr>
                  );
                } else {
                  // Строка товара
                  const p = item;
                  const price = parseFloat(p.price) || 0;
                  const selectedQty = parseFloat(p.selected_quantity) || 0;
                  const girdejiQty = parseFloat(p.oborot_selected_quantity_girdeji) || 0;
                  const chykdajyQty = parseFloat(p.oborot_selected_quantity_chykdajy) || 0;
                  const endQty = parseFloat(p.end_selected_quantity) || 0;

                  return (
                    <tr
                      ref={(el) => {
                        if (el) rowRefs.current[p.id] = el;
                      }}
                      tabIndex={0}
                      key={p.id || idx}
                      className={`odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 
                      cursor-pointer
                    hover:bg-indigo-100 dark:hover:bg-indigo-900
                    focus:bg-indigo-300 dark:focus:bg-indigo-700
                      focus:outline-none`}
                      onDoubleClick={() => showDetailProductOborot(p.id)}
                    >
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">{item.displayNumber}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">{p.name}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-center">{p.unit}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{price > 0 ? formatNumber2(price) : "-"}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(selectedQty, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(price * selectedQty)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(girdejiQty, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(price * girdejiQty)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(chykdajyQty, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(price * chykdajyQty)}</td>

                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(endQty, 0)}</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-right">{formatNumber2(price * endQty)}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      ) : warehouseId ? (
        loadingFetchProducts ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t("no products found") || "Товары не найдены"}</div>
        )
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t("choose_warehouse") || "Выберите склад для отображения данных"}</div>
      )}
    </div>
  );
};
