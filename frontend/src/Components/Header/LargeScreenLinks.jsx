import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { LiaRegistered } from "react-icons/lia";
import { Link } from "react-router-dom";
import { IoLogInOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import LanguageSwitcher from "../../LanguageSwitcher";
// import { useLocation } from "react-router-dom";
import { DateContext } from "../UI/DateProvider";
import { useContext, useEffect } from "react";

const LargeScreenLinks = ({ setIsMenuOpen, isMenuOpen, ROUTES, t, logout, setDarkMode, darkMode, i18n, user, setShowAvatarModal }) => {
  // const location = useLocation();
  // const isFullScreenPage =
  //   location.pathname === "/sale-invoices/new" ||
  //   location.pathname.includes("/sale-invoices/update") ||
  //   location.pathname.includes("/sale-invoices/create") ||
  //   location.pathname.includes("/purchase-invoices/update") ||
  //   location.pathname.includes("/purchase-invoices/create");

  // ############################################################################## date START

  const { dateFrom, setDateFrom, dateTo, setDateTo, dateProwodok, setDateProwodok } = useContext(DateContext);

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
    <nav className="flex items-center justify-between">
      {/* Logo */}

      <img src="/polisem.png" alt="polisem-icon" width={200} />

      {/* Burger button */}
      <div className="lg:hidden text-gray-300">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <IoClose size={28} /> : <GiHamburgerMenu size={28} />}</button>
      </div>

      {/* Menu (desktop) */}
      <div className="hidden lg:flex gap-6 items-center">

          <div className="mt-3 flex gap-2">
            <div className="flex flex-col text-gray-200 border-r border-gray-600 pr-2">
              <span className="mb-1 text-sm">Дата проводок</span>
              <input type="date" value={dateProwodok} onChange={(e) => setDateProwodok(e.target.value)} className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 text-sm" />
            </div>

            <div className="flex flex-col text-gray-200 border-r border-gray-600 pr-2">
              <span className="mb-1 text-sm">Диапазон дат для отчётов</span>
              <div className="flex flex-col gap-2">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 text-sm" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 text-sm" />
              </div>
            </div>
          </div>
       

        <div className="flex flex-col gap-1 border-r border-gray-600 pr-2">
          <Link to={ROUTES.REGISTER} className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center">
            <LiaRegistered />
            {t("register")}
          </Link>
          <Link to={ROUTES.LOGIN} className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center">
            <IoLogInOutline />
            {t("login")}
          </Link>
          <div onClick={logout} className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center cursor-pointer">
            <TbLogout2 />
            {t("logout")}
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-gray-600 pr-2">
          <LanguageSwitcher i18n={i18n} />
          <div
            onClick={() => {
              setDarkMode(!darkMode);
              setTimeout(() => {
                window.dispatchEvent(new Event("theme-toggled"));
              }, 0);
            }}
            aria-label="Toggle theme"
            className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center cursor-pointer"
          >
            {/* {darkMode ? `🌙 ${t("theme")}: ${t("dark")}` : `☀️ ${t("theme")}: ${t("light")}`} */}
            {darkMode ? `🌙 ${t("dark")}` : `☀️ ${t("light")}`}
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <img src={user.photo} alt="user" className="w-8 h-8 rounded-full object-cover border border-gray-400 cursor-pointer" onClick={() => setShowAvatarModal(true)} />
            <span className="text-gray-400">{user.username}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LargeScreenLinks;
