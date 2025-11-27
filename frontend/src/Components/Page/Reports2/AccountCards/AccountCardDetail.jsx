import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import myAxios from "../../../axios";
import { DateContext } from "../../../UI/DateProvider";
import { Printer } from "lucide-react";

const formatNumber = (v) => {
  const num = Number(v) || 0;
  return num.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AccountCardDetail = () => {
  const { id } = useParams();
  const [cards, setCards] = useState([]);
  const { dateFrom, dateTo } = useContext(DateContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await myAxios.get(`get_account_cards/${id}/`, {
          params: { dateFrom, dateTo },
        });
        setCards(res.data);
      } catch (error) {
        console.error("Ошибка при получении детальной карточки:", error);
      }
    };
    fetchData();
  }, [id, dateFrom, dateTo]);

  const handlePrint = () => window.print();

  if (!cards.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-2 max-w-7xl mx-auto print:p-1 print:bg-white print:text-xs min-h-screen">
      {/* Кнопка печати */}
      <div className="mb-2 print:hidden flex justify-end">
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-sm"
        >
          <Printer className="w-3 h-3" />
          Печать
        </button>
      </div>

      {/* Карточки */}
      <div className="space-y-4 print:space-y-2">
        {cards.map((data, i) => (
          <div key={i} className="print:break-inside-avoid print:mb-1">
            {/* Таблица */}
            <table className="w-full border-collapse border border-gray-800 dark:border-gray-400 print:text-xs print:leading-tight">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-800 print:bg-gray-200">
                  <th colSpan={5} className="border border-gray-800 dark:border-gray-400 p-1 text-left dark:text-white print:text-black print:border-gray-800">
                    <div>
                      <h2 className="text-sm font-semibold mb-0 print:text-xs">
                        Карточка счёта: {data.account} {data.partner && `— ${data.partner}`}
                      </h2>
                      <p className="text-xs mb-0 text-gray-700 dark:text-gray-300 print:text-gray-700 print:text-xs">
                        Период с {data.date_from} по {data.date_to}
                      </p>
                    </div>
                  </th>
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100">
                  <th className="border border-gray-800 dark:border-gray-400 p-1 dark:text-white print:text-black print:border-gray-800 print:w-16">Дата</th>
                  <th className="border border-gray-800 dark:border-gray-400 p-1 dark:text-white print:text-black print:border-gray-800">Операции</th>
                  <th className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-white print:text-black print:border-gray-800 print:w-20">Дебет</th>
                  <th className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-white print:text-black print:border-gray-800 print:w-20">Кредит</th>
                  <th className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-white print:text-black print:border-gray-800 print:w-24">Сальдо</th>
                </tr>
              </thead>
              <tbody>
                {/* Начальный баланс */}
                <tr className="font-semibold bg-gray-50 dark:bg-gray-800 print:bg-gray-100">
                  <td className="border border-gray-800 dark:border-gray-400 p-1 dark:text-gray-200 print:text-black print:border-gray-800">{data.date_from}</td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 dark:text-gray-200 print:text-black print:border-gray-800">Saldo на начало</td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">
                    {formatNumber(data.saldo_start)}
                  </td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">—</td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">
                    {formatNumber(data.saldo_start)}
                  </td>
                </tr>

                {/* Операции */}
                {data.movements && data.movements.length > 0 ? (
                  data.movements.map((m, idx) => (
                    <tr key={idx} className="dark:bg-gray-900">
                      <td className="border border-gray-800 dark:border-gray-400 p-1 dark:text-gray-300 print:text-black print:border-gray-800">{m.date}</td>
                      <td className="border border-gray-800 dark:border-gray-400 p-1 dark:text-gray-300 print:text-black print:border-gray-800">{m.description}</td>
                      <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-300 print:text-black print:border-gray-800">
                        {m.debit ? formatNumber(m.debit) : "—"}
                      </td>
                      <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-300 print:text-black print:border-gray-800">
                        {m.credit ? formatNumber(m.credit) : "—"}
                      </td>
                      <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-300 print:text-black print:border-gray-800">
                        {formatNumber(m.saldo)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-gray-800 dark:border-gray-400 p-1 text-center text-gray-500 dark:text-gray-400 italic print:text-black print:border-gray-800">
                      Нет операций за период
                    </td>
                  </tr>
                )}

                {/* Обороты */}
                <tr className="font-semibold bg-gray-100 dark:bg-gray-800 print:bg-gray-200">
                  <td className="border border-gray-800 dark:border-gray-400 p-1 dark:text-gray-200 print:text-black print:border-gray-800"></td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 dark:text-gray-200 print:text-black print:border-gray-800">Обороты за период</td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">
                    {formatNumber(data.debit_turnover)}
                  </td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">
                    {formatNumber(data.credit_turnover)}
                  </td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">—</td>
                </tr>

                {/* Конечный баланс */}
                <tr className="font-semibold bg-gray-50 dark:bg-gray-800 print:bg-gray-100">
                  <td className="border border-gray-800 dark:border-gray-400 p-1 dark:text-gray-200 print:text-black print:border-gray-800">{data.date_to}</td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 dark:text-gray-200 print:text-black print:border-gray-800">Saldo на конец</td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">
                    {formatNumber(data.saldo_end)}
                  </td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">—</td>
                  <td className="border border-gray-800 dark:border-gray-400 p-1 text-right dark:text-gray-200 print:text-black print:border-gray-800">
                    {formatNumber(data.saldo_end)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Дата формирования */}
      {cards.length > 0 && (
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 print:text-gray-600 print:mt-2">
          <p>Дата формирования: {new Date().toLocaleDateString("ru-RU")}</p>
        </div>
      )}
    </div>
  );
};

export default AccountCardDetail;