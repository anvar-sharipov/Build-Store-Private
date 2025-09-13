import { useEffect, useState } from "react";
import myAxios from "../../../axios";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";

function FetchWarehouse() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext();
  const [allWarehouses, setAllWarehouses] = useState([]);

  // Сохраняем выбранный склад локально
  const [selectedWarehouse, setSelectedWarehouse] = useState(() => {
    const stored = localStorage.getItem("purchaseWarehouse");
    return stored ? JSON.parse(stored) : null;
  });

  const fetchWarehouses = async () => {
    try {
      const res = await myAxios.get("/warehouses");
      setAllWarehouses(res.data);

      // Если в Formik ничего нет, проверяем localStorage
      if (!values.warehouse?.id && selectedWarehouse) {
        const found = res.data.find((w) => w.id === selectedWarehouse.id);
        if (found) {
          setFieldValue("warehouse", found);
        }
      }
    } catch (error) {
      console.log("Не смог получить склады", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    const selected = allWarehouses.find(
      (w) => w.id === parseInt(e.target.value)
    );
    setFieldValue("warehouse", selected || null);
    if (selected) {
      localStorage.setItem("purchaseWarehouse", JSON.stringify(selected));
      setSelectedWarehouse(selected);
    } else {
      localStorage.removeItem("purchaseWarehouse");
      setSelectedWarehouse(null);
    }
  };

  return (
    <div className="w-full flex-1 print:hidden">
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("warehouse")}
      </label>
      <select
        value={values.warehouse?.id || ""}
        onChange={handleChange}
        className="
          w-full pl-4 pr-4 py-2 rounded-xl border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-blue-400
          dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
          transition-all duration-200
        "
      >
        <option value="">{t("select_warehouse")}</option>
        {allWarehouses.map((wh) => (
          <option key={wh.id} value={wh.id}>
            {wh.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FetchWarehouse;
