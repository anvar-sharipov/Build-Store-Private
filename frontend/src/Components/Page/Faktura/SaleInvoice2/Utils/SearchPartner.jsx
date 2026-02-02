import { useState, useMemo, useEffect, useRef } from "react";
import MySearchInput from "../../../../UI/MySearchInput";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import myAxios from "../../../../axios";

const SearchPartner = ({ partnerInputRef, awtoInputRef, productInputRef, warehouseInputRef, fetchs, setGlobalPartnerId, setSaldo, setGlobalDate, getSaldo }) => {
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [list, setList] = useState([]);
  const listRefs = useRef([]);
  const { t } = useTranslation();

  // Исправленная логика showSearchInput
  const [showSearchInput, setShowSearchInput] = useState(() => {
    return !values.partner?.id; // показывать поиск, если нет выбранного ID
  });

  const fuse = useMemo(() => {
    return new Fuse(fetchs.AllPartners || [], {
      keys: ["name"],
      threshold: 0.3,
    });
  }, [fetchs.AllPartners]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partnerInputRef.current && !partnerInputRef.current.contains(event.target)) {
        setList([]); // скрыть список
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [partnerInputRef]);

  // Следим за изменениями values.partner и обновляем showSearchInput
  useEffect(() => {
    setShowSearchInput(!values.partner?.id);
  }, [values.partner?.id]);

  const handleSelectItem = (item) => {
    setFieldValue("partner", { ...item, id: item.id, name: item.name });
    if (item.id && values.invoice_date) {
      getSaldo(values.invoice_date, item.id);
    }

    // setGlobalPartnerId(item.id)
    // setGlobalDate(values.invoice_date)
    setList([]);
    setShowSearchInput(false); // скрыть поиск после выбора
  };

  const handleClearSelection = () => {
    setFieldValue("partner", { id: null, name: "" });
    setShowSearchInput(true);
    setList([]);
    setSaldo(null);
    // Фокус на input после очистки
    setTimeout(() => {
      partnerInputRef.current?.focus();
    }, 0);
  };



  return (
    <div className="relative mt-2 print:mt-0">
      {showSearchInput ? (
        <div>
          {!values.disabled && (
            <MySearchInput
              type="text"
              ref={partnerInputRef}
              name="partner_name"
              placeholder={t("partner")}
              autoComplete="off"
              value={values.partner?.name || ""}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (list.length > 0) {
                    listRefs.current[0]?.focus();
                  } else {
                    productInputRef.current?.focus();
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  awtoInputRef.current?.focus();
                } else if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value;
                setFieldValue("partner", { id: null, name: value });

                if (value.trim() === "") {
                  setList([]);
                  return;
                }
        

                const results = fuse
                  .search(value)
                  .slice(0, 20)
                  .map((res) => res.item)
                  .filter((item) => item.is_active !== false);
                setList(results);
              }}
              onBlur={handleBlur}
              className="border px-2 py-1 rounded-md print:hidden"
            />
          )}

          {touched.partner && errors.partner && <div className="text-red-500 text-sm print:hidden">{errors.partner}</div>}

          {list.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white dark:bg-gray-800 border rounded shadow-md z-20">
              {list.map((item, index) => (
                <li
                  key={item.id || index}
                  ref={(el) => (listRefs.current[index] = el)}
                  tabIndex={0}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-gray-200"
                  onMouseDown={() => handleSelectItem(item)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (index === 0) {
                        partnerInputRef.current?.focus();
                      } else {
                        listRefs.current[index - 1]?.focus();
                      }
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (index + 1 < list.length) {
                        listRefs.current[index + 1]?.focus();
                      }
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      handleSelectItem(item);
                      productInputRef.current?.focus();
                    }
                  }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="print:text-black font-semibold">
            {t("partner")}: {values.partner?.name}
          </span>
          {!values.disabled && (
            <button type="button" onClick={handleClearSelection} className="text-red-500 text-sm hover:underline print:hidden">
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPartner;
