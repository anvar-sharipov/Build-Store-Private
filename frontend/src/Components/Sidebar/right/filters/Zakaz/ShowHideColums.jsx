import { Eye } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const ALL_COLUMNS = ["price", "total_price", "weight", "volume"];
const LS_KEY = "zakaz_visible_columns";

const ShowHideColums = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 📌 из URL
  const rawCols = searchParams.get("cols");
  const urlCols = rawCols !== null ? rawCols.split(",").filter(Boolean) : null;

  // 📌 из localStorage (fallback)
  const savedCols = JSON.parse(localStorage.getItem(LS_KEY) || "null");

  // итоговое состояние
  const activeCols = urlCols !== null ? urlCols : savedCols || ALL_COLUMNS;

  // сохраняем в LS при изменении URL
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(activeCols));
  }, [activeCols]);

  const toggleColumn = (col) => {
    const next = activeCols.includes(col) 
      ? activeCols.filter((c) => c !== col) 
      : [...activeCols, col];

    setSearchParams({ cols: next.join(",") });
  };

  return (
    <div className="mt-3 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/30">
      <div className="mb-3 flex items-center justify-center gap-2 text-gray-300">
        <Eye size={16} className="text-blue-400" />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-300">
          Колонки
        </span>
      </div>

      <div className="space-y-2">
        {[
          { label: "Цена", value: "price", color: "blue" },
          { label: "Сумма", value: "total_price", color: "green" },
          { label: "Кг", value: "weight", color: "red" },
          { label: "Куб", value: "volume", color: "amber" },
        ].map((p) => (
          <div
            key={p.value}
            onClick={() => toggleColumn(p.value)}
            className={`
              group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2
              text-sm transition-all duration-200
              ${activeCols.includes(p.value)
                ? `bg-gradient-to-r from-${p.color}-900/30 to-gray-800/50 border border-${p.color}-700/50`
                : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800 hover:border-gray-600'
              }
              hover:scale-[1.02] active:scale-[0.98]
            `}
          >
            {/* Цветная точка */}
            <div className={`
              w-2 h-2 rounded-full transition-all duration-200
              ${activeCols.includes(p.value)
                ? `bg-gradient-to-r from-${p.color}-400 to-${p.color}-600`
                : 'bg-gradient-to-r from-gray-500 to-gray-600 group-hover:from-gray-400 group-hover:to-gray-500'
              }
            `}></div>
            
            {/* Чекбокс */}
            <div className={`
              flex h-4 w-4 items-center justify-center rounded border transition-all duration-200
              ${activeCols.includes(p.value)
                ? `border-${p.color}-600 bg-${p.color}-900/50`
                : 'border-gray-600 bg-gray-800'
              }
              group-hover:border-gray-500
            `}>
              {activeCols.includes(p.value) && (
                <div className={`h-2 w-2 rounded-sm bg-gradient-to-r from-${p.color}-400 to-${p.color}-500`}></div>
              )}
            </div>
            
            {/* Текст */}
            <span className={`
              text-sm font-medium transition-colors duration-200
              ${activeCols.includes(p.value)
                ? `text-${p.color}-300`
                : 'text-gray-400 group-hover:text-gray-300'
              }
            `}>
              {p.label}
            </span>
          </div>
        ))}
      </div>

      {/* Декоративный элемент */}
      <div className="mt-3 flex items-center justify-center">
        <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      </div>
    </div>
  );
};

export default ShowHideColums;