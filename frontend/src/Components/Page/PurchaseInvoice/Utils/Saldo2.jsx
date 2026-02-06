import React from "react";
import { useFormikContext } from "formik";
import { MdPrint, MdPrintDisabled } from "react-icons/md";
import myAxios from "../../../axios";
import { ROUTES } from "../../../../routes";
import { useTranslation } from "react-i18next";
import { formatNumber2 } from "../../../UI/formatNumber2";

const Saldo2 = ({ saldo2, letPrintSaldo, setLetPrintSaldo }) => {
  const { values } = useFormikContext();
  const { t } = useTranslation();

  console.log("saldo2", saldo2);
  

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

  if (!saldo2) return null;

  // Функция для рендеринга таблицы для каждого счета
  const renderAccountTable = (accountKey, accountName) => {
    const accountData = saldo2[accountKey];
    if (!accountData) return null;

    let start_debit = 0;
    let start_credit = 0;

    const start_saldo = accountData.start[0] - accountData.start[1];

    if (start_saldo > 0) {
      start_debit = start_saldo;
    } else if (start_saldo < 0) {
      start_credit = Math.abs(start_saldo);
    }

    return (
      <div key={accountKey} className="mb-4 print:mb-2 print:w-1/2 print:inline-block print:align-top print:px-1 text-sm">
        <table className="w-full table-auto border-collapse print:text-sm">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:bg-white print:!text-black">
              <th className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">{t("Date")}</th>
              <th className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">{accountName}</th>
              <th className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">{t("Debit")}</th>
              <th className="px-2 py-1 border border-gray-400 dark:border-gray-600 print:border-black font-semibold">{t("Credit")}</th>
            </tr>
          </thead>
          <tbody>
            {/* Начальное сальдо */}
            <tr className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium" colSpan={2}>
                {t("Opening balance")}
              </td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium text-right whitespace-nowrap">{formatNumber2(start_debit)}</td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-medium text-right whitespace-nowrap">{formatNumber2(start_credit)}</td>
            </tr>

            {/* Обороты за день */}
            {accountData.today_entries && accountData.today_entries.length > 0 ? (
              accountData.today_entries.map((e, idx) => (
                <tr
                  key={idx}
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white print:cursor-default transition-colors"
                  onClick={() => handleRowClick(e[4])}
                >
                  <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black whitespace-nowrap">{e[0].split(" ")[0].replace(/-/g, ".")}</td>
                  <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black break-words min-w-[200px]">{e[1]}</td>
                  <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-right whitespace-nowrap">{parseFloat(e[2]) !== 0 ? formatNumber2(e[2]) : "-"}</td>
                  <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black text-right whitespace-nowrap">{parseFloat(e[3]) !== 0 ? formatNumber2(e[3]) : "-"}</td>
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

            {/* Итоговое сальдо */}
            <tr className="bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white dark:bg-gray-800">
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold" colSpan={2}>
                {t("Total turnover")}
              </td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right whitespace-nowrap">{formatNumber2(accountData.final[0])}</td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right whitespace-nowrap">{formatNumber2(accountData.final[1])}</td>
            </tr>

            {/* Конечное сальдо */}
            <tr className="bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-200 print:!text-black print:bg-white dark:bg-gray-800">
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold" colSpan={2}>
                {t("Closing balance")}
              </td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">
                {formatNumber2(accountData.saldo[0], 2) !== 0 ? formatNumber2(accountData.saldo[0]) : "-"}
              </td>
              <td className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 print:border-black font-semibold text-right">
                {formatNumber2(accountData.saldo[1], 2) !== 0 ? formatNumber2(accountData.saldo[1]) : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-3 p-3 ${
        letPrintSaldo ? "print:block" : "print:hidden"
      } print:bg-transparent print:border-0 print:p-0 print:mt-2`}
    >
      {/* Header with Print Icon */}
      <div className="flex items-center justify-center gap-2 mb-3 print:mb-1">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 print:!text-black print:hidden">
          {t("card")}: {values.partner?.name}
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

      {/* Контейнер для карточек */}
      <div className="space-y-4 print:space-y-0 print:flex print:flex-wrap">
        {/* 4 отдельные таблицы для счетов */}
        {renderAccountTable("60_USD", "60 Клиент USD")}
        <div className="hidden">
          {renderAccountTable("62_TMT", "62 Клиент TMT")}
          {values.partner?.type == "founder" && (
            <>
              {renderAccountTable("75_USD", "75 Учредитель USD")}
              {renderAccountTable("76_TMT", "76 Учредитель TMT")}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Saldo2;
