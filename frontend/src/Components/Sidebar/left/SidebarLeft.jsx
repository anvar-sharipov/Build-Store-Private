import { BrowserRouter as Router, Routes, Route, Link, useLocation, useSearchParams } from "react-router-dom";
import { ROUTES, ROUTES_RAPORT, PROCHEE, ADMIN_PANEL } from "../../../routes";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useContext, useState } from "react";
import { DateContext } from "../../UI/DateProvider";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, BarChart, PieChart, Table, Package, UserCheck, User, Users, MoreHorizontal, ChevronDown, Shield } from "lucide-react";

export default function SidebarLeft() {
  const location = useLocation();
  const { t } = useTranslation();
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const popupRef = useRef(null);
  const popupRef2 = useRef(null);
  const adminRef = useRef(null);

  const change_wkladka = new Audio("/sounds/change_wkladka.mp3");

  const [sidebarPosition, setSidebarPosition] = useState(0);

  const { dateFrom, setDateFrom, dateTo, setDateTo, dateProwodok, setDateProwodok } = useContext(DateContext);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop <= 160) {
        setSidebarPosition(scrollTop);
      } else {
        setSidebarPosition(160);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen1(false);
      }
    }
    if (isOpen1) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen1]);

  useEffect(() => {
    function handleClickOutside2(event) {
      if (popupRef2.current && !popupRef2.current.contains(event.target)) {
        setIsOpen2(false);
      }
    }

    if (isOpen2) {
      document.addEventListener("mousedown", handleClickOutside2);
    } else {
      document.removeEventListener("mousedown", handleClickOutside2);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside2);
    };
  }, [isOpen2]);

  useEffect(() => {
    function handleClickOutside2(event) {
      if (adminRef.current && !adminRef.current.contains(event.target)) {
        setIsAdmin(false);
      }
    }

    if (isAdmin) {
      document.addEventListener("mousedown", handleClickOutside2);
    } else {
      document.removeEventListener("mousedown", handleClickOutside2);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside2);
    };
  }, [isAdmin]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const savedDateProwodok = localStorage.getItem("dateProwodok");
    const savedDateFrom = localStorage.getItem("dateFrom");
    const savedDateTo = localStorage.getItem("dateTo");

    if (savedDateProwodok) setDateProwodok(savedDateProwodok);
    if (savedDateFrom) setDateFrom(savedDateFrom);
    if (savedDateTo) setDateTo(savedDateTo);
  }, []);

  useEffect(() => {
    localStorage.setItem("dateProwodok", dateProwodok);
  }, [dateProwodok]);

  useEffect(() => {
    localStorage.setItem("dateFrom", dateFrom);
  }, [dateFrom]);

  useEffect(() => {
    localStorage.setItem("dateTo", dateTo);
  }, [dateTo]);

  const menuItems = [
    { to: ROUTES.PURCHASEINVOICE, label: t("faktura"), key: "F1", icon: FileText, color: "text-blue-400" },
    { to: ROUTES.HARYTLAR, label: t("towary"), key: "F2", icon: Package, color: "text-emerald-400" },
    { to: ROUTES.EMPLOYEERS, label: t("employeers"), key: "F3", icon: User, color: "text-purple-400" },
    { to: ROUTES.PARTNERS_new, label: t("partners"), key: "F4", icon: UserCheck, color: "text-cyan-400" },
    { to: ROUTES.AGENTS, label: t("agents"), key: "F5", icon: Users, color: "text-amber-400" },
    { to: ROUTES.REPORTS, label: t("reports"), key: "F6", icon: PieChart, color: "text-pink-400" },
    { to: ROUTES.PROCHEE, label: t("prochee"), key: "F7", icon: MoreHorizontal, color: "text-indigo-400" },
    // { to: ROUTES.ENTRIES, label: t("entries"), key: "F8", icon: BarChart, color: "text-rose-400" },
  ];

  const adminItems = [
    { to: ADMIN_PANEL.IMPORT_PRODUCTS, label: t("import_products"), key: "admin1" },
    { to: ADMIN_PANEL.IMPORT_PARTNERS, label: t("import_partners"), key: "admin2" },
    { to: ADMIN_PANEL.DELETE_MODELS, label: t("delete models"), key: "admin3" },
  ];

  return (
    <nav className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] w-52 flex-col p-3 bg-gray-900 overflow-y-auto z-20 mt-20 print:hidden" style={{ top: `${80 - sidebarPosition}px` }}>
      <ul className="space-y-1">
        <AnimatePresence>
          {menuItems.map(({ to, label, key, icon: Icon, color }, idx) => {
            const isActive = to === location.pathname;

            return (
              <motion.li key={to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                <Link
                  to={to}
                  onClick={(e) => {
                    change_wkladka.currentTime = 0;
                    change_wkladka.play();
                  }}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300
                    ${isActive ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
                >
                  {/* Active indicator */}
                  {isActive && <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}

                  {/* Icon */}
                  <div className={`relative flex-shrink-0 ${isActive ? "text-white" : color}`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                    {isActive && <motion.div className="absolute inset-0 bg-white/20 rounded-full blur-md" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />}
                  </div>

                  {/* Label */}
                  <span className={`flex-1 text-sm font-medium truncate ${isActive ? "font-bold" : ""}`}>{label}</span>

                  {/* Hotkey */}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-400"
                    } font-mono select-none`}
                  >
                    {key}
                  </span>

                  {/* Hover effect */}
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-lg opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {/* Admin Panel */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="relative" ref={adminRef}>
          <motion.button
            onClick={() => setIsAdmin(!isAdmin)}
            className="group w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-400 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-medium">{t("adminPanel")}</span>
            </div>
            <motion.div animate={{ rotate: isAdmin ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 mt-2 rounded-lg bg-gray-800 shadow-2xl ring-1 ring-gray-700 overflow-hidden z-50"
              >
                <ul className="py-1">
                  {adminItems.map(({ to, label, key }, idx) => (
                    <motion.li key={to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                      <Link
                        to={to}
                        onClick={() => setIsAdmin(false)}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          to === location.pathname ? "bg-red-600 text-white font-semibold" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        {label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
