import { useTranslation } from "react-i18next";
import { useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CreditCard, ArrowRightLeft, Coins, MessageSquare, CheckCircle2, Edit, Trash2, Save, User } from "lucide-react";
import { DateContext } from "../../UI/DateProvider";
import myAxios from "../../axios";
import { Formik, Form, Field } from "formik";
import FetchPartner2 from "../../UI/FetchPartner2";
import Saldo2 from "../../UI/Saldo2";
import { useNotification } from "../../context/NotificationContext";
import MyModal2 from "../../UI/MyModal2";
import MyFormatDate from "../../UI/MyFormatDate";

// Компонент PartnerField с независимыми состояниями
const PartnerField = ({
  accountNumber, // номер счета (60, 62, 75, 76)
  fieldName, // имя поля в Formik (debitPartner или creditPartner)
  currentPartner, // текущий партнер
  onPartnerSelect, // функция выбора партнера
  refs,
  dateProwodok,
  getSaldo,
  getSaldo2,
}) => {
  // Показываем поле только если выбран счет из списка
  if (!accountNumber || !["60", "62", "75", "76"].includes(accountNumber)) {
    return null;
  }

  return (
    <div className="pt-2 w-full">
      <div className="w-full">
        <FetchPartner2 refs={refs} dateProwodok={dateProwodok} getSaldo={getSaldo} getSaldo2={getSaldo2} currentPartner={currentPartner} onPartnerSelect={onPartnerSelect} fieldName={fieldName} accountNumber={accountNumber} />
      </div>
    </div>
  );
};

