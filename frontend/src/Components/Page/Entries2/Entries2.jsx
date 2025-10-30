import { useTranslation } from "react-i18next";
import { useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CreditCard, ArrowRightLeft, Coins, MessageSquare, AlertCircle, CheckCircle2, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { DateContext } from "../../UI/DateProvider";
import myAxios from "../../axios";
import { Formik, Form, Field } from "formik";
import FetchPartner from "../PurchaseInvoice/fetchs/FetchPartner";
import Saldo from "../PurchaseInvoice/Utils/Saldo";
import Saldo2 from "../PurchaseInvoice/Utils/Saldo2";
import { useNotification } from "../../context/NotificationContext";
import MyModal2 from "../../UI/MyModal2";

const Entries2 = () => {
  const { t } = useTranslation();
  const { dateProwodok } = useContext(DateContext);
  const [saldo, setSaldo] = useState(null);
  const [saldo2, setSaldo2] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const { showNotification } = useNotification();
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = t("entrys");
  }, []);

  const refs = {
    partnerRef: useRef(null),
    partnerListRef: useRef([]),
    partnerX_Ref: useRef(null),
    productRef: useRef(null),
    awtoRef: useRef(null),
    awtoX_Ref: useRef(null),
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await myAxios.get("/accounts");
        setAccounts(res.data);
      } catch (error) {
        console.log("Ошибка загрузки счетов:", error);
      }
    };
    fetchAccounts();
  }, []);

  const getSaldo = async (date, partnerId) => {
    try {
      const res = await myAxios.get("get_saldo_for_partner_for_selected_date", {
        params: { date, partnerId },
      });
      setSaldo(res.data.saldo);
    } catch (error) {
      console.log("Ошибка get_saldo_for_partner_for_selected_date", error);
      setSaldo(null);
    }
  };

  const getSaldo2 = async (date, partnerId) => {
    try {
      const res = await myAxios.get("get_saldo_for_partner_for_selected_date2", {
        params: { date, partnerId },
      });
      setSaldo2(res.data.saldo);
    } catch (error) {
      console.log("Ошибка get_saldo_for_partner_for_selected_date2", error);
      setSaldo2(null);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        date: dateProwodok,
        debitAccount: values.debitAccount,
        creditAccount: values.creditAccount,
        amount: values.amount,
        comment: values.comment,
        partnerId: values.partner?.id,
      };
      const res = await myAxios.post("/create_entry/", payload);
      console.log("res.data", res.data);
      showNotification(t(res.data.message), "success");

      if (values.partner?.id) {
        getSaldo(dateProwodok, values.partner.id);
        getSaldo2(dateProwodok, values.partner.id);
      }
    } catch (error) {
      console.error("Ошибка отправки проводки:", error.response.data.message);
      showNotification(t(error.response.data.message), "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 px-4">
      {openModal && (
        <MyModal2 onClose={() => setOpenModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-md">
              <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="relative flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Подтверждение</h2>
                </motion.div>
              </div>

              <div className="p-6 space-y-4 text-center">
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  Вы уверены, что хотите сделать проводку?
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-300 text-left">
                    <p className="font-semibold mb-1">Внимание!</p>
                    <p>После подтверждения отмена будет невозможна.</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Отмена
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenModal(false);
                      document.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                    }}
                    disabled={isLoading}
                    className="flex-1 group relative py-2.5 px-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Проводка...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Проводка</span>
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </div>

              <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            </div>
          </motion.div>
        </MyModal2>
      )}

      <Formik
        initialValues={{
          debitAccount: "",
          creditAccount: "",
          amount: "",
          comment: "",
          partner: null,
        }}
        onSubmit={handleSubmit}
      >
        {({ values }) => {
          useEffect(() => {
            if (values.partner?.id) {
              getSaldo(dateProwodok, values.partner.id);
              getSaldo2(dateProwodok, values.partner.id);
            } else {
              setSaldo(null);
              setSaldo2(null);
            }
          }, [values.partner, dateProwodok]);

          return (
            <Form>
              <motion.div className="max-w-7xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <ArrowRightLeft className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Создание проводки</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Бухгалтерская операция</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Форма - Слева (2 колонки) */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Детали проводки
                      </h2>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Дата */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">Дата:</label>
                        <input
                          type="date"
                          value={dateProwodok}
                          disabled
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 cursor-not-allowed font-medium"
                        />
                      </div>

                      {/* Дебет */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
                          <CreditCard className="w-4 h-4 text-green-500" /> Дебет:
                        </label>
                        <Field
                          as="select"
                          name="debitAccount"
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">Выберите счёт дебета</option>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.number}>
                              {acc.number} - {acc.name}
                            </option>
                          ))}
                        </Field>
                      </div>

                      {/* Кредит */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
                          <CreditCard className="w-4 h-4 text-red-500" /> Кредит:
                        </label>
                        <Field
                          as="select"
                          name="creditAccount"
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                          <option value="">Выберите счёт кредита</option>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.number}>
                              {acc.number} - {acc.name}
                            </option>
                          ))}
                        </Field>
                      </div>

                      {/* Сумма */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
                          <Coins className="w-4 h-4 text-yellow-500" /> Сумма:
                        </label>
                        <Field
                          type="number"
                          name="amount"
                          placeholder="0.00"
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all font-medium"
                        />
                      </div>

                      {/* Партнёр */}
                      <div className="pt-2">
                        {/* <FetchPartner refs={refs} setSaldo={setSaldo} dateProwodok={dateProwodok} saldo={saldo} getSaldo={getSaldo} /> */}
                        <FetchPartner refs={refs} setSaldo={setSaldo} dateProwodok={dateProwodok} saldo={saldo} getSaldo={getSaldo} saldo2={saldo2} getSaldo2={getSaldo2} setSaldo2={setSaldo2} />
                      </div>

                      {/* Комментарий */}
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <MessageSquare className="w-4 h-4 text-blue-500" /> Комментарий:
                        </label>
                        <Field
                          as="textarea"
                          name="comment"
                          rows="4"
                          placeholder="Добавьте комментарий к проводке..."
                          className="rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Кнопка */}
                      <motion.button
                        type="button"
                        onClick={() => setOpenModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 py-3.5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Сохранить проводку
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Сальдо - Справа (1 колонка) */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
                    {/* {saldo && <Saldo saldo={saldo} />} */}
                    {saldo2 && <Saldo2 saldo2={saldo2} />}
                  </motion.div>
                </div>
              </motion.div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Entries2;