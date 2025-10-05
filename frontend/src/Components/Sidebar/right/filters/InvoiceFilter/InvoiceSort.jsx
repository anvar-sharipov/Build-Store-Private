import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

const InvoiceSort = ({ sortInvoice, setSortInvoice }) => {
  const change_type = new Audio("/sounds/change_type.mp3");
  const { t } = useTranslation();

  const options = [
    { 
      value: "asc", 
      label: t("asc"), 
      icon: ArrowUp,
      color: "from-blue-500 to-cyan-600",
      iconColor: "text-blue-400"
    },
    { 
      value: "desc", 
      label: t("desc"), 
      icon: ArrowDown,
      color: "from-violet-500 to-purple-600",
      iconColor: "text-violet-400"
    },
  ];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
        <span className="text-indigo-400">🔢</span>
        {t("sort")} № {t("faktura")}
      </label>
      
      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence>
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = sortInvoice === opt.value;
            
            return (
              <motion.label
                key={opt.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden
                  ${isSelected 
                    ? 'bg-gradient-to-br ' + opt.color + ' shadow-lg ring-2 ring-white/20' 
                    : 'bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-gray-600'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated background */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <input
                  type="radio"
                  name="invoiceSort"
                  value={opt.value}
                  checked={isSelected}
                  onChange={(e) => {
                    change_type.currentTime = 0;
                    change_type.play();
                    setSortInvoice(e.target.value);
                  }}
                  className="sr-only"
                />
                
                {/* Icon with animation */}
                <motion.div
                  animate={isSelected ? {
                    y: opt.value === 'asc' ? [-2, 0, -2] : [2, 0, 2]
                  } : {}}
                  transition={{ duration: 1.5, repeat: isSelected ? Infinity : 0 }}
                  className={`transition-all ${isSelected ? 'scale-125' : ''}`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : opt.iconColor}`} />
                </motion.div>

                {/* Label */}
                <span className={`text-xs font-bold text-center transition-colors ${
                  isSelected ? 'text-white' : 'text-gray-400'
                }`}>
                  {opt.label}
                </span>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"
                  />
                )}
              </motion.label>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvoiceSort;