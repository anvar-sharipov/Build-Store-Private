import { useEffect, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateContext } from "../../../UI/DateProvider";
import myAxios from "../../../axios";
import { useSelector, useDispatch } from "react-redux";
import { resetAnalizProdajFilters, setLoading, triggerSearch } from "../../../../app/store/analizProdajSlice";
import { AuthContext } from "../../../../AuthContext";
import MyButton from "../../../UI/MyButton";
import { formatNumber2 } from "../../../UI/formatNumber2";
import React from "react";
import MyModal2 from "../../../UI/MyModal2";
import { ImageOff } from "lucide-react";
import TablePartners from "./TablePartners";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// 📊 4 типа анализа:
// 📦 volume → по количеству
// 💰 revenue → по выручке
// 🏬 stock → залежавшийся товар
// 📉 dynamics → падение относительно прошлого периода

const AnalizProdaj = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const dispatch = useDispatch();
  const { authGroups } = useContext(AuthContext);
  const { warehouses, selectedAnalyzType, lastDaysCount, searchTrigger, excelTrigger, sortBrend, fullList, dontShowZero, brands, categories } = useSelector((state) => state.analizProdajFilters);

  const [partnersModal, setPartnersModal] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [selectedProductWholesalePrice, setSelectedProductWholesalePrice] = useState("");
  const [selectedProductImages, setSelectedProductImages] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState([]);

  const [isFullList, setIsFullList] = useState(null);

  const [showAbcHelp, setShowAbcHelp] = useState(false);

  const [activeImage, setActiveImage] = useState(0);

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [mainSortField, setMainSortField] = useState(null);
  const [mainSortDirection, setMainSortDirection] = useState("asc");

  const handleMainSort = (field) => {
    if (mainSortField === field) {
      setMainSortDirection(mainSortDirection === "asc" ? "desc" : "asc");
    } else {
      setMainSortField(field);
      setMainSortDirection("asc");
    }

    dispatch(triggerSearch(Math.random())); // перезапрос данных
  };

  const renderMainSortArrow = (field) => {
    if (mainSortField !== field) return "↕";
    return mainSortDirection === "asc" ? "↑" : "↓";
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortArrow = (field) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // const openPartnersModal = (item) => {
  //   console.log("item", item);

  //   setSelectedPartners(item.partners);
  //   setSelectedProductName(item.product_name);
  //   setSelectedProductWholesalePrice(item.wholesale_price);
  //   setSelectedProductImages(item.images);
  //   setSelectedProductId(item.product_id);
  //   setPartnersModal(true);
  // };
  const openPartnersModal = (item) => {
    setSelectedPartners(item.partners);
    setSelectedProductName(item.product_name);
    setSelectedProductWholesalePrice(item.wholesale_price);
    setSelectedProductImages(item.images);
    setSelectedProductId(item.product_id);

    setActiveImage(0);

    setPartnersModal(true);
  };

  const [data, setData] = useState([]);
  const [grandTotals, setGrandTotals] = useState(null);
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(resetAnalizProdajFilters());
  }, [dispatch]);

  const isAdmin = authGroups?.includes("admin") || false;

  useEffect(() => {
    if (!searchTrigger) return;
    if (!lastDaysCount || lastDaysCount <= 0) return;
    if (!selectedAnalyzType?.id) return;

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        let res;

        if (selectedAnalyzType?.id === 1) {
          res = await myAxios.get("get_last_days_analysis", {
            params: {
              lastDaysCount,
              warehouses: warehouses.map((w) => w.id).join(","),
              sortBrend,
              fullList,
              dontShowZero,
              brands: brands.map((b) => b.id).join(","),
              categories: categories.map((c) => c.id).join(","),

              sortField: mainSortField,
              sortDirection: mainSortDirection,
            },
            signal: controller.signal,
          });
        }

        if (res) {
          setData(res.data.result_list);
          setIsFullList;

          // console.log("res.data.result_list", res.data.result_list);
          setGrandTotals(res.data.grand_totals);
          setIsFullList(res.data.is_full_list);
          // console.log("res.data", res.data);
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error(err);
        }
      } finally {
        dispatch(setLoading(false));
        // dispatch(triggerSearch(0));
      }
    };

    fetchData();

    return () => controller.abort();
  }, [searchTrigger]);

  useEffect(() => {
    if (!excelTrigger) return;
    if (!lastDaysCount) return;

    const downloadExcel = async () => {
      try {
        const res = await myAxios.get("get_last_days_analysis_excel", {
          params: {
            lastDaysCount,
            warehouses: warehouses.map((w) => w.id).join(","),
            sortBrend,
            fullList,
            dontShowZero,
            brands: brands.map((b) => b.id).join(","),
            categories: categories.map((c) => c.id).join(","),

            sortField: mainSortField,
            sortDirection: mainSortDirection,
          },
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));

        const link = document.createElement("a");
        link.href = url;
        link.download = "sales_analysis.xlsx";

        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error(err);
      }
    };

    downloadExcel();
  }, [excelTrigger]);

  useEffect(() => {
    document.title = t("sales analysis");
  }, [t]);

  // console.log("grandTotals", grandTotals);

  const sortedPartners = selectedPartners
    ? Object.entries(selectedPartners).sort(([aName, a], [bName, b]) => {
        let valA;
        let valB;

        if (sortField === "partner") {
          valA = aName;
          valB = bName;
        } else if (sortField === "agents") {
          valA = (a.agents || []).join(", ");
          valB = (b.agents || []).join(", ");
        } else if (sortField === "quantity") {
          valA = a.selected_quantity;
          valB = b.selected_quantity;
        } else {
          valA = a[sortField];
          valB = b[sortField];
        }

        if (typeof valA === "string") {
          return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortDirection === "asc" ? valA - valB : valB - valA;
      })
    : [];

  const totals = sortedPartners.reduce(
    (acc, [, info]) => {
      acc.faktura += info.faktura_count || 0;
      acc.qty += info.selected_quantity || 0;
      acc.sum += info.total_sum || 0;

      (info.agents || []).forEach((a) => acc.agentSet.add(a));

      return acc;
    },
    { faktura: 0, qty: 0, sum: 0, agentSet: new Set() },
  );

  totals.agents = totals.agentSet.size;

  let cumulative_percent = 0;

  return (
    <div>
      {selectedAnalyzType?.id && selectedAnalyzType?.id === 1 && (
        <div className="print:hidden">
          <div className="text-[18px] text-center font-bold">{t(selectedAnalyzType.name)}</div>
          {grandTotals && grandTotals?.total_product_count && (
            <div className="text-[14px] text-center font-semibold">
              {t("products found")}: {formatNumber2(grandTotals.total_product_count, 0, 0)}
            </div>
          )}

          <div className="mb-4 text-xs">
            <div className="cursor-pointer font-bold flex items-center gap-2 select-none" onClick={() => setShowAbcHelp(!showAbcHelp)}>
              ABC / XYZ анализ
              <span className="text-gray-500">{showAbcHelp ? "▲" : "▼"}</span>
            </div>

            {showAbcHelp && (
              <div className="mt-2 p-3 bg-gray-100 rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold mb-1">ABC (важность товара)</div>

                    <div>
                      <span className="text-green-600 font-bold">A</span> — самые важные товары (большая доля оборота)
                    </div>

                    <div>
                      <span className="text-yellow-600 font-bold">B</span> — средняя важность
                    </div>

                    <div>
                      <span className="text-red-600 font-bold">C</span> — низкая важность
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold mb-1">XYZ (стабильность спроса)</div>

                    <div>
                      <span className="text-green-600 font-bold">X</span> — стабильные продажи
                    </div>

                    <div>
                      <span className="text-yellow-600 font-bold">Y</span> — средняя стабильность
                    </div>

                    <div>
                      <span className="text-red-600 font-bold">Z</span> — нерегулярные продажи
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {lastDaysCount && parseFloat(lastDaysCount) > 0 && (
            <div>
              <div className="hidden print:block">
                <div className="text-[14px] text-center">За последние {lastDaysCount} дней</div>
                <div>
                  {warehouses.length > 0 ? (
                    <div>
                      {t("warehouse")}: {warehouses.map((w) => w.name).join(", ")}
                    </div>
                  ) : (
                    <div>
                      {t("warehouse")}: {t("all")}
                    </div>
                  )}
                </div>

                <div>
                  {brands.length > 0 ? (
                    <div>
                      {t("brand")}: {brands.map((b) => b.name).join(", ")}
                    </div>
                  ) : (
                    <div>
                      {t("brand")}: {t("all")}
                    </div>
                  )}
                </div>

                <div>
                  {categories.length > 0 ? (
                    <div>
                      {t("category")}: {categories.map((c) => c.name).join(", ")}
                    </div>
                  ) : (
                    <div>
                      {t("category")}: {t("all")}
                    </div>
                  )}
                </div>
              </div>

              <div>
                {data.length > 0 && (
                  <div className="mt-6 w-full max-w-full overflow-hidden border rounded-xl shadow bg-white">
                    <div className="overflow-x-auto overflow-y-auto max-h-[80vh]">
                      <table className="min-w-[1500px] w-full text-[12px] border-collapse table-auto">
                        {/* HEADER */}
                        <thead className="sticky top-0 bg-indigo-600 text-gray-200 z-20 uppercase text-[11px]">
                          <tr className="sticky top-0 z-30">
                            <th className="sticky left-0 bg-indigo-600 border border-black px-1 py-1 text-center z-40 w-10">№</th>
                            <th className="sticky left-10 bg-indigo-600 border border-black border-r-2 border-r-gray-300 px-1 py-1 text-center z-40 min-w-[200px]">Товар</th>
                            <th onClick={() => handleMainSort("purchase_price")} className="border border-black px-1 py-1 text-center whitespace-normal w-16">
                              Цена закупки {renderMainSortArrow("purchase_price")}
                            </th>
                            <th className="border border-black px-1 py-1 text-center">Ед.</th>
                            {/* <th className="border border-black px-1 py-1 text-center">ABC</th>
                            <th className="border border-black px-1 py-1 text-center">XYZ</th> */}
                            <th onClick={() => handleMainSort("product_age_days")} className="border border-black px-1 py-1 text-center w-10 cursor-pointer">
                              {t("product age days")} {renderMainSortArrow("product_age_days")}
                            </th>
                            <th onClick={() => handleMainSort("abcxyz_category")} className="border border-black px-1 py-1 text-center w-10 cursor-pointer">
                              ABC XYZ {renderMainSortArrow("abcxyz_category")}
                            </th>

                            {isFullList == true && <th className="border border-black px-1 py-1 text-center">{t("category")}</th>}
                            {isFullList == true && <th className="border border-black px-1 py-1 text-center">{t("brand")}</th>}

                            <th onClick={() => handleMainSort("partners_count")} className="border border-black px-1 py-1 text-center w-10 cursor-pointer">
                              Клиент {renderMainSortArrow("partners_count")}
                            </th>
                            <th className="border border-black px-1 py-1 text-center" colSpan={2}>
                              Продано
                            </th>

                            <th className="border border-black px-1 py-1 text-center" colSpan={2}>
                              Средн./день
                            </th>

                            <th className="border border-black px-1 py-1 text-center" colSpan={2}>
                              Остаток
                            </th>

                            <th className="border border-black px-1 py-1 text-center whitespace-normal w-16">Остаток дней запаса</th>

                            <th className="border border-black px-1 py-1 text-center" colSpan={2}>
                              Прогноз
                            </th>
                            <th className="border border-black px-1 py-1 text-center" colSpan={2}>
                              Нужно закупить
                            </th>

                            <th onClick={() => handleMainSort("share")} className="border border-black px-1 py-1 text-center w-10 cursor-pointer">
                              {t("share")} {renderMainSortArrow("share")}
                            </th>
                            <th className="border border-black px-1 py-1 text-center w-16">
                              {t("cumulative percent")}
                            </th>
                          </tr>
                          <tr className="sticky top-[30px] z-30">
                            {/* <th className="border border-black"></th>
                            <th className="border border-black"></th> */}
                            <th className="sticky left-0 bg-indigo-600 border border-black z-40"></th>
                            <th className="sticky left-10 bg-indigo-600 border border-black z-40"></th>

                            {/* Цена закупки */}
                            <th className="border border-black"></th>
                            <th className="border border-black"></th>

                            {isFullList == true && <th className="border border-black"></th>}
                            {isFullList == true && <th className="border border-black"></th>}

                            {/* <th className="border border-black"></th> */}
                            <th className="border border-black"></th>
                            <th className="border border-black"></th>

                            {/* Клиент */}
                            <th className="border border-black"></th>

                            {/* Продано */}
                            <th onClick={() => handleMainSort("total_sold")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              кол-во {renderMainSortArrow("total_sold")}
                            </th>
                            <th onClick={() => handleMainSort("total_sold_price")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              цена {renderMainSortArrow("total_sold_price")}
                            </th>

                            {/* Средн./день */}
                            <th onClick={() => handleMainSort("avg_per_day")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              кол-во {renderMainSortArrow("avg_per_day")}
                            </th>
                            <th onClick={() => handleMainSort("avg_per_day_price")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              цена {renderMainSortArrow("avg_per_day_price")}
                            </th>

                            {/* Остаток */}
                            <th onClick={() => handleMainSort("stock_qty")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              кол-во {renderMainSortArrow("stock_qty")}
                            </th>
                            <th onClick={() => handleMainSort("stock_qty_price")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              цена {renderMainSortArrow("stock_qty_price")}
                            </th>

                            {/* Остаток дней запаса */}
                            {/* <th className="border border-black px-1 py-1 text-center whitespace-nowrap"></th> */}
                            <th onClick={() => handleMainSort("days_of_stock_remaining")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              {renderMainSortArrow("days_of_stock_remaining")}
                            </th>

                            {/* Прогноз */}
                            <th onClick={() => handleMainSort("forecast")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              кол-во {renderMainSortArrow("forecast")}
                            </th>
                            <th onClick={() => handleMainSort("forecast_price")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              цена {renderMainSortArrow("forecast_price")}
                            </th>

                            {/* Нужно закупить */}
                            <th onClick={() => handleMainSort("need_to_buy")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              кол-во {renderMainSortArrow("need_to_buy")}
                            </th>
                            <th onClick={() => handleMainSort("need_to_buy_price")} className="border border-black px-1 py-1 text-center cursor-pointer">
                              цена {renderMainSortArrow("need_to_buy_price")}
                            </th>
                            <th className="border border-black"></th>
                            <th className="border border-black"></th>
                            {/* <th className="border border-black"></th> */}
                          </tr>
                        </thead>

                        {/* BODY */}
                        {isFullList == true ? (
                          <tbody>
                            {data.map((item, index) => {
                              // console.log("item", item);
                              cumulative_percent += item.share;

                              return (
                                <tr key={item.product_id} className="hover:bg-gray-50 transition">
                                  <td className="sticky left-0 bg-white dark:bg-gray-800 border border-black text-center whitespace-nowrap z-10">{index + 1}</td>

                                  <td className="sticky left-10 bg-white dark:bg-gray-800 border border-black font-medium text-gray-800 dark:text-gray-200 pl-1 z-10">{item.product_name}</td>

                                  <td className="border border-black text-center whitespace-nowrap">{formatNumber2(item.purchase_price)}</td>

                                  <td className="border border-black text-center text-gray-500 whitespace-nowrap">{item.unit}</td>
                                  <td className={`border border-black text-center w-16 ${item.product_age_days <= 30 ? "text-green-600 font-bold" : ""}`}>{item.product_age_days ?? "-"}</td>

                                  {/* <td
                                      className={`border border-black text-center font-bold
                                        ${item.abc_category === "A" ? "text-green-600" : item.abc_category === "B" ? "text-yellow-600" : "text-red-600"}`}
                                    >
                                      {item.abc_category}
                                    </td>

                                    <td
                                      className={`border border-black text-center font-bold
                                      ${item.xyz_category === "X" ? "text-green-600" : item.xyz_category === "Y" ? "text-yellow-600" : "text-red-600"}`}
                                    >
                                      {item.xyz_category}
                                    </td> */}

                                  <td
                                    className={`border border-black text-center font-bold
                                          ${
                                            item.abcxyz_category === "AX"
                                              ? "text-green-700"
                                              : item.abcxyz_category === "AY"
                                                ? "text-green-500"
                                                : item.abcxyz_category === "AZ"
                                                  ? "text-yellow-600"
                                                  : item.abcxyz_category === "BX"
                                                    ? "text-blue-600"
                                                    : item.abcxyz_category === "BY"
                                                      ? "text-indigo-600"
                                                      : item.abcxyz_category === "BZ"
                                                        ? "text-orange-600"
                                                        : item.abcxyz_category === "CX"
                                                          ? "text-gray-600"
                                                          : item.abcxyz_category === "CY"
                                                            ? "text-gray-500"
                                                            : "text-red-600"
                                          }`}
                                  >
                                    {item.abcxyz_category}
                                  </td>

                                  <td className="border border-black text-left font-semibold whitespace-nowrap pr-1">{item.category_name}</td>
                                  <td className="border border-black text-left font-semibold whitespace-nowrap pr-1">{item.brand_name}</td>

                                  {/* <td className="border border-black text-center whitespace-nowrap" onClick={}>{item.partners_count}</td> */}
                                  <td className="border border-black text-center whitespace-nowrap cursor-pointer text-blue-600 font-bold hover:bg-blue-50" onClick={() => openPartnersModal(item)}>
                                    {item.partners_count}
                                  </td>

                                  <td className="border border-black text-right font-semibold whitespace-nowrap pr-1">{formatNumber2(item.total_sold, 0, 0)}</td>

                                  <td className="border border-black text-right font-semibold whitespace-nowrap pr-1">{formatNumber2(item.total_sold_price, 2, 0)}</td>

                                  <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.avg_per_day, 2, 0)}</td>

                                  <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.avg_per_day_price, 2, 0)}</td>

                                  <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.stock_qty, 0, 0)}</td>
                                  <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.stock_qty_price, 2, 0)}</td>

                                  <td
                                    className={`border border-black text-center whitespace-nowrap pr-1 font-bold ${item.days_of_stock_remaining < 7 ? "text-red-700" : item.days_of_stock_remaining < 30 ? "text-yellow-600" : "text-green-700"}`}
                                  >
                                    {formatNumber2(item.days_of_stock_remaining, 0, 0)}
                                  </td>

                                  <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.forecast, 0, 0)}</td>

                                  <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.forecast_price, 2, 0)}</td>

                                  <td className={`border border-black text-right font-bold ${Number(item.need_to_buy) > 0 ? "text-red-600" : "text-green-600"} whitespace-nowrap pr-1`}>
                                    {formatNumber2(item.need_to_buy, 0, 0)}
                                  </td>

                                  <td className={`border border-black text-right font-bold ${Number(item.need_to_buy) > 0 ? "text-red-600" : "text-green-600"} whitespace-nowrap pr-1`}>
                                    {formatNumber2(item.need_to_buy_price, 2, 0)}
                                  </td>
                                  <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.share, 5, 0)}</td>
                                  <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(cumulative_percent, 2, 0)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        ) : (
                          isFullList == false && (
                            <tbody>
                              {data.map((cat, catIndex) => (
                                <React.Fragment key={catIndex}>
                                  {/* CATEGORY ROW */}
                                  {/* <tr key={"cat_" + catIndex}>
                                <td colSpan={15} className="border border-black bg-gray-200 font-bold pl-2">
                                  {cat.category}
                                </td>
                              </tr> */}
                                  <tr key={"cat_" + catIndex}>
                                    <td colSpan={20} className="border border-black bg-gray-200 font-bold pl-2 sticky top-[73px] z-10 text-center">
                                      {cat.category}
                                    </td>
                                  </tr>

                                  {/* PRODUCTS */}
                                  {cat.products.map((item, index) => {
                                    // console.log("item", item);
                                    cumulative_percent += item.share;

                                    return (
                                      <tr key={item.product_id} className="hover:bg-gray-50 transition">
                                        <td className="sticky left-0 bg-white dark:bg-gray-800 border border-black text-center whitespace-nowrap z-10">{index + 1}</td>
                                        <td className="sticky left-10 bg-white dark:bg-gray-800 border border-black font-medium text-gray-800 dark:text-gray-200 pl-1 z-10">{item.product_name}</td>
                                        <td className="border border-black text-center whitespace-nowrap">{formatNumber2(item.purchase_price)}</td>
                                        <td className="border border-black text-center text-gray-500 whitespace-nowrap">{item.unit}</td>
                                        <td className={`border border-black text-center w-16 ${item.product_age_days <= 30 ? "text-green-600 font-bold" : ""}`}>{item.product_age_days ?? "-"}</td>
                                        {/* <td
                                      className={`border border-black text-center font-bold
                                        ${item.abc_category === "A" ? "text-green-600" : item.abc_category === "B" ? "text-yellow-600" : "text-red-600"}`}
                                    >
                                      {item.abc_category}
                                    </td>

                                    <td
                                      className={`border border-black text-center font-bold
                                      ${item.xyz_category === "X" ? "text-green-600" : item.xyz_category === "Y" ? "text-yellow-600" : "text-red-600"}`}
                                    >
                                      {item.xyz_category}
                                    </td> */}
                                        <td
                                          className={`border border-black text-center font-bold
                                          ${
                                            item.abcxyz_category === "AX"
                                              ? "text-green-700"
                                              : item.abcxyz_category === "AY"
                                                ? "text-green-500"
                                                : item.abcxyz_category === "AZ"
                                                  ? "text-yellow-600"
                                                  : item.abcxyz_category === "BX"
                                                    ? "text-blue-600"
                                                    : item.abcxyz_category === "BY"
                                                      ? "text-indigo-600"
                                                      : item.abcxyz_category === "BZ"
                                                        ? "text-orange-600"
                                                        : item.abcxyz_category === "CX"
                                                          ? "text-gray-600"
                                                          : item.abcxyz_category === "CY"
                                                            ? "text-gray-500"
                                                            : "text-red-600"
                                          }`}
                                        >
                                          {item.abcxyz_category}
                                        </td>
                                        {/* <td className="border border-black text-center whitespace-nowrap" onClick={}>{item.partners_count}</td> */}
                                        <td
                                          className="border border-black text-center whitespace-nowrap cursor-pointer text-blue-600 font-bold hover:bg-blue-50"
                                          onClick={() => openPartnersModal(item)}
                                        >
                                          {item.partners_count}
                                        </td>
                                        <td className="border border-black text-right font-semibold whitespace-nowrap pr-1">{formatNumber2(item.total_sold, 0, 0)}</td>
                                        <td className="border border-black text-right font-semibold whitespace-nowrap pr-1">{formatNumber2(item.total_sold_price, 2, 0)}</td>
                                        <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.avg_per_day, 2, 0)}</td>
                                        <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.avg_per_day_price, 2, 0)}</td>
                                        <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.stock_qty, 0, 0)}</td>
                                        <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.stock_qty_price, 2, 0)}</td>
                                        <td
                                          className={`border border-black text-center whitespace-nowrap pr-1 font-bold ${item.days_of_stock_remaining < 7 ? "text-red-700" : item.days_of_stock_remaining < 30 ? "text-yellow-600" : "text-green-700"}`}
                                        >
                                          {formatNumber2(item.days_of_stock_remaining, 0, 0)}
                                        </td>
                                        <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.forecast, 0, 0)}</td>
                                        <td className="border border-black text-right whitespace-nowrap pr-1">{formatNumber2(item.forecast_price, 2, 0)}</td>
                                        <td className={`border border-black text-right font-bold ${Number(item.need_to_buy) > 0 ? "text-red-600" : "text-green-600"} whitespace-nowrap pr-1`}>
                                          {formatNumber2(item.need_to_buy, 0, 0)}
                                        </td>
                                        <td className={`border border-black text-right font-bold ${Number(item.need_to_buy) > 0 ? "text-red-600" : "text-green-600"} whitespace-nowrap pr-1`}>
                                          {formatNumber2(item.need_to_buy_price, 2, 0)}
                                        </td>
                                        <td className={`border border-black text-right pr-1`}>{formatNumber2(item.share, 5, 0)}</td>
                                        <td className={`border border-black text-right pr-1`}>{formatNumber2(cumulative_percent, 2, 0)}</td>
                                        
                                      </tr>
                                    );
                                  })}

                                  <tr>
                                    {/* <td className="border border-black bg-gray-100"></td> */}
                                    <td className="border border-black text-gray-800 pr-2 font-bold text-right bg-gray-100" colSpan={7}>
                                      Итого {cat.category}:{" "}
                                    </td>
                                    {/* <td className="border border-black bg-gray-100"></td> */}
                                    {/* <td className="border border-black bg-gray-100"></td> */}
                                    {/* <td className="border border-black bg-gray-100"></td> */}

                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.total_sold, 0)}</td>
                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.total_sold_price)}</td>

                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.avg_per_day, 0)}</td>
                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.avg_per_day_price)}</td>

                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.stock_qty, 0)}</td>
                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.stock_qty_price)}</td>

                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1"></td>

                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.forecast, 0)}</td>
                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.forecast_price)}</td>

                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.need_to_buy, 0)}</td>
                                    <td className="border border-black bg-gray-100 text-right font-bold whitespace-nowrap pr-1">{formatNumber2(cat.category_totals.need_to_buy_price)}</td>

                                    <th className="border border-black bg-gray-100"></th>
                                    <th className="border border-black bg-gray-100"></th>
                                  </tr>
                                </React.Fragment>
                              ))}
                            </tbody>
                          )
                        )}

                        {grandTotals && (
                          <tfoot>
                            <tr className="sticky bottom-0 bg-indigo-600 text-gray-200 z-20">
                              {/* <td className="border border-black "></td> */}
                              <td className="border border-black pr-2 font-bold text-right" colSpan={7}>
                                ИТОГО ВСЕГО:{" "}
                              </td>
                              {/* <td className="border border-black "></td> */}

                              {isFullList == true && <th className="border border-black"></th>}
                              {isFullList == true && <th className="border border-black"></th>}

                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.total_sold, 0, 0)}</td>
                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.total_sold_price)}</td>

                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.avg_per_day, 0)}</td>
                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.avg_per_day_price)}</td>

                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.stock_qty, 0)}</td>
                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.stock_qty_price)}</td>

                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1"></td>

                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.forecast, 0)}</td>
                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.forecast_price)}</td>

                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.need_to_buy, 0)}</td>
                              <td className="border border-black  text-right font-bold whitespace-nowrap pr-1">{formatNumber2(grandTotals.need_to_buy_price)}</td>

                              <th className="border border-black"></th>
                              <th className="border border-black"></th>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <TablePartners
        setPartnersModal={setPartnersModal}
        lastDaysCount={lastDaysCount}
        selectedProductImages={selectedProductImages}
        activeImage={activeImage}
        selectedProductName={selectedProductName}
        setActiveImage={setActiveImage}
        selectedProductId={selectedProductId}
        selectedProductWholesalePrice={selectedProductWholesalePrice}
        handleSort={handleSort}
        renderSortArrow={renderSortArrow}
        sortedPartners={sortedPartners}
        totals={totals}
        partnersModal={partnersModal}
      />
    </div>
  );
};

export default AnalizProdaj;
