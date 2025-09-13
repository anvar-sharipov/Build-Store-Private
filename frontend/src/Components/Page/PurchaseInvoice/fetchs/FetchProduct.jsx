import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { FaWarehouse } from "react-icons/fa";
import myAxios from "../../../axios";

const FetchProduct = ({ productInputRef }) => {
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

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!query) return setProducts([]);
      try {
        console.log("values.warehouse.id", values.warehouse.id);
        const res = await myAxios.get(`search-products/?search=${query}&warehouse=${values.warehouse.id}`);
        const activeProducts = res.data.filter((prod) => prod.is_active);
        setProducts(activeProducts);
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
            ref={productInputRef}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                e.preventDefault();
              }
            }}
            className="
            w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-400
            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
            dark:placeholder-gray-400
            transition-all duration-200
          "
            placeholder={t("search product")}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
        </div>
        {products.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-h-70 border border-black dark:border-black rounded-md shadow-sm dark:bg-white bg-gray-300 dark:text-gray-800 text-black">
            {products.map((product) => (
              <li key={product.id} className="px-3 cursor-pointer dark:hover:bg-blue-100 hover:bg-blue-100 border divide-y divide-black">{product.name}</li>
            ))}
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
