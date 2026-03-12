import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import myAxios from "../../../axios";
import { DateContext } from "../../../UI/DateProvider";
import { useEffect, useState, useContext } from "react";
import { useNotification } from "../../../context/NotificationContext";
import { useDispatch } from "react-redux";
import { resetUniversalFilter } from "../../../../app/store/universalFilterSlice";
import LoadingSpin from "../../../UI/LoadingSpin";
import MyFormatDate from "../../../UI/MyFormatDate";
import { formatNumber2 } from "../../../UI/formatNumber2";
import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";

const UniversalFilter = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const { showNotification } = useNotification();
  const { warehouses, partners, products, consolidated, warehouses2 } = useSelector((state) => state.fakturaFilter);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(false);
  const [tableType, setTableType] = useState(false);
  const [grandTotal, setGrandTotal] = useState(false);

  const dispatch = useDispatch();

  const fakturaTypes = useSelector((state) => state.fakturaFilter.faktura_type);

  useEffect(() => {
    document.title = t("universal filter");
  }, [t]);

  useEffect(() => {
    return () => {
      dispatch(resetUniversalFilter());
    };
  }, [dispatch]);

  useEffect(() => {
    if (fakturaTypes.length === 0) return;

    if (!dateFrom || !dateTo) {
      showNotification(t("invalid diapazon date format"), "error");
      return;
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      showNotification(t("invalid diapazon date format"), "error");
      return;
    }

    if (from > to) {
      showNotification(t("start date cannot be later than end date"), "error");
      return;
    }

    const controller = new AbortController();

    const warehouseIds = warehouses.map((w) => w.id);
    const warehouse2Ids = warehouses2.map((w) => w.id);
    const partnerIds = partners.map((p) => p.id);
    const productIds = products.map((p) => p.id);
    // console.log("warehouses", warehouses);
    // console.log("warehouseIds", warehouseIds);
    console.log("consolidated", consolidated);

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await myAxios.get("universal_faktura_filter", {
          params: {
            dateFrom,
            dateTo,
            fakturaTypes,
            warehouseIds,
            warehouse2Ids,
            partnerIds,
            productIds,
            consolidated,
          },
          signal: controller.signal, // 👈 важно
        });

        console.log("res =", res);
        setData(res.data.data);
        setTableType(res.data.table_type);
        setGrandTotal(res.data.grand_total);
      } catch (err) {
        if (err.name === "CanceledError") {
          console.log("Request canceled");
        } else {
          console.error(err.response.data.message);
          showNotification(t(err.response.data.message), "info");
        }
      } finally {
        setLoading(false);
      }
    }, 500); // 👈 задержка 500ms

    return () => {
      clearTimeout(timeout); // отменяем debounce
      controller.abort(); // отменяем прошлый запрос
    };
  }, [fakturaTypes, dateFrom, dateTo, warehouses, warehouses2, partners, products, consolidated]);

  const typeLabels = {
    prihod: { label: t("prihod"), color: "text-green-600" },
    rashod: { label: t("rashod"), color: "text-blue-600" },
    wozwrat: { label: t("wozwrat"), color: "text-red-600" },
    transfer: { label: t("transfer"), color: "text-purple-600" },
  };

  console.log("tableType", tableType);

  return (
    <div>
      <div className="text-center text-2xl print:text-xl font-bold text-zinc-800 dark:text-zinc-100 print:text-black">{t("universal filter")}</div>
      <div className="text-center text-lg print:text-sm text-zinc-800 dark:text-zinc-100 print:text-black">
        {t("Period s")} {MyFormatDate(dateFrom)} {t("po")} {MyFormatDate(dateTo)}
      </div>

      {/* <div className="mt-4 print:mt-2 print:hidden">
        НЕТ ФИЛЬТРОВ
        {fakturaTypes.length === 0 && warehouses.length === 0 && partners.length === 0 && products.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm print:text-black">
            {t("active filters")}: {t("no")}
          </div>
        )}

        ТИПЫ ФАКТУР
        {fakturaTypes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {fakturaTypes.map((type) => (
              <span
                key={`type-${type}`}
                className={`
            px-3 py-1 rounded-full border text-sm font-medium
            bg-gray-100 border-gray-300 text-gray-800
            dark:bg-zinc-800 dark:border-zinc-600 dark:text-gray-200
            print:bg-white print:border-black print:text-black
            ${typeLabels[type].color}
          `}
              >
                {typeLabels[type].label}
              </span>
            ))}
          </div>
        )}

        СКЛАДЫ — ВСЕГДА НИЖЕ
        {warehouses.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {warehouses.map((w) => (
              <span
                key={`warehouse-${w.id}`}
                className="
            px-3 py-1 rounded-full border text-sm font-medium
            bg-yellow-100 border-yellow-300 text-yellow-800
            dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200
            print:bg-white print:border-black print:text-black
          "
              >
                🏬 {w.name}
              </span>
            ))}
          </div>
        )}

        ПАРТНЕРЫ
        {partners.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {partners.map((p) => (
              <span
                key={`partner-${p.id}`}
                className="
          px-3 py-1 rounded-full border text-sm font-medium
          bg-blue-100 border-blue-300 text-blue-800
          dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200
          print:bg-white print:border-black print:text-black
        "
              >
                👤 {p.name}
              </span>
            ))}
          </div>
        )}

        ПРОДУКТЫ
        {products.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {products.map((p) => (
              <span
                key={`product-${p.id}`}
                className="
          px-3 py-1 rounded-full border text-sm font-medium
          bg-green-100 border-green-300 text-green-800
          dark:bg-green-900 dark:border-green-700 dark:text-green-200
          print:bg-white print:border-black print:text-black
        "
              >
                📦 {p.name}
              </span>
            ))}
          </div>
        )}
      </div> */}

      <div className="hidden print:block text-sm print:!text-black mt-2">
        {/* НЕТ ФИЛЬТРОВ */}
        {fakturaTypes.length === 0 && warehouses.length === 0 && partners.length === 0 && products.length === 0 && dateFrom && dateTo && (
          <div className="grid grid-cols-[150px_1fr] gap-y-1 print:hidden">
            <div className="font-semibold">{t("active filters")}:</div>
            <div>{t("no")}</div>
          </div>
        )}

        <div className="grid grid-cols-[180px_1fr] gap-y-1">
          {/* ТИПЫ ФАКТУР */}
          {fakturaTypes.length > 0 && (
            <>
              <div className="font-semibold">{t("type faktura")}:</div>
              <div>
                {fakturaTypes.map((type, index) => (
                  <span key={type}>
                    {typeLabels[type].label}
                    {index !== fakturaTypes.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </>
          )}
          {/* ТИПЫ ФАКТУР */}

          <>
            <div className="font-semibold">{t("report type")}:</div>
            <div>{consolidated ? <span>{t("consolidated")}</span> : <span>{t("not consolidated")}</span>}</div>
          </>

          {/* СКЛАДЫ */}
          {warehouses.length > 0 && warehouses2.length === 0 && (
            <>
              <div className="font-semibold">{t("warehouses")}:</div>
              <div>
                {warehouses.map((w, index) => (
                  <span key={w.id}>
                    {w.name}
                    {index !== warehouses.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* СО СКЛАДА НА СКЛАД */}
          {warehouses.length > 0 && warehouses2.length > 0 && (
            <>
              <div className="font-semibold">{t("from warehouse")}:</div>
              <div className="flex flex-col">
                {warehouses.map((w) => (
                  <span key={w.id}>{w.name}</span>
                ))}
              </div>

              <div className="font-semibold">{t("to warehouse")}:</div>
              <div className="flex flex-col">
                {warehouses2.map((w) => (
                  <span key={w.id}>{w.name}</span>
                ))}
              </div>
            </>
          )}

          {/* ПАРТНЕРЫ */}
          {partners.length > 0 && (
            <>
              <div className="font-semibold">{t("partners")}:</div>
              <div>
                {partners.map((p, index) => (
                  <span key={p.id}>
                    {p.name}
                    {index !== partners.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* ПРОДУКТЫ */}
          {products.length > 0 && (
            <>
              <div className="font-semibold">{t("products")}:</div>
              <div>
                {products.map((p, index) => (
                  <span key={p.id}>
                    {p.name}
                    {index !== products.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpin />
      ) : (
        <div>
          {data.length > 0 && fakturaTypes.length > 0 ? (
            <div>
              {tableType === "only_product" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование клиента</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма продажи</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_product_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование клиента</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма продажи</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_product_prihod_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-left">Поставщик</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма закупки</th>

                        {/* <th className="border border-gray-300 px-2 py-1 text-right">Разница</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          {/* <td className="border border-gray-300 px-2 py-1 text-right">{row.profit}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1 text-right">{row.difference}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.profit}</td> */}
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.difference}</td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_product_prihod" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Поставщик</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма закупки</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          {/* <td className="border border-gray-300 px-2 py-1 text-right">{row.profit}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{row.difference}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.profit}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.difference}</td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_product_wozwrat" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование клиента</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма возврата</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_product_wozwrat_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование клиента</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма возврата</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_partner_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование Товара</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_partner" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование Товара</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_partner_prihod_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование Товара</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма закупки</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-right">Разница</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          {/* <td className="border border-gray-300 px-2 py-1 text-right">{row.profit}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1 text-right">{row.difference}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.profit}</td> */}
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.difference}</td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_partner_prihod" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование Товара</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма закупки</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight, 2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_partner_wozwrat_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование товара</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма возврата</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_partner_wozwrat" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование товара</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма возврата</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "and_partner_and_product_rashod_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Тип</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{t(row.type)}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td> */}
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "and_partner_and_product_rashod" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "and_partner_and_product_prihod_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Поставщик</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма закупки</th>

                        {/* <th className="border border-gray-300 px-2 py-1 text-right">Разница</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{row.partner}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          {/* <td className="border border-gray-300 px-2 py-1 text-right">{row.profit}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1 text-right">{row.difference}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right"></td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.profit}</td> */}
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.difference}</td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "and_partner_and_product_prihod" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Поставщик</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма закупки</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{row.partner}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          {/* <td className="border border-gray-300 px-2 py-1 text-right">{row.profit}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{row.difference}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        {/* <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.profit}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{grandTotal.difference}</td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "and_partner_and_product_wozwrat_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Наименование товара</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма возврата</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{row.product}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td> */}
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "and_partner_and_product_wozwrat" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Наименование товара</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма возврата</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{row.product}</td> */}

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "not_partner_and_not_product_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Дата</th> */}
                        {/* <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th> */}
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование товара</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма возврата</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          {/* <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td> */}

                          {/* <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td> */}

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        {/* <td className="border border-gray-300 px-2 py-1"></td> */}
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "not_partner_and_not_product" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование Партнера</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Наименование товара</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Средняя цена</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>
                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.price)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.summ)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.profit)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.difference)}</td>
                        <td className="border border-gray-300 px-2 py-1 font-bold text-right whitespace-nowrap">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "not_partner_and_not_product_multi_type_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Тип</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Товар</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_type}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1"></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.summ)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.profit)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.difference)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "not_partner_and_not_product_multi_type" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Тип</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Партнер</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Товар</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Сумма</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Прибыль</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Разница</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{t(row.invoice_type)}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.partner}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.sale_sum)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.profit)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.difference)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td colSpan={6} className="border border-gray-300 px-2 py-1 font-bold text-right">
                          Итого:
                        </td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.summ)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.profit)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.difference)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "transfer_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Товар</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td></td>
                        <td className="border border-gray-300 px-2 py-1 font-bold">Итого:</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "transfer_detailed" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Откуда</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Куда</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Товар</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.from_warehouse}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.to_warehouse}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.product}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td colSpan={6} className="border border-gray-300 px-2 py-1 font-bold text-right">
                          Итого:
                        </td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_product_transfer_consolidated" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Откуда</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Куда</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.from_warehouse}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.to_warehouse}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td colSpan={3} className="border border-gray-300 px-2 py-1 font-bold text-right">
                          Итого:
                        </td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {tableType === "only_product_transfer" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-center w-12">№</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Дата</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Фактура №</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Откуда</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">Куда</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">Количество</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">КГ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>

                          <td className="border border-gray-300 px-2 py-1">{MyFormatDate(row.date)}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.invoice_id}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.from_warehouse}</td>

                          <td className="border border-gray-300 px-2 py-1">{row.to_warehouse}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.selected_quantity, 0)}</td>

                          <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber2(row.kg)}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td colSpan={5} className="border border-gray-300 px-2 py-1 font-bold text-right">
                          Итого:
                        </td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.qty, 0)}</td>

                        <td className="border border-gray-300 px-2 py-1 font-bold text-right">{formatNumber2(grandTotal.weight)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="print:hidden flex items-center justify-center py-20">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
                {/* Glow background */}
                <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-full"></div>

                {/* Card */}
                <div className="relative backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl px-12 py-14 text-center max-w-md">
                  {/* Animated icon */}
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 120 }} className="flex justify-center mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                      <PackageOpen className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">{t("no data")}</h3>

                  {/* Subtitle */}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("try adjusting filters or date range")}</p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalFilter;
