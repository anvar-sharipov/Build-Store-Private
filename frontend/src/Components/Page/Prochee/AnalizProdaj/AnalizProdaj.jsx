import { useEffect, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateContext } from "../../../UI/DateProvider";
import myAxios from "../../../axios";
import { useSelector, useDispatch } from "react-redux";
import { resetAnalizProdajFilters } from "../../../../app/store/analizProdajSlice";
import { AuthContext } from "../../../../AuthContext";

// 📊 4 типа анализа:
// 📦 volume → по количеству
// 💰 revenue → по выручке
// 🏬 stock → залежавшийся товар
// 📉 dynamics → падение относительно прошлого периода

const AnalizProdaj = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const dispatch = useDispatch();
  const { authGroups } = useContext(AuthContext);
  const { warehouses, analyzeBy, comparePrevious } = useSelector((state) => state.analizProdajFilters);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(resetAnalizProdajFilters());
  }, [dispatch]);

  const isAdmin = authGroups?.includes("admin") || false;

  useEffect(() => {
    if (!dateFrom || !dateTo) return;

    const controller = new AbortController();

    const fetchAnalizProdaj = async () => {
      try {
        setLoading(true);

        const res = await myAxios.get("get_analiz_prodaj", {
          params: {
            dateFrom,
            dateTo,
            warehouses: warehouses.map((w) => w.id).join(","),
            analyzeBy,
            comparePrevious,
          },
          signal: controller.signal,
        });

        setData(res.data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalizProdaj();

    return () => controller.abort();
  }, [dateFrom, dateTo, warehouses, analyzeBy, comparePrevious]);

  useEffect(() => {
    document.title = t("sales analysis");
  }, [t]);

  return (
    <div>
      <div className="text-[24px] text-center">{t("sales analysis")}</div>

      {loading && <div>Loading...</div>}

      {data && <div className="mt-4">{/* тут потом KPI карточки */}</div>}

      {data && (
        <div className="mt-6 space-y-6">
          {/* ===== KPI ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded p-4 bg-white shadow-sm">
              <div className="text-sm text-gray-500">Выручка</div>
              <div className="text-xl font-bold">{Number(data.summary.total_sum).toLocaleString()}</div>
            </div>

            <div className="border rounded p-4 bg-white shadow-sm">
              <div className="text-sm text-gray-500">Продано (шт)</div>
              <div className="text-xl font-bold">{Number(data.summary.total_qty).toLocaleString()}</div>
            </div>

            <div className="border rounded p-4 bg-white shadow-sm">
              <div className="text-sm text-gray-500">Средняя фактура</div>
              <div className="text-xl font-bold">{Number(data.summary.avg_check).toLocaleString()}</div>
            </div>

            <div className="border rounded p-4 bg-white shadow-sm">
              <div className="text-sm text-gray-500">Количество фактур</div>
              <div className="text-xl font-bold">{data.summary.invoices_count}</div>
            </div>
          </div>

          {/* ===== ТАБЛИЦА ===== */}
          <div className="overflow-x-auto border rounded shadow-sm bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="px-3 py-2">№</th>
                  <th className="px-3 py-2">Товар</th>
                  <th className="px-3 py-2 text-right">Продано</th>
                  <th className="px-3 py-2 text-right">Выручка</th>
                  {analyzeBy === "stock" && <th className="px-3 py-2 text-right">Остаток</th>}
                </tr>
              </thead>

              <tbody>
                {data.products.map((p, index) => (
                  <tr key={p.product_id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">{p.product_name}</td>
                    <td className="px-3 py-2 text-right">{Number(p.total_qty).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{Number(p.total_sum).toLocaleString()}</td>
                    {analyzeBy === "stock" && <td className="px-3 py-2 text-right">{Number(p.stock_qty).toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-500 text-right">Всего товаров: {data.total_products}</div>
        </div>
      )}
    </div>
  );
};

export default AnalizProdaj;
