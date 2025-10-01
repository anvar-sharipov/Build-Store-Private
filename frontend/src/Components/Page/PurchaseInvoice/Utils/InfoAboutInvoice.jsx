import { MdPrint, MdPrintDisabled } from "react-icons/md";

const InfoAboutInvoice = ({ values, letPrintInfo, setLetPrintInfo }) => {
  return (
    <div className={`${letPrintInfo ? "print:block" : "print:hidden"}`}>
      {/* Compact Info Grid with Icon */}
      <div className="relative grid grid-cols-2 gap-x-4 gap-y-1 text-xs p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 print:bg-transparent print:border-0 print:p-0 print:text-[10px]">
        
        {/* Print Icon - Top Right Corner */}
        <div className="absolute -top-1 -right-1 print:hidden">
          {letPrintInfo ? (
            <MdPrint
              onClick={() => setLetPrintInfo((v) => !v)}
              className="w-5 h-5 text-blue-600 dark:text-blue-400 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm"
              title="Скрыть при печати"
            />
          ) : (
            <MdPrintDisabled
              onClick={() => setLetPrintInfo((v) => !v)}
              className="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm"
              title="Показать при печати"
            />
          )}
        </div>

        <div className="text-gray-600 dark:text-gray-400">Создано:</div>
        <div className="font-medium text-gray-900 dark:text-gray-100">{values.created_at || "—"}</div>

        <div className="text-gray-600 dark:text-gray-400">Обновлено:</div>
        <div className="font-medium text-gray-900 dark:text-gray-100">{values.updated_at || "—"}</div>

        <div className="text-gray-600 dark:text-gray-400">Создал:</div>
        <div className="font-medium text-gray-900 dark:text-gray-100">{values.created_by || "—"}</div>

        <div className="text-gray-600 dark:text-gray-400">Проводку сделал:</div>
        <div className={`font-medium ${values.entry_created_by ? "text-gray-900 dark:text-gray-100" : "text-amber-600 dark:text-amber-400 italic"}`}>{values.entry_created_by || "Не проводили"}</div>

        <div className="text-gray-600 dark:text-gray-400">Дата проводки:</div>
        <div className={`font-medium ${values.entry_created_at ? "text-gray-900 dark:text-gray-100" : "text-amber-600 dark:text-amber-400 italic"}`}>{values.entry_created_at || "Не проводили"}</div>
      </div>
    </div>
  );
};

export default InfoAboutInvoice;