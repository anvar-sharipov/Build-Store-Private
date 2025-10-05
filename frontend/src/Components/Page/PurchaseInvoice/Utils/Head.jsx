import { useTranslation } from "react-i18next";
// import SmartTooltip from "../../../SmartTooltip";
// import MySearchInput from "../../../UI/MySearchInput";
import { useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import invoiceClasses from "./classes";
// import { useFormikContext } from "formik";
import MySearchInput from "../../../UI/MySearchInput";
import { motion } from "framer-motion";

const Head = ({ mainRefs, handleOpenInvoice, setQuery, query, invoices }) => {
  const { t } = useTranslation();
  const buttonRef = useRef(null);
  const sound = new Audio("/sounds/up_down.mp3");
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
        <div className="flex items-center justify-center gap-2">
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
            <FaPlus className="text-base" />
          </motion.div>
          <span>{t("add")}</span>
        </div>
      </motion.button>
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
