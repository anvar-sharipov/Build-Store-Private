import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import invoiceClasses from "./classes";
import { Settings } from "lucide-react";
import MyModal2 from "../../../UI/MyModal2";
import SettingsModal from "../Modal/SettingsModal";
import TypeFaktura from "../Modal/TypeFaktura";
import TypePrice from "../Modal/TypePrice";

const InvoiceHead = ({
  refs,
  fakturaBgDynamic,
  printVisibleColumns,
  setPrintVisibleColumns,
  userPrintVisibleColumns,
  adminPrintVisibleColumns,
  visibleColumns,
  setVisibleColumns,
  adminVisibleColumns,
  userVisibleColumns,
  setFakturaType,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [openModal, setOpenModal] = useState(false);
  const handleClick = () => {
    navigate(-1); // возвращаемся на предыдущую страницу
  };

  useEffect(() => {
    if (!openModal) {
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
    }
  }, [openModal, handleClick]);

  useEffect(() => {
    if (!openModal) {
      refs.productRef.current?.focus();
    }
  }, [openModal]);

  return (
    <div className={`flex justify-between items-center border-b-2 border-gray-700 dark:border-gray-500 print:!border-black p-2 ${fakturaBgDynamic}`}>
      {openModal && (
        <SettingsModal
          setOpenModal={setOpenModal}
          printVisibleColumns={printVisibleColumns}
          setPrintVisibleColumns={setPrintVisibleColumns}
          userPrintVisibleColumns={userPrintVisibleColumns}
          adminPrintVisibleColumns={adminPrintVisibleColumns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          adminVisibleColumns={adminVisibleColumns}
          userVisibleColumns={userVisibleColumns}
        />
      )}

      <div className="flex gap-5 items-center print:hidden">
        <button
          onClick={() => setOpenModal(true)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition print:hidden focus:bg-indigo-200"
          title="Настройки отображения"
          type="button"
        >
          <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <div className="px-1">
          <TypeFaktura setFakturaType={setFakturaType} />
        </div>

        |

        <div className="px-1">
          <TypePrice />
        </div>
      </div>

      

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
        {t(values.wozwrat_or_prihod)} {t("faktura")} {values.id && values.id}
      </div>

      {/* Логотип */}
      <div>
        <img src="/polisem.png" alt="polisem" width={140} className="rounded-lg hidden print:block" />
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
