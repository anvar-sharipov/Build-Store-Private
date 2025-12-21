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
      emptyOptionText = "---",
      refsFocusAfterSelect = null,
    },
    ref
  ) => {
    const { t } = useTranslation();

    const selectStyle = onlyDarkModeInputStyle
      ? `h-11 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 px-3`
      : `h-11 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 px-3`;

    return (
      <div className={`${containerClass}`}>
        <motion.label {...labelAnimation} className={`text-sm font-semibold ${onlyDarkModeInputStyle ? "text-gray-300" : "text-gray-700 dark:text-gray-300"} print:!text-black`}>
          {t(labelText)}:
        </motion.label>

        <motion.select
          {...inputAnimation}
          ref={ref}
          disabled={diasbledInput}
          value={selectedObject ? selectedObject.id : ""}
          onChange={(e) => {
            if (diasbledInput) return;

            const selectedId = Number(e.target.value);
            const found = list.find((item) => item.id === selectedId);
            setSelectedObject?.(found || null);

            if (refsFocusAfterSelect) {
              if (!refsFocusAfterSelect.ref1?.value?.id) {
                refsFocusAfterSelect.ref1?.ref?.current?.focus();
              } else if (!refsFocusAfterSelect.ref2?.value?.id) {
                refsFocusAfterSelect.ref2?.ref?.current?.focus();
              } else if (!refsFocusAfterSelect.ref3?.value?.id) {
                refsFocusAfterSelect.ref3?.ref?.current?.focus();
              }
            }
          }}
          className={`h-9 w-full pl-3 pr-8 text-sm rounded-lg border transitionappearance-none print:hidden
            ${
              diasbledInput
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700"
                : "bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:border-gray-600"
            }
        `}
        >
          <option value="" disabled>
            {t(emptyOptionText)}
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
