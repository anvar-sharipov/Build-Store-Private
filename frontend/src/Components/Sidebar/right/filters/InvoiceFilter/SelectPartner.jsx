import { FaTimes } from "react-icons/fa";
import Fuse from "fuse.js";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const SelectPartner = ({ selectedPartner, partnerX_Ref, setSelectedPartner, setFilteredPartners, partnerListRef, allPartners, partnerInputRef, filteredPartners }) => {
  const { t } = useTranslation();
  
  const fuse = useMemo(
    () =>
      new Fuse(allPartners, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [allPartners]
  );

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
        <span className="text-cyan-400">👥</span>
        {t("By partners")}
      </label>

      {selectedPartner?.id ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 rounded-xl">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-cyan-400" />
            </div>

            {/* Partner name */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Выбран</p>
              <p className="text-sm font-bold text-white truncate">{selectedPartner?.name}</p>
            </div>

            {/* Remove button */}
            <motion.button
              type="button"
              ref={partnerX_Ref}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setSelectedPartner(null);
                  setFilteredPartners([]);
                  partnerListRef.current = [];
                  setTimeout(() => {
                    partnerInputRef.current?.focus();
                  }, 0);
                }
              }}
              onClick={() => {
                setSelectedPartner(null);
                setFilteredPartners([]);
                partnerListRef.current = [];
                setTimeout(() => {
                  partnerInputRef.current?.focus();
                }, 0);
              }}
              className="flex-shrink-0 w-8 h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 flex items-center justify-center focus:ring-2 focus:ring-red-400 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-10" />
            
            <motion.input
              type="text"
              placeholder="Поиск партнера..."
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setFilteredPartners([]);
                  setTimeout(() => {
                    partnerListRef.current = [];
                  }, 0);
                  return;
                }
                const results = value
                  ? fuse
                      .search(value)
                      .slice(0, 20)
                      .map((r) => r.item)
                  : allPartners;
                setFilteredPartners(results);
              }}
              autoComplete="off"
              ref={partnerInputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (partnerListRef.current?.length > 0) {
                    partnerListRef.current[0]?.focus();
                  }
                }
              }}
              className="w-full h-11 pl-11 pr-4 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                transition-all duration-300 hover:border-gray-600"
              whileFocus={{ scale: 1.01 }}
            />
          </div>

          {/* Results dropdown */}
          <AnimatePresence>
            {filteredPartners.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto bg-gray-800 border-2 border-gray-700 rounded-xl shadow-2xl"
              >
                {filteredPartners.map((emp, idx) => (
                  <motion.li
                    key={emp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    tabIndex={0}
                    ref={(el) => (partnerListRef.current[idx] = el)}
                    className="group relative flex items-center gap-3 px-4 py-3 cursor-pointer 
                      hover:bg-cyan-500/10 focus:bg-cyan-500/20 focus:outline-none
                      border-b border-gray-700 last:border-b-0 transition-colors"
                    onClick={() => {
                      setSelectedPartner(emp);
                      setFilteredPartners([]);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setSelectedPartner(emp);
                        setFilteredPartners([]);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (partnerListRef.current.length > idx + 1) {
                          partnerListRef.current[idx + 1]?.focus();
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (idx === 0) {
                          partnerInputRef.current?.focus();
                        } else {
                          partnerListRef.current[idx - 1]?.focus();
                        }
                      }
                    }}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-700 group-hover:bg-cyan-500/20 group-focus:bg-cyan-500/30 rounded-lg flex items-center justify-center transition-colors">
                      <User className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 group-focus:text-cyan-400 transition-colors" />
                    </div>

                    {/* Name */}
                    <span className="flex-1 text-sm text-gray-200 group-hover:text-white group-focus:text-white font-medium transition-colors">
                      {emp.name}
                    </span>

                    {/* Indicator */}
                    <div className="flex-shrink-0 w-2 h-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity" />
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SelectPartner;