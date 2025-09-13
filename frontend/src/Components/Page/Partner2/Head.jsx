import { IoIosAddCircleOutline } from "react-icons/io";
import { myClass } from "../../tailwindClasses";
import SmartTooltip from "../../SmartTooltip";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useMemo } from "react";
import MySearchInput from "../../UI/MySearchInput";
import { RiFileExcel2Fill } from "react-icons/ri";
import { partnerDownloadExcel } from "./partnerDownloadExcel";
import myAxios from "../../axios";

const Head = ({ setOpenModal, openModal, searchInputRef, setQuery, query, createButtonRef, fetchPartners, page, setPage, partnersListRefs, partners, setUpdateMode, count }) => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDownload = () => {
    setIsAnimating(true);
    const getAllPatners = async () => {
      try {
        const res = await myAxios.get("partners");
        const allPartnersData = res.data.results;
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
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md p-1 mb-2 flex items-center justify-between px-2">
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
              searchInputRef.current?.focus();
            }
          }}
        >
          <IoIosAddCircleOutline size={20} />
        </button>
      </SmartTooltip>

      <div className="flex gap-3 items-center">
        {t("total")}: {count}
        <RiFileExcel2Fill
          role="button"
          size={30}
          className={`cursor-pointer rounded transition-transform duration-300 text-green-700 hover:text-green-600 ${isAnimating ? "scale-125" : "scale-100"}`}
          onClick={handleDownload}
        />
      </div>

      <div className="flex items-end gap-3">
        <MySearchInput
          ref={searchInputRef}
          name="search_partner"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              createButtonRef.current?.focus();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
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
