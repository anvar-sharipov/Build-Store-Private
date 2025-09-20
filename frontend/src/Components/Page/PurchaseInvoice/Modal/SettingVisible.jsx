import { useState } from "react";
import { useTranslation } from "react-i18next";

const SettingVisible = ({ visibleColumns, setVisibleColumns, adminVisibleColumns, userVisibleColumns }) => {
  const { t } = useTranslation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const columns = [
    { key: "qr_code", label: "QR code", icon: "📱", color: "from-blue-500 to-cyan-500" },
    { key: "image", label: "Foto", icon: "📸", color: "from-purple-500 to-pink-500" },
    { key: "purchase", label: "Приход", icon: "📥", color: "from-green-500 to-emerald-500" },
    { key: "income", label: "Доход", icon: "💰", color: "from-yellow-500 to-orange-500" },
    { key: "discount", label: "Скидка", icon: "🏷️", color: "from-red-500 to-rose-500" },
    { key: "volume", label: "Объём (м³)", icon: "📦", color: "from-indigo-500 to-purple-500" },
    { key: "weight", label: "Вес (кг)", icon: "⚖️", color: "from-teal-500 to-cyan-500" },
    { key: "dimensions", label: "Размеры", icon: "📏", color: "from-amber-500 to-yellow-500" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
        {columns.map(({ key, label, icon, color }) => (
          <label
            key={key}
            className={`
                group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer select-none
                transition-all duration-300 ease-out transform
                hover:scale-105 hover:shadow-lg hover:-translate-y-1
                ${
                  visibleColumns[key]
                    ? `bg-gradient-to-br ${color.replace("500", "500/20")} border-2 border-current shadow-lg`
                    : "bg-white/60 dark:bg-gray-700/60 border-2 border-gray-200/50 dark:border-gray-600/50 hover:border-teal-300/60"
                }
              `}
            onMouseEnter={() => setHoveredItem(key)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              borderColor: visibleColumns[key]
                ? `rgb(${
                    color.includes("blue")
                      ? "59 130 246"
                      : color.includes("purple")
                      ? "147 51 234"
                      : color.includes("green")
                      ? "34 197 94"
                      : color.includes("yellow")
                      ? "245 158 11"
                      : color.includes("red")
                      ? "239 68 68"
                      : color.includes("indigo")
                      ? "99 102 241"
                      : color.includes("teal")
                      ? "20 184 166"
                      : "245 158 11"
                  } / 0.6)`
                : undefined,
            }}
          >
            {/* Ripple effect */}
            <div
              className={`
                absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500
                bg-gradient-to-br from-teal-400/20 via-cyan-400/20 to-blue-400/20
                animate-pulse
              `}
            ></div>

            {/* Custom toggle switch */}
            <div className="relative">
              <input
                type="checkbox"
                checked={visibleColumns[key]}
                onChange={(e) =>
                  setVisibleColumns((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
                className="sr-only"
              />
              <div
                className={`
                  w-12 h-6 rounded-full transition-all duration-300 relative
                  ${visibleColumns[key] ? `bg-gradient-to-r ${color} shadow-lg` : "bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500"}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 transform
                    ${visibleColumns[key] ? "translate-x-6" : "translate-x-0.5"}
                  `}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {visibleColumns[key] ? (
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Icon and label */}
            <div className="relative flex items-center gap-2 flex-1">
              <span
                className={`
                  text-xl transition-transform duration-300
                  ${hoveredItem === key ? "animate-bounce scale-110" : ""}
                `}
              >
                {icon}
              </span>
              <span
                className={`
                  font-medium transition-all duration-300
                  ${visibleColumns[key] ? "text-gray-800 dark:text-white font-semibold" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"}
                `}
              >
                {label}
              </span>
            </div>

            {/* Shimmer effect for active items */}
            {visibleColumns[key] && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000"></div>
              </div>
            )}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {/* Кнопка "Скрыть всё" */}
        <button
          onClick={() => setVisibleColumns(userVisibleColumns)}
          type="button"
          className="
      group relative flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-4
      bg-gradient-to-r from-red-500 via-pink-500 to-rose-500
      text-white font-bold rounded-2xl shadow-xl
      hover:shadow-2xl active:scale-95 transform transition-all duration-300 overflow-hidden
      text-sm sm:text-lg
    "
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <div className="relative flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg sm:text-xl">🚫</span>
            </div>
            <span>Скрыть всё</span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>

        {/* Кнопка "Показать всё" */}
        <button
          onClick={() => setVisibleColumns(adminVisibleColumns)}
          type="button"
          className="
      group relative flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-4
      bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
      text-white font-bold rounded-2xl shadow-xl
      hover:shadow-2xl active:scale-95 transform transition-all duration-300 overflow-hidden
      text-sm sm:text-lg
    "
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          <div className="relative flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg sm:text-xl">👁️</span>
            </div>
            <span>Показать всё</span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
      
    </div>
  );
};

export default SettingVisible;
