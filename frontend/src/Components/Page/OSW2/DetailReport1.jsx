// DetailReport1.jsx
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import myAxios from "../../axios";

const formatNumber = (v) => {
  const num = Number(v) || 0;
  return num.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const DetailReport1 = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { accountNumber, dateFrom, dateTo } = location.state || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


  

  useEffect(() => {
    if (!accountNumber) return;

    let mounted = true;
    const getDetail = async () => {
      try {
        setLoading(true);
        const res = await myAxios.get("get_detail_account", {
          params: { account: accountNumber, dateFrom, dateTo },
        });

        if (!mounted) return;
        setData(res.data);
      } catch (error) {
        console.error("getDetail error:", error);
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getDetail();
    return () => {
      mounted = false;
    };
  }, [accountNumber, dateFrom, dateTo]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-600">
        Нет данных для отображения
      </div>
    );
  }

  const { account, transactions, osw } = data;
  const oswData = osw[0] || {};
  
  // Вычисляем текущее сальдо для каждой строки
  let runningBalance = (oswData.initial_debit || 0) - (oswData.initial_credit || 0);

  return (
    <div className="bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Кнопка печати */}
      <div className="mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Printer className="w-4 h-4" />
          Печать
        </button>
      </div>

      {/* Шапка отчета */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold mb-2">
          Детальный отчет по счету {account?.number}
        </h1>
        <p className="text-sm text-gray-600">{account?.name}</p>
        {dateFrom && dateTo && (
          <p className="text-sm text-gray-600 mt-1">
            за период с {dateFrom} по {dateTo}
          </p>
        )}
      </div>

      {/* Таблица */}
      <table className="w-full border-collapse border border-black text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-2 text-left">Дата</th>
            <th className="border border-black px-2 py-2 text-left">Операция</th>
            <th className="border border-black px-2 py-2 text-right w-24">Дебет</th>
            <th className="border border-black px-2 py-2 text-right w-24">Кредит</th>
            <th className="border border-black px-2 py-2 text-right w-32">Текущее сальдо</th>
          </tr>
        </thead>
        <tbody>
          {/* Начальное сальдо */}
          <tr className="font-semibold bg-gray-50">
            <td className="border border-black px-2 py-2">{dateFrom || "—"}</td>
            <td className="border border-black px-2 py-2">Сальдо на начало периода</td>
            <td className="border border-black px-2 py-2 text-right">
              {oswData.initial_debit > 0 ? formatNumber(oswData.initial_debit) : "—"}
            </td>
            <td className="border border-black px-2 py-2 text-right">
              {oswData.initial_credit > 0 ? formatNumber(oswData.initial_credit) : "—"}
            </td>
            <td className="border border-black px-2 py-2 text-right">
              {formatNumber(runningBalance)}
            </td>
          </tr>

          {/* Проводки */}
          {transactions && transactions.length > 0 ? (
            transactions.map((t, i) => {
              runningBalance += (t.debit || 0) - (t.credit || 0);
              
              if (t.description == "Faktura (wozwrat) № 4586 11.02.26") {
                console.log("Transaction:", t, "Running Balance:", runningBalance);
              }
              return (
                <tr key={i}>
                  <td className="border border-black px-2 py-2">{t.date}</td>
                  <td className="border border-black px-2 py-2">{t.description || "—"}</td>
                  <td className="border border-black px-2 py-2 text-right">
                    {account?.number == "75" && t.debit < 0 ? (
                      <div>{formatNumber(t.debit)}</div>
                    ) : (
                      <div>{t.debit > 0 ? formatNumber(t.debit) : "—"}</div>
                    )}
                    
                  </td>
                  <td className="border border-black px-2 py-2 text-right">
                    {t.credit > 0 ? formatNumber(t.credit) : "—"}
                  </td>
                  <td className="border border-black px-2 py-2 text-right">
                    {formatNumber(runningBalance)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="border border-black px-2 py-4 text-center text-gray-500">
                Нет операций за период
              </td>
            </tr>
          )}

          {/* Обороты за период */}
          <tr className="font-semibold bg-gray-50">
            <td colSpan={2} className="border border-black px-2 py-2 text-right">
              Обороты за период:
            </td>
            <td className="border border-black px-2 py-2 text-right">
              {formatNumber(oswData.debit || 0)}
            </td>
            <td className="border border-black px-2 py-2 text-right">
              {formatNumber(oswData.credit || 0)}
            </td>
            <td className="border border-black px-2 py-2"></td>
          </tr>

          {/* Конечное сальдо */}
          <tr className="font-semibold bg-gray-50">
            <td className="border border-black px-2 py-2">{dateTo || "—"}</td>
            <td className="border border-black px-2 py-2">Сальдо на конец периода</td>
            <td className="border border-black px-2 py-2 text-right">
              {oswData.final_debit > 0 ? formatNumber(oswData.final_debit) : "—"}
            </td>
            <td className="border border-black px-2 py-2 text-right">
              {oswData.final_credit > 0 ? formatNumber(oswData.final_credit) : "—"}
            </td>
            <td className="border border-black px-2 py-2 text-right">
              {formatNumber((oswData.final_debit || 0) - (oswData.final_credit || 0))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Подпись */}
      <div className="mt-8 text-sm">
        <p>Дата формирования: {new Date().toLocaleDateString("ru-RU")}</p>
      </div>
    </div>
  );
};

export default DetailReport1;