import { useState, useRef, useEffect, useContext } from "react";
import { myClass } from "../../../tailwindClasses";
import { IoIosAddCircleOutline } from "react-icons/io";
import Tooltip from "../../../ToolTip";
import { RiFileExcel2Fill } from "react-icons/ri";
import MySearchInput from "../../../UI/MySearchInput";
import { SearchContext } from "../../../context/SearchContext";
import ExcelButton from "../../../UI/Universal/ExcelButton";
import { DateContext } from "../../../UI/DateProvider";
import { useNotification } from "../../../context/NotificationContext";
import myAxios from "../../../axios";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import { formatNumber2 } from "../../../UI/formatNumber2";

const ProductAddAndSearchSection = ({ t, products, listItemRefs, totalCount, searchInputRef, setProductAddModalOpen, downloadFilteredExcel }) => {
  const { searchQuery, setSearchQuery, searchParams, setSearchParams } = useContext(SearchContext);
  const addIconRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [addIconHovered, setAddIconHovered] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const { dateFrom, dateTo } = useContext(DateContext);
  const { showNotification } = useNotification();
  // const [excelIconIsAnimating, setExcelIconIsAnimating] = useState(false);
  // const excelIconRef = useRef(null);
  // const [excelIconHovered, setExcelIconHovered] = useState(false);

  const [downloadExcel, setDownloadExcel] = useState(false);

  const sound_up_down = new Audio("/sounds/up_down.mp3");
  // Вместо прямого вызова setSearchQuery и setSearchParams при каждом onChange — запустим задержку (например, 300 мс).
  const [tempSearch, setTempSearch] = useState(searchQuery);
  const debounceTimeoutRef = useRef(null);

  const downloadExcelProducts = async () => {
    if (!dateFrom || !dateTo) {
      showNotification(t("choose diapazon date"), "error");
      return;
    }

    setDownloadExcel(true);

    try {
      const searchParams = new URLSearchParams(window.location.search);

      const params = new URLSearchParams();

      params.append("dateFrom", dateFrom);
      params.append("dateTo", dateTo);

      const warehouse = searchParams.get("warehouse");
      const categories = searchParams.get("categories");
      const search = searchParams.get("search");
      const is_active = searchParams.get("is_active");

      if (warehouse) params.append("warehouse", warehouse);
      if (categories) params.append("categories", categories);
      if (search) params.append("search", search);
      if (is_active) params.append("is_active", is_active);

      const res = await myAxios.get(`download_excel_products_diapazon?${params.toString()}`, {
        responseType: "blob", // 🔥 ОБЯЗАТЕЛЬНО
      });

      // 👇 скачивание файла
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products_${dateFrom}_${dateTo}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("cant downloadExcelFakturs", err);

      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text(); // 👈 ВАЖНО
        try {
          const json = JSON.parse(text);
          showNotification(t(json.error), "error");
        } catch {
          showNotification("Excel download error", "error");
        }
      } else {
        showNotification(err?.response?.data?.error || "Excel download error", "error");
      }
    } finally {
      setTimeout(() => {
        setDownloadExcel(false);
      }, 1000);
    }
  };

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

      {/* onClick={() => downloadExcelFakturs()}  disabled={downloadExcel}*/}
      <div>
        <ExcelButton classname="px-3 py-1" onClick={() => downloadExcelProducts()} disabled={downloadExcel} />
      </div>

      {/* <div>{t("products found")}: {totalCount}</div> */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="
    inline-flex items-center gap-3
    px-4 py-2
    rounded-2xl
    bg-gradient-to-r from-emerald-500/10 to-teal-500/10
    dark:from-emerald-400/10 dark:to-teal-400/10
    backdrop-blur-md
    border border-emerald-200 dark:border-emerald-800
    shadow-sm
  "
      >
        <div
          className="
      p-2 rounded-xl
      bg-emerald-500/15 dark:bg-emerald-400/20
      text-emerald-600 dark:text-emerald-400
    "
        >
          <Package size={18} />
        </div>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("products found")}:</span>

        <AnimatePresence mode="wait">
          <motion.span
            key={totalCount}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="
        text-lg font-bold tabular-nums
        text-emerald-600 dark:text-emerald-400
      "
          >
            {formatNumber2(totalCount, 0)}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* <div className="text-gray-600 dark:text-gray-400 hidden lg:flex items-center gap-3">
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
      </div> */}

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
