import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, TrendingUp, Calendar, ChevronRight, Loader2, Printer } from "lucide-react";
import myAxios from "../../axios";
import { DateContext } from "../../UI/DateProvider";
import { useNavigate } from "react-router-dom";
import { ROUTES_RAPORT } from "../../../routes";


const OSW2 = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const [osw, setOsw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [viewMode, setViewMode] = useState("modern"); // "modern" или "word"
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${t("osw")}`;
  }, []);

  useEffect(() => {
    const getAccounts = async () => {
      setLoading(true);
      try {
        const res = await myAxios.get("get_account_for_osw2", {
          params: {
            dateFrom: dateFrom,
            dateTo: dateTo,
          },
        });
        console.log("res.data ===", res.data);
        setOsw(res.data);
      } catch (error) {
        console.log("cant get_account_for_osw2 GGG", error);
      } finally {
        setLoading(false);
      }
    };
    getAccounts();
  }, [dateFrom, dateTo]);

  const formatNumber = (num) => {
    if (!num || num === 0) return "—";
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleRowClick = (accountNumber) => {
    if (accountNumber !== "60" && accountNumber !== "62") {
      navigate(ROUTES_RAPORT.DETAIL_REPORT_1, {
        state: { accountNumber, dateFrom, dateTo },
      });
    } else {
      navigate(`/detail-account-report-60-62?accountNumber=${accountNumber}`);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] print:hidden">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 dark:text-blue-400 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Загрузка данных...</p>
        </motion.div>
      </div>
    );
  }

  if (osw.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[400px] gap-4 print:hidden">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">Нет данных за выбранный период</p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Print Version */}
      {osw.length > 0 && (
        <div className="print:block hidden p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">{t("osw")}</h1>
            <p className="text-sm text-gray-600">
              Период: {dateFrom} — {dateTo}
            </p>
          </div>

          <table className="w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm" rowSpan={2}>
                  Счёт
                </th>
                <th className="border-2 border-black px-3 py-2 text-left font-bold text-sm" rowSpan={2}>
                  Название счёта
                </th>
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-sm" colSpan={2}>
                  Сальдо на начало периода
                </th>
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-sm" colSpan={2}>
                  Обороты за период
                </th>
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-sm" colSpan={2}>
                  Сальдо на конец периода
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-xs">Дебет</th>
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-xs">Кредит</th>
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-xs">Дебет</th>
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-xs">Кредит</th>
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-xs">Дебет</th>
                <th className="border-2 border-black px-3 py-2 text-center font-bold text-xs">Кредит</th>
              </tr>
            </thead>
            <tbody>
              {osw.map((o, idx) => (
                <tr key={o.number} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-black px-3 py-2 font-mono text-sm font-semibold">{o.number}</td>
                  <td className="border border-black px-3 py-2 text-sm">{o.name}</td>
                  <td className="border border-black px-3 py-2 text-right font-mono text-sm">{formatNumber(o.initial_debit)}</td>
                  <td className="border border-black px-3 py-2 text-right font-mono text-sm">{formatNumber(o.initial_credit)}</td>
                  <td className="border border-black px-3 py-2 text-right font-mono text-sm font-semibold">{formatNumber(o.debit)}</td>
                  <td className="border border-black px-3 py-2 text-right font-mono text-sm font-semibold">{formatNumber(o.credit)}</td>
                  <td className="border border-black px-3 py-2 text-right font-mono text-sm">{formatNumber(o.final_debit)}</td>
                  <td className="border border-black px-3 py-2 text-right font-mono text-sm">{formatNumber(o.final_credit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 font-bold">
                <td className="border-2 border-black px-3 py-2 text-right" colSpan={2}>
                  Итого
                </td>
                <td className="border-2 border-black px-3 py-2 text-right">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.initial_debit : sum), 0))}</td>
                <td className="border-2 border-black px-3 py-2 text-right">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.initial_credit : sum), 0))}</td>
                <td className="border-2 border-black px-3 py-2 text-right">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.debit : sum), 0))}</td>
                <td className="border-2 border-black px-3 py-2 text-right">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.credit : sum), 0))}</td>
                <td className="border-2 border-black px-3 py-2 text-right">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.final_debit : sum), 0))}</td>
                <td className="border-2 border-black px-3 py-2 text-right">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.final_credit : sum), 0))}</td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-8 text-xs text-gray-600">
            <div className="flex justify-between">
              <div>Дата формирования: {new Date().toLocaleDateString("ru-RU")}</div>
              <div>Страница 1</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen Version */}
      {viewMode === "modern" ? (
        // Modern Design
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen print:hidden">
          {/* Header with View Mode Toggle */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{t("osw")}</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {dateFrom} — {dateTo}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow">
                  <button
                    onClick={() => setViewMode("modern")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "modern" ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Современный
                  </button>
                  <button
                    onClick={() => setViewMode("word")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "word" ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Word стиль
                  </button>
                </div>

                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow">
                  <Printer className="w-4 h-4" />
                  Печать
                </button>
              </div>
            </div>
          </motion.div>

          {/* Desktop Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold" rowSpan={2}>
                      Счёт
                    </th>
                    <th className="px-6 py-4 text-left font-semibold" rowSpan={2}>
                      Название
                    </th>
                    <th className="px-6 py-3 text-center font-semibold border-l border-blue-400" colSpan={2}>
                      На начало
                    </th>
                    <th className="px-6 py-3 text-center font-semibold border-l border-blue-400" colSpan={2}>
                      Обороты
                    </th>
                    <th className="px-6 py-3 text-center font-semibold border-l border-blue-400" colSpan={2}>
                      На конец
                    </th>
                  </tr>
                  <tr className="bg-blue-600 dark:bg-blue-700">
                    <th className="px-4 py-3 text-right text-sm border-l border-blue-400">Дт</th>
                    <th className="px-4 py-3 text-right text-sm">Kт</th>
                    <th className="px-4 py-3 text-right text-sm border-l border-blue-400">Дт</th>
                    <th className="px-4 py-3 text-right text-sm">Kт</th>
                    <th className="px-4 py-3 text-right text-sm border-l border-blue-400">Дт</th>
                    <th className="px-4 py-3 text-right text-sm">Kт</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {osw.map((o, idx) => (
                      <motion.tr
                        key={o.number}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onDoubleClick={() => handleRowClick(o.number)}
                        onMouseEnter={() => setHoveredRow(o.number)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{o.number}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          <div className="flex items-center justify-between">
                            <span>{o.name}</span>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-all duration-200 ${hoveredRow === o.number ? "translate-x-1 text-blue-500" : ""}`} />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700">{formatNumber(o.initial_debit)}</td>
                        <td className="px-4 py-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400">{formatNumber(o.initial_credit)}</td>
                        <td className="px-4 py-4 text-right font-mono text-sm font-semibold text-green-600 dark:text-green-400 border-l border-gray-200 dark:border-gray-700">
                          {formatNumber(o.debit)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-sm font-semibold text-red-600 dark:text-red-400">{formatNumber(o.credit)}</td>
                        <td className="px-4 py-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700">{formatNumber(o.final_debit)}</td>
                        <td className="px-4 py-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400">{formatNumber(o.final_credit)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
                <tfoot className="bg-blue-100 dark:bg-blue-900 font-semibold text-sm">
                  <tr>
                    <td className="px-6 py-4 text-right dark:text-gray-200" colSpan={2}>
                      Итого
                    </td>
                    <td className="px-4 py-4 text-right dark:text-gray-200">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.initial_debit : sum), 0))}</td>
                    <td className="px-4 py-4 text-right dark:text-gray-200">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.initial_credit : sum), 0))}</td>
                    <td className="px-4 py-4 text-right dark:text-gray-200">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.debit : sum), 0))}</td>
                    <td className="px-4 py-4 text-right dark:text-gray-200">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.credit : sum), 0))}</td>
                    <td className="px-4 py-4 text-right dark:text-gray-200">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.final_debit : sum), 0))}</td>
                    <td className="px-4 py-4 text-right dark:text-gray-200">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.final_credit : sum), 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden space-y-4">
            <AnimatePresence>
              {osw.map((o, idx) => (
                <motion.div
                  key={o.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleRowClick(o.number)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">СЧЁТ</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">{o.number}</div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 dark:text-gray-500 mt-2" />
                  </div>

                  <div className="text-gray-700 dark:text-gray-300 font-medium mb-4">{o.name}</div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">НА НАЧАЛО</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Дт</div>
                          <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{formatNumber(o.initial_debit)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Kт</div>
                          <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{formatNumber(o.initial_credit)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-red-50 dark:from-green-900/20 dark:to-red-900/20 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">ОБОРОТЫ</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Дт</div>
                          <div className="font-mono text-sm font-semibold text-green-600 dark:text-green-400">{formatNumber(o.debit)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Kт</div>
                          <div className="font-mono text-sm font-semibold text-red-600 dark:text-red-400">{formatNumber(o.credit)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">НА КОНЕЦ</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Дт</div>
                          <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{formatNumber(o.final_debit)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Kт</div>
                          <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{formatNumber(o.final_credit)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Word Style Design
        <div className="bg-white dark:bg-gray-900 p-8 max-w-7xl mx-auto print:hidden min-h-screen">
          {/* Header with View Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("osw")}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Период: {dateFrom} — {dateTo}
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("modern")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "modern" ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Современный
                  </button>
                  <button
                    onClick={() => setViewMode("word")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "word" ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Word стиль
                  </button>
                </div>

                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  <Printer className="w-4 h-4" />
                  Печать
                </button>
              </div>
            </div>
          </div>

          {/* Word Style Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black dark:border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-left font-bold dark:text-white" rowSpan={2}>
                    Счёт
                  </th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-left font-bold dark:text-white" rowSpan={2}>
                    Название счёта
                  </th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center font-bold dark:text-white" colSpan={2}>
                    Сальдо на начало
                  </th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center font-bold dark:text-white" colSpan={2}>
                    Обороты за период
                  </th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center font-bold dark:text-white" colSpan={2}>
                    Сальдо на конец
                  </th>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center text-xs dark:text-white">Дебет</th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center text-xs dark:text-white">Кредит</th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center text-xs dark:text-white">Дебет</th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center text-xs dark:text-white">Кредит</th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center text-xs dark:text-white">Дебет</th>
                  <th className="border border-black dark:border-gray-400 px-3 py-2 text-center text-xs dark:text-white">Кредит</th>
                </tr>
              </thead>
              <tbody>
                {osw.map((o, idx) => (
                  <tr key={o.number} onClick={() => handleRowClick(o.number)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                    <td className="border border-black dark:border-gray-400 px-3 py-2 font-mono font-semibold dark:text-gray-200">{o.number}</td>
                    <td className="border border-black dark:border-gray-400 px-3 py-2 dark:text-gray-300">{o.name}</td>
                    <td className="border border-black dark:border-gray-400 px-3 py-2 text-right font-mono dark:text-gray-300">{formatNumber(o.initial_debit)}</td>
                    <td className="border border-black dark:border-gray-400 px-3 py-2 text-right font-mono dark:text-gray-300">{formatNumber(o.initial_credit)}</td>
                    <td className="border border-black dark:border-gray-400 px-3 py-2 text-right font-mono font-semibold dark:text-gray-300">{formatNumber(o.debit)}</td>
                    <td className="border border-black dark:border-gray-400 px-3 py-2 text-right font-mono font-semibold dark:text-gray-300">{formatNumber(o.credit)}</td>
                    <td className="border border-black dark:border-gray-400 px-3 py-2 text-right font-mono dark:text-gray-300">{formatNumber(o.final_debit)}</td>
                    <td className="border border-black dark:border-gray-400 px-3 py-2 text-right font-mono dark:text-gray-300">{formatNumber(o.final_credit)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 dark:bg-gray-800 font-bold">
                  <td className="border border-black dark:border-gray-400 px-3 py-2 text-right dark:text-white" colSpan={2}>
                    Итого
                  </td>
                  <td className="border border-black dark:border-gray-400 px-3 py-2 text-right dark:text-white">
                    {formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.initial_debit : sum), 0))}
                  </td>
                  <td className="border border-black dark:border-gray-400 px-3 py-2 text-right dark:text-white">
                    {formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.initial_credit : sum), 0))}
                  </td>
                  <td className="border border-black dark:border-gray-400 px-3 py-2 text-right dark:text-white">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.debit : sum), 0))}</td>
                  <td className="border border-black dark:border-gray-400 px-3 py-2 text-right dark:text-white">{formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.credit : sum), 0))}</td>
                  <td className="border border-black dark:border-gray-400 px-3 py-2 text-right dark:text-white">
                    {formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.final_debit : sum), 0))}
                  </td>
                  <td className="border border-black dark:border-gray-400 px-3 py-2 text-right dark:text-white">
                    {formatNumber(osw.reduce((sum, o) => (!o.is_parent ? sum + o.final_credit : sum), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
            <p>Дата формирования: {new Date().toLocaleDateString("ru-RU")}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default OSW2;
