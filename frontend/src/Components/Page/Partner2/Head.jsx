import { IoIosAddCircleOutline } from "react-icons/io";
import { myClass } from "../../tailwindClasses";
import SmartTooltip from "../../SmartTooltip";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useMemo, useContext } from "react";
import MySearchInput from "../../UI/MySearchInput";
import { RiFileExcel2Fill } from "react-icons/ri";
import { partnerDownloadExcel } from "./partnerDownloadExcel";
import myAxios from "../../axios";
import ExcelButton from "../../UI/Universal/ExcelButton";
import { DateContext } from "../../UI/DateProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { formatNumber2 } from "../../UI/formatNumber2";


const Head = ({
  setOpenModal,
  openModal,
  searchInputRef,
  setQuery,
  query,
  createButtonRef,
  fetchPartners,
  page,
  setPage,
  partnersListRefs,
  partners,
  setUpdateMode,
  count,
  inputValue,
  setInputValue,
}) => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [downloadExcel, setDownloadExcel] = useState(false);
  const { dateFrom, dateTo } = useContext(DateContext);

  const downloadExcelPartners = async () => {
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

      const type = searchParams.get("type"); // founder klient
      const is_active = searchParams.get("is_active");
      const sort = searchParams.get("sort"); // balance_tmt_asc balance_tmt_desc balance_usd_asc balance_usd_desc
      const search = searchParams.get("search");

      if (type) params.append("type", type);
      if (is_active) params.append("is_active", is_active);
      if (search) params.append("search", search);
      if (sort) params.append("sort", sort);

      const res = await myAxios.get(`download_excel_partners_diapazon?${params.toString()}`, {
        responseType: "blob", // 🔥 ОБЯЗАТЕЛЬНО
      });

      // 👇 скачивание файла
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `partners_${dateFrom}_${dateTo}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("cant downloadExcelPartners", err);

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

  const debounceTimeoutRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;

    // 1️⃣ обновляем input сразу
    setInputValue(value);

    // 2️⃣ debounce для реального поиска
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setQuery(value);
    }, 600);
  };

  useEffect(() => {
    return () => clearTimeout(debounceTimeoutRef.current);
  }, []);

  const sound_up_down = new Audio("/sounds/up_down.mp3");

  const handleDownload = () => {
    setIsAnimating(true);
    const getAllPatners = async () => {
      try {
        const res = await myAxios.get("partners/?no_pagination=1");
        const allPartnersData = res.data;
        partnerDownloadExcel(allPartnersData, t);
      } catch (error) {
        console.error("Error fetching all partners:", error);
      } finally {
        // setIsAnimating(false);
      }
    };
    getAllPatners();
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300); // длина анимации 300мс
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Insert") {
        e.preventDefault();
        setOpenModal(true);
      }
      if (e.key === "Escape" && openModal) {
        setOpenModal(false);
        // listItemRefs.current[selectedListItemRef]?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // useEffect(() => {
  //   setPage(1); // сброс страницы
  // }, [query]);

  // useEffect(() => {
  //   // дебаунс для запроса, чтобы не слать запрос при каждом вводе
  //   const delayDebounce = setTimeout(() => {
  //     setPage(1);
  //     fetchPartners(1, query);
  //   }, 300);
  //   return () => clearTimeout(delayDebounce);
  // }, [page, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md p-1 mb-2 flex items-center justify-between px-2 print:hidden">
      <SmartTooltip tooltip={t("addPartner")} shortcut="INSERT">
        <button
          ref={createButtonRef}
          className={myClass.addButton}
          onClick={() => {
            setUpdateMode(false);
            setOpenModal(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              sound_up_down.currentTime = 0;
              sound_up_down.play();
              searchInputRef.current?.focus();
            }
          }}
        >
          <IoIosAddCircleOutline size={20} />
        </button>
      </SmartTooltip>

      {/* <div className="flex gap-3 items-center">
        {t("total")}: {count}
        <RiFileExcel2Fill
          role="button"
          size={30}
          className={`cursor-pointer rounded transition-transform duration-300 text-green-700 hover:text-green-600 ${isAnimating ? "scale-125" : "scale-100"}`}
          onClick={handleDownload}
        />
      </div> */}
      <div className="print:hidden">
        <ExcelButton onClick={downloadExcelPartners} disabled={downloadExcel} />
      </div>

      {/* <div>{t("partners found")}: {count}</div> */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="
    inline-flex items-center gap-3
    px-4 py-2
    rounded-2xl
    bg-gradient-to-r from-blue-500/10 to-indigo-500/10
    dark:from-blue-400/10 dark:to-indigo-400/10
    backdrop-blur-md
    border border-blue-200 dark:border-blue-800
    shadow-sm
  "
      >
        <div
          className="
      p-2 rounded-xl
      bg-blue-500/15 dark:bg-blue-400/20
      text-blue-600 dark:text-blue-400
    "
        >
          <Users size={18} />
        </div>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("partners found")}:</span>

        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="
        text-lg font-bold tabular-nums
        text-blue-600 dark:text-blue-400
      "
          >
            {formatNumber2(count, 0)}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <div className="flex items-end gap-3">
        <MySearchInput
          ref={searchInputRef}
          name="search_partner"
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          placeholder={t("search")}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              sound_up_down.currentTime = 0;
              sound_up_down.play();
              createButtonRef.current?.focus();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              sound_up_down.currentTime = 0;
              sound_up_down.play();
              if (partners.length > 0) {
                partnersListRefs.current[0]?.focus();
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Head;
