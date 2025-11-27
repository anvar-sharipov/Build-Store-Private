import { IoIosAddCircleOutline } from "react-icons/io";
import { RiFileExcel2Fill } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";
import { useTranslation } from "react-i18next";
import MyInput from "../../UI/MyInput";
import { useEffect, useState, useRef } from "react";

import { empDownloadExcel } from "./EmpDownloadExcel";
import Tooltip from "../../ToolTip";
import MySearchInput from "../../UI/MySearchInput";
import { myClass } from "../../tailwindClasses";

const EmployeeSearchAndAddSection = ({
  filtered,
  search,
  setSearch,
  clearSearch,
  handleSearchKeyDown,
  setOpenModalAdd,
  addIconButtonRef,
  searchInputRef,
}) => {
  const { t } = useTranslation();

  const [isAnimating, setIsAnimating] = useState(false);

  // for tooltip for add button
  const [hovered, setHovered] = useState(false);

  // for tooltip for download excel button
  const downloadExcelButtonRef = useRef(null);
  const [downloadExcelHovered, setDownloadExcelHovered] = useState(false);

  const handleDownload = () => {
    setIsAnimating(true);
    empDownloadExcel(filtered, t);
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300); // длина анимации 300мс
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        handleDownload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filtered]);

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md p-1 mb-2 flex items-center justify-between px-2 print:hidden">
      <div>
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={myClass.addButton}
          onClick={() => setOpenModalAdd(true)}
          ref={addIconButtonRef}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              searchInputRef.current?.focus();
            }
          }}
        >
          <IoIosAddCircleOutline size={20} />
        </button>
        <Tooltip targetRef={addIconButtonRef} visible={hovered}>
          {t("addEmployee")} (INSERT)
        </Tooltip>
      </div>

      <div className="text-gray-600 dark:text-gray-400 hidden lg:flex items-center gap-3">
        <div>
          {filtered.length > 0 && (
            <div className="flex gap-3 items-center">
              <span>
                {search
                  ? `${t("found")}: ${filtered.length}`
                  : `${t("total")}: ${filtered.length}`}
              </span>
              <RiFileExcel2Fill
                ref={downloadExcelButtonRef}
                onMouseEnter={() => setDownloadExcelHovered(true)}
                onMouseLeave={() => setDownloadExcelHovered(false)}
                size={30}
                className={`cursor-pointer rounded transition-transform duration-300 text-green-700 hover:text-green-600 ${
                  isAnimating ? "scale-125" : "scale-100"
                }`}
                onClick={handleDownload}
                role="button"
                tabIndex={0}
                aria-label="Download Excel"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDownload();
                  }
                }}
              />
              <Tooltip
                targetRef={downloadExcelButtonRef}
                visible={downloadExcelHovered}
              >
                {t("downloadExcel")} (CTRL+E)
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <MySearchInput
          ref={searchInputRef}
          autoComplete="off"
          name="search_employee"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search")}
          onKeyDown={handleSearchKeyDown}
        />
        {/* <div className="flex-grow relative">
          <MyInput
            ref={searchInputRef}
            name="search_employee"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-gray-700 h-7"
            onKeyDown={handleSearchKeyDown}
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold"
              title={t("clearSearch")}
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={() => searchInputRef.current?.focus()}
          className="text-2xl text-blue-500 hover:text-blue-600 transition-colors"
          title={t("search")}
        >
          <CiSearch />
        </button> */}
      </div>
    </div>
  );
};

export default EmployeeSearchAndAddSection;
