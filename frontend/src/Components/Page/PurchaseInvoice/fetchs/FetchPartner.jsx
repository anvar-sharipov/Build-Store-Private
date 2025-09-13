import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { useState, useEffect, useMemo, useRef } from "react";
import myAxios from "../../../axios";
import Fuse from "fuse.js";

const FetchPartner = ({partnerInputRef}) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur } = useFormikContext();
  const [allPartners, setAllPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);

  const wrapperRef = useRef(null);

  // Загружаем сотрудников
  const fetchPartners = async () => {
    try {
      const res = await myAxios.get("/partners/?no_pagination=1");
      // console.log('res', res);
        const activePartners = res.data.filter((emp) => emp.is_active);
      setAllPartners(activePartners);
      // console.log('activePartners', activePartners);
      
    } catch (error) {
      console.log("Ошибка при загрузке Partners", error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setFilteredPartners([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Настраиваем Fuse
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
    if (!value) return setFilteredPartners([]);
    const results = value
      ? fuse
          .search(value)
          .slice(0, 20)
          .map((r) => r.item)
      : allPartners;
    setFilteredPartners(results);
    console.log("results", results);
  };

  if (values.partner?.id) {
    return (
      <div className="flex-1 flex items-center print:hidden my-5">
        {values.partner?.name && (
          <button
            type="button"
            onClick={() => {
              setFieldValue("partner", null);
              setFilteredPartners([]);
            }}
            className="ml-3 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-700 text-red-500 dark:text-red-400 transition-colors duration-200 flex items-center justify-center"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">{t("partner")}:</span>
          <span className="text-gray-800 dark:text-gray-100 font-semibold">{values.partner?.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 print:hidden relative" ref={wrapperRef}>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t("partner")}</label>
      <div className="relative">
        <input
          type="text"
          onChange={handleSearch}
          autoComplete="off"
          ref={partnerInputRef}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          name="partner"
          className="
            w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-400
            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
            dark:placeholder-gray-400
            transition-all duration-200
          "
          placeholder={t("search partner")}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
      </div>

      {/* Список результатов */}
      {filteredPartners.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-70 border border-black dark:border-black rounded-md shadow-sm dark:bg-white bg-gray-300 dark:text-gray-800 text-black">
          {filteredPartners.map((emp) => (
            <li
              key={emp.id}
              className="px-3 cursor-pointer dark:hover:bg-blue-100 hover:bg-blue-100 border divide-y divide-black"
              onClick={() => {
                setFieldValue("partner", emp);
                setFilteredPartners([]);
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

export default FetchPartner;

