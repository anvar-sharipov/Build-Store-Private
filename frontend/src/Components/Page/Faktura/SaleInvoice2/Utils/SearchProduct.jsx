import { useState, useMemo, useEffect, useRef } from "react";
import MySearchInput from "../../../../UI/MySearchInput";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";
import myAxios from "../../../../axios";
import { useFormikContext } from "formik";
import refreshTable from "./invoiceTable/refreshTable";

const SearchProduct = ({ partnerInputRef, productInputRef, showNotification, productQuantityRefs }) => {
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const listRefs = useRef([]);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productInputRef.current && !productInputRef.current.contains(event.target)) {
        setList([]); // скрыть список
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productInputRef]);

  useEffect(() => {
    // console.log("query", query);
    if (query) {
      const fetchProduct = async () => {
        try {
          const res = await myAxios.get(`search-products/?search=${query}&warehouse=${values.warehouses.id}`);
          //   console.log("res.data", res.data);
          setList(res.data);
        } catch (error) {
          console.log("oshibka pri query product", error);
        } finally {
        }
      };
      fetchProduct();
    }
  }, [query]);

  const handleSelectItem = async (item) => {
    console.log("Выбран", item);

    const already_exists = values.products.some((p) => p.id === item.id);
    if (already_exists) {
      showNotification(t("alreadyAdded"), "error");
      return;
    }
    setList([]);
    setQuery("");
    let selected_price = 0
    if (values.priceType === "wholesale") {
        selected_price = item.wholesale_price
    } else {
        selected_price = item.retail_price
    }
    const newProducts = [...values.products, {...item, selected_price: selected_price}];
    setFieldValue("products", newProducts);
    refreshTable({ ...values, products: newProducts }, setFieldValue, values.warehouses.id);
    console.log("productQuantityRefs", productQuantityRefs);

    setTimeout(() => {
      productQuantityRefs.current[item.id]?.focus();
      productQuantityRefs.current[item.id]?.select();
    }, 0);
  };

  return (
    <div className="relative w-full mt-2">
      <MySearchInput
        type="text"
        ref={productInputRef}
        name="product_name"
        placeholder={t("product")}
        autoComplete="off"
        value={query}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            partnerInputRef.current?.focus();
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (list.length > 0) {
              listRefs.current[0]?.focus();
            } else {
            }
          }
        }}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={handleBlur}
        className="border px-2 py-1 rounded-md print:hidden"
      />

      {list.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white dark:bg-gray-800 border rounded shadow-md z-20">
          {list.map((item, index) => (
            <li
              key={item.id || index}
              ref={(el) => (listRefs.current[index] = el)}
              tabIndex={0}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-gray-200"
              onMouseDown={() => handleSelectItem(item)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (index === 0) {
                    productInputRef.current?.focus();
                  } else {
                    listRefs.current[index - 1]?.focus();
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (index + 1 < list.length) {
                    listRefs.current[index + 1]?.focus();
                  }
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  handleSelectItem(item);
                }
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchProduct;
