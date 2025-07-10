import MySearchInput from "../../../UI/MySearchInput";
import { useState, useEffect, useRef } from "react";
import myAxios from "../../../axios";
import { useNavigate } from "react-router-dom";
import MyLoading from "../../../UI/MyLoading";
import { myClass } from "../../../tailwindClasses";
import PuchaseInvoiceList from "./PuchaseInvoiceList";
import { useTranslation } from "react-i18next";
import { handleProductKeyDown } from "./handleProductKeyDown";
import Notification from "../../../Notification";

const AddPurchaseInvoicePage = () => {
  const [query, setQuery] = useState(""); // poisk producta s servera
  const [results, setResults] = useState([]); // spisok sowpadayushih po imeni productow pri poiske
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1); // fiksiruem index elementa w splywayushemsya okne results pri focus
  const inputRef = useRef(null); // search input ref
  const resultRefs = useRef([]); // ref dlya results list 
  const resultQuantityRefs = useRef([]); // ref dlya inputs quantity for selectedProduct list 
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState([]); // smotri json_examples.txt
  const [giftProducts, setGiftProducts] = useState([]); // smotri json_examples.txt
  const [selectedId, setSelectedId] = useState(null);
  const { t } = useTranslation();
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [selectedPriceType, setSelectedPriceType] = useState("wholesale_price"); // по умолчанию — опт

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchProducts = async () => {
        if (query.length >= 2) {
          setLoading(true);
          try {
            const res = await myAxios.get(`search-products/?q=${query}`);
            setResults(res.data);
            setFocusedIndex(0);
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        } else {
          setResults([]);
        }
      };
      fetchProducts();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    if (focusedIndex >= 0 && resultRefs.current[focusedIndex]) { // У тебя есть список из 100 элементов. Пользователь нажал стрелку вниз 5 раз — focusedIndex = 5. Если 5-й элемент в данный момент не виден (ниже экрана), код автоматически прокрутит список вниз до него. 
      resultRefs.current[focusedIndex].scrollIntoView({ // Это встроенный метод DOM, который прокручивает страницу так, чтобы указанный элемент был виден.
        behavior: "smooth", // плавная прокрутка.
        block: "nearest", // прокрутит так, чтобы элемент оказался рядом, не обязательно в центре.
      });
    }
  }, [focusedIndex]);

  useEffect(() => { // focus na input quantity posle wybora produkta iz wsplywayushegosya okna
    if (selectedId !== null) {
      const index = selectedProducts.findIndex((p) => p.id === selectedId); // Метод findIndex() ищет первый элемент в массиве, который удовлетворяет переданному условию, и возвращает его индекс. Если ничего не нашёл — возвращает -1.
      if (index !== -1 && resultQuantityRefs.current[index]) {
        resultQuantityRefs.current[index].focus();
        resultQuantityRefs.current[index].select();
      }
      setSelectedId(null);
    }
  }, [selectedId, selectedProducts]);

  return (
    <div className="p-4">
      <Notification
        message={t(notification.message)}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Добавить приходную накладную</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Назад
        </button>
      </div>

      <MySearchInput
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск товара..."
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && results.length > 0) {
            e.preventDefault();
            resultRefs.current[focusedIndex]?.focus();
          }
        }}
      />

      <div className="relative">
        {loading ? (
          <MyLoading />
        ) : results.length > 0 ? (
          <ul
            className={`${myClass.ul} absolute z-10 bg-white shadow-lg w-full max-h-60 overflow-y-auto`}
          >
            {results.map((product, index) => (
              <li
                key={product.id}
                ref={(el) => (resultRefs.current[index] = el)}
                className={myClass.li}
                tabIndex={0}
                onKeyDown={(e) =>
                  handleProductKeyDown({
                    e,
                    index,
                    product,
                    results,
                    inputRef,
                    resultRefs,
                    setFocusedIndex,
                    selectedProducts,
                    setSelectedProducts,
                    setGiftProducts,
                    setSelectedId,
                    setQuery,
                    showNotification,
                  })
                }
                onMouseEnter={() => setFocusedIndex(index)}
                onClick={() => {
                  //   alert(`Вы выбрали: ${product.name}`);
                  showNotification(`Вы выбрали: ${product.name}`, "success");
                }}
              >
                <div className="font-medium">{product.name}</div>
              </li>
            ))}
          </ul>
        ) : (
          query !== "" && (
            <div className="text-gray-500 mt-4">Нет совпадений</div>
          )
        )}

        <div className="flex items-center gap-6 mt-4 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="priceType"
              value="wholesale_price"
              checked={selectedPriceType === "wholesale_price"}
              onChange={(e) => setSelectedPriceType(e.target.value)}
            />
            <span className="text-sm text-gray-700">Оптовая цена</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="priceType"
              value="retail_price"
              checked={selectedPriceType === "retail_price"}
              onChange={(e) => setSelectedPriceType(e.target.value)}
            />
            <span className="text-sm text-gray-700">Розничная цена</span>
          </label>
        </div>

        {selectedProducts.length > 0 && (
          <PuchaseInvoiceList
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            giftProducts={giftProducts}
            setGiftProducts={setGiftProducts}
            t={t}
            resultQuantityRefs={resultQuantityRefs}
            selectedPriceType={selectedPriceType}
          />
        )}
      </div>
    </div>
  );
};

export default AddPurchaseInvoicePage;
