import { useState } from "react";
import myAxios from "../../axios";
import { formatNumber } from "../../UI/formatNumber";

const OSW = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [report, setReport] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await myAxios.get("get-osw/", {
        params: { date_from: dateFrom, date_to: dateTo },
      });
      setReport(response.data.report);
    } catch (error) {
      console.error("Ошибка при запросе OSW:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">

        {/* Форма */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 mb-4 print:hidden">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Выберите диапазон дат
          </h2>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Дата от</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-1 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Дата до</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-1 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none" required />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600 transition text-sm dark:bg-blue-600 dark:hover:bg-blue-700">
              Применить
            </button>
          </form>
        </div>

        {/* Период отчета */}
        {report.length > 0 && (
          <div className="mb-1 print:block hidden text-xs text-gray-700 dark:text-gray-200">
            Период: {dateFrom} — {dateTo}
          </div>
        )}

        {/* Таблица ОСВ */}
        {report.length > 0 && (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-2 print:bg-white print:shadow-none print:p-0">
            <table className="min-w-full table-auto border-collapse text-xs print:table-fixed print:border print:border-black">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:bg-white print:!text-black">
                  <th className="px-2 py-1 border" rowSpan={2}>Счёт</th>
                  <th className="px-2 py-1 border" rowSpan={2}>Название</th>
                  <th className="px-2 py-1 border" colSpan={2}>На начало</th>
                  <th className="px-2 py-1 border" colSpan={2}>Обороты</th>
                  <th className="px-2 py-1 border" colSpan={2}>Сальдо на конец</th>
                </tr>
                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <th className="px-2 py-1 border">Дт</th>
                  <th className="px-2 py-1 border">Кт</th>
                  <th className="px-2 py-1 border">Дт</th>
                  <th className="px-2 py-1 border">Кт</th>
                  <th className="px-2 py-1 border">Дт</th>
                  <th className="px-2 py-1 border">Кт</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item, idx) => {
                  const opening = parseFloat(item.opening_balance) || 0;
                  const debit = parseFloat(item.debit_turnover) || 0;
                  const credit = parseFloat(item.credit_turnover) || 0;
                  const closing = opening + debit - credit;

                  const openingDt = opening > 0 ? formatNumber(opening) : "-";
                  const openingKt = opening < 0 ? formatNumber(-opening) : "-";
                  const closingDt = closing > 0 ? formatNumber(closing) : "-";
                  const closingKt = closing < 0 ? formatNumber(-closing) : "-";

                  return (
                    <tr key={idx} className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                      <td className="px-2 py-1 border">{item.account}</td>
                      <td className="px-2 py-1 border">{item.name}</td>
                      <td className="px-2 py-1 border">{openingDt}</td>
                      <td className="px-2 py-1 border">{openingKt}</td>
                      <td className="px-2 py-1 border">{formatNumber(debit) || "-"}</td>
                      <td className="px-2 py-1 border">{formatNumber(credit) || "-"}</td>
                      <td className="px-2 py-1 border">{closingDt}</td>
                      <td className="px-2 py-1 border">{closingKt}</td>
                    </tr>
                  );
                })}
                <tr className="font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                  <td className="px-2 py-1 border" colSpan={2}>Итого</td>
                  <td className="px-2 py-1 border">
                    {formatNumber(report.reduce((sum, i) => sum + Math.max(parseFloat(i.opening_balance) || 0, 0), 0))}
                  </td>
                  <td className="px-2 py-1 border">
                    {formatNumber(report.reduce((sum, i) => sum + Math.max(-(parseFloat(i.opening_balance) || 0), 0), 0))}
                  </td>
                  <td className="px-2 py-1 border">
                    {formatNumber(report.reduce((sum, i) => sum + (parseFloat(i.debit_turnover) || 0), 0))}
                  </td>
                  <td className="px-2 py-1 border">
                    {formatNumber(report.reduce((sum, i) => sum + (parseFloat(i.credit_turnover) || 0), 0))}
                  </td>
                  <td className="px-2 py-1 border">
                    {formatNumber(report.reduce((sum, i) => sum + Math.max(
                      (parseFloat(i.opening_balance) || 0) + (parseFloat(i.debit_turnover) || 0) - (parseFloat(i.credit_turnover) || 0), 0
                    ), 0))}
                  </td>
                  <td className="px-2 py-1 border">
                    {formatNumber(report.reduce((sum, i) => sum + Math.max(
                      -((parseFloat(i.opening_balance) || 0) + (parseFloat(i.debit_turnover) || 0) - (parseFloat(i.credit_turnover) || 0)), 0
                    ), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OSW;
