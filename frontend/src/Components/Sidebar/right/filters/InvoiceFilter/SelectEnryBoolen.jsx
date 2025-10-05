import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, List } from "lucide-react";

const SelectEntryBoolean = ({ selectedEntry, setSelectedEntry }) => {
  const change_type = new Audio("/sounds/change_type.mp3");
  const { t } = useTranslation();

  const options = [
    { 
      value: "all", 
      label: t("all"), 
      icon: List,
      color: "from-gray-500 to-gray-600",
      iconColor: "text-gray-400"
    },
    { 
      value: "entried", 
      label: t("Posted2"), 
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
      iconColor: "text-emerald-400"
    },
    { 
      value: "notEntried", 
      label: t("Not posted2"), 
      icon: XCircle,
      color: "from-amber-500 to-orange-600",
      iconColor: "text-amber-400"
    },
  ];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
        <span className="text-purple-400">📊</span>
        {t("Document status")}
      </label>
      
      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence>
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = selectedEntry === opt.value || (!selectedEntry && opt.value === "all");
            
            return (
              <motion.label
                key={opt.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden
                  ${isSelected 
                    ? 'bg-gradient-to-r ' + opt.color + ' shadow-lg ring-2 ring-white/20' 
                    : 'bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-gray-600'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Shimmer effect */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}

                <input
                  type="radio"
                  name="entryStatus"
                  value={opt.value}
                  checked={isSelected}
                  onChange={(e) => {
                    change_type.currentTime = 0;
                    change_type.play();
                    setSelectedEntry(e.target.value);
                  }}
                  className="sr-only"
                />
                
                {/* Custom radio indicator */}
                <div className={`relative flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all ${
                  isSelected 
                    ? 'border-white bg-white' 
                    : 'border-gray-600 bg-gray-800'
                }`}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"
                    />
                  )}
                </div>

                {/* Icon */}
                <div className={`transition-all ${isSelected ? 'scale-110' : ''}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : opt.iconColor}`} />
                </div>

                {/* Label */}
                <span className={`flex-1 font-medium transition-colors ${
                  isSelected ? 'text-white font-bold' : 'text-gray-300'
                }`}>
                  {opt.label}
                </span>

                {/* Active indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50" />
                  </motion.div>
                )}
              </motion.label>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SelectEntryBoolean;