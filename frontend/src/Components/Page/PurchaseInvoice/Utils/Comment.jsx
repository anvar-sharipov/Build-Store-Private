import { useFormikContext } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Comment = ({ id = "comment", rows = 4, maxLength = 1000 }) => {
  const { values, setFieldValue } = useFormikContext();
  const { t } = useTranslation();

  const onChange = (value) => {
    setFieldValue("comment", value);
  };

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className={`block mb-1 text-sm font-medium 
        ${values.is_entry && !values.comment.length > 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
      >
        {t("comment2")}
        {values.is_entry && !values.awto && <span className="ml-2 text-red-600 dark:text-red-400 font-normal">{t("writeComment")}</span>}
      </label>

      <div className="relative">
        <textarea
          id={id}
          name={id}
          rows={rows}
          maxLength={maxLength}
          value={values.comment}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("comment2")}
          className={`
            block w-full min-h-[96px] resize-vertical rounded-lg
            px-4 py-3 text-sm leading-relaxed
            border focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-colors duration-150

            ${
              values.is_entry && !values.comment.length > 0
                ? "bg-red-200 border-red-400 focus:ring-red-500 dark:bg-red-700 dark:border-red-500 dark:focus:ring-red-400 dark:text-white"
                : "border-gray-300 focus:ring-blue-400 focus:bg-indigo-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:bg-indigo-600"
            }
          `}
        />

        {/* counter */}
        <div className="absolute right-2 bottom-2 text-xs text-gray-500 dark:text-gray-400 select-none">
          {values.comment.length}/{maxLength}
        </div>
      </div>
    </div>
  );
};

export default Comment;
