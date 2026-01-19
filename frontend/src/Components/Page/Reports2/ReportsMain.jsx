import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES, ROUTES_RAPORT, PROCHEE, ADMIN_PANEL } from "../../../routes";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useSearchParams } from "react-router-dom";

import { FileText, TrendingUp, Calendar, DollarSign, BarChart3, PieChart, Activity, ChevronRight } from "lucide-react";

const ReportsMain = () => {
  const { t } = useTranslation();
  const listRefs = useRef({});
  const sound = new Audio("/sounds/up_down.mp3");

  useEffect(() => {
    document.title = "Отчет"; // название вкладки
  }, []);

  const reports = [
    { id: 1, name: t("PRICE_CHANGE_REPORT"), icon: DollarSign, color: "blue", to: ROUTES_RAPORT.PRICE_CHANGE_REPORT },
    { id: 2, name: "Оборотно сальдовая ведомость", icon: TrendingUp, color: "emerald", to: ROUTES_RAPORT.OSW2 },
    { id: 3, name: "Анализ движения товаров v1", icon: BarChart3, color: "purple", to: ROUTES_RAPORT.SALES_ANALIS },
    { id: 4, name: "Анализ движения товаров v2", icon: PieChart, color: "amber", to: ROUTES_RAPORT.SALES_ANALIS_WITHOUT_RETURN },
    { id: 5, name: "Список карточек", icon: Activity, color: "rose", to: ROUTES_RAPORT.ACOOUNT_CARDS },
    { id: 6, name: t("buh oborot towar"), icon: Calendar, color: "indigo", to: ROUTES_RAPORT.PRODUCTS_BUH_OBOROT },
    { id: 7, name: "Список карточек товаров", icon: DollarSign, color: "red", to: ROUTES_RAPORT.PRODUCT_CARDS },
    { id: 8, name: "Скидки/Наценки", icon: BarChart3, color: "teal", to: ROUTES_RAPORT.SKIDKI_NASENKI },
  ];

  useEffect(() => {
    listRefs.current[1]?.focus();
  }, []);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20",
        border: "border-blue-300 dark:border-blue-700",
        icon: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/50",
        ring: "focus-visible:ring-blue-400",
        glow: "group-hover:shadow-blue-500/50 group-focus:shadow-blue-500/50",
      },
      emerald: {
        bg: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20",
        border: "border-emerald-300 dark:border-emerald-700",
        icon: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
        ring: "focus-visible:ring-emerald-400",
        glow: "group-hover:shadow-emerald-500/50 group-focus:shadow-emerald-500/50",
      },
      purple: {
        bg: "from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20",
        border: "border-purple-300 dark:border-purple-700",
        icon: "text-purple-600 dark:text-purple-400",
        iconBg: "bg-purple-100 dark:bg-purple-900/50",
        ring: "focus-visible:ring-purple-400",
        glow: "group-hover:shadow-purple-500/50 group-focus:shadow-purple-500/50",
      },
      amber: {
        bg: "from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20",
        border: "border-amber-300 dark:border-amber-700",
        icon: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-100 dark:bg-amber-900/50",
        ring: "focus-visible:ring-amber-400",
        glow: "group-hover:shadow-amber-500/50 group-focus:shadow-amber-500/50",
      },
      rose: {
        bg: "from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20",
        border: "border-rose-300 dark:border-rose-700",
        icon: "text-rose-600 dark:text-rose-400",
        iconBg: "bg-rose-100 dark:bg-rose-900/50",
        ring: "focus-visible:ring-rose-400",
        glow: "group-hover:shadow-rose-500/50 group-focus:shadow-rose-500/50",
      },
      indigo: {
        bg: "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20",
        border: "border-indigo-300 dark:border-indigo-700",
        icon: "text-indigo-600 dark:text-indigo-400",
        iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
        ring: "focus-visible:ring-indigo-400",
        glow: "group-hover:shadow-indigo-500/50 group-focus:shadow-indigo-500/50",
      },
      red: {
        bg: "from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20",
        border: "border-red-300 dark:border-red-700",
        icon: "text-red-600 dark:text-red-400",
        iconBg: "bg-red-100 dark:bg-red-900/50",
        ring: "focus-visible:ring-red-400",
        glow: "group-hover:shadow-red-500/50 group-focus:shadow-red-500/50",
      },
      teal: {
        bg: "from-teal-50 to-teal-100/50 dark:from-teal-950/40 dark:to-teal-900/20",
        border: "border-teal-300 dark:border-teal-700",
        icon: "text-teal-600 dark:text-teal-400",
        iconBg: "bg-teal-100 dark:bg-teal-900/50",
        ring: "focus-visible:ring-teal-400",
        glow: "group-hover:shadow-teal-500/50 group-focus:shadow-teal-500/50",
      },
    };
    return colors[color] || colors.blue;
  };

  const handleNavigation = (currentId, direction) => {
    const ids = reports.map((r) => r.id);
    const currentIndex = ids.indexOf(currentId);
    const nextIndex = direction === "down" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < ids.length) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
      const nextId = ids[nextIndex];
      listRefs.current[nextId]?.focus();
    }
  };

  return (
    <nav>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">{t("Reports")}</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-[60px]">Выберите нужный отчет</p>
          </motion.div>

          {/* Reports List */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence>
              {reports.map((report, idx) => {
                const { id, name, color, to } = report;
                const Icon = report.icon;
                const colorConfig = getColorClasses(report.color);

                return (
                  <motion.li
                    key={report.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    ref={(el) => {
                      if (el) {
                        listRefs.current[report.id] = el;
                      } else {
                        delete listRefs.current[report.id];
                      }
                    }}
                    tabIndex={-1}
                    className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${colorConfig.bg} 
                    border-2 ${colorConfig.border} cursor-pointer transition-all duration-300
                    hover:scale-105 focus:scale-105 hover:shadow-xl focus:shadow-xl
                    ${colorConfig.glow}
                    focus:outline-none ${colorConfig.ring} focus-visible:ring-4 focus-visible:ring-offset-4 
                    dark:focus-visible:ring-offset-gray-900`}
                    // onClick={() => console.log(`Выбран отчет: ${report.name}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        
                        listRefs.current[id].querySelector('a')?.click();
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        handleNavigation(report.id, "down");
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        handleNavigation(report.id, "up");
                      }
                    }}
                  >
                    <Link to={to || "#"} tabIndex={0} className="block relative p-4 sm:p-5 lg:p-6" onClick={() => console.log(`Выбран отчет: ${report.name}`)}>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300"></div>

                      {/* Content */}
                      <div className="relative p-4 sm:p-5 lg:p-6">
                        {/* Icon */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 ${colorConfig.iconBg} backdrop-blur-sm rounded-xl shadow-md group-hover:shadow-lg group-focus:shadow-lg transition-all`}>
                            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colorConfig.icon}`} />
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 ${colorConfig.icon} opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all transform group-hover:translate-x-1 group-focus:translate-x-1`}
                          />
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-snug">
                          {report.name}
                        </h3>

                        {/* Focus indicator */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorConfig.bg} opacity-0 group-focus:opacity-100 transition-opacity duration-300 rounded-b-xl sm:rounded-b-2xl`}
                        ></div>
                      </div>

                      {/* Shimmer effect */}
                      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-hover:left-full group-focus:left-full transition-all duration-1000 ease-out"></div>
                    </Link>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Navigation Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50 shadow-sm"
          >
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
              💡 Используйте <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono">↑</kbd>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono ml-1">↓</kbd> для навигации,
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono ml-1">Enter</kbd> для выбора
            </p>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default ReportsMain;
