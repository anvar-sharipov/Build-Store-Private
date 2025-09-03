import { formatNumber } from "../../UI/formatNumber";

const Report = ({ report, setOpenModal }) => {
  return (
    <>
      {report.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-2 print:bg-white print:shadow-none print:p-0">
          <table className="min-w-full table-auto border-collapse text-xs print:table-fixed print:border print:border-black">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:bg-white print:!text-black">
                <th className="px-2 py-1 border" rowSpan={2}>
                  Счёт
                </th>
                <th className="px-2 py-1 border" rowSpan={2}>
                  Название
                </th>
                <th className="px-2 py-1 border" colSpan={2}>
                  На начало
                </th>
                <th className="px-2 py-1 border" colSpan={2}>
                  Обороты
                </th>
                <th className="px-2 py-1 border" colSpan={2}>
                  Сальдо на конец
                </th>
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
                  <tr
                    key={idx}
                    className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white hover:bg-indigo-200 dark:hover:bg-indigo-500 cursor-pointer"
                    onClick={() => setOpenModal({ state: true, account: item.account })}
                  >
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
                <td className="px-2 py-1 border" colSpan={2}>
                  Итого
                </td>
                <td className="px-2 py-1 border">{formatNumber(report.reduce((sum, i) => sum + Math.max(parseFloat(i.opening_balance) || 0, 0), 0))}</td>
                <td className="px-2 py-1 border">{formatNumber(report.reduce((sum, i) => sum + Math.max(-(parseFloat(i.opening_balance) || 0), 0), 0))}</td>
                <td className="px-2 py-1 border">{formatNumber(report.reduce((sum, i) => sum + (parseFloat(i.debit_turnover) || 0), 0))}</td>
                <td className="px-2 py-1 border">{formatNumber(report.reduce((sum, i) => sum + (parseFloat(i.credit_turnover) || 0), 0))}</td>
                <td className="px-2 py-1 border">
                  {formatNumber(report.reduce((sum, i) => sum + Math.max((parseFloat(i.opening_balance) || 0) + (parseFloat(i.debit_turnover) || 0) - (parseFloat(i.credit_turnover) || 0), 0), 0))}
                </td>
                <td className="px-2 py-1 border">
                  {formatNumber(report.reduce((sum, i) => sum + Math.max(-((parseFloat(i.opening_balance) || 0) + (parseFloat(i.debit_turnover) || 0) - (parseFloat(i.credit_turnover) || 0)), 0), 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Report;
