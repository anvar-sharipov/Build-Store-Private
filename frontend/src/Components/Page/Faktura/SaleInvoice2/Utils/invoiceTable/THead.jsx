import { useFormikContext } from "formik";

const THead = ({ visibleColumns, printVisibleColumns, handleDeleteInvoice }) => {
  const { values } = useFormikContext();
  const th1 = "px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 tracking-wider text-center border border-black dark:border-gray-600 print:pl-1 print:py-0.5 print:!text-black";
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

        {!values.disabled && (
          <th className={`${th1} print:hidden`}>
            {" "}
            <button
              type="button"
              disabled={!values.invoice_id}
              onClick={() => handleDeleteInvoice(values.invoice_id)}
              className="inline-flex items-center justify-center w-7 h-7 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors group"
              title="Удалить Faktura"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>{" "}
          </th>
        )}
      </tr>
    </thead>
  );
};

export default THead;
