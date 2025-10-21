import { useEffect, useState, useContext } from "react";
import { DateContext } from "../../UI/DateProvider";
import myAxios from "../../axios";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyFormatDate from "../../UI/MyFormatDate";

const TransactionJournal = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const [journal, setJournal] = useState([]);
  const [period, setPeriod] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    document.title = t("Transaction Journal")
  }, [t])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await myAxios.get("get_transaction_journal/", {
          params: { dateFrom, dateTo },
        });
        setJournal(res.data.journal);
        setPeriod(res.data.period);
      } catch (error) {
        console.error("Ошибка при получении журнала операций:", error);
      }
    };
    fetchData();
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const sum = journal.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    setTotalAmount(sum);
  }, [journal]);

  const today = new Date().toLocaleDateString();

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500 print:bg-white print:p-2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-center mb-4 print:mb-2">
          <BookOpen className="w-6 h-6 text-blue-600 mr-2 print:hidden" />
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center">{t("Transaction Journal")}</h1>
        </div>

        {/* Период */}
        <p className="text-center text-gray-600 text-sm mb-4 print:mb-2">{t("Period")}: {`${MyFormatDate(dateFrom)} - ${MyFormatDate(dateTo)}`}</p>

        {/* Таблица */}
        <div className="overflow-x-auto rounded-lg shadow-lg print:shadow-none">
          <table className="w-full border-collapse text-sm print:text-xs">
            <thead className="bg-blue-100 text-gray-800 print:table-header-group">
              <tr>
                <th className="px-2 py-1 text-left print:border print:border-gray-400">{t("Date")}</th>
                <th className="px-2 py-1 text-left print:border print:border-gray-400">{t("Operation")}</th>
                <th className="px-2 py-1 text-center print:border print:border-gray-400">Debit</th>
                <th className="px-2 py-1 text-center print:border print:border-gray-400">Credit</th>
                <th className="px-2 py-1 text-right print:border print:border-gray-400">{t("Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {journal.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 print:border print:border-gray-400">
                    No transactions found for this period.
                  </td>
                </tr>
              ) : (
                journal.map((item, idx) => (
                  <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="hover:bg-gray-100 transition print:leading-tight">
                    <td className="px-2 py-1 print:border print:border-gray-400">{item.date}</td>
                    <td className="px-2 py-1 print:border print:border-gray-400">{item.operation}</td>
                    <td className="px-2 py-1 text-center print:border print:border-gray-400">{item.debit}</td>
                    <td className="px-2 py-1 text-center print:border print:border-gray-400">{item.credit}</td>
                    <td className="px-2 py-1 text-right print:border print:border-gray-400">{Number(item.amount).toLocaleString()}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
            <tfoot className="font-semibold bg-gray-50 print:table-footer-group">
              <tr>
                <td colSpan="4" className="px-2 py-1 text-right print:border print:border-gray-400">
                  Total Amount:
                </td>
                <td className="px-2 py-1 text-right print:border print:border-gray-400">{totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer info */}
        <div className="text-right mt-4 text-xs text-gray-600 print:mt-2">Printed on: {today}</div>
      </motion.div>
    </div>
  );
};

export default TransactionJournal;
