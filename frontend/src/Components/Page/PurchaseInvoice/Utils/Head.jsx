import { useTranslation } from "react-i18next";
// import SmartTooltip from "../../../SmartTooltip";
// import MySearchInput from "../../../UI/MySearchInput";
import { useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { ROUTES } from "../../../../routes";
import { useNavigate } from "react-router-dom";
import invoiceClasses from "./classes";
// import { useFormikContext } from "formik";


const Head = () => {
  const { t } = useTranslation();
  const buttonRef = useRef(null);
  const navigate = useNavigate();
//   const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();

  useEffect(() => {
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

  const handleClick = () => {
    navigate(ROUTES.PURCHASE_INVOICE_CREATE);
  };
  return (
    <div>
      <button
        onClick={handleClick}
        ref={buttonRef}
        className={invoiceClasses.addInvoiceBtn}
      >
        <FaPlus className="text-lg" />
        <span>{t("add")}</span>
      </button>
    </div>
  );
};

export default Head;
