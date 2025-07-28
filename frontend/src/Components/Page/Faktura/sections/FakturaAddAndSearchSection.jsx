import { IoAdd } from "react-icons/io5";
import MySearchInput from "../../../UI/MySearchInput";
import { useState, useEffect, useRef } from "react";
import { myClass } from "../../../tailwindClasses";
import Tooltip from "../../../ToolTip";
import SmartTooltip from "../../../SmartTooltip";
import { useNavigate } from "react-router-dom";
import myAxios from "../../../axios";

const FakturaAddAndSearchSection = ({
  t,
  addSalesIconRef,
  searchInputRef,
  searchQuery,
  setSearchQuery,
  handleSearchChange,
  listItemRefs,
  invoices,
}) => {
  // const [addSalesIconHovered, setAddSalesIconHovered] = useState(false);
  const addSalesIconhoverTimeoutRef = useRef(null);
  // const [addSalesIconFocused, setAddSalesIconFocused] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      {/* add and search section */}
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md p-1 mb-2 flex items-center justify-between px-2 print:hidden">
        {/* <div>
          <SmartTooltip tooltip={t("salesInvoice")} shortcut="INSERT">
            <button
              ref={addSalesIconRef}
              className={myClass.addButtonIndogo}
              onClick={() => navigate("/sale-invoices/new")}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  searchInputRef.current.focus();
                }
              }}
            >
              <IoAdd size={20} />
            </button>
          </SmartTooltip>
        </div> */}

        <div>
          <SmartTooltip tooltip={t("salesInvoice")} shortcut="INSERT">
            <button
              ref={addSalesIconRef}
              className={myClass.addButtonIndogo}
              onClick={() => navigate("/sale-invoices/main")}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  searchInputRef.current.focus();
                }
              }}
            >
              <IoAdd size={20} />
            </button>
          </SmartTooltip>
        </div>



        <div className="flex items-end gap-3">
          <MySearchInput
            ref={searchInputRef}
            placeholder={t("search")}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                addSalesIconRef.current?.focus();
              } else if (e.key === "ArrowDown" && invoices.length > 0) {
                e.preventDefault();
                listItemRefs.current[0]?.focus();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FakturaAddAndSearchSection;
