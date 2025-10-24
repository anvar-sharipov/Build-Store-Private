import { useTranslation } from "react-i18next";
import MyFormatDate from "../../UI/MyFormatDate";
import { FileText, ArrowUpCircle, ArrowDownCircle, RefreshCw, User, DollarSign, TrendingUp, Tag, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "../../UI/formatNumber";
import { GiCoins } from "react-icons/gi";

const InvoiceList = ({ invoices, mainRefs, handleOpenInvoice, pagination }) => {
  const { t } = useTranslation();
  const sound = new Audio("/sounds/up_down.mp3");

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
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("Invoice not found")}</p>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">{t("Try changing the search parameters or create a new invoice")}</p>
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
          badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        };
      case "wozwrat":
        return {
          bg: "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20",
          border: "border-l-4 border-rose-400",
          icon: <RefreshCw className="w-5 h-5 text-rose-500" />,
          badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
        };
      case "canceled":
        return {
          bg: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-900/20",
          border: "border-l-4 border-gray-400",
          icon: <XCircle className="w-5 h-5 text-gray-500" />,
          badge: "bg-gray-200 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
          border: "border-l-4 border-blue-400",
          icon: <ArrowUpCircle className="w-5 h-5 text-blue-500" />,
          badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        };
    }
  };

  // {/* ≤ 640px */}
  // <div className="block sm:hidden">Мобильный (≤640px)</div>

  // {/* 641px — 767px */}
  // <div className="hidden sm:block md:hidden">Маленький планшет (641–767px)</div>

  // {/* 768px — 1023px */}
  // <div className="hidden md:block lg:hidden">Планшет (768–1023px)</div>

  // {/* 1024px — 1279px */}
  // <div className="hidden lg:block xl:hidden">Ноутбук/малый десктоп (1024–1279px)</div>

  // {/* 1280px — 1535px */}
  // <div className="hidden xl:block 2xl:hidden">Большой десктоп (1280–1535px)</div>

  // {/* ≥ 1536px */}
  // <div className="hidden 2xl:block">Очень большой экран (≥1536px)</div>

  return (
    <div>
      {/* #################################################################################################################################################################################### */}
      {/* Мобильный (≤640px) */}
      {/* <div className="block sm:hidden">Мобильный (≤640px)</div> */}
      {/* Мобильный (≤640px) */}
      {/* #################################################################################################################################################################################### */}

      {/* #################################################################################################################################################################################### */}
      {/* Мобильный (≤640px) */}
      <div className="block sm:hidden">
        <div className="p-2 space-y-2">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{t("Invoice list")}</h3>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                  {t("total")}: {invoices.length} / {pagination.total}
                </span>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>

          <ul className="space-y-2">
            <AnimatePresence>
              {invoices.map((invoice, idx) => {
                let typeConfig;
                if (invoice.canceled_at) {
                  typeConfig = getInvoiceTypeConfig("canceled");
                } else {
                  typeConfig = getInvoiceTypeConfig(invoice.wozwrat_or_prihod);
                }

                // console.log("invoice fff", invoice);

                return (
                  <motion.li
                    key={invoice.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className={`group relative overflow-hidden rounded-lg transition-all duration-300 
              hover:scale-[1.01] focus:scale-[1.01] 
              hover:shadow-md focus:shadow-md 
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900
              ${typeConfig.bg} ${typeConfig.border} cursor-pointer`}
                    ref={(el) => {
                      if (el) {
                        mainRefs.listRefs.current[`mobile_${invoice.id}`] = el;
                      } else {
                        delete mainRefs.listRefs.current[`mobile_${invoice.id}`];
                      }
                    }}
                    tabIndex={0}
                    onClick={() => handleOpenInvoice(invoice.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleOpenInvoice(invoice.id);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        sound.currentTime = 0;
                        sound.play();
                        const ids = invoices.map((inv) => inv.id);
                        const currentIndex = ids.indexOf(invoice.id);
                        const nextIndex = currentIndex + 1;
                        if (nextIndex < ids.length) {
                          mainRefs.listRefs.current[`mobile_${ids[nextIndex]}`]?.focus();
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        sound.currentTime = 0;
                        sound.play();
                        const ids = invoices.map((inv) => inv.id);
                        const currentIndex = ids.indexOf(invoice.id);
                        const prevIndex = currentIndex - 1;
                        if (prevIndex >= 0) {
                          mainRefs.listRefs.current[`mobile_${ids[prevIndex]}`]?.focus();
                        } else {
                          mainRefs.searchInputRef?.current.focus();
                        }
                      }
                    }}
                  >
                    <div className="relative p-3">
                      {/* Верхняя часть: номер и тип */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {typeConfig.icon}
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {t(invoice.wozwrat_or_prihod)} №{invoice.id}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeConfig.badge}`}>{t(invoice.wozwrat_or_prihod)}</span>
                      </div>

                      {/* Партнер */}
                      <div className="flex items-center space-x-1 mb-2">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{invoice.partner || "—"}</span>
                      </div>

                      {/* Цены + статус */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md text-right">
                          <span className="block text-[10px] text-blue-600 dark:text-blue-400">{t("Price")}</span>
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatNumber(invoice.total_selected_price, 2)}</span>
                        </div>
                        <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-md text-right">
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">{t("Revenue")}</span>
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatNumber(invoice.total_income_price, 2)}</span>
                        </div>
                        <div className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-md text-right">
                          <span className="block text-[10px] text-amber-600 dark:text-amber-400">{t("Discount")}</span>
                          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{formatNumber(invoice.total_dicount_price, 2)}</span>
                        </div>
                        <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800/30 rounded-md text-right">
                          <span className="block text-[10px] text-gray-600 dark:text-gray-400">{t("Date")}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{MyFormatDate(invoice.invoice_date)}</span>
                        </div>
                      </div>

                      {/* Статус проведения */}

                      {invoice.canceled_at ? (
                        <div className="flex items-center space-x-1 text-red-700 dark:text-red-400">
                          <div className="w-2 h-2 bg-red-800 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold">{t("Canceled")}</span>
                        </div>
                      ) : invoice.is_entry ? (
                        <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold">{t("Posted")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold">{t("Not posted")}</span>
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">{t("💡 Use ↑↓ to navigate, Enter to open invoice")}</p>
          </div>
        </div>
      </div>
      {/* Мобильный (≤640px) */}
      {/* #################################################################################################################################################################################### */}

      {/* #################################################################################################################################################################################### */}
      {/* Маленький планшет (641–767px) */}
      {/* <div className="hidden sm:block md:hidden">Маленький планшет (641–767px)</div> */}
      {/* Маленький планшет (641–767px) */}
      {/* #################################################################################################################################################################################### */}

      {/* #################################################################################################################################################################################### */}
      {/* Ноутбук/малый десктоп (1024–1279px) */}
      <div className="hidden lg:block sm:block xl:hidden 2xl:hidden">
        <div className="p-3 space-y-3">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t("Invoice list")}</h3>
              </div>
              <span className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-medium border border-gray-200 dark:border-gray-700">
                {t("total")}: {invoices.length} из {pagination.total}
              </span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>

          <ul className="space-y-3">
            <AnimatePresence>
              {invoices.map((invoice, idx) => {
                let typeConfig;
                if (invoice.canceled_at) {
                  typeConfig = getInvoiceTypeConfig("canceled");
                } else {
                  typeConfig = getInvoiceTypeConfig(invoice.wozwrat_or_prihod);
                }

                return (
                  <motion.li
                    key={invoice.id}
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 
              hover:scale-[1.015] focus:scale-[1.015] 
              hover:shadow-lg focus:shadow-lg 
              focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-400 focus-visible:ring-offset-3 dark:focus-visible:ring-offset-gray-900
              ${typeConfig.bg} ${typeConfig.border} cursor-pointer`}
                    ref={(el) => {
                      if (el) {
                        mainRefs.listRefs.current[`laptop_${invoice.id}`] = el;
                      } else {
                        delete mainRefs.listRefs.current[`laptop_${invoice.id}`];
                      }
                    }}
                    tabIndex={0}
                    onClick={() => handleOpenInvoice(invoice.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleOpenInvoice(invoice.id);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        sound.currentTime = 0;
                        sound.play();
                        const ids = invoices.map((inv) => inv.id);
                        const currentIndex = ids.indexOf(invoice.id);
                        const nextIndex = currentIndex + 1;
                        if (nextIndex < ids.length) {
                          const nextId = ids[nextIndex];
                          const nextEl = mainRefs.listRefs.current[`laptop_${nextId}`];
                          if (nextEl) {
                            nextEl.focus();
                          }
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        sound.currentTime = 0;
                        sound.play();
                        const ids = invoices.map((inv) => inv.id);
                        const currentIndex = ids.indexOf(invoice.id);
                        const prevIndex = currentIndex - 1;
                        if (prevIndex >= 0) {
                          const prevId = ids[prevIndex];
                          const prevEl = mainRefs.listRefs.current[`laptop_${prevId}`];
                          if (prevEl) {
                            prevEl.focus();
                          }
                        } else {
                          mainRefs.searchInputRef?.current.focus();
                        }
                      }
                    }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300"></div>

                    {/* Main content */}
                    <div className="relative p-3.5">
                      <div className="space-y-3">
                        {/* Верхняя строка: Номер, Тип, ID, Дата */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Компактный номер */}
                            <div className="w-9 h-9 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{idx + 1}</span>
                            </div>

                            {/* Иконка и тип */}
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm">{typeConfig.icon}</div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                  {t(invoice.wozwrat_or_prihod)} <span className="text-gray-500 dark:text-gray-400">№{invoice.id}</span>
                                </h4>
                                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold ${typeConfig.badge}`}>{t(invoice.wozwrat_or_prihod)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Дата и статус */}
                          <div className="flex items-center gap-2">
                            {/* Дата */}
                            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                              <time className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">{MyFormatDate(invoice.invoice_date)}</time>
                            </div>

                            {/* Статус компактный */}

                            {invoice.canceled_at ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg backdrop-blur-sm shadow-sm">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-red-700 dark:text-red-300">{t("Canceled")}</span>
                              </div>
                            ) : invoice.is_entry ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg backdrop-blur-sm shadow-sm">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{t("Posted")}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg backdrop-blur-sm shadow-sm">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">{t("Not posted")}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Средняя строка: Партнер */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-sm">
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{invoice.partner || "—"}</span>
                        </div>

                        {/* Нижняя строка: Финансы в строку */}
                        <div className="flex items-center gap-2">
                          {/* Цена */}
                          <div className="flex-1 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 backdrop-blur-sm rounded-lg shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <GiCoins className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{t("Price")}</span>
                            </div>
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{formatNumber(invoice.total_selected_price, 2)}</span>
                          </div>

                          {/* Доход */}
                          <div className="flex-1 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 backdrop-blur-sm rounded-lg shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">{t("Revenue")}</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{formatNumber(invoice.total_income_price, 2)}</span>
                          </div>

                          {/* Скидка */}
                          <div className="flex-1 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 backdrop-blur-sm rounded-lg shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">{t("Discount")}</span>
                            </div>
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{formatNumber(invoice.total_dicount_price, 2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Focus indicator */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-focus:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Shimmer effect */}
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-hover:left-full group-focus:left-full transition-all duration-800 ease-out"></div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Navigation hint */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">{t("💡 Use ↑↓ to navigate, Enter to open invoice")}</p>
          </div>
        </div>
      </div>
      {/* Ноутбук/малый десктоп (1024–1279px) */}
      {/* #################################################################################################################################################################################### */}

      {/* #################################################################################################################################################################################### */}
      {/* Большой десктоп (1280–1535px) */}
      <div className="hidden xl:block 2xl:hidden">
        <div className="p-4 space-y-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t("Invoice list")}</h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 rounded-xl font-semibold border border-blue-200/50 dark:border-blue-800/50">
                  {t("total")}: {invoices.length} из {pagination.total}
                </span>
              </div>
            </div>
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
          </div>

          <ul className="space-y-4">
            <AnimatePresence>
              {invoices.map((invoice, idx) => {
                let typeConfig;
                if (invoice.canceled_at) {
                  typeConfig = getInvoiceTypeConfig("canceled");
                } else {
                  typeConfig = getInvoiceTypeConfig(invoice.wozwrat_or_prihod);
                }

                return (
                  <motion.li
                    key={invoice.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4, delay: idx * 0.06, type: "spring", stiffness: 100 }}
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 
              hover:scale-[1.02] focus:scale-[1.02] 
              hover:shadow-2xl focus:shadow-2xl 
              focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-gray-900
              ${typeConfig.bg} cursor-pointer border-2 border-transparent hover:border-white/30 dark:hover:border-gray-700/30`}
                    ref={(el) => {
                      if (el) {
                        mainRefs.listRefs.current[`desktop_${invoice.id}`] = el;
                      } else {
                        delete mainRefs.listRefs.current[`desktop_${invoice.id}`];
                      }
                    }}
                    tabIndex={0}
                    onClick={() => handleOpenInvoice(invoice.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleOpenInvoice(invoice.id);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        sound.currentTime = 0;
                        sound.play();
                        const ids = invoices.map((inv) => inv.id);
                        const currentIndex = ids.indexOf(invoice.id);
                        const nextIndex = currentIndex + 1;
                        if (nextIndex < ids.length) {
                          const nextId = ids[nextIndex];
                          const nextEl = mainRefs.listRefs.current[`desktop_${nextId}`];
                          if (nextEl) {
                            nextEl.focus();
                          }
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        sound.currentTime = 0;
                        sound.play();
                        const ids = invoices.map((inv) => inv.id);
                        const currentIndex = ids.indexOf(invoice.id);
                        const prevIndex = currentIndex - 1;
                        if (prevIndex >= 0) {
                          const prevId = ids[prevIndex];
                          const prevEl = mainRefs.listRefs.current[`desktop_${prevId}`];
                          if (prevEl) {
                            prevEl.focus();
                          }
                        } else {
                          mainRefs.searchInputRef?.current.focus();
                        }
                      }
                    }}
                  >
                    {/* Цветная полоска сверху */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                        invoice.wozwrat_or_prihod === "rashod"
                          ? "from-emerald-400 via-teal-500 to-cyan-500"
                          : invoice.wozwrat_or_prihod === "wozwrat"
                          ? "from-rose-400 via-pink-500 to-fuchsia-500"
                          : "from-blue-400 via-indigo-500 to-violet-500"
                      }`}
                    ></div>

                    {/* Светящийся эффект при hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Основной контент */}
                    <div className="relative p-5">
                      {/* Верхняя строка */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Левая часть: Номер + Тип + ID */}
                        <div className="flex items-center gap-4">
                          {/* Номер с градиентом */}
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 border-2 border-white/60 dark:border-gray-600/60">
                              <span className="text-base font-extrabold bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                {idx + 1}
                              </span>
                            </div>
                            {/* Пульсирующая точка */}
                            <div className="absolute -top-1 -right-1">
                              <div className="relative w-4 h-4">
                                <div
                                  className={`absolute inset-0 ${
                                    invoice.wozwrat_or_prihod === "rashod" ? "bg-emerald-500" : invoice.wozwrat_or_prihod === "wozwrat" ? "bg-rose-500" : "bg-blue-500"
                                  } rounded-full animate-ping opacity-75`}
                                ></div>
                                <div
                                  className={`relative ${
                                    invoice.wozwrat_or_prihod === "rashod" ? "bg-emerald-500" : invoice.wozwrat_or_prihod === "wozwrat" ? "bg-rose-500" : "bg-blue-500"
                                  } w-4 h-4 rounded-full`}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Тип и ID */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl shadow-md">{typeConfig.icon}</div>
                              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                {t(invoice.wozwrat_or_prihod)} <span className="text-gray-500 dark:text-gray-400">№{invoice.id}</span>
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${typeConfig.badge} shadow-sm border border-current/20`}>
                                {t(invoice.wozwrat_or_prihod)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Правая часть: Дата + Статус */}
                        <div className="flex items-center gap-4">
                          {/* Дата */}
                          <div className="flex flex-col items-end bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl px-4 py-3 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 group-hover:shadow-xl transition-shadow">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Дата</span>
                            <time className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{MyFormatDate(invoice.invoice_date)}</time>
                          </div>

                          {/* Статус */}

                          {invoice.canceled_at ? (
                            <div className="flex flex-col items-center px-4 py-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all backdrop-blur-xl">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="relative">
                                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                                  <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <span className="text-xs font-bold text-red-700 dark:text-red-300">{t("Canceled")}</span>
                              </div>
                              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : invoice.is_entry ? (
                            <div className="flex flex-col items-center px-4 py-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all backdrop-blur-xl">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="relative">
                                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                  <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{t("Posted")}</span>
                              </div>
                              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/60 border-2 border-amber-300 dark:border-amber-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all backdrop-blur-xl">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="relative">
                                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                                  <div className="absolute inset-0 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{t("Not posted")}</span>
                              </div>
                              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Средняя строка: Партнер */}
                      <div className="mb-4">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl shadow-md group-hover:shadow-lg transition-all border border-gray-200/50 dark:border-gray-700/50">
                          <User className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Партнер</span>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">{invoice.partner || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Нижняя строка: Финансовые данные в сетке */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* Общая цена */}
                        <div className="relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-blue-950/60 dark:via-blue-900/60 dark:to-indigo-900/60 rounded-xl shadow-md group-hover:shadow-lg transition-all border-2 border-blue-200/50 dark:border-blue-800/50">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-300/20 dark:bg-blue-600/20 rounded-full -translate-y-10 translate-x-10"></div>
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              <GiCoins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{t("Price")}</span>
                            </div>
                            <div className="text-lg font-extrabold text-blue-700 dark:text-blue-300">{formatNumber(invoice.total_selected_price, 3)}</div>
                          </div>
                        </div>

                        {/* Доход */}
                        <div className="relative overflow-hidden p-4 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:via-emerald-900/60 dark:to-teal-900/60 rounded-xl shadow-md group-hover:shadow-lg transition-all border-2 border-emerald-200/50 dark:border-emerald-800/50">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-300/20 dark:bg-emerald-600/20 rounded-full -translate-y-10 translate-x-10"></div>
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{t("Revenue")}</span>
                            </div>
                            <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{formatNumber(invoice.total_income_price, 3)}</div>
                          </div>
                        </div>

                        {/* Скидка */}
                        <div className="relative overflow-hidden p-4 bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 dark:from-amber-950/60 dark:via-amber-900/60 dark:to-orange-900/60 rounded-xl shadow-md group-hover:shadow-lg transition-all border-2 border-amber-200/50 dark:border-amber-800/50">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-300/20 dark:bg-amber-600/20 rounded-full -translate-y-10 translate-x-10"></div>
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">{t("Discount")}</span>
                            </div>
                            <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300">{formatNumber(invoice.total_dicount_price, 3)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Индикатор фокуса внизу */}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-focus:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
                    </div>

                    {/* Анимированный шиммер */}
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-hover:left-full group-focus:left-full transition-all duration-1200 ease-out"></div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Подсказка по навигации */}
          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-semibold">{t("💡 Use ↑↓ to navigate, Enter to open invoice")}</p>
          </div>
        </div>
      </div>
      {/* Большой десктоп (1280–1535px) */}
      {/* #################################################################################################################################################################################### */}

      {/* #################################################################################################################################################################################### */}
      {/* ≥ 1536px Очень большой экран (≥1536px) */}
      <div className="hidden 2xl:block">
        <div className="p-4 space-y-3">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t("Invoice list")}</h3>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                  {t("total")}: {invoices.length} из {pagination.total}
                </span>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>

          <ul className="space-y-3">
            <AnimatePresence>
              {invoices.map((invoice, idx) => {
                let typeConfig;
                if (invoice.canceled_at) {
                  typeConfig = getInvoiceTypeConfig("canceled");
                } else {
                  typeConfig = getInvoiceTypeConfig(invoice.wozwrat_or_prihod);
                }

                return (
                  <motion.li
                    key={invoice.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 
    hover:scale-[1.01] focus:scale-[1.01] 
    hover:shadow-xl focus:shadow-xl 
    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900
    ${typeConfig.bg} ${typeConfig.border} cursor-pointer`}
                    ref={(el) => {
                      if (el) {
                        mainRefs.listRefs.current[`large_${invoice.id}`] = el;
                      } else {
                        delete mainRefs.listRefs.current[`large_${invoice.id}`];
                      }
                    }}
                    tabIndex={0}
                    onClick={() => handleOpenInvoice(invoice.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleOpenInvoice(invoice.id);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        sound.currentTime = 0;
                        sound.play();
                        const ids = invoices.map((inv) => inv.id);
                        const currentIndex = ids.indexOf(invoice.id);
                        const nextIndex = currentIndex + 1;
                        if (nextIndex < ids.length) {
                          const nextId = ids[nextIndex];
                          const nextEl = mainRefs.listRefs.current[`large_${nextId}`];
                          if (nextEl) {
                            nextEl.focus();
                          }
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        sound.currentTime = 0;
                        sound.play();
                        const ids = invoices.map((inv) => inv.id);
                        const currentIndex = ids.indexOf(invoice.id);
                        const prevIndex = currentIndex - 1;
                        if (prevIndex >= 0) {
                          const prevId = ids[prevIndex];
                          const prevEl = mainRefs.listRefs.current[`large_${prevId}`];
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
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300"></div>

                    {/* Основной контент */}
                    <div className="relative p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Левая секция: Номер + Информация */}
                        <div className="flex items-center space-x-4 flex-shrink-0">
                          {/* Номер с анимацией */}
                          <div className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{idx + 1}</span>
                          </div>

                          {/* Информация о счете */}
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              {typeConfig.icon}
                              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                                {t(invoice.wozwrat_or_prihod)} №{invoice.id}
                              </h4>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.badge} transition-all duration-300 group-hover:scale-105`}>
                              {t(invoice.wozwrat_or_prihod)}
                            </span>
                          </div>
                        </div>

                        {/* Центральная секция: Партнер */}
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 min-w-0">
                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{invoice.partner || "—"}</span>
                          </div>
                        </div>

                        {/* Правая секция: Финансовые данные */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Общая цена */}
                          <div className="flex flex-col items-end px-3 py-2 bg-blue-50 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 min-w-[100px]">
                            <div className="flex items-center space-x-1 mb-0.5">
                              <GiCoins className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase">{t("Price")}</span>
                            </div>
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatNumber(invoice.total_selected_price, 3)}</span>
                          </div>

                          {/* Доход */}
                          <div className="flex flex-col items-end px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 backdrop-blur-sm rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 min-w-[100px]">
                            <div className="flex items-center space-x-1 mb-0.5">
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase">{t("Revenue")}</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatNumber(invoice.total_income_price, 3)}</span>
                          </div>

                          {/* Скидка */}
                          <div className="flex flex-col items-end px-3 py-2 bg-amber-50 dark:bg-amber-900/30 backdrop-blur-sm rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 min-w-[100px]">
                            <div className="flex items-center space-x-1 mb-0.5">
                              <Tag className="w-3 h-3 text-amber-500" />
                              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">{t("Discount")}</span>
                            </div>
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{formatNumber(invoice.total_dicount_price, 3)}</span>
                          </div>

                          {/* Статус проведения */}

                          {invoice.canceled_at ? (
                            <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-red-200 dark:border-red-700 rounded-lg backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                              <span className="text-xs font-semibold text-red-700 dark:text-red-300">{t("Canceled")}</span>
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : invoice.is_entry ? (
                            <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t("Posted")}</span>
                              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></div>
                              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{t("Not posted")}</span>
                              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}

                          {/* Дата */}
                          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300">
                            <time className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 whitespace-nowrap">
                              {MyFormatDate(invoice.invoice_date)}
                            </time>
                          </div>
                        </div>
                      </div>

                      {/* Индикатор активности при фокусе */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-focus:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Шиммер эффект при hover */}
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-hover:left-full group-focus:left-full transition-all duration-1000 ease-out"></div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Подсказка по навигации */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t("💡 Use ↑↓ to navigate, Enter to open invoice")}</p>
          </div>
        </div>
      </div>
      {/* ≥ 1536px Очень большой экран (≥1536px) */}
      {/* #################################################################################################################################################################################### */}
    </div>
  );
};

export default InvoiceList;
