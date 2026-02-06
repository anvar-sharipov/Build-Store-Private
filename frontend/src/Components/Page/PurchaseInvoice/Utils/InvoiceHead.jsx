import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useState, useRef, useContext } from "react";
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
// import { DateContext } from "../../../UI/DateProvider";
// import { FaReceipt } from "react-icons/fa";
import PrintInvoiceButton from "./PrintInvoiceButton";
// import { DateContext } from "../../../UI/DateProvider";
// import exportInvoiceToExcel from "./exportInvoiceToExcel";
import exportInvoiceWithSaldoToExcel from "./exportInvoiceToExcel";
import { FileDown } from "lucide-react";
import { DateContext } from "../../../UI/DateProvider";
import { getSaldoForPartner } from "../../../../services/saldoService";
import MyFormatDate from "../../../UI/MyFormatDate";


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
  authGroup,

  saldo2,
  letPrintSaldo,
  setLetPrintSaldo,
  setSaldo2,
}) => {
  console.log("saldo2222", saldo2);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dateProwodok } = useContext(DateContext);
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [openModal, setOpenModal] = useState(false);
  const [entryCancelModal, setEntryCancelModal] = useState(false);
  const [cancelComment, setCancelComment] = useState("");
  const [modalDeleteInvoice, setModalDeleteInvoice] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dayIsClosed, setDayIsClosed] = useState(false);
  const sound_open_faktura = new Audio("/sounds/open_faktura.mp3");
  const handleClick = () => {
    sound_open_faktura.currentTime = 0;
    sound_open_faktura.play();
    navigate(-1); // возвращаемся на предыдущую страницу
  };
  const { showNotification } = useNotification();

  const [saldoForExcel, setSaldoForExcel] = useState(null);

  const fetchSaldo = async (date, partnerId) => {
    try {
      const saldo = await getSaldoForPartner(date, partnerId);
      console.log("saldo", saldo);
      
      setSaldoForExcel(saldo);
    } catch (err) {
      console.log("Ошибка при получении сальдо", err);
    }
  };

  useEffect(() => {
    if (!values.partner?.id) return;
    fetchSaldo(dateProwodok, values.partner.id);
  }, [values.partner?.id,dateProwodok]);


  // const { dateProwodok } = useContext(DateContext);

  const handleCancelEntry = async (comment) => {
    try {
      const res = await myAxios.post("cancel_entry/", {
        id: values.id,
        comment: comment,
      });

      console.log("Entry canceled successfully:", res.data);
      // при успехе можно закрыть модалку или обновить данные
      setEntryCancelModal(false);
      setCancelComment("");
      showNotification(t(res.data.message), "success");

      // например, если у тебя есть функция обновления данных:
      // await fetchEntries();
    } catch (error) {
      console.error("Can't cancel invoice entry:", error);
      console.log("error ===", error);

      showNotification(`${t(error.response.data.message)}`, "error");
    }
  };

  useEffect(() => {
    const checkDate = async () => {
      try {
        const res = await myAxios.get("check_day_closed", {
          params: { date: values.invoice_date2 },
        });
        setDayIsClosed(res.data.is_closed);
        // setLastDayIsNotClosed(res.data.last_day_not_closed);
        // console.log("dateProwodok", dateProwodok);
        // console.log("values.invoice_date2", values.invoice_date2);
        // console.log("res.data", res.data);
      } catch (error) {
        console.error(error);
      }
    };
    // if (dateProwodok) {
    checkDate();
    // }
  }, []);

  // useEffect(() => {
  //   console.log("dayIsClosed", dayIsClosed);
  // }, [dayIsClosed]);

  const modalYesBtn = useRef(null);
  const modalNoBtn = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Delete") {
        e.preventDefault();
        const btn = document.getElementById("invoice-delete-btn");
        if (btn) {
          btn.click();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (modalDeleteInvoice) {
      setTimeout(() => {
        modalNoBtn.current?.focus();
      }, 0);
    }
  }, [modalDeleteInvoice]);

  useEffect(() => {
    if (!openModal) {
      const handleKeyDown = (e) => {
        if (e.shiftKey && e.key === "Escape") {
          e.preventDefault();
          handleClick();
        }
      };

      // if (openModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
      // }
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
      // console.log("Deleted invoice:", res.data);
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
    <div className={`flex justify-between items-center border-b-2 border-gray-700 dark:border-gray-500 print:!border-black p-2 ${fakturaBgDynamic} text-sm`}>
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
          <TypeFaktura setFakturaType={setFakturaType} authGroup={authGroup} />
        </div>
        |
        <div className="px-1">
          <TypePrice authGroup={authGroup} />
        </div>
        {id && !values.already_entry && !values.canceled_at && (
          <div>
            <MyButton variant="red" type="button" onClick={() => setModalDeleteInvoice(true)} id="invoice-delete-btn" title="ctrl + delete">
              {t("delete")}
            </MyButton>
          </div>
        )}
        <button
          onClick={() =>
            exportInvoiceWithSaldoToExcel(
              values,
              visibleColumns,
              printVisibleColumns,
              t,// передаем данные сальдо
              values.awto,
              saldoForExcel,
              saldo2,
            )
          }
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 print:hidden"
          type="button"
          title="Экспорт в Excel с сальдо"
        >
          <span className="font-medium">📊 Excel</span>
        </button>
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
                  ref={modalNoBtn}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") {
                      e.preventDefault();
                      modalYesBtn.current?.focus();
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalDeleteInvoice(false)}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("cancel")}
                </motion.button>

                <motion.button
                  ref={modalYesBtn}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      modalNoBtn.current?.focus();
                    }
                  }}
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

      {entryCancelModal && (
        <MyModal2 onClose={() => setEntryCancelModal(false)}>
          {/* Иконка */}
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 dark:text-amber-400" />
          </div>

          {/* Текст */}
          <h2 className="text-lg font-semibold text-center text-zinc-800 dark:text-zinc-100 mb-2">{t("Are you sure you want to cancel this entry?")}</h2>
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-6">{t("This action cannot be undone.")}</p>

          <textarea
            value={cancelComment}
            onChange={(e) => setCancelComment(e.target.value)}
            placeholder={t("Enter reason for cancel entry")}
            className="w-full p-2 border rounded-md border-zinc-300 dark:border-zinc-700 mb-4"
          />

          {/* Кнопки */}
          <div className="flex justify-center gap-3">
            {/* Отмена */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEntryCancelModal(false)}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              {t("No, go back")}
            </motion.button>

            {/* Подтверждение */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // onConfirm();
                handleCancelEntry(cancelComment);
                // setEntryCancelModal(false);
              }}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-sm"
            >
              {t("Yes, cancel entry")}
            </motion.button>
          </div>
        </MyModal2>
      )}

      {/* Дата */}
      {values.id ? (
        <div>
          <input
            type="date"
            name="invoice_date"
            onBlur={handleBlur}
            onChange={(e) => setFieldValue("invoice_date2", e.target.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                e.preventDefault();
              }
            }}
            value={values.invoice_date2}
            disabled={values.already_entry || values.canceled_at}
            className={`
    w-full
    px-3 py-2
    border border-gray-300 dark:border-gray-700
    rounded-md
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
    focus:border-blue-500 dark:focus:border-blue-400
    disabled:opacity-50 disabled:cursor-not-allowed
    print:hidden
  `}
          />
          {/* {touched.invoice_date && errors.invoice_date && <div className="text-red-500 text-sm mt-1">{errors.invoice_date}</div>} */}
          <div className="hidden print:!text-black print:block">{MyFormatDate(values.invoice_date2)}</div>
        </div>
      ) : (
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
            className={`${invoiceClasses.dateInput}`}
          />
          {/* {touched.invoice_date && errors.invoice_date && <div className="text-red-500 text-sm mt-1">{errors.invoice_date}</div>} */}
        </div>
      )}

      {/* Заголовок */}
      <div className={invoiceClasses.zagolowok}>
        {t(values.wozwrat_or_prihod)} {t("faktura")} {values.id && values.id} {values.canceled_at && <div className="text-red-500">({t("Canceled")})</div>}
      </div>

      {values.already_entry && !dayIsClosed && (
        <div className="print:hidden">
          <MyButton type="button" variant="red" onClick={() => setEntryCancelModal(true)}>
            {t("Change entry")}
          </MyButton>
        </div>
      )}

      {/* {values.already_entry && dayIsClosed && (
        <div className="print:hidden">
          <MyButton type="button" disabled="disabled" variant="red">
            {t("Day already closed")}
          </MyButton>
        </div>
      )} */}

      {/* {values.products && values.products.length > 0 && (
        <div className="print:hidden">
          <PrintInvoiceButton invoiceData={values} />
        </div>
      )} */}

      {/* Логотип */}
      <div>
        <img src="/polisem.png" alt="polisem" width={140} className="rounded-lg hidden print:block" />
      </div>

      {/* Кнопка назад */}
      <button onClick={handleClick} type="button" className={invoiceClasses.backBtn} title="shift + esc">
        <FaArrowLeft className="text-lg" />
        {/* <span>{t("back")}</span> */}
      </button>
    </div>
  );
};

export default InvoiceHead;
