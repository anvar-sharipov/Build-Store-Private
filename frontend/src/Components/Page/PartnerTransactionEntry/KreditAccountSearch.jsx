import MySearchInput from "../../UI/MySearchInput";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import myAxios from "../../axios";
import { myClass } from "../../tailwindClasses";
import { useFormikContext } from "formik";

const KreditAccountSearch = ({ kreditRefs, debitInputRef, partnerInputRef, debetRefs, X_partner_ref, X_debet_ref, kreditInputRef, X_kredit_ref, price_inputRef }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async (query) => {
    try {
      const response = await myAxios.get(`search-accounts/?q=${query}`);
      setAccounts(response.data);
      console.log("Полученные scheta:", response.data);
    } catch (error) {
      console.error("Ошибка при получении schetow:", error);
    } finally {
    }
  };

  useEffect(() => {
    if (!query) {
      setQuery([]);
      return;
    }
    fetchAccounts(query);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kreditInputRef.current && !kreditInputRef.current.contains(event.target)) {
        setAccounts([]); // скрыть список
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [kreditInputRef]);

  const handleClearSelection = () => {
    setFieldValue("kredit", null);
    setTimeout(() => {
      kreditInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="relative">
      <label className="block mb-1 font-medium">{t("Kredit account")}</label>
      {values.kredit ? (
        <div className="relative flex items-center gap-4 max-w-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-gray-100 shadow-sm">
          <button
            ref={X_kredit_ref}
            type="button"
            onClick={handleClearSelection}
            className="absolute top-2 right-2 text-red-500 hover:text-red-600 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center focus:ring-2 focus:ring-red-400 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                price_inputRef.current?.focus();
                price_inputRef.current?.select();
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (X_debet_ref.current) {
                  X_debet_ref.current.focus();
                } else {
                  debitInputRef.current?.focus();
                }
              }
            }}
          >
            ✕
          </button>

          <span className="flex-shrink-0 font-semibold">{values.kredit?.number || "-"}</span>
          <span className="flex-shrink-0">{t(values.kredit?.type) || "-"}</span>
        </div>
      ) : (
        <MySearchInput
          ref={kreditInputRef}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (X_debet_ref.current) {
                X_debet_ref.current.focus();
              } else {
                debitInputRef.current?.focus();
              }
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              if (accounts.length > 0) {
                kreditRefs.current[0]?.focus();
              } else {
                price_inputRef.current?.focus();
              }
            } else if (e.key === "Enter") {
              e.preventDefault()
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          autoComplete="off"
          type="text"
          placeholder={t("Kredit account number")}
          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-gray-100"
        />
      )}

      {accounts.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white dark:bg-gray-800 border rounded shadow-md z-20">
          {accounts.map((item, index) => (
            <li
              key={item.id || index}
              tabIndex={0}
              ref={(el) => (kreditRefs.current[index] = el)}
              className={myClass.li}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (accounts.length > index + 1) {
                    kreditRefs.current[index + 1]?.focus();
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (index !== 0) {
                    kreditRefs.current[index - 1]?.focus();
                  } else {
                    kreditInputRef.current?.focus();
                  }
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  // console.log(item);
                  setFieldValue("kredit", { ...item });
                  setAccounts([]);

                  price_inputRef.current?.focus();
                  price_inputRef.current?.select();
                }
              }}
            >
              {item.number}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default KreditAccountSearch;
