import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import myAxios from "../../axios";

const DetailReport1 = () => {
  const location = useLocation();
  const { accountNumber, dateFrom, dateTo } = location.state || {};
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!accountNumber) return;

    const getDetail = async () => {
      try {
        const res = await myAxios.get("get_detail_account", {
          params: { account: accountNumber, dateFrom, dateTo },
        });
        setTransactions(res.data.transactions);
      } catch (error) {
        console.log(error);
      }
    };

    getDetail();
  }, [accountNumber, dateFrom, dateTo]);

  useEffect(() => {
    console.log("transactions", transactions);
  }, [transactions]);

  return (
    <div className="p-4">
      <h2>Детальный отчет по счёту {accountNumber}</h2>
      <table className="min-w-full border border-gray-300 table-auto mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Дата</th>
            <th className="border px-2 py-1">Описание</th>
            <th className="border px-2 py-1 text-right">Дт</th>
            <th className="border px-2 py-1 text-right">Кт</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => {
            console.log("t", t);
            return (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{t.date}</td>
                <td className="border px-2 py-1">
                  {t.invoice ? (
                    <div className="flex flex-col">
                      <a
                        href={`/purchase-invoices/update/${t.invoice.id}`} // или нужный роут
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{t.description}</span>
                      </a>
                      <span>{t.partner.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span>{t.description}</span>
                      <span>{t.partner.name}</span>
                    </div>
                  )}
                </td>
                <td className="border px-2 py-1 text-right">{t.debit}</td>
                <td className="border px-2 py-1 text-right">{t.credit}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DetailReport1;
