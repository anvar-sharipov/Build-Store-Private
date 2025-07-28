import { useFormikContext, Field, ErrorMessage } from "formik";
import { myClass } from "../../../../../tailwindClasses";
import { useState, useRef } from "react";
import myAxios from "../../../../../axios";
import UnitModal from "../../../../../UI/miniModals/UnitModal";
import ProductUnitsList from "./sections/ProductUnitsList";
import ProductFreeItemsList from "./sections/ProductFreeItemsList";
import WarehousesSection from "./sections/WarehousesSection";

const BasicTab = ({ options, loadingModal, setOptions, productId, t, warehouses }) => {
  const [showUnitModal, setShowUnitModal] = useState(false);

  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldError,
    initialValues,
  } = useFormikContext();
  

  const timeoutRef = useRef(null);
  // console.log('values', values);
  

  const handleUnitAdded = (newUnit) => {
    setOptions((prev) => ({
      ...prev,
      base_units: [
        ...prev.base_units,
        {
          value: String(newUnit.id),
          label: newUnit.name,
        },
      ],
    }));
    setFieldValue("base_unit", String(newUnit.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        {/* Наименование — на всю ширину */}
        <div className="w-full">
          <div className="">
            <label className="block text-sm font-medium">
              {t("nameLabel")}
            </label>
            <Field
              name="name"
              className={myClass.input2}
              placeholder={t("namePlaceholder")}
              autoComplete="off"
            />
          </div>
          {errors.name && (
            <div className="text-red-500 text-sm mt-1">{errors.name}</div>
          )}
        </div>
        {/* sklad */}
        {/* <div>
          <label className="block text-sm font-medium">{t("sklad")}</label>
          <div className="flex gap-2">
            <Field as="select" name="warehouse" className={myClass.input2}>
              <option value="">{t("sklad")}</option>
              {options.warehouses.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </Field>
            <button
              type="button"
              className={myClass.buttonRounded}
              onClick={() => setShowUnitModal(true)}
            >
              +
            </button>
          </div>
          {errors.warehouse && (
            <div className="text-red-500 text-sm mt-1">{errors.warehouse}</div>
          )}
        </div> */}
      </div>

      



      {/* Компактный блок: Кол-во, Баз.ед., SKU */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Количество */}
        {/* <div className="flex-1">
          <label className="block text-sm font-medium">
            {t("quantityLabel")}
          </label>
          <Field
            type="number"
            name="quantity"
            className={myClass.input2}
            placeholder={t("quantityPlaceholder")}
          />
          <ErrorMessage
            name="quantity"
            component="div"
            className="text-red-500 text-sm mt-1"
          />
        </div> */}

        <WarehousesSection options={options} t={t} warehouses={warehouses} />

        {/* Базовая единица + кнопка */}
        <div className="flex-1"> 
          <label className="block text-sm font-medium">
            {t("baseUnitLabel")}
          </label>
          <div className="flex gap-2">
            <Field as="select" name="base_unit" className={myClass.input2}>
              <option value="">{t("baseUnitPlaceholder")}</option>
              {options.base_units.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </Field>
            <button
              type="button"
              className={myClass.buttonRounded}
              onClick={() => setShowUnitModal(true)}
            >
              +
            </button>
          </div>
          {errors.base_unit && (
            <div className="text-red-500 text-sm mt-1">{errors.base_unit}</div>
          )}
        </div>

        {/* SKU */}
        <div className="flex-1">
          <label className="block text-sm font-medium">{t("skuLabel")}</label>
          <Field
            name="sku"
            placeholder={t("skuPlaceholder")}
            disabled={true}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Активен */}
        <div className="flex items-center gap-2">
          <Field
            type="checkbox"
            name="is_active"
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <label className="text-sm font-medium">{t("activeLabel")}</label>
        </div>
      </div>

      {/* Описание — на всю ширину */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {t("descriptionLabel")}
        </label>
        <Field
          as="textarea"
          name="description"
          rows={1}
          placeholder={t("descriptionPlaceholder")}
          className={myClass.input2}
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 sm:flex-col lg:flex-row justify-between">
        <ProductFreeItemsList productOptions={options.products} t={t} />
        <ProductUnitsList
          unitOptions={options.base_units}
          errors={errors}
          t={t}
        />
      </div>

      {/* Модалка */}
      {showUnitModal && (
        <UnitModal
          onClose={() => setShowUnitModal(false)}
          onSuccess={handleUnitAdded}
        />
      )}
    </div>
  );
};

export default BasicTab;
