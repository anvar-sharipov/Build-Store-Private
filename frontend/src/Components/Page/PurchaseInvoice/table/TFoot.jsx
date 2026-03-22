import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { formatNumber } from "../../../UI/formatNumber";
import { MyDecimalPrice, sumDiffMoney, sumMoney } from "../../../UI/MyDecimalPrice";
import { formatNumber2 } from "../../../UI/formatNumber2";

const TFoot = ({ printVisibleColumns, visibleColumns }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext();

  //   // считаем итог по общей цене (кол-во * цена)
  //   const total = values.products.reduce((acc, p) => {
  //     const qty = parseFloat(p.selected_quantity) || 0;
  //     const price = parseFloat(p.price) || 0; // у тебя колонка "Цена за шт."
  //     return acc + qty * price;
  //   }, 0);

  const total_purchase = sumMoney(values.products, "purchase_price", "selected_quantity");

  const total_selected_price = sumMoney(values.products, "selected_price", "selected_quantity");
  // console.log("total_selected_price TT", total_selected_price);
  

  const total_income = sumDiffMoney(values.products, "selected_price", "purchase_price", "selected_quantity");

  const total_discount_price = sumDiffMoney(values.products, "selected_price", "wholesale_price", "selected_quantity");

  const total_volume_price = values.products.reduce((sum, p) => {
    return sum + Number(p.volume) * Number(p.selected_quantity || 0);
  }, 0);

  const total_weight_price = values.products.reduce((sum, p) => {
    return sum + Number(p.weight) * Number(p.selected_quantity || 0);
  }, 0);

  const total_length_price = values.products.reduce((sum, p) => {
    return sum + Number(p.length) * Number(p.selected_quantity || 0);
  }, 0);

  const total_width_price = values.products.reduce((sum, p) => {
    return sum + Number(p.width) * Number(p.selected_quantity || 0);
  }, 0);

  const total_height_price = values.products.reduce((sum, p) => {
    return sum + Number(p.height) * Number(p.selected_quantity || 0);
  }, 0);

  return (
    <tfoot>
      <tr className="dark:bg-gray-900 dark:text-gray-300 bg-gray-200">
        <th className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black`}></th>
        <th className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black`}>{t("total")}</th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${
            !visibleColumns.image ? "hidden" : "table-cell"
          } ${!printVisibleColumns.image ? "print:hidden" : "print:table-cell"}`}
        ></th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${
            !visibleColumns.qr_code ? "hidden" : "table-cell"
          } ${!printVisibleColumns.qr_code ? "print:hidden" : "print:table-cell"}`}
        ></th>
        <th className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black w-24 dark:border-gray-400 print:!border-black`}></th>
        <th className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black`}></th>
        <th className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black`}></th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.discount_percent || values.wozwrat_or_prihod !== "rashod" ? "hidden" : "table-cell"
          } ${!printVisibleColumns.discount_percent || values.wozwrat_or_prihod !== "rashod" ? "print:hidden" : "print:table-cell"}`}
        ></th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums`}
        >
          {formatNumber2(total_selected_price, 2)}
        </th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.purchase ? "hidden" : "table-cell"
          } ${!printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"}`}
        ></th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.purchase ? "hidden" : "table-cell"
          } ${!printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"}`}
        >
          {formatNumber2(total_purchase, 2)}
        </th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.income ? "hidden" : "table-cell"
          } ${!printVisibleColumns.income ? "print:hidden" : "print:table-cell"}`}
        ></th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.income ? "hidden" : "table-cell"
          } ${!printVisibleColumns.income ? "print:hidden" : "print:table-cell"}`}
        >
          {formatNumber2(total_income, 2)}
        </th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.discount ? "hidden" : "table-cell"
          } ${!printVisibleColumns.discount ? "print:hidden" : "print:table-cell"}`}
        ></th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.discount ? "hidden" : "table-cell"
          } ${!printVisibleColumns.discount ? "print:hidden" : "print:table-cell"}`}
        >
          {formatNumber2(total_discount_price, 2)}
        </th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.volume ? "hidden" : "table-cell"
          } ${!printVisibleColumns.volume ? "print:hidden" : "print:table-cell"}`}
        >
          {formatNumber2(total_volume_price, 3)}
        </th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.weight ? "hidden" : "table-cell"
          } ${!printVisibleColumns.weight ? "print:hidden" : "print:table-cell"}`}
        >
          {formatNumber2(total_weight_price, 3)}
        </th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.dimensions ? "hidden" : "table-cell"
          } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"}`}
        >
          {formatNumber2(total_length_price, 3)}
        </th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.dimensions ? "hidden" : "table-cell"
          } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"}`}
        >
          {formatNumber2(total_width_price, 3)}
        </th>
        <th
          className={`px-1 text-right font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black whitespace-nowrap font-mono tabular-nums ${
            !visibleColumns.dimensions ? "hidden" : "table-cell"
          } ${!printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"}`}
        >
          {formatNumber2(total_height_price, 3)}
        </th>
      </tr>
    </tfoot>
  );
};

export default TFoot;
