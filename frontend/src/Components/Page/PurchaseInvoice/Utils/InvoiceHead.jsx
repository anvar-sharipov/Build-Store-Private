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
import MyButton from "../../../UI/MyButton";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";
import myAxios from "../../../axios";
import { ROUTES } from "./../../../../routes";
import { useNotification } from "../../../context/NotificationContext";

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
  id,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [openModal, setOpenModal] = useState(false);
  const [modalDeleteInvoice, setModalDeleteInvoice] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleClick = () => {
    navigate(-1); // возвращаемся на предыдущую страницу
  };
  const { showNotification } = useNotification();

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

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const res = await myAxios.delete(`delete_invoice/${id}/`);
      console.log("Deleted invoice:", res.data);
      showNotification(`${t("faktura")} №${res.data.invoice_id} ${t("succesifuly deleted")}`, "success");
      navigate(ROUTES.PURCHASEINVOICE);
    } catch (error) {
      console.log("cant delete invoice", error);
      showNotification(`${t(error.response.data.message)}`, "error");
    } finally {
      setIsDeleting(false);
      setModalDeleteInvoice(false);
    }
  };

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
        {id &&
          (values.already_entry ? (
            <div>
              <MyButton variant="red" type="button">
                {t("change prowodka")}
              </MyButton>
            </div>
          ) : (
            <div>
              <MyButton variant="red" type="button" onClick={() => setModalDeleteInvoice(true)}>
                {t("delete")}
              </MyButton>
            </div>
          ))}
        {modalDeleteInvoice && (
          <MyModal2 onClose={() => setModalDeleteInvoice(false)}>
            <div className="p-8">
              {/* Header с иконкой */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 shadow-lg"
              >
                <AlertTriangle size={40} className="text-white" />
              </motion.div>

              {/* Заголовок */}
              <motion.h2 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
                {t("are_you_sure_delete_invoice")}
              </motion.h2>

              {/* ID счёта */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-6">
                <span className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-semibold text-lg">№{values.id}</span>
              </motion.div>

              {/* Кнопки */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalDeleteInvoice(false)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("cancel")}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(values.id)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      <span>{t("deleting")}...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      {t("delete")}
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </MyModal2>
        )}
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
