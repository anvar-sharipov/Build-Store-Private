import { useState, useMemo, useEffect, useRef } from "react";
import MySearchInput from "../../../../UI/MySearchInput";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import refreshTable from "./invoiceTable/refreshTable";
import VisibleHideInputs from "./VisibleHideInputs";
import PrintVisibleHideInputs from "./PrintVisibleHideInputs";
import PriceType from "./invoiceTable/PriceType";
import { Settings } from "lucide-react";

const SearchWarehouse = ({
  warehouseInputRef,
  awtoInputRef,
  fetchs,
  printVisibleColumns,
  setPrintVisibleColumns,
  userPrintVisibleColumns,
  adminPrintVisibleColumns,
  visibleColumns,
  setVisibleColumns,
  adminVisibleColumns,
  userVisibleColumns,
}) => {
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [list, setList] = useState([]);
  const listRefs = useRef([]);
  const { t } = useTranslation();
  const [openParametrs, setOpenParametrs] = useState(false);

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
      if (warehouseInputRef.current && !warehouseInputRef.current.contains(event.target)) {
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
    const selectedWarehouse = { id: item.id, name: item.name };
    setFieldValue("warehouses", selectedWarehouse);

    // Сохраняем в localStorage
    localStorage.setItem("selectedWarehouse", JSON.stringify(selectedWarehouse));

    setList([]);
    setShowSearchInput(false); // скрыть поиск после выбора

    awtoInputRef.current?.focus(); // tut awtoInputRef wozmojen hidden, esli tak to focus nado na productInputRef.current?.focus();

    refreshTable(values, setFieldValue, item.id);
  };

  const handleClearSelection = () => {
    localStorage.removeItem("selectedWarehouse");
    setFieldValue("warehouses", { id: null, name: "" });
    setShowSearchInput(true);
    setList([]);
    // Фокус на input после очистки
    setTimeout(() => {
      warehouseInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="relative w-full mt-2 flex justify-between">
      <div className="w-full">
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
                } else if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value;
                setFieldValue("warehouses", { id: null, name: value });

                if (value.trim() === "") {
                  setList([]);
                  return;
                }
                const results = fuse
                  .search(value)
                  .slice(0, 20)
                  .map((res) => res.item);
                setList(results);
              }}
              onBlur={handleBlur}
              className="border px-2 py-1 rounded-md print:hidden"
            />

            {touched.warehouses && errors.warehouses && <div className="text-red-500 text-sm print:hidden">{errors.warehouses}</div>}

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
          <div className="flex items-center gap-2 print:text-black">
            <span>
              {t("warehouse")}: {values.warehouses?.name}
            </span>
            {!values.disabled && (
              <button type="button" onClick={handleClearSelection} className="text-red-500 text-sm hover:underline print:hidden">
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="print:hidden">
          <button onClick={() => setOpenParametrs((prev) => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" title="Настройки отображения" type="button">
            <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>

          {openParametrs && (
            <div className="absolute z-50 mt-2 right-0 p-4 bg-gray-200 dark:bg-gray-900 border rounded-lg shadow-lg space-y-4">
              <PriceType />
              <div className="flex justify-between">
                <VisibleHideInputs visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} adminVisibleColumns={adminVisibleColumns} userVisibleColumns={userVisibleColumns} />
                <PrintVisibleHideInputs
                  printVisibleColumns={printVisibleColumns}
                  setPrintVisibleColumns={setPrintVisibleColumns}
                  userPrintVisibleColumns={userPrintVisibleColumns}
                  adminPrintVisibleColumns={adminPrintVisibleColumns}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchWarehouse;
