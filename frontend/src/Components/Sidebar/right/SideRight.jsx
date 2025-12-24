// Components/Sidebar/SidebarRight.jsx
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp,
  Activity,
  ArrowUpDown,
  Check,
  Radio
} from "lucide-react";
import myAxios from "../../axios";
import ProductsFilter from "./filters/productsFilter";
import { SearchContext } from "../../context/SearchContext";
import SalesInvoiceFilter from "./filters/SalesInvoiceFilter";
import CompactAgentFilter from "./filters/CompactAgentFilter";
import InvoiceFilter from "./filters/InvoiceFilter/InvoiceFilter";
import DetailReport6062Filter from "./filters/DetailReport6062Filter/DetailReport6062Filter";
import BuhOborotTowarowFilter from "./filters/BuhOborotTowarowFilter/BuhOborotTowarowFilter";
import ZakazFilter from "./filters/Zakaz/ZakazFilter";
import ZakazListFilter from "./filters/Zakaz/ZakazListFilter";

// настройки для разных страниц
const FILTER_CONFIG = {
  "/partners_new": {
    type: [
      { key: "klient", labelKey: "klient", icon: Users },
      { key: "founder", labelKey: "founder", icon: Building2 },
      { key: "all", labelKey: "all", icon: Filter },
    ],
    sort_tmt: [
      { key: "balance_tmt_asc", labelKey: "asc" },
      { key: "balance_tmt_desc", labelKey: "desc" },
    ],
    sort_usd: [
      { key: "balance_usd_asc", labelKey: "asc" },
      { key: "balance_usd_desc", labelKey: "desc" },
    ],
    status: [
      { key: "true", labelKey: "active", color: "emerald" },
      { key: "false", labelKey: "inactive", color: "red" },
      { key: "all", labelKey: "all", color: "gray" },
    ],
  },
  "/agents": {
    sort: [
      { key: "asc", labelKey: "asc" },
      { key: "desc", labelKey: "desc" },
    ],
  },
};

const FilterSection = ({ title, icon: Icon, children, isFirst = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`border-b border-gray-700 ${isFirst ? '' : 'pt-4'}`}
  >
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-4 h-4 text-blue-500" />}
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
        {title}
      </h3>
    </div>
    <div className="space-y-1 pb-4">
      {children}
    </div>
  </motion.div>
);

