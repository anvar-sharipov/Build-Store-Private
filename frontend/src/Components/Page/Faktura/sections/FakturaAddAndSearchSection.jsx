import { IoAdd } from "react-icons/io5";
import MySearchInput from "../../../UI/MySearchInput";
import { useState, useEffect, useRef } from "react";
import { myClass } from "../../../tailwindClasses";
import Tooltip from "../../../ToolTip";
import SmartTooltip from "../../../SmartTooltip";
import { useNavigate } from "react-router-dom";

const FakturaAddAndSearchSection = ({
  t,
  addPurchaseIconRef,
  addSalesIconRef,
  searchInputRef,
  searchQuery,
  setSearchQuery,

}) => {
  const [addPurchaseIconHovered, setAddPurchaseIconHovered] = useState(false);
  const [addPurchaseIconFocused, setAddPurchaseIconFocused] = useState(false);
  const addPurchaseIconhoverTimeoutRef = useRef(null);
  const [addSalesIconHovered, setAddSalesIconHovered] = useState(false);
  const addSalesIconhoverTimeoutRef = useRef(null);
  const [addSalesIconFocused, setAddSalesIconFocused] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      {/* add and search section */}
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md p-1 mb-2 flex items-center justify-between px-2 print:hidden">
        <div>
          <SmartTooltip tooltip={t("purchaseInvoice")} shortcut="INSERT">
            <button
              ref={addPurchaseIconRef}
              className={myClass.addButton4}
              onClick={() => navigate("/purchase-invoices/new")}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  addSalesIconRef.current.focus();
                }
              }}
            >
              <IoAdd size={20} />
            </button>
          </SmartTooltip>
        </div>

        <div>
          <SmartTooltip tooltip={t("salesInvoice")} shortcut="CTRL+INSERT">
            <button
              ref={addSalesIconRef}
              className={myClass.addButtonIndogo}
            onClick={() => navigate("/sale-invoices/new")}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  searchInputRef.current.focus();
                } else if (e.key === "ArrowUp") {
                  addPurchaseIconRef.current.focus();
                  e.preventDefault();
                }
              }}
            >
              <IoAdd size={20} />
            </button>
          </SmartTooltip>
        </div>

        {/* <div className="text-gray-600 dark:text-gray-400 hidden lg:flex items-center gap-3">
          <div>
            {filteredList.length > 0 && (
              <div className="flex gap-3 items-center">
                <span>
                  {t("total")}: {filteredList.length}
                </span>
                <RiFileExcel2Fill
                  size={30}
                  className={`cursor-pointer rounded transition-transform duration-300 text-green-700 hover:text-green-600 ${
                    excelIconIsAnimating ? "scale-125" : "scale-100"
                  }`}
                  ref={excelIconRef}
                  onClick={handleDownloadExcel}
                  onMouseEnter={() => {
                    hoverTimeoutRef.current = setTimeout(() => {
                      setExcelIconHovered(true);
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    clearTimeout(hoverTimeoutRef.current);
                    setExcelIconHovered(false);
                  }}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                addSalesIconRef.current?.focus();
              }
              //   if (e.key === "ArrowDown" && filteredList.length > 0) {
              //     e.preventDefault();

              //     listItemRefs.current[0]?.focus();
              //   }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FakturaAddAndSearchSection;
