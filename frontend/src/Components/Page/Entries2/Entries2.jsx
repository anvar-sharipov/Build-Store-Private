import { useTranslation } from "react-i18next";
import { useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CreditCard, ArrowRightLeft, Coins, MessageSquare, AlertCircle, CheckCircle2, Loader2, TrendingUp, TrendingDown, Edit, Trash2, X, Save, User } from "lucide-react";
import { DateContext } from "../../UI/DateProvider";
import myAxios from "../../axios";
import { Formik, Form, Field } from "formik";
import FetchPartner from "../PurchaseInvoice/fetchs/FetchPartner";
import Saldo from "../PurchaseInvoice/Utils/Saldo";
import Saldo2 from "../PurchaseInvoice/Utils/Saldo2";
import { useNotification } from "../../context/NotificationContext";
import MyModal2 from "../../UI/MyModal2";
import MyFormatDate from "../../UI/MyFormatDate";
import { formatNumber } from "../../UI/formatNumber";

const Entries2 = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);

  const [saldo, setSaldo] = useState(null);
  const [saldo2, setSaldo2] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const { showNotification } = useNotification();
  const [entriesList, setEntriesList] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const [closedDates, setClosedDates] = useState({});

  // Функция для проверки закрыта ли дата
  const checkDateClosed = async (date) => {
    try {
      const res = await myAxios.get("check_day_closed", {
        params: { date: date },
      });
      const day_is_closed = res.data.is_closed;
      const last_day_is_closed = !res.data.last_day_not_closed;
      return !day_is_closed && last_day_is_closed;
    } catch (error) {
      console.error("Ошибка проверки даты:", error);
      return false;
    }
  };

  // Проверяем все даты при загрузке проводок
  useEffect(() => {
    const checkAllDates = async () => {
      const datesStatus = {};

      for (const entry of entriesList) {
        if (entry.date && !datesStatus[entry.date]) {
          const canEdit = await checkDateClosed(entry.date);
          datesStatus[entry.date] = canEdit;
        }
      }

      setClosedDates(datesStatus);
    };

    if (entriesList.length > 0) {
      checkAllDates();
    }
  }, [entriesList]);

  // Функция для проверки можно ли редактировать/удалять конкретную проводку
  const canUpdateAndDeleteEntry = (entry) => {
    return closedDates[entry.date] || false;
  };

  // const [dayIsClosed, setDayIsClosed] = useState(false);
  // const [lastDayIsNotClosed, setLastDayIsNotClosed] = useState(false);
  // const [canUpdateAndDeleteEntry, setCanUpdateAndDeleteEntry] = useState(false);

  // useEffect(() => {
  //   const checkDate = async () => {
  //     try {
  //       const res = await myAxios.get("check_day_closed", {
  //         params: { date: dateProwodok },
  //       });
  //       const day_is_closed = res.data.is_closed;
  //       const last_day_is_closed = !res.data.last_day_not_closed;
  //       setCanUpdateAndDeleteEntry(!day_is_closed && last_day_is_closed);

  //       // setDayIsClosed(res.data.is_closed);
  //       // setLastDayIsNotClosed(res.data.last_day_not_closed);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   if (dateProwodok) {
  //     checkDate();
  //   }
  // }, [dateProwodok]);

  // useEffect(() => {
  //   console.log("canUpdateAndDeleteEntry", canUpdateAndDeleteEntry);
  // }, [canUpdateAndDeleteEntry])

  useEffect(() => {
    document.title = t("entrys");
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await myAxios.get("get-entries-without-faktura", {
        params: {
          dateFrom,
          dateTo,
        },
      });
      setEntriesList(res.data.data || []);
    } catch (err) {
      console.log("cant get entries without faktura", err);
      showNotification(t("error_fetching_entries"), "error");
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [dateFrom, dateTo]);

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
        const allAccounts = res.data;

        const parentIds = new Set(allAccounts.filter((acc) => acc.parent !== null).map((acc) => acc.parent));
        const filteredAccounts = allAccounts.filter((acc) => !parentIds.has(acc.id));

        setAccounts(filteredAccounts);
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
      // setIsLoading(true);
      const payload = {
        date: dateProwodok,
        debitAccount: values.debitAccount,
        creditAccount: values.creditAccount,
        amount: values.amount,
        comment: values.comment,
        partnerId: values.partner?.id,
      };
      const res = await myAxios.post("/create_entry/", payload);
      showNotification(t(res.data.message), "success");
      resetForm();

      // Обновляем список проводок
      await fetchEntries();

      if (values.partner?.id) {
        getSaldo(dateProwodok, values.partner.id);
        getSaldo2(dateProwodok, values.partner.id);
      }
    } catch (error) {
      console.error("Ошибка отправки проводки:", error.response?.data?.message);
      showNotification(t(error.response?.data?.message || "error_creating_entry"), "error");
    } finally {
      // setIsLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    // Заполняем форму редактирования данными проводки
    setEditFormData({
      debitAccount: entry.debit?.account || "",
      creditAccount: entry.credit?.account || "",
      amount: entry.debit?.amount || entry.credit?.amount || "",
      comment: entry.comment || "",
      partner: entry.partner ? (typeof entry.partner === "object" ? entry.partner : { name: entry.partner }) : null,
    });
  };

  const handleSaveEdit = async (values) => {
    if (!editingEntry) return;

    try {
      const payload = {
        date: editingEntry.date,
        debitAccount: values.debitAccount,
        creditAccount: values.creditAccount,
        amount: values.amount,
        comment: values.comment,
        partnerId: values.partner?.id,
      };

      const res = await myAxios.put(`/update_entry/${editingEntry.id}/`, payload);
      showNotification(t("entry_updated"), "success");
      setEditingEntry(null);
      setEditFormData(null);
      await fetchEntries();
      if (payload.partnerId) {
        await getSaldo(editingEntry.date, payload.partnerId);
        await getSaldo2(editingEntry.date, payload.partnerId);
      }
    } catch (error) {
      console.error("Ошибка обновления проводки:", error);
      console.error("Детали ошибки:", error.response?.data);
      showNotification(t("error_updating_entry"), "error");
    }
  };

  const handleDelete = async (entryId) => {
    try {
      const res = await myAxios.delete(`/delete_entry/${entryId}/`);
      showNotification(t("entry_deleted"), "success");
      setDeleteModal(null);
      await fetchEntries();

      // if (values.partner?.id) {
      //   await getSaldo(editingEntry.date, values.partner?.id);
      //   await getSaldo2(editingEntry.date, values.partner?.id);
      // }
    } catch (error) {
      console.error("Ошибка удаления проводки:", error);
      showNotification(t("error_deleting_entry"), "error");
    }
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditFormData(null);
  };

  // Определяем, есть ли сальдо для отображения
  const hasSaldo = saldo2 !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 px-4">
      {/* Модалка подтверждения удаления */}
      <AnimatePresence>
        {deleteModal && (
          <MyModal2 onClose={() => setDeleteModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("confirm_delete")}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t("are_you_sure_delete_entry")}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600"
                >
                  {t("cancel")}
                </button>
                <button onClick={() => handleDelete(deleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  {t("delete")}
                </button>
              </div>
            </motion.div>
          </MyModal2>
        )}
      </AnimatePresence>

      {/* Форма редактирования проводки */}
      <AnimatePresence>
        {editingEntry && (
          <MyModal2 onClose={cancelEdit}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-4xl"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Edit className="w-6 h-6" />
                  {t("edit_entry")}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {t("editing_entry")}: {MyFormatDate(editingEntry.date)}
                </p>
              </div>

              <Formik
                initialValues={
                  editFormData || {
                    debitAccount: "",
                    creditAccount: "",
                    amount: "",
                    comment: "",
                    partner: null,
                  }
                }
                onSubmit={handleSaveEdit}
                enableReinitialize
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <div className="p-6 space-y-5">
                      {/* Дата */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">{t("date")}:</label>
                        <input
                          type="date"
                          value={editingEntry.date}
                          disabled
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 cursor-not-allowed font-medium"
                        />
                      </div>

                      {/* Дебет */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
                          <CreditCard className="w-4 h-4 text-green-500" /> {t("debit")}:
                        </label>
                        <Field
                          as="select"
                          name="debitAccount"
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">{t("select_debit_account")}</option>
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
                          <CreditCard className="w-4 h-4 text-red-500" /> {t("credit")}:
                        </label>
                        <Field
                          as="select"
                          name="creditAccount"
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                          <option value="">{t("select_credit_account")}</option>
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
                          <Coins className="w-4 h-4 text-yellow-500" /> {t("Amount")}:
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
                        <FetchPartner
                          refs={refs}
                          setSaldo={setSaldo}
                          dateProwodok={editingEntry.date}
                          saldo={saldo}
                          getSaldo={getSaldo}
                          saldo2={saldo2}
                          getSaldo2={getSaldo2}
                          setSaldo2={setSaldo2}
                          initialPartner={editingEntry.partner ? (typeof editingEntry.partner === "object" ? editingEntry.partner : { name: editingEntry.partner }) : null}
                        />
                      </div>

                      {/* Комментарий */}
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <MessageSquare className="w-4 h-4 text-blue-500" /> {t("comment2")}:
                        </label>
                        <Field
                          as="textarea"
                          name="comment"
                          rows="4"
                          placeholder={t("add_comment")}
                          className="rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Кнопки */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all"
                        >
                          {t("cancel")}
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          {t("save_changes")}
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </MyModal2>
        )}
      </AnimatePresence>

      {/* Основная форма создания */}
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
        {({ values, resetForm }) => {
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{t("create_entry")}</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{t("accounting_operation")}</p>
                  </div>
                </div>

                {/* Верхняя часть: Форма и Сальдо */}
                <div className={`grid grid-cols-1 ${hasSaldo ? "lg:grid-cols-4" : "lg:grid-cols-1"} gap-6 mb-8`}>
                  {/* Форма - Основной контент */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`${hasSaldo ? "lg:col-span-2" : "lg:col-span-1"} bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
                  >
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {t("details_of_entry")}
                      </h2>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* ... существующие поля формы ... */}
                      {/* Дата */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">{t("date")}:</label>
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
                          <CreditCard className="w-4 h-4 text-green-500" /> {t("debit")}:
                        </label>
                        <Field
                          as="select"
                          name="debitAccount"
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">{t("select_debit_account")}</option>
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
                          <CreditCard className="w-4 h-4 text-red-500" /> {t("credit")}:
                        </label>
                        <Field
                          as="select"
                          name="creditAccount"
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                          <option value="">{t("select_credit_account")}</option>
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
                          <Coins className="w-4 h-4 text-yellow-500" /> {t("Amount")}:
                        </label>
                        <Field
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                            }
                          }}
                          type="number"
                          name="amount"
                          placeholder="0.00"
                          className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all font-medium"
                        />
                      </div>

                      {/* Партнёр */}
                      <div className="pt-2">
                        <FetchPartner refs={refs} setSaldo={setSaldo} dateProwodok={dateProwodok} saldo={saldo} getSaldo={getSaldo} saldo2={saldo2} getSaldo2={getSaldo2} setSaldo2={setSaldo2} />
                      </div>

                      {/* Комментарий */}
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <MessageSquare className="w-4 h-4 text-blue-500" /> {t("comment2")}:
                        </label>
                        <Field
                          as="textarea"
                          name="comment"
                          rows="4"
                          placeholder={t("add_comment")}
                          className="rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Кнопка */}
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 py-3.5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {t("save_entry")}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Сальдо - Справа (только если есть данные) */}
                  {hasSaldo && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
                      {saldo2 && <Saldo2 saldo2={saldo2} />}
                    </motion.div>
                  )}
                </div>

                {/* Нижняя часть: Список проводок */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <ArrowRightLeft className="w-5 h-5" />
                      {t("recent_entries")} ({entriesList.length})
                    </h2>
                  </div>

                  <div className="p-6">
                    {entriesList.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{t("no_entries_found")}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {entriesList.map((entry) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-gray-900/20"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                {/* Заголовок с номером проводки и комментарием */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    {t("confirm_entry")} № {entry.id}
                                  </div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100 flex-1">{entry.comment}</p>
                                </div>

                                <div className="flex items-center gap-6">
                                  {/* Сумма - выделенная */}
                                  <div className="text-xl font-bold dark:text-white bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white px-3 py-2 rounded-lg min-w-24 text-center">
                                    {/* {formatNumber(entry.debit?.amount || entry.credit?.amount)} */}
                                    <div className="flex items-center gap-3">
                                      <Coins className="w-4 h-4 text-yellow-500" />
                                      {new Intl.NumberFormat("ru-RU", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(entry.debit?.amount || entry.credit?.amount)}
                                    </div>
                                  </div>
                                  {/* Разделитель */}
                                  <div className="h-10 w-px bg-gray-300 dark:bg-gray-500"></div>
                                  {/* Счета */}
                                  <div className="flex gap-6 text-sm">
                                    <div className="text-green-600 dark:text-green-400">
                                      <strong className="text-gray-700 dark:text-gray-300">Дт:</strong>
                                      <span className="ml-1 font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-green-700 dark:text-green-300">{entry.debit?.account}</span>
                                    </div>
                                    <div className="text-red-600 dark:text-red-400">
                                      <strong className="text-gray-700 dark:text-gray-300">Кт:</strong>
                                      <span className="ml-1 font-mono bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-red-700 dark:text-red-300">{entry.credit?.account}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {MyFormatDate(entry.date)}
                                    </span>
                                    {entry.partner?.name && (
                                      <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {entry.partner.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(entry)}
                                  className={`
      p-2 rounded-lg transition-all duration-200 border
      ${
        !canUpdateAndDeleteEntry(entry)
          ? "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed"
          : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-110 border-blue-200 dark:border-blue-800 cursor-pointer"
      }
    `}
                                  title={!canUpdateAndDeleteEntry(entry) ? t("no_permission") : t("edit")}
                                  disabled={!canUpdateAndDeleteEntry(entry)}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteModal(entry.id)}
                                  className={`
      p-2 rounded-lg transition-all duration-200 border
      ${
        !canUpdateAndDeleteEntry(entry)
          ? "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed"
          : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-110 border-red-200 dark:border-red-800 cursor-pointer"
      }
    `}
                                  title={!canUpdateAndDeleteEntry(entry) ? t("no_permission") : t("delete")}
                                  disabled={!canUpdateAndDeleteEntry(entry)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Entries2;
