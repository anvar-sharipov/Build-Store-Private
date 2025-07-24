import { FaClipboardList } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useEffect, useRef, useState, useContext } from "react";
import { myFormatNumber } from "../../../UI/myFormatNumber";
import { MdInventory } from "react-icons/md"; // иконка для количества
import { FaDollarSign } from "react-icons/fa"; // иконка для цены
import { AuthContext } from "../../../../AuthContext";

const ProductList = ({
  myClass,
  products,
  listItemRefs,
  nextPageUrl,
  loading,
  fetchProducts,
  t,
  searchInputRef,
  setClickedNextPageBtn,
  clickedNextPageBtn,
  productEditModal,
  productEditModal2,
  setProductEditModal2,
  setOpenDeleteModal,
}) => {
  const loadMoreButtonRef = useRef(null);

  const { authUser, authGroup } = useContext(AuthContext);

  const openEditWindow = (productId) => {
    window.open(
      `/products/${productId}/edit`,
      "_blank", // открывает в новой вкладке/окне
      "width=900,height=700,scrollbars=yes,resizable=yes"
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="border border-gray-300 dark:border-gray-600 rounded-sm overflow-hidden">
        <ul className={myClass.ul}>
          {products.map((p, index) => {
            console.log("p", p);
            let unit_name = p.base_unit_obj.name;
            // let quantity = parseFloat(p.total_quantity);
            let quantity = parseFloat(p.quantity_on_selected_warehouses || p.total_quantity || 0);
            if (p.units.length > 0) {
              p.units.map((u) => {
                if (u.is_default_for_sale) {
                  unit_name = u.unit_name;
                  quantity = quantity / parseFloat(u.conversion_factor)
                }
              });
            }
            console.log('unit_name', unit_name);
            console.log('quantity', quantity);
            

            return (
              <li
                key={p.id}
                className={`${myClass.li} items-center`}
                ref={(el) => (listItemRefs.current[index] = el)}
                tabIndex={0}
                onClick={() => listItemRefs.current[index]?.focus()}
                onDoubleClick={() => {
                  setProductEditModal2({ open: true, data: p, index });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Delete" && authUser === "anvar") {
                    e.preventDefault();
                    setOpenDeleteModal({ open: true, data: p, index });
                  } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setProductEditModal2({ open: true, data: p, index });
                  } else if (
                    e.key === "ArrowDown" &&
                    index + 1 < products.length
                  ) {
                    e.preventDefault();
                    listItemRefs.current[index + 1]?.focus();
                  } else if (e.key === "ArrowUp" && index !== 0) {
                    e.preventDefault();
                    listItemRefs.current[index - 1]?.focus();
                  } else if (e.key === "ArrowUp" && index === 0) {
                    e.preventDefault();
                    searchInputRef.current?.focus();
                  } else if (
                    e.key === "ArrowDown" &&
                    index + 1 === products.length
                  ) {
                    e.preventDefault();
                    loadMoreButtonRef.current?.focus();
                  }
                }}
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {index + 1}.
                </div>
                <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {p.name}
                </div>

                <div className="flex gap-1 justify-end items-center">
                  <div className="flex flex-col items-end text-sm text-gray-700 dark:text-gray-200 gap-1">
                    <div className="flex items-center gap-1">
                      {/* <MdInventory className="text-yellow-500" /> */}
                      <span>
                        {myFormatNumber(quantity)}{" "}
                        {unit_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="text-green-500" />
                      <span>{myFormatNumber(p.retail_price)}</span>
                    </div>
                  </div>

                  <div className="border-r-4"></div>
                  <button
                    className="p-1 text-gray-800 hover:text-green-700 hover:bg-green-200 dark:hover:bg-green-700 rounded transition-colors dark:text-green-500 print:hidden"
                    onClick={() =>
                      setProductEditModal2({ open: true, data: p, index })
                    }
                  >
                    <GrEdit size={14} />
                  </button>
                  {authUser === "anvar" ? (
                    <button
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-200 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors print:hidden"
                      onClick={() =>
                        setOpenDeleteModal({ open: true, data: p, index })
                      }
                    >
                      <RiDeleteBin2Fill size={14} />
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {nextPageUrl && (
        <div className="px-4 py-1 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
          <button
            ref={loadMoreButtonRef}
            className={myClass.showMore}
            disabled={!nextPageUrl || loading}
            onClick={() => {
              setClickedNextPageBtn(true);
              fetchProducts(nextPageUrl);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                listItemRefs.current[products.length - 1].focus();
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setClickedNextPageBtn(true);
                fetchProducts(nextPageUrl);
                // fetchProducts(nextPageUrl).then(() => {
                //   setNextClicked(true);
                // });
              }
            }}
          >
            {t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
