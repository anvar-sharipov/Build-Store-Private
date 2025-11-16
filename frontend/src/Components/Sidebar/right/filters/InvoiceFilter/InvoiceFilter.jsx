import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useMemo, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, CheckCircle, XCircle, ArrowUpDown, User } from "lucide-react";
import myAxios from "../../../../axios";
import SelectPartner from "./SelectPartner";
import SelectEnryBoolen from "./SelectEnryBoolen";
import InvoiceSort from "./InvoiceSort";
import { DateContext } from "../../../../UI/DateProvider";

const InvoiceFilter = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [wozwratOrPrihod, setWozwratOrPrihod] = useState(searchParams.get("wozwrat_or_prihod") || "");
  const [allPartners, setAllPartners] = useState([]);
  const partnerInputRef = useRef(null);
  const partnerListRef = useRef([]);
  const partnerX_Ref = useRef(null);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState("");
  const [sortInvoice, setSortInvoice] = useState("");
  const change_type = new Audio("/sounds/change_type.mp3");

  const fetchPartners = async () => {
    try {
      const res = await myAxios.get("/partners/?no_pagination=1");
      console.log("res.data", res.data);
      setAllPartners(res.data);
    } catch (error) {
      console.log("Ошибка при загрузке Partners", error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (wozwratOrPrihod) {
      params.set("wozwrat_or_prihod", wozwratOrPrihod);
    } else {
      params.delete("wozwrat_or_prihod");
    }
    if (selectedPartner?.id) {
      params.set("partner_id", selectedPartner.id);
    } else {
      params.delete("partner_id");
    }
    if (selectedEntry === "entried" || selectedEntry === "notEntried" || selectedEntry === "canceled") {
      params.set("selectedEntry", selectedEntry);
    } else {
      params.delete("selectedEntry");
    }
    if (sortInvoice) {
      params.set("sortInvoice", sortInvoice);
    } else {
      params.delete("sortInvoice");
    }

    // Добавляем даты в URL
    if (dateFrom) {
      params.set("dateFrom", dateFrom);
    } else {
      params.delete("dateFrom");
    }

    if (dateTo) {
      params.set("dateTo", dateTo);
    } else {
      params.delete("dateTo");
    }

    setSearchParams(params);
  }, [wozwratOrPrihod, selectedPartner, selectedEntry, sortInvoice, dateFrom, dateTo]);

  const typeOptions = [
    { value: "", label: t("all"), color: "from-gray-500 to-gray-600", icon: "📄" },
    { value: "wozwrat", label: t("wozwrat"), color: "from-rose-500 to-pink-600", icon: "↩️" },
    { value: "prihod", label: t("prihod"), color: "from-blue-500 to-indigo-600", icon: "📥" },
    { value: "rashod", label: t("rashod"), color: "from-emerald-500 to-teal-600", icon: "📤" },
    { value: "transfer", label: t("transfer"), color: "from-emerald-500 to-teal-600", icon: "📤" },
  ];

  const hasActiveFilters = wozwratOrPrihod || selectedPartner || selectedEntry || sortInvoice;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-4 space-y-4 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Фильтры</h3>
        </div>
        {hasActiveFilters && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setWozwratOrPrihod("");
              setSelectedPartner(null);
              setSelectedEntry("");
              setSortInvoice("");
            }}
            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            title="Сбросить все"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Partner Select */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SelectPartner
          selectedPartner={selectedPartner}
          partnerX_Ref={partnerX_Ref}
          setSelectedPartner={setSelectedPartner}
          setFilteredPartners={setFilteredPartners}
          partnerListRef={partnerListRef}
          allPartners={allPartners}
          partnerInputRef={partnerInputRef}
          filteredPartners={filteredPartners}
        />
      </motion.div>

      {/* Type Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <span className="text-blue-400">📋</span>
          {t("type faktura")}
        </label>
        <div className="grid grid-cols-1 gap-2">
          <AnimatePresence>
            {typeOptions.map((opt, idx) => {
              const isSelected = wozwratOrPrihod === opt.value;

              return (
                <motion.label
                  key={opt.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden
                    ${isSelected ? "bg-gradient-to-r " + opt.color + " shadow-lg ring-2 ring-white/20" : "bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-gray-600"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Background glow effect */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  <input
                    type="radio"
                    name="wozwratOrPrihod"
                    value={opt.value}
                    checked={isSelected}
                    onChange={(e) => {
                      change_type.currentTime = 0;
                      change_type.play();
                      setWozwratOrPrihod(e.target.value);
                    }}
                    className="sr-only"
                  />

                  {/* Custom radio */}
                  <div className={`relative flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all ${isSelected ? "border-white bg-white" : "border-gray-600 bg-gray-800"}`}>
                    {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full" />}
                  </div>

                  {/* Icon */}
                  <span className={`text-xl transition-transform ${isSelected ? "scale-110" : ""}`}>{opt.icon}</span>

                  {/* Label */}
                  <span className={`flex-1 font-medium transition-colors ${isSelected ? "text-white font-bold" : "text-gray-300"}`}>{opt.label}</span>

                  {/* Check icon */}
                  {isSelected && (
                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </motion.label>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Entry Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SelectEnryBoolen setSelectedEntry={setSelectedEntry} selectedEntry={selectedEntry} />
      </motion.div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Sort */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <InvoiceSort setSortInvoice={setSortInvoice} sortInvoice={sortInvoice} />
      </motion.div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Active filters count */}
      {hasActiveFilters && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400 text-center font-medium">Активных фильтров: {[wozwratOrPrihod, selectedPartner, selectedEntry, sortInvoice].filter(Boolean).length}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default InvoiceFilter;
