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
        console.log("res.data", res.data);
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
    <div className="bg-white dark:bg-gray-900 p-8 max-w-7xl mx-auto print:p-4 print:bg-white min-h-screen">
      {/* Кнопка печати */}
      <div className="mb-6 print:hidden flex justify-end">
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
        >
          <Printer className="w-4 h-4" />
          Печать
        </button>
      </div>

      {/* Карточки */}
      <div className="space-y-12">
        {cards.map((data, i) => (
          <div key={i} className="print:break-inside-avoid">
            {/* Таблица */}
            <table className="w-full border-collapse border border-black dark:border-gray-400 text-sm print:border-black">
              <thead className="table-header-repeat">
                <tr className="bg-gray-200 dark:bg-gray-800 print:bg-gray-200">
                  <th colSpan={5} className="border border-black dark:border-gray-400 p-3 text-left dark:text-white print:text-black print:border-black">
                    <div>
                      <h2 className="text-base font-semibold mb-1">
                        Карточка счёта: {data.account} {data.partner && `— ${data.partner}`}
                      </h2>
                      <p className="text-sm mb-0 text-gray-700 dark:text-gray-300 print:text-gray-700">
                        Период с {data.date_from} по {data.date_to}
                      </p>
                    </div>
                  </th>
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100">
                  <th className="border border-black dark:border-gray-400 p-2 dark:text-white print:text-black print:border-black">Дата</th>
                  <th className="border border-black dark:border-gray-400 p-2 dark:text-white print:text-black print:border-black">Операции</th>
                  <th className="border border-black dark:border-gray-400 p-2 text-right dark:text-white print:text-black print:border-black">Дебет</th>
                  <th className="border border-black dark:border-gray-400 p-2 text-right dark:text-white print:text-black print:border-black">Кредит</th>
                  <th className="border border-black dark:border-gray-400 p-2 text-right dark:text-white print:text-black print:border-black">Текущее сальдо</th>
                </tr>
              </thead>
              <tbody>
                {/* Начальный баланс */}
                <tr className="font-semibold bg-gray-50 dark:bg-gray-800 print:bg-gray-100">
                  <td className="border border-black dark:border-gray-400 p-2 dark:text-gray-200 print:text-black print:border-black">{data.date_from}</td>
                  <td className="border border-black dark:border-gray-400 p-2 dark:text-gray-200 print:text-black print:border-black">Saldo на начало</td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">
                    {formatNumber(data.saldo_start)}
                  </td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">—</td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">
                    {formatNumber(data.saldo_start)}
                  </td>
                </tr>

                {/* Операции */}
                {data.movements && data.movements.length > 0 ? (
                  data.movements.map((m, idx) => (
                    <tr key={idx} className="dark:bg-gray-900 dark:hover:bg-gray-800">
                      <td className="border border-black dark:border-gray-400 p-2 dark:text-gray-300 print:text-black print:border-black">{m.date}</td>
                      <td className="border border-black dark:border-gray-400 p-2 dark:text-gray-300 print:text-black print:border-black">{m.description}</td>
                      <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-300 print:text-black print:border-black">
                        {m.debit ? formatNumber(m.debit) : "—"}
                      </td>
                      <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-300 print:text-black print:border-black">
                        {m.credit ? formatNumber(m.credit) : "—"}
                      </td>
                      <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-300 print:text-black print:border-black">
                        {formatNumber(m.saldo)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-black dark:border-gray-400 px-2 py-3 text-center text-gray-500 dark:text-gray-400 italic print:text-black print:border-black">
                      Нет операций за период
                    </td>
                  </tr>
                )}

                {/* Обороты */}
                <tr className="font-semibold bg-gray-100 dark:bg-gray-800 print:bg-gray-200">
                  <td className="border border-black dark:border-gray-400 p-2 dark:text-gray-200 print:text-black print:border-black"></td>
                  <td className="border border-black dark:border-gray-400 p-2 dark:text-gray-200 print:text-black print:border-black">Обороты за период</td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">
                    {formatNumber(data.debit_turnover)}
                  </td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">
                    {formatNumber(data.credit_turnover)}
                  </td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">—</td>
                </tr>

                {/* Конечный баланс */}
                <tr className="font-semibold bg-gray-50 dark:bg-gray-800 print:bg-gray-100">
                  <td className="border border-black dark:border-gray-400 p-2 dark:text-gray-200 print:text-black print:border-black">{data.date_to}</td>
                  <td className="border border-black dark:border-gray-400 p-2 dark:text-gray-200 print:text-black print:border-black">Saldo на конец</td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">
                    {formatNumber(data.saldo_end)}
                  </td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">—</td>
                  <td className="border border-black dark:border-gray-400 p-2 text-right dark:text-gray-200 print:text-black print:border-black">
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
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
          <p>Дата формирования: {new Date().toLocaleDateString("ru-RU")}</p>
        </div>
      )}
    </div>
  );
};

export default AccountCardDetail;