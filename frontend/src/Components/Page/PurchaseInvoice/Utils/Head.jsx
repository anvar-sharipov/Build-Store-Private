import { useTranslation } from "react-i18next";
// import SmartTooltip from "../../../SmartTooltip";
// import MySearchInput from "../../../UI/MySearchInput";
import { useEffect, useRef, useContext, useState } from "react";
import { FaPlus } from "react-icons/fa";
import invoiceClasses from "./classes";
// import { useFormikContext } from "formik";
import MySearchInput from "../../../UI/MySearchInput";
import { motion, AnimatePresence } from "framer-motion";
import ExcelButton from "../../../UI/Universal/ExcelButton";
import myAxios from "../../../axios";
import { DateContext } from "../../../UI/DateProvider";
import { useNotification } from "../../../context/NotificationContext";
import { FileText } from "lucide-react";

const Head = ({ mainRefs, handleOpenInvoice, setQuery, query, invoices, pagination }) => {
  const { dateFrom, dateTo } = useContext(DateContext);
  const { t } = useTranslation();
  const buttonRef = useRef(null);
  const sound = new Audio("/sounds/up_down.mp3");
  const { showNotification } = useNotification();
  const [downloadExcel, setDownloadExcel] = useState(false);
  // const sound_open_faktura = new Audio("/sounds/open_faktura.mp3");

  //   const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();

  useEffect(() => {
    mainRefs.searchInputRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Insert") {
        e.preventDefault();
        // sound_open_faktura.currentTime = 0;
        // sound_open_faktura.play();
        if (buttonRef.current) {
          buttonRef.current.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // const downloadExcelFakturs = async () => {
  //   if (!dateFrom || !dateTo) {
  //     showNotification(t("choose diapazon date"), "error");
  //     return;
  //   }
  //   setDownloadExcel(true);

  //   const searchParams = new URLSearchParams(window.location.search);

  //   const wozwrat_or_prihod = searchParams.get("wozwrat_or_prihod");
  //   const partner_id = searchParams.get("partner_id");
  //   const selectedEntry = searchParams.get("selectedEntry");
  //   const sortInvoice = searchParams.get("sortInvoice");

  //   const params = new URLSearchParams({
  //     dateFrom,
  //     dateTo,
  //     wozwrat_or_prihod,
  //     partner_id,
  //     selectedEntry,
  //     sortInvoice,
  //   }).toString();

  //   try {
  //     const res = await myAxios.get(`download_excel_fakturs_diapazon?${params}`);
  //     console.log("res", res);
  //   } catch (err) {
  //     showNotification(t(err.response.data.error), "error");
  //     console.log("cant downloadExcelFakturs", err);
  //   } finally {
  //     setTimeout(() => {
  //       setDownloadExcel(false);
  //     }, 1000);
  //   }
  // };

  const downloadExcelFakturs = async () => {
    if (!dateFrom || !dateTo) {
      showNotification(t("choose diapazon date"), "error");
      return;
    }

    setDownloadExcel(true);

    try {
      const searchParams = new URLSearchParams(window.location.search);

      const params = new URLSearchParams();

      params.append("dateFrom", dateFrom);
      params.append("dateTo", dateTo);

      const wozwrat_or_prihod = searchParams.get("wozwrat_or_prihod");
      const partner_id = searchParams.get("partner_id");
      const selectedEntry = searchParams.get("selectedEntry");
      const sortInvoice = searchParams.get("sortInvoice");

      if (wozwrat_or_prihod) params.append("wozwrat_or_prihod", wozwrat_or_prihod);
      if (partner_id) params.append("partner_id", partner_id);
      if (selectedEntry) params.append("selectedEntry", selectedEntry);
      if (sortInvoice) params.append("sortInvoice", sortInvoice);

      const res = await myAxios.get(`download_excel_fakturs_diapazon?${params.toString()}`, {
        responseType: "blob", // 🔥 ОБЯЗАТЕЛЬНО
      });

      // 👇 скачивание файла
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faktury_${dateFrom}_${dateTo}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("cant downloadExcelFakturs", err);
      showNotification(err?.response?.data?.error || "Excel download error", "error");
    } finally {
      setTimeout(() => {
        setDownloadExcel(false);
      }, 1000);
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md p-1 mb-2 flex items-center justify-between px-2 print:hidden">
      <motion.button
        onClick={() => handleOpenInvoice(null)}
        ref={buttonRef}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="
    relative group
    px-4 py-2.5 
    bg-gradient-to-r from-emerald-500 to-teal-600
    hover:from-emerald-600 hover:to-teal-700
    dark:from-emerald-600 dark:to-teal-700
    dark:hover:from-emerald-700 dark:hover:to-teal-800
    text-white font-semibold rounded-lg
    shadow-md hover:shadow-lg
    transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-emerald-300/50 
    dark:focus:ring-emerald-500/50 focus:ring-offset-2 
    dark:focus:ring-offset-gray-800
  "
      >
        <div className="flex items-center justify-center gap-1 text-sm">
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
            <FaPlus className="text-base" />
          </motion.div>
          <span>{t("add")}</span>
        </div>
      </motion.button>
      <div>
        <ExcelButton classname="px-3 py-2" onClick={() => downloadExcelFakturs()} disabled={downloadExcel} />
      </div>
      {/* <div>{t("total invoices")}: {pagination.total}</div> */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="
    inline-flex items-center gap-3
    px-4 py-2
    rounded-2xl
    bg-gradient-to-r from-indigo-500/10 to-violet-500/10
    dark:from-indigo-400/10 dark:to-violet-400/10
    backdrop-blur-md
    border border-indigo-200 dark:border-indigo-800
    shadow-sm
  "
      >
        <div
          className="
      p-2 rounded-xl
      bg-indigo-500/15 dark:bg-indigo-400/20
      text-indigo-600 dark:text-indigo-400
    "
        >
          <FileText size={18} />
        </div>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("total invoices")}:</span>

        <AnimatePresence mode="wait">
          <motion.span
            key={pagination.total}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="
        text-lg font-bold tabular-nums
        text-indigo-600 dark:text-indigo-400
      "
          >
            {pagination.total}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <div>
        <MySearchInput
          ref={mainRefs.searchInputRef}
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          // onKeyDown={(e) => {
          //   if (e.key === "ArrowDown") {
          //     e.preventDefault();
          //     sound.currentTime = 0; // сброс, чтобы можно было быстро подряд
          //     sound.play();

          //     const ids = invoices.map((inv) => inv.id); // порядок соответствует списку
          //     if (ids.length > 0) {
          //       mainRefs.listRefs.current[ids[0]]?.focus();
          //     }

          //   }
          // }}

          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              sound.currentTime = 0; // сброс, чтобы можно было быстро подряд
              sound.play();

              const ids = invoices.map((inv) => inv.id); // порядок соответствует списку
              if (ids.length > 0) {
                mainRefs.listRefs.current[`desktop_${ids[0]}`]?.focus();
                mainRefs.listRefs.current[`large_${ids[0]}`]?.focus();
                mainRefs.listRefs.current[`laptop_${ids[0]}`]?.focus();
                mainRefs.listRefs.current[`mobile_${ids[0]}`]?.focus();
              }
            }
          }}

          // onKeyDown={(e) => {
          //   if (e.key === "ArrowDown") {
          //     e.preventDefault();
          //     sound.currentTime = 0;
          //     sound.play();

          //     // Небольшая задержка для гарантии обновления DOM
          //     setTimeout(() => {
          //       const ids = invoices.map((inv) => inv.id);
          //       console.log("Search -> ArrowDown: Focusing first of", ids.length, "items");

          //       if (ids.length > 0) {
          //         const firstId = ids[0];
          //         const firstElement = mainRefs.listRefs.current[firstId];

          //         if (firstElement) {
          //           firstElement.focus();
          //           console.log("✅ Successfully focused element:", firstId);
          //         } else {
          //           console.warn("❌ Element not found in refs:", firstId);
          //           console.log("Available refs:", Object.keys(mainRefs.listRefs.current));
          //         }
          //       }
          //     }, 10);
          //   }
          // }}

          // onKeyDown={(e) => {
          //   if (e.key === "ArrowDown") {
          //     e.preventDefault();
          //     sound.currentTime = 0;
          //     sound.play();

          //     setTimeout(() => {
          //       const ids = invoices.map((inv) => inv.id);
          //       console.log("Search -> ArrowDown: Focusing first of", ids.length, "items");

          //       if (ids.length > 0) {
          //         const firstId = ids[0];
          //         const firstElement = mainRefs.listRefs.current[firstId];

          //         if (firstElement) {
          //           // Принудительно делаем элемент фокусируемым
          //           firstElement.setAttribute("tabindex", "0");

          //           // Фокусируем
          //           firstElement.focus({ preventScroll: false });

          //           // Прокручиваем к элементу
          //           firstElement.scrollIntoView({
          //             behavior: "smooth",
          //             block: "nearest",
          //             inline: "nearest",
          //           });

          //           // Добавляем временный стиль для визуализации
          //           firstElement.style.boxShadow = "0 0 0 3px red";
          //           setTimeout(() => {
          //             firstElement.style.boxShadow = "";
          //           }, 1000);

          //           console.log("✅ Successfully focused and scrolled to element:", firstId);
          //         } else {
          //           console.warn("❌ Element not found in refs:", firstId);
          //         }
          //       }
          //     }, 50);
          //   }
          // }}
        />
      </div>
    </div>
  );
};

export default Head;
