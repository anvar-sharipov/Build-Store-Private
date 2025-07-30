import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import refreshTable from "./refreshTable";

const PriceType = () => {
  const { values, setFieldValue } = useFormikContext();
  const { t } = useTranslation();
  const priceType = values.priceType;

  useEffect(() => {
    localStorage.setItem("priceType", JSON.stringify(priceType));
  }, [priceType]);

  return (
    <div className="flex gap-4 items-center print:hidden">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="radio"
          value="retail"
          checked={priceType === "retail"}
          onChange={() => {
            setFieldValue("priceType", "retail");
            refreshTable({ ...values, priceType: "retail" }, setFieldValue, values.warehouses.id, true, "");
          }}
          className="form-radio text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <span className="ml-2 text-gray-700 dark:text-gray-200">{t("retailPrice")}</span>
      </label>

      <label className="inline-flex items-center cursor-pointer">
        <input
          type="radio"
          value="wholesale"
          checked={priceType === "wholesale"}
          onChange={() => {
            setFieldValue("priceType", "wholesale");
            refreshTable({ ...values, priceType: "wholesale" }, setFieldValue, values.warehouses.id, true, "");
          }}
          className="form-radio text-green-600 focus:ring-green-500 dark:focus:ring-green-400"
        />
        <span className="ml-2 text-gray-700 dark:text-gray-200">{t("wholesalePrice")}</span>
      </label>
    </div>
  );
};

export default PriceType;
