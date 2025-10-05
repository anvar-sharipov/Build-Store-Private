import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { FaWarehouse } from "react-icons/fa";
import myAxios from "../../../axios";
import { formatNumber } from "../../../UI/formatNumber";
import Notification from "../../../Notification";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FetchProduct = ({ refs }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const sound = new Audio("/sounds/up_down.mp3");

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const wrapperRef = useRef(null);
  const sound_beep = new Audio("/sounds/beep.mp3");

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
      const res = await myAxios.get("/get-product/", { params: { product_id: productId, warehouse_id: warehouseId, main_product_id: mainProductId } });
      console.log("res.data gift", res.data);

      return res.data; // важно
    } catch (error) {
      console.log("cant find free products", error);
      return null;
    }
  };

  // const getProduct = async (productId, warehouseId) => {
  //   const res = await myAxios.get("/get-product/", {
  //     params: { product_id: productId, warehouse_id: warehouseId },
  //   });
  //   return res.data;
  // };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!query) return setProducts([]);
      try {
        // console.log("values.warehouse.id", values.warehouse.id);
        const res = await myAxios.get(`search-products/?search=${query}&warehouse=${values.warehouse.id}`);
        const activeProducts = res.data.filter((prod) => prod.is_active);

        if (activeProducts.length === 1 && activeProducts[0].finded_from_QR) {
          await handleAddProduct(activeProducts[0], values, setFieldValue, refs, showNotification, getProduct);
          setProducts([]);
          setQuery("");
          sound_beep.currentTime = 0;
          sound_beep.play();
        } else {
          setProducts(activeProducts);
        }

        console.log("activeProducts", activeProducts);
      } catch (error) {
        console.log("oshibka pri query product", error);
      } finally {
      }
    };
    fetchProduct();
  }, [query]);

  // ################################################################################################################################################################
  // ################################################################################################################################################################
  // ###### onKeydown li START
  // вынесенная функция
  const handleAddProduct = async (product, values, setFieldValue, refs, showNotification, getProduct) => {
    console.log("main product", product);

    const exists = values.products.some((p) => p.id === product.id);
    if (exists) {
      showNotification("product already exists", "error");
      return;
    }

    const mainProduct = {
      ...product,
      is_custom_price: false,
      is_gift: false,
    };

    let updatedProducts = [...(values.products || [])];

    // если у товара есть бесплатные позиции
    if (product.free_items && product.free_items.length > 0) {
      for (const free of product.free_items) {
        const res = await getProduct(free.gift_product, values.warehouse?.id, product.id);
        if (res) {
          const existingGiftIndex = updatedProducts.findIndex((p) => p.is_gift && p.id === res.id);
          if (existingGiftIndex !== -1) {
            updatedProducts[existingGiftIndex] = {
              ...updatedProducts[existingGiftIndex],
              selected_quantity: (Number(updatedProducts[existingGiftIndex].selected_quantity) || 0) + Number(free.quantity_per_unit),
            };
          } else {
            updatedProducts.push({
              ...res,
              is_custom_price: false,
              is_gift: true,
              parent_id: product.id,
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

    setFieldValue("products", updatedProducts, false);

    // очистка списка продуктов
    setTimeout(() => {
      requestAnimationFrame(() => {
        const input = refs.quantityRefs.current[product.id];
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
        <label className="flex justify-between mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>{t("product")}</span> <span>qr</span>{" "}
        </label>

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
                sound.currentTime = 0;
                sound.play();
                // console.log('tttttttt ===');
                if (refs.productListRef.current.length > 0) {
                  // console.log("values.products", values.products);
                  // console.log("refs.productListRef", refs.productListRef);
                  setTimeout(() => {
                    refs.productListRef.current[0]?.focus();
                  }, 0);
                } else if (values.products.length > 0) {
                  // console.log("aaafaffa");

                  refs.quantityRefs.current[values.products[0].id]?.focus();
                  refs.quantityRefs.current[values.products[0].id]?.select();
                }
              } else if (e.key == "ArrowUp") {
                e.preventDefault();
                sound.currentTime = 0;
                sound.play();
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
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
        </div>
        {products.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-h-70 border border-black dark:border-black rounded-md shadow-sm dark:bg-white bg-gray-200 dark:text-gray-800 text-black">
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
              return (
                <li
                  key={product.id}
                  className="px-3 cursor-pointer dark:hover:bg-blue-100 hover:bg-blue-100 border divide-y divide-black focus:bg-indigo-200 flex justify-between"
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
                      sound.currentTime = 0;
                      sound.play();
                      if (refs.productListRef.current.length > idx + 1) {
                        refs.productListRef.current[idx + 1]?.focus();
                      }
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      sound.currentTime = 0;
                      sound.play();
                      if (idx === 0) {
                        refs.productRef.current?.focus();
                      } else {
                        refs.productListRef.current[idx - 1]?.focus();
                      }
                    }
                  }}
                >
                  <span className="flex gap-3 items-center">
                    {product.images && product.images.length > 0 && <img src={`${BASE_URL}${product.images[0].image}`} className="w-16 h-16 object-cover rounded border" />}

                    {product.name}
                  </span>
                  <span>
                    {formatNumber(product.quantity_on_selected_warehouses)} {unit}
                  </span>
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
