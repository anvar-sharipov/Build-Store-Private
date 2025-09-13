import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useEffect } from "react";
import { useFormikContext } from "formik";
import invoiceClasses from "./classes";

const InvoiceHead = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const handleClick = () => {
    navigate(-1); // возвращаемся на предыдущую страницу
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();

        handleClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex justify-between items-center border-b-2 border-gray-700 dark:border-gray-300 print:!border-black pb-2">
      {/* Дата */}
      <div>
        <input
          type="date"
          name="invoice_date"
          onBlur={handleBlur}
          onChange={(e) => setFieldValue("invoice_date", e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              e.preventDefault();
            }
          }}
          value={values.invoice_date}
          className={invoiceClasses.dateInput}
        />
        {touched.invoice_date && errors.invoice_date && <div className="text-red-500 text-sm mt-1">{errors.invoice_date}</div>}
      </div>

      {/* Заголовок */}
      <div className={invoiceClasses.zagolowok}>
        {t("purchase_invoice2")} {values.id && values.id}
      </div>

      {/* Логотип */}
      <div>
        <img src="/polisem.png" alt="polisem" width={140} className="rounded-lg hidden sm:block" />
      </div>

      {/* Кнопка назад */}
      <button onClick={handleClick} type="button" className={invoiceClasses.backBtn}>
        <FaArrowLeft className="text-lg" />
        {/* <span>{t("back")}</span> */}
      </button>
    </div>
  );
};

export default InvoiceHead;
