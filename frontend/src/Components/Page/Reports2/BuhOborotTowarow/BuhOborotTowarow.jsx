import { useContext, useEffect, useState, useRef, useMemo } from "react";
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

import { setPrintExcel } from "../../../../app/store/buhOborotFiltersSlice";
import { useSelector, useDispatch } from "react-redux";

export const BuhOborotTowarow = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [loadingFetchProducts, setLoadingFetchProducts] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();
  const printExcel = useSelector((state) => state.buhOborot.printExcel);

  useEffect(() => {
    if (!printExcel) return;

    const downloadExcel = async () => {
      try {
        console.log("START EXCEL");

        // await generateAndDownloadExcel();
        // или
        // await myAxios.get("/buh-oborot/excel", { responseType: "blob" });
        const warehouseParam = selectedWarehouses.length > 0 ? selectedWarehouses.join(",") : warehouseId || "";
        const res = await myAxios.get("BuhOborotTowarowExcel", {
          params: {
            dateFrom,
            dateTo,
            warehouses: warehouseParam, // Изменено на множественный параметр
            // withWozwrat: withWozwrat,
            categories: categories,
            products: products_ids,
            emptyTurnovers: emptyTurnovers,
          },
          responseType: "blob",
        });
        // ===== СКАЧИВАНИЕ =====
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `buh_oborot_${dateFrom}_${dateTo}.xlsx`;
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Excel error", e);
      } finally {
        dispatch(setPrintExcel(false)); // ✅ СБРОС ПОСЛЕ
      }
    };

    downloadExcel();
  }, [printExcel, dispatch]);

  const printStylesThTd = "print:border-black print:px-1 print:py-0.5 print:text-[10px] print:leading-none border-black px-1 py-0.5 text-[12px] leading-none";

  const [searchParams] = useSearchParams();
  const selectedProductId = searchParams.get("selected");

  // Получаем параметры для множественного выбора складов
  const warehouseIdsParam = searchParams.get("warehouses");
  const selectedWarehouses = useMemo(() => {
    return warehouseIdsParam ? warehouseIdsParam.split(",") : [];
  }, [warehouseIdsParam]);

  // Для обратной совместимости - если используется старый параметр warehouse
  const warehouseId = searchParams.get("warehouse");

  // const withWozwrat = searchParams.get("withWozwrat") === "1";
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

  // Получаем выбранные склады для отображения
  const getSelectedWarehousesInfo = useMemo(() => {
    return selectedWarehouses.map((id) => warehouses.find((w) => String(w.id) === id)).filter(Boolean);
  }, [selectedWarehouses, warehouses]);

  // Для обратной совместимости - если используется старый параметр
  useEffect(() => {
    if (warehouseId && selectedWarehouses.length === 0) {
      // Если есть старый параметр warehouse, но нет warehouses
      // Можно автоматически переключить или оставить как есть
      console.log("Используется старый параметр warehouse:", warehouseId);
    }
  }, [warehouseId, selectedWarehouses]);

  // Fetch BUH OBOROT
  const fetchBuhOborotTowarow = async () => {
    setLoadingFetchProducts(true);
    try {
      // Используем warehouses для множественного выбора
      // Для обратной совместимости проверяем оба параметра
      const warehouseParam = selectedWarehouses.length > 0 ? selectedWarehouses.join(",") : warehouseId || "";

      const res = await myAxios.get("BuhOborotTowarow", {
        params: {
          dateFrom,
          dateTo,
          warehouses: warehouseParam, // Изменено на множественный параметр
          // withWozwrat: withWozwrat,
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
        oborot_selected_quantity_wozwrat: 0,
        totalAmountWozwrat: 0,
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
            oborot_selected_quantity_wozwrat: 0,
            totalAmountWozwrat: 0,
            end_selected_quantity: 0,
            totalAmountEnd: 0,
          };
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
        const wozwratQty = parseFloat(product.oborot_selected_quantity_wozwrat) || 0;
        const endQty = parseFloat(product.end_selected_quantity) || 0;

        // ✅ ИСПРАВЛЕНО: используем фактические суммы из API
        categoryTotal.selected_quantity += selectedQty;
        categoryTotal.totalAmountStart += price * selectedQty; // начальный остаток по текущей цене

        categoryTotal.oborot_selected_quantity_girdeji += girdejiQty;
        categoryTotal.totalAmountIncome += parseFloat(product.oborot_girdeji_price) || 0; // ← ФАКТИЧЕСКАЯ СУММА

        categoryTotal.oborot_selected_quantity_chykdajy += chykdajyQty;
        categoryTotal.totalAmountOutcome += parseFloat(product.oborot_chykdajy_price) || 0; // ← ФАКТИЧЕСКАЯ СУММА

        categoryTotal.oborot_selected_quantity_wozwrat += wozwratQty;
        categoryTotal.totalAmountWozwrat += parseFloat(product.oborot_wozwrat_price) || 0; // ← ФАКТИЧЕСКАЯ СУММА

        categoryTotal.end_selected_quantity += endQty;
        // categoryTotal.totalAmountEnd += price * endQty; // конечный остаток по текущей цене
        categoryTotal.totalAmountEnd = categoryTotal.totalAmountStart + categoryTotal.totalAmountIncome - categoryTotal.totalAmountOutcome + categoryTotal.totalAmountWozwrat;

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
            oborot_selected_quantity_wozwrat: 0,
            totalAmountWozwrat: 0,
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
              grandTotal.oborot_selected_quantity_wozwrat += item.oborot_selected_quantity_wozwrat;
              grandTotal.totalAmountWozwrat += item.totalAmountWozwrat;
              grandTotal.end_selected_quantity += item.end_selected_quantity;
              // grandTotal.totalAmountEnd += item.totalAmountEnd;
              grandTotal.totalAmountEnd = grandTotal.totalAmountStart + grandTotal.totalAmountIncome - grandTotal.totalAmountOutcome + grandTotal.totalAmountWozwrat;
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
    // Проверяем, выбран ли хотя бы один склад
    const hasSelectedWarehouses = selectedWarehouses.length > 0 || warehouseId;

    if (!dateFrom || !dateTo || !hasSelectedWarehouses) return;

    setGroupedProducts([]);
    fetchBuhOborotTowarow();
  }, [dateFrom, dateTo, selectedWarehouses, warehouseId, categories, products_ids, emptyTurnovers]);

  const showDetailProductOborot = (productId) => {
    const params = new URLSearchParams(location.search);
    params.set("selected", productId);

    // Для детального просмотра передаем ВСЕ выбранные склады
    const warehousesParam = selectedWarehouses.length > 0 ? selectedWarehouses.join(",") : warehouseId || "";

    // обновляем URL СПИСКА
    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true },
    );

    // переходим в detail с warehouses параметром в query string
    navigate({
      pathname: ROUTES_RAPORT.DETAIL_PRODUCT_OBOROT.replace(":id", productId),
      search: `?warehouses=${warehousesParam}`,
    });
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
    <div>
      {/* HEADER */}
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-md font-bold dark:text-white text-gray-800">{t("buh oborot towar2")}</h1>

        {/* Отображение выбранных складов */}
        {getSelectedWarehousesInfo.length > 0 && (
          <div className="mt-2 print:mt-0 text-gray-600 dark:text-gray-400">
            {t("choosed_warehouse") || "Выбранные склады"}:
            <div className="flex flex-wrap gap-2 mt-1 print:mt-0 justify-center">
              {getSelectedWarehousesInfo.map((wh) => (
                <span key={wh.id} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-sm">
                  {wh.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Для обратной совместимости - если используется старый параметр */}
        {warehouseId && selectedWarehouses.length === 0 && (
          <div className="mt-2 print:mt-0 text-gray-600 dark:text-gray-400">
            {t("choosed_warehouse")}: <span className="font-semibold">{warehouses.find((w) => String(w.id) === warehouseId)?.name || `ID: ${warehouseId}`}</span>
          </div>
        )}

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {MyFormatDate(dateFrom)} — {MyFormatDate(dateTo)}
        </p>
        {/* {!withWozwrat ? (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Отчет без учета возвратов</p>
        ) : (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Отчет с учетом возвратов</p>
        )} */}
      </motion.div>

      {/* CONTENT */}
      {groupedProducts.length > 0 ? (
        <div className="w-full bg-white dark:bg-gray-900 rounded-md p-2 overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-black dark:border-gray-700 text-sm tabular-nums text-[10px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th rowSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-left ${printStylesThTd}`}>
                  №
                </th>
                <th rowSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-left ${printStylesThTd}`}>
                  {t("product name")}
                </th>
                <th rowSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>
                  {t("uni")}
                </th>
                <th rowSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>
                  {t("Price")}
                </th>

                <th colSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-center ${printStylesThTd}`}>
                  {t("Opening balance")}
                </th>
                <th colSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-center ${printStylesThTd}`}>
                  {t("prihod")}
                </th>
                <th colSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-center ${printStylesThTd}`}>
                  {t("wozwrat")}
                </th>
                <th colSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-center ${printStylesThTd}`}>
                  {t("rashod")}
                </th>

                <th colSpan={2} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-center ${printStylesThTd}`}>
                  {t("Closing balance")}
                </th>
              </tr>

              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("quantity")}</th>
                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("total")}</th>

                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("quantity")}</th>
                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("total")}</th>

                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("quantity")}</th>
                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("total")}</th>

                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("quantity")}</th>
                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("total")}</th>

                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("quantity")}</th>
                <th className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{t("total")}</th>
              </tr>
            </thead>

            <tbody>
              {groupedProducts.map((item, idx) => {
                if (item.type === "category") {
                  return (
                    <tr key={`cat-${item.id}`} className="bg-gray-100 dark:bg-gray-700 font-semibold">
                      <td colSpan={14} className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>
                        {item.name}
                      </td>
                    </tr>
                  );
                } else if (item.type === "total") {
                  return (
                    <tr key={`total-${item.id}`} className="bg-gray-200 dark:bg-gray-600 font-semibold">
                      <td colSpan={4} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right ${printStylesThTd}`}>
                        {t("category total")}:
                      </td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.selected_quantity, 2)}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountStart)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>
                        {formatNumber2(item.oborot_selected_quantity_girdeji, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountIncome)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>
                        {formatNumber2(item.oborot_selected_quantity_wozwrat, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountWozwrat)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>
                        {formatNumber2(item.oborot_selected_quantity_chykdajy, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountOutcome)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.end_selected_quantity, 2)}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountEnd)}</td>
                    </tr>
                  );
                } else if (item.type === "grand_total") {
                  console.log("item", item);

                  return (
                    <tr key="grand-total" className="bg-blue-50 dark:bg-blue-900/30 font-bold">
                      <td colSpan={4} className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right ${printStylesThTd}`}>
                        {t("TOTAL")}:
                      </td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.selected_quantity, 2)}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountStart)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>
                        {formatNumber2(item.oborot_selected_quantity_girdeji, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountIncome)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>
                        {formatNumber2(item.oborot_selected_quantity_wozwrat, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountWozwrat)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>
                        {formatNumber2(item.oborot_selected_quantity_chykdajy, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountOutcome)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.end_selected_quantity, 2)}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(item.totalAmountEnd)}</td>
                    </tr>
                  );
                } else {
                  const p = item;
                  const price = parseFloat(p.price) || 0;
                  const selectedQty = parseFloat(p.selected_quantity) || 0;
                  const girdejiQty = parseFloat(p.oborot_selected_quantity_girdeji) || 0;
                  const chykdajyQty = parseFloat(p.oborot_selected_quantity_chykdajy) || 0;
                  const wozwratQty = parseFloat(p.oborot_selected_quantity_wozwrat) || 0;
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
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{item.displayNumber}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 ${printStylesThTd}`}>{p.name}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-center ${printStylesThTd}`}>{p.unit}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{price > 0 ? formatNumber2(price) : "-"}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(selectedQty, 2)}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(price * selectedQty)}</td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap text-green-700 dark:text-greed-400 ${printStylesThTd}`}>
                        {formatNumber2(girdejiQty, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap text-green-700 dark:text-greed-400 ${printStylesThTd}`}>
                        {formatNumber2(price * girdejiQty)}
                      </td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap text-red-700 dark:text-red-400 ${printStylesThTd}`}>
                        {formatNumber2(wozwratQty, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap text-red-700 dark:text-red-400 ${printStylesThTd}`}>
                        {formatNumber2(price * wozwratQty)}
                      </td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap text-blue-700 dark:text-blue-400 ${printStylesThTd}`}>
                        {formatNumber2(chykdajyQty, 2)}
                      </td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap text-blue-700 dark:text-blue-400 ${printStylesThTd}`}>
                        {formatNumber2(price * chykdajyQty)}
                      </td>

                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>{formatNumber2(endQty, 2)}</td>
                      <td className={`border border-black dark:border-gray-700 px-1 py-0.5 text-right whitespace-nowrap ${printStylesThTd}`}>
                        {/* {formatNumber2(price * endQty)}ggg */}
                        {formatNumber2(price * selectedQty + (parseFloat(p.oborot_girdeji_price) || 0) - (parseFloat(p.oborot_chykdajy_price) || 0) + (parseFloat(p.oborot_wozwrat_price) || 0))}
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      ) : selectedWarehouses.length > 0 || warehouseId ? (
        loadingFetchProducts ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t("no products found") || "Товары не найдены"}</div>
        )
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t("choose_warehouse") || "Выберите склад(ы) для отображения данных"}</div>
      )}
    </div>
  );
};
