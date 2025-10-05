import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package, CheckCircle, Trash2, Printer, ImageOff, ShoppingCart, Minus, Plus } from "lucide-react";
import myAxios from "../../../axios";
import Fuse from "fuse.js";
import { useNotification } from "../../../context/NotificationContext";
import QRDisplay from "../../../UI/QRDisplay";

const QrListPrint = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const { showNotification } = useNotification();

  const productsRef = useRef({});
  const searchInputRef = useRef(null);
  const quantityRefs = useRef({});
  const sound_beep = new Audio("/sounds/beep.mp3");

  useEffect(() => {
    const get_products = async () => {
      try {
        const res = await myAxios.get("get_product_for_print_qr");
        setProducts(res.data);
      } catch (error) {
        console.log("cant get products", error);
      } finally {
        searchInputRef.current?.focus();
      }
    };
    get_products();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [products]
  );

  const handleSearch = (value) => {
    setSearchValue(value);

    if (!value.trim()) {
      setFilteredProducts([]);
      return;
    }

    const get_product_with_qr_code = products.find((item) => item.qr_code === value);
    if (get_product_with_qr_code) {
      const alreadyHave = selectedProducts.some((i) => i.qr_code === get_product_with_qr_code.qr_code);
      if (alreadyHave) {
        showNotification(t("product exist"), "error");
      } else {
        sound_beep.currentTime = 0;
        sound_beep.play();
        toggleProduct(get_product_with_qr_code);
        setFilteredProducts([]);
        setSearchValue("");
        setTimeout(() => {
          quantityRefs.current[get_product_with_qr_code.id]?.focus();
          quantityRefs.current[get_product_with_qr_code.id]?.select();
        }, 0);
      }
    } else {
      const results = fuse
        .search(value)
        .slice(0, 10)
        .map((r) => r.item);
      setFilteredProducts(results);
    }
  };

  const toggleProduct = (product) => {
    const alreadyHave = selectedProducts.some((i) => i.id === product.id);
    if (alreadyHave) {
      showNotification(t("product exist"), "error");
    } else {
      sound_beep.currentTime = 0;
      sound_beep.play();
      setSelectedProducts((prev) => {
        const isAlreadySelected = prev.some((item) => item.id === product.id);
        if (isAlreadySelected) {
          return prev.filter((item) => item.id !== product.id);
        } else {
          return [...prev, { ...product, quantity: 1 }];
        }
      });
    }
  };

  const removeSelectedProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearAllSelected = () => {
    setSelectedProducts([]);
  };

  const updateQuantity = (productId, delta) => {
    setSelectedProducts((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex h-screen print:hidden">
        {/* Левая панель - Поиск */}
        <div className="w-full md:w-2/5 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">QR Печать</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Поиск товаров</p>
              </div>
            </motion.div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <motion.input
                type="text"
                ref={searchInputRef}
                autoComplete="off"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && filteredProducts.length > 0) {
                    e.preventDefault();
                    productsRef.current[filteredProducts[0].id]?.focus();
                  }
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl 
    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-all duration-300"
                placeholder="Поиск по названию или QR-коду..."
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {filteredProducts && filteredProducts.length > 0 ? (
                <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  {filteredProducts.map((p, idx) => {
                    const isSelected = selectedProducts.some((item) => item.id === p.id);

                    return (
                      <motion.li
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        ref={(el) => {
                          if (el) {
                            productsRef.current[p.id] = el;
                          } else {
                            delete productsRef.current[p.id];
                          }
                        }}
                        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300
    ${
      isSelected
        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 ring-2 ring-blue-500/50"
        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750"
    }`}
                        tabIndex={0}
                        onClick={() => toggleProduct(p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            toggleProduct(p);
                            setFilteredProducts([]);
                            setSearchValue("");
                            setTimeout(() => {
                              quantityRefs.current[p.id]?.focus();
                              quantityRefs.current[p.id]?.select();
                            }, 0);
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (idx < filteredProducts.length - 1) {
                              const nextProduct = filteredProducts[idx + 1];
                              productsRef.current[nextProduct.id]?.focus();
                            }
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (idx === 0) {
                              searchInputRef.current?.focus();
                            } else {
                              const prevProduct = filteredProducts[idx - 1];
                              productsRef.current[prevProduct.id]?.focus();
                            }
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            searchInputRef.current?.focus();
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Image */}
                          {p.images && p.images.length > 0 ? (
                            <img src={p.images[0].url} alt={p.name} className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700" />
                          ) : (
                            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <ImageOff className="w-6 h-6 text-gray-400" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</h3>
                            {p.qr_code && <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">QR: {p.qr_code}</p>}
                          </div>

                          {/* Check */}
                          {isSelected && (
                            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}>
                              <CheckCircle className="w-6 h-6 text-blue-500" />
                            </motion.div>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              ) : searchValue ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                  <Package className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Товары не найдены</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                  <Search className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Начните поиск</p>
                  <p className="text-sm mt-2">Введите название или QR-код</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Правая панель - Выбранные товары */}
        <div className="hidden md:flex md:w-3/5 flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Выбрано ({selectedProducts.length})</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Всего: {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} шт</p>
                </div>
              </div>

              {selectedProducts.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Очистить</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Selected Products List */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {selectedProducts.length > 0 ? (
                <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {selectedProducts.map((p, idx) => (
                    <motion.li
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {/* Image */}
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0].url} alt={p.name} className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <ImageOff className="w-8 h-8 text-gray-500" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">{p.name}</h3>
                          {p.qr_code && <p className="text-xs text-gray-600 dark:text-gray-400 font-mono mt-1">QR: {p.qr_code}</p>}
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(p.id, -1)}
                            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>

                          <input
                            tabIndex={0}
                            ref={(el) => (quantityRefs.current[p.id] = el)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    searchInputRef.current?.focus();
                                }
                            }}
                            type="number"
                            value={p.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 0;
                              setSelectedProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, quantity: newQuantity } : item)));
                            }}
                            className="w-16 px-3 py-2 text-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg 
                              text-gray-900 dark:text-white font-bold
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(p.id, 1)}
                            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-emerald-500 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeSelectedProduct(p.id)}
                          className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <Package className="w-24 h-24 mb-6 opacity-30" />
                  <p className="text-xl font-semibold mb-2">Список пуст</p>
                  <p className="text-sm">Выберите товары из левой панели</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Print Button */}
          {selectedProducts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 border-t border-gray-200 dark:border-gray-800">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.print()}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                  text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <Printer className="w-6 h-6" />
                <span>Печать QR-кодов ({selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} шт)</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Print Layout */}
      <div className="hidden print:block p-4">
        <div className="grid grid-cols-4 gap-6">
          {selectedProducts.flatMap((p) =>
            Array.from({ length: p.quantity }).map((_, i) => (
              <div key={`${p.id}-${i}`} className="flex flex-col items-center text-center">
                <div className="mb-2 text-sm font-medium">{p.name}</div>
                <QRDisplay code={p.qr_code} mySize={113} myClass="border border-black" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QrListPrint;
