import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef } from "react";
import myAxios from "../axios";
import Fuse from "fuse.js";

const FetchPartner2 = ({
  refs,
  dateProwodok,
  getSaldo,
  currentPartner, // текущий выбранный партнер
  onPartnerSelect, // callback для выбора партнера
  fieldName, // "debitPartner" или "creditPartner"
  accountNumber = false,
}) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [allPartners, setAllPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const sound = new Audio("/sounds/up_down.mp3");
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRefs = useRef([]);
  // console.log("accountNumber", accountNumber);

  // Устанавливаем начального партнера при монтировании или изменении currentPartner
  useEffect(() => {
    if (currentPartner) {
      // Если есть текущий партнер, устанавливаем его
      // Компонент автоматически перейдет в режим отображения выбранного партнера
      console.log(`FetchPartner2 ${fieldName}: установлен партнер`, currentPartner);
    }
  }, [currentPartner, fieldName]);

  // Загружаем партнеров
  const fetchPartners = async () => {
    try {
      const res = await myAxios.get("/partners/?no_pagination=1");
      const activePartners = res.data.filter((partner) => partner.is_active);

      // console.log("activePartners", activePartners);
      if (accountNumber === "60" || accountNumber === "62") {
        const klientActivePartner = res.data.filter((partner) => partner.type === "klient")
        setAllPartners(klientActivePartner);
        // console.log("da account ", activePartners);
      } else if (accountNumber === "75" || accountNumber === "76") {
        const founderActivePartner = res.data.filter((partner) => partner.type === "founder")
        setAllPartners(founderActivePartner);
      } else {
        setAllPartners(activePartners);
      }
      // setAllPartners(activePartners);
    } catch (error) {
      console.log("Ошибка при загрузке Partners", error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Закрытие списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setFilteredPartners([]);
        setSearchValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Настраиваем Fuse для поиска
  const fuse = useMemo(
    () =>
      new Fuse(allPartners, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [allPartners]
  );

  // Обработчик поиска
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value) {
      setFilteredPartners([]);
      listRefs.current = [];
      return;
    }

    const results = fuse
      .search(value)
      .slice(0, 20)
      .map((r) => r.item);
    setFilteredPartners(results);
  };

  // Обработчик выбора партнера
  const handleSelectPartner = (partner) => {
    console.log(`FetchPartner2 ${fieldName}: выбран партнер`, partner);
    onPartnerSelect(partner);
    setFilteredPartners([]);
    setSearchValue("");
    listRefs.current = [];
  };

  // Обработчик очистки партнера
  const handleClearPartner = () => {
    console.log(`FetchPartner2 ${fieldName}: очистка партнера`);
    onPartnerSelect(null);
    setFilteredPartners([]);
    setSearchValue("");
    listRefs.current = [];
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  // Если партнер уже выбран - показываем его
  if (currentPartner?.id) {
    return (
      <div className="w-full flex items-center justify-between my-1 gap-3">
        <div
          className={`flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 dark:bg-gray-800 shadow-sm flex-1 ${
            isFocused ? "bg-indigo-200 dark:bg-indigo-600" : "bg-white"
          }`}
        >
          <span className="text-gray-600 dark:text-gray-400 text-sm">{t("partner")}:</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{currentPartner.name}</span>
          {currentPartner.type && <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">{currentPartner.type}</span>}
        </div>
        <button
          type="button"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onClick={handleClearPartner}
          className="ml-3 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-700 
                   text-red-500 dark:text-red-400 transition-colors duration-200 
                   flex items-center justify-center focus:bg-red-300 dark:focus:bg-red-700"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    );
  }

  // Если партнер не выбран - показываем поле поиска
  return (
    <div className="w-full flex-1 relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          autoComplete="off"
          ref={searchInputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filteredPartners.length > 0) {
                handleSelectPartner(filteredPartners[0]);
              }
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              if (listRefs.current.length > 0) {
                listRefs.current[0]?.focus();
              }
            } else if (e.key === "Escape") {
              setFilteredPartners([]);
              setSearchValue("");
            }
          }}
          name={fieldName}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-indigo-200 
                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 
                   dark:placeholder-gray-400 dark:focus:bg-indigo-600 
                   transition-all duration-200"
          placeholder={t("search partner")}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
      </div>

      {/* Список результатов */}
      {filteredPartners.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto border border-black dark:border-black rounded-md shadow-lg bg-gray-200 dark:bg-white">
          {filteredPartners.map((partner, idx) => (
            <li
              tabIndex={0}
              ref={(el) => (listRefs.current[idx] = el)}
              key={partner.id}
              className="px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-100 
                       border-b border-gray-300 dark:border-gray-400 last:border-b-0
                       focus:bg-indigo-200 dark:focus:bg-indigo-200 
                       text-black dark:text-gray-800 transition-colors"
              onClick={() => handleSelectPartner(partner)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSelectPartner(partner);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (listRefs.current.length > idx + 1) {
                    listRefs.current[idx + 1]?.focus();
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (idx === 0) {
                    searchInputRef.current?.focus();
                  } else {
                    listRefs.current[idx - 1]?.focus();
                  }
                } else if (e.key === "Escape") {
                  setFilteredPartners([]);
                  setSearchValue("");
                  searchInputRef.current?.focus();
                }
              }}
            >
              <div className="flex justify-between items-center">
                <span>{partner.name}</span>
                {partner.type && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{partner.type}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FetchPartner2;
