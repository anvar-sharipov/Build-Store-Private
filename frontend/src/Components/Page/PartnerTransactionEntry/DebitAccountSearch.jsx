import MySearchInput from "../../UI/MySearchInput";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import myAxios from "../../axios";
import { myClass } from "../../tailwindClasses";
import { useFormikContext } from "formik";

const DebitAccountSearch = ({ debitInputRef, partnerInputRef, debetRefs, X_partner_ref, X_debet_ref, kreditInputRef, X_kredit_ref, price_inputRef }) => {
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
      if (debitInputRef.current && !debitInputRef.current.contains(event.target)) {
        setAccounts([]); // скрыть список
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [debitInputRef]);

  const handleClearSelection = () => {
    setFieldValue("debet", null);
    setTimeout(() => {
      debitInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="relative">
      <label className="block mb-1 font-medium">{t("Debit account")}</label>
      {values.debet ? (
        <div className="relative flex items-center gap-4 max-w-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-gray-100 shadow-sm">
          {/* Кнопка закрытия в правом верхнем углу */}
          <button
            ref={X_debet_ref}
            type="button"
            onClick={handleClearSelection}
            className="absolute top-2 right-2 text-red-500 hover:text-red-600 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center focus:ring-2 focus:ring-red-400 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (X_kredit_ref.current) {
                  X_kredit_ref.current.focus();
                } else {
                  kreditInputRef.current?.focus();
                }
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (X_partner_ref.current) {
                  X_partner_ref.current.focus();
                } else {
                  partnerInputRef.current?.focus();
                }
              }
            }}
          >
            ✕
          </button>

          <span className="flex-shrink-0 font-semibold">{values.debet?.number || "-"}</span>
          <span className="flex-shrink-0">{t(values.debet?.type) || "-"}</span>
        </div>
      ) : (
        <MySearchInput
          ref={debitInputRef}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (X_partner_ref.current) {
                X_partner_ref.current.focus();
              } else {
                partnerInputRef.current?.focus();
              }
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              if (accounts.length > 0) {
                debetRefs.current[0]?.focus();
              } else {
                if (X_kredit_ref.current) {
                  X_kredit_ref.current.focus();
                } else {
                  setTimeout(() => {
                    kreditInputRef.current?.focus();
                  }, 0);
                }
              }
            } else if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          autoComplete="off"
          name="debitAccount"
          type="text"
          placeholder={t("Debit account number")}
          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-gray-100"
        />
      )}

      {accounts.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white dark:bg-gray-800 border rounded shadow-md z-20">
          {accounts.map((item, index) => (
            <li
              key={item.id || index}
              tabIndex={0}
              ref={(el) => (debetRefs.current[index] = el)}
              className={myClass.li}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (accounts.length > index + 1) {
                    debetRefs.current[index + 1]?.focus();
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (index !== 0) {
                    debetRefs.current[index - 1]?.focus();
                  } else {
                    debitInputRef.current?.focus();
                  }
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  console.log(item);
                  setFieldValue("debet", { ...item });
                  setAccounts([]);

                  if (X_kredit_ref.current) {
                    price_inputRef.current?.focus();
                  } else {
                    kreditInputRef.current.focus();
                  }
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

export default DebitAccountSearch;
