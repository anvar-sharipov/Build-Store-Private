import { useTranslation } from "react-i18next";
import MyFormatDate from "../../UI/MyFormatDate";
import { FileText, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";

const InvoiceList = ({ invoices, mainRefs, handleOpenInvoice }) => {
  const { t } = useTranslation();
  
  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">0</span>
          </div>
        </div>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Фактуры не найдены
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          Попробуйте изменить параметры поиска или создать новый счет
        </p>
      </div>
    );
  }

  const getInvoiceTypeConfig = (type) => {
    switch (type) {
      case "rashod":
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
          border: "border-l-4 border-emerald-400",
          icon: <ArrowDownCircle className="w-5 h-5 text-emerald-500" />,
          badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        };
      case "wozwrat":
        return {
          bg: "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20",
          border: "border-l-4 border-rose-400",
          icon: <RefreshCw className="w-5 h-5 text-rose-500" />,
          badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
          border: "border-l-4 border-blue-400",
          icon: <ArrowUpCircle className="w-5 h-5 text-blue-500" />,
          badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        };
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Список фактур
          </h3>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
              Всего: {invoices.length}
            </span>
          </div>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
      </div>

      <ul className="space-y-3">
        {invoices.map((invoice, idx) => {
          const typeConfig = getInvoiceTypeConfig(invoice.wozwrat_or_prihod);
          
          return (
            <li
              key={invoice.id}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:scale-[1.02] focus:shadow-xl focus:outline-none ${typeConfig.bg} ${typeConfig.border} cursor-pointer`}
              ref={(el) => (mainRefs.listRefs.current[invoice.id] = el)}
              tabIndex={0}
              onClick={() => handleOpenInvoice(invoice.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleOpenInvoice(invoice.id);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const ids = invoices.map((inv) => inv.id);
                  const currentIndex = ids.indexOf(invoice.id);
                  const nextIndex = currentIndex + 1;
                  if (nextIndex < ids.length) {
                    const nextId = ids[nextIndex];
                    const nextEl = mainRefs.listRefs.current[nextId];
                    if (nextEl) {
                      nextEl.focus();
                    }
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const ids = invoices.map((inv) => inv.id);
                  const currentIndex = ids.indexOf(invoice.id);
                  const prevIndex = currentIndex - 1;
                  if (prevIndex >= 0) {
                    const prevId = ids[prevIndex];
                    const prevEl = mainRefs.listRefs.current[prevId];
                    if (prevEl) {
                      prevEl.focus();
                    }
                  } else {
                    mainRefs.searchInputRef?.current.focus();
                  }
                }
              }}
            >
              {/* Градиентный overlay при hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Основной контент */}
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Номер с анимацией */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Информация о счете */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        {typeConfig.icon}
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                          {t(invoice.wozwrat_or_prihod)} {t("faktura")} №{invoice.id}
                        </h4>
                      </div>
                      
                      {/* Бейдж типа */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.badge} transition-all duration-300 group-hover:scale-105`}>
                        {t(invoice.wozwrat_or_prihod)}
                      </span>
                    </div>
                  </div>

                  {/* Дата */}
                  <div className="flex-shrink-0 text-right">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300">
                      <time className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                        {MyFormatDate(invoice.invoice_date)}
                      </time>
                    </div>
                  </div>
                </div>

                {/* Индикатор активности при фокусе */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-focus:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Шиммер эффект при hover */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-hover:left-full transition-all duration-1000 ease-out"></div>
            </li>
          );
        })}
      </ul>

      {/* Подсказка по навигации */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Используйте ↑↓ для навигации, Enter для открытия фактуры
        </p>
      </div>
    </div>
  );
};

export default InvoiceList;