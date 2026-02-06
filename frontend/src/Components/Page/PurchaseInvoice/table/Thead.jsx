import { useTranslation } from "react-i18next";

const Thead = ({ printVisibleColumns, visibleColumns }) => {
  const { t } = useTranslation();

  return (
    <thead>
      <tr className="bg-gray-400 dark:bg-gray-900 dark:text-gray-300 text-sm">
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black w-4 print:min-w-16`}>
          <span className="print:hidden">№</span>
          <div className="hidden print:flex print:gap-7">
            <span className="pl-2">№</span>
            <span className="pr-2">✓</span>
          </div>
        </th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black`}>{t("name2")}</th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.image ? "hidden" : "table-cell"} ${
            !printVisibleColumns.image ? "print:hidden" : "print:table-cell"
          }`}
        >
          {t("image")}
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.qr_code ? "hidden" : "table-cell"} ${
            !printVisibleColumns.qr_code ? "print:hidden" : "print:table-cell"
          }`}
        >
          QR
        </th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black w-24 dark:border-gray-400 print:!border-black`}>{t("q-ty")}</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black`}>{t("un")}</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black w-24 dark:border-gray-400 print:!border-black`}>Цена за шт.</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black`}>Общая цена</th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.purchase ? "hidden" : "table-cell"} ${
            !printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"
          }`}
        >
          Цена приход за шт.
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.purchase ? "hidden" : "table-cell"} ${
            !printVisibleColumns.purchase ? "print:hidden" : "print:table-cell"
          }`}
        >
          Общая цена приход
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.income ? "hidden" : "table-cell"} ${
            !printVisibleColumns.income ? "print:hidden" : "print:table-cell"
          }`}
        >
          Доход за шт.
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.income ? "hidden" : "table-cell"} ${
            !printVisibleColumns.income ? "print:hidden" : "print:table-cell"
          }`}
        >
          Общая цена Доход
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.discount ? "hidden" : "table-cell"} ${
            !printVisibleColumns.discount ? "print:hidden" : "print:table-cell"
          }`}
        >
          Скидка за шт.
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.discount ? "hidden" : "table-cell"} ${
            !printVisibleColumns.discount ? "print:hidden" : "print:table-cell"
          }`}
        >
          Общая цена Скидка
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.volume ? "hidden" : "table-cell"} ${
            !printVisibleColumns.volume ? "print:hidden" : "print:table-cell"
          }`}
        >
          Объём (м³)
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.weight ? "hidden" : "table-cell"} ${
            !printVisibleColumns.weight ? "print:hidden" : "print:table-cell"
          }`}
        >
          Вес (кг)
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.dimensions ? "hidden" : "table-cell"} ${
            !printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"
          }`}
        >
          Длина (см)
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.dimensions ? "hidden" : "table-cell"} ${
            !printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"
          }`}
        >
          Ширина (см)
        </th>
        <th
          className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black dark:border-gray-400 print:!border-black ${!visibleColumns.dimensions ? "hidden" : "table-cell"} ${
            !printVisibleColumns.dimensions ? "print:hidden" : "print:table-cell"
          }`}
        >
          Высота (см)
        </th>
      </tr>
    </thead>
  );
};

export default Thead;
