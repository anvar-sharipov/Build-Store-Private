

const Thead = ({printVisibleColumns, visibleColumns}) => {
  return (
    <thead>
      <tr className="bg-gray-400 dark:bg-gray-900 dark:text-gray-300">
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}>№</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}>Наименование</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.image ? "hidden" : ""} ${!printVisibleColumns.image ? "print:hidden" : ""}`}>foto</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.qr_code ? "hidden" : ""} ${!printVisibleColumns.qr_code ? "print:hidden" : ""}`}>QR</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black w-24`}>Количество</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}>Единица</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black w-24`}>Цена за шт.</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black`}>Общая цена</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.purchase ? "hidden" : ""} ${!printVisibleColumns.purchase ? "print:hidden" : ""}`}>Цена приход за шт.</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.purchase ? "hidden" : ""} ${!printVisibleColumns.purchase ? "print:hidden" : ""}`}>Общая цена приход</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.income ? "hidden" : ""} ${!printVisibleColumns.income ? "print:hidden" : ""}`}>Доход за шт.</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.income ? "hidden" : ""} ${!printVisibleColumns.income ? "print:hidden" : ""}`}>Общая цена Доход</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.discount ? "hidden" : ""} ${!printVisibleColumns.discount ? "print:hidden" : ""}`}>Скидка за шт.</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.discount ? "hidden" : ""} ${!printVisibleColumns.discount ? "print:hidden" : ""}`}>Общая цена Скидка</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.volume ? "hidden" : ""} ${!printVisibleColumns.volume ? "print:hidden" : ""}`}>Объём (м³)</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.weight ? "hidden" : ""} ${!printVisibleColumns.weight ? "print:hidden" : ""}`}>Вес (кг)</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.dimensions ? "hidden" : ""} ${!printVisibleColumns.dimensions ? "print:hidden" : ""}`}>Длина (см)</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.dimensions ? "hidden" : ""} ${!printVisibleColumns.dimensions ? "print:hidden" : ""}`}>Ширина (см)</th>
        <th className={`px-1 text-left font-semibold text-gray-700 dark:text-gray-400 border-b border border-black print:!text-black ${!visibleColumns.dimensions ? "hidden" : ""} ${!printVisibleColumns.dimensions ? "print:hidden" : ""}`}>Высота (см)</th>
      </tr>
    </thead>
  );
};

export default Thead;
