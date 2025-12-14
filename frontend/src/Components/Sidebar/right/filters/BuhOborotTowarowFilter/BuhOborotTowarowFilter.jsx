import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import myAxios from "../../../../axios";
import { Warehouse, Check, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { fetchCategories } from "../../../../fetchs/optionsFetchers";

const BuhOborotTowarowFilter = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeWarehouses, setActiveWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const warehouseId = searchParams.get("warehouse");
  const withWozwrat = searchParams.get("withWozwrat") !== "0";
  const emptyTurnovers = searchParams.get("emptyTurnovers") !== "0";

  const [categories, setCategories] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const selectedCategoriesParam = searchParams.get("categories");
  const selectedCategories = selectedCategoriesParam ? selectedCategoriesParam.split(",") : [];

  // Product name search START
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const selectedProductsParam = searchParams.get("products");
  const selectedProducts = selectedProductsParam ? selectedProductsParam.split(",") : [];

  // Загрузка складов
  useEffect(() => {
    const loadWarehouses = async () => {
      setLoading(true);
      try {
        const res = await myAxios.get("get_active_warehouses");
        setActiveWarehouses(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    loadWarehouses();
  }, []);

  // Загрузка категорий
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Ошибка при загрузке categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Загрузка продуктов при выборе склада
  useEffect(() => {
    const getAllProducts = async () => {
      if (!warehouseId) {
        setProducts([]);
        return;
      }
      
      setLoadingProducts(true);
      try {
        const res = await myAxios.get("/get_all_products_id_and_name", {
          params: {
            warehouseId,
          },
        });
        console.log("res", res.data.data);
        setProducts(res.data.data || []); // Сохраняем в стейт
      } catch (err) {
        console.log("cant get allProducts", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    getAllProducts();
  }, [warehouseId]); // Загружаем при изменении склада

  const addCategory = (catId) => {
    const params = new URLSearchParams(searchParams);
    const newSelected = [...selectedCategories];
    if (!newSelected.includes(String(catId))) {
      newSelected.push(String(catId));
      params.set("categories", newSelected.join(","));
      params.delete("selected");
      setSearchParams(params);
    }
    setSearchCategory("");
  };

  const removeCategory = (catId) => {
    const params = new URLSearchParams(searchParams);
    const newSelected = selectedCategories.filter((id) => id !== String(catId));
    if (newSelected.length) {
      params.set("categories", newSelected.join(","));
    } else {
      params.delete("categories");
    }
    params.delete("selected");
    setSearchParams(params);
  };

  const addProduct = (productId) => {
    const params = new URLSearchParams(searchParams);
    const newSelected = [...selectedProducts];
    if (!newSelected.includes(String(productId))) {
      newSelected.push(String(productId));
      params.set("products", newSelected.join(","));
      params.delete("selected");
      setSearchParams(params);
    }
    setSearchProduct("");
  };

  const removeProduct = (productId) => {
    const params = new URLSearchParams(searchParams);
    const newSelected = selectedProducts.filter((id) => id !== String(productId));
    if (newSelected.length) {
      params.set("products", newSelected.join(","));
    } else {
      params.delete("products");
    }
    params.delete("selected");
    setSearchParams(params);
  };

  const filteredCategories = categories.filter(
    (cat) => cat.name.toLowerCase().includes(searchCategory.toLowerCase()) && 
    !selectedCategories.includes(String(cat.id))
  );

  const filteredProducts = products.filter(
    (prod) => prod.name.toLowerCase().includes(searchProduct.toLowerCase()) && 
    !selectedProducts.includes(String(prod.id))
  );

  const selectedWarehouse = activeWarehouses.find((w) => String(w.id) === warehouseId);

  const handleWarehouseSelect = (wh) => {
    const params = new URLSearchParams(searchParams);
    params.set("warehouse", wh.id);
    params.delete("selected");
    setSearchParams(params);
    setDropdownOpen(false);
  };

  const handleWozwratChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("withWozwrat", value ? "1" : "0");
    params.delete("selected");
    setSearchParams(params);
  };

  const handleEmptyTurnovers = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("emptyTurnovers", value ? "1" : "0");
    params.delete("selected");
    setSearchParams(params);
  };
  

  return (
    <div className="space-y-6 p-4">
      {/* Заголовок */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{t("filters")}</h3>
          <p className="text-sm text-gray-400">{t("buh oborot towar")}</p>
        </div>
      </div>

      {/* Выбор склада */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t("choose_warehouse")}
        </label>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 
                     rounded-lg flex items-center justify-between hover:bg-gray-750 
                     transition-colors"
          >
            <div className="flex items-center gap-3">
              <Warehouse className="w-5 h-5 text-blue-400" />
              <span className={selectedWarehouse ? "text-white" : "text-gray-400"}>
                {selectedWarehouse?.name || "Выберите склад"}
              </span>
            </div>
            <div className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
              ▼
            </div>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute w-full mt-1 bg-gray-900 border border-gray-700 
                         rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
              >
                {loading ? (
                  <div className="p-4 text-center text-gray-400">Загрузка...</div>
                ) : activeWarehouses.length > 0 ? (
                  activeWarehouses.map((wh) => (
                    <button
                      key={wh.id}
                      onClick={() => handleWarehouseSelect(wh)}
                      className={`w-full px-4 py-3 flex items-center justify-between 
                               hover:bg-gray-800 border-b border-gray-800 last:border-0
                               ${warehouseId === String(wh.id) ? "bg-gray-800" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Warehouse className="w-4 h-4 text-gray-500" />
                        <span className="text-white">{wh.name}</span>
                      </div>
                      {warehouseId === String(wh.id) && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400">Нет складов</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Фильтр по категориям */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {t("categories")}
        </label>

        {/* Поиск категорий */}
        <input
          type="text"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          placeholder={t("Search categories") || "Поиск категорий..."}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white
                   placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />

        {/* Список найденных категорий */}
        {searchCategory && filteredCategories.length > 0 && (
          <div className="max-h-48 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg mt-1 text-gray-300">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => addCategory(cat.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-800 
                         flex justify-between items-center border-b border-gray-800 
                         last:border-0"
              >
                <span>{cat.name}</span>
                <Check className="w-4 h-4 text-blue-400" />
              </button>
            ))}
          </div>
        )}

        {/* Выбранные категории */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedCategories.map((id) => {
              const cat = categories.find((c) => String(c.id) === id);
              if (!cat) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 
                           text-blue-400 rounded-lg text-sm"
                >
                  {cat.name}
                  <button 
                    onClick={() => removeCategory(id)} 
                    className="ml-1 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Поиск Продуктов */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {t("products")}
        </label>

        <input
          type="text"
          value={searchProduct}
          onChange={(e) => setSearchProduct(e.target.value)}
          placeholder={t("search products")}
          disabled={!warehouseId || loadingProducts}
          className={`w-full px-3 py-2 rounded-lg border text-white
                   placeholder-gray-500 focus:outline-none focus:border-blue-500
                   ${!warehouseId || loadingProducts
                     ? "bg-gray-900 border-gray-800 cursor-not-allowed text-gray-500"
                     : "bg-gray-800 border-gray-700"
                   }`}
        />

        {/* Индикатор загрузки продуктов */}
        {loadingProducts && (
          <div className="text-center text-sm text-gray-400">
            Загрузка продуктов...
          </div>
        )}

        {/* Сообщение, если склад не выбран */}
        {!warehouseId && !loadingProducts && (
          <div className="text-center text-sm text-gray-400">
            Сначала выберите склад
          </div>
        )}

        {/* Список найденных Продуктов */}
        {searchProduct && filteredProducts.length > 0 && warehouseId && !loadingProducts && (
          <div className="max-h-48 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg mt-1 text-gray-300">
            {filteredProducts.map((prod) => (
              <button
                key={prod.id}
                onClick={() => addProduct(prod.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-800 
                         flex justify-between items-center border-b border-gray-800 
                         last:border-0"
              >
                <span>{prod.name}</span>
                <Check className="w-4 h-4 text-blue-400" />
              </button>
            ))}
          </div>
        )}

        {/* Сообщение если нет результатов */}
        {searchProduct && filteredProducts.length === 0 && warehouseId && !loadingProducts && (
          <div className="text-center py-2 text-sm text-gray-500">
            Продукты не найдены
          </div>
        )}

        {/* Выбранные продукты */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="w-full text-xs text-gray-400 mb-1">
              Выбрано продуктов: {selectedProducts.length}
            </div>
            {selectedProducts.map((id) => {
              const prod = products.find((p) => String(p.id) === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-1 px-2 py-1 bg-green-500/20 
                           text-green-400 rounded-lg text-sm"
                >
                  {prod?.name || `ID: ${id}`}
                  <button 
                    onClick={() => removeProduct(id)} 
                    className="ml-1 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Тип отчета */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {t("Including the return")}
        </label>

        <div className="flex gap-2">
          <button
            onClick={() => handleWozwratChange(true)}
            className={`flex-1 py-3 rounded-lg border transition-colors
                     ${withWozwrat && searchParams.get("withWozwrat") === "1"
                       ? "border-blue-500 bg-blue-500/10 text-blue-400"
                       : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                     }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{t("Including")}</span>
            </div>
          </button>

          <button
            onClick={() => handleWozwratChange(false)}
            className={`flex-1 py-3 rounded-lg border transition-colors
                     ${!withWozwrat || (searchParams.get("withWozwrat") !== "1" && searchParams.get("withWozwrat") !== "0")
                       ? "border-red-500 bg-red-500/10 text-red-400"
                       : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                     }`}
          >
            <div className="flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              <span>{t("Excluding")}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Показывать/Не Показывать пустые обороты */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {t("Empty turnovers")}
        </label>

        <div className="flex gap-2">
          <button
            onClick={() => handleEmptyTurnovers(true)}
            className={`flex-1 py-3 rounded-lg border transition-colors
                     ${emptyTurnovers && searchParams.get("emptyTurnovers") === "1"
                       ? "border-blue-500 bg-blue-500/10 text-blue-400"
                       : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                     }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{t("show")}</span>
            </div>
          </button>

          <button
            onClick={() => handleEmptyTurnovers(false)}
            className={`flex-1 py-3 rounded-lg border transition-colors
                     ${!emptyTurnovers || (searchParams.get("emptyTurnovers") !== "1" && searchParams.get("emptyTurnovers") !== "0")
                       ? "border-red-500 bg-red-500/10 text-red-400"
                       : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                     }`}
          >
            <div className="flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              <span>{t("hide")}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Статус загрузки складов */}
      {loading && (
        <div className="text-center text-gray-400 text-sm">
          Загрузка складов...
        </div>
      )}
    </div>
  );
};

export default BuhOborotTowarowFilter;