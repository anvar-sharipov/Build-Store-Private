import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { useState, useEffect, useMemo, useRef } from "react";
import myAxios from "../../../axios";
import Fuse from "fuse.js";

const FetchAwto = ({ refs }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur } = useFormikContext();
  const [isFocused, setIsFocused] = useState(false);
  const sound = new Audio("/sounds/up_down.mp3");

  useEffect(() => {
    if (values.is_entry && !values.awto) {
      setFieldValue("awto_send", false, false); // третий аргумент false = не запускать валидацию
    } else {
      setFieldValue("awto_send", true, false);
    }
  }, [values.is_entry, values.awto, setFieldValue]);

  const [allEmployeers, setAllEmployeers] = useState([]);
  const [filteredEmployeers, setFilteredEmployeers] = useState([]);

  const wrapperRef = useRef(null); // <--- контейнер для input+ul

  // Загружаем сотрудников
  const fetchEmployeers = async () => {
    try {
      const res = await myAxios.get("employeers");
      //   const activeEmployeers = res.data.filter((emp) => emp.is_active).sort((a, b) => a.name.localeCompare(b.name));
      setAllEmployeers(res.data);
      //   setFilteredEmployeers(activeEmployeers);
      
    } catch (error) {
      console.log("Ошибка при загрузке employeers", error);
    }
  };

  useEffect(() => {
    fetchEmployeers();
    setTimeout(() => {
      if (refs.awtoRef.current) {
        refs.awtoRef?.current.focus();
      }
    }, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setFilteredEmployeers([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Настраиваем Fuse
  const fuse = useMemo(
    () =>
      new Fuse(allEmployeers, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [allEmployeers]
  );

  // Обработчик поиска
  const handleSearch = (e) => {
    const value = e.target.value;
    if (!value) {
      setFilteredEmployeers([]);
      setTimeout(() => {
        refs.awtoListRef.current = [];
      }, 0);

      return;
    }
    const results = value
      ? fuse
          .search(value)
          .slice(0, 20)
          .map((r) => r.item)
      : allEmployeers;
    setFilteredEmployeers(results);
    
  };

  if (values.awto?.id) {
    return (
      <div className="w-full flex items-center justify-between gap-3 print:hidden my-1 mt-5 text-sm">
        <div
          className={`flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 dark:bg-gray-800 shadow-sm flex-1 ${
            isFocused ? "bg-indigo-200 dark:bg-indigo-600" : "bg-white"
          }`}
        >
          <span className="text-gray-600 dark:text-gray-400 text-sm">{t("awto")}:</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{values.awto?.name}</span>
        </div>
        {values.awto?.name && (
          <button
            type="button"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={refs.awtoX_Ref}
            onClick={() => {
              setFieldValue("awto", null);
              setFilteredEmployeers([]);
              refs.awtoListRef.current = [];
              setTimeout(() => {
                refs.awtoRef.current?.focus();
              }, 0);
            }}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                setFieldValue("awto", null);
                setFilteredEmployeers([]);
                refs.awtoListRef.current = [];
                setTimeout(() => {
                  refs.awtoRef.current?.focus();
                }, 0);
              } else if (e.key == "ArrowDown") {
                e.preventDefault();
                sound.currentTime = 0;
                sound.play();
                if (refs.partnerX_Ref.current) {
                  refs.partnerX_Ref.current?.focus();
                } else {
                  refs.partnerRef.current?.focus();
                }
              }
            }}
            className="ml-3 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-700 text-red-500 dark:text-red-400 transition-colors duration-200 flex items-center justify-center focus:bg-red-300 dark:focus:bg-red-700"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex-1 print:hidden relative" ref={wrapperRef}>
      <label
        className={`block mb-1 text-sm font-medium 
        ${values.is_entry && !values.awto ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
      >
        {t("awto")}
        {values.is_entry && !values.awto && <span className="ml-2 text-red-600 dark:text-red-400 font-normal">{t("choose awto")}</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          ref={refs.awtoRef}
          onChange={handleSearch}
          onBlur={handleBlur}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            } else if (e.key == "ArrowDown") {
              e.preventDefault();
              sound.currentTime = 0;
              sound.play();
              if (refs.awtoListRef.current?.length > 0) {
                refs.awtoListRef.current[0]?.focus();
              } else if (refs.partnerX_Ref.current) {
                refs.partnerX_Ref.current?.focus();
              } else {
                refs.partnerRef.current?.focus();
              }
            }
          }}
          name="awto"
          className={`
    w-full pl-10 pr-4 py-2 rounded-xl border
    focus:outline-none focus:ring-2
    transition-all duration-200
    ${
      values.is_entry && !values.awto
        ? "bg-red-200 border-red-400 focus:ring-red-500 dark:bg-red-700 dark:border-red-500 dark:focus:ring-red-400 dark:text-white"
        : "border-gray-300 focus:ring-blue-400 focus:bg-indigo-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:bg-indigo-600"
    }
  `}
          placeholder={t("search awto")}
        />

        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
      </div>

      {/* Список результатов */}
      {filteredEmployeers.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-70 border border-black dark:border-black rounded-md shadow-sm dark:bg-white bg-gray-200 dark:text-gray-800 text-black">
          {filteredEmployeers.map((emp, idx) => (
            <li
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  setFieldValue("awto", emp);
                  setFilteredEmployeers([]);
                  if (!refs.partnerX_Ref.current) {
                    refs.partnerRef.current?.focus();
                  } else {
                    refs.productRef.current?.focus();
                  }
                } else if (e.key == "ArrowDown") {
                  e.preventDefault();
                  sound.currentTime = 0;
                  sound.play();
                  if (refs.awtoListRef.current.length > idx + 1) {
                    refs.awtoListRef.current[idx + 1]?.focus();
                  }
                } else if (e.key == "ArrowUp") {
                  e.preventDefault();
                  sound.currentTime = 0;
                  sound.play();
                  if (idx === 0) {
                    refs.awtoRef.current?.focus();
                  } else {
                    refs.awtoListRef.current[idx - 1]?.focus();
                  }
                }
              }}
              ref={(el) => (refs.awtoListRef.current[idx] = el)}
              key={emp.id}
              className="px-3 cursor-pointer dark:hover:bg-blue-100 hover:bg-blue-100 border divide-y divide-black focus:bg-indigo-200"
              onClick={() => {
                setFieldValue("awto", emp);
                setFilteredEmployeers([]);
                if (!refs.partnerX_Ref.current) {
                  refs.partnerRef.current?.focus();
                } else {
                  refs.productRef.current?.focus();
                }
              }}
            >
              {emp.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FetchAwto;
