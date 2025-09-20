import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { FaWarehouse } from "react-icons/fa";
import myAxios from "../../../axios";
import { formatNumber } from "../../../UI/formatNumber";

const FetchProduct = ({ refs }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setProducts([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!query) return setProducts([]);
      try {
        console.log("values.warehouse.id", values.warehouse.id);
        const res = await myAxios.get(`search-products/?search=${query}&warehouse=${values.warehouse.id}`);
        const activeProducts = res.data.filter((prod) => prod.is_active);
        setProducts(activeProducts);
        console.log(activeProducts);
      } catch (error) {
        console.log("oshibka pri query product", error);
      } finally {
      }
    };
    fetchProduct();
  }, [query]);

  if (values.warehouse?.id) {
    return (
      <div className="w-full flex-1 print:hidden relative" ref={wrapperRef}>
        {/* Label */}
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{t("product")}</label>

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

                if (refs.productListRef.current.length > 0) {
                  console.log("values.products", values.products);
                  refs.productListRef.current[0]?.focus();
                } else if (values.products.length > 0) {
                  console.log("aaafaffa");

                  refs.quantityRefs.current[values.products[0].id]?.focus();
                  refs.quantityRefs.current[values.products[0].id]?.select();
                }
              } else if (e.key == "ArrowUp") {
                e.preventDefault();
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
                  ref={(el) => (refs.productListRef.current[idx] = el)}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      setProducts([]);
                      setFieldValue("products", (values.products || []).concat(product));
                      console.log(product);

                      setTimeout(() => {
                        refs.quantityRefs.current[product.id]?.focus();
                        refs.quantityRefs.current[product.id]?.select();
                      }, 0);
                      console.log("fgobhfgiuh");

                      setQuery("");
                      if (refs.productRef.current) {
                        refs.productRef.current.value = "";
                        refs.productRef.current.focus();
                      }
                      setTimeout(() => {
                        refs.productListRef.current = [];
                      }, 0);
                    } else if (e.key == "ArrowDown") {
                      e.preventDefault();
                      if (refs.productListRef.current.length > idx + 1) {
                        refs.productListRef.current[idx + 1]?.focus();
                      }
                    } else if (e.key == "ArrowUp") {
                      e.preventDefault();
                      if (idx === 0) {
                        refs.productRef.current?.focus();
                      } else {
                        refs.productListRef.current[idx - 1]?.focus();
                      }
                    }
                  }}
                >
                  <span>{product.name}</span>
                  <span>
                    {formatNumber(product.quantity_on_selected_warehouses)} {unit}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
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
