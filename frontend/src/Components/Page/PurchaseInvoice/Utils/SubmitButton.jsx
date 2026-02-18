import { useFormikContext } from "formik";
import { Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyModal2 from "../../../UI/MyModal2";
import { useEffect, useRef, useState, useContext } from "react";
import { motion } from "framer-motion";
import myAxios from "../../../axios";
import { AuthContext } from "../../../../AuthContext";
import { sumMoney } from "../../../UI/MyDecimalPrice";
import { formatNumber2 } from "../../../UI/formatNumber2";

const SubmitButton = ({ dateProwodok, fakturaType, fakturaBgDynamic }) => {
  const { values, setFieldValue } = useFormikContext();
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
  const [dayIsClosed, setDayIsClosed] = useState(false);
  const [lastDayIsNotClosed, setLastDayIsNotClosed] = useState(false);
  const { authUser, authGroup } = useContext(AuthContext);
  const [currency, setCurrency] = useState("");

  const { isSubmitting } = useFormikContext();

  useEffect(() => {
    const fetchWarehouseCurrency = async () => {
      try {
        const res = await myAxios.get("get_warehouse_id_and_currency");
        if (!values.warehouse?.id) {
          setCurrency("");
          return;
        }
        const warehouse = res.data.find((w) => w.warehouse_id === values.warehouse.id);

        setCurrency(warehouse?.currency_code || "");
      } catch (e) {
        console.error("Ошибка при загрузке fetchWarehouseCurrency:", e);
      }
    };
    fetchWarehouseCurrency();
  }, [values.warehouse]);

  const total_selected_price = sumMoney(values.products, "selected_price", "selected_quantity");

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  useEffect(() => {
    const checkDate = async () => {
      try {
        const res = await myAxios.get("check_day_closed", {
          params: { date: values.invoice_date2 },
        });
        setDayIsClosed(res.data.is_closed);
        setLastDayIsNotClosed(res.data.last_day_not_closed);
        // console.log("res.data.is_closed", res.data.is_closed);
        // console.log("res.data.last_day_not_closed", res.data.last_day_not_closed);
        const is_closed = res.data.is_closed;
        const last_day_not_closed = res.data.last_day_not_closed;
        // console.log("is_closed", is_closed);

        // if (!last_day_not_closed) {
        //   console.log("pred den zakryt mojno delat");
        // } else {
        //   console.log("pred den ne zakryt NONONO");
        // }
      } catch (error) {
        console.error(error);
      }
    };

    if (values.invoice_date2) {
      checkDate();
    }
  }, [values.invoice_date2]);

  const modalYesBtn = useRef(null);
  const modalNoBtn = useRef(null);

  useEffect(() => {
    if (openModal) {
      modalNoBtn.current?.focus();
    }
  }, [openModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        const btn = document.getElementById("save-invoice-btn");
        if (btn && !btn.disabled) {
          btn.click();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (authGroup !== "admin") return;

  // console.log("value gggg", values);

  return (
    <div className="flex items-center sm:flex-row gap-4 mt-6 sm:mr-6 ml-5 print:hidden text-sm">
      {/* Checkbox с проводкой */}
      <div className="flex items-center gap-3 group">
        <div className="relative">
          <input type="checkbox" id="prowodka-checkbox" className="sr-only peer" checked={values.is_entry} onChange={(e) => setFieldValue("is_entry", e.target.checked)} />
          <label
            htmlFor="prowodka-checkbox"
            className="
          relative flex items-center justify-center
          w-5 h-5 sm:w-6 sm:h-6
          border-2 rounded-lg
          cursor-pointer transition-all duration-300
          border-gray-300 hover:border-blue-500
          dark:border-gray-600 dark:hover:border-blue-400
          peer-checked:bg-gradient-to-br peer-checked:from-blue-500 peer-checked:to-indigo-600
          peer-checked:border-blue-500 peer-checked:shadow-lg peer-checked:shadow-blue-500/25
          dark:peer-checked:from-blue-400 dark:peer-checked:to-indigo-500
          dark:peer-checked:border-blue-400 dark:peer-checked:shadow-blue-400/20
          hover:scale-105 active:scale-95
          focus-within:ring-4 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-400/30
        "
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-white opacity-0 peer-checked:opacity-100 
                     transition-all duration-300 transform scale-0 peer-checked:scale-100"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </label>
        </div>

        <label
          htmlFor="prowodka-checkbox"
          className="
        text-sm sm:text-base font-medium cursor-pointer
        text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400
        transition-colors duration-200 select-none
        group-hover:scale-105 transition-transform
      "
        >
          С проводкой
        </label>
      </div>

      {/* Оригинальная кнопка */}
      <button
        type="button"
        id="save-invoice-btn"
        onClick={() => setOpenModal(true)}
        title="CTRL + ENTER"
        disabled={
          !values.send ||
          !values.awto_send ||
          !values.partner_send ||
          !(values.products.length > 0) ||
          (values.id ? values.invoice_date2 === "" || dayIsClosed || lastDayIsNotClosed : dateProwodok === "") ||
          (values.is_entry && values.comment.trim().length === 0) ||
          authGroup !== "admin" ||
          values.already_entry
        }
        className={`
    relative overflow-hidden group
    px-4 sm:px-6 py-2.5 sm:py-3 
    rounded-xl sm:rounded-2xl 
    font-semibold text-sm sm:text-base
    transition-all duration-300 ease-in-out
    transform hover:scale-105 active:scale-95
    shadow-lg hover:shadow-xl
    backdrop-blur-sm
    border border-transparent
    ${
      values.send &&
      values.awto_send &&
      values.partner_send &&
      values.products.length > 0 &&
      (values.id ? values.invoice_date2 !== "" && !dayIsClosed && !lastDayIsNotClosed : dateProwodok !== "") &&
      (!values.is_entry || values.comment.trim().length > 0) &&
      !values.already_entry
        ? values.is_entry
          ? `
            bg-gradient-to-r from-red-600 via-red-700 to-red-600 
            hover:from-red-700 hover:via-red-800 hover:to-red-700
            text-white shadow-red-500/25 hover:shadow-red-500/40
            dark:from-red-500 dark:via-red-600 dark:to-red-500
            dark:hover:from-red-600 dark:hover:via-red-700 dark:hover:to-red-600
            dark:shadow-red-400/20 dark:hover:shadow-red-400/30
            border-red-500/20 dark:border-red-400/20
            `
          : `
            bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 
            hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700
            text-white shadow-blue-500/25 hover:shadow-blue-500/40
            dark:from-blue-500 dark:via-blue-600 dark:to-indigo-500
            dark:hover:from-blue-600 dark:hover:via-blue-700 dark:hover:to-indigo-600
            dark:shadow-blue-400/20 dark:hover:shadow-blue-400/30
            border-blue-500/20 dark:border-blue-400/20
            `
        : `
          bg-gray-200/80 hover:bg-gray-300/80 
          text-gray-500 cursor-not-allowed 
          shadow-gray-300/20
          dark:bg-gray-800/60 dark:hover:bg-gray-700/60 
          dark:text-gray-400 dark:shadow-gray-900/20
          border-gray-300/30 dark:border-gray-600/30
          backdrop-blur-sm
        `
    }
    print:hidden
    focus:outline-none focus:ring-4 
    ${values.is_entry ? "focus:ring-red-500/30 dark:focus:ring-red-400/30" : "focus:ring-blue-500/30 dark:focus:ring-blue-400/30"}
    disabled:transform-none disabled:shadow-lg
  `}
      >
        {values.send &&
          values.awto_send &&
          values.partner_send &&
          values.products.length > 0 &&
          (values.id ? values.invoice_date2 !== "" && !dayIsClosed && !lastDayIsNotClosed : dateProwodok !== "") &&
          (!values.is_entry || values.comment.trim().length > 0) &&
          !values.already_entry && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                   transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                   transition-transform duration-1000 ease-in-out"
            />
          )}

        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
          {!values.id ? (
            dateProwodok === "" ? (
              <>
                <Ban
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400 
                         transition-transform duration-200 group-hover:scale-110"
                />
                <span className="truncate max-w-32 sm:max-w-none">{t("choose date prowodok")}</span>
              </>
            ) : (
              <>
                <span className="text-base sm:text-lg filter drop-shadow-sm">💾</span>
                <span className="font-bold tracking-wide">{t("save")}</span>
              </>
            )
          ) : !values?.invoice_date2 ? (
            <>
              <Ban
                className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400 
                         transition-transform duration-200 group-hover:scale-110"
              />
              <span className="truncate max-w-32 sm:max-w-none">{t("choose date prowodok")}</span>
            </>
          ) : (
            <>
              <span className="text-base sm:text-lg filter drop-shadow-sm">💾</span>
              {dayIsClosed ? (
                <span className="font-bold tracking-wide">{t("day is closed")}</span>
              ) : lastDayIsNotClosed ? (
                <span className="font-bold tracking-wide">{t("last day is not is closed")}</span>
              ) : (
                <span className="font-bold tracking-wide">{t("save")}</span>
              )}
              {/* <span className="font-bold tracking-wide">{t("save")}</span> */}
            </>
          )}
        </div>

        {values.send &&
          values.awto_send &&
          values.partner_send &&
          values.products.length > 0 &&
          dateProwodok !== "" &&
          (!values.is_entry || values.comment.trim().length > 0) &&
          !values.already_entry && (
            <div
              className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r 
              from-blue-600/20 to-indigo-600/20 blur-xl opacity-0 
              group-hover:opacity-100 transition-opacity duration-300 -z-10"
            />
          )}
      </button>

      {openModal && (
        <MyModal2 onClose={() => setOpenModal(false)} myClass={`${fakturaBgDynamic}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 p-8"
          >
            {/* Header with icon */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="grid grid-cols-1 place-items-center gap-4">
              {/* Иконка */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                <motion.svg
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </motion.svg>
              </div>

              {/* Текстовый контент - одна колонка сетки */}
              <div className="grid grid-cols-1 gap-2 w-full max-w-md place-items-center">
                {/* Заголовок с датой */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 gap-2 place-items-center w-full">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
                    {t("save")} {t(fakturaType)} {t("faktura")} {values?.id}
                  </h3>

                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 font-semibold rounded-md shadow-sm dark:bg-blue-900 dark:text-blue-200 text-center w-auto">
                    {values.id ? formatDateToDDMMYYYY(values.invoice_date2) : formatDateToDDMMYYYY(dateProwodok)}
                  </span>
                </motion.div>

                {/* Информация о партнере и цене */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 gap-1 place-items-center w-full">
                  <div className="text-lg text-gray-900 dark:text-gray-100 text-center">
                    {t("partner")}: {values?.partner?.name}
                  </div>
                  <div className="text-lg text-gray-900 dark:text-gray-100 text-center">
                    {t(values.type_price)}: <span className="font-bold text-red-800 dark:text-red-500">{formatNumber2(total_selected_price, 2, false)}</span> {currency}
                  </div>
                </motion.div>

                {/* Подтверждающее сообщение */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  {t("confirm_save_document")}
                </motion.p>
              </div>
            </motion.div>
            {/* <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                <motion.svg
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </motion.svg>
              </div>

              <div className="text-center">
                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t("save")} {t(fakturaType)} {t("faktura")} {values?.id}{" "}
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 font-semibold rounded-md shadow-sm dark:bg-blue-900 dark:text-blue-200">
                    {values.id ? formatDateToDDMMYYYY(values.invoice_date2) : formatDateToDDMMYYYY(dateProwodok)}
                  </span>
                </motion.h3>
                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-xl text-gray-900 dark:text-gray-100 mb-2 flex flex-col">
                  <span>
                    {t("partner")}: {values?.partner?.name}
                  </span>
                  <span>
                    {t("wholesale_price")}: {total_selected_price} {currency}
                  </span>
                </motion.h3>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm text-gray-600 dark:text-gray-400">
                  {t("confirm_save_document")}
                </motion.p>
              </div>
            </motion.div> */}

            {/* Action buttons */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-4 w-full max-w-xs">
              {/* Cancel button */}
              {/* <motion.button
                type="button"
                ref={modalNoBtn}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    modalYesBtn.current?.focus();
                  }
                }}
                onClick={() => setOpenModal(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                  focus:outline-none focus:ring-4 focus:ring-gray-400 dark:focus:ring-gray-400 focus:ring-offset-4 dark:focus:ring-offset-gray-900 focus:scale-105 focus:shadow-xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <motion.svg whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                  {t("cancel")}
                </div>
              </motion.button> */}

              {/* Save button */}
              <motion.button
                type="button"
                ref={modalYesBtn}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    modalNoBtn.current?.focus();
                  }
                }}
                onClick={async () => {
                  
                  
                  try {
                    await document.querySelector("form").requestSubmit(); 
                    // console.log("tutu");
                    // console.log("isSubmitting", isSubmitting);
                    setOpenModal(false);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 relative group px-4 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 dark:hover:from-blue-700 dark:hover:via-blue-800 dark:hover:to-blue-900 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl
                  focus:outline-none focus:ring-4 focus:ring-blue-400 dark:focus:ring-blue-400 focus:ring-offset-4 dark:focus:ring-offset-gray-900 focus:scale-105 focus:shadow-2xl focus:brightness-110"
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-xl"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />

                {/* Button content */}
                <div className="relative flex items-center justify-center gap-2">
                  <motion.svg whileHover={{ scale: 1.2, rotate: -10 }} transition={{ type: "spring", stiffness: 300 }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                  {t("yes")}
                </div>
              </motion.button>
            </motion.div>
          </motion.div>
        </MyModal2>
      )}
    </div>
  );
};

export default SubmitButton;
