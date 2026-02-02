import React, { useEffect, useMemo, useState } from "react";
import { formatNumber } from "../../../UI/formatNumber";

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const mergeEntries = (entries) => {
  const map = new Map();
  entries.forEach((entry) => {
    const dateKey = new Date(entry.date).toISOString().slice(0, 10);
    const key = `${dateKey}|${entry.account?.number || ""}|${
      entry.transaction_obj?.description || ""
    }`;

    if (!map.has(key)) {
      map.set(key, {
        ...entry,
        debit: parseFloat(entry.debit) || 0,
        credit: parseFloat(entry.credit) || 0,
      });
    } else {
      const existing = map.get(key);
      existing.debit += parseFloat(entry.debit) || 0;
      existing.credit += parseFloat(entry.credit) || 0;
      map.set(key, existing);
    }
  });
  return Array.from(map.values());
};

const GetSaldo2 = ({ entries, setTotalDebit, totalDebit, totalPaySumm }) => {
  const today = new Date();

  const [lastSumDebit, setLastSumDebit] = useState(0);
  const [lastSumKredit, setLastSumKredit] = useState(0);

  useEffect(() => {
    let sumDebit = 0;
    let sumKredit = 0;

    entries.forEach((e) => {
      sumDebit += parseFloat(e.debit) || 0;
      sumKredit += parseFloat(e.credit) || 0;
    });

    setLastSumDebit(sumDebit);
    setLastSumKredit(sumKredit);
  }, [entries]);

  

  // Фильтруем по дате — только сегодня
  const entriesToday = useMemo(() => {
    if (!Array.isArray(entries)) return [];
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, today);
    });
  }, [entries, today]);

  

  const mergedEntries = useMemo(() => mergeEntries(entries), [entries]);

  // Считаем running balance (нарастающий итог) для объединённых проводок
  let runningBalance = 0;
  const entriesWithRunningBalance = mergedEntries.map((e) => {
    runningBalance += e.debit - e.credit;
    return {
      ...e,
      debit: e.debit === 0 ? "" : e.debit.toFixed(2),
      credit: e.credit === 0 ? "" : e.credit.toFixed(2),
      running_balance: runningBalance.toFixed(2),
    };
  });


  // if (entriesWithRunningBalance.length === 0) {
  //   return <div>Проводок за сегодня нет</div>;
  // }

  return (
    <div className="overflow-auto max-h-[500px] p-4 bg-white rounded shadow-md">
      <table className="w-full border-collapse border border-gray-300 text-sm font-sans">
        <thead className="bg-gray-100">
          <tr>
            {/* <th className="border border-gray-300 px-3 py-1 text-left">Дата</th> */}
            <th className="border border-gray-300 px-3 py-1 text-left">
              Операция
            </th>
            <th className="border border-gray-300 px-3 py-1 text-right">
              Дебет
            </th>
            <th className="border border-gray-300 px-3 py-1 text-right">
              Кредит
            </th>
            <th className="border border-gray-300 px-3 py-1 text-right">
              Сальдо
            </th>
          </tr>
        </thead>
        <tbody>
    
          <tr className="hover:bg-gray-50 cursor-default">
            <td className="border border-gray-300 px-3 py-1">
              Сальдо на начало дня
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(lastSumDebit)}
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(lastSumKredit)}
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(
                parseFloat(lastSumDebit) - parseFloat(lastSumKredit)
              )}
            </td>
          </tr>

          <tr className="hover:bg-gray-50 cursor-default">
            <td className="border border-gray-300 px-3 py-1">Обороты за день</td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(totalDebit)}
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(totalPaySumm)}
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(parseFloat(totalDebit) - parseFloat(totalPaySumm))}
            </td>
          </tr>

          <tr className="hover:bg-gray-50 cursor-default">
            <td className="border border-gray-300 px-3 py-1">
              Сальдо на конец дня
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(parseFloat(lastSumDebit) + parseFloat(totalDebit))}
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(
                parseFloat(lastSumKredit) + parseFloat(totalPaySumm)
              )}
            </td>
            <td className="border border-gray-300 px-3 py-1 text-right">
              {formatNumber(
                parseFloat(lastSumDebit) +
                  parseFloat(totalDebit) -
                  (parseFloat(lastSumKredit) + parseFloat(totalPaySumm))
              )}
            </td>
          </tr>
          {/* {entriesWithRunningBalance.length > 0 &&
            entriesWithRunningBalance.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 cursor-default">
                <td className="border border-gray-300 px-3 py-1 whitespace-nowrap">
                {new Date(entry.date).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </td>
                <td className="border border-gray-300 px-3 py-1">
                  {entry.transaction_obj?.description || "-"} faktura №{" "}
                  {entry.transaction_obj.invoice}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-right">
                  {formatNumber(entry.debit)}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-right">
                  {formatNumber(entry.credit)}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-right">
                  {formatNumber(entry.running_balance)}
                </td>
              </tr>
            ))}  */}
        </tbody>
      </table>
    </div>
  );
};

export default GetSaldo2;
