import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { useState, useEffect, useMemo, useRef } from "react";
import myAxios from "../../../axios";
import Fuse from "fuse.js";

const FetchPartner = ({ refs, setSaldo, dateProwodok, saldo, getSaldo, saldo2, getSaldo2, setSaldo2, initialPartner }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur } = useFormikContext();
  const [isFocused, setIsFocused] = useState(false);
  const sound = new Audio("/sounds/up_down.mp3");

  // Добавим эффект для установки initialPartner
  useEffect(() => {
    if (initialPartner && !values.partner) {
      setFieldValue("partner", initialPartner, false);
      if (initialPartner.id && dateProwodok) {
        getSaldo(dateProwodok, initialPartner.id);
        getSaldo2(dateProwodok, initialPartner.id);
      }
    }
  }, [initialPartner, dateProwodok]);

  useEffect(() => {
    if (values.is_entry && !values.partner) {
      setFieldValue("partner_send", false, false); // третий аргумент false = не запускать валидацию
    } else {
      setFieldValue("partner_send", true, false);
    }
  }, [values.is_entry, values.partner, setFieldValue]);

  const [allPartners, setAllPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);

  // const getSaldo = async (date, partnerId) => {
  //   try {
  //     const saldo = await myAxios.get("get_saldo_for_partner_for_selected_date", {
  //       params: { date: date, partnerId: partnerId },
  //     });
  //     console.log("saldo", saldo.data.saldo);
  //     setSaldo(saldo.data.saldo);
  //     // console.log('DADADADAD');
  //   } catch (error) {
  //     console.log("error get_saldo_for_partner_for_selected_date from fetchPartner", error);
  //   }
  // };

  if (values.id) {
    useEffect(() => {
      if (values.partner?.id && values.invoice_date2) {
        getSaldo(values.invoice_date2, values.partner?.id);
        getSaldo2(values.invoice_date2, values.partner?.id);
      } else {
        setSaldo(null);
      }
    }, [values.invoice_date2]);
  } else {
    useEffect(() => {
      if (values.partner?.id && dateProwodok) {
        getSaldo(dateProwodok, values.partner?.id);
        getSaldo2(dateProwodok, values.partner?.id);
      } else {
        setSaldo(null);
      }
    }, [dateProwodok]);
  }

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
        setFilteredPartners([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (!value) {
      setFilteredPartners([]);
      setTimeout(() => {
        refs.partnerListRef.current = [];
      }, 0);
      return;
    }
    if (!value) return setFilteredPartners([]);
    const results = value
      ? fuse
          .search(value)
          .slice(0, 20)
          .map((r) => r.item)
      : allPartners;
    setFilteredPartners(results);
    // console.log("results", results);
  };

  if (values.partner?.id) {
    return (
      <div className="w-full flex items-center justify-between print:hidden my-1 gap-3 mt-5 text-sm">
        <div
          className={`flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 dark:bg-gray-800 shadow-sm flex-1 ${
            isFocused ? "bg-indigo-200 dark:bg-indigo-600" : "bg-white"
          }`}
        >
          <span className="text-gray-600 dark:text-gray-400 text-sm">{t("partner")}:</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{values.partner?.name}</span>
        </div>
        {values.partner?.name && (
          <button
            type="button"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={refs.partnerX_Ref}
            onKeyDown={(e) => {
              if (e.key == "ArrowUp") {
                e.preventDefault();
                sound.currentTime = 0;
                sound.play();
                if (refs.awtoX_Ref.current) {
                  refs.awtoX_Ref.current?.focus();
                } else {
                  refs.awtoRef.current?.focus();
                }
              } else if (e.key == "Enter") {
                e.preventDefault();
                setFieldValue("partner", null);
                setFilteredPartners([]);
                refs.partnerListRef.current = [];
                setSaldo(null);
                setSaldo2(null);
                setTimeout(() => {
                  refs.partnerRef.current?.focus();
                }, 0);
              } else if (e.key == "ArrowDown") {
                e.preventDefault();
                sound.currentTime = 0;
                sound.play();
                refs.productRef.current?.focus();
              }
            }}
            onClick={() => {
              setFieldValue("partner", null);
              setFilteredPartners([]);
              refs.partnerListRef.current = [];
              setSaldo(null);
              setSaldo2(null);
              setTimeout(() => {
                refs.partnerRef.current?.focus();
              }, 0);
            }}
            className="ml-3 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-700 
                 text-red-500 dark:text-red-400 transition-colors duration-200 
                 flex items-center justify-center focus:bg-red-300 dark:focus:bg-red-700"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex-1 print:hidden relative" ref={wrapperRef}>
      {/* <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t("partner")}</label> */}
      <label
        className={`block mb-1 text-sm font-medium 
        ${values.is_entry && !values.partner ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
      >
        {t("partner")}
        {values.is_entry && !values.partner && <span className="ml-2 text-red-600 dark:text-red-400 font-normal">{t("choose partner")}</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          onChange={handleSearch}
          autoComplete="off"
          ref={refs.partnerRef}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            } else if (e.key == "ArrowUp") {
              e.preventDefault();
              sound.currentTime = 0;
              sound.play();
              if (refs.awtoX_Ref.current) {
                refs.awtoX_Ref.current?.focus();
              } else {
                refs.awtoRef.current?.focus();
              }
            } else if (e.key == "ArrowDown") {
              e.preventDefault();
              sound.currentTime = 0;
              sound.play();
              if (refs.partnerListRef.current?.length > 0) {
                refs.partnerListRef.current[0]?.focus();
              } else refs.productRef.current?.focus();
            }
          }}
          name="partner"
          className={`
    w-full pl-10 pr-4 py-2 rounded-xl border
    focus:outline-none focus:ring-2
    transition-all duration-200
    ${
      values.is_entry && !values.partner
        ? "bg-red-200 border-red-400 focus:ring-red-500 dark:bg-red-700 dark:border-red-500 dark:focus:ring-red-400 dark:text-white"
        : "border-gray-300 focus:ring-blue-400 focus:bg-indigo-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:bg-indigo-600"
    }
  `}
          placeholder={t("search partner")}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
      </div>

      {/* Список результатов */}
      {filteredPartners.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-70 border border-black dark:border-black rounded-md shadow-sm dark:bg-white bg-gray-200 dark:text-gray-800 text-black">
          {filteredPartners.map((emp, idx) => (
            <li
              tabIndex={0}
              ref={(el) => (refs.partnerListRef.current[idx] = el)}
              key={emp.id}
              className="px-3 cursor-pointer dark:hover:bg-blue-100 hover:bg-blue-100 border divide-y divide-black focus:bg-indigo-200"
              onClick={() => {
                setFieldValue("partner", emp);
                setFilteredPartners([]);
                getSaldo(dateProwodok, emp.id);
                getSaldo2(dateProwodok, emp.id);
                refs.productRef.current?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  setFieldValue("partner", emp);
                  setFilteredPartners([]);
                  getSaldo(dateProwodok, emp.id);
                  getSaldo2(dateProwodok, emp.id);
                  refs.productRef.current?.focus();
                } else if (e.key == "ArrowDown") {
                  e.preventDefault();
                  sound.currentTime = 0;
                  sound.play();
                  if (refs.partnerListRef.current.length > idx + 1) {
                    refs.partnerListRef.current[idx + 1]?.focus();
                  }
                } else if (e.key == "ArrowUp") {
                  e.preventDefault();
                  sound.currentTime = 0;
                  sound.play();
                  if (idx === 0) {
                    refs.partnerRef.current?.focus();
                  } else {
                    refs.partnerListRef.current[idx - 1]?.focus();
                  }
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

export default FetchPartner;
