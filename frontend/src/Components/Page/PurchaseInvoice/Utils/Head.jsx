import { useTranslation } from "react-i18next";
// import SmartTooltip from "../../../SmartTooltip";
// import MySearchInput from "../../../UI/MySearchInput";
import { useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import invoiceClasses from "./classes";
// import { useFormikContext } from "formik";
import MySearchInput from "../../../UI/MySearchInput";

const Head = ({ mainRefs, handleOpenInvoice }) => {
  const { t } = useTranslation();
  const buttonRef = useRef(null);
  
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
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const firstEl = mainRefs.listRefs.current[Object.keys(mainRefs.listRefs.current)[0]];
              if (firstEl) {
                firstEl.focus();
                console.log("tut");
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Head;
