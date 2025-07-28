import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";

function Head() {
  const { values, setFieldValue, touched, errors } = useFormikContext();
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center border-b-2 border-gray-700 dark:border-gray-300 print:!border-black pb-2">
      <img src="/polisem.png" alt="polisem" width={140} />

      <div className="text-black dark:text-white print:!text-black">
        {t("sales_invoice2")}
      </div>

      <span className="font-semibold hidden print:block text-black dark:text-white print:!text-black">
        {values.invoice_date}
      </span>

      <input
        type="date"
        name="invoice_date"
        value={values.invoice_date}
        onChange={(e) => {
          setFieldValue("invoice_date", e.target.value);
        }}
        className="border px-2 py-1 rounded-md print:hidden bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-600"
      />

      {touched.invoice_date && errors.invoice_date && (
        <div className="text-red-500 text-sm print:hidden">
          {errors.invoice_date}
        </div>
      )}
    </div>
  );
}

function Button() {
  const { values } = useFormikContext();
  const { t } = useTranslation();

  return (
    <div>
      {values.warehouses.id && values.products.length > 0 && (
        <div className="mt-6 text-center print:hidden">
          <button
            type="submit"
            className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 active:transform active:translate-y-0 active:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 focus:ring-opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("submit") || "Сохранить"}
            </span>

            {/* Блик эффект */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-in-out"></div>
          </button>
        </div>
      )}
    </div>
  );
}

export { Head, Button };
