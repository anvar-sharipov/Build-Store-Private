import MySearchInput from "../../UI/MySearchInput";
import { useTranslation } from "react-i18next";
import myAxios from "../../axios";
import { Formik, Form, Field } from "formik";
import { useEffect, useState, useRef, useMemo } from "react";
import { myClass } from "../../tailwindClasses";
import { useFormikContext } from "formik";

const PartnerSearch = ({ partnerInputRef, pertnerRefs, debitInputRef, X_partner_ref, X_debet_ref, X_kredit_ref, kreditInputRef, price_inputRef, expense_btn }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [partners, setPartners] = useState([]);
  const [query, setQuery] = useState("");

  const fetchPartners = async (query) => {
    try {
      const response = await myAxios.get(`query-partners/?q=${query}`);
      setPartners(response.data);
      console.log("Полученные партнеры:", response.data);
    } catch (error) {
      console.error("Ошибка при получении партнеров:", error);
    } finally {
    }
  };

  useEffect(() => {
    if (!query) {
      setPartners([]);
      return;
    }
    fetchPartners(query);
  }, [query]);

  useEffect(() => {
    partnerInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partnerInputRef.current && !partnerInputRef.current.contains(event.target)) {
        setPartners([]); // скрыть список
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [partnerInputRef]);

  const handleClearSelection = () => {
    setFieldValue("partner", null);
    setTimeout(() => {
      partnerInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="relative">
      <label className="block mb-1 font-medium">{t("partner")}</label>
      {values.partner ? (
        <div className="relative max-w-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-gray-900 dark:text-gray-100 shadow-md">
          {/* Кнопка закрытия в правом верхнем углу */}
          <button
            type="button"
            onClick={handleClearSelection}
            ref={X_partner_ref}
            className="absolute top-2 right-2 text-red-500 hover:text-red-600 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center focus:ring-2 focus:ring-red-400 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                price_inputRef.current?.focus();
                // if (X_debet_ref.current) {
                //   X_debet_ref.current.focus();
                // } else {
                //   debitInputRef.current.focus();
                // }
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                expense_btn.current?.focus();
              }
            }}
          >
            ✕
          </button>

          <div className="flex flex-col gap-2">
            <span>
              <span className="font-semibold"></span> {values.partner?.name || "-"}
            </span>
            <span>
              <span className="font-semibold"></span> {t(values.partner?.type === "both" ? `${values.partner?.type}2` : values.partner?.type)}
            </span>
            <span>
              <span className="font-semibold">{t("balance")}:</span> {values.partner?.balance ?? "-"}
            </span>
          </div>
        </div>
      ) : (
        <MySearchInput
          ref={partnerInputRef}
          type="text"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (partners.length > 0) {
                pertnerRefs.current[0]?.focus();
              } else {
                price_inputRef.current?.focus();
                // if (X_debet_ref.current) {
                //   X_debet_ref.current.focus();
                // } else {
                //   debitInputRef.current?.focus();
                // }
              }
            } else if (e.key === "Enter") {
              e.preventDefault()
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              expense_btn.current?.focus()
            }
          }}
          placeholder={t("partner")}
          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-gray-100"
        />
      )}

      {partners.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white dark:bg-gray-800 border rounded shadow-md z-20">
          {partners.map((item, index) => (
            <li
              key={item.id || index}
              tabIndex={0}
              ref={(el) => (pertnerRefs.current[index] = el)}
              className={myClass.li}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (partners.length > index + 1) {
                    pertnerRefs.current[index + 1]?.focus();
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (index !== 0) {
                    pertnerRefs.current[index - 1]?.focus();
                  } else {
                    partnerInputRef.current?.focus();
                  }
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  setFieldValue("partner", { ...item });
                  setPartners([]);
                  price_inputRef.current?.focus();
                  price_inputRef.current?.select();

                  // if (X_debet_ref.current) {
                  //   if (X_kredit_ref.current) {
                  //     price_inputRef.current.focus();
                  //   } else {
                  //     kreditInputRef.current?.focus();
                  //   }
                  // } else {
                  //   debitInputRef.current?.focus();
                  // }
                }
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PartnerSearch;
