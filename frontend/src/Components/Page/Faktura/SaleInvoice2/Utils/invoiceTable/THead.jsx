const THead = ({visibleColumns, printVisibleColumns}) => {
  const th1 =
    "px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center border border-gray-300 dark:border-gray-600 print:pl-1 print:py-0.5 print:text-[12px] print:!text-black";
  return (
    <thead className="bg-gray-100 dark:bg-gray-700">
      <tr>
        <th className={th1}>№</th>
        <th className={th1}>Наименование</th>

        <th className={`${th1} ${visibleColumns.image ? "table-cell" : "hidden"} ${printVisibleColumns.image ? "print:table-cell" : "print:hidden"}`}>foto</th>

        <th className={`${th1} ${visibleColumns.qr_code ? "table-cell" : "hidden"} ${printVisibleColumns.qr_code ? "print:table-cell" : "print:hidden"}`}>QR</th>

        <th className={th1}>Количество</th>
        <th className={th1}>Единица</th>
        <th className={th1}>Цена за шт.</th>
        <th className={th1}>Общая цена</th>

        <th className={`${th1} ${visibleColumns.purchase ? "table-cell" : "hidden"} ${printVisibleColumns.purchase ? "print:table-cell" : "print:hidden"}`}>Цена приход за шт.</th>
        <th className={`${th1} ${visibleColumns.purchase ? "table-cell" : "hidden"} ${printVisibleColumns.purchase ? "print:table-cell" : "print:hidden"}`}>Общая цена приход</th>

        <th className={`${th1} ${visibleColumns.income ? "table-cell" : "hidden"} ${printVisibleColumns.income ? "print:table-cell" : "print:hidden"}`}>Доход за шт.</th>
        <th className={`${th1} ${visibleColumns.income ? "table-cell" : "hidden"} ${printVisibleColumns.income ? "print:table-cell" : "print:hidden"}`}>Общая цена Доход</th>

        <th className={`${th1} ${visibleColumns.discount ? "table-cell" : "hidden"} ${printVisibleColumns.discount ? "print:table-cell" : "print:hidden"}`}>Скидка за шт.</th>
        <th className={`${th1} ${visibleColumns.discount ? "table-cell" : "hidden"} ${printVisibleColumns.discount ? "print:table-cell" : "print:hidden"}`}>Общая цена Скидка</th>

        <th className={`${th1} ${visibleColumns.volume ? "table-cell" : "hidden"} ${printVisibleColumns.volume ? "print:table-cell" : "print:hidden"}`}>Объём (м³)</th>
        <th className={`${th1} ${visibleColumns.weight ? "table-cell" : "hidden"} ${printVisibleColumns.weight ? "print:table-cell" : "print:hidden"}`}>Вес (кг)</th>
        <th className={`${th1} ${visibleColumns.dimensions ? "table-cell" : "hidden"} ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}>Длина (см)</th>
        <th className={`${th1} ${visibleColumns.dimensions ? "table-cell" : "hidden"} ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}>Ширина (см)</th>
        <th className={`${th1} ${visibleColumns.dimensions ? "table-cell" : "hidden"} ${printVisibleColumns.dimensions ? "print:table-cell" : "print:hidden"}`}>Высота (см)</th>

        <th className={`${th1} print:hidden`}>X</th>
      </tr>
    </thead>
  );
};

export default THead;
