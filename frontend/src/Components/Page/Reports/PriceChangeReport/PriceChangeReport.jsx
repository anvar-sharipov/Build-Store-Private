import React, { useState, useContext, useEffect } from "react";
import myAxios from "../../../axios";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../../AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../routes";
import { DateContext } from "../../../UI/DateProvider";

const PriceChangeReport = () => {
  const { authUser, authGroup } = useContext(AuthContext);
  const { dateFrom, setDateFrom, dateTo, setDateTo } = useContext(DateContext);

//   const today = new Date().toISOString().split("T")[0];
//   const [startDate, setStartDate] = useState(() => localStorage.getItem("dateFrom") || today);
//   const [endDate, setEndDate] = useState(() => localStorage.getItem("dateTo") || today);
//   useEffect(() => {
//   function handleStorageChange(e) {
//     if (e.key === "dateFrom") setStartDate(e.newValue);
//     if (e.key === "dateTo") setEndDate(e.newValue);
//   }

//   window.addEventListener("storage", handleStorageChange);
//   return () => window.removeEventListener("storage", handleStorageChange);
// }, []);
  

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [priceType, setPriceType] = useState("wholesale");

  const navigate = useNavigate();

  const VALID_PRICE_TYPES = [
    { value: "purchase", label: t("purchase_price") },
    { value: "retail", label: t("retail_price") },
    { value: "wholesale", label: t("wholesale_price") },
  ];

  const isValidDate = (dateStr) => {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  };

  const isDatesValid = isValidDate(dateFrom) && isValidDate(dateTo);

  const fetchReport = async () => {
    if (!isDatesValid) return;
    setLoading(true);
    try {
      const response = await myAxios.get("/price-change-report/", {
        params: {
          start_date: dateFrom,
          end_date: dateTo,
          price_type: priceType,
        },
      });
      setReport(response.data);
    } catch (error) {
      console.error(t("load_error"), error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    if (!isDatesValid) return;

    const token = localStorage.getItem("access");
    if (!token) {
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      const response = await myAxios.get(`/price-change-report/excel/?start_date=${dateFrom}&end_date=${dateTo}&price_type=${priceType}`, { responseType: "blob" });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "price_change_report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Ошибка при скачивании отчета", error);
    }
  };

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      navigate(ROUTES.LOGIN, {
        state: {
          message: t("youDidntAuthenticated"),
          type: "error",
        },
      });
      return;
    }
    if (authGroup !== "admin") {
      navigate(ROUTES.LOGIN, {
        state: {
          message: t("errorAccessReport"),
          type: "error",
        },
      });
    }
  }, [authGroup, navigate, t]);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 dark:text-white min-h-screen print:min-h-0">
      <button
        onClick={downloadExcel}
        disabled={!isDatesValid}
        className={`px-4 py-1 rounded mb-4 print:hidden text-white ${isDatesValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
      >
        {t("download_excel")}
      </button>

      <h2 className="text-xl font-bold mb-4 print:text-center print:text-black">{t("report_title")}</h2>

      <div className="mb-4 flex gap-2 print:flex print:justify-center print:items-center">
        <input type="date" className="border px-2 py-1 bg-white dark:bg-gray-700 dark:text-white print:!text-black hidden print:block" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} disabled={true} />
        <input type="date" className="border px-2 py-1 bg-white dark:bg-gray-700 dark:text-white print:!text-black hidden print:block" value={dateTo} onChange={(e) => setDateTo(e.target.value)} disabled={true} />
        <select className="border px-2 py-1 bg-white dark:bg-gray-700 dark:text-white print:!text-black" value={priceType} onChange={(e) => setPriceType(e.target.value)}>
          {VALID_PRICE_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={fetchReport}
          disabled={!isDatesValid}
          className={`px-4 py-1 rounded text-white print:hidden ${isDatesValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          {t("show")}
        </button>
      </div>

      {loading && <p>{t("loading")}</p>}

      {report.length > 0 && (
        <table className="w-full border border-gray-400 text-sm text-center print:border print:border-gray-700 print:border-collapse print:table-fixed">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 print:bg-white print:text-black print:font-bold">
              <th className="border border-gray-400 px-2 py-1">#</th>
              <th className="border border-gray-400 px-2 py-1">{t("product")}</th>
              <th className="border border-gray-400 px-2 py-1">{t("unit")}</th>
              <th className="border border-gray-400 px-2 py-1">{t("old_price")}</th>
              <th className="border border-gray-400 px-2 py-1">{t("quantity")}</th>
              <th className="border border-gray-400 px-2 py-1">{t("old_sum")}</th>
              <th className="border border-gray-400 px-2 py-1">{t("new_price")}</th>
              <th className="border border-gray-400 px-2 py-1">{t("quantity")}</th>
              <th className="border border-gray-400 px-2 py-1">{t("new_sum")}</th>
              <th className="border border-gray-400 px-2 py-1 text-red-600 dark:text-red-400 print:text-black">{t("loss")}</th>
              <th className="border border-gray-400 px-2 py-1 text-green-600 dark:text-green-400 print:text-black">{t("profit")}</th>
            </tr>
          </thead>
          <tbody>
            {report.map((row, i) => {
              const oldTotal = parseFloat(row.old_price) * parseFloat(row.quantity_at_change);
              const newTotal = parseFloat(row.new_price) * parseFloat(row.quantity_at_change);
              const diff = parseFloat(row.difference);
              return (
                <tr key={i} className="border border-gray-400 print:text-black">
                  <td className="border border-gray-400 px-2 py-1">{i + 1}</td>
                  <td className="border border-gray-400 px-2 py-1">{row.product_name}</td>
                  <td className="border border-gray-400 px-2 py-1">{row.product_unit}</td>
                  <td className="border border-gray-400 px-2 py-1">{row.old_price}</td>
                  <td className="border border-gray-400 px-2 py-1">{row.quantity_at_change}</td>
                  <td className="border border-gray-400 px-2 py-1">{oldTotal.toFixed(2)}</td>
                  <td className="border border-gray-400 px-2 py-1">{row.new_price}</td>
                  <td className="border border-gray-400 px-2 py-1">{row.quantity_at_change}</td>
                  <td className="border border-gray-400 px-2 py-1">{newTotal.toFixed(2)}</td>
                  <td className="border border-gray-400 px-2 py-1 text-red-600 dark:text-red-400 print:text-black">{diff < 0 ? diff.toFixed(2) : "-"}</td>
                  <td className="border border-gray-400 px-2 py-1 text-green-600 dark:text-green-400 print:text-black">{diff > 0 ? diff.toFixed(2) : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PriceChangeReport;
