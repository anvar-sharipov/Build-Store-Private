import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const TypeFaktura = ({ setFakturaType }) => {
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const { t } = useTranslation();
  const change_type = new Audio("/sounds/change_type.mp3");

  return (
    <div>
      {/* <span className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{t("type faktura")}</span> */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="wozwrat_or_prihod"
            value="rashod"
            disabled={values.already_entry}
            checked={values.wozwrat_or_prihod === "rashod"}
            onChange={(e) => {
              change_type.currentTime = 0;
              change_type.play();
              setFieldValue("wozwrat_or_prihod", e.target.value);
              localStorage.setItem("wozwrat_or_prihod_purchase", e.target.value);
              setFakturaType(e.target.value);
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
              }
            }}
          />
          <span className="text-gray-700 dark:text-gray-300">{t("rashod")}</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="wozwrat_or_prihod"
            value="prihod"
            disabled={values.already_entry}
            checked={values.wozwrat_or_prihod === "prihod"}
            onChange={(e) => {
              change_type.currentTime = 0;
              change_type.play();
              setFieldValue("wozwrat_or_prihod", e.target.value);
              localStorage.setItem("wozwrat_or_prihod_purchase", e.target.value);
              setFakturaType(e.target.value);
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
              }
            }}
          />
          <span className="text-gray-700 dark:text-gray-300">{t("prihod")}</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="wozwrat_or_prihod"
            value="wozwrat"
            disabled={values.already_entry}
            checked={values.wozwrat_or_prihod === "wozwrat"}
            onChange={(e) => {
              change_type.currentTime = 0;
              change_type.play();
              setFieldValue("wozwrat_or_prihod", e.target.value);
              localStorage.setItem("wozwrat_or_prihod_purchase", e.target.value);
              setFakturaType(e.target.value);
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
              }
            }}
          />
          <span className="text-gray-700 dark:text-gray-300">{t("wozwrat")}</span>
        </label>
      </div>
    </div>
  );
};

export default TypeFaktura;
