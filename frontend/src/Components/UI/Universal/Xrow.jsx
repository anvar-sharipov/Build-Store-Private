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
  disabled=false,
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

      <motion.div {...inputAnimation} className={`relative`}>
        <div
          className={`flex justify-between items-center gap-2 group px-3 py-1.5 w-full ${
            onlyDarkModeInputStyle
              ? "bg-gray-800 border-gray-700 hover:border-cyan-500"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-500"
          } border rounded-lg transition-colors`}
        >
          <div className="flex gap-5 items-center">
            {labelIcon && <div className="flex-shrink-0 pb-1">{labelIcon}</div>}
            <span className={`text-sm ${onlyDarkModeInputStyle ? "text-white" : "text-gray-900 dark:text-white"} font-medium print:!text-black`}>{showXText(selectedObject)}</span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClearX}
            disabled={disabled}
            className="flex-shrink-0 w-5 h-5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-red-500 transition-all ml-1"
            aria-label={t("clearSelection") || "Clear selection"}
          >
            <X className="w-3 h-3 print:hidden" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Xrow;
