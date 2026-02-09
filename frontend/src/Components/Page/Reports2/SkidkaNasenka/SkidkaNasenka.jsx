import { DateContext } from "../../../UI/DateProvider";
import { useContext, useState, useEffect, use } from "react";
import myAxios from "../../../axios";
import { AuthContext } from "../../../../AuthContext";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../context/NotificationContext";
import { Loader2, Warehouse, Users, User, Package } from "lucide-react";
import LoadingSip from "../../../UI/LoadingSpin";
import { useSelector, useDispatch } from "react-redux";
import { resetSkidkaFilters } from "../../../../app/store/skidkaFiltersSlice";
import { motion } from "framer-motion";
import { formatNumber2 } from "../../../UI/formatNumber2";
import MyFormatDate from "../../../UI/MyFormatDate";
import { setPrintExcel } from "../../../../app/store/skidkaFiltersSlice";

const SkidkaNasenka = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { dateFrom, dateTo } = useContext(DateContext);
  const { authGroups } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeWarehouseIndex, setActiveWarehouseIndex] = useState(0);
  const { partners, warehouses, agents, products, users, sortPrice, printExcel } = useSelector((state) => state.skidkaFilters);

  useEffect(() => {
    console.log("partners from page", partners);
  }, [partners]);

  useEffect(() => {
    dispatch(resetSkidkaFilters());
  }, []);

  const isAdmin = authGroups?.includes("admin") || false;

  useEffect(() => {
    document.title = t("skidka_nasenka");
  }, [t]);

  const fetchSkidka = async () => {
    setLoading(true);
    try {
      const res = await myAxios.get("skidka_nasenka/", {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
          partners: partners.map((p) => p.id).join(","),
          warehouses: warehouses.map((w) => w.id).join(","),
          agents: agents.map((a) => a.id).join(","),
          products: products.map((p) => p.id).join(","),
          users: users.map((u) => u.id).join(","),
          sortPrice: sortPrice,
          printExcel: printExcel,
        },
      });
      // console.log("res", res);
      setData(res.data);
      setActiveWarehouseIndex(0); // первый склад активный
    } catch (error) {
      console.error("Error fetching skidka data:", error.response.data.message || error);
      showNotification(t(error.response.data.message || error), "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchExcel = async () => {
    setLoading(true);
    try {
      const res = await myAxios.get("skidka_nasenka/", {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
          partners: partners.map((p) => p.id).join(","),
          warehouses: warehouses.map((w) => w.id).join(","),
          agents: agents.map((a) => a.id).join(","),
          products: products.map((p) => p.id).join(","),
          users: users.map((u) => u.id).join(","),
          sortPrice,
          printExcel: true,
        },
        responseType: "blob", // 🔥 ОБЯЗАТЕЛЬНО
      });

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "skidka_nacenka.xlsx";
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(setPrintExcel(false)); // 👈 сброс ТУТ
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dateFrom || !dateTo || !warehouses?.length) return;
    if (printExcel) {
      fetchExcel();
    } else {
      fetchSkidka();
    }
  }, [dateFrom, dateTo, partners, warehouses, agents, products, users, sortPrice, printExcel]);

  const Stat = ({ label, value }) => (
    <div className="rounded-lg border border-black dark:border-gray-700 p-2 bg-white dark:bg-gray-900 print:border-none">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="font-semibold text-gray-900 dark:text-gray-100">{formatNumber2(value)}</div>
    </div>
  );

  const warehouse = data?.warehouses?.[activeWarehouseIndex];

  return (
    <div className="text-sm text-gray-800 dark:text-gray-200 print:text-[10px] print:!text-black print:!bg-white">
      {warehouses.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-6">
          {/* Warehouses */}
          <div className="min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-sm print:hidden">
            <div className="flex items-center gap-2 font-sm mb-2">
              <Warehouse size={16} />
              {t("choosed warehouses count")}: {warehouses.length}
            </div>

            <ul className="space-y-1">
              {warehouses.map((w, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300">
                  {idx + 1}) {w.name}
                </li>
              ))}
            </ul>
          </div>

          {(partners.length > 0 || agents.length || products.length || users.length > 0) && (
            <div className="flex flex-wrap gap-6">
              {/* Partners */}
              {partners.length > 0 && (
                <div className="min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-sm print:p-1 print:overflow-visible print:rounded-none print:shadow-none print:border-none">
                  <div className="flex items-center gap-2 font-sm mb-2">
                    <Users size={16} />
                    {t("choosed partner count")}: {partners.length}
                  </div>

                  <ul className="space-y-1">
                    {partners.map((p, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300">
                        {idx + 1}) {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Users */}
              {users.length > 0 && (
                <div className="min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-sm print:p-1 print:overflow-visible print:rounded-none print:shadow-none print:border-none">
                  <div className="flex items-center gap-2 font-sm mb-2">
                    <Users size={16} />
                    {t("choosed user count")}: {users.length}
                  </div>

                  <ul className="space-y-1">
                    {users.map((u, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300">
                        {idx + 1}) {u.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Agents */}
              {agents.length > 0 && (
                <div className="min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-sm print:p-1 print:overflow-visible print:rounded-none print:shadow-none print:border-none">
                  <div className="flex items-center gap-2 font-sm mb-2">
                    <User size={16} />
                    {t("choosed agent count")}: {agents.length}
                  </div>

                  <ul className="space-y-1">
                    {agents.map((a, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300">
                        {idx + 1}) {a.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Products */}
              {products.length > 0 && (
                <div className="min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-sm print:p-1 print:overflow-visible print:rounded-none print:shadow-none print:border-none">
                  <div className="flex items-center gap-2 font-sm mb-2">
                    <Package className="w-4 h-4" />
                    {t("choosed product count")}: {products.length}
                  </div>

                  <ul className="space-y-1">
                    {products.map((p, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300">
                        {idx + 1}) {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">{t("youNeedSelectWarehouse")}</div>
      )}

      {/* Loading */}
      {/* {loading ? <LoadingSip /> : <div>tut table doljno byt</div>} */}
      {loading ? (
        <LoadingSip />
      ) : !data || data.warehouses?.length === 0 || warehouses.length === 0 ? (
        // <div className="text-center mt-6">Нет данных</div>
        <div></div>
      ) : (
        <>
          <div className="flex gap-2 mt-6 flex-wrap items-center justify-center">
            <div className="print:block text-[15px]">
              {t("deviation_from_wholesale_price_for")} {MyFormatDate(dateFrom)} - {MyFormatDate(dateTo)}
            </div>
            {data.warehouses.map((w, idx) => (
              <button
                key={w.id}
                onClick={() => setActiveWarehouseIndex(idx)}
                className={`px-3 py-1 rounded-md text-sm border print:p-1 print:overflow-visible print:rounded-none print:shadow-none print:border-none print:text-[15px]
                  ${idx === activeWarehouseIndex ? "bg-blue-600 text-white print:!text-black" : "bg-white dark:bg-gray-900 print:hidden"}
                `}
              >
                🏬 {w.name}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto border rounded-xl print:overflow-visible print:rounded-none print:shadow-none">
            <table className="min-w-full text-sm border-collapse print:text-[10px]">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {["№", "Партнер", "Комментарий", "Товар", "Ед.", "Опт", "Продажа", "Кол-во", "Сумма", "Разница"].map((h) => (
                    <th key={h} className="border border-black dark:border-gray-700 px-2 py-1 text-left print:px-1 print:py-[2px] font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {warehouse.table.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">{i + 1}</td>
                    <td className="border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">{row.partner_name}</td>
                    <td className="border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">
                      №{row.invoice_id} {row.invoice_comment}
                    </td>
                    <td className="border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">{row.product_name}</td>
                    <td className="text-center border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">{row.unit}</td>
                    <td className="text-right border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">{formatNumber2(row.wholesale_price)}</td>
                    <td className="text-right border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">{formatNumber2(row.selected_price)}</td>
                    <td className="text-right border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">{formatNumber2(row.selected_quantity, 0)}</td>
                    <td className="text-right border border-black dark:border-gray-700 px-2 py-1 print:px-1 print:py-[1px] leading-tight">{formatNumber2(row.total_selected_price)}</td>
                    <td
                      className={`px-2 text-right font-semibold border border-black dark:border-gray-700 print:px-1 print:py-[1px] leading-tight ${row.difference < 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      {formatNumber2(row.difference)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 print:grid-cols-5">
            <Stat label={t("revenue")} value={warehouse.total_all_price} />
            <Stat label={t("deviation")} value={warehouse.otkloneniy_wsego} />
            <Stat label={t("discounts")} value={-warehouse.skidki} />
            <Stat label={t("markups")} value={warehouse.nasenki} />
            <Stat label={t("deviation_percent")} value={warehouse.percent} />
          </div>
        </>
      )}
    </div>
  );
};

export default SkidkaNasenka;
