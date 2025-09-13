import { BrowserRouter as Router, Routes, Route, Link, useLocation, useSearchParams } from "react-router-dom";
import { ROUTES, ROUTES_RAPORT, PROCHEE, ADMIN_PANEL } from "../../../routes";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useContext, useState } from "react";
// import {DateContext} from "../../UI/DateProvider";
import { DateContext } from "../../UI/DateProvider";




export default function SidebarLeft() {
  const location = useLocation();
  const { t } = useTranslation();
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const popupRef = useRef(null);
  const popupRef2 = useRef(null);
  const adminRef = useRef(null);

  const [sidebarPosition, setSidebarPosition] = useState(0);

  const { dateFrom, setDateFrom, dateTo, setDateTo, dateProwodok, setDateProwodok } = useContext(DateContext);

  // Функция для отслеживания прокрутки
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop <= 160) {
        setSidebarPosition(scrollTop); // Двигаем сайдбар вверх
      } else {
        setSidebarPosition(160); // Сайдбар остаётся на 200px
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Очистка события при размонтировании компонента
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen1(false); // <-- закрываем меню
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
        setIsOpen2(false); // <-- закрываем меню
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
        setIsAdmin(false); // <-- закрываем меню
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

  // ############################################################################## date START

  const today = new Date().toISOString().split("T")[0]; // формат YYYY-MM-DD
  // Загружаем из localStorage при старте
  useEffect(() => {
    const savedDateProwodok = localStorage.getItem("dateProwodok");
    const savedDateFrom = localStorage.getItem("dateFrom");
    const savedDateTo = localStorage.getItem("dateTo");

    if (savedDateProwodok) setDateProwodok(savedDateProwodok);
    if (savedDateFrom) setDateFrom(savedDateFrom);
    if (savedDateTo) setDateTo(savedDateTo);
  }, []);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("dateProwodok", dateProwodok);
  }, [dateProwodok]);

  useEffect(() => {
    localStorage.setItem("dateFrom", dateFrom);
  }, [dateFrom]);

  useEffect(() => {
    localStorage.setItem("dateTo", dateTo);
  }, [dateTo]);
  // ############################################################################## date END

  return (
    <nav
      className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] w-52 flex-col p-4 bg-gray-900 overflow-y-auto z-20 mt-20 print:hidden"
      // className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] w-52 flex-col p-4 bg-gray-900 overflow-y-auto z-20 mt-20"
      style={{ top: `${80 - sidebarPosition}px` }} // Двигаем сайдбар в зависимости от прокрутки
    >
      <ul>
        {[
          { to: ROUTES.MAIN, label: t("sales_invoice"), key: "F1" },
          { to: ROUTES.PURCHASEINVOICE, label: t("purchase_invoice"), key: "F2" },
          { to: ROUTES.EMPLOYEERS, label: t("employeers"), key: "F3" },
          // { to: ROUTES.PARTNERS, label: t("partners"), key: "F4" },
          { to: ROUTES.PARTNERS_new, label: t("partners"), key: "F4" },
          { to: ROUTES.AGENTS, label: t("agents"), key: "F5" },
          { to: ROUTES.HARYTLAR, label: t("towary"), key: "F6" },
          // { to: ROUTES.ENTRIES, label: t("entries"), key: "F6" },
          // { to: ROUTES.ACCOUNT, label: t("account"), key: "F7" },
        ].map(({ to, label, key }) => (
          <li key={to} className="flex justify-between items-center border-b border-gray-600">
            <Link to={to} className={` ${to === location.pathname ? "text-gray-200 font-bold" : "text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"} `}>
              {label}
            </Link>
            <span className="text-xs text-gray-500 select-none">{key}</span>
          </li>
        ))}
      </ul>

      {/* otchety */}
      <div className="relative inline-block text-left" ref={popupRef}>
        {/* Кнопка открытия попапа */}
        <button onClick={() => setIsOpen1(!isOpen1)} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
          {t("reports")}
        </button>

        {/* Само всплывающее окно */}
        {isOpen1 && (
          <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
            <ul>
              {[
                {
                  to: ROUTES_RAPORT.PRICE_CHANGE_REPORT,
                  label: t("PRICE_CHANGE_REPORT"),
                  key: "none",
                },
              ].map(({ to, label, key }) => (
                <li key={to} className="flex justify-between items-center border-b border-gray-600 px-4 py-2 last:border-b-0">
                  <Link
                    to={to}
                    className={`${to === location.pathname ? "text-gray-200 font-bold" : "text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"}`}
                    onClick={() => setIsOpen1(false)} // закрыть меню при клике
                  >
                    {label}
                  </Link>
                  <span className="text-xs text-gray-500 select-none">{key}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* prochee */}
      <div className="relative inline-block text-left" ref={popupRef2}>
        {/* Кнопка открытия попапа */}
        <button onClick={() => setIsOpen2(!isOpen2)} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
          {t("prochee")}
        </button>

        {/* Само всплывающее окно */}
        {isOpen2 && (
          <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
            <ul>
              {[
                {
                  to: PROCHEE.PARTNER_TRANSACTION_ENTRY,
                  label: t("partner_transaction_entry"),
                  key: "none2",
                },
                {
                  to: PROCHEE.OSW,
                  label: t("oborotno-saldowaya wedemost"),
                  key: "none3",
                },
              ].map(({ to, label, key }) => (
                <li key={to} className="flex justify-between items-center border-b border-gray-600 px-4 py-2 last:border-b-0">
                  <Link
                    to={to}
                    className={`${to === location.pathname ? "text-gray-200 font-bold" : "text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"}`}
                    onClick={() => setIsOpen2(false)} // закрыть меню при клике
                  >
                    {label}
                  </Link>
                  {/* <span className="text-xs text-gray-500 select-none">{key}</span> */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Admin */}
      <div className="relative inline-block text-left" ref={adminRef}>
        {/* Кнопка открытия попапа */}
        <button onClick={() => setIsAdmin(!isAdmin)} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
          {t("adminPanel")}
        </button>

        {/* Само всплывающее окно */}
        {isAdmin && (
          <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
            <ul>
              {[
                {
                  to: ADMIN_PANEL.IMPORT_PRODUCTS,
                  label: t("import_products"),
                  key: "admin1",
                },
                {
                  to: ADMIN_PANEL.IMPORT_PARTNERS,
                  label: t("import_partners"),
                  key: "admin2",
                },
              ].map(({ to, label, key }) => (
                <li key={to} className="flex justify-between items-center border-b border-gray-600 px-4 py-2 last:border-b-0">
                  <Link
                    to={to}
                    className={`${to === location.pathname ? "text-gray-200 font-bold" : "text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"}`}
                    onClick={() => setIsAdmin(false)} // закрыть меню при клике
                  >
                    {label}
                  </Link>
                  {/* <span className="text-xs text-gray-500 select-none">{key}</span> */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* <div className="mt-3 space-y-3">
        <div className="flex flex-col text-gray-200 border border-gray-600 p-2 rounded">
          <span className="mb-1 text-sm">Дата проводок</span>
          <input type="date" value={dateProwodok} onChange={(e) => setDateProwodok(e.target.value)} className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 text-sm" />
        </div>

        <div className="flex flex-col text-gray-200 border border-gray-600 p-2 rounded">
          <span className="mb-1 text-sm">Диапазон дат для отчётов</span>
          <div className="flex flex-col space-y-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 text-sm" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 text-sm" />
          </div>
        </div>
      </div> */}
    </nav>
  );
}
