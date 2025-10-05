import { useState, useRef, useEffect, useContext } from "react";
import { myClass } from "../../../tailwindClasses";
import { IoIosAddCircleOutline } from "react-icons/io";
import Tooltip from "../../../ToolTip";
import { RiFileExcel2Fill } from "react-icons/ri";
import MySearchInput from "../../../UI/MySearchInput";
import { SearchContext } from "../../../context/SearchContext";

const ProductAddAndSearchSection = ({ t, products, listItemRefs, totalCount, searchInputRef, setProductAddModalOpen, downloadFilteredExcel }) => {
  const { searchQuery, setSearchQuery, searchParams, setSearchParams } = useContext(SearchContext);
  const addIconRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [addIconHovered, setAddIconHovered] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [excelIconIsAnimating, setExcelIconIsAnimating] = useState(false);
  const excelIconRef = useRef(null);
  const [excelIconHovered, setExcelIconHovered] = useState(false);

  const sound_up_down = new Audio("/sounds/up_down.mp3");
  // Вместо прямого вызова setSearchQuery и setSearchParams при каждом onChange — запустим задержку (например, 300 мс).
  const [tempSearch, setTempSearch] = useState(searchQuery);
  const debounceTimeoutRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setTempSearch(value);

    // Очистить предыдущий таймер
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Запустить новый таймер
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);

      const params = new URLSearchParams(searchParams);
      if (value.trim()) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      setSearchParams(params);
    }, 300); // задержка 300 мс
  };

  // Если searchQuery из контекста обновится снаружи, синхронизируем tempSearch
  useEffect(() => {
    setTempSearch(searchQuery);
  }, [searchQuery]);

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => clearTimeout(debounceTimeoutRef.current);
  }, []);

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md p-1 mb-2 flex items-center justify-between px-2 print:hidden">
      <div>
        <button
          ref={addIconRef}
          onMouseEnter={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setAddIconHovered(true);
            }, 500);
          }}
          onMouseLeave={() => {
            clearTimeout(hoverTimeoutRef.current);
            setAddIconHovered(false);
          }}
          className={myClass.addButton}
          onClick={() => setProductAddModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              searchInputRef.current.focus();
            }
          }}
        >
          <IoIosAddCircleOutline size={20} />
        </button>
        <Tooltip visible={addIconHovered} targetRef={addIconRef}>
          {t("addAgent")} (INSERT)
        </Tooltip>
      </div>

      <div className="text-gray-600 dark:text-gray-400 hidden lg:flex items-center gap-3">
        <div>
          {products.length > 0 && (
            <div className="flex gap-3 items-center">
              <span>
                {t("total")}: {totalCount}
              </span>
              <RiFileExcel2Fill
                size={30}
                className={`cursor-pointer rounded transition-transform duration-300 text-green-700 hover:text-green-600 ${excelIconIsAnimating ? "scale-125" : "scale-100"}`}
                // ref={excelIconRef}
                onClick={downloadFilteredExcel}
                // onMouseEnter={() => {
                //   hoverTimeoutRef.current = setTimeout(() => {
                //     setExcelIconHovered(true);
                //   }, 500);
                // }}
                // onMouseLeave={() => {
                //   clearTimeout(hoverTimeoutRef.current);
                //   setExcelIconHovered(false);
                // }}
              />
            </div>
          )}
          <Tooltip visible={excelIconHovered} targetRef={excelIconRef}>
            {t("downloadExcel")} (CTRL+E)
          </Tooltip>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <MySearchInput
          ref={searchInputRef}
          placeholder={t("search")}
          value={tempSearch}
          onChange={(e) => handleSearchChange(e)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              sound_up_down.currentTime = 0;
              sound_up_down.play();
              addIconRef.current?.focus();
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              sound_up_down.currentTime = 0;
              sound_up_down.play();
              listItemRefs.current[0]?.focus();
            }
          }}
        />
      </div>
    </div>
  );
};

export default ProductAddAndSearchSection;
