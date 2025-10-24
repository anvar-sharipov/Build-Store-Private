import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import myAxios from "../../axios";

const DetailReport1 = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { accountNumber, dateFrom, dateTo } = location.state || {};
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountNumber) return;

    const getDetail = async () => {
      try {
        setLoading(true);
        const res = await myAxios.get("get_detail_account", {
          params: { account: accountNumber, dateFrom, dateTo },
        });
        setTransactions(res.data.transactions);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getDetail();
  }, [accountNumber, dateFrom, dateTo]);

  const totalDebit = transactions.reduce((sum, t) => sum + (parseFloat(t.debit) || 0), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + (parseFloat(t.credit) || 0), 0);
  const balance = totalDebit - totalCredit;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {t("detail report")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Счёт: <span className="font-semibold text-blue-600 dark:text-blue-400">{accountNumber}</span>
              </p>
            </div>
          </div>
          
          {dateFrom && dateTo && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4" />
              <span>Период: {dateFrom} - {dateTo}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Table */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                      <th className="px-4 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="px-4 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Описание
                      </th>
                      <th className="px-4 py-4 text-right text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Дт
                        </div>
                      </th>
                      <th className="px-4 py-4 text-right text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingDown className="w-4 h-4" />
                          Кт
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((t, i) => (
                      <motion.tr
                        key={i}
                        variants={itemVariants}
                        className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {t.date}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {t.invoice ? (
                            <div className="flex flex-col gap-1">
                              <a
                                href={`/purchase-invoices/update/${t.invoice.id}`}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium group transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span>{t.description}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {t.partner.name}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {t.description}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {t.partner?.name}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600 dark:text-green-400">
                          {t.debit || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600 dark:text-red-400">
                          {t.credit || '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer with Totals */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 border-t-2 border-gray-300 dark:border-gray-500"
              >
                <div className="px-4 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl ml-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                        Итого Дебет
                      </div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalDebit.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                        Итого Кредит
                      </div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {totalCredit.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 shadow-md">
                      <div className="text-xs uppercase tracking-wide text-blue-100 mb-1">
                        Сальдо
                      </div>
                      <div className={`text-2xl font-bold text-white`}>
                        {balance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Empty State */}
            {transactions.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
              >
                <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Нет транзакций за выбранный период
                </p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DetailReport1;