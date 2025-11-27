import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, User, Truck, Package, Plus } from "lucide-react";

const EmployeeList = ({
  employees,
  loading,
  filteredLength,
  loadMore,
  hasMore,
  t,
  search,
  clearSearch,
  listItemRefs,
  handleListKeyDown,
  selectedEmployeeState,
  setEditName,
  setEditId,
  setSelectedListItemRef,
  setOpenModal,
  loadingDeleteId,
  setOpenDeleteModal,
  loadMoreButtonRef,
  setEditType,
  setEditIsActive 
}) => {
  const [selectedEmployee, setSelectedEmployee] = selectedEmployeeState;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  const focusStyles = "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 focus:bg-blue-50 dark:focus:bg-blue-900/20";

  if (!loading && employees.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-center">
        <div className="text-gray-400 text-4xl mb-3">👥</div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
          {search ? t("noSearchResults") : t("empty")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          {search ? t("tryDifferentSearch") : t("addFirstEmployee")}
        </p>
        {search && (
          <button 
            onClick={clearSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t("clearSearch")}
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          <AnimatePresence>
            {employees.map((s, index) => (
              <motion.li
                key={s.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                tabIndex={0}
                ref={(el) => (listItemRefs.current[index] = el)}
                onKeyDown={(e) => handleListKeyDown(e, index, s)}
                className={`p-3 transition-all duration-150 cursor-pointer group ${
                  !s.is_active ? "opacity-60 bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
                } hover:bg-gray-50 dark:hover:bg-gray-800 ${focusStyles}`}
                onDoubleClick={() => {
                  setSelectedEmployee(s);
                  setEditName(s.name);
                  setEditId(s.id);
                  setEditType(s.type || "driver");
                  setEditIsActive(s.is_active !== false);
                  setSelectedListItemRef(index);
                  setOpenModal(true);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Number */}
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{index + 1}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium text-sm truncate ${
                          s.is_active 
                            ? "text-gray-900 dark:text-white" 
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {s.name}
                        </span>
                        {!s.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                            {t("inactive")}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.type === "driver" 
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" 
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        }`}>
                          {s.type === "driver" ? <Truck size={12} /> : <Package size={12} />}
                          <span>{s.type === "driver" ? t("driver") : t("warehouseWorker")}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                    <button
                      className={`p-1.5 rounded transition-colors ${
                        loadingDeleteId === s.id ? "opacity-0" : ""
                      } text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(s);
                        setEditName(s.name);
                        setEditId(s.id);
                        setEditType(s.type || "driver");
                        setEditIsActive(s.is_active !== false);
                        setSelectedListItemRef(index);
                        setOpenModal(true);
                      }}
                      title={t("editEmployee")}
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* <button
                      disabled={loadingDeleteId === s.id}
                      className={`p-1.5 rounded transition-colors ${
                        loadingDeleteId === s.id 
                          ? "opacity-50 cursor-not-allowed" 
                          : "text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDeleteModal({
                          open: true,
                          data: s,
                          index,
                        });
                      }}
                      title={loadingDeleteId === s.id ? t("deletingEmployee") : t("deleteEmployee")}
                    >
                      {loadingDeleteId === s.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button> */}
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {hasMore && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-center">
          <button
            ref={loadMoreButtonRef}
            tabIndex={0}
            onClick={loadMore}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                listItemRefs.current[employees.length - 1]?.focus();
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                loadMore();
              }
            }}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors ${focusStyles}`}
          >
            <span className="flex items-center gap-2">
              <Plus size={16} />
              <span>
                {t("loadMore")} ({filteredLength - employees.length})
              </span>
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default EmployeeList;



// import { GrEdit } from "react-icons/gr";
// import { RiDeleteBin2Fill } from "react-icons/ri";
// import { CiNoWaitingSign } from "react-icons/ci";
// import { myClass } from "../../tailwindClasses";

// const EmployeeList = ({
//   employees,
//   loading,
//   filteredLength,
//   loadMore,
//   hasMore,
//   t,
//   search,
//   clearSearch,
//   listItemRefs,
//   handleListKeyDown,
//   selectedEmployeeState,
//   setEditName,
//   setEditId,
//   setSelectedListItemRef,
//   setOpenModal,
//   loadingDeleteId,
//   setOpenDeleteModal,
//   loadMoreButtonRef,
//   setEditType,
//   setEditIsActive 
// }) => {
//   const [selectedEmployee, setSelectedEmployee] = selectedEmployeeState;

//   if (!loading && employees.length === 0) {
//     return (
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
//         <div className="text-gray-400 text-6xl mb-4">👥</div>
//         <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">{search ? t("noSearchResults") : t("empty")}</h3>
//         <p className="text-gray-500 dark:text-gray-500">{search ? t("tryDifferentSearch") : t("addFirstEmployee")}</p>
//         {search && (
//           <button onClick={clearSearch} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
//             {t("clearSearch")}
//           </button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
//       <div className="border border-gray-300 dark:border-gray-600 rounded-sm overflow-hidden">
//         <ul className={myClass.ul}>
//           {employees.map((s, index) => (
//             <li
//               key={s.id}
//               tabIndex={0}
//               ref={(el) => (listItemRefs.current[index] = el)}
//               onKeyDown={(e) => handleListKeyDown(e, index, s)}
//               className={`${myClass.li} ${!s.is_active ? "opacity-50 bg-gray-100 dark:bg-gray-700" : ""}`}
//               onDoubleClick={() => {
//                 setSelectedEmployee(s);
//                 setEditName(s.name);
//                 setEditId(s.id);
//                 setEditType(s.type || "driver"); // ДОБАВЬТЕ
//                 setEditIsActive(s.is_active !== false); // ДОБАВЬТЕ
//                 setSelectedListItemRef(index);
//                 setOpenModal(true);
//               }}
//             >
//               <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{index + 1}.</div>

//               <div className="flex justify-between min-w-0">
//                 <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
//                   {s.name}
//                   {!s.is_active && <span className="ml-2 text-xs text-red-500 dark:text-red-400">({t("inactive")})</span>}
//                 </div>
//                 <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.type === "driver" ? t("driver") : t("warehouseWorker")}</div>
//               </div>

//               <div className="flex gap-1 justify-end">
//                 <button
//                   className={`p-1 text-gray-800 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-700 rounded transition-colors dark:text-green-500 print:hidden ${
//                     loadingDeleteId === s.id && "opacity-0"
//                   }`}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedEmployee(s);
//                     setEditName(s.name);
//                     setEditId(s.id);
//                     setEditType(s.type || "driver"); // ДОБАВЬТЕ
//                     setEditIsActive(s.is_active !== false); // ДОБАВЬТЕ
//                     setSelectedListItemRef(index);
//                     setOpenModal(true);
//                   }}
//                   title={t("editEmployee")}
//                 >
//                   <GrEdit size={14} />
//                 </button>
//                 <button
//                   disabled={loadingDeleteId === s.id}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setOpenDeleteModal({
//                       open: true,
//                       data: s,
//                       index,
//                     });
//                   }}
//                   className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors print:hidden"
//                   title={loadingDeleteId === s.id ? t("deletingEmployee") : t("deleteEmployee")}
//                   aria-busy={loadingDeleteId === s.id}
//                 >
//                   {/* {loadingDeleteId === s.id ? <CiNoWaitingSign className="animate-spin" size={14} /> : <RiDeleteBin2Fill size={14} />} */}
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {hasMore && (
//         <div className="px-4 py-1 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
//           <button
//             className={myClass.showMore}
//             ref={loadMoreButtonRef}
//             tabIndex={0}
//             onClick={loadMore}
//             onKeyDown={(e) => {
//               if (e.key === "ArrowUp") {
//                 e.preventDefault();
//                 listItemRefs.current[employees.length - 1]?.focus();
//               } else if (e.key === "Enter" || e.key === " ") {
//                 e.preventDefault();
//                 loadMore();
//               }
//             }}
//           >
//             {t("loadMore")} ({filteredLength - employees.length})
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeList;













// import { GrEdit } from "react-icons/gr";
// import { RiDeleteBin2Fill } from "react-icons/ri";
// import { CiNoWaitingSign } from "react-icons/ci";
// import { myClass } from "../../tailwindClasses";

// const EmployeeList = ({
//   employees,
//   loading,
//   filteredLength,
//   loadMore,
//   hasMore,
//   t,
//   search,
//   clearSearch,
//   listItemRefs,
//   handleListKeyDown,
//   selectedEmployeeState,
//   setEditName,
//   setEditId,
//   setSelectedListItemRef,
//   setOpenModal,
//   loadingDeleteId,
//   setOpenDeleteModal,
//   loadMoreButtonRef,
// }) => {
//   const [selectedEmployee, setSelectedEmployee] = selectedEmployeeState;

//   if (!loading && employees.length === 0) {
//     return (
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
//         <div className="text-gray-400 text-6xl mb-4">👥</div>
//         <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
//           {search ? t("noSearchResults") : t("empty")}
//         </h3>
//         <p className="text-gray-500 dark:text-gray-500">
//           {search ? t("tryDifferentSearch") : t("addFirstEmployee")}
//         </p>
//         {search && (
//           <button
//             onClick={clearSearch}
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//           >
//             {t("clearSearch")}
//           </button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
//       <div className="border border-gray-300 dark:border-gray-600 rounded-sm overflow-hidden">
//         <ul className={myClass.ul}>
//           {employees.map((s, index) => (
//             <li
//               key={s.id}
//               tabIndex={0}
//               ref={(el) => (listItemRefs.current[index] = el)}
//               onKeyDown={(e) => handleListKeyDown(e, index, s)}
//               className={myClass.li}
//               onDoubleClick={() => {
//                 setSelectedEmployee(s);
//                 setEditName(s.name);
//                 setEditId(s.id);
//                 setSelectedListItemRef(index);
//                 setOpenModal(true);
//               }}
//             >
//               <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
//                 {index + 1}.
//               </div>
//               <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
//                 {s.name}
//               </div>
//               <div className="flex gap-1 justify-end">
//                 <button
//                   className={`p-1 text-gray-800 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-700 rounded transition-colors dark:text-green-500 print:hidden ${
//                     loadingDeleteId === s.id && "opacity-0"
//                   }`}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedEmployee(s);
//                     setEditName(s.name);
//                     setEditId(s.id);
//                     setSelectedListItemRef(index);
//                     setOpenModal(true);
//                   }}
//                   title={t("editEmployee")}
//                 >
//                   <GrEdit size={14} />
//                 </button>
//                 <button
//                   disabled={loadingDeleteId === s.id}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setOpenDeleteModal({
//                       open: true,
//                       data: s,
//                       index,
//                     });
//                   }}
//                   className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors print:hidden"
//                   title={
//                     loadingDeleteId === s.id
//                       ? t("deletingEmployee")
//                       : t("deleteEmployee")
//                   }
//                   aria-busy={loadingDeleteId === s.id}
//                 >
//                   {loadingDeleteId === s.id ? (
//                     <CiNoWaitingSign className="animate-spin" size={14} />
//                   ) : (
//                     <RiDeleteBin2Fill size={14} />
//                   )}
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {hasMore && (
//         <div className="px-4 py-1 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
//           <button
//             className={myClass.showMore}
//             ref={loadMoreButtonRef}
//             tabIndex={0}
//             onClick={loadMore}
//             onKeyDown={(e) => {
//               if (e.key === "ArrowUp") {
//                 e.preventDefault();
//                 listItemRefs.current[employees.length - 1]?.focus();
//               } else if (e.key === "Enter" || e.key === " ") {
//                 e.preventDefault();
//                 loadMore();
//               }
//             }}
//           >
//             {t("loadMore")} ({filteredLength - employees.length})
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeList;
