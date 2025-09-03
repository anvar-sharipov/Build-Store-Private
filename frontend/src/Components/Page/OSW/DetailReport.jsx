import { formatNumber } from "../../UI/formatNumber";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useTranslation } from "react-i18next";

const DetailReport = ({ openModal, detailReport, setOpenModal, detailReportTotal, saldoTotal }) => {
  const { t } = useTranslation();
  console.log("detailReportTotal", detailReportTotal);
  console.log("detailReportTotal[openModal.account]", detailReportTotal[openModal.account]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-center dark:print:!text-black dark:text-gray-200">
        {t("osw")} {t("po schyotu")} {openModal.account}
      </h2>
      <div className="flex justify-end">
        <IoMdArrowRoundBack
          onClick={() => setOpenModal({ state: false, account: null })}
          className="
            cursor-pointer 
            text-gray-600 
            hover:text-white 
            bg-gray-200 
            hover:bg-blue-500 
            rounded-full 
            p-2 
            transition 
            duration-300 
            shadow-md
            print:hidden
            "
          size={28} // размер иконки
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-2 print:bg-white print:shadow-none print:p-0 mt-3">
        <table className="min-w-full table-auto border-collapse text-xs print:table-fixed print:border print:border-black">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:bg-white print:!text-black">
              <th className="px-2 py-1 border"></th>
              <th colSpan={2} className="px-2 py-1 border">
                {t("saldo start")}
              </th>
              <th colSpan={2} className="px-2 py-1 border">
                {t("oborot za periud")}
              </th>
              <th colSpan={2} className="px-2 py-1 border">
                {t("saldo end")}
              </th>
            </tr>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <th className="px-2 py-1 border">Субкнто</th>
              <th className="px-2 py-1 border">Дт</th>
              <th className="px-2 py-1 border">Кт</th>
              <th className="px-2 py-1 border">Дт</th>
              <th className="px-2 py-1 border">Кт</th>
              <th className="px-2 py-1 border">Дт</th>
              <th className="px-2 py-1 border">Кт</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(detailReport[openModal.account] || {}).map(([partner, row], idx) => (
              <tr key={idx} className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white hover:bg-indigo-200 dark:hover:bg-indigo-500 cursor-pointer">
                <td className="px-2 py-1 border">{partner}</td>
                <td className="px-2 py-1 border">{row.debit_start != 0 ? formatNumber(row.debit_start) : "-"}</td>
                <td className="px-2 py-1 border">{row.credit_start != 0 ? formatNumber(row.credit_start) : "-"}</td>
                <td className="px-2 py-1 border">{row.debit_oborot != 0 ? formatNumber(row.debit_oborot) : "-"}</td>
                <td className="px-2 py-1 border">{row.credit_oborot != 0 ? formatNumber(row.credit_oborot) : "-"}</td>
                <td className="px-2 py-1 border">{row.debit_end != 0 ? formatNumber(row.debit_end) : "-"}</td>
                <td className="px-2 py-1 border">{row.credit_end != 0 ? formatNumber(row.credit_end) : "-"}</td>
              </tr>
            ))}

            {/* Итого */}
            <tr className="font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
              <td className="px-2 py-1 border">Итого</td>
              <td className="px-2 py-1 border">{detailReportTotal[openModal.account].start_summ_debit != 0 ? formatNumber(detailReportTotal[openModal.account].start_summ_debit) : "-"}</td>
              <td className="px-2 py-1 border">{detailReportTotal[openModal.account].start_summ_credit != 0 ? formatNumber(detailReportTotal[openModal.account].start_summ_credit) : "-"}</td>
              <td className="px-2 py-1 border">{detailReportTotal[openModal.account].oborot_summ_debit != 0 ? formatNumber(detailReportTotal[openModal.account].oborot_summ_debit) : "-"}</td>
              <td className="px-2 py-1 border">{detailReportTotal[openModal.account].oborot_summ_credit != 0 ? formatNumber(detailReportTotal[openModal.account].oborot_summ_credit) : "-"}</td>
              <td className="px-2 py-1 border">{detailReportTotal[openModal.account].end_summ_debit != 0 ? formatNumber(detailReportTotal[openModal.account].end_summ_debit) : "-"}</td>
              <td className="px-2 py-1 border">{detailReportTotal[openModal.account].end_summ_credit != 0 ? formatNumber(detailReportTotal[openModal.account].end_summ_credit) : "-"}</td>
            </tr>

            {/* Сальдо */}
            <tr className="font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
              <td className="px-2 py-1 border">Сальдо</td>
              <td className="px-2 py-1 border">{saldoTotal[openModal.account].start_saldo_debit != 0 ? formatNumber(saldoTotal[openModal.account].start_saldo_debit) : "-"}</td>
              <td className="px-2 py-1 border">{saldoTotal[openModal.account].start_saldo_credit != 0 ? formatNumber(saldoTotal[openModal.account].start_saldo_credit) : "-"}</td>
              <td className="px-2 py-1 border">{saldoTotal[openModal.account].oborot_saldo_debit != 0 ? formatNumber(saldoTotal[openModal.account].oborot_saldo_debit) : "-"}</td>
              <td className="px-2 py-1 border">{saldoTotal[openModal.account].oborot_saldo_credit != 0 ? formatNumber(saldoTotal[openModal.account].oborot_saldo_credit) : "-"}</td>
              <td className="px-2 py-1 border">{saldoTotal[openModal.account].end_saldo_debit != 0 ? formatNumber(saldoTotal[openModal.account].end_saldo_debit) : "-"}</td>
              <td className="px-2 py-1 border">{saldoTotal[openModal.account].end_saldo_credit != 0 ? formatNumber(saldoTotal[openModal.account].end_saldo_credit) : "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailReport;
