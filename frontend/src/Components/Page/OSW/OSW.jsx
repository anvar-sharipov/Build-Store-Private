import { useEffect, useState, useContext } from "react";
import myAxios from "../../axios";
import DetailReport from "./DetailReport";
import Report from "./Report";
import { DateContext } from "../../UI/DateProvider";

const OSW = () => {
  // const [dateFrom, setDateFrom] = useState("");
  // const [dateTo, setDateTo] = useState("");
  const [report, setReport] = useState([]);
  const [detailReport, setDetailReport] = useState([]);
  const [detailReportTotal, setDetailReportTotal] = useState([]);
  const [saldoTotal, setSaldoTotal] = useState([]);
  const [openModal, setOpenModal] = useState({ state: false, account: null });
  const { dateFrom, setDateFrom, dateTo, setDateTo } = useContext(DateContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await myAxios.get("get-osw/", {
        params: { date_from: dateFrom, date_to: dateTo },
      });
      setReport(response.data.report);
      setDetailReport(response.data.detail_report);
      setDetailReportTotal(response.data.detail_report_total)
      setSaldoTotal(response.data.saldo_total)
      
    } catch (error) {
      console.error("Ошибка при запросе OSW:", error);
    }
  };

  // useEffect(() => {
  //   console.log("detailReportTotal useeffect", detailReportTotal);
  // }, [detailReportTotal]);

  // console.log("OPEN MODAL ACCOUNT:", openModal.account);
  // console.log("DETAIL REPORT FOR ACCOUNT:", detailReport[openModal.account]);

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-900">

      <div className="max-w-7xl mx-auto">
        {/* Форма */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 mb-4 print:hidden">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200 text-center hidden">Выберите диапазон дат</h2>
          <form onSubmit={handleSubmit} className="flex justify-around items-end">
            <div className="hidden">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Дата от</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-1 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
            <div className="hidden">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Дата до</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 p-1 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none hidden"
                required
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white py-1 rounded hover:bg-blue-600 transition text-sm dark:bg-blue-600 dark:hover:bg-blue-700 px-4">
              Искать
            </button>
          </form>
        </div>

        {/* Период отчета */}
        {report.length > 0 && (
          <div className="mb-1 print:block hidden text-xs text-gray-700 dark:text-gray-200 print:!text-black">
            Период: {dateFrom} — {dateTo}
          </div>
        )}
      </div>

      {openModal.state ? (
        <DetailReport openModal={openModal} detailReport={detailReport} setOpenModal={setOpenModal} detailReportTotal={detailReportTotal} saldoTotal={saldoTotal} />
      ) : (
        <Report report={report} setOpenModal={setOpenModal} />
      )}

      
    </div>
  );
};

export default OSW;
