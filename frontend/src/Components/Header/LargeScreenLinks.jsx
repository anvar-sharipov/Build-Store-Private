import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../AuthContext";
import { Menu, X, UserPlus, LogIn, LogOut, Sun, Moon, Lock, LockOpen, Calendar, CalendarRange, User, ChevronDown, Trees } from "lucide-react";
import LanguageSwitcher from "../../LanguageSwitcher";
import { DateContext } from "../UI/DateProvider";
import { useContext, useEffect, useState, useRef } from "react";
import myAxios from "../axios";
import { useNotification } from "../context/NotificationContext";
import CloseDayModal from "./modals/CloseDayModal";
import { useDispatch, useSelector } from "react-redux";
import { toggleSnowfall } from "../../app/store/snowfallSlice";
import { formatNumber2 } from "../UI/formatNumber2";

const LargeScreenLinks = ({ setIsMenuOpen, isMenuOpen, ROUTES, t, logout, setDarkMode, darkMode, i18n, user, setShowAvatarModal }) => {
  const { dateFrom, setDateFrom, dateTo, setDateTo, dateProwodok, setDateProwodok } = useContext(DateContext);
  const { showNotification } = useNotification();
  const { authUser, authGroup } = useContext(AuthContext);
  const [totalSum, setTotalSum] = useState(null);

  // Локальные состояния для инпутов
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom);
  const [localDateTo, setLocalDateTo] = useState(dateTo);

  // Таймеры для debounce
  const dateFromTimerRef = useRef(null);
  const dateToTimerRef = useRef(null);

  // Синхронизация при изменении контекста извне
  useEffect(() => {
    setLocalDateFrom(dateFrom);
  }, [dateFrom]);

  useEffect(() => {
    setLocalDateTo(dateTo);
  }, [dateTo]);

  // Обработчик изменения dateFrom с задержкой
  const handleDateFromChange = (e) => {
    const newValue = e.target.value;
    setLocalDateFrom(newValue);
    
    // Очищаем предыдущий таймер
    if (dateFromTimerRef.current) {
      clearTimeout(dateFromTimerRef.current);
    }
    
    // Устанавливаем новый таймер на 500ms
    dateFromTimerRef.current = setTimeout(() => {
      setDateFrom(newValue);
    }, 1500);
  };

   // Обработчик изменения dateTo с задержкой
  const handleDateToChange = (e) => {
    const newValue = e.target.value;
    setLocalDateTo(newValue);
    
    // Очищаем предыдущий таймер
    if (dateToTimerRef.current) {
      clearTimeout(dateToTimerRef.current);
    }
    
    // Устанавливаем новый таймер на 500ms
    dateToTimerRef.current = setTimeout(() => {
      setDateTo(newValue);
    }, 1500);
  };

   // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (dateFromTimerRef.current) clearTimeout(dateFromTimerRef.current);
      if (dateToTimerRef.current) clearTimeout(dateToTimerRef.current);
    };
  }, []);


  

  const jingleBells = useRef(null);


  useEffect(() => {
    jingleBells.current = new Audio("/sounds/Christmas-jingle-bells-melody.mp3");
  }, []);



  const handleClick = () => {
    if (!isSnowfallOn) {
      jingleBells.current.currentTime = 0;
      jingleBells.current.play().catch((err) => console.log(err));
    } else {
      jingleBells.current.pause();
      jingleBells.current.currentTime = 0;
    }

    dispatch(toggleSnowfall());
  };

  // berem faktura i prihod summy
  useEffect(() => {
    const fetchSum = async () => {
      try {
        const res = await myAxios.get("get_sum_for_header", {
          params: {
            dateFrom: dateFrom,
            dateTo: dateTo, // отправляем пароль на бэкенд
          },
        });

        setTotalSum(res.data);
      } catch (err) {
        console.log("can't getSum");
      }
    };
    fetchSum();
  }, [dateFrom, dateTo]);

  // // const jingleBells = useRef(new Audio("/audio/Christmas-jingle-bells-melody.mp3"));
  // const jingleBells = new Audio("/sounds/Christmas-jingle-bells-melody.mp3");

  // const handleClick = () => {
  //   if (!isSnowfallOn) {
  //     jingleBells.currentTime = 0;
  //     jingleBells.play();
  //   } else {
  //     jingleBells.pause();
  //     jingleBells.currentTime = 0;
  //   }

  //   dispatch(toggleSnowfall());
  // };

  const dispatch = useDispatch();
  const isSnowfallOn = useSelector((state) => state.snowfall.isSnowfallOn);

  const [openModalCloseDay, setOpenModalCloseDay] = useState(false);
  const [dayIsClosed, setDayIsClosed] = useState(false);
  const [lastDayIsNotClosed, setLastDayIsNotClosed] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await myAxios.post("/close_day/", {
        date: dateProwodok,
        action: "close",
        reason,
        user_id: 1,
      });

      if (response.data.success) {
        showNotification(t(response.data.message), "success");
        setDayIsClosed(true);
      } else {
        showNotification(t(response.data.error), "error");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при отправке запроса на сервер");
    } finally {
      setOpenModalCloseDay(false);
    }
  };

  useEffect(() => {
    const checkDate = async () => {
      try {
        const res = await myAxios.get("check_day_closed", {
          params: { date: dateProwodok },
        });

        setDayIsClosed(res.data.is_closed);
        setLastDayIsNotClosed(res.data.last_day_not_closed);
      } catch (error) {
        console.error("Error getting date:", error);
      }
    };

    if (dateProwodok) {
      checkDate();
    }
  }, [dateProwodok]);

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

  return (
    <nav className="bg-gray-900 border-b-2 border-gray-800 shadow-2xl">
      <AnimatePresence>
        {openModalCloseDay && (
          <CloseDayModal setOpenModalCloseDay={setOpenModalCloseDay} handleSubmit={handleSubmit} dateProwodok={dateProwodok} setDateProwodok={setDateProwodok} setReason={setReason} reason={reason} />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-shrink-0">
          <img src="/polisem.png" alt="polisem-icon" className="h-12 lg:h-14 w-auto" />
        </motion.div>

        {/* <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.9, rotate: -10 }} // анимация при клике
          whileHover={{ scale: 1.05, rotate: 5 }} // анимация при ховере
          className="flex items-center gap-2 px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 text-white font-semibold shadow-lg"
        >
          <motion.div
            key={isSnowfallOn ? "on" : "off"} // для анимации смены состояния
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Trees className="w-5 h-5" />
          </motion.div>
          {isSnowfallOn ? "Snow On" : "Snow Off"}
        </motion.button> */}

        {/* Burger button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {/* Date Sections */}
          <div className="flex  items-center gap-3 xl:gap-4">
            {totalSum && (
              <div className="text-gray-300 flex flex-col text-sm">
                <div className="flex gap-3">
                  <span>{t("faktura")}:</span>
                  <span>{totalSum?.credit_40 ? `${formatNumber2(totalSum.credit_40)} USD` : ""} {totalSum.credit_42 ? `${formatNumber2(totalSum.credit_42)}TMT` : ""}</span>
                </div>
                <div className="flex gap-4">
                  <span>{t("prihod")}:</span>
                  <span>{totalSum.debit_50 ? `${formatNumber2(totalSum.debit_50)} USD` : ""} {totalSum.debit_52 ? `${formatNumber2(totalSum.debit_52)}TMT` : ""}</span>
                </div>
              </div>
            )}

            {/* Дата проводок */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 p-1 bg-gray-800 border-2 border-blue-700 rounded-xl shadow-lg"
            >
              {/* <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-gray-200">Дата проводок</span>
              </div> */}

              <input
                type="date"
                value={dateProwodok}
                onChange={(e) => setDateProwodok(e.target.value)}
                className="px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-100 text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpenModalCloseDay(true)}
                disabled={dayIsClosed || lastDayIsNotClosed}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all
                  ${
                    dayIsClosed || lastDayIsNotClosed
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg hover:shadow-emerald-500/50"
                  }`}
              >
                {dayIsClosed ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{t("day is closed")}</span>
                  </>
                ) : lastDayIsNotClosed ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span className="text-xs">{t("last day is not is closed")}</span>
                  </>
                ) : (
                  <>
                    <LockOpen className="w-4 h-4" />
                    <span>{t("close day")}</span>
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Диапазон дат */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex gap-2 p-1 bg-gray-800 border-2 border-purple-700 rounded-xl shadow-lg"
            >
              {/* <div className="flex items-center gap-2 mb-1">
                <CalendarRange className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-gray-200">Диапазон для отчётов</span>
              </div> */}

              <div className="flex gap-2">
                <input
                  type="date"
                  value={localDateFrom}
                  onChange={handleDateFromChange}
                  // value={dateFrom}
                  // onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-100 text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
                <input
                  type="date"
                  value={localDateTo}
                  onChange={handleDateToChange}
                  // value={dateTo}
                  // onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-gray-100 text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="h-20 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

          {/* Auth Links */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-1.5">
            {authGroup === "admin" && (
              <Link to={ROUTES.REGISTER} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-all group">
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{t("register")}</span>
              </Link>
            )}

            <Link to={ROUTES.LOGIN} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-all group">
              <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{t("login")}</span>
            </Link>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-all group">
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{t("logout")}</span>
            </button>
          </motion.div>

          {/* Divider */}
          <div className="h-20 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

          {/* Language & Theme */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex  items-center gap-3">
            <LanguageSwitcher i18n={i18n} />

            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setDarkMode(!darkMode);
                setTimeout(() => {
                  window.dispatchEvent(new Event("theme-toggled"));
                }, 0);
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl
                ${darkMode ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-gradient-to-br from-indigo-600 to-purple-700 text-amber-300"}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </motion.div>

          {/* User Avatar */}
          {user && (
            <>
              <div className="h-20 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-2 pr-4 bg-gray-800 border-2 border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:border-gray-600 transition-all cursor-pointer group"
                onClick={() => setShowAvatarModal(true)}
              >
                <div className="relative">
                  <img src={user.photo} alt="user" className="w-10 h-10 rounded-lg object-cover border-2 border-blue-500 group-hover:border-blue-400 transition-colors" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-100">{user.username}</span>
                  <span className="text-xs text-gray-400">Онлайн</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LargeScreenLinks;
