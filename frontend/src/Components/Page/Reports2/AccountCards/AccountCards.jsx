import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import myAxios from "../../../axios";
import { useEffect, useState, useContext } from "react";
import DateFormikField from "../../../UI/FormikFileds/DateFormikField";
import getCookie from "../../../UI/getCookie";
import { useNotification } from "../../../context/NotificationContext";
import { DateContext } from "../../../UI/DateProvider";
import { useNavigate } from "react-router-dom";
import { ROUTES_RAPORT } from "../../../../routes";

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
    // После загрузки страницы автоматически запускаем поиск
    const timer = setTimeout(() => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 0); // небольшая задержка, чтобы Formik успел инициализироваться
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6">
      {/* ===== Форма выбора периода ===== */}
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

            // Достаём массив счетов
            const accounts = Array.isArray(response.data.accounts) ? response.data.accounts : [];

            // Фильтруем только те, где есть движения
            const filteredReports = accounts.filter((acc) => acc.movements && acc.movements.length > 0);

            setReports(filteredReports);
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
            <Form className="space-y-4">
              {/* Скрытые поля для Formik */}
              <div className="hidden">
                <DateFormikField label={t("date from")} name="date_from" />
                <DateFormikField label={t("date to")} name="date_to" min={values.date_from} />
              </div>

              <div className="flex justify-end print:hidden">
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`px-4 py-2 rounded-md text-white ${isSubmitting || !isValid ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                >
                  {t("search2")}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>

      {/* ===== Отчёт ===== */}
      <div className="mt-8 print:p-0 print:m-0">
        {reports.length === 0 ? (
          <p className="text-gray-500 text-center">{t("No movements in period")}</p>
        ) : (
          reports.map((acc) => {
            // console.log("acc", acc);

            return (
              <div key={acc.id} className="mb-6 bg-white rounded-xl shadow p-4">
                {/* Название счета */}
                <h2
                  className="text-lg font-semibold text-indigo-700 mb-2"
                  onClick={() => navigate(`/account-cards/${acc.id}`)}
                  // onClick={() => {
                  //   console.log("clicked account =", acc.id);
                  //   const getAccountCards = async () => {
                  //     try {
                  //       const res = await myAxios.get(`get_account_cards/${acc.id}/`);
                  //       console.log("res account cards =", res.data);
                  //     } catch (error) {
                  //       console.log("Ошибка при получении карт:", error);
                  //     }
                  //   };
                  //   getAccountCards();
                  // }}
                >
                  {acc.account}
                </h2>

                {/* Сальдо и обороты */}
                <div className="mb-2 text-sm text-gray-600">
                  <div>
                    {t("Saldo start")}: {acc.saldo_start}
                  </div>
                  <div>
                    {t("Debit turnover")}: {acc.debit_turnover}
                  </div>
                  <div>
                    {t("Credit turnover")}: {acc.credit_turnover}
                  </div>
                  <div>
                    {t("Saldo end")}: {acc.saldo_end}
                  </div>
                </div>

                {/* Таблица движений */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-50 text-left">
                      <th className="p-2 border-b">{t("Date")}</th>
                      <th className="p-2 border-b">{t("Description")}</th>
                      <th className="p-2 border-b text-right">{t("Debit")}</th>
                      <th className="p-2 border-b text-right">{t("Credit")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acc.movements.map((m, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 border-b">
                          {/* {(() => {
                            const d = new Date(m.date);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const year = d.getFullYear();
                            return `${day}.${month}.${year}`;
                          })()} */}
                          {m.date}
                        </td>
                        <td className="p-2 border-b">{m.description}</td>
                        <td className="p-2 border-b text-right">{m.debit || "-"}</td>
                        <td className="p-2 border-b text-right">{m.credit || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AccountCards;
