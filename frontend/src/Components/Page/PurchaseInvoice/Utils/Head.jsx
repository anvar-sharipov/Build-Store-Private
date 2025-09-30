import { useTranslation } from "react-i18next";
// import SmartTooltip from "../../../SmartTooltip";
// import MySearchInput from "../../../UI/MySearchInput";
import { useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import invoiceClasses from "./classes";
// import { useFormikContext } from "formik";
import MySearchInput from "../../../UI/MySearchInput";

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
      <button onClick={() => handleOpenInvoice(null)} ref={buttonRef} className={invoiceClasses.addInvoiceBtn}>
        <FaPlus className="text-lg" />
        <span>{t("add")}</span>
      </button>

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
