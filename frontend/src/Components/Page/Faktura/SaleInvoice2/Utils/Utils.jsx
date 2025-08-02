import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../../routes";
import { useEffect } from "react";
import SmartTooltip from "../../../../SmartTooltip";

function Head() {
  const { values, setFieldValue, touched, errors } = useFormikContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        navigate(ROUTES.MAIN);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="flex justify-between items-center border-b-2 border-gray-700 dark:border-gray-300 print:!border-black pb-2">
      <img src="/polisem.png" alt="polisem" width={140} />

      <div className="text-black dark:text-white print:!text-black">
        {t("sales_invoice2")}
        {values.invoice_id && `: ${values.invoice_id}`}
      </div>

      <span className={`font-semibold print:block ${values.disabled ? "block" : "hidden"} text-black dark:text-white print:!text-black`}>{values.invoice_date}</span>

      {!values.disabled && (
        <input
          type="date"
          name="invoice_date"
          value={values.invoice_date}
          onChange={(e) => {
            setFieldValue("invoice_date", e.target.value);
          }}
          className="border px-2 py-1 rounded-md print:hidden bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-600"
        />
      )}

      {touched.invoice_date && errors.invoice_date && <div className="text-red-500 text-sm print:hidden">{errors.invoice_date}</div>}
      <SmartTooltip tooltip={t("back") || "Сохранить"} shortcut="ESC">
        <button
          className="print:hidden p-2 rounded-md bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          aria-label="Назад"
          onClick={() => navigate(ROUTES.MAIN)}
        >
          <FaArrowLeft className="text-gray-700" size={24} />
        </button>
      </SmartTooltip>
    </div>
  );
}

function Button({ productInputRef }) {
  const { values, setFieldValue } = useFormikContext();
  const { t } = useTranslation();
  const { submitForm } = useFormikContext();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        submitForm(); // Используем напрямую из context
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [submitForm]);

  return (
    <div className="mt-2">
      {values.warehouses.id && values.products.length > 0 && (
        <div className="flex w-full gap-4 print:hidden">
          {/* Текстовое поле для комментария (80%) */}
          <div className="w-4/5">
            <textarea
              disabled={values.disabled}
              id="comment"
              name="comment"
              rows={3}
              value={values.comment}
              onChange={(e) => setFieldValue("comment", e.target.value)}
              placeholder={t("comment")}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm
                     dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
            />
          </div>

          {/* Чекбокс и кнопка Submit (20%) */}
          <div className="w-1/5 flex flex-col items-center justify-between">
            {/* Чекбокс "с проводкой" */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="withPosting"
                name="withPosting"
                disabled={values.disabled}
                checked={values.withPosting}
                onChange={(e) => setFieldValue("withPosting", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500
                       dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    productInputRef.current?.focus();
                  }
                }}
              />
              <label htmlFor="withPosting" className="text-sm text-gray-700 dark:text-gray-200">
                {t("withPosting")}
              </label>
            </div>

            {/* Кнопка Submit */}
            {!values.disabled && (
              <SmartTooltip tooltip={t("save") || "Сохранить"} shortcut="Ctrl+Enter">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                  text-white font-semibold rounded-md shadow-sm hover:shadow-md transition duration-200 
                  focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                >
                  <span className="flex items-center justify-center gap-1 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("save") || "Сохранить"}
                  </span>
                </button>
              </SmartTooltip>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { Head, Button };
