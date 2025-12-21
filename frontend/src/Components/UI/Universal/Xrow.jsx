import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const Xrow = ({
  selectedObject = null,
  setSelectedObject = null,
  labelText = "",
  containerClass = "",
  labelAnimation = {},
  inputAnimation = {},
  focusRef,
  onlyDarkModeInputStyle = false,
  labelIcon = "👥",
  showXText = (item) => `${item.name}`, // to chto budet pokazywatsay w posle wybora "partnera" (name) w X row (mojno naprimer i id `${item.id} ${item.name}`)
  disabled = false,
}) => {
  const { t } = useTranslation();
  const labelStyle = onlyDarkModeInputStyle ? `text-sm font-semibold text-gray-300` : `text-sm font-semibold text-gray-700 dark:text-gray-300`;

  const handleClearX = () => {
    setSelectedObject(null);
    console.log("focusRef", focusRef);
    setTimeout(() => {
      focusRef.current?.focus();
    }, 0);
  };

  return (
    <div className={containerClass}>
      <motion.label {...labelAnimation} className={`${labelStyle} print:!text-black`}>
        {t(labelText)}:
      </motion.label>

      <motion.div {...inputAnimation} className="relative min-w-0">
        <div
          className={`
            flex items-center justify-between gap-2
            h-9
            px-3
            w-full
            border
            rounded-lg
            transition-colors
            print:border-none

            ${
              disabled
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700"
                : onlyDarkModeInputStyle
                ? "bg-gray-800 border-gray-700 hover:border-cyan-500"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-500"
            }
        `}
        >
          {/* LEFT */}
          <div className="flex items-center gap-2 min-w-0">
            {labelIcon && <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">{labelIcon}</div>}

            <span
              className={`
                text-sm
                font-medium
                truncate
                ${disabled ? "text-gray-400 dark:text-gray-500" : onlyDarkModeInputStyle ? "text-white" : "text-gray-900 dark:text-white"}
                print:!text-black
              `}
              title={showXText(selectedObject)}
            >
              {showXText(selectedObject)}
            </span>
          </div>

          {/* RIGHT — clear */}
          <motion.button
            type="button"
            whileHover={!disabled ? { scale: 1.1, rotate: 90 } : undefined}
            whileTap={!disabled ? { scale: 0.9 } : undefined}
            onClick={!disabled ? handleClearX : undefined}
            disabled={disabled}
            aria-label={t("clearSelection") || "Clear selection"}
            className={`
              flex-shrink-0
              w-6 h-6
              rounded-md
              flex items-center justify-center
              transition
              focus:outline-none
              focus:ring-1
              focus:ring-red-500

              ${disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-gray-700"}
          `}
          >
            <X className="w-3.5 h-3.5 print:hidden" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Xrow;
