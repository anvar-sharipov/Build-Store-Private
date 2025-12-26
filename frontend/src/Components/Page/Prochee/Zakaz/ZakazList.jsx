import myAxios from "../../../axios";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useContext, useRef } from "react";
import { DateContext } from "../../../UI/DateProvider";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MyFormatDate from "../../../UI/MyFormatDate";
import { formatNumber2 } from "../../../UI/formatNumber2";
import { useNavigate } from "react-router-dom";
import { Pencil, Calendar, Warehouse } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setZakazCount, setZakazItems } from "../../../../app/store/zakazSlice";
import { useSelector } from "react-redux";

const ZakazList = () => {
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);
  const location = useLocation();
  const { t } = useTranslation();
  const [loadingList, setLoadingList] = useState(false);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const focusId = location.state?.focusId || null;

  const selectedPartner = useSelector((state) => state.zakaz.selectedPartner);
  const selectedBuyer = useSelector((state) => state.zakaz.selectedBuyer);
  useEffect(() => {
    console.log("selectedBuyer", selectedBuyer);
  }, [selectedBuyer]);

  const up_down = new Audio("/sounds/up_down.mp3");

  const dispatch = useDispatch();

  console.log("focusId", focusId);

  const [currentIndex, setCurrentIndex] = useState(0);

  const itemRefs = useRef([]);

  // useEffect(() => {
  //   if (items.length > 0) {
  //     setCurrentIndex(0); // первый элемент индекс 0
  //     itemRefs.current[0]?.focus(); // ставим фокус
  //   }
  // }, [items]);

  useEffect(() => {
    if (items.length === 0) return;

    if (focusId) {
      const index = items.findIndex((item) => item.id === focusId);
      if (index !== -1) {
        setCurrentIndex(index);
        const el = itemRefs.current[index];
        if (el) {
          el.focus({ preventScroll: true }); // фокус без резкого скролла
          el.scrollIntoView({ behavior: "smooth", block: "center" }); // плавный скролл к элементу
        }
      }
    } else {
      setCurrentIndex(0);
      itemRefs.current[0]?.focus();
    }
  }, [items, focusId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentIndex((prev) => {
          up_down.currentTime = 0;
          up_down.play();
          const nextIndex = Math.min(prev + 1, items.length - 1);
          itemRefs.current[nextIndex]?.focus();
          return nextIndex;
        });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentIndex((prev) => {
          up_down.currentTime = 0;
          up_down.play();
          const prevIndex = Math.max(prev - 1, 0);
          itemRefs.current[prevIndex]?.focus();
          return prevIndex;
        });
      }

      if (e.key === "Enter") {
        navigate(`/zakaz/${items[currentIndex].id}/`);
      }
    };

    if (currentIndex !== -1) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [currentIndex, items]);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = t("zakaz list");
  }, [t]);

  const getZakazList = async () => {
    setLoadingList(true);
    try {
      const res = await myAxios.get("zakaz_list", {
        params: {
          dateFrom,
          dateTo,
          partner_id: selectedPartner?.id,
          buyer_id: selectedBuyer?.id,
        },
      });
      setItems(res.data.data);
      dispatch(setZakazItems(res.data.data));
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingList(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!dateFrom || !dateTo) return;

    setLoaded(false); // 💡 важно
    const timer = setTimeout(getZakazList, 500);

    return () => clearTimeout(timer);
  }, [dateFrom, dateTo, selectedPartner, selectedBuyer]);

  return (
    <div>
      {loadingList ? (
        <div className="flex items-center justify-center min-h-[400px] print:hidden">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 dark:text-blue-400 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Загрузка данных...</p>
          </motion.div>
        </div>
      ) : !loaded ? null : items.length > 0 ? (
        <div
          tabIndex={0}
          onFocus={() => console.log("FOCUS")}
          onBlur={(e) => {
            // важно! проверяем, ушёл ли фокус ВНЕ блока
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setCurrentIndex(-1);
            }
          }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.002] px-6 py-1"
        >
          <ul className="divide-y divide-gray-200/70 dark:divide-gray-700/50">
            {items.map((item, index) => {
              return (
                <li
                  ref={(el) => (itemRefs.current[index] = el)}
                  tabIndex={0}
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    itemRefs.current[index]?.focus();
                  }}
                  className={`
            relative px-4 py-4 cursor-pointer transition-all duration-300
            border-l-4 border-transparent
            hover:border-l-blue-500 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-white/50 
            dark:hover:from-blue-900/20 dark:hover:to-gray-800/50
            hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5
            active:scale-[0.995] active:duration-100
            focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-inset
            focus:border-l-blue-600 focus:bg-gradient-to-r focus:from-blue-100 focus:to-white
            dark:focus:from-blue-900/40 dark:focus:to-gray-800
            group/item
            ${index % 2 === 0 ? "bg-white/50 dark:bg-gray-900/50" : "bg-gray-50/50 dark:bg-gray-800/50"}
          `}
                  onDoubleClick={() => navigate(`/zakaz/${item.id}/`)}
                >
                  {/* Индекс элемента - визуальный маркер */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                    {index + 1}
                  </div>

                  {/* Полоска-разделитель справа */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-16 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>

                  {/* Первая строка: Основная информация - на виду */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-3 items-center">
                      {/* Партнер */}
                      <div className="flex items-center gap-2 group/partner relative">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 group-hover:scale-125 group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-300 shadow-md"></div>
                        <span className="font-bold text-blue-700 dark:text-blue-300 text-sm bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                          {item.partner_name || "—"}
                        </span>
                        <div className="absolute -top-8 left-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/partner:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Партнер
                        </div>
                      </div>

                      {/* Стрелка */}
                      <div className="px-1 transform group-hover/item:translate-x-2 transition-transform duration-300">
                        <svg className="w-5 h-5 text-gray-500 group-hover/item:text-blue-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      {/* Покупатель */}
                      <div className="flex items-center gap-2 group/buyer relative">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 group-hover:scale-125 group-hover:from-green-300 group-hover:to-green-500 transition-all duration-300 shadow-md"></div>
                        <span className="font-bold text-green-700 dark:text-green-300 text-sm bg-gradient-to-r from-green-600 to-green-700 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
                          {item.buyer_name || "—"}
                        </span>
                        <div className="absolute -top-8 left-0 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/buyer:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Покупатель
                        </div>
                      </div>
                    </div>

                    {/* Сумма - справа */}
                    <div className="flex items-center gap-2 group/sum relative">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 group-hover:scale-125 group-hover:from-red-300 group-hover:to-red-500 transition-all duration-300 shadow-md"></div>
                      <span className="font-bold text-xl text-red-600 dark:text-red-400 group-hover/item:scale-110 transition-transform duration-300 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-400 dark:to-red-500 bg-clip-text text-transparent">
                        {formatNumber2(item.products_total_price)} TMT
                      </span>
                      <div className="absolute -top-8 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/sum:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                        Сумма заказа
                      </div>
                    </div>
                  </div>

                  {/* Вторая и третья строка объединены в одну */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Левая часть: мета-информация */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Дата создания */}
                      <div className="flex items-center gap-1.5 group/created relative">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/15 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900/40 dark:group-hover:to-blue-800/30 transition-all duration-300 shadow-sm">
                          <svg className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-blue-800 dark:text-blue-200 text-xs font-medium">{MyFormatDate(item.created_at_handle)}</span>
                        </div>
                        {item.created_by_name && (
                          <span className="text-blue-700 dark:text-blue-300 font-semibold px-2 py-1 bg-blue-100/60 dark:bg-blue-900/30 rounded-lg text-xs backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
                            {item.created_by_name}
                          </span>
                        )}
                        <div className="absolute -top-7 left-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover/created:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Создан
                        </div>
                      </div>

                      {/* Дата обновления */}
                      <div className="flex items-center gap-1.5 group/updated relative">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/15 rounded-xl group-hover:from-green-100 group-hover:to-green-200 dark:group-hover:from-green-900/40 dark:group-hover:to-green-800/30 transition-all duration-300 shadow-sm">
                          <svg className="w-3.5 h-3.5 text-green-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-green-800 dark:text-green-200 text-xs font-medium">{MyFormatDate(item.updated_at_handle)}</span>
                        </div>
                        {item.updated_by_name && (
                          <span className="text-green-700 dark:text-green-300 font-semibold px-2 py-1 bg-green-100/60 dark:bg-green-900/30 rounded-lg text-xs backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
                            {item.updated_by_name}
                          </span>
                        )}
                        <div className="absolute -top-7 left-0 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover/updated:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Обновлен
                        </div>
                      </div>

                      {/* Номер заказа */}
                      <div className="group/id relative">
                        <span className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white px-2.5 py-1.5 rounded-xl font-bold text-xs shadow-md group-hover:from-gray-900 group-hover:to-black transition-all duration-300">
                          №{item.id}
                        </span>
                        <div className="absolute -top-7 left-0 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover/id:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Номер заказа
                        </div>
                      </div>
                    </div>

                    {/* Правая часть: вторичная информация */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Склад */}
                      <div className="flex items-center gap-1.5 group/warehouse relative">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-50/80 to-purple-100/80 dark:from-purple-900/15 dark:to-purple-800/10 rounded-xl group-hover:from-purple-100 group-hover:to-purple-200 dark:group-hover:from-purple-900/30 dark:group-hover:to-purple-800/20 transition-all duration-300 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 group-hover:scale-125 transition-transform"></div>
                          <svg className="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                          <span className="text-purple-800 dark:text-purple-200 text-xs font-medium">{item.warehouse_name}</span>
                        </div>
                        <div className="absolute -top-7 left-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover/warehouse:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Склад
                        </div>
                      </div>

                      {/* Количество товаров */}
                      <div className="flex items-center gap-1.5 group/qty relative">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-50/80 to-amber-100/80 dark:from-amber-900/15 dark:to-amber-800/10 rounded-xl group-hover:from-amber-100 group-hover:to-amber-200 dark:group-hover:from-amber-900/30 dark:group-hover:to-amber-800/20 transition-all duration-300 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 group-hover:scale-125 transition-transform"></div>
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                          </svg>
                          <span className="text-amber-800 dark:text-amber-200 text-xs font-medium">{item.products_count} шт.</span>
                        </div>
                        <div className="absolute -top-7 left-0 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover/qty:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Товаров
                        </div>
                      </div>

                      {/* Сумма заказа (вторично) */}
                      <div className="flex items-center gap-1.5 group/secondary-sum relative">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl group-hover:from-gray-200 group-hover:to-gray-300 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600 transition-all duration-300 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 group-hover:scale-125 transition-transform"></div>
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">{formatNumber2(item.products_total_price)} TMT</span>
                        </div>
                        <div className="absolute -top-7 left-0 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover/secondary-sum:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Сумма
                        </div>
                      </div>

                      {/* Кнопка редактирования */}
                      <div className="group/edit relative opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                        <Pencil
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/zakaz/${item.id}/`);
                          }}
                          className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                        />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover/edit:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                          Редактировать
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div>Нет данных</div>
      )}
    </div>
  );
};

export default ZakazList;
