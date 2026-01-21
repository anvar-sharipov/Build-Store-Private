import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MultipleSelectInputs = ({ title, toggleSelectAll, toggleClearAll, list, choosedList, toggle, onlyDark=false }) => {
  const dropdownRef = useRef(null);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = list.length > 0 && choosedList.length === list.length;

  const handleToggleAll = () => {
    allSelected ? toggleClearAll() : toggleSelectAll();
  };

  return (
    <div className="relative w-full max-w-sm" ref={dropdownRef}>
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center justify-between
          w-full h-9 px-3
          rounded-lg
          border
          text-sm font-medium
          transition

          
          ${onlyDark ? "bg-gray-800 text-white border-gray-700 hover:border-cyan-500" : "bg-white text-gray-800 border-gray-300 hover:border-cyan-600 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:border-cyan-500"}

        `}
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-20 mt-2 w-full
              rounded-lg border shadow-lg
              overflow-hidden
            ${onlyDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700"}
            `}
          >
            <div className="max-h-48 overflow-y-auto">
              <div className={`p-2 space-y-1 text-sm ${onlyDark ? "text-gray-200" : "text-gray-800 dark:text-gray-200"}`}>
                {/* SELECT ALL */}
                <label
                  className={`
                    flex items-center gap-2 px-2 py-1 rounded cursor-pointer
                    
                  ${onlyDark ? "hover:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                  `}
                >
                  <input type="checkbox" checked={allSelected} onChange={handleToggleAll} className="accent-cyan-500" />
                  <span className="font-medium">{t("select all")}</span>
                </label>

                <div className={`border-t my-1 ${onlyDark ? "border-gray-700" : "border-gray-200 dark:border-gray-700"}`} />

                {/* LIST */}
                {list.map((l) => {
                  const checked = choosedList.some((w) => w.id === l.id);

                  return (
                    <label
                      key={l.id}
                      className={`
                        flex items-center gap-2 px-2 py-1 rounded cursor-pointer
                        
                      ${onlyDark ? "hover:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                      `}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggle(l)} className="accent-cyan-500" />
                      <span className="truncate">{l.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultipleSelectInputs;

// import { ChevronDown } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useEffect, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";

// const MultipleSelectInputs = ({ title, toggleSelectAll, toggleClearAll, list, choosedList, toggle }) => {
//   const dropdownRef = useRef(null);
//   const { t } = useTranslation();
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const allSelected = list.length > 0 && choosedList.length === list.length;

//   const handleToggleAll = () => {
//     if (allSelected) {
//       toggleClearAll();
//     } else {
//       toggleSelectAll();
//     }
//   };

//   return (
//     <div className="relative w-full max-w-sm mt-3" ref={dropdownRef}>
//       {/* HEADER */}
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         className="
//           flex items-center justify-between
//           w-full h-9 px-3
//           rounded-lg
//           bg-gray-800
//           border border-gray-700
//           text-sm font-medium text-white
//           hover:border-cyan-500
//           transition
//         "
//       >
//         <span>{title}</span>

//         <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
//       </button>
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: -6 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -6 }}
//             transition={{ duration: 0.15 }}
//             className="
//                 absolute z-20 mt-2 w-full
//                 rounded-lg
//                 bg-gray-800
//                 border border-gray-700
//                 shadow-lg
//                 overflow-hidden
//                 "
//           >
//             <div className="max-h-48 overflow-y-auto">
//               <div className="p-2 space-y-1 text-sm text-gray-200">
//                 {/* SELECT ALL */}
//                 <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
//                   <input type="checkbox" checked={allSelected} onChange={handleToggleAll} className="accent-cyan-500" />
//                   <span className="font-medium">Select all</span>
//                 </label>

//                 <div className="border-t border-gray-700 my-1" />

//                 {/* WAREHOUSE LIST */}
//                 {list.map((l) => {
//                   const checked = choosedList.some((w) => w.id === l.id);

//                   return (
//                     <label key={l.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
//                       <input type="checkbox" checked={checked} onChange={() => toggle(l)} className="accent-cyan-500" />
//                       <span className="truncate">{l.name}</span>
//                     </label>
//                   );
//                 })}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default MultipleSelectInputs;
