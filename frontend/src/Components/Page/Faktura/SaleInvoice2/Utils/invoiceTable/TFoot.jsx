import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../../../UI/formatNumber";

const TFoot = ({ visibleColumns, printVisibleColumns }) => {
  const { values } = useFormikContext();

  
  const { t } = useTranslation();
  return (
    <tfoot className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <td className="px-3 py-2 border border-black dark:border-gray-600"></td>
        <td className="px-3 py-2 border border-black dark:border-gray-600"></td>

        <td
          className={`px-3 py-2 border border-black dark:border-gray-600 ${visibleColumns.image ? "table-cell" : "hidden"} ${printVisibleColumns.image ? "print:table-cell" : "print:hidden"}`}
        ></td>
        <td
          className={`px-3 py-2 border border-black dark:border-gray-600 ${visibleColumns.qr_code ? "table-cell" : "hidden"} ${printVisibleColumns.qr_code ? "print:table-cell" : "print:hidden"}`}
        ></td>

        <td className="px-3 py-2 border border-black dark:border-gray-600"></td>
        <td className="px-3 py-2 border border-black dark:border-gray-600"></td>
        <td className="px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black">Итого:</td>

        <td className="px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black">{formatNumber(values.footerTotalPrice, 3)}</td>

        <td
          className={`px-3 py-2 border border-black dark:border-gray-600 ${visibleColumns.purchase ? "table-cell" : "hidden"} ${printVisibleColumns.purchase ? "print:table-cell" : "print:hidden"}`}
        ></td>
        <td
          className={`px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black ${
            visibleColumns.purchase ? "table-cell" : "hidden"
          } ${printVisibleColumns.purchase ? "print:table-cell" : "print:hidden"}`}
        >
          {formatNumber(values.footerTotalPricePurchae, 3)}
        </td>

        <td
          className={`px-3 py-2 border border-black dark:border-gray-600 ${visibleColumns.income ? "table-cell" : "hidden"} ${printVisibleColumns.income ? "print:table-cell" : "print:hidden"}`}
        ></td>
        <td
          className={`px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black ${
            visibleColumns.income ? "table-cell" : "hidden"
          } ${printVisibleColumns.income ? "print:table-cell" : "print:hidden"}`}
        >
          {formatNumber(values.footerTotalPriceProfit, 3)}
        </td>

        <td
          className={`px-3 py-2 border border-black dark:border-gray-600 ${visibleColumns.discount ? "table-cell" : "hidden"} ${printVisibleColumns.discount ? "print:table-cell" : "print:hidden"}`}
        ></td>
        <td
          className={`px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black ${
            visibleColumns.discount ? "table-cell" : "hidden"
          } ${printVisibleColumns.discount ? "print:table-cell" : "print:hidden"}`}
        >
          {formatNumber(values.footerTotalPriceDiscount, 3)}
        </td>

        <td
          className={`px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black ${
            visibleColumns.volume ? "table-cell" : "hidden"
          } ${printVisibleColumns.volume ? "print:table-cell" : "print:hidden"}`}
        >
          {formatNumber(values.footerTotalVolume, 3)}
        </td>
        <td
          className={`px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black ${
            visibleColumns.weight ? "table-cell" : "hidden"
          } ${printVisibleColumns.weight ? "print:table-cell" : "print:hidden"}`}
        >
          {formatNumber(values.footerTotalWeight, 3)}
        </td>
        <td
          className={`px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black ${
            visibleColumns.dimensions ? "table-cell" : "hidden"
          } ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}
        >
          {formatNumber(values.footerTotalLength, 3)}
        </td>
        <td
          className={`px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black ${
            visibleColumns.dimensions ? "table-cell" : "hidden"
          } ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}
        >
          {formatNumber(values.footerTotalWidth, 3)}
        </td>
        <td
          className={`px-3 py-2 font-bold text-gray-900 dark:text-gray-100 text-right border border-black dark:border-gray-600 print:!text-black ${
            visibleColumns.dimensions ? "table-cell" : "hidden"
          } ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}
        >
          {formatNumber(values.footerTotalHeight, 3)}
        </td>
        {!values.disabled && <td className="px-3 py-2 border border-black dark:border-gray-600 print:hidden"></td>}
      </tr>
    </tfoot>
  );
};

export default TFoot;
