import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { formatNumber } from "../../../UI/formatNumber";

const TFoot = ({ printVisibleColumns, visibleColumns }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext();

//   // считаем итог по общей цене (кол-во * цена)
//   const total = values.products.reduce((acc, p) => {
//     const qty = parseFloat(p.selected_quantity) || 0;
//     const price = parseFloat(p.price) || 0; // у тебя колонка "Цена за шт."
//     return acc + qty * price;
//   }, 0);

  return (
    <tfoot>
      <tr className="dark:bg-gray-900 dark:text-gray-300 bg-gray-200">
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}></th>
        <th className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}>{t("total")}</th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.image ? "hidden" : ""} ${
            !printVisibleColumns.image ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.qr_code ? "hidden" : ""} ${
            !printVisibleColumns.qr_code ? "print:hidden" : ""
          }`}
        ></th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black w-24`}></th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}></th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}></th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}>{formatNumber(values.total_selected_price, 3)}</th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.purchase ? "hidden" : ""} ${
            !printVisibleColumns.purchase ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.purchase ? "hidden" : ""} ${
            !printVisibleColumns.purchase ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.income ? "hidden" : ""} ${
            !printVisibleColumns.income ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.income ? "hidden" : ""} ${
            !printVisibleColumns.income ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.discount ? "hidden" : ""} ${
            !printVisibleColumns.discount ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.discount ? "hidden" : ""} ${
            !printVisibleColumns.discount ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.volume ? "hidden" : ""} ${
            !printVisibleColumns.volume ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.weight ? "hidden" : ""} ${
            !printVisibleColumns.weight ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.dimensions ? "hidden" : ""} ${
            !printVisibleColumns.dimensions ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.dimensions ? "hidden" : ""} ${
            !printVisibleColumns.dimensions ? "print:hidden" : ""
          }`}
        ></th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.dimensions ? "hidden" : ""} ${
            !printVisibleColumns.dimensions ? "print:hidden" : ""
          }`}
        ></th>
      </tr>
    </tfoot>
  );
};

export default TFoot;
