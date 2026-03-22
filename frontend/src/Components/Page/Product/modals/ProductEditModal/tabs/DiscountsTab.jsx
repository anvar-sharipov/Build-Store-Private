import { useFormikContext, Field } from "formik";
import { myClass } from "../../../../../tailwindClasses";
import { useTranslation } from "react-i18next";

const DiscountsTab = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext();

  const discounts = values.quantity_discounts || [];
  console.log("values.quantity_discounts", values);
  

  const addRule = () => {
    const newRules = [
      ...discounts,
      {
        min_quantity: "",
        discount_percent: "",
      },
    ];
    setFieldValue("quantity_discounts", newRules);
  };

  const removeRule = (index) => {
    const newRules = discounts.filter((_, i) => i !== index);
    setFieldValue("quantity_discounts", newRules);
  };

  const updateRule = (index, field, value) => {
    const newRules = [...discounts];
    newRules[index][field] = value;
    setFieldValue("quantity_discounts", newRules);
  };

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{t("quantity discounts")}</h3>

        <button type="button" onClick={addRule} className={myClass.buttonRounded}>
          +
        </button>
      </div>

      {/* Список правил */}
      <div className="space-y-2">
        {discounts.length === 0 && <div className="text-gray-500 text-sm">{t("no discount rules")}</div>}

        {discounts.map((rule, index) => (
          <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded border">
            {/* Количество */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500">{t("quantity2")}</label>

              <Field type="number" value={rule.min_quantity} onChange={(e) => updateRule(index, "min_quantity", e.target.value)} className={myClass.input2} />
            </div>

            {/* Процент */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500">{t("discount percent")}</label>

              <Field type="number" value={rule.discount_percent} onChange={(e) => updateRule(index, "discount_percent", e.target.value)} className={myClass.input2} />
            </div>

            {/* Удалить */}
            <button type="button" onClick={() => removeRule(index)} className="text-red-500 hover:text-red-700 text-lg px-2">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountsTab;
