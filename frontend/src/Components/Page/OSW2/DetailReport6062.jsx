import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import myAxios from "../../axios";
import { DateContext } from "../../UI/DateProvider";
import { formatNumber2 } from "../../UI/formatNumber2";
import MyFormatDate from "../../UI/MyFormatDate";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES_RAPORT } from "../../../routes";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import AgentReport2Excel from "./AgentReport2Excel";
import OriginalReport2Excel from "./OriginalReport2Excel";

const DetailReport6062 = () => {
  const { dateFrom, dateTo } = useContext(DateContext);
  console.log("detail repotr 60");

  const [searchParams] = useSearchParams();
  const accountNumber = searchParams.get("accountNumber");
  const agent = searchParams.get("agent");
  const sortByAgent = searchParams.get("sortByAgent");

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  // const [sortConfig, setSortConfig] = useState({ key: "agentId", direction: "asc" });
  const [sortConfig, setSortConfig] = useState({ key: "partnerName", direction: "asc" });

  const [show0, setShow0] = useState(false);
  const [hyphenOr0, setHyphenOr0] = useState(true);

  // ################################################################################################################################
  // ################################################################################################################################
  // ######################## download excel

  const exportToExcel = () => {
    // Создаем рабочую книгу
    const workbook = XLSX.utils.book_new();

    // Функция для подготовки данных
    const prepareDataForExport = () => {
      if (sortByAgent === "true") {
        // Данные с группировкой по агентам
        const allData = [];

        Object.entries(data).forEach(([agentName, partners]) => {
          // Добавляем заголовок агента
          allData.push([`Агент: ${agentName === "no_agent" ? "Без агента" : agentName}`]);
          allData.push([]);

          // Заголовки таблицы
          allData.push(["№", "Контрагент", "Начальное сальдо ДТ", "Начальное сальдо КТ", "Обороты за период ДТ", "Обороты за период КТ", "Конечное сальдо ДТ", "Конечное сальдо КТ"]);

          // Данные партнеров
          partners.forEach((row, index) => {
            allData.push([
              index + 1,
              row.partner_name,
              row.debit_before || 0,
              row.credit_before || 0,
              row.debit_oborot || 0,
              row.credit_oborot || 0,
              row.saldo_end_debit || 0,
              row.saldo_end_credit || 0,
            ]);
          });

          // Итоги по агенту
          const agentTotals = totals[agentName]?.[0];
          if (agentTotals) {
            allData.push([]);
            allData.push([
              "ИТОГИ РАЗВЕРНУТЫЕ:",
              "",
              agentTotals.debit_before_total,
              agentTotals.credit_before_total,
              agentTotals.debit_oborot_total,
              agentTotals.credit_oborot_total,
              agentTotals.saldo_end_debit_total,
              agentTotals.saldo_end_credit_total,
            ]);
            allData.push([
              "ИТОГИ:",
              "",
              agentTotals.saldo_summ_before_debit,
              agentTotals.saldo_summ_before_credit,
              agentTotals.saldo_summ_oborot_debit,
              agentTotals.saldo_summ_oborot_credit,
              agentTotals.saldo_summ_end_debit,
              agentTotals.saldo_summ_end_credit,
            ]);
          }

          allData.push([]);
          allData.push([]);
        });

        // Общие итоги
        const grandTotals = calculateGrandTotals();
        if (grandTotals) {
          allData.push([
            "ОБЩИЕ ИТОГИ РАЗВЕРНУТЫЕ:",
            "",
            grandTotals.debit_before_total,
            grandTotals.credit_before_total,
            grandTotals.debit_oborot_total,
            grandTotals.credit_oborot_total,
            grandTotals.saldo_end_debit_total,
            grandTotals.saldo_end_credit_total,
          ]);
          allData.push([
            "ОБЩИЕ ИТОГИ:",
            "",
            grandTotals.saldo_summ_before_debit,
            grandTotals.saldo_summ_before_credit,
            grandTotals.saldo_summ_oborot_debit,
            grandTotals.saldo_summ_oborot_credit,
            grandTotals.saldo_summ_end_debit,
            grandTotals.saldo_summ_end_credit,
          ]);
        }

        return allData;
      } else {
        // Обычные данные (массив)
        const allData = [["№", "Контрагент", "Агент", "Начальное сальдо ДТ", "Начальное сальдо КТ", "Обороты за период ДТ", "Обороты за период КТ", "Конечное сальдо ДТ", "Конечное сальдо КТ"]];

        const dataToExport = sortedData.length > 0 ? sortedData : data;

        dataToExport.forEach((row, index) => {
          allData.push([
            index + 1,
            row.partner_name,
            row.agent?.name || row.agent?.id || "",
            row.debit_before || 0,
            row.credit_before || 0,
            row.debit_oborot || 0,
            row.credit_oborot || 0,
            row.saldo_end_debit || 0,
            row.saldo_end_credit || 0,
          ]);
        });

        // Итоги
        allData.push([]);
        allData.push([
          "ИТОГИ РАЗВЕРНУТЫЕ:",
          "",
          "",
          totals.debit_before_total,
          totals.credit_before_total,
          totals.debit_oborot_total,
          totals.credit_oborot_total,
          totals.saldo_end_debit_total,
          totals.saldo_end_credit_total,
        ]);
        allData.push([
          "ИТОГИ:",
          "",
          "",
          totals.saldo_summ_before_debit,
          totals.saldo_summ_before_credit,
          totals.saldo_summ_oborot_debit,
          totals.saldo_summ_oborot_credit,
          totals.saldo_summ_end_debit,
          totals.saldo_summ_end_credit,
        ]);

        return allData;
      }
    };

    // Подготавливаем данные
    const excelData = prepareDataForExport();

    // Создаем worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Настраиваем ширину колонок
    const colWidths = [
      { wch: 8 }, // №
      { wch: 40 }, // Контрагент
      { wch: 20 }, // Агент
      { wch: 15 }, // Начальное сальдо ДТ
      { wch: 15 }, // Начальное сальдо КТ
      { wch: 15 }, // Обороты ДТ
      { wch: 15 }, // Обороты КТ
      { wch: 15 }, // Конечное сальдо ДТ
      { wch: 15 }, // Конечное сальдо КТ
    ];
    worksheet["!cols"] = colWidths;

    // Добавляем worksheet в workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Отчет 60-62");

    // Генерируем имя файла
    const fileName = `Отчет_60-62_${accountNumber}_${MyFormatDate(dateFrom)}_${MyFormatDate(dateTo)}.xlsx`;

    // Скачиваем файл
    XLSX.writeFile(workbook, fileName);
  };

  // Компонент кнопки для экспорта
  // const ExportButton = () => (
  //   <motion.button
  //     whileHover={{ scale: 1.05 }}
  //     whileTap={{ scale: 0.95 }}
  //     onClick={exportToExcel}
  //     disabled={loading || !data || (Array.isArray(data) && data.length === 0) || (typeof data === "object" && Object.keys(data).length === 0)}
  //     className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
  //   >
  //     <FileSpreadsheet className="w-4 h-4" />
  //     <span>Excel</span>
  //   </motion.button>
  // );

  // const ExportButton = () => {
  //   const handleExport = async () => {
  //     try {
  //       await AgentReport2Excel(data, totals, calculateGrandTotals(), dateFrom, dateTo, accountNumber, sortByAgent, t, hyphenOr0);
  //     } catch (error) {
  //       console.error("Ошибка при экспорте в Excel:", error);
  //     }
  //   };

  //   return (
  //     <button onClick={handleExport} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-1">
  //       <span>📊 Excel</span>
  //     </button>
  //   );
  // };

  // В компоненте Reports.jsx
  const ExportButton = () => {
    const handleExport = async () => {
      try {
        if (sortByAgent === "true") {
          // Экспорт для группировки по агентам
          await AgentReport2Excel(data, totals, calculateGrandTotals(), dateFrom, dateTo, accountNumber, sortByAgent, t, hyphenOr0);
        } else {
          // Экспорт для оригинальной таблицы
          await OriginalReport2Excel(
            sortedData, // или data, если sortedData - это отсортированный массив
            totals,
            dateFrom,
            dateTo,
            accountNumber,
            t,
            hyphenOr0,
          );
        }
      } catch (error) {
        console.error("Ошибка при экспорте в Excel:", error);
      }
    };

    return (
      <button onClick={handleExport} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-1">
        <span>📊 Excel</span>
      </button>
    );
  };

  // ######################## download excel
  // ################################################################################################################################
  // ################################################################################################################################

  // useEffect(() => {
  //   console.log("data", data);
  // }, [data]);

  useEffect(() => {
    // console.log("tut");
    if (!accountNumber || !dateFrom || !dateTo || sortByAgent === null) {
      return;
    }

    // console.log("REQUEST:", {
    //   accountNumber,
    //   dateFrom,
    //   dateTo,
    //   sortByAgent,
    // });

    // if (!accountNumber) return;
    // console.log("tut2");

    const getDetail = async () => {
      try {
        setLoading(true);
        const res = await myAxios.get("get_detail_account_60_62", {
          params: { account: accountNumber, dateFrom, dateTo, agent, sortByAgent, show0, hyphenOr0 },
        });

        if (sortByAgent === "true") {
          // Данные с группировкой по агентам
          setData(res.data.items || {});
          // console.log("res.data.totals", res.data.totals);

          setTotals(res.data.totals || {});
        } else {
          // Обычные данные (массив)
          setData(res.data.items || []);
          setTotals(res.data.totals || {});
        }
      } catch (error) {
        console.error("getDetail error:", error);
      } finally {
        setLoading(false);
      }
    };

    getDetail();
    // if (accountNumber && dateFrom && dateTo) {
    //   getDetail();
    // } else {
    //   setData([]);
    // }
  }, [accountNumber, dateFrom, dateTo, agent, sortByAgent, show0]);

  const handleRowClick = (partner_id, account_id) => {
    navigate(ROUTES_RAPORT.DETAIL_ACCOUNT_REPORT_60_62_PARTNER, {
      state: { partner_id, account_id },
    });
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = useMemo(() => {
    if (sortByAgent === "true" || !Array.isArray(data) || !data.length) return [];

    const sorted = [...data].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "agentId":
          aValue = a.agent?.id || 0;
          bValue = b.agent?.id || 0;
          break;
        case "partnerName":
          aValue = a.partner_name?.toLowerCase() || "";
          bValue = b.partner_name?.toLowerCase() || "";
          break;
        case "debitBefore":
          aValue = a.debit_before || 0;
          bValue = b.debit_before || 0;
          break;
        case "creditBefore":
          aValue = a.credit_before || 0;
          bValue = b.credit_before || 0;
          break;
        case "debitOborot":
          aValue = a.debit_oborot || 0;
          bValue = b.debit_oborot || 0;
          break;
        case "creditOborot":
          aValue = a.credit_oborot || 0;
          bValue = b.credit_oborot || 0;
          break;
        case "saldoEndDebit":
          aValue = a.saldo_end_debit || 0;
          bValue = b.saldo_end_debit || 0;
          break;
        case "saldoEndCredit":
          aValue = a.saldo_end_credit || 0;
          bValue = b.saldo_end_credit || 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortConfig, sortByAgent]);

  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Функция для расчета общих итогов при группировке по агентам
  const calculateGrandTotals = () => {
    if (sortByAgent !== "true" || typeof totals !== "object") return null;

    let grandTotals = {
      debit_before_total: 0,
      credit_before_total: 0,
      debit_oborot_total: 0,
      credit_oborot_total: 0,
      saldo_end_debit_total: 0,
      saldo_end_credit_total: 0,
    };

    Object.values(totals).forEach((agentTotalArray) => {
      if (Array.isArray(agentTotalArray) && agentTotalArray[0]) {
        const agentTotals = agentTotalArray[0];
        grandTotals.debit_before_total += agentTotals.debit_before_total || 0;
        grandTotals.credit_before_total += agentTotals.credit_before_total || 0;
        grandTotals.debit_oborot_total += agentTotals.debit_oborot_total || 0;
        grandTotals.credit_oborot_total += agentTotals.credit_oborot_total || 0;
        grandTotals.saldo_end_debit_total += agentTotals.saldo_end_debit_total || 0;
        grandTotals.saldo_end_credit_total += agentTotals.saldo_end_credit_total || 0;
      }
    });

    // Расчет сальдо
    const saldo_summ_before_debit = grandTotals.debit_before_total - grandTotals.credit_before_total > 0 ? Math.abs(grandTotals.debit_before_total - grandTotals.credit_before_total) : 0;
    const saldo_summ_before_credit = grandTotals.debit_before_total - grandTotals.credit_before_total <= 0 ? Math.abs(grandTotals.debit_before_total - grandTotals.credit_before_total) : 0;

    const saldo_summ_oborot_debit = grandTotals.debit_oborot_total - grandTotals.credit_oborot_total > 0 ? Math.abs(grandTotals.debit_oborot_total - grandTotals.credit_oborot_total) : 0;
    const saldo_summ_oborot_credit = grandTotals.debit_oborot_total - grandTotals.credit_oborot_total <= 0 ? Math.abs(grandTotals.debit_oborot_total - grandTotals.credit_oborot_total) : 0;

    const saldo_summ_end_debit = grandTotals.saldo_end_debit_total - grandTotals.saldo_end_credit_total > 0 ? Math.abs(grandTotals.saldo_end_debit_total - grandTotals.saldo_end_credit_total) : 0;
    const saldo_summ_end_credit = grandTotals.saldo_end_debit_total - grandTotals.saldo_end_credit_total <= 0 ? Math.abs(grandTotals.saldo_end_debit_total - grandTotals.saldo_end_credit_total) : 0;

    return {
      ...grandTotals,
      saldo_summ_before_debit,
      saldo_summ_before_credit,
      saldo_summ_oborot_debit,
      saldo_summ_oborot_credit,
      saldo_summ_end_debit,
      saldo_summ_end_credit,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Рендер для sortByAgent=true (группировка по агентам)
  if (sortByAgent === "true") {
    const grandTotals = calculateGrandTotals();
    const hasData = Object.keys(data).length > 0;

    return (
      <div className="print:bg-white print:p-0 print:m-0 flex justify-center">
        <AnimatePresence>
          {hasData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {/* Заголовок отчета */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-4 py-3 bg-blue-50 border-b border-gray-200 
             dark:bg-blue-900/20 dark:border-gray-700
             print:bg-white print:border-b print:border-gray-300 print:px-2 print:py-1
             print:dark:!text-black mb-4 flex justify-between items-center"
              >
                <div className="text-sm text-gray-700 dark:text-gray-300 print:text-xs print:text-gray-800 print:font-medium print:dark:!text-black">
                  {t("period")}: {MyFormatDate(dateFrom)} - {MyFormatDate(dateTo)} | Счет: {accountNumber} | Группировка по агентам
                </div>

                <div className="flex items-center gap-6">
                  {/* Checkbox 1 */}
                  <div className="flex items-center gap-4">
                    {/* Минус */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="hyphenOr0" value="hyphen" checked={hyphenOr0 === false} onChange={() => setHyphenOr0(false)} className="h-4 w-4 text-blue-600 border-gray-300" />
                      <span className="text-sm select-none">0</span>
                    </label>

                    {/* Ноль */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="hyphenOr0" value="zero" checked={hyphenOr0 === true} onChange={() => setHyphenOr0(true)} className="h-4 w-4 text-blue-600 border-gray-300" />
                      <span className="text-sm select-none">-</span>
                    </label>
                  </div>

                  {/* Checkbox 2 */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={() => setShow0((prev) => !prev)} checked={show0} />
                    <span className="text-sm select-none">{t("Empty")}</span>
                  </label>
                </div>

                <div className="print:hidden">
                  <ExportButton />
                </div>
              </motion.div>

              {/* Таблицы по агентам */}
              {Object.entries(data).map(([agentName, partners]) => {
                // console.log("totals", totals);

                const agentTotalsData = totals[agentName]?.[0];
                if (!partners || !Array.isArray(partners) || partners.length === 0) return null;

                return (
                  <div
                    key={agentName}
                    className="mb-6 overflow-auto rounded-md border border-gray-200 bg-white shadow-sm 
                         dark:border-gray-700 dark:bg-gray-800
                         print:border-0 print:shadow-none print:overflow-visible print:w-full print:max-w-full
                         print:!bg-white"
                  >
                    {/* Заголовок агента */}
                    <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 font-semibold text-gray-800 dark:text-gray-200 print:bg-green-50 print:dark:!text-black">
                      {agentName === "no_agent" ? t("noAgent") || "Без агента" : agentName}
                    </div>

                    <table
                      className="border-collapse text-sm w-full
                        print:text-xs 
                        print:[&_th]:py-1 print:[&_td]:py-1
                        print:[&_th]:px-0.5 print:[&_td]:px-0.5
                        print:dark:[&_th]:!text-black print:dark:[&_td]:!text-black"
                    >
                      <thead className="bg-gray-50 dark:bg-gray-700 print:bg-white print:dark:!bg-white">
                        <tr>
                          <th
                            rowSpan={2}
                            className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs w-12 print:dark:!text-black"
                          >
                            №
                          </th>
                          <th
                            rowSpan={2}
                            className="px-2 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-medium print:px-1 print:py-1 print:text-xs min-w-48 print:dark:!text-black"
                          >
                            {t("subconto")}
                          </th>
                          <th
                            colSpan={2}
                            className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs print:dark:!text-black"
                          >
                            {t("openingBalance")}
                          </th>
                          <th
                            colSpan={2}
                            className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs print:dark:!text-black"
                          >
                            {t("periodTurnover")}
                          </th>
                          <th
                            colSpan={2}
                            className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs print:dark:!text-black"
                          >
                            {t("endingBalance")}
                          </th>
                        </tr>
                        <tr>
                          <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20 print:dark:!text-black">
                            DT
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20 print:dark:!text-black">
                            KT
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20 print:dark:!text-black">
                            DT
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20 print:dark:!text-black">
                            KT
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20 print:dark:!text-black">
                            DT
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20 print:dark:!text-black">
                            KT
                          </th>
                        </tr>
                      </thead>

                      <tbody className="print:dark:[&_td]:!text-black">
                        <AnimatePresence>
                          {partners.map((row, index) => {
                            let start_saldo_debit = 0;
                            let start_saldo_credit = 0;
                            if (row.debit_before - row.credit_before > 0) {
                              start_saldo_debit = row.debit_before - row.credit_before;
                            } else if (row.debit_before - row.credit_before < 0) {
                              start_saldo_credit = Math.abs(row.debit_before - row.credit_before);
                            }
                            return (
                              <motion.tr
                                key={`${agentName}-${row.partner_id}`}
                                variants={tableRowVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                onDoubleClick={() => handleRowClick(row.partner_id, row.account_id)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700/50 print:hover:bg-transparent print:break-inside-avoid print:dark:!bg-white"
                              >
                                <td className="px-1 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-center dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-gray-800 border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:dark:!text-black">
                                  {row.partner_name}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                                  {formatNumber2(start_saldo_debit, 2, hyphenOr0)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                                  {formatNumber2(start_saldo_credit, 2, hyphenOr0)}
                                </td>
                                <td className="text-green-700 dark:text-green-400 print:!text-black px-3 py-2 whitespace-nowrap border border-gray-300 text-right dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                                  {formatNumber2(row.debit_oborot, 2, hyphenOr0)}
                                </td>
                                <td className="text-red-00 dark:text-red-400 print:!text-black px-3 py-2 whitespace-nowrap border border-gray-300 text-right dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                                  {formatNumber2(row.credit_oborot, 2, hyphenOr0)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                                  {formatNumber2(row.saldo_end_debit, 2, hyphenOr0)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                                  {formatNumber2(row.saldo_end_credit, 2, hyphenOr0)}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </tbody>

                      {/* Итоги по агенту */}
                      {agentTotalsData && (
                        <tfoot className="bg-gray-50 dark:bg-gray-700 print:bg-gray-100 print:dark:!bg-gray-100 print:dark:[&_td]:!text-black">
                          <tr className="print:break-inside-avoid print:dark:!bg-gray-100">
                            <td
                              colSpan={2}
                              className="px-2 py-2 font-medium border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:font-medium print:dark:!text-black"
                            >
                              {t("totalExpanded")} {agentName === "no_agent" ? t("noAgent") : agentName}:
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.debit_before_total, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.credit_before_total, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.debit_oborot_total, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.credit_oborot_total, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.saldo_end_debit_total, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.saldo_end_credit_total, 2, hyphenOr0)}
                            </td>
                          </tr>
                          <tr className="print:break-inside-avoid print:dark:!bg-gray-100">
                            <td
                              colSpan={2}
                              className="px-2 py-2 font-medium border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:font-medium print:dark:!text-black"
                            >
                              {t("total")} {agentName === "no_agent" ? t("noAgent") : agentName}:
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.saldo_summ_before_debit, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.saldo_summ_before_credit, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.saldo_summ_oborot_debit, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.saldo_summ_oborot_credit, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.saldo_summ_end_debit, 2, hyphenOr0)}
                            </td>
                            <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-semibold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                              {formatNumber2(agentTotalsData.saldo_summ_end_credit, 2, hyphenOr0)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                );
              })}

              {/* Общие итоги */}
              {grandTotals && (
                <div
                  className="mt-6 overflow-auto rounded-md border border-gray-200 bg-white shadow-sm 
                         dark:border-gray-700 dark:bg-gray-800
                         print:border-0 print:shadow-none print:overflow-visible print:w-full print:max-w-full
                         print:!bg-white"
                >
                  <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 font-bold text-gray-800 dark:text-gray-200 print:bg-yellow-50 print:dark:!text-black">
                    {t("grandTotal") || "ОБЩИЙ ИТОГ"}
                  </div>
                  <table className="border-collapse text-sm w-full print:text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700 print:bg-white print:dark:!bg-white">
                      <tr>
                        <th colSpan={2} className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black"></th>
                        <th colSpan={2} className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">
                          {t("openingBalance")}
                        </th>
                        <th colSpan={2} className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">
                          {t("periodTurnover")}
                        </th>
                        <th colSpan={2} className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">
                          {t("endingBalance")}
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={2} className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black"></th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">DT</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">KT</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">DT</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">KT</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">DT</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300 dark:text-gray-300 dark:border-gray-600 print:dark:!text-black">KT</th>
                      </tr>
                    </thead>
                    <tbody className="print:dark:[&_td]:!text-black">
                      <tr className="bg-yellow-50 dark:bg-yellow-900/30 print:bg-yellow-50 print:break-inside-avoid">
                        <td
                          colSpan={2}
                          className="px-2 py-2 font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:font-bold print:dark:!text-black"
                        >
                          {t("totalExpanded")}:
                        </td>
                        <td className="px-3 whitespace-nowrap py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.debit_before_total, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.credit_before_total, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.debit_oborot_total, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.credit_oborot_total, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.saldo_end_debit_total, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.saldo_end_credit_total, 2, hyphenOr0)}
                        </td>
                      </tr>
                      <tr className="bg-yellow-100 dark:bg-yellow-900/50 print:bg-yellow-100 print:break-inside-avoid print:dark:!bg-yellow-100">
                        <td
                          colSpan={2}
                          className="px-2 py-2 font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:font-bold print:dark:!text-black"
                        >
                          {t("total")}:
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.saldo_summ_before_debit, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.saldo_summ_before_credit, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.saldo_summ_oborot_debit, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.saldo_summ_oborot_credit, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.saldo_summ_end_debit, 2, hyphenOr0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-bold border border-gray-300 dark:text-gray-200 dark:border-gray-600 print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs print:dark:!text-black">
                          {formatNumber2(grandTotals.saldo_summ_end_credit, 2, hyphenOr0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Рендер для sortByAgent=false (оригинальная таблица)
  return (
    <div className="print:bg-white print:p-0 print:m-0 flex justify-center">
      <AnimatePresence>
        {Array.isArray(data) && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-auto rounded-md border border-gray-200 bg-white shadow-sm 
                       dark:border-gray-700 dark:bg-gray-800
                       print:border-0 print:shadow-none print:overflow-visible print:w-full print:max-w-full
                       print:!bg-white"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-3 bg-blue-50 border-b border-gray-200 
                         dark:bg-blue-900/20 dark:border-gray-700
                         print:bg-white print:border-b print:border-gray-300 print:px-2 print:py-1
                         print:dark:!text-black flex justify-between"
            >
              <div
                className="text-sm text-gray-700 dark:text-gray-300
                            print:text-xs print:text-gray-800 print:font-medium
                            print:dark:!text-black"
              >
                {t("period")}: {MyFormatDate(dateFrom)} - {MyFormatDate(dateTo)} | Счет: {accountNumber}
              </div>

              <div className="flex items-center gap-6">
                {/* Checkbox 1 */}
                <div className="flex items-center gap-4">
                  {/* Минус */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hyphenOr0" value="hyphen" checked={hyphenOr0 === false} onChange={() => setHyphenOr0(false)} className="h-4 w-4 text-blue-600 border-gray-300" />
                    <span className="text-sm select-none">0</span>
                  </label>

                  {/* Ноль */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hyphenOr0" value="zero" checked={hyphenOr0 === true} onChange={() => setHyphenOr0(true)} className="h-4 w-4 text-blue-600 border-gray-300" />
                    <span className="text-sm select-none">-</span>
                  </label>
                </div>

                {/* Checkbox 2 */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={() => setShow0((prev) => !prev)} checked={show0} />
                  <span className="text-sm select-none">{t("Empty")}</span>
                </label>
              </div>
              <div className="print:hidden">
                <ExportButton />
              </div>
            </motion.div>

            <table
              className="border-collapse text-sm
                            print:text-xs print:w-full
                            print:[&_th]:py-1 print:[&_td]:py-1
                            print:[&_th]:px-0.5 print:[&_td]:px-0.5
                            print:dark:[&_th]:!text-black print:dark:[&_td]:!text-black"
            >
              <thead
                className="bg-gray-50 sticky top-0
                              dark:bg-gray-700
                              print:bg-white print:sticky print:top-0
                              print:dark:!bg-white"
              >
                <tr>
                  <th
                    rowSpan={2}
                    className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs w-12
                                           print:dark:!text-black cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("agentId")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      №/agent
                      <span className="text-xs">{getSortIcon("agentId")}</span>
                    </div>
                  </th>
                  <th
                    rowSpan={2}
                    className="px-2 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-1 print:py-1 print:text-xs min-w-48
                                           print:dark:!text-black"
                  >
                    {t("subconto")}
                  </th>
                  <th
                    colSpan={2}
                    className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs
                                           print:dark:!text-black"
                  >
                    {t("openingBalance")}
                  </th>
                  <th
                    colSpan={2}
                    className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs
                                           print:dark:!text-black"
                  >
                    {t("periodTurnover")}
                  </th>
                  <th
                    colSpan={2}
                    className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs
                                           print:dark:!text-black"
                  >
                    {t("endingBalance")}
                  </th>
                </tr>

                <tr>
                  {/* DT Opening Balance */}
                  <th
                    className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300
                                            dark:text-gray-300 dark:border-gray-600
                                            print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20
                                            print:dark:!text-black cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("debitBefore")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      DT
                      <span className="text-xs">{getSortIcon("debitBefore")}</span>
                    </div>
                  </th>
                  {/* KT Opening Balance */}
                  <th
                    className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300
                                            dark:text-gray-300 dark:border-gray-600
                                            print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20
                                            print:dark:!text-black cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("creditBefore")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      KT
                      <span className="text-xs">{getSortIcon("creditBefore")}</span>
                    </div>
                  </th>
                  {/* DT Period Turnover */}
                  <th
                    className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300
                                            dark:text-gray-300 dark:border-gray-600
                                            print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20
                                            print:dark:!text-black cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("debitOborot")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      DT
                      <span className="text-xs">{getSortIcon("debitOborot")}</span>
                    </div>
                  </th>
                  {/* KT Period Turnover */}
                  <th
                    className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300
                                            dark:text-gray-300 dark:border-gray-600
                                            print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20
                                            print:dark:!text-black cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("creditOborot")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      KT
                      <span className="text-xs">{getSortIcon("creditOborot")}</span>
                    </div>
                  </th>
                  {/* DT Ending Balance */}
                  <th
                    className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300
                                            dark:text-gray-300 dark:border-gray-600
                                            print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20
                                            print:dark:!text-black cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("saldoEndDebit")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      DT
                      <span className="text-xs">{getSortIcon("saldoEndDebit")}</span>
                    </div>
                  </th>
                  {/* KT Ending Balance */}
                  <th
                    className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300
                                            dark:text-gray-300 dark:border-gray-600
                                            print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20
                                            print:dark:!text-black cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("saldoEndCredit")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      KT
                      <span className="text-xs">{getSortIcon("saldoEndCredit")}</span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="print:dark:[&_td]:!text-black">
                <AnimatePresence>
                  {sortedData.map((row, index) => {
                    let start_saldo_debit = 0;
                    let start_saldo_credit = 0;
                    if (row.debit_before - row.credit_before > 0) {
                      start_saldo_debit = row.debit_before - row.credit_before;
                    } else if (row.debit_before - row.credit_before < 0) {
                      start_saldo_credit = Math.abs(row.debit_before - row.credit_before);
                    }
                    return (
                      <motion.tr
                        key={index}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onDoubleClick={() => {
                          handleRowClick(row.partner_id, row.account_id);
                        }}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700/50
                                print:hover:bg-transparent print:break-inside-avoid
                                print:dark:!bg-white"
                      >
                        <td
                          className="px-1 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-start
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {index + 1} {row.agent?.id && <span className="text-gray-500 dark:text-gray-400">{`- ${row.agent.id}`}</span>}
                        </td>
                        <td
                          className="px-2 py-2 text-gray-800 border border-gray-300
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {row.partner_name}
                        </td>

                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(start_saldo_debit, 2, hyphenOr0)}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(start_saldo_credit, 2, hyphenOr0)}
                        </td>

                        <td
                          className="text-green-700 dark:text-green-400 print:!text-black px-3 py-2 whitespace-nowrap border border-gray-300 text-right
                                   dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.debit_oborot, 2, hyphenOr0)}
                        </td>
                        <td
                          className="text-red-700 dark:text-red-400 print:!text-black px-3 py-2 whitespace-nowrap border border-gray-300 text-right
                                   dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.credit_oborot, 2, hyphenOr0)}
                        </td>

                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.saldo_end_debit, 2, hyphenOr0)}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.saldo_end_credit, 2, hyphenOr0)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>

              <tfoot
                className="bg-gray-50 dark:bg-gray-700
                              print:bg-gray-100
                              print:dark:!bg-gray-100 print:dark:[&_td]:!text-black"
              >
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="print:break-inside-avoid
                            print:dark:!bg-gray-100"
                >
                  <td
                    colSpan={2}
                    className="px-2 py-2 font-medium border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:font-medium
                               print:dark:!text-black"
                  >
                    {t("totalExpanded")}:
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.debit_before_total, 2, hyphenOr0)}
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.credit_before_total, 2, hyphenOr0)}
                  </td>

                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.debit_oborot_total, 2, hyphenOr0)}
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.credit_oborot_total, 2, hyphenOr0)}
                  </td>

                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_end_debit_total, 2, hyphenOr0)}
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_end_credit_total, 2, hyphenOr0)}
                  </td>
                </motion.tr>
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-100 dark:bg-gray-600
                           print:bg-gray-200 print:break-inside-avoid
                           print:dark:!bg-gray-200"
                >
                  <td
                    colSpan={2}
                    className="px-2 py-2 font-medium border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:font-medium
                               print:dark:!text-black"
                  >
                    {t("total")}:
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_before_debit, 2, hyphenOr0)}
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_before_credit, 2, hyphenOr0)}
                  </td>

                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_oborot_debit, 2, hyphenOr0)}
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_oborot_credit, 2, hyphenOr0)}
                  </td>

                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_end_debit, 2, hyphenOr0)}
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_end_credit, 2, hyphenOr0)}
                  </td>
                </motion.tr>
              </tfoot>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetailReport6062;
