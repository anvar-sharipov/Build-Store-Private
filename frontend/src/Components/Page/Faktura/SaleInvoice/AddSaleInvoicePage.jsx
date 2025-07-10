import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import SaleInvoiceForm from "./SaleInvoiceForm";
import SaleInvoiceForm2 from "./SaleInvoiceForm2";
import myAxios from "../../../axios";
import MySearchInput from "../../../UI/MySearchInput";
import SearchedProductList from "./SearchedProductList";
import MyLoading from "../../../UI/MyLoading";

const AddSaleInvoicePage = () => {
  // for search
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultRefs = useRef([]);
  const priceInputRefs = useRef({});
  const quantityInputRefs = useRef({});
  const unitSelectRefs = useRef({});
  // const [freeProducts, setFreeProducts] = useState([]);

  // selectedProducts
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [invoiceTable, setInvoiceTable] = useState([]);

  // page
  const [priceType, setPriceType] = useState("wholesale");

  // localStorage.removeItem("visibleColumns")

  // table galochki START
  // 1. Состояние колонок:

  // const defaultColumns = [
  //   // { id: "barcode", label: "Bar code", visible: true },
  //   { id: "purchase", label: "Приход", visible: true },
  //   { id: "income", label: "Доход", visible: true },
  //   { id: "discount", label: "Скидка", visible: true },
  //   // { id: "volume", label: "Объём (м³)", visible: true },
  //   // { id: "length", label: "Длина (см)", visible: true },
  //   // { id: "width", label: "Ширина (см)", visible: true },
  //   // { id: "height", label: "Высота (см)", visible: true },
  // ];

  const defaultVisibleColumns = {
    qr_code: true,
    purchase: true,
    income: true,
    discount: true,
    volume: true,
    dimensions: true
  };

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("visibleColumns");
    return saved ? JSON.parse(saved) : defaultVisibleColumns;
  });

  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
    
  }, [visibleColumns]);

  // table galochki END

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  //   useEffect(() => {
  //   console.log("freeProducts", freeProducts);
  // }, [freeProducts]);

  // navigate baack
  const navigate = useNavigate();
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

  // for serach
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchProducts = async () => {
        if (query.length >= 2) {
          console.log("tut");

          setLoading(true);
          try {
            const res = await myAxios.get(`search-products/?q=${query}`);
            setResults(res.data);
            console.log("res.data", res.data);

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

  return (
    <div className="p-4 w-full mx-auto">
      
      <div className="flex justify-between items-center">
        <img src="/polisem.png" alt="polisem" width={100} />
        <h1 className="font-bold mb-4">Расходная накладная</h1>
      </div>
      

      {/* for search */}
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
      {results.length > 0 &&
        (loading ? (
          <MyLoading />
        ) : (
          <SearchedProductList
            results={results}
            setResults={setResults}
            resultRefs={resultRefs}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            invoiceTable={invoiceTable}
            setInvoiceTable={setInvoiceTable}
            priceType={priceType}
            setPriceType={setPriceType}
            // setFreeProducts={setFreeProducts}
            // freeProducts={freeProducts}
          />
        ))}

      {/* <SaleInvoiceForm
        selectedProducts={selectedProducts}
        priceType={priceType}
        setPriceType={setPriceType}
      /> */}

      {invoiceTable.length > 0 && (
        <SaleInvoiceForm2
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          defaultVisibleColumns={defaultVisibleColumns}
          invoiceTable={invoiceTable}
          setInvoiceTable={setInvoiceTable}
          priceType={priceType}
          setPriceType={setPriceType}
          priceInputRefs={priceInputRefs}
          quantityInputRefs={quantityInputRefs}
          unitSelectRefs={unitSelectRefs}
        />
      )}
    </div>
  );
};

export default AddSaleInvoicePage;
