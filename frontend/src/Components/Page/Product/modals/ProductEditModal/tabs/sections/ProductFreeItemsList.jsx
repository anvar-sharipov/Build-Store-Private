import { useFormikContext, Field, ErrorMessage } from "formik";
import AsyncSelect from "react-select/async";
import myAxios from "../../../../../../axios";
import { useState, useCallback } from "react";

const ProductFreeItemsList = ({ productOptions = [], t }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const [selectedProducts, setSelectedProducts] = useState({}); // Кэш выбранных продуктов
  // console.log("valuessssss", values);

  const handleAddFreeItem = () => {
    const newItem = { gift_product: "", quantity_per_unit: "" };
    setFieldValue("free_items", [...(values.free_items || []), newItem]);
  };

  const handleRemoveFreeItem = (index) => {
    const updated = [...(values.free_items || [])];
    updated.splice(index, 1);
    setFieldValue("free_items", updated);

    // Очищаем кэш для удаленного элемента
    const newSelectedProducts = { ...selectedProducts };
    delete newSelectedProducts[index];
    // Обновляем индексы в кэше
    const updatedCache = {};
    Object.keys(newSelectedProducts).forEach((key) => {
      const keyIndex = parseInt(key);
      if (keyIndex > index) {
        updatedCache[keyIndex - 1] = newSelectedProducts[key];
      } else if (keyIndex < index) {
        updatedCache[keyIndex] = newSelectedProducts[key];
      }
    });
    setSelectedProducts(updatedCache);
  };

  const loadProductOptions = useCallback(
    async (inputValue) => {
      if (!inputValue || inputValue.length < 2) {
        return [];
      }

      try {
        const warehouses = values.warehouses.map((w) => w.warehouse);
        // console.log("warehousesssss", warehouses);

        const params = new URLSearchParams({
          search_free: inputValue,
        });
        warehouses.forEach(id => params.append('warehouses', id));
        // console.log('params.toString()', params.toString());
        
        const res = await myAxios.get(
          `search-products/?${params.toString()}`
        );
        // console.log("res.dataaaaa", res.data);

        return res.data.map((p) => ({
          value: String(p.id),
          label: p.name,
        }));
      } catch (error) {
        console.error(t("productSearchError"), error);
        return [];
      }
    },
    [t, values.warehouses, setFieldValue.warehouses]
  );

  const getSelectValue = (item, index) => {
    if (!item.gift_product) return null;
    if (selectedProducts[index]) {
      return selectedProducts[index];
    }
    const option = productOptions.find(
      (opt) => String(opt.value) === String(item.gift_product)
    );
    if (option) return option;
    return {
      value: String(item.gift_product),
      label: `${item.gift_product_name}`,
    };
  };

  const handleProductChange = (selectedOption, index) => {
    const value = selectedOption?.value || "";
    setFieldValue(`free_items[${index}].gift_product`, value);
    if (selectedOption) {
      setSelectedProducts((prev) => ({ ...prev, [index]: selectedOption }));
    } else {
      const newCache = { ...selectedProducts };
      delete newCache[index];
      setSelectedProducts(newCache);
    }
  };

  const freeItems = values.free_items || [];
  const isDarkMode = document.documentElement.classList.contains("dark");

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between gap-4">
        <label className="text-sm font-medium">{t("freeItemsInPackage")}</label>
        <button
          type="button"
          onClick={handleAddFreeItem}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          + {t("add")}
        </button>
      </div>

      {freeItems.length === 0 && (
        <div className="text-sm text-gray-500 italic">{t("noFreeItems")}</div>
      )}

      {freeItems.map((item, index) => (
        <div
          key={index}
          className="flex gap-3 items-start border p-3 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
        >
          <div className="flex-1">
            <AsyncSelect
              menuPlacement="top"
              cacheOptions={false}
              defaultOptions={false}
              loadOptions={loadProductOptions}
              placeholder={t("enterProductName")}
              noOptionsMessage={({ inputValue }) =>
                inputValue.length < 2 ? t("minTwoChars") : t("productsNotFound")
              }
              loadingMessage={() => t("searching")}
              value={getSelectValue(item, index)}
              onChange={(selectedOption) =>
                handleProductChange(selectedOption, index)
              }
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                  backgroundColor: isDarkMode ? "#1F2937" : "white",
                  color: isDarkMode ? "#F9FAFB" : "#111827",
                  borderColor: isDarkMode ? "#4B5563" : "#D1D5DB",
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: "14px",
                  color: isDarkMode ? "#9CA3AF" : "#6B7280",
                }),
                menu: (base) => ({
                  ...base,
                  width: "200%",
                  minWidth: "200%",
                  zIndex: 9999,
                  backgroundColor: isDarkMode ? "#1F2937" : "#F8F8FF",
                  color: isDarkMode ? "#F9FAFB" : "#111827",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? isDarkMode
                      ? "#374151"
                      : "#E5E7EB"
                    : "transparent",
                  color: isDarkMode ? "#F9FAFB" : "#111827",
                }),
                input: (base) => ({
                  ...base,
                  color: isDarkMode ? "white" : "#111827",
                }),
                singleValue: (base) => ({
                  ...base,
                  color: isDarkMode ? "#F9FAFB" : "#111827",
                }),
                valueContainer: (base) => ({
                  ...base,
                  color: isDarkMode ? "#F9FAFB" : "#111827",
                }),
              }}
            />
            {errors.free_items &&
              errors.free_items[index] &&
              errors.free_items[index].gift_product && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.free_items[index].gift_product}
                </span>
              )}
          </div>

          <div className="w-32">
            <Field
              type="number"
              step="0.01"
              min="0"
              name={`free_items[${index}].quantity_per_unit`}
              className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 
             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
             placeholder-gray-400 dark:placeholder-gray-500 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
             transition-all duration-150"
              placeholder={t("quantity")}
            />
            {errors.free_items &&
              errors.free_items[index] &&
              errors.free_items[index].quantity_per_unit && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.free_items[index].quantity_per_unit}
                </span>
              )}
          </div>

          <button
            type="button"
            onClick={() => handleRemoveFreeItem(index)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors text-lg leading-none"
            title={t("deleteItem")}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductFreeItemsList;
