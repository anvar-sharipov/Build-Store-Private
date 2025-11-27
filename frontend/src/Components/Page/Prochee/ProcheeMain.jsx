import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES, ROUTES_RAPORT, PROCHEE, ADMIN_PANEL } from "../../../routes";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useSearchParams } from "react-router-dom";
import { Settings, Users, Bell, Shield, Database, Globe, Wrench, Package, Zap, Star, QrCode, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QrListPrint from "./QrListPrint/QrListPrint";

const ProcheeMain = () => {
  const listRefs = useRef({});
  const sound = new Audio("/sounds/up_down.mp3");
  const change_type = new Audio("/sounds/change_type.mp3");
  const navigate = useNavigate();

  useEffect(() => {
    listRefs.current[1].focus();
  }, []);

  useEffect(() => {
    document.title = "Прочее"; // название вкладки
  }, []);

  const items = [
    // { id: 1, name: "Проводка платежей", icon: Settings, color: "slate", to: PROCHEE.PARTNER_TRANSACTION_ENTRY },
    { id: 1, name: "Проводки", icon: Settings, color: "slate", to: PROCHEE.ENTRIES2 },
    { id: 3, name: "QR code", icon: QrCode, color: "fuchsia", to: PROCHEE.QR_LIST_PRINT },
    { id: 4, name: "Журнал операций", icon: Users, color: "cyan", to: PROCHEE.TRANSACTION_JOURNAL },
    { id: 5, name: "Export Import Faktura", icon: Bell, color: "yellow", to: PROCHEE.EXPORT_FAKTURA },
    { id: 6, name: "Export Import Prowodki", icon: Shield, color: "green", to: PROCHEE.EXPORT_IMPORT_ENTRIES },
    { id: 7, name: "Рейс", icon: Car, color: "violet", to: PROCHEE.TRIP },
    { id: 8, name: "Интеграции", icon: Globe, color: "orange" },
    { id: 9, name: "Инструменты", icon: Wrench, color: "sky" },
    { id: 10, name: "Модули", icon: Package, color: "fuchsia" },
    { id: 11, name: "Автоматизация", icon: Zap, color: "lime" },
    { id: 12, name: "Избранное", icon: Star, color: "pink" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      slate: {
        bg: "bg-slate-500",
        bgLight: "bg-slate-100/50 dark:bg-slate-900/30",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
        ring: "ring-slate-400",
      },
      cyan: {
        bg: "bg-cyan-500",
        bgLight: "bg-cyan-100/50 dark:bg-cyan-900/30",
        text: "text-cyan-700 dark:text-cyan-300",
        border: "border-cyan-200 dark:border-cyan-700",
        ring: "ring-cyan-400",
      },
      yellow: {
        bg: "bg-yellow-500",
        bgLight: "bg-yellow-100/50 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-300",
        border: "border-yellow-200 dark:border-yellow-700",
        ring: "ring-yellow-400",
      },
      green: {
        bg: "bg-green-500",
        bgLight: "bg-green-100/50 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-200 dark:border-green-700",
        ring: "ring-green-400",
      },
      violet: {
        bg: "bg-violet-500",
        bgLight: "bg-violet-100/50 dark:bg-violet-900/30",
        text: "text-violet-700 dark:text-violet-300",
        border: "border-violet-200 dark:border-violet-700",
        ring: "ring-violet-400",
      },
      orange: {
        bg: "bg-orange-500",
        bgLight: "bg-orange-100/50 dark:bg-orange-900/30",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-200 dark:border-orange-700",
        ring: "ring-orange-400",
      },
      sky: {
        bg: "bg-sky-500",
        bgLight: "bg-sky-100/50 dark:bg-sky-900/30",
        text: "text-sky-700 dark:text-sky-300",
        border: "border-sky-200 dark:border-sky-700",
        ring: "ring-sky-400",
      },
      fuchsia: {
        bg: "bg-fuchsia-500",
        bgLight: "bg-fuchsia-100/50 dark:bg-fuchsia-900/30",
        text: "text-fuchsia-700 dark:text-fuchsia-300",
        border: "border-fuchsia-200 dark:border-fuchsia-700",
        ring: "ring-fuchsia-400",
      },
      lime: {
        bg: "bg-lime-500",
        bgLight: "bg-lime-100/50 dark:bg-lime-900/30",
        text: "text-lime-700 dark:text-lime-300",
        border: "border-lime-200 dark:border-lime-700",
        ring: "ring-lime-400",
      },
      pink: {
        bg: "bg-pink-500",
        bgLight: "bg-pink-100/50 dark:bg-pink-900/30",
        text: "text-pink-700 dark:text-pink-300",
        border: "border-pink-200 dark:border-pink-700",
        ring: "ring-pink-400",
      },
    };
    return colors[color] || colors.slate;
  };

  const handleNavigation = (currentId, direction) => {
    const ids = items.map((i) => i.id);
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
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2">Прочее</h1>
          <div className="w-20 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">Дополнительные настройки и инструменты</p>
        </motion.div>

        {/* List - вертикальный стиль с левой цветной линией */}
        <ul className="space-y-3">
          <AnimatePresence>
            {items.map((item, idx) => {
              const Icon = item.icon;
              const colorConfig = getColorClasses(item.color);
              const to = item.to;
              const id = item.id;

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.4, delay: idx * 0.06, type: "spring" }}
                  ref={(el) => {
                    if (el) {
                      listRefs.current[item.id] = el;
                    } else {
                      delete listRefs.current[item.id];
                    }
                  }}
                  tabIndex={0}
                  className={`group relative bg-white dark:bg-gray-900 border-l-4 ${colorConfig.border}
                    rounded-r-xl shadow-sm hover:shadow-xl focus:shadow-xl
                    transition-all duration-300 cursor-pointer
                    hover:translate-x-2 focus:translate-x-2
                    focus:outline-none focus:ring-4 ${colorConfig.ring} focus:ring-offset-2 dark:focus:ring-offset-gray-950`}
                  //   onClick={() => console.log(`Выбрано: ${item.name}`)}
                  onClick={() => {
                    if (to) {
                      change_type.currentTime = 0;
                      change_type.play().catch(() => {});
                      navigate(to);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      change_type.currentTime = 0;
                      change_type.play().catch(() => {});
                      navigate(to);
                      //   console.log(`Выбрано: ${item.name}`);
                      //   listRefs.current[id].querySelector("a")?.click();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      handleNavigation(item.id, "down");
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      handleNavigation(item.id, "up");
                    }
                  }}
                >
                  <Link to={to || "#"}>
                    <div className="flex items-center gap-4 p-5 sm:p-6">
                      {/* Number badge */}
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full font-bold text-gray-600 dark:text-gray-400 text-sm sm:text-base group-hover:scale-110 group-focus:scale-110 transition-transform">
                        {idx + 1}
                      </div>

                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 ${colorConfig.bg} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-focus:shadow-2xl transition-all group-hover:rotate-6 group-focus:rotate-6`}
                      >
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-transparent group-focus:text-transparent group-hover:bg-clip-text group-focus:bg-clip-text group-hover:bg-gradient-to-r group-focus:bg-gradient-to-r from-purple-600 to-pink-600 transition-all">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Нажмите Enter для открытия</p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>

                  {/* Animated background */}
                  <motion.div className={`absolute inset-0 ${colorConfig.bgLight} opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity rounded-r-xl`} initial={false} />

                  {/* Focus bar bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-focus:opacity-100 transition-opacity rounded-br-xl"></div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* Navigation Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-300 dark:border-gray-600 font-mono text-xs shadow-sm">↑</kbd>
              <kbd className="px-3 py-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-300 dark:border-gray-600 font-mono text-xs shadow-sm">↓</kbd>
              <span>Навигация</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-300 dark:border-gray-600 font-mono text-xs shadow-sm">Enter</kbd>
              <span>Выбрать</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProcheeMain;
