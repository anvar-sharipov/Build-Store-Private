import { useState } from "react";
const PrintVisibleHideInputs = ({ printVisibleColumns, setPrintVisibleColumns, userPrintVisibleColumns, adminPrintVisibleColumns }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const checkboxItems = [
    { key: "qr_code", label: "QR code", icon: "📱" },
    { key: "image", label: "Foto", icon: "📸" },
    { key: "purchase", label: "Приход", icon: "📥" },
    { key: "income", label: "Доход", icon: "💰" },
    { key: "discount", label: "Скидка", icon: "🏷️" },
    { key: "volume", label: "Объём (м³)", icon: "📦" },
    { key: "weight", label: "Вес (кг)", icon: "⚖️" },
    { key: "dimensions", label: "Размеры", icon: "📏" },
    // { key: "saldo", label: "Сальдо", icon: "$" },
  ];

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 rounded-2xl opacity-60"></div>
      
      {/* Main container */}
      <div className="relative backdrop-blur-sm bg-gray-200 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-2xl shadow-blue-500/10 dark:shadow-purple-500/10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">🖨️</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Настройки печати
          </h3>
        </div>

        {/* Checkbox grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {checkboxItems.map(({ key, label, icon }) => (
            <label 
              key={key} 
              className={`
                group relative flex items-center gap-3 p-4 rounded-xl cursor-pointer select-none
                transition-all duration-300 ease-out
                hover:scale-105 hover:shadow-lg
                ${printVisibleColumns[key] 
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/40 shadow-lg shadow-blue-500/20' 
                  : 'bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200/40 dark:border-gray-600/40 hover:border-blue-300/60'
                }
              `}
              onMouseEnter={() => setHoveredItem(key)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Animated background */}
              <div className={`
                absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-gradient-to-br from-blue-400/10 to-purple-400/10
              `}></div>
              
              {/* Custom checkbox */}
              <div className="relative">
                <input
                  type="checkbox"
                  checked={printVisibleColumns[key]}
                  onChange={(e) =>
                    setPrintVisibleColumns((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="sr-only"
                />
                <div className={`
                  w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                  ${printVisibleColumns[key]
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 shadow-lg transform scale-110'
                    : 'border-gray-300 dark:border-gray-500 group-hover:border-blue-400 group-hover:shadow-md'
                  }
                `}>
                  {printVisibleColumns[key] && (
                    <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Icon and label */}
              <div className="relative flex items-center gap-2 flex-1">
                <span className="text-xl group-hover:animate-bounce" style={{ animationDuration: '1s' }}>
                  {icon}
                </span>
                <span className={`
                  font-medium transition-colors duration-300
                  ${printVisibleColumns[key] 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }
                `}>
                  {label}
                </span>
              </div>

              {/* Hover glow effect */}
              {hoveredItem === key && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-100 animate-pulse"></div>
              )}
            </label>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setPrintVisibleColumns(userPrintVisibleColumns)}
            type="button"
            className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <span className="text-lg">❌</span>
              <span>Снять все галочки</span>
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></div>
          </button>

          <button
            onClick={() => setPrintVisibleColumns(adminPrintVisibleColumns)}
            type="button"
            className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span>Выбрать все галочки</span>
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"></div>
          </button>

          
        </div>
      </div>
    </div>
  );
};

export default PrintVisibleHideInputs;
