// Components/Sidebar/SidebarRight.jsx
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import myAxios from "../../axios";
import ProductsFilter from "./filters/productsFilter";
import { SearchContext } from "../../context/SearchContext";
import SalesInvoiceFilter from "./filters/SalesInvoiceFilter";
import CompactAgentFilter from "./filters/CompactAgentFilter";
import InvoiceFilter from "./filters/InvoiceFilter/InvoiceFilter";
import DetailReport6062Filter from "./filters/DetailReport6062Filter/DetailReport6062Filter";

// настройки для разных страниц
const FILTER_CONFIG = {
  "/partners_new": {
    type: [
      { key: "klient", labelKey: "klient" },
      { key: "founder", labelKey: "founder" },
      { key: "all", labelKey: "all" },
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
      { key: "true", labelKey: "active" },
      { key: "false", labelKey: "inactive" },
      { key: "all", labelKey: "all" },
    ],
  },
  "/agents": {
    sort: [
      { key: "asc", labelKey: "asc" },
      { key: "desc", labelKey: "desc" },
    ],
  },
};

export default function SidebarRight() {
  // узнаём, на какой странице мы сейчас
  const location = useLocation();
  const { searchQuery, setSearchQuery, searchParams, setSearchParams } = useContext(SearchContext);

  const { t } = useTranslation();

  const [offset, setOffset] = useState(0);
  const currentPath = location.pathname;

  const config = FILTER_CONFIG[currentPath] ?? {};

  // Загружаем агентов для фильтра партнеров
  const [agents, setAgents] = useState([]);

  // слушаем прокрутку страницы
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      setOffset(scrollTop <= 160 ? scrollTop : 160);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Загружаем агентов для фильтра партнеров
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
  }, [currentPath]);

  // ################################################################################################################################################################## START filter po /product

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [tags, setTags] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  // const [is_active , setIs_active ] = useState([]);

  useEffect(() => {
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

  // selectedCategories и handleCategoryToggle всегда объявлены
  const selectedCategories = currentPath === "/products" ? searchParams.get("categories")?.split(",") || [] : [];

  const selectedBrands = currentPath === "/products" ? searchParams.get("brands")?.split(",") || [] : [];

  const selectedModals = currentPath === "/models" ? searchParams.get("models")?.split(",") || [] : [];

  const selectedTags = currentPath === "/products" ? searchParams.get("tags")?.split(",") || [] : [];

  // ########################################################################################################################################################################## END filter po /product

  //   Если текущая страница не найдена в FILTER_CONFIG — не показываем сайдбар
  console.log("currentPath ===== ", currentPath);
  
  if (!(currentPath in FILTER_CONFIG) && currentPath !== "/products" && currentPath !== "/main" && currentPath !== "/purchase_invoice" && currentPath !== "/detail-account-report-60-62") return null;

  const typeOptions = config.type || [];
  const sortTmtOptions = config.sort_tmt || [];
  const sortUsdOptions = config.sort_usd || [];
  const sortOptions = config.sort || []; // для других страниц
  const statusOptions = config.status || [];

  //   Смотрим текущий фильтр из URL, Смотрим, какой фильтр сейчас выбран. Если ничего нет — значит "all".
  const selectedType = searchParams.get("type") || "all";
  const selectedSort = searchParams.get("sort") || "desc";
  const selectedStatus = searchParams.get("is_active") || "all";
  const selectedAgent = searchParams.get("agent") || "all";

  //   Когда пользователь кликает на фильтр, Мы добавляем (или убираем) ?type=something в адрес страницы.
  const handleChange = (paramName, value) => {
    console.log("handleChange called:", paramName, value);
    console.log("Before:", searchParams.toString());

    if (value === "all") {
      searchParams.delete(paramName);
    } else {
      searchParams.set(paramName, value);
    }

    console.log("After:", searchParams.toString());
    setSearchParams(searchParams);
  };

  return (
    <aside
      className="hidden lg:flex fixed right-0 w-72 flex-col p-4 dark:bg-gray-900 shadow-lg overflow-y-auto z-20 pt-20"
      style={{
        top: `${80 - offset}px`,
        height: `calc(100vh - ${80 - offset}px)`,
      }}
    >
      {/* Фильтр по типу партнера */}
      {typeOptions.length > 0 && (
        <>
          <h3 className="font-semibold mb-2 text-gray-400">{t("type")}</h3>
          {typeOptions.map((option) => {
            const isChecked = selectedType === option.key;
            return (
              <label key={option.key} className={`flex items-center py-1 cursor-pointer ${isChecked ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
                <input type="radio" name="filter-type" checked={isChecked} onChange={() => handleChange("type", option.key)} className="mr-2 accent-blue-600" />
                {t(option.labelKey)}
              </label>
            );
          })}
        </>
      )}

      {/* Фильтр по статусу (активный/неактивный) для партнеров */}
      {statusOptions.length > 0 && (
        <>
          <h3 className="font-semibold mb-2 mt-4 text-gray-400">{t("status")}</h3>
          {statusOptions.map((option) => {
            const isChecked = selectedStatus === option.key;
            return (
              <label key={option.key} className={`flex items-center py-1 cursor-pointer ${isChecked ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
                <input type="radio" name="filter-status" checked={isChecked} onChange={() => handleChange("is_active", option.key)} className="mr-2 accent-blue-600" />
                {t(option.labelKey)}
              </label>
            );
          })}
        </>
      )}

      {/* Сортировка по балансу TMT */}
      {sortTmtOptions.length > 0 && (
        <>
          <h3 className="font-semibold mb-2 mt-4 text-gray-400">{t("balance")} TMT</h3>
          {sortTmtOptions.map((option) => {
            const isChecked = selectedSort === option.key;
            return (
              <label key={option.key} className={`flex items-center py-1 cursor-pointer ${isChecked ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
                <input
                  type="radio"
                  name="filter-sort"
                  checked={isChecked}
                  onChange={() => {
                    console.log("Changing sort to:", option.key);
                    handleChange("sort", option.key);
                  }}
                  className="mr-2 accent-blue-600"
                />
                {t(option.labelKey)}
              </label>
            );
          })}
        </>
      )}

      {/* Сортировка по балансу USD */}
      {sortUsdOptions.length > 0 && (
        <>
          <h3 className="font-semibold mb-2 mt-4 text-gray-400">{t("balance")} USD</h3>
          {sortUsdOptions.map((option) => {
            const isChecked = selectedSort === option.key;
            return (
              <label key={option.key} className={`flex items-center py-1 cursor-pointer ${isChecked ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
                <input
                  type="radio"
                  name="filter-sort"
                  checked={isChecked}
                  onChange={() => {
                    console.log("Changing sort to:", option.key);
                    handleChange("sort", option.key);
                  }}
                  className="mr-2 accent-blue-600"
                />
                {t(option.labelKey)}
              </label>
            );
          })}
        </>
      )}

      {/* Фильтр по агенту для партнеров */}
      {currentPath === "/agents" && <CompactAgentFilter agents={agents} selectedAgent={selectedAgent} handleChange={handleChange} t={t} />}
      {/* {(currentPath === "/partners" || currentPath === "/partners_new") && agents.length > 0 && (
        <>
          <h3 className="font-semibold mb-2 mt-4 text-gray-400">{t("agent")}</h3>
          <label
            className={`flex items-center py-1 cursor-pointer ${
              selectedAgent === "all" ? "text-blue-700 font-semibold" : "text-gray-700"
            }`}
          >
            <input
              type="radio"
              name="filter-agent"
              checked={selectedAgent === "all"}
              onChange={() => handleChange("agent", "all")}
              className="mr-2 accent-blue-600"
            />
            {t("all")}
          </label>
          {agents.map((agent) => {
            const isChecked = selectedAgent === agent.id.toString();
            return (
              <label
                key={agent.id}
                className={`flex items-center py-1 cursor-pointer ${
                  isChecked ? "text-blue-700 font-semibold" : "text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="filter-agent"
                  checked={isChecked}
                  onChange={() => handleChange("agent", agent.id.toString())}
                  className="mr-2 accent-blue-600"
                />
                {agent.name || agent.first_name || `Agent ${agent.id}`}
              </label>
            );
          })}
        </>
      )} */}

      {/* Сортировка */}
      {sortOptions.length > 0 && (
        <>
          <h3 className="font-semibold mb-2 mt-4 text-gray-400">{t("balance")}</h3>
          {sortOptions.map((option) => {
            const isChecked = selectedSort === option.key;
            console.log("Sort option:", option.key, "Selected:", selectedSort, "Checked:", isChecked); // ✅ Добавьте для отладки
            return (
              <label key={option.key} className={`flex items-center py-1 cursor-pointer ${isChecked ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
                <input
                  type="radio"
                  name="filter-sort"
                  checked={isChecked}
                  onChange={() => {
                    console.log("Changing sort to:", option.key); // ✅ Добавьте для отладки
                    handleChange("sort", option.key);
                  }}
                  className="mr-2 accent-blue-600"
                />
                {t(option.labelKey)}
              </label>
            );
          })}
        </>
      )}

      {currentPath === "/products" && (
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
      )}

      {currentPath === "/main" && <SalesInvoiceFilter searchParams={searchParams} setSearchParams={setSearchParams} t={t} />}

      {console.log("currentPath", currentPath)}
      
      {currentPath === "/detail-account-report-60-62" && <DetailReport6062Filter searchParams={searchParams} setSearchParams={setSearchParams} t={t} />}

      {currentPath === "/purchase_invoice" && <InvoiceFilter />}
    </aside>
  );
}
