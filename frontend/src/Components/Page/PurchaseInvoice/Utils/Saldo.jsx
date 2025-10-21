import { useFormikContext } from "formik";
import { MdPrint, MdPrintDisabled } from "react-icons/md";
import myAxios from "../../../axios";
import { ROUTES } from "../../../../routes";
import { useTranslation } from "react-i18next";

const Saldo = ({ saldo, letPrintSaldo, setLetPrintSaldo }) => {
  const { values } = useFormikContext();
  const { t } = useTranslation();

  const handleOpenInvoice = (id) => {
    const url = id ? `/purchase-invoices/update/${id}` : ROUTES.PURCHASE_INVOICE_CREATE;
    window.open(url, "invoiceWindow", "width=1000,height=700,scrollbars=yes,resizable=yes");
  };

  const handleRowClick = async (transactionId) => {
    try {
      const res = await myAxios.get(`transaction_detail/${transactionId}/`);
      if (res.data.invoice_id) {
        handleOpenInvoice(res.data.invoice_id);
      }
    } catch (error) {
      console.log("error при transaction-detail", error);
    }
  };

  if (!saldo) return null;

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-3 p-3 ${letPrintSaldo ? "print:block" : "print:hidden"} print:bg-transparent print:border-0 print:p-0 print:mt-2`}>
      
      {/* Header with Print Icon */}
      <div className="flex items-center justify-center gap-2 mb-3 print:mb-1">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 print:!text-black print:text-xs">
          {t("card")}: {values.partner.name}
        </h2>
        <div className="print:hidden">
          {letPrintSaldo ? (
            <MdPrint
              onClick={() => setLetPrintSaldo((v) => !v)}
              className="w-4 h-4 text-blue-600 dark:text-blue-400 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              title="Скрыть при печати"
            />
          ) : (
            <MdPrintDisabled
              onClick={() => setLetPrintSaldo((v) => !v)}
              className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              title="Показать при печати"
            />
          )}
        </div>
      </div>

      {/* Compact Table USD */}
      <table className="w-full table-auto border-collapse print:text-[10px]">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:bg-white print:!text-black">
            <th colSpan={2} className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">
              {t("Indicator")} USD
            </th>
            <th className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">{t("Debit")}</th>
            <th className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">{t("Credit")}</th>
          </tr>
        </thead>
        <tbody>
          {/* Начало */}
          <tr className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
            <td colSpan={2} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium">
              {t("Opening balance")}
            </td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium text-right">{saldo.start[0]}</td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium text-right">{saldo.start[1]}</td>
          </tr>

          {/* Entries */}
          {saldo.today_entries.length > 0 ? (
            saldo.today_entries.map((e, idx) => (
              <tr
                key={idx}
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white print:cursor-default transition-colors"
                onClick={() => handleRowClick(e[4])}
              >
                <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black">
                  {e[0].split(" ")[0].replace(/-/g, ".")}
                </td>
                <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black">{e[1]}</td>
                <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-right whitespace-pre-line">
                  {parseFloat(e[2]) !== 0 ? e[2] : "-"}
                </td>
                <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-right">
                  {parseFloat(e[3]) !== 0 ? e[3] : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-center">-</td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-center">-</td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-center">-</td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-center">-</td>
            </tr>
          )}

          {/* Итого */}
          <tr className="bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white dark:bg-gray-800">
            <td colSpan={2} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold">
              {t("Total turnover")}
            </td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">{saldo.final[0]}</td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">{saldo.final[1]}</td>
          </tr>

          {/* Конец */}
          <tr className="bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white dark:bg-gray-800">
            <td colSpan={2} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold">
              {t("Closing balance")}
            </td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">
              {parseFloat(saldo.saldo[0]) !== 0 ? saldo.saldo[0] : "-"}
            </td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">
              {parseFloat(saldo.saldo[1]) !== 0 ? saldo.saldo[1] : "-"}
            </td>
          </tr>
        </tbody> 
      </table>

      <br className="py-2" />

      {/* TMT */}
      <table className="w-full table-auto border-collapse print:text-[10px]">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:bg-white print:!text-black">
            <th colSpan={2} className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">
              {t("Indicator")} TMT
            </th>
            <th className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">{t("Debit")}</th>
            <th className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">{t("Credit")}</th>
          </tr>
        </thead>
        <tbody>
          {/* Начало */}
          <tr className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
            <td colSpan={2} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium">
              {t("Opening balance")}
            </td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium text-right">{saldo.start_tmt[0]}</td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium text-right">{saldo.start_tmt[1]}</td>
          </tr>

          {/* Entries */}
          {saldo.today_entries_tmt.length > 0 ? (
            saldo.today_entries_tmt.map((e, idx) => (
              <tr
                key={idx}
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white print:cursor-default transition-colors"
                onClick={() => handleRowClick(e[4])}
              >
                <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black">
                  {e[0].split(" ")[0].replace(/-/g, ".")}
                </td>
                <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black">{e[1]}</td>
                <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-right whitespace-pre-line">
                  {parseFloat(e[2]) !== 0 ? e[2] : "-"}
                </td>
                <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-right">
                  {parseFloat(e[3]) !== 0 ? e[3] : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-center">-</td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-center">-</td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-center">-</td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-center">-</td>
            </tr>
          )}

          {/* Итого */}
          <tr className="bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white dark:bg-gray-800">
            <td colSpan={2} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold">
              {t("Total turnover")}
            </td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">{saldo.final_tmt[0]}</td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">{saldo.final_tmt[1]}</td>
          </tr>

          {/* Конец */}
          <tr className="bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white dark:bg-gray-800">
            <td colSpan={2} className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold">
              {t("Closing balance")}
            </td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">
              {parseFloat(saldo.saldo_tmt[0]) !== 0 ? saldo.saldo_tmt[0] : "-"}
            </td>
            <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">
              {parseFloat(saldo.saldo_tmt[1]) !== 0 ? saldo.saldo_tmt[1] : "-"}
            </td>
          </tr>
        </tbody> 
      </table>

    </div>
  );
};

export default Saldo;