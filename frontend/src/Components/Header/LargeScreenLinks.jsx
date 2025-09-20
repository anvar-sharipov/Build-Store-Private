import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { LiaRegistered } from "react-icons/lia";
import { Link } from "react-router-dom";
import { IoLogInOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import LanguageSwitcher from "../../LanguageSwitcher";
// import { useLocation } from "react-router-dom";
import { DateContext } from "../UI/DateProvider";
import { useContext, useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import MyButton from "../UI/MyButton";
import myAxios from "../axios";
import MyModal from "../UI/MyModal";
import MyModal2 from "../UI/MyModal2";
import { useTranslation } from "react-i18next";
import Notification from "../Notification";

const LargeScreenLinks = ({ setIsMenuOpen, isMenuOpen, ROUTES, t, logout, setDarkMode, darkMode, i18n, user, setShowAvatarModal }) => {
  // const location = useLocation();
  // const isFullScreenPage =
  //   location.pathname === "/sale-invoices/new" ||
  //   location.pathname.includes("/sale-invoices/update") ||
  //   location.pathname.includes("/sale-invoices/create") ||
  //   location.pathname.includes("/purchase-invoices/update") ||
  //   location.pathname.includes("/purchase-invoices/create");
  const { dateFrom, setDateFrom, dateTo, setDateTo, dateProwodok, setDateProwodok } = useContext(DateContext);

  // ############################################################################## modal close day START
  const [dateIsClosed, setDateIsClosed] = useState(false);
  const [dontShowCloseDayBtn, setDontShowCloseDayBtn] = useState(true);
  const [openModalCloseDay, setOpenModalCloseDay] = useState(false);

  const [action, setAction] = useState("close"); // close или reopen
  const [reason, setReason] = useState("");

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (action === "reopen" && !reason) {
      showNotification(t("If you are reopening the day, please provide a reason"), "error");
      return;
    }

    try {
      const response = await myAxios.post("/close_day/", {
        date: dateProwodok,
        action,
        reason,
        user_id: 1, // замените на реальный id текущего пользователя
      });

      if (response.data.success) {
        alert(`День успешно ${action === "close" ? "закрыт" : "открыт"}!`);
      } else {
        alert(`Ошибка: ${response.data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при отправке запроса на сервер");
    }
  };
  // ############################################################################## modal close day END

  // ############################################################################## date START

  useEffect(() => {
    const checkDate = async () => {
      try {
        const res = await myAxios.get("check_day_closed", {
          params: {
            date: dateProwodok,
          },
        });
        console.log("Response:", res.data);
        if (res.data.is_closed) {
          setDateIsClosed(true);
          setDontShowCloseDayBtn(false);
        } else {
          setDateIsClosed(false);
          setDontShowCloseDayBtn(false);
        }
        if (res.data.error) {
          setDontShowCloseDayBtn(true);
        } else {
          setDontShowCloseDayBtn(false);
        }
      } catch (error) {
        console.error("Error det date:", error);
      }
    };
    checkDate();
  }, [dateProwodok]);

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
      {/* modalka for close day */}
      {openModalCloseDay && (
        <MyModal2 onClose={() => setOpenModalCloseDay(false)}>
          <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">Закрытие / Отмена дня</h2>

              {/* Дата */}
              <div className="text-center font-semibold text-gray-700 dark:text-gray-300">{dateProwodok ? new Date(dateProwodok).toLocaleDateString("ru-RU") : "Не выбрана"}</div>
              <div className=" hidden">
                <label className="mb-1 text-gray-700 dark:text-gray-300">Дата</label>
                <div>{dateProwodok}</div>
                <input type="date" value={dateProwodok} onChange={(e) => setDateProwodok(e.target.value)} className="hidden" required />
              </div>

              {/* Действие */}
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700 dark:text-gray-300">Действие</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="close">Закрыть день</option>
                  <option value="reopen">Отменить закрытие</option>
                </select>
              </div>

              {/* Причина */}
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700 dark:text-gray-300">Причина {action === "reopen" && <span className="text-red-500">*</span>}</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Введите комментарий (обязательно при отмене закрытия)"
                  rows={3}
                  required={action === "reopen"}
                />
              </div>

              {/* Кнопка */}
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Подтвердить
              </button>
            </form>
            <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
          </div>
        </MyModal2>
      )}

      {/* Logo */}
      <img src="/polisem.png" alt="polisem-icon" width={200} />

      {/* Burger button */}
      <div className="lg:hidden text-gray-300">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <IoClose size={28} /> : <GiHamburgerMenu size={28} />}</button>
      </div>

      {/* Menu (desktop) */}
      <div className="hidden lg:flex gap-6 items-center">
        <div className="mt-3 flex gap-2">
          <div className="flex flex-col gap-1 text-gray-200 border-r border-gray-600 pr-2">
            <span className="text-sm">Дата проводок</span>
            <input type="date" value={dateProwodok} onChange={(e) => setDateProwodok(e.target.value)} className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 text-sm" />

            {!dontShowCloseDayBtn ? (
              dateIsClosed ? (
                <div className="flex gap-2 items-center mt-1">
                  <button
                    className="gap-1 border-2 border-red-500 rounded-md px-3 py-1 hover:bg-red-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                    variant="green"
                    onClick={() => setOpenModalCloseDay(true)}
                    type="button"
                  >
                    {t("day is closed")}
                  </button>

                  <FaLock size={15} />
                </div>
              ) : (
                <div className="flex gap-2 items-center mt-1">
                  <button
                    className="gap-1 border-2 border-green-500 rounded-md px-2 py-1 hover:bg-green-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                    variant="green"
                    onClick={() => setOpenModalCloseDay(true)}
                    type="button"
                  >
                    {t("close day")}
                  </button>
                  <FaLock size={15} />
                </div>
              )
            ) : (
              <div className="flex gap-2 items-center mt-1">
                <button
                  className="gap-1 border-2 border-gray-500 rounded-md px-2 py-1 hover:bg-gray-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                  variant="green"
                  onClick={() => setOpenModalCloseDay(true)}
                  type="button"
                >
                  {t("choose day")}
                </button>
                <FaLock size={15} />
              </div>
            )}
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
        <div className="flex flex-col gap-5 border-r border-gray-600 pr-2">
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
