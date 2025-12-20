import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const SelectInput = forwardRef(
  (
    {
      list = [],
      labelText,
      containerClass = "",
      labelAnimation = {},
      inputAnimation = {},
      diasbledInput = false,
      onlyDarkModeInputStyle = false,
      selectedObject = null,
      setSelectedObject = null,
      labelIcon = null,
      emptyOptionText="---"
    },
    ref
  ) => {
    const { t } = useTranslation();

    const selectStyle = onlyDarkModeInputStyle
      ? `h-11 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 px-3`
      : `h-11 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 px-3`;

    return (
      <div className={`${containerClass}`}>
        <motion.label {...labelAnimation} className="text-sm font-semibold text-gray-700 dark:text-gray-300 print:!text-black">
          {t(labelText)}:
        </motion.label>

        <motion.select
          {...inputAnimation}
          ref={ref}
          disabled={diasbledInput}
          className={`${selectStyle} print:hidden`}
          value={selectedObject ? selectedObject.id : ""}
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            const found = list.find((item) => item.id === selectedId);
            setSelectedObject?.(found || null);
          }}
        >
          <option value="" disabled>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t(emptyOptionText)}</span> 
          </option>

          {list.map((item) => (
            <option key={item.id} value={item.id}>
              {labelIcon ? `${labelIcon} ` : ""}
              {item.name}
            </option>
          ))}
        </motion.select>
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";
export default SelectInput;
