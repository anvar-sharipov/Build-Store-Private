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

  //   const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();

  useEffect(() => {
    mainRefs.searchInputRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Insert") {
        e.preventDefault();
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
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              sound.currentTime = 0; // сброс, чтобы можно было быстро подряд
              sound.play();
              // if (mainRefs.listRefs.current > 0) {
              //   mainRefs.listRefs?.current[0].focus();
              // }

              // const ids = Object.keys(mainRefs.listRefs.current);
              // console.log("ids", ids);
              // if (ids.length > 0) {
              //   mainRefs.listRefs.current[ids[0]].focus();
              // }

              const ids = invoices.map((inv) => inv.id); // порядок соответствует списку
              if (ids.length > 0) {
                mainRefs.listRefs.current[ids[0]]?.focus();
              }

              // const firstEl = mainRefs.listRefs.current[Object.keys(mainRefs.listRefs.current)[0]];
              // // console.log("tttttttt ==== ", firstEl);
              // if (firstEl) {
              //   firstEl.focus();
              //   // console.log("tut");
              // }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Head;
