import { useEffect, useRef, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, Package, DollarSign, ChevronDown, Image, FolderOpen } from "lucide-react";
import { myFormatNumber } from "../../../UI/myFormatNumber";
import { AuthContext } from "../../../../AuthContext";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ROUTES_RAPORT } from "../../../../routes";

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
  // const location = useLocation();
  // const navigate = useNavigate();

  // const showDetailProductOborot = (productId) => {
  //   const params = new URLSearchParams(location.search);
  //   params.set("selected", productId);
  //   navigate(ROUTES_RAPORT.DETAIL_PRODUCT_OBOROT.replace(":id", productId).replace(":warehouseId", warehouseId));
  // };

  const sound_up_down = new Audio("/sounds/up_down.mp3");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="p-2">
        <ul className="space-y-1.5">
          <AnimatePresence>
            {products.map((p, index) => {
              let unit_name = p.base_unit_obj.name;
              let quantity = parseFloat(p.quantity_on_selected_warehouses || p.total_quantity || 0);

              if (p.units.length > 0) {
                p.units.forEach((u) => {
                  if (u.is_default_for_sale) {
                    unit_name = u.unit_name;
                    quantity = quantity / parseFloat(u.conversion_factor);
                  }
                });
              }

              return (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.15, delay: index * 0.01 }}
                  className="group relative bg-white dark:bg-gray-900 rounded-lg p-2 
                    hover:bg-blue-50 dark:hover:bg-blue-950/20
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 focus:bg-blue-50 dark:focus:bg-blue-950/30
                    transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-800
                    hover:border-blue-200 dark:hover:border-blue-800
                    shadow-xs hover:shadow-sm"
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
                      // showDetailProductOborot(p.id)

                      setProductEditModal2({ open: true, data: p, index });
                    } else if (e.key === "ArrowDown" && index + 1 < products.length) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      listItemRefs.current[index + 1]?.focus();
                    } else if (e.key === "ArrowUp" && index !== 0) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      listItemRefs.current[index - 1]?.focus();
                    } else if (e.key === "ArrowUp" && index === 0) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      searchInputRef.current?.focus();
                    } else if (e.key === "ArrowDown" && index + 1 === products.length) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      loadMoreButtonRef.current?.focus();
                    }
                  }}
                >
                  {/* Mobile layout (< 640px) */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{index + 1}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">{p.name}</h3>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-xs">
                              <Package className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span className="font-medium text-amber-700 dark:text-amber-300">{myFormatNumber(quantity, 0)}</span>
                            </div>

                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs">
                              <span className="font-medium text-emerald-700 dark:text-emerald-300">{myFormatNumber(p.retail_price)}</span>
                            </div>

                            {p.category_name_obj?.name && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded text-xs">
                                <FolderOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-blue-700 dark:text-blue-300">{p.category_name_obj.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductEditModal2({ open: true, data: p, index });
                          }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </motion.button>

                        {authUser === "anvar" && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/50 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDeleteModal({ open: true, data: p, index });
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tablet/Desktop layout (>= 640px) */}
                  <div className="hidden sm:flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">{index + 1}</span>
                      </div>

                      {p.images.length > 0 ? (
                        <img src={`${p.images[0].image}`} alt={p.images[0].alt_text || "Product image"} className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                          <Image className="w-5 h-5 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</h3>
                        {p.category_name_obj?.name && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <FolderOpen className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{p.category_name_obj.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap">
                          {myFormatNumber(quantity)} {unit_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{myFormatNumber(p.retail_price)}</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductEditModal2({ open: true, data: p, index });
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>

                        {authUser === "anvar" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDeleteModal({ open: true, data: p, index });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      {/* Load More Button */}
      {nextPageUrl && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <motion.button
            ref={loadMoreButtonRef}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed
              text-white text-sm font-medium rounded-lg 
              transition-all duration-200 flex items-center justify-center gap-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
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
              }
            }}
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>{t("loadMore")}</span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ProductList;

// import { useEffect, useRef, useState, useContext } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Edit3, Trash2, Package, DollarSign, ChevronDown } from "lucide-react";
// import { myFormatNumber } from "../../../UI/myFormatNumber";
// import { AuthContext } from "../../../../AuthContext";

// const ProductList = ({
//   myClass,
//   products,
//   listItemRefs,
//   nextPageUrl,
//   loading,
//   fetchProducts,
//   t,
//   searchInputRef,
//   setClickedNextPageBtn,
//   clickedNextPageBtn,
//   productEditModal,
//   productEditModal2,
//   setProductEditModal2,
//   setOpenDeleteModal,
// }) => {
//   const loadMoreButtonRef = useRef(null);
//   const { authUser, authGroup } = useContext(AuthContext);

//   const sound_up_down = new Audio("/sounds/up_down.mp3");

//   return (
//     <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
//       <div className="p-2 sm:p-3 lg:p-4">
//         <ul className="space-y-1.5 sm:space-y-2">
//           <AnimatePresence>
//             {products.map((p, index) => {
//               let unit_name = p.base_unit_obj.name;
//               let quantity = parseFloat(p.quantity_on_selected_warehouses || p.total_quantity || 0);

//               if (p.units.length > 0) {
//                 p.units.forEach((u) => {
//                   if (u.is_default_for_sale) {
//                     unit_name = u.unit_name;
//                     quantity = quantity / parseFloat(u.conversion_factor);
//                   }
//                 });
//               }

//               return (
//                 <motion.li
//                   key={p.id}
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, x: -100 }}
//                   transition={{ duration: 0.2, delay: index * 0.02 }}
//                   className="group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-3
//                     hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50
//                     dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20
//                     focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-blue-50 dark:focus-within:bg-blue-950/30
//                     transition-all duration-300 cursor-pointer border border-transparent
//                     hover:border-blue-200 dark:hover:border-blue-800
//                     shadow-sm hover:shadow-md sm:hover:shadow-lg"
//                   ref={(el) => (listItemRefs.current[index] = el)}
//                   tabIndex={0}
//                   onClick={() => listItemRefs.current[index]?.focus()}
//                   onDoubleClick={() => {
//                     setProductEditModal2({ open: true, data: p, index });
//                   }}
//                   onKeyDown={(e) => {
//                     if (e.key === "Delete" && authUser === "anvar") {
//                       e.preventDefault();
//                       setOpenDeleteModal({ open: true, data: p, index });
//                     } else if (e.key === "Enter" || e.key === " ") {
//                       e.preventDefault();
//                       setProductEditModal2({ open: true, data: p, index });
//                     } else if (e.key === "ArrowDown" && index + 1 < products.length) {
//                       e.preventDefault();
//                       sound_up_down.currentTime = 0;
//                       sound_up_down.play();
//                       listItemRefs.current[index + 1]?.focus();
//                     } else if (e.key === "ArrowUp" && index !== 0) {
//                       e.preventDefault();
//                       sound_up_down.currentTime = 0;
//                       sound_up_down.play();
//                       listItemRefs.current[index - 1]?.focus();
//                     } else if (e.key === "ArrowUp" && index === 0) {
//                       e.preventDefault();
//                       sound_up_down.currentTime = 0;
//                       sound_up_down.play();
//                       searchInputRef.current?.focus();
//                     } else if (e.key === "ArrowDown" && index + 1 === products.length) {
//                       e.preventDefault();
//                       sound_up_down.currentTime = 0;
//                       sound_up_down.play();
//                       loadMoreButtonRef.current?.focus();
//                     }
//                   }}
//                 >
//                   {/* Gradient overlay on hover */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl pointer-events-none" />

//                   {/* Mobile layout (< 640px) */}
//                   <div className="relative sm:hidden">
//                     {/* Top row: Number + Name */}
//                     <div className="flex items-start gap-2 mb-2">
//                       <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center shadow-sm">
//                         <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{index + 1}</span>
//                       </div>
//                       <h3 className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{p.name}</h3>
//                     </div>

//                     {/* Bottom row: Info + Actions */}
//                     <div className="flex items-center justify-between gap-2">
//                       <div className="flex items-center gap-1.5">
//                         {/* Quantity */}
//                         <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
//                           <Package className="w-3 h-3 text-amber-600 dark:text-amber-400" />
//                           <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{myFormatNumber(quantity, 0)}</span>
//                         </div>

//                         {/* Price */}
//                         <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md">
//                           {/* <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> */}
//                           <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{myFormatNumber(p.retail_price)}</span>
//                         </div>
//                       </div>

//                       {/* Actions */}
//                       <div className="flex items-center gap-1">
//                         <motion.button
//                           whileTap={{ scale: 0.9 }}
//                           className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-md transition-all"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setProductEditModal2({ open: true, data: p, index });
//                           }}
//                         >
//                           <Edit3 className="w-3.5 h-3.5" />
//                         </motion.button>

//                         {authUser === "anvar" && (
//                           <motion.button
//                             whileTap={{ scale: 0.9 }}
//                             className="p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/50 rounded-md transition-all"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setOpenDeleteModal({ open: true, data: p, index });
//                             }}
//                           >
//                             <Trash2 className="w-3.5 h-3.5" />
//                           </motion.button>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Tablet/Desktop layout (>= 640px) */}
//                   <div className="relative hidden sm:flex items-center justify-between gap-3 lg:gap-4">
//                     {/* Left side */}
//                     <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
//                       <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
//                         <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{index + 1}</span>
//                       </div>
//                       <div>{p.images.length > 0 && <img src={`${p.images[0].image}`} alt={p.images[0].alt_text || "Product image"} className="w-20 h-20 object-cover rounded inline-block" />}</div>

//                       <div className="flex-1 min-w-0">
//                         <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 sm:line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                           {p.name}
//                         </h3>
//                       </div>
//                       <div>
//                         {p.category_name_obj.name}
//                       </div>
//                     </div>

//                     {/* Right side */}
//                     <div className="flex lg:flex-col xl:flex-row items-center gap-2 lg:gap-3">
//                       {/* Quantity */}
//                       <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
//                         <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
//                         <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
//                           {myFormatNumber(quantity)} {unit_name}
//                         </span>
//                       </div>

//                       {/* Price */}
//                       <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
//                         {/* <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" /> */}
//                         <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">{myFormatNumber(p.retail_price)}</span>
//                       </div>

//                       {/* Divider */}
//                       {/* <div className="hidden lg:block h-8 w-px bg-gray-300 dark:bg-gray-600" /> */}

//                       {/* Actions */}
//                       <div className="flex items-center gap-0.5 sm:gap-1">
//                         <motion.button
//                           whileHover={{ scale: 1.1 }}
//                           whileTap={{ scale: 0.9 }}
//                           className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-lg transition-all print:hidden"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setProductEditModal2({ open: true, data: p, index });
//                           }}
//                         >
//                           <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         </motion.button>

//                         {authUser === "anvar" && (
//                           <motion.button
//                             whileHover={{ scale: 1.1 }}
//                             whileTap={{ scale: 0.9 }}
//                             className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/50 rounded-lg transition-all print:hidden"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setOpenDeleteModal({ open: true, data: p, index });
//                             }}
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                           </motion.button>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Focus indicator */}
//                   <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-b-lg sm:rounded-b-xl" />
//                 </motion.li>
//               );
//             })}
//           </AnimatePresence>
//         </ul>
//       </div>

//       {/* Load More Button */}
//       {nextPageUrl && (
//         <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-t border-gray-300 dark:border-gray-700">
//           <motion.button
//             ref={loadMoreButtonRef}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600
//               disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
//               text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl
//               transition-all duration-300 flex items-center justify-center gap-2"
//             disabled={!nextPageUrl || loading}
//             onClick={() => {
//               setClickedNextPageBtn(true);
//               fetchProducts(nextPageUrl);
//             }}
//             onKeyDown={(e) => {
//               if (e.key === "ArrowUp") {
//                 listItemRefs.current[products.length - 1].focus();
//               } else if (e.key === "Enter" || e.key === " ") {
//                 e.preventDefault();
//                 setClickedNextPageBtn(true);
//                 fetchProducts(nextPageUrl);
//               }
//             }}
//           >
//             {loading ? (
//               <>
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                   className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
//                 />
//                 <span>Загрузка...</span>
//               </>
//             ) : (
//               <>
//                 <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
//                 <span>{t("loadMore")}</span>
//               </>
//             )}
//           </motion.button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductList;