const Entries2 = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);

  // РАЗДЕЛЕННЫЕ состояния для дебета и кредита
  const [debitSaldo, setDebitSaldo] = useState(null);
  const [debitSaldo2, setDebitSaldo2] = useState(null);
  const [creditSaldo, setCreditSaldo] = useState(null);
  const [creditSaldo2, setCreditSaldo2] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const { showNotification } = useNotification();
  const [entriesList, setEntriesList] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [closedDates, setClosedDates] = useState({});

  const [letPrintSaldo, setLetPrintSaldo] = useState(false);

  // Создаем стабильные функции getSaldo с замыканием типа
  const getDebitSaldo = async (date, partnerId) => {
    if (!partnerId) {
      setDebitSaldo(null);
      return;
    }

    try {
      const res = await myAxios.get("get_saldo_for_partner_for_selected_date", {
        params: { date, partnerId },
      });
      setDebitSaldo(res.data.saldo);
    } catch (error) {
      console.log("Ошибка get_saldo_for_partner_for_selected_date", error);
      setDebitSaldo(null);
    }
  };

  const getDebitSaldo2 = async (date, partnerId) => {
    if (!partnerId) {
      setDebitSaldo2(null);
      return;
    }

    try {
      const res = await myAxios.get("get_saldo_for_partner_for_selected_date2", {
        params: { date, partnerId },
      });
      setDebitSaldo2(res.data.saldo);
    } catch (error) {
      console.log("Ошибка get_saldo_for_partner_for_selected_date2", error);
      setDebitSaldo2(null);
    }
  };

  const getCreditSaldo = async (date, partnerId) => {
    if (!partnerId) {
      setCreditSaldo(null);
      return;
    }

    try {
      const res = await myAxios.get("get_saldo_for_partner_for_selected_date", {
        params: { date, partnerId },
      });
      setCreditSaldo(res.data.saldo);
    } catch (error) {
      console.log("Ошибка get_saldo_for_partner_for_selected_date", error);
      setCreditSaldo(null);
    }
  };

  const getCreditSaldo2 = async (date, partnerId) => {
    if (!partnerId) {
      setCreditSaldo2(null);
      return;
    }

    try {
      const res = await myAxios.get("get_saldo_for_partner_for_selected_date2", {
        params: { date, partnerId },
      });
      setCreditSaldo2(res.data.saldo);
    } catch (error) {
      console.log("Ошибка get_saldo_for_partner_for_selected_date2", error);
      setCreditSaldo2(null);
    }
  };

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
      if (entriesList.length === 0) return;

      console.log("Checking dates for", entriesList.length, "entries");

      const datesStatus = {};
      const uniqueDates = [...new Set(entriesList.map((entry) => entry.date).filter(Boolean))];

      console.log("Unique dates to check:", uniqueDates);

      for (const date of uniqueDates) {
        try {
          const canEdit = await checkDateClosed(date);
          datesStatus[date] = canEdit;
          console.log(`Date ${date}: canEdit = ${canEdit}`);
        } catch (error) {
          console.error(`Error checking date ${date}:`, error);
          datesStatus[date] = false;
        }
      }

      setClosedDates(datesStatus);
    };

    // Добавляем задержку чтобы избежать множественных вызовов
    const timeoutId = setTimeout(checkAllDates, 100);

    return () => clearTimeout(timeoutId);
  }, [entriesList]);

  // Функция для проверки можно ли редактировать/удалять конкретную проводку
  const canUpdateAndDeleteEntry = (entry) => {
    return closedDates[entry.date] || false;
  };

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

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        date: dateProwodok,
        debitAccount: values.debitAccount,
        creditAccount: values.creditAccount,
        amount: values.amount,
        comment: values.comment,
        debitPartnerId: values.debitPartner?.id,
        creditPartnerId: values.creditPartner?.id,
      };

      const res = await myAxios.post("/create_entry/", payload);
      showNotification(t(res.data.message), "success");
      resetForm();
      setDebitSaldo(null);
      setDebitSaldo2(null);
      setCreditSaldo(null);
      setCreditSaldo2(null);
      await fetchEntries();
    } catch (error) {
      console.error("Ошибка создания проводки:", error);
      showNotification(t("error_creating_entry"), "error");
    }
  };

  const handleEdit = (entry) => {
    console.log("Editing entry:", entry);
    console.log("Debit partner:", entry.debitPartner);
    console.log("Credit partner:", entry.creditPartner);
    setEditingEntry(entry);

    setEditFormData({
      debitAccount: entry.debit?.account || "",
      creditAccount: entry.credit?.account || "",
      amount: entry.debit?.amount || entry.credit?.amount || "",
      comment: entry.comment || "",
      debitPartner: entry.debitPartner || entry.debit?.partner || null, // Партнер из дебетовой проводки
      creditPartner: entry.creditPartner || entry.credit?.partner || null, // Партнер из кредитовой проводки
    });

    setDebitSaldo(null);
    setDebitSaldo2(null);
    setCreditSaldo(null);
    setCreditSaldo2(null);

    // Если есть партнеры, сразу загружаем их сальдо
    if (entry.debitPartner?.id || entry.debit?.partner?.id) {
      const partnerId = entry.debitPartner?.id || entry.debit?.partner?.id;
      getDebitSaldo(entry.date, partnerId);
      getDebitSaldo2(entry.date, partnerId);
    }

    if (entry.creditPartner?.id || entry.credit?.partner?.id) {
      const partnerId = entry.creditPartner?.id || entry.credit?.partner?.id;
      getCreditSaldo(entry.date, partnerId);
      getCreditSaldo2(entry.date, partnerId);
    }
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
        debitPartnerId: values.debitPartner?.id,
        creditPartnerId: values.creditPartner?.id,
      };

      console.log("Sending update payload:", payload); // Логирование
      console.log("Updating transaction ID:", editingEntry.id); // Логирование

      const res = await myAxios.put(`/update_entry/${editingEntry.id}/`, payload);
      showNotification(t("entry_updated"), "success");
      setEditingEntry(null);
      setEditFormData(null);
      setDebitSaldo(null);
      setDebitSaldo2(null);
      setCreditSaldo(null);
      setCreditSaldo2(null);
      await fetchEntries();
    } catch (error) {
      console.error("Ошибка обновления проводки:", error);
      console.error("Response data:", error.response?.data); // Логирование деталей ошибки
      showNotification(t("error_updating_entry"), "error");
    }
  };

  const handleDelete = async (entryId) => {
    try {
      const res = await myAxios.delete(`/delete_entry/${entryId}/`);
      showNotification(t("entry_deleted"), "success");
      setDeleteModal(null);
      await fetchEntries();
    } catch (error) {
      console.error("Ошибка удаления проводки:", error);
      showNotification(t("error_deleting_entry"), "error");
    }
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditFormData(null);
    setDebitSaldo(null);
    setDebitSaldo2(null);
    setCreditSaldo(null);
    setCreditSaldo2(null);
  };

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
                    debitPartner: null,
                    creditPartner: null,
                  }
                }
                onSubmit={handleSaveEdit}
                enableReinitialize
              >
                {({ values, setFieldValue }) => {
                  // Очистка партнера при смене счета
                  const handleDebitAccountChange = (e) => {
                    const newValue = e.target.value;
                    setFieldValue("debitAccount", newValue);

                    // Очистка партнера если счет не требует партнера
                    const needsPartner = newValue && ["60", "62", "75", "76"].includes(newValue);
                    if (!needsPartner && values.debitPartner !== null) {
                      setFieldValue("debitPartner", null);
                      setDebitSaldo(null);
                      setDebitSaldo2(null);
                    }
                  };

                  const handleCreditAccountChange = (e) => {
                    const newValue = e.target.value;
                    setFieldValue("creditAccount", newValue);

                    // Очистка партнера если счет не требует партнера
                    const needsPartner = newValue && ["60", "62", "75", "76"].includes(newValue);
                    if (!needsPartner && values.creditPartner !== null) {
                      setFieldValue("creditPartner", null);
                      setCreditSaldo(null);
                      setCreditSaldo2(null);
                    }
                  };

                  // Обработчик выбора дебетового партнера
                  const handleDebitPartnerSelect = (partner) => {
                    setFieldValue("debitPartner", partner);
                    if (partner?.id) {
                      getDebitSaldo(editingEntry.date, partner.id);
                      getDebitSaldo2(editingEntry.date, partner.id);
                    } else {
                      setDebitSaldo(null);
                      setDebitSaldo2(null);
                    }
                  };

                  // Обработчик выбора кредитового партнера
                  const handleCreditPartnerSelect = (partner) => {
                    setFieldValue("creditPartner", partner);
                    if (partner?.id) {
                      getCreditSaldo(editingEntry.date, partner.id);
                      getCreditSaldo2(editingEntry.date, partner.id);
                    } else {
                      setCreditSaldo(null);
                      setCreditSaldo2(null);
                    }
                  };

                  return (
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

                        {/* Дебет с партнером */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32 shrink-0">
                              <CreditCard className="w-4 h-4 text-green-500" /> {t("debit")}: {/* ⭐ ИСПРАВЛЕНО: зеленый для дебета */}
                            </label>
                            <Field
                              as="select"
                              name="debitAccount"
                              onChange={handleDebitAccountChange} // ⭐ Используем обработчик
                              className="flex-1 min-w-0 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            >
                              <option value="">{t("select_credit_account")}</option>
                              {accounts.map((acc) => (
                                <option key={acc.id} value={acc.number}>
                                  {acc.number} - {acc.name}
                                </option>
                              ))}
                            </Field>
                          </div>

                          {/* Партнёр дебета */}
                          {values.debitAccount && ["60", "62", "75", "76"].includes(values.debitAccount) && (
                            <div className="flex-1 min-w-0">
                              <PartnerField
                                accountNumber={values.debitAccount}
                                fieldName="debitPartner"
                                currentPartner={values.debitPartner}
                                onPartnerSelect={handleDebitPartnerSelect}
                                refs={refs}
                                dateProwodok={editingEntry.date}
                                getSaldo={getDebitSaldo}
                                getSaldo2={getDebitSaldo2}
                              />
                            </div>
                          )}
                        </div>

                        {/* Кредит с партнером */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32 shrink-0">
                              <CreditCard className="w-4 h-4 text-red-500" /> {t("credit")}:
                            </label>
                            <Field
                              as="select"
                              name="creditAccount"
                              onChange={handleCreditAccountChange}
                              className="flex-1 min-w-0 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            >
                              <option value="">{t("select_credit_account")}</option>
                              {accounts.map((acc) => (
                                <option key={acc.id} value={acc.number}>
                                  {acc.number} - {acc.name}
                                </option>
                              ))}
                            </Field>
                          </div>

                          {/* Партнер для кредита */}
                          {values.creditAccount && ["60", "62", "75", "76"].includes(values.creditAccount) && (
                            <div className="flex-1 min-w-0">
                              <PartnerField
                                accountNumber={values.creditAccount}
                                fieldName="creditPartner"
                                currentPartner={values.creditPartner}
                                onPartnerSelect={handleCreditPartnerSelect}
                                refs={refs}
                                dateProwodok={editingEntry.date}
                                getSaldo={getCreditSaldo}
                                getSaldo2={getCreditSaldo2}
                              />
                            </div>
                          )}
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
                  );
                }}
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
          debitPartner: null,
          creditPartner: null,
        }}
        onSubmit={handleSubmit}
      >
        {({ values, resetForm, setFieldValue }) => {
          // Очистка партнера при смене счета
          const handleDebitAccountChange = (e) => {
            const newValue = e.target.value;
            setFieldValue("debitAccount", newValue);

            const needsPartner = newValue && ["60", "62", "75", "76"].includes(newValue);
            if (!needsPartner && values.debitPartner !== null) {
              setFieldValue("debitPartner", null);
              setDebitSaldo(null);
              setDebitSaldo2(null);
            }
          };

          const handleCreditAccountChange = (e) => {
            const newValue = e.target.value;
            setFieldValue("creditAccount", newValue);

            const needsPartner = newValue && ["60", "62", "75", "76"].includes(newValue);
            if (!needsPartner && values.creditPartner !== null) {
              setFieldValue("creditPartner", null);
              setCreditSaldo(null);
              setCreditSaldo2(null);
            }
          };

          // Обработчик выбора дебетового партнера
          const handleDebitPartnerSelect = (partner) => {
            setFieldValue("debitPartner", partner);
            if (partner?.id) {
              getDebitSaldo(dateProwodok, partner.id);
              getDebitSaldo2(dateProwodok, partner.id);
            } else {
              setDebitSaldo(null);
              setDebitSaldo2(null);
            }
          };

          // Обработчик выбора кредитового партнера
          const handleCreditPartnerSelect = (partner) => {
            setFieldValue("creditPartner", partner);
            if (partner?.id) {
              getCreditSaldo(dateProwodok, partner.id);
              getCreditSaldo2(dateProwodok, partner.id);
            } else {
              setCreditSaldo(null);
              setCreditSaldo2(null);
            }
          };

          // Определяем, какое сальдо показывать (приоритет дебету)
          const currentSaldo2 = debitSaldo2 || creditSaldo2;
          const hasSaldo = currentSaldo2 !== null;

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

                      {/* Дебет с партнером */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32 shrink-0">
                            <CreditCard className="w-4 h-4 text-green-500" /> {t("debit")}:
                          </label>
                          <Field
                            as="select"
                            name="debitAccount"
                            onChange={handleDebitAccountChange}
                            className="flex-1 min-w-0 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          >
                            <option value="">{t("select_debit_account")}</option>
                            {accounts.map((acc) => (
                              <option key={acc.id} value={acc.number}>
                                {acc.number} - {acc.name}
                              </option>
                            ))}
                          </Field>
                        </div>

                        {/* Партнёр дебета */}
                        {values.debitAccount && ["60", "62", "75", "76"].includes(values.debitAccount) && (
                          <div className="flex-1 min-w-0">
                            <PartnerField
                              accountNumber={values.debitAccount}
                              fieldName="debitPartner"
                              currentPartner={values.debitPartner}
                              onPartnerSelect={handleDebitPartnerSelect}
                              refs={refs}
                              dateProwodok={dateProwodok}
                              getSaldo={getDebitSaldo}
                              getSaldo2={getDebitSaldo2}
                            />
                          </div>
                        )}
                      </div>

                      {/* Кредит с партнером */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32 shrink-0">
                            <CreditCard className="w-4 h-4 text-red-500" /> {t("credit")}:
                          </label>
                          <Field
                            as="select"
                            name="creditAccount"
                            onChange={handleCreditAccountChange}
                            className="flex-1 min-w-0 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          >
                            <option value="">{t("select_credit_account")}</option>
                            {accounts.map((acc) => (
                              <option key={acc.id} value={acc.number}>
                                {acc.number} - {acc.name}
                              </option>
                            ))}
                          </Field>
                        </div>

                        {/* Партнер для кредита */}
                        {values.creditAccount && ["60", "62", "75", "76"].includes(values.creditAccount) && (
                          <div className="flex-1 min-w-0">
                            <PartnerField
                              accountNumber={values.creditAccount}
                              fieldName="creditPartner"
                              currentPartner={values.creditPartner}
                              onPartnerSelect={handleCreditPartnerSelect}
                              refs={refs}
                              dateProwodok={dateProwodok}
                              getSaldo={getCreditSaldo}
                              getSaldo2={getCreditSaldo2}
                            />
                          </div>
                        )}
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
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 space-y-4">
                      {/* Сальдо дебетового партнера */}
                      {debitSaldo2 && values.debitPartner && (
                        <Saldo2
                          saldo2={debitSaldo2}
                          partnerName={values.debitPartner.name}
                          partnerType={values.debitPartner.type}
                          letPrintSaldo={letPrintSaldo}
                          setLetPrintSaldo={setLetPrintSaldo}
                          accountType="debit" // Добавляем тип для стилизации
                        />
                      )}

                      {/* Сальдо кредитового партнера */}
                      {creditSaldo2 && values.creditPartner && (
                        <Saldo2
                          saldo2={creditSaldo2}
                          partnerName={values.creditPartner.name}
                          partnerType={values.creditPartner.type}
                          letPrintSaldo={letPrintSaldo}
                          setLetPrintSaldo={setLetPrintSaldo}
                          accountType="credit" // Добавляем тип для стилизации
                        />
                      )}
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

                                    {/* Партнер дебета */}
                                    {(entry.debitPartner || entry.debit?.partner) && (
                                      <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                        <User className="w-4 h-4 text-green-600" />
                                        <span className="text-green-700 dark:text-green-300">Дт: {entry.debitPartner?.name || entry.debit?.partner?.name}</span>
                                      </span>
                                    )}

                                    {/* Партнер кредита */}
                                    {(entry.creditPartner || entry.credit?.partner) && (
                                      <span className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                        <User className="w-4 h-4 text-red-600" />
                                        <span className="text-red-700 dark:text-red-300">Кт: {entry.creditPartner?.name || entry.credit?.partner?.name}</span>
                                      </span>
                                    )}

                                    {/* Старый партнер из Transaction (для обратной совместимости) */}
                                    {entry.partner?.name && !entry.debitPartner && !entry.creditPartner && (
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
