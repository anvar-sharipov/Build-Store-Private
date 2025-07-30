import { useState, useMemo, useEffect, useRef } from "react";
import MySearchInput from "../../../../UI/MySearchInput";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import refreshTable from "./invoiceTable/refreshTable";

const SearchWarehouse = ({
  warehouseInputRef,
  awtoInputRef,
  fetchs,
  productInputRef,
}) => {
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [list, setList] = useState([]);
  const listRefs = useRef([]);
  const { t } = useTranslation();

  // console.log('values', values);
  

  // Исправленная логика showSearchInput
  const [showSearchInput, setShowSearchInput] = useState(() => {
    return !values.warehouses?.id; // показывать поиск, если нет выбранного ID
  });

  const fuse = useMemo(() => {
    return new Fuse(fetchs.AllWarehouses || [], {
      keys: ["name"],
      threshold: 0.3,
    });
  }, [fetchs.AllWarehouses]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        warehouseInputRef.current &&
        !warehouseInputRef.current.contains(event.target)
      ) {
        setList([]); // скрыть список
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [warehouseInputRef]);

  // Следим за изменениями values.warehouses и обновляем showSearchInput
  useEffect(() => {
    setShowSearchInput(!values.warehouses?.id);
  }, [values.warehouses?.id]);

  const handleSelectItem = (item) => {
    setFieldValue("warehouses", { id: item.id, name: item.name });
    setList([]);
    setShowSearchInput(false); // скрыть поиск после выбора
    
    awtoInputRef.current?.focus(); // tut awtoInputRef wozmojen hidden, esli tak to focus nado na productInputRef.current?.focus();  
    
    refreshTable(values, setFieldValue, item.id );
  };

  const handleClearSelection = () => {
    setFieldValue("warehouses", { id: null, name: "" });
    setShowSearchInput(true);
    setList([]);
    // Фокус на input после очистки
    setTimeout(() => {
      warehouseInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="relative w-full mt-2">
      {showSearchInput ? (
        <div>
          <MySearchInput
            type="text"
            ref={warehouseInputRef}
            name="warehouses_name"
            placeholder={t("warehouse")}
            autoComplete="off"
            value={values.warehouses?.name || ""}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                if (list.length > 0) {
                  e.preventDefault();
                  listRefs.current[0]?.focus();
                } else {
                    awtoInputRef.current?.focus();
                }
              }
            }}
            onChange={(e) => {
              const value = e.target.value;
              setFieldValue("warehouses", { id: null, name: value });

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

          {touched.warehouses && errors.warehouses && (
            <div className="text-red-500 text-sm print:hidden">
              {errors.warehouses}
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
                        warehouseInputRef.current?.focus();
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
          <span>
            {t("warehouse")}: {values.warehouses?.name}
          </span>
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

export default SearchWarehouse;
