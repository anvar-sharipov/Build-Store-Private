import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import myAxios from "../../../axios";
import { useEffect, useState, useContext } from "react";
import DateFormikField from "../../../UI/FormikFileds/DateFormikField";
import getCookie from "../../../UI/getCookie";
import { useNotification } from "../../../context/NotificationContext";
import { DateContext } from "../../../UI/DateProvider";
import { useNavigate } from "react-router-dom";
import { Printer } from "lucide-react";

const formatNumber = (v) => {
  const num = Number(v) || 0;
  return num.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AccountCards = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { dateFrom, dateTo } = useContext(DateContext);

  const [reports, setReports] = useState([]);

  useEffect(() => {
    document.title = t("account cards");
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="bg-white dark:bg-gray-900 p-8 max-w-7xl mx-auto print:p-4 print:bg-white min-h-screen">
      {/* Форма выбора периода */}
      <Formik
        initialValues={{ date_from: dateFrom, date_to: dateTo }}
        validate={(values) => {
          const errors = {};
          if (!values.date_from) errors.date_from = t("choose date");
          if (!values.date_to) errors.date_to = t("choose date");
          if (values.date_from && values.date_to && values.date_from > values.date_to) errors.date_to = t("To date must be after From date");
          return errors;
        }}
        onSubmit={async (values) => {
          try {
            const response = await myAxios.post("/get_cards/", values, {
              headers: { "X-CSRFToken": getCookie("csrftoken") },
            });

            const accounts = Array.isArray(response.data.accounts) ? response.data.accounts : [];
            // Убираем фильтрацию - backend уже всё отфильтровал
            setReports(accounts);
          } catch (error) {
            console.error("Ошибка при получении карт:", error);
            const errMsg = error.response?.data?.message || error.response?.data?.detail || error.response?.data?.error || error.message || "Unexpected error";
            showNotification(t(errMsg), "error");
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting, isValid }) => {
          useEffect(() => {
            if (values.date_from !== dateFrom) setFieldValue("date_from", dateFrom);
            if (values.date_to !== dateTo) setFieldValue("date_to", dateTo);
          }, [dateFrom, dateTo]);

          return (
            <Form className="mb-6 print:hidden">
              <div className="hidden">
                <DateFormikField label={t("date from")} name="date_from" />
                <DateFormikField label={t("date to")} name="date_to" min={values.date_from} />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`px-4 py-2 rounded text-white ${isSubmitting || !isValid ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"}`}
                >
                  {t("search2")}
                </button>
                <button type="button" onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                  <Printer className="w-4 h-4" />
                  {t("Print")}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>

      {/* Отчёт */}
      {/* Отчёт */}
      {reports.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t("No data for period")}</p>
      ) : (
        reports.map((acc) => (
          <div key={acc.id} className="mb-12 page-break-inside-avoid">
            {/* Заголовок счета */}
            <div className="mb-4 text-center">
              <h2 className="text-lg font-bold cursor-pointer hover:text-blue-600 dark:text-white dark:hover:text-blue-400 print:text-black" onClick={() => navigate(`/account-cards/${acc.id}`)}>
                Карточка счета {acc.account}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">
                за период с {dateFrom} по {dateTo}
              </p>
            </div>

            {/* Таблица */}
            <table className="w-full border-collapse border border-black dark:border-gray-400 text-sm mb-4 print:border-black">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 print:bg-gray-100">
                  <th className="border border-black dark:border-gray-400 px-2 py-2 text-left dark:text-white print:text-black print:border-black">Дата</th>
                  <th className="border border-black dark:border-gray-400 px-2 py-2 text-left dark:text-white print:text-black print:border-black">Описание</th>
                  <th className="border border-black dark:border-gray-400 px-2 py-2 text-right w-28 dark:text-white print:text-black print:border-black">Дебет</th>
                  <th className="border border-black dark:border-gray-400 px-2 py-2 text-right w-28 dark:text-white print:text-black print:border-black">Кредит</th>
                </tr>
              </thead>
              <tbody>
                {/* Начальное сальдо */}
                <tr className="font-semibold bg-gray-50 dark:bg-gray-800 print:bg-gray-50">
                  <td className="border border-black dark:border-gray-400 px-2 py-2 dark:text-gray-200 print:text-black print:border-black">{dateFrom}</td>
                  <td className="border border-black dark:border-gray-400 px-2 py-2 dark:text-gray-200 print:text-black print:border-black">Сальдо на начало периода</td>
                  <td className="border border-black dark:border-gray-400 px-2 py-2 text-right dark:text-gray-200 print:text-black print:border-black" colSpan={2}>
                    {formatNumber(acc.saldo_start)}
                  </td>
                </tr>

                {/* Движения */}
                {acc.movements && acc.movements.length > 0 ? (
                  acc.movements.map((m, idx) => (
                    <tr key={idx} className="dark:bg-gray-900 dark:hover:bg-gray-800">
                      <td className="border border-black dark:border-gray-400 px-2 py-2 dark:text-gray-300 print:text-black print:border-black">{m.date}</td>
                      <td className="border border-black dark:border-gray-400 px-2 py-2 dark:text-gray-300 print:text-black print:border-black">{m.description}</td>
                      <td className="border border-black dark:border-gray-400 px-2 py-2 text-right dark:text-gray-300 print:text-black print:border-black">{m.debit ? formatNumber(m.debit) : "—"}</td>
                      <td className="border border-black dark:border-gray-400 px-2 py-2 text-right dark:text-gray-300 print:text-black print:border-black">
                        {m.credit ? formatNumber(m.credit) : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="border border-black dark:border-gray-400 px-2 py-3 text-center text-gray-500 dark:text-gray-400 italic print:text-black print:border-black">
                      Нет операций за период
                    </td>
                  </tr>
                )}

                {/* Обороты за период */}
                <tr className="font-semibold bg-gray-50 dark:bg-gray-800 print:bg-gray-50">
                  <td colSpan={2} className="border border-black dark:border-gray-400 px-2 py-2 text-right dark:text-gray-200 print:text-black print:border-black">
                    Обороты за период:
                  </td>
                  <td className="border border-black dark:border-gray-400 px-2 py-2 text-right dark:text-gray-200 print:text-black print:border-black">{formatNumber(acc.debit_turnover)}</td>
                  <td className="border border-black dark:border-gray-400 px-2 py-2 text-right dark:text-gray-200 print:text-black print:border-black">{formatNumber(acc.credit_turnover)}</td>
                </tr>

                {/* Конечное сальдо */}
                <tr className="font-semibold bg-gray-50 dark:bg-gray-800 print:bg-gray-50">
                  <td className="border border-black dark:border-gray-400 px-2 py-2 dark:text-gray-200 print:text-black print:border-black">{dateTo}</td>
                  <td className="border border-black dark:border-gray-400 px-2 py-2 dark:text-gray-200 print:text-black print:border-black">Сальдо на конец периода</td>
                  <td className="border border-black dark:border-gray-400 px-2 py-2 text-right dark:text-gray-200 print:text-black print:border-black" colSpan={2}>
                    {formatNumber(acc.saldo_end)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* Дата формирования */}
      {reports.length > 0 && (
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
          <p>Дата формирования: {new Date().toLocaleDateString("ru-RU")}</p>
        </div>
      )}
    </div>
  );
};

export default AccountCards;
