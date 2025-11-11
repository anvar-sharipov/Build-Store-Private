import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import myAxios from "../../axios";
import { DateContext } from "../../UI/DateProvider";
import { formatNumber2 } from "../../UI/formatNumber2";
import MyFormatDate from "../../UI/MyFormatDate";
import { useTranslation } from "react-i18next";

const DetailReport6062 = () => {
  const { dateFrom, dateTo } = useContext(DateContext);
  const [searchParams] = useSearchParams();
  const accountNumber = searchParams.get("accountNumber");
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountNumber) return;

    const getDetail = async () => {
      try {
        setLoading(true);
        const res = await myAxios.get("get_detail_account_60_62", {
          params: { account: accountNumber, dateFrom, dateTo },
        });
        console.log("data = = ", res.data);
        setData(res.data.items || []);
        setTotals(res.data.totals || {});
      } catch (error) {
        console.error("getDetail error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (accountNumber && dateFrom && dateTo) {
      getDetail();
    } else {
      setData(null);
    }
  }, [accountNumber, dateFrom, dateTo]);

  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="print:bg-white print:p-0 print:m-0 flex justify-center">
      <AnimatePresence>
        {data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-auto rounded-md border border-gray-200 bg-white shadow-sm 
                       dark:border-gray-700 dark:bg-gray-800
                       print:border-0 print:shadow-none print:overflow-visible print:w-full print:max-w-full
                       print:!bg-white"
          >
            {/* Заголовок с информацией о периоде и счете */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-3 bg-blue-50 border-b border-gray-200 
                         dark:bg-blue-900/20 dark:border-gray-700
                         print:bg-white print:border-b print:border-gray-300 print:px-2 print:py-1
                         print:dark:!text-black"
            >
              <div
                className="text-sm text-gray-700 dark:text-gray-300
                            print:text-xs print:text-gray-800 print:font-medium
                            print:dark:!text-black"
              >
                {t("period")}: {MyFormatDate(dateFrom)} - {MyFormatDate(dateTo)} | Счет: {accountNumber}
              </div>
            </motion.div>

            <table
              className="border-collapse text-sm
                            print:text-xs print:w-full
                            print:[&_th]:py-1 print:[&_td]:py-1
                            print:[&_th]:px-0.5 print:[&_td]:px-0.5
                            print:dark:[&_th]:!text-black print:dark:[&_td]:!text-black"
            >
              <thead
                className="bg-gray-50 sticky top-0
                              dark:bg-gray-700
                              print:bg-white print:sticky print:top-0
                              print:dark:!bg-white"
              >
                <tr>
                  <th
                    rowSpan={2}
                    className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs w-12
                                           print:dark:!text-black"
                  >
                    №/agent
                  </th>
                  <th
                    rowSpan={2}
                    className="px-2 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-1 print:py-1 print:text-xs min-w-48
                                           print:dark:!text-black"
                  >
                    {t("subconto")}
                  </th>
                  <th
                    colSpan={2}
                    className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs
                                           print:dark:!text-black"
                  >
                    {t("openingBalance")}
                  </th>
                  <th
                    colSpan={2}
                    className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs
                                           print:dark:!text-black"
                  >
                    {t("periodTurnover")}
                  </th>
                  <th
                    colSpan={2}
                    className="px-1 py-2 text-center font-medium text-gray-600 border border-gray-300
                                           dark:text-gray-300 dark:border-gray-600
                                           print:border print:border-gray-300 print:font-medium print:px-0.5 print:py-1 print:text-xs
                                           print:dark:!text-black"
                  >
                    {t("endingBalance")}
                  </th>
                </tr>

                <tr>
                  {[...Array(6)].map((_, index) => (
                    <th
                      key={index}
                      className="px-3 py-2 text-center font-medium text-gray-600 border border-gray-300
                                            dark:text-gray-300 dark:border-gray-600
                                            print:border print:border-gray-300 print:font-normal print:px-0.5 print:py-1 print:text-xs w-28 print:w-20
                                            print:dark:!text-black"
                    >
                      {index % 2 === 0 ? "DT" : "KT"}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody
                className="print:dark:[&_td]:!text-black"
              >
                <AnimatePresence>
                  {data.map((row, index) => {
                    console.log("agent", row.agent?.id);
                    
                    return (
                      <motion.tr
                        key={index}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="hover:bg-gray-100 dark:hover:bg-gray-700/50
                                print:hover:bg-transparent print:break-inside-avoid
                                print:dark:!bg-white"
                      >
                        <td
                          className="px-1 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-center
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {index + 1}{row.agent?.id && `-${row.agent.id}`}
                        </td>
                        <td
                          className="px-2 py-2 text-gray-800 border border-gray-300
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {row.partner_name}
                        </td>

                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.debit_before)}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.credit_before)}
                        </td>

                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.debit_oborot)}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.credit_oborot)}
                        </td>

                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.saldo_end_debit)}
                        </td>
                        <td
                          className="px-3 py-2 whitespace-nowrap text-gray-800 border border-gray-300 text-right
                                   dark:text-gray-200 dark:border-gray-600
                                   print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                                   print:dark:!text-black"
                        >
                          {formatNumber2(row.saldo_end_credit)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>

              <tfoot
                className="bg-gray-50 dark:bg-gray-700
                              print:bg-gray-100
                              print:dark:!bg-gray-100 print:dark:[&_td]:!text-black"
              >
                <motion.tr 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.2 }} 
                  className="print:break-inside-avoid
                            print:dark:!bg-gray-100"
                >
                  <td colSpan={2}
                    className="px-2 py-2 font-medium border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:font-medium
                               print:dark:!text-black"
                  >
                    {t("totalExpanded")}:
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.debit_before_total)}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.credit_before_total)}
                  </td>

                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.debit_oborot_total)}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.credit_oborot_total)}
                  </td>

                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_end_debit_total)}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_end_credit_total)}
                  </td>
                </motion.tr>
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-100 dark:bg-gray-600
                           print:bg-gray-200 print:break-inside-avoid
                           print:dark:!bg-gray-200"
                >
                  <td colSpan={2}
                    className="px-2 py-2 font-medium border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-1 print:py-1 print:text-xs print:font-medium
                               print:dark:!text-black"
                  >
                    {t("total")}:
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_before_debit)}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_before_credit)}
                  </td>

                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_oborot_debit)}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_oborot_credit)}
                  </td>

                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_end_debit)}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-semibold border border-gray-300
                               dark:text-gray-200 dark:border-gray-600
                               print:border print:border-gray-300 print:px-0.5 print:py-1 print:text-xs
                               print:dark:!text-black"
                  >
                    {formatNumber2(totals.saldo_summ_end_credit)}
                  </td>
                </motion.tr>
              </tfoot>
            </table>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default DetailReport6062;