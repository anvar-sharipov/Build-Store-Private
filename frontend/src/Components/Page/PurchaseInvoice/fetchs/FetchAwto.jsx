import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { useState, useEffect, useMemo, useRef } from "react";
import myAxios from "../../../axios";
import Fuse from "fuse.js";

const FetchAwto = ({ autoInputRef }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur } = useFormikContext();
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
      //   console.log("res.data", res.data);
    } catch (error) {
      console.log("Ошибка при загрузке employeers", error);
    }
  };

  useEffect(() => {
    fetchEmployeers();
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
    const results = value
      ? fuse
          .search(value)
          .slice(0, 20)
          .map((r) => r.item)
      : allEmployeers;
    setFilteredEmployeers(results);
    console.log("results", results);
  };

  if (values.awto?.id) {
    return (
      <div className="flex-1 flex items-center print:hidden my-5">
        {values.awto?.name && (
          <button
            type="button"
            onClick={() => {
              setFieldValue("awto", null);
              setFilteredEmployeers([]);
            }}
            className="ml-3 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-700 text-red-500 dark:text-red-400 transition-colors duration-200 flex items-center justify-center"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">{t("awto")}:</span>
          <span className="text-gray-800 dark:text-gray-100 font-semibold">{values.awto?.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 print:hidden relative" ref={wrapperRef}>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t("awto")}</label>
      <div className="relative">
        <input
          type="text"
          ref={autoInputRef}
          onChange={handleSearch}
          onBlur={handleBlur}
          autoComplete="off"
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          name="awto"
          className="
            w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-400
            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
            dark:placeholder-gray-400
            transition-all duration-200
          "
          placeholder={t("search awto")}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
      </div>

      {/* Список результатов */}
      {filteredEmployeers.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-70 border border-black dark:border-black rounded-md shadow-sm dark:bg-white bg-gray-300 dark:text-gray-800 text-black">
          {filteredEmployeers.map((emp) => (
            <li
              key={emp.id}
              className="px-3 cursor-pointer dark:hover:bg-blue-100 hover:bg-blue-100 border divide-y divide-black"
              onClick={() => {
                setFieldValue("awto", emp);
                setFilteredEmployeers([]);
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
