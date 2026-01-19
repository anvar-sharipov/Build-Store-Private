import { useEffect, useState, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Warehouse } from "lucide-react";
import myAxios from "../../../axios";
import { useNotification } from "../../../context/NotificationContext";
import { useTranslation } from "react-i18next";
import { DateContext } from "../../../UI/DateProvider";
import MyFormatDate from "../../../UI/MyFormatDate";
import { formatNumber2 } from "../../../UI/formatNumber2";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const DetailProductOborot = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { dateFrom, dateTo } = useContext(DateContext);

  const [detailOborot, setDetailOborot] = useState(null);
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);

  useEffect(() => {
    if (!detailOborot?.product_name) return;
    document.title = `${t("card")} ${detailOborot.product_name}`;
  }, [t]);
  console.log("detailOborot", detailOborot);

  // Получаем параметры из URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const warehousesParam = searchParams.get("warehouses");

    if (warehousesParam) {
      setSelectedWarehouses(warehousesParam.split(","));
    }
  }, [location.search]);

  const handleOpenInvoice = async (id) => {
    const url = id ? `/purchase-invoices/update/${id}` : ROUTES.PURCHASE_INVOICE_CREATE;
    window.open(url, "invoiceWindow", "width=1000,height=700,scrollbars=yes,resizable=yes");
  };

  const minusOneDay = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d;
  };

  useEffect(() => {
    if (!id || selectedWarehouses.length === 0) return;

    const fetchData = async () => {
      try {
        const res = await myAxios.get(`product_buh_oborot_detail/${id}/`, {
          params: {
            dateFrom,
            dateTo,
            warehouses: selectedWarehouses.join(","),
          },
        });
        setDetailOborot(res.data.data);
      } catch (err) {
        console.error(err);
        showNotification(t(err?.response?.data?.message || "Error"), "error");
      }
    };

    fetchData();
  }, [id, dateFrom, dateTo, selectedWarehouses]);

  if (!detailOborot) {
    return <div className="text-center py-10 text-gray-500">{selectedWarehouses.length === 0 ? "Выберите склад(ы) для просмотра деталей" : "Загрузка данных..."}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="
        space-y-4
        rounded-xl
        border
        bg-white
        dark:bg-zinc-900
        border-zinc-200 dark:border-zinc-800
        p-4
        shadow-sm
      "
    >
      {/* ================= HEADER ================= */}
      <div className="flex gap-4 items-start">
        <img
          src={`${BASE_URL}${detailOborot.image}`}
          alt={detailOborot.product_name}
          className="
            w-20 h-20 object-contain
            rounded-lg
            border
            bg-white
            dark:bg-zinc-800
            border-zinc-200 dark:border-zinc-700
          "
        />

        <div className="flex-1 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Package className="w-4 h-4" />
            {detailOborot.product_name}
          </div>

          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 opacity-60" />
            {selectedWarehouses.length === 1 ? (
              <span>{detailOborot.warehouse_name}</span>
            ) : (
              <div>
                <span className="font-medium">Выбрано складов: {selectedWarehouses.length}</span>
                <div className="text-[10px] text-zinc-500 mt-1">
                  {selectedWarehouses.map((id, index) => (
                    <span key={id} className="mr-2">
                      {detailOborot.warehouses && detailOborot.warehouses[id] ? detailOborot.warehouses[id].name : `Склад ${id}`}
                      {index < selectedWarehouses.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div>
              <b>ID:</b> {detailOborot.product_id}
            </div>
            <div>
              <b>{t("unit")}:</b> {detailOborot.product_unit}
            </div>
            <div>
              <b>{t("wholesale_price")}:</b> {formatNumber2(detailOborot.product_wholesale_price)}
            </div>
            <div>
              <b>{t("retail_price")}:</b> {formatNumber2(detailOborot.product_retail_price)}
            </div>
          </div>

          <div className="pt-1 text-[11px] text-zinc-500">
            {t("Period")}: {MyFormatDate(dateFrom)} – {MyFormatDate(dateTo)}
          </div>

          {/* Отображение данных по каждому складу, если их несколько */}
          {selectedWarehouses.length > 1 && detailOborot.warehouses && (
            <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <div className="font-medium text-[11px] mb-1">Данные по складам:</div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {selectedWarehouses.map((whId) => {
                  const whData = detailOborot.warehouses[whId];
                  if (!whData) return null;

                  return (
                    <div key={whId} className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                      <div className="font-medium">{whData.name}</div>
                      <div>Начало: {whData.start_quantity}</div>
                      <div>Приход: {whData.income_qty}</div>
                      <div>Расход: {whData.outcome_qty}</div>
                      <div className="text-blue-600">Возврат: {whData.return_qty}</div>
                      <div>Конец: {whData.end_quantity}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table
          className="
            w-full
            text-[12px]
            leading-tight
            border-collapse
            border
            border-zinc-200 dark:border-zinc-800
           
            tabular-nums
          "
        >
          <thead className="sticky top-0 z-10">
            <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <th className="border px-2 py-1">№</th>
              <th className="border px-2 py-1">{t("Date")}</th>
              <th className="border px-2 py-1">{t("partner")}</th>
              <th className="border px-2 py-1">{t("comment2")}</th>
              <th className="border px-2 py-1 text-right">{t("Price")}</th>
              <th className="border px-2 py-1 text-center" colSpan={2}>
                {t("prihod")}
              </th>
              <th className="border px-2 py-1 text-center" colSpan={2}>
                {t("wozwrat")}
              </th>
              <th className="border px-2 py-1 text-center" colSpan={2}>
                {t("rashod")}
              </th>
              <th className="border px-2 py-1 text-center" colSpan={2}>
                {t("Closing balance")}
              </th>
            </tr>
            <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
              <th className="border px-2 py-1"></th>
              <th className="border px-2 py-1"></th>
              <th className="border px-2 py-1"></th>
              <th className="border px-2 py-1"></th>
              <th className="border px-2 py-1"></th>
              <th className="border px-2 py-1 text-right whitespace-nowrap">{t("quantity")}</th>
              <th className="border px-2 py-1 text-right whitespace-nowrap">{t("total")}</th>
              <th className="border px-2 py-1 text-right whitespace-nowrap">{t("quantity")}</th>
              <th className="border px-2 py-1 text-right whitespace-nowrap">{t("total")}</th>
              <th className="border px-2 py-1 text-right whitespace-nowrap">{t("quantity")}</th>
              <th className="border px-2 py-1 text-right whitespace-nowrap">{t("total")}</th>
              <th className="border px-2 py-1 text-right whitespace-nowrap">{t("quantity")}</th>
              <th className="border px-2 py-1 text-right whitespace-nowrap">{t("total")}</th>
            </tr>
          </thead>

          <tbody>
            {/* OPENING BALANCE */}
            <tr className="bg-zinc-50 dark:bg-zinc-800 font-semibold">
              <td className="border px-2 py-1"></td>
              <td className="border px-2 py-1">
                {t("Opening balance")} {MyFormatDate(minusOneDay(dateFrom))}
              </td>
              <td colSpan={9} className="border"></td>
              <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.start_quantity, 2)}</td>
              <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.start_quantity * detailOborot.product_wholesale_price)}</td>
            </tr>

            {/* ROWS */}
            {detailOborot.rows &&
              detailOborot.rows.map((r, i) => (
                <tr
                  key={i}
                  className="
                  hover:bg-zinc-100
                  dark:hover:bg-zinc-800
                  transition
                  cursor-pointer
                "
                  onClick={() => handleOpenInvoice(r.invoice_id)}
                >
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">
                    {MyFormatDate(r.date)} {r.invoice_id && `id: ${r.invoice_id}`}
                  </td>
                  <td className="border px-2 py-1">{r.partner || "-"}</td>
                  <td className="border px-2 py-1">{r.text || "-"}</td>
                  <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(r.price)}</td>

                  <td className="border px-2 py-1 text-right text-green-700 dark:text-greed-400 whitespace-nowrap">{formatNumber2(r.income_qty, 2)}</td>
                  <td className="border px-2 py-1 text-right text-green-700 dark:text-greed-400 whitespace-nowrap">{formatNumber2(r.income_sum)}</td>

                  <td className="border px-2 py-1 text-right text-red-700 dark:text-red-400 whitespace-nowrap">{formatNumber2(r.return_qty, 2)}</td>
                  <td className="border px-2 py-1 text-right text-red-700 dark:text-red-400 whitespace-nowrap">{formatNumber2(r.return_sum)}</td>
                  
                  <td className="border px-2 py-1 text-right text-blue-700 dark:text-blue-400 whitespace-nowrap">{formatNumber2(r.outcome_qty, 2)}</td>
                  <td className="border px-2 py-1 text-right text-blue-700 dark:text-blue-400 whitespace-nowrap">{formatNumber2(r.outcome_sum)}</td>

                  <td className="border px-2 py-1 text-right font-medium whitespace-nowrap">{formatNumber2(r.balance_qty, 2)}</td>
                  <td className="border px-2 py-1 text-right font-medium whitespace-nowrap">{formatNumber2(r.balance_sum)}</td>
                </tr>
              ))}

            {/* TURNOVER */}
            <tr className="bg-zinc-100 dark:bg-zinc-900 font-semibold">
              <td className="border px-2 py-1"></td>
              <td className="border px-2 py-1">{t("Total turnover")}</td>
              <td colSpan={3} className="border"></td>
              <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.turnover?.income_qty || 0, 2)}</td>
              <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.turnover?.income_sum || 0)}</td>
              <td className="border px-2 py-1 text-right text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatNumber2(detailOborot.turnover?.return_qty || 0, 2)}</td>
              <td className="border px-2 py-1 text-right text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatNumber2(detailOborot.turnover?.return_sum || 0)}</td>
              <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.turnover?.outcome_qty || 0, 2)}</td>
              <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.turnover?.outcome_sum || 0)}</td>
              
              <td colSpan={2} className="border"></td>
            </tr>

            {/* END BALANCE */}
            <tr className="bg-zinc-100 dark:bg-zinc-900 font-semibold">
              <td className="border px-2 py-1"></td>
              <td className="border px-2 py-1">
                {t("Closing balance")} {MyFormatDate(dateTo)}
              </td>
              <td colSpan={9} className="border"></td>
              <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.end?.quantity || 0, 2)}</td>
              <td className="border px-2 py-1 text-right whitespace-nowrap">{formatNumber2(detailOborot.end?.sum || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DetailProductOborot;
