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
    const next = activeCols.includes(col) ? activeCols.filter((c) => c !== col) : [...activeCols, col];

    setSearchParams({ cols: next.join(",") });
  };

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-3">
      <div className="mb-3 flex items-center justify-center gap-2 text-gray-300">
        <Eye size={16} />
        <span className="text-xs uppercase tracking-wide">Колонки</span>
      </div>

      <div className="space-y-2">
        {[
          { label: "Цена", value: "price" },
          { label: "Сумма", value: "total_price" },
          { label: "Кг", value: "weight" },
          { label: "Куб", value: "volume" },
        ].map((p) => (
          <label
            key={p.value}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1
                       text-sm text-gray-300 hover:bg-gray-800"
          >
            <input
              type="checkbox"
              checked={activeCols.includes(p.value)}
              onChange={() => toggleColumn(p.value)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-800
                         text-blue-600 focus:ring-1 focus:ring-blue-500"
            />
            {p.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ShowHideColums;