const FilterOption = ({ option, isChecked, onChange, name, icon: Icon, color }) => {
  const {t} = useTranslation()
  const getColorClasses = (isChecked) => {
    const baseClasses = "flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer ";
    
    if (isChecked) {
      const colorMap = {
        emerald: "bg-emerald-900/20 border-emerald-800 text-emerald-300",
        red: "bg-red-900/20 border-red-800 text-red-300",
        blue: "bg-blue-900/20 border-blue-800 text-blue-300",
        gray: "bg-gray-800 border-gray-700 text-gray-300"
      };
      return baseClasses + (colorMap[color] || colorMap.blue);
    }
    
    return baseClasses + "bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-200";
  };

  return (
    <motion.label
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={getColorClasses(isChecked)}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <input
            type="radio"
            name={name}
            checked={isChecked}
            onChange={onChange}
            className="sr-only"
          />
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isChecked 
              ? 'border-blue-500 bg-blue-500' 
              : 'border-gray-500 bg-transparent'
          }`}>
            {isChecked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            )}
          </div>
        </div>
        
        {Icon && <Icon className="w-4 h-4" />}
        
        <span className="text-sm font-medium capitalize">
          {t(option.labelKey)}
        </span>
      </div>
      
      {isChecked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-blue-500"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}
    </motion.label>
  );
};

export default function SidebarRight() {
  const location = useLocation();
  const { searchQuery, setSearchQuery, searchParams, setSearchParams } = useContext(SearchContext);
  const { t } = useTranslation();

  const [offset, setOffset] = useState(0);
  const currentPath = location.pathname;
  const config = FILTER_CONFIG[currentPath] ?? {};

  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [tags, setTags] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Слушаем прокрутку страницы
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      setOffset(scrollTop <= 160 ? scrollTop : 160);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Загружаем данные для фильтров
  useEffect(() => {
    if (currentPath === "/partners" || currentPath === "/partners_new") {
      const fetchAgents = async () => {
        try {
          const response = await myAxios.get("/agents");
          setAgents(response.data.results || response.data);
        } catch (error) {
          console.error("Ошибка при загрузке агентов:", error);
        }
      };
      fetchAgents();
    }

    if (currentPath === "/products") {
      const fetchAll = async () => {
        try {
          const [categoriesRes, brandsRes, modelsRes, tagsRes, warehousesRes] = await Promise.all([
            myAxios.get("/categories"),
            myAxios.get("/brands"),
            myAxios.get("/models"),
            myAxios.get("/tags"),
            myAxios.get("/warehouses"),
          ]);
          setCategories(categoriesRes.data);
          setBrands(brandsRes.data);
          setModels(modelsRes.data);
          setTags(tagsRes.data);
          setWarehouses(warehousesRes.data);
        } catch (e) {
          console.error("Ошибка при загрузке данных:", e);
        }
      };
      fetchAll();
    }
  }, [currentPath]);

  if (!(currentPath in FILTER_CONFIG) && currentPath !== "/products" &&
   currentPath !== "/main" && currentPath !== "/purchase_invoice" && currentPath !== "/detail-account-report-60-62" 
   && currentPath !== "/products-buh-oborot" && currentPath !== "/zakaz" && currentPath !== "/zakaz-list") return null;

  const typeOptions = config.type || [];
  const sortTmtOptions = config.sort_tmt || [];
  const sortUsdOptions = config.sort_usd || [];
  const sortOptions = config.sort || [];
  const statusOptions = config.status || [];

  const selectedType = searchParams.get("type") || "all";
  const selectedSort = searchParams.get("sort") || "desc";
  const selectedStatus = searchParams.get("is_active") || "all";
  const selectedAgent = searchParams.get("agent") || "all";

  const selectedTags = currentPath === "/products" ? searchParams.get("tags")?.split(",") || [] : [];

  const handleChange = (paramName, value) => {
    if (value === "all") {
      searchParams.delete(paramName);
    } else {
      searchParams.set(paramName, value);
    }
    setSearchParams(searchParams);
  };

  return (
    <motion.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25 }}
      className="hidden lg:flex fixed right-0 w-80 flex-col p-6 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl border-l border-gray-700 overflow-y-auto z-20 backdrop-blur-sm"
      style={{
        top: `${80 - offset}px`,
        height: `calc(100vh - ${80 - offset}px)`,
      }}
    >
      {/* Header */}
      {/* <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Refine your results</p>
        </div>
      </motion.div> */}

      <div className="space-y-2">
        {/* Фильтр по типу партнера */}
        {typeOptions.length > 0 && (
          <FilterSection title={t("type")} icon={Users} isFirst={true}>
            {typeOptions.map((option) => {
              const isChecked = selectedType === option.key;
              return (
                <FilterOption
                  key={option.key}
                  option={option}
                  isChecked={isChecked}
                  onChange={() => handleChange("type", option.key)}
                  name="filter-type"
                  icon={option.icon}
                />
              );
            })}
          </FilterSection>
        )}

        {/* Фильтр по статусу */}
        {statusOptions.length > 0 && (
          <FilterSection title={t("status")} icon={Activity}>
            {statusOptions.map((option) => {
              const isChecked = selectedStatus === option.key;
              return (
                <FilterOption
                  key={option.key}
                  option={option}
                  isChecked={isChecked}
                  onChange={() => handleChange("is_active", option.key)}
                  name="filter-status"
                  color={option.color}
                />
              );
            })}
          </FilterSection>
        )}

        {/* Сортировка по балансу TMT */}
        {sortTmtOptions.length > 0 && (
          <FilterSection title={`${t("balance")} TMT`} icon={TrendingUp}>
            {sortTmtOptions.map((option) => {
              const isChecked = selectedSort === option.key;
              return (
                <FilterOption
                  key={option.key}
                  option={option}
                  isChecked={isChecked}
                  onChange={() => handleChange("sort", option.key)}
                  name="filter-sort-tmt"
                />
              );
            })}
          </FilterSection>
        )}

        {/* Сортировка по балансу USD */}
        {sortUsdOptions.length > 0 && (
          <FilterSection title={`${t("balance")} USD`} icon={DollarSign}>
            {sortUsdOptions.map((option) => {
              const isChecked = selectedSort === option.key;
              return (
                <FilterOption
                  key={option.key}
                  option={option}
                  isChecked={isChecked}
                  onChange={() => handleChange("sort", option.key)}
                  name="filter-sort-usd"
                />
              );
            })}
          </FilterSection>
        )}

        {/* Общая сортировка */}
        {sortOptions.length > 0 && (
          <FilterSection title={t("sorting")} icon={ArrowUpDown}>
            {sortOptions.map((option) => {
              const isChecked = selectedSort === option.key;
              return (
                <FilterOption
                  key={option.key}
                  option={option}
                  isChecked={isChecked}
                  onChange={() => handleChange("sort", option.key)}
                  name="filter-sort"
                />
              );
            })}
          </FilterSection>
        )}

        {/* Фильтр по агенту */}
        {currentPath === "/agents" && (
          <CompactAgentFilter agents={agents} selectedAgent={selectedAgent} handleChange={handleChange} t={t} />
        )}

        {/* Специальные фильтры для разных страниц */}
        <AnimatePresence>
          {currentPath === "/products" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ProductsFilter
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                categories={categories}
                setSearchQuery={setSearchQuery}
                brands={brands}
                models={models}
                tags={tags}
                warehouses={warehouses}
                selectedTags={selectedTags}
                t={t}
              />
            </motion.div>
          )}

          {currentPath === "/main" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <SalesInvoiceFilter searchParams={searchParams} setSearchParams={setSearchParams} t={t} />
            </motion.div>
          )}

          {currentPath === "/detail-account-report-60-62" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <DetailReport6062Filter searchParams={searchParams} setSearchParams={setSearchParams} t={t} />
            </motion.div>
          )}


          {currentPath === "/purchase_invoice" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <InvoiceFilter />
            </motion.div>
          )}
          
          {currentPath === "/products-buh-oborot" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <BuhOborotTowarowFilter />
            </motion.div>
          )}

          {currentPath === "/zakaz" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ZakazListFilter />
              <ZakazFilter />
            </motion.div>
          )}

          {currentPath === "/zakaz-list" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ZakazListFilter />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {Object.keys(searchParams).length > 0 
            ? `${Object.keys(searchParams).length} active filters` 
            : 'No filters applied'
          }
        </p>
      </motion.div> */}
    </motion.aside>
  );
}
