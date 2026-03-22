import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { FaWarehouse } from "react-icons/fa";
import myAxios from "../../../axios";
import { formatNumber } from "../../../UI/formatNumber";
import Notification from "../../../Notification";
import { Loader2 } from "lucide-react";
import calculateDiscount from "../../../UI/calculateDiscount";

// const BASE_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const FetchProduct = ({ refs, invoice_id = null }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  // const [warehouseCurrency, setWarehouseCurrency] = useState([]);
  const [currency, setCurrency] = useState("");
  // const sound = new Audio("/sounds/up_down.mp3");
  const sound = useRef(new Audio("/sounds/up_down.mp3"));
  const [loading, setLoading] = useState(false);

  const cacheRef = useRef({});

  // console.log("invoice_idddd", invoice_id);

  useEffect(() => {
    const fetchWarehouseCurrency = async () => {
      try {
        const res = await myAxios.get("get_warehouse_id_and_currency");
        if (!values.warehouse?.id) {
          setCurrency("");
          return;
        }
        const warehouse = res.data.find((w) => w.warehouse_id === values.warehouse.id);

        setCurrency(warehouse?.currency_code || "");
      } catch (e) {
        console.error("Ошибка при загрузке fetchWarehouseCurrency:", e);
      }
    };
    fetchWarehouseCurrency();
  }, [values.warehouse]);

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const wrapperRef = useRef(null);
  // const sound_beep = new Audio("/sounds/beep.mp3");
  const sound_beep = useRef(new Audio("/sounds/beep.mp3"));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setProducts([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProduct = async (productId, warehouseId, mainProductId) => {
    try {
      const res = await myAxios.get("/get-product/", { params: { product_id: productId, warehouse_id: warehouseId, main_product_id: mainProductId, invoice_id: invoice_id } });
      // console.log("res.dataEEEEEEEEEE", res.data);

      return res.data; // важно
    } catch (error) {
      console.log("cant find free products", error);
      return null;
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      if (!query || query.length < 2 || !values.warehouse?.id) {
        setProducts([]);
        return;
      }

      // 🔥 проверяем cache
      // const cacheKey = `${values.warehouse.id}_${query}`;
      const CACHE_TTL = 60000;

      const cacheKey = `${values.warehouse.id}_${values.wozwrat_or_prihod}_${invoice_id}_${query}`;

      const cached = cacheRef.current[cacheKey];

      if (cached && Date.now() - cached.time < CACHE_TTL) {
        setProducts(cached.data);
        return;
      }

      setLoading(true);

      try {
        const res = await myAxios.get("search-products/", {
          params: {
            search: query,
            warehouse: values.warehouse.id,
            invoice_id: invoice_id || null,
            wozwrat_or_prihod: values.wozwrat_or_prihod,
          },
          signal: controller.signal,
        });

        const activeProducts = res.data.filter((prod) => prod.is_active);

        cacheRef.current[cacheKey] = {
          data: activeProducts,
          time: Date.now(),
        };

        // console.log("activeProductsEEEE", activeProducts);

        setProducts(activeProducts);
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.log("oshibka", error);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // }, [query, values.warehouse?.id]);
  }, [query, values.warehouse?.id, values.wozwrat_or_prihod, invoice_id]);

  // ################################################################################################################################################################
  // ################################################################################################################################################################
  // ###### onKeydown li START
  // вынесенная функция
  const handleAddProduct = async (product, values, setFieldValue, refs, showNotification, getProduct) => {
    const exists = values.products.some((p) => p.id === product.id);
    if (exists) {
      showNotification("product already exists", "error");
      return;
    }

    // console.log("productRTRT", product);
    const price_type = values.type_price;
    const discounts_data = calculateDiscount(product, 1, 0, price_type);

    const { percent, price_after_discount, discount_amount } = discounts_data;
    // console.log("price_after_discount RRRRRRRRRRRR", price_after_discount);
    // console.log("dicount_percent RRRRRRRRRRRR", percent);
    // console.log("price_after_discount RRRRRRRRRRRR", price_after_discount);
    let mainProduct;
    if (values.wozwrat_or_prihod === "rashod") {
      mainProduct = {
        ...product,
        is_custom_price: false,
        is_gift: false,

        discount_percent: percent,
        discount_auto: true,
        price_after_discount: price_after_discount,
        discount_amount: discount_amount,
        selected_price: price_after_discount,
      };
    } else {
      const basePrice = values.type_price === "wholesale_price" ? Number(product.wholesale_price) : Number(product.retail_price);
      mainProduct = {
      ...product,
      is_custom_price: false,
      is_gift: false,

      discount_percent: 0,
      discount_auto: true,
      price_after_discount: 0,
      discount_amount: 0,
      selected_price: basePrice,
    };
    }

    let updatedProducts = [...(values.products || [])];

    // если у товара есть бесплатные позиции
    if (product.free_items && product.free_items.length > 0) {
      for (const free of product.free_items) {
        const giftQtyRaw = Number(free.quantity_per_unit);
        // console.log("free.quantity_per_unit", free.quantity_per_unit);

        const giftQty = Math.floor(giftQtyRaw);

        // if (giftQty < 1) {
        //   continue;
        // }
        const res = await getProduct(free.gift_product, values.warehouse?.id, product.id);
        if (res) {
          const existingGiftIndex = updatedProducts.findIndex((p) => p.is_gift && p.id === res.id);
          if (existingGiftIndex !== -1) {
            updatedProducts[existingGiftIndex] = {
              ...updatedProducts[existingGiftIndex],
              selected_quantity: (Number(updatedProducts[existingGiftIndex].selected_quantity) || 0) + giftQty,
            };
          } else {
            updatedProducts.push({
              ...res,
              selected_quantity: giftQty || 0,
              is_custom_price: false,
              is_gift: true,
              parent_id: product.id,

              discount_percent: 0,
              discount_auto: true,
              price_after_discount: 0,
              discount_amount: 0,
            });
          }
        }
      }
    }

    // добавляем сам основной продукт
    updatedProducts.push(mainProduct);

    // сортировка: основные → подарки
    updatedProducts.sort((a, b) => {
      if (a.is_gift === b.is_gift) return 0;
      return a.is_gift ? 1 : -1;
    });

    // console.log("LLLLLLLLLupdatedProducts", updatedProducts);

    // console.log("updatedProducts RRRRRRRRRRRR", updatedProducts);

    setFieldValue("products", updatedProducts, false);

    // находим индекс добавленного основного товара
    const newIndex = updatedProducts.findIndex((p) => p.id === product.id && !p.is_gift);

    setTimeout(() => {
      requestAnimationFrame(() => {
        const input = refs.quantityRefs.current[newIndex];
        if (input) {
          input.focus();
          input.select();
        }
      });
    }, 0);

    if (refs.productRef.current) {
      refs.productRef.current.value = "";
      refs.productRef.current.focus();
    }

    setTimeout(() => {
      refs.productListRef.current = [];
    }, 0);
  };

  // ###### onKeydown li END
  // ################################################################################################################################################################
  // ################################################################################################################################################################

  if (values.warehouse?.id) {
    return (
      <div className="w-full flex-1 print:hidden relative" ref={wrapperRef}>
        {/* Label */}
        {/* <label className="flex justify-between mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"> */}
        <span className="text-sm">{t("product")}</span>
        {/* </label> */}

        {/* Input с иконкой */}
        <div className="relative">
          <input
            type="text"
            ref={refs.productRef}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                e.preventDefault();
              }
              if (e.key == "ArrowDown") {
                e.preventDefault();
                sound.current.currentTime = 0;
                sound.current.play();

                if (refs.productListRef.current.length > 0) {
                  setTimeout(() => {
                    refs.productListRef.current[0]?.focus();
                  }, 0);
                } else if (values.products.length > 0) {
                  refs.quantityRefs.current[0]?.focus();
                  refs.quantityRefs.current[0]?.select();
                }
              } else if (e.key == "ArrowUp") {
                e.preventDefault();
                sound.current.currentTime = 0;
                sound.current.play();
                if (refs.partnerX_Ref.current) {
                  refs.partnerX_Ref.current?.focus();
                } else {
                  refs.partnerRef.current?.focus();
                }
              }
            }}
            className="
            w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-400
            
            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
            dark:placeholder-gray-400
            transition-all duration-200
            focus:bg-indigo-200
            dark:focus:bg-indigo-600
          "
            placeholder={t("search product")}
          />
          {loading ? (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
          )}
        </div>
        {query.length >= 2 && !loading && products.length === 0 && (
          <div
            className="
  absolute z-10 mt-2 w-full
  rounded-xl border
  border-gray-200 dark:border-gray-700
  bg-white dark:bg-gray-900
  shadow-lg
  p-4 text-sm
  text-gray-600 dark:text-gray-300
  backdrop-blur-sm
  animate-in fade-in slide-in-from-top-1 duration-150
"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-400 dark:text-gray-500">🔍</span>
              <span>{t("noSearchResults")}</span>
            </div>
          </div>
        )}
        {products.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-h-[70vh] overflow-y-auto border border-black rounded-md shadow-sm bg-gray-200">
            {(() => {
              refs.productListRef.current = [];
              return null;
            })()}
            {products.map((product, idx) => {
              let unit = product.base_unit_obj.name;
              if (product.units.length > 0) {
                const unit_obj = product.units.find((u) => u.is_default_for_sale);
                if (unit_obj) {
                  unit = unit_obj.unit_name;
                }
              }

              const imgSrc = product.images?.[0]?.image?.startsWith("http") ? product.images[0].image : `${BASE_URL}${product.images?.[0]?.image}`;
              // console.log("imgSrc", imgSrc);

              return (
                <li
                  key={product.id}
                  className={`px-3 cursor-pointer dark:hover:bg-blue-100 
                    hover:bg-blue-100 border divide-y divide-black focus:bg-indigo-200 flex justify-between border border-black
                  ${product.quantity_on_selected_warehouses === 0 ? "opacity-40 cursor-not-allowed" : ""}}
                    `}
                  tabIndex={0}
                  ref={(el) => {
                    if (el) {
                      refs.productListRef.current[idx] = el;
                    }
                  }}
                  onClick={async () => {
                    await handleAddProduct(product, values, setFieldValue, refs, showNotification, getProduct);
                    setProducts([]);
                    setQuery("");
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      await handleAddProduct(product, values, setFieldValue, refs, showNotification, getProduct);
                      setProducts([]);
                      setQuery("");
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      sound.current.currentTime = 0;
                      sound.current.play();
                      if (refs.productListRef.current.length > idx + 1) {
                        refs.productListRef.current[idx + 1]?.focus();
                      }
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      sound.current.currentTime = 0;
                      sound.current.play();
                      if (idx === 0) {
                        refs.productRef.current?.focus();
                      } else {
                        refs.productListRef.current[idx - 1]?.focus();
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* {product.images?.[0] && <img src={`${BASE_URL}${product.images[0].image}`} loading="lazy" decoding="async" className="w-16 h-16 object-cover rounded border flex-shrink-0" />} */}
                    {product.images?.[0] && <img src={imgSrc} loading="lazy" decoding="async" className="w-16 h-16 object-cover rounded border flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate mb-1">{product.name}</div>

                      {/* <div className="grid grid-cols-[120px_80px_auto] text-sm text-gray-500 leading-5">
                    
                        <div>{t("wholesale_price")}:</div>
                        <div className="text-right font-mono">{product.wholesale_price}</div>
                        <div className="pl-2">{currency}</div>

                   
                        <div>{t("warehouse")}:</div>
                        <div className="text-right font-mono">{formatNumber(product.quantity_on_selected_warehouses)}</div>
                        <div className="pl-2">{unit}</div>

                        <div>{formatNumber(product.qty_in_drafts)}</div>
                        <div className="pl-2">{unit}</div>
                      </div> */}

                      <div className="grid grid-cols-[120px_80px_auto] text-sm leading-5">
                        {/* wholesale */}
                        <div className="text-gray-500">{t("wholesale_price")}:</div>
                        <div className="text-right font-mono">{product.wholesale_price}</div>
                        <div className="pl-2">{currency}</div>

                        {/* warehouse */}
                        <div className="text-gray-500">{t("warehouse")}:</div>
                        <div className="text-right font-mono">{formatNumber(product.quantity_on_selected_warehouses)}</div>
                        <div className="pl-2">{unit}</div>

                        {/* reserved */}
                        {product.qty_in_drafts > 0 && (
                          <div className="grid grid-cols-[120px_80px_auto] text-sm font-bold leading-5">
                            <div className="text-amber-600 dark:text-amber-400">{t("reserved")}:</div>
                            <div className="text-right font-mono text-amber-600 dark:text-amber-400">{formatNumber(product.qty_in_drafts)}</div>
                            <div className="pl-2 text-amber-600 dark:text-amber-400">{unit}</div>
                          </div>
                        )}

                        {/* available */}
                        {/* <div className="font-semibold">{t("available")}:</div>
                        <div className={`text-right font-mono font-semibold ${product.quantity_on_selected_warehouses <= 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatNumber(product.quantity_on_selected_warehouses)}
                        </div>
                        <div className="pl-2 font-semibold">{unit}</div> */}
                      </div>
                    </div>
                  </div>

                  {/* <span className="flex gap-3 items-center">
                    {product.images && product.images.length > 0 && <img src={`${BASE_URL}${product.images[0].image}`} className="w-16 h-16 object-cover rounded border" />}

                    {product.name}
                    {product.wholesale_price}
                  </span>
                  <span>
                    {formatNumber(product.quantity_on_selected_warehouses)} {unit}
                  </span> */}
                </li>
              );
            })}
          </ul>
        )}
        <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
      </div>
    );
  } else {
    return (
      <div className="max-w-xl mx-auto">
        <div aria-live="polite" className="flex items-center gap-3 p-4 md:p-5 bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm backdrop-blur-sm">
          <FaWarehouse className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div className="text-sm md:text-base leading-tight text-gray-700 dark:text-gray-200">{t("for search product choose warehouse")}</div>
        </div>
      </div>
    );
  }
};

export default FetchProduct;
