import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";

const Comment = ({ comment_Ref, price_inputRef }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  return (
    <div>
      <label className="block mb-1 font-medium">{t("descriptionLabel")}</label>
      <textarea
        ref={comment_Ref}
        rows={3}
        placeholder={t("descriptionPlaceholder")}
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-gray-100 resize-none"
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            price_inputRef.current?.focus();
            price_inputRef.current?.select();
          } else if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        onChange={(e) => setFieldValue("comment", e.target.value)}
        value={values.comment || ""}
      />
    </div>
  );
};

export default Comment;
