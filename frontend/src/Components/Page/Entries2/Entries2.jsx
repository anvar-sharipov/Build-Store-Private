import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CreditCard, ArrowRightLeft, Coins, MessageSquare } from "lucide-react";
import { DateContext } from "../../UI/DateProvider";
import myAxios from "../../axios";
import { Formik, Form, Field } from "formik";
import FetchPartner from "../PurchaseInvoice/fetchs/FetchPartner";
import Saldo from "../PurchaseInvoice/Utils/Saldo";

const Entries2 = () => {
  const { dateProwodok } = useContext(DateContext);
  const [saldo, setSaldo] = useState(null);
  const [accounts, setAccounts] = useState([]); // <-- сюда загрузим счета

  useEffect(() => {
    document.title = "Prowodka"; // название вкладки
  }, []);

  const refs = {
    partnerRef: useRef(null),
    partnerListRef: useRef([]),
    partnerX_Ref: useRef(null),
    productRef: useRef(null),
    awtoRef: useRef(null),
    awtoX_Ref: useRef(null),
  };

  // Загрузка счетов
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await myAxios.get("/accounts"); // замените на ваш endpoint
        setAccounts(res.data); // ожидаем массив { id, name }
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
      await myAxios.post("/create_entry/", payload);
    console.log("payload", payload);
    
      alert("Проводка успешно создана!");
      resetForm();

      if (values.partner?.id) {
        getSaldo(dateProwodok, values.partner.id);
      }
    } catch (error) {
      console.error("Ошибка отправки проводки:", error);
      alert("Ошибка при создании проводки");
    }
  };

  return (
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
          } else {
            setSaldo(null);
          }
        }, [values.partner, dateProwodok]);

        return (
          <Form>
            <motion.div className="p-6 md:p-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-500 dark:text-green-400" />
                Создание проводки
              </h2>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
                {/* Дата */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Дата:</label>
                  <input type="date" value={dateProwodok} disabled
                    className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-not-allowed select-none w-full sm:w-auto"
                  />
                </div>

                {/* Дебет */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <CreditCard className="w-4 h-4 text-blue-500" /> Счёт Дебет:
                  </label>
                  <Field as="select" name="debitAccount"
                    className="w-full sm:w-80 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите счёт</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.number}>{acc.number} {acc.name}</option>
                    ))}
                  </Field>
                </div>

                {/* Кредит */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <ArrowRightLeft className="w-4 h-4 text-purple-500" /> Счёт Кредит:
                  </label>
                  <Field as="select" name="creditAccount"
                    className="w-full sm:w-80 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Выберите счёт</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.number}>{acc.number} {acc.name}</option>
                    ))}
                  </Field>
                </div>

                {/* Сумма */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Coins className="w-4 h-4 text-yellow-500" /> Сумма:
                  </label>
                  <Field type="number" name="amount" placeholder="Введите сумму"
                    className="w-full sm:w-60 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Партнёр */}
                <FetchPartner refs={refs} setSaldo={setSaldo} dateProwodok={dateProwodok} saldo={saldo} getSaldo={getSaldo} />

                {/* Комментарий */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MessageSquare className="w-4 h-4 text-teal-500" /> Комментарий:
                  </label>
                  <Field as="textarea" name="comment" rows="3" placeholder="Добавьте комментарий (необязательно)"
                    className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button type="submit" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                  Сохранить проводку
                </button>
              </div>

              {/* Сальдо */}
              {saldo && <Saldo saldo={saldo} />}
            </motion.div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default Entries2;
