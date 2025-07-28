import { useState, useMemo, useEffect, useRef } from "react";
import MySearchInput from "../../../../UI/MySearchInput";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";

const SearchAwto = ({
  awtoInputRef,
  warehouseInputRef,
  partnerInputRef,
  fetchs,
}) => {
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [list, setList] = useState([]);
  const listRefs = useRef([]);
  const { t } = useTranslation();

  // Исправленная логика showSearchInput
  const [showSearchInput, setShowSearchInput] = useState(() => {
    return !values.awto?.id; // показывать поиск, если нет выбранного ID
  });

  const fuse = useMemo(() => {
    return new Fuse(fetchs.AllEmployeers || [], {
      keys: ["name"],
      threshold: 0.3,
    });
  }, [fetchs.AllEmployeers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        awtoInputRef.current &&
        !awtoInputRef.current.contains(event.target)
      ) {
        setList([]); // скрыть список
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [awtoInputRef]);

  // Следим за изменениями values.awto и обновляем showSearchInput
  useEffect(() => {
    setShowSearchInput(!values.awto?.id);
  }, [values.awto?.id]);

  const handleSelectItem = (item) => {
    setFieldValue("awto", { id: item.id, name: item.name });
    setList([]);
    setShowSearchInput(false); // скрыть поиск после выбора
    partnerInputRef.current?.focus();
  };

  const handleClearSelection = () => {
    setFieldValue("awto", { id: null, name: "" });
    setShowSearchInput(true);
    setList([]);
    // Фокус на input после очистки
    setTimeout(() => {
      awtoInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="relative w-full mt-2">
      {showSearchInput ? (
        <div>
          <MySearchInput
            type="text"
            ref={awtoInputRef}
            name="awto_name"
            placeholder={t("delivers")}
            autoComplete="off"
            value={values.awto?.name || ""}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (list.length > 0) {
                   listRefs.current[0]?.focus(); 
                } else {
                    partnerInputRef.current?.focus();
                }
                
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                warehouseInputRef.current?.focus();
              }
            }}
            onChange={(e) => {
              const value = e.target.value;
              setFieldValue("awto", { id: null, name: value });

              if (value.trim() === "") {
                setList([]);
                return;
              }
              const results = fuse.search(value).slice(0, 20).map((res) => res.item);
              setList(results);
            }}
            onBlur={handleBlur}
            className="border px-2 py-1 rounded-md print:hidden"
          />

          {touched.awto && errors.awto && (
            <div className="text-red-500 text-sm print:hidden">
              {errors.awto}
            </div>
          )}

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
                        awtoInputRef.current?.focus();
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
          <span>{t("delivers")}: {values.awto?.name}</span>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-red-500 text-sm hover:underline print:hidden"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAwto;
