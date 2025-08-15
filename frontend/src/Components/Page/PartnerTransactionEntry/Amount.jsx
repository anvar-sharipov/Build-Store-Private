import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";

const Amount = ({ price_inputRef, X_kredit_ref, kreditInputRef, comment_Ref }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  return (
    <div>
      <label className="block mb-1 font-medium">{t("amount")}</label>
      <input
        ref={price_inputRef}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (X_kredit_ref.current) {
              X_kredit_ref.current.focus();
            } else {
              kreditInputRef.current?.focus();
            }
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            comment_Ref.current?.focus();
          } else if (e.key === "Enter") {
            e.preventDefault();
            comment_Ref.current?.focus();
            comment_Ref.current?.select();
          }
        }}
        onChange={(e) => {
          const value = e.target.value;
          setFieldValue("amount", value ? parseFloat(value) : "");
        }}
        type="number"
        step="0.01"
        placeholder={t("Payment amount")}
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
};

export default Amount;
