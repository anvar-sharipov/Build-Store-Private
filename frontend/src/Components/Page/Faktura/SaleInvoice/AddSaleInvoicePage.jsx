import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, use } from "react";
import SaleInvoiceForm2 from "./SaleInvoiceForm2";
import myAxios from "../../../axios";
import MySearchInput from "../../../UI/MySearchInput";
import SearchedProductList from "./SearchedProductList";
import MyLoading from "../../../UI/MyLoading";
import Fuse from "fuse.js";
import { div } from "framer-motion/client";
import { myClass } from "../../../tailwindClasses";
import SmartTooltip from "../../../SmartTooltip";
import { useTranslation } from "react-i18next";
import SearchedPartnerList from "./SearchedPartnerList";
import Notification from "../../../Notification";
import { Weight } from "lucide-react";
import SearchInputLikeRezka from "../../../UI/SearchInputLikeRezka";

const userVisibleColumns = {
  qr_code: false,
  purchase: false,
  income: false,
  discount: false,
  volume: false,
  weight: false,
  dimensions: false,
};

const adminVisibleColumns = {
  qr_code: true,
  purchase: true,
  income: true,
  discount: true,
  volume: true,
  weight: true,
  dimensions: true,
};

const AddSaleInvoicePage = () => {
  // for search
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [partnerQuery, setPartnerQuery] = useState("");
  const [warehouseQuery, setWarehouseQuery] = useState("");
  const [awtoQuery, setAwtoQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const searchPartnerInputRef = useRef(null);
  const searchWarehouseInputRef = useRef(null);
  const searchAwtoInputRef = useRef(null);
  const resultRefs = useRef([]);
  const resultPartenrRefs = useRef([]);
  const resultWarehouseRefs = useRef([]);
  const resultAwtoRefs = useRef([]);
  const backBtn = useRef(null);
  const priceInputRefs = useRef({});
  const quantityInputRefs = useRef({});
  const unitSelectRefs = useRef({});
  const [allPartners, setAllPartners] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [allAwto, setAllAwto] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [filteredWarehouse, setFilteredWarehouse] = useState([]);
  const [filteredAwto, setFilteredAwto] = useState([]);
  const [firstElementRef, setFirstElementRef] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedAwto, setSelectedAwto] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // chtoby pri awtowstawke perwogo sklada w inpt ne wywodilsya wsplywayusheesya okno
  const [isAutoSelect, setIsAutoSelect] = useState(true);

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // const [freeProducts, setFreeProducts] = useState([]);

  // selectedProducts
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [invoiceTable, setInvoiceTable] = useState([]);

  // page
  const [priceType, setPriceType] = useState("wholesale");

  const handleDeleteProduct = (id) => {
    setInvoiceTable((prevTable) =>
      prevTable.filter(
        (product) => product.id !== id && product?.gift_for_product_id !== id
      )
    );
    inputRef.current?.focus();
    inputRef.current?.select();

    // setSelectedProducts((prevSelected) =>
    //   prevSelected.filter((product) => product.id !== id)
    // );
    // // Удаляем из priceInputRefs, quantityInputRefs и unitSelectRefs
    // delete priceInputRefs.current[id];
    // delete quantityInputRefs.current[id];
    // delete unitSelectRefs.current[id];
  };

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

  const defaultVisibleColumns = adminVisibleColumns;

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("visibleColumns");
    return saved ? JSON.parse(saved) : defaultVisibleColumns;
  });

  // insert
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Insert") {
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // table galochki END

  useEffect(() => {
    searchPartnerInputRef.current?.focus();
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

  // for serach product
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

  const fuse = new Fuse(allPartners, {
    keys: ["name"],
    threshold: 0.3,
  });
  // for serach partner
  useEffect(() => {
    if (!partnerQuery) {
      setFilteredPartners([]);
      return;
    }
    const partnerResults = fuse.search(partnerQuery);
    const matched = partnerResults.map((result) => result.item);
    setFilteredPartners(matched);
  }, [partnerQuery, allPartners]);

  // get all partners
  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await myAxios.get("partners/");
        setAllPartners(res.data);
      } catch (error) {
        console.error("Ошибка при загрузке партнёров", error);
      }
    }
    fetchPartners();
  }, []);

  // get all warehouses START
  useEffect(() => {
    async function fetchWarehouse() {
      try {
        const res = await myAxios.get("warehouses/");
        setAllWarehouses(res.data);
      } catch (error) {
        console.error("Ошибка при загрузке skladow", error);
      }
    }
    fetchWarehouse();
  }, []);

  useEffect(() => {
    if (allWarehouses.length > 0) {
      setSelectedWarehouse(allWarehouses[0].name);
      setWarehouseQuery(allWarehouses[0].name);
      setIsAutoSelect(true); // это автоматическая установка
      setFilteredWarehouse([]);
    }
  }, [allWarehouses]);

  const fuseWarehouse = new Fuse(allWarehouses, {
    keys: ["name", "location"],
    threshold: 0.3,
  });
  useEffect(() => {
    if (!warehouseQuery || isAutoSelect) {
      setFilteredWarehouse([]);
      return;
    }
    const warehouseResults = fuseWarehouse.search(warehouseQuery);
    const matched = warehouseResults.map((result) => result.item);
    setFilteredWarehouse(matched);
  }, [warehouseQuery, allWarehouses]);

  // get all warehouses END

  // get all awto (employee) START
  useEffect(() => {
    async function fetchAwto() {
      try {
        const res = await myAxios.get("employeers/");
        setAllAwto(res.data);
      } catch (error) {
        console.error("Ошибка при загрузке awto", error);
      }
    }
    fetchAwto();
  }, []);

  const fuseAwto = new Fuse(allAwto, {
    keys: ["name"],
    threshold: 0.3,
  });
  useEffect(() => {
    if (!awtoQuery) {
      setFilteredAwto([]);
      return;
    }
    const awtoResults = fuseAwto.search(awtoQuery);
    const matched = awtoResults.map((result) => result.item);
    setFilteredAwto(matched);
  }, [awtoQuery, allAwto]);

  // get all awto (employee) END

  function DateInput() {
    const today = new Date().toISOString().split("T")[0]; // формат YYYY-MM-DD
    const [selectedDate, setSelectedDate] = useState(today);

    return (
      <div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
    );
  }

  return (
    <div className="p-4 w-full mx-auto">
      <div className="flex justify-between items-center mb-4 print:border-b print:border-gray-700">
        {/* Логотип слева */}
        <img
          src="/polisem.png"
          alt="polisem"
          width={100}
          className="flex-shrink-0"
        />

        {/* Заголовок по центру */}
        <h1 className="font-bold text-lg text-center flex-1 dark:text-gray-400">
          Расходная накладная №
        </h1>

        <div>
          <DateInput />
        </div>

        {/* Кнопка назад справа */}
        <SmartTooltip tooltip={t("back")} shortcut="Escape">
          <button
            ref={backBtn}
            className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition print:hidden"
            onClick={() => navigate(-1)}
          >
            {t("back")}
          </button>
        </SmartTooltip>
      </div>

      {/* search warehouse */}
      <div
        tabIndex={-1}
        onBlur={(e) => {
          // Проверим, ушёл ли фокус с блока и его дочерних элементов
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setFilteredWarehouse([]);
          }
        }}
      >
        <div className="flex items-center gap-2 print:hidden">
          <div className="flex-grow">
            <MySearchInput
              placeholder="Поиск sklada..."
              id="warehouse-search"
              value={warehouseQuery}
              ref={searchWarehouseInputRef}
              autoComplete="off"
              onChange={(e) => setWarehouseQuery(e.target.value)}
              onKeyDown={(e) => {
                setIsAutoSelect(false);
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (filteredWarehouse.length > 0) {
                    resultWarehouseRefs.current[0]?.focus();
                  } else {
                    searchAwtoInputRef.current?.focus();
                    searchAwtoInputRef.current?.select();
                  }
                }
              }}
            />
          </div>
          <label
            htmlFor="partner-search"
            className="block font-semibold text-gray-700 dark:text-gray-400 mb-1 w-24"
          >
            Sklady
          </label>
        </div>
        <div className="ml-20">
          {filteredWarehouse.length > 0 && (
            <div className="absolute bg-gray-300 p-2 mt-1 border border-gray-500 rounded-md dark:bg-gray-700 z-20">
              <ul className="print:hidden">
                {filteredWarehouse.map((p, index) => (
                  <li
                    className={myClass.li}
                    key={p.id}
                    ref={(el) => (resultWarehouseRefs.current[index] = el)}
                    tabIndex={0}
                    onClick={() => {
                      setSelectedWarehouse(p.name);
                      setWarehouseQuery(p.name);
                      setTimeout(() => {
                        setFilteredWarehouse("");
                      }, 0);
                      searchAwtoInputRef.current?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key == "ArrowUp") {
                        e.preventDefault();
                        if (index === 0) {
                          searchWarehouseInputRef.current?.focus();
                        } else {
                          resultWarehouseRefs.current[index - 1]?.focus();
                        }
                      } else if (e.key == "ArrowDown") {
                        e.preventDefault();
                        if (index + 1 < filteredWarehouse.length) {
                          resultWarehouseRefs.current[index + 1]?.focus();
                        }
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        setSelectedWarehouse(p.name);
                        setWarehouseQuery(p.name);
                        setTimeout(() => {
                          setFilteredWarehouse("");
                        }, 0);
                        searchAwtoInputRef.current?.focus();
                      }
                    }}
                  >
                    {p.name} ({p.location})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* search awto (employee) */}
      <div
        className="mt-2"
        tabIndex={-1}
        onBlur={(e) => {
          // Проверим, ушёл ли фокус с блока и его дочерних элементов
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setFilteredAwto([]);
          }
        }}
      >
        <div className="flex items-center gap-2 print:hidden">
          <div className="flex-grow">
            <MySearchInput
              placeholder="Поиск awto..."
              id="awto-search"
              value={awtoQuery}
              ref={searchAwtoInputRef}
              autoComplete="off"
              onChange={(e) => setAwtoQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (filteredAwto.length > 0) {
                    resultAwtoRefs.current[0]?.focus();
                  } else {
                    searchPartnerInputRef.current?.focus();
                    searchPartnerInputRef.current?.select();
                  }
                } else if (e.key === "ArrowUp") {
                  searchWarehouseInputRef.current?.focus();
                  searchWarehouseInputRef.current?.select();
                }
              }}
            />
          </div>
          <label
            htmlFor="partner-search"
            className="block font-semibold text-gray-700 dark:text-gray-400 mb-1 w-24"
          >
            Awto
          </label>
        </div>
        <div className="ml-20">
          {filteredAwto.length > 0 && (
            <div className="absolute bg-gray-300 p-2 mt-1 border border-gray-500 rounded-md dark:bg-gray-700 z-20">
              <ul className="print:hidden">
                {filteredAwto.map((p, index) => (
                  <li
                    className={myClass.li}
                    key={p.id}
                    ref={(el) => (resultAwtoRefs.current[index] = el)}
                    tabIndex={0}
                    onClick={() => {
                      setSelectedAwto(p.name);
                      setAwtoQuery(p.name);
                      setTimeout(() => {
                        setFilteredAwto("");
                      }, 0);
                      searchPartnerInputRef.current?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key == "ArrowUp") {
                        e.preventDefault();
                        if (index === 0) {
                          searchAwtoInputRef.current?.focus();
                        } else {
                          resultAwtoRefs.current[index - 1]?.focus();
                        }
                      } else if (e.key == "ArrowDown") {
                        e.preventDefault();
                        if (index + 1 < filteredAwto.length) {
                          resultAwtoRefs.current[index + 1]?.focus();
                        }
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        setSelectedAwto(p.name);
                        setAwtoQuery(p.name);
                        setTimeout(() => {
                          setFilteredAwto("");
                        }, 0);
                        searchPartnerInputRef.current?.focus();
                      }
                    }}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* for search partner */}
      <div
        className="mt-2"
        tabIndex={-1}
        onBlur={(e) => {
          // Проверим, ушёл ли фокус с блока и его дочерних элементов
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setFilteredPartners([]);
          }
        }}
      >
        <div className="flex items-center gap-2 print:hidden">
          <div className="flex-grow">
            <MySearchInput
              placeholder="Поиск партнёра..."
              id="partner-search"
              ref={searchPartnerInputRef}
              value={partnerQuery}
              autoComplete="off"
              onChange={(e) => setPartnerQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (filteredPartners.length > 0) {
                    resultPartenrRefs.current[0]?.focus();
                  } else {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  searchAwtoInputRef.current?.focus();
                  searchAwtoInputRef.current?.select();
                }
              }}
            />
          </div>
          <label
            htmlFor="partner-search"
            className="block font-semibold text-gray-700 dark:text-gray-400 mb-1 w-24"
          >
            Партнеры
          </label>
        </div>

        <div className="ml-20">
          {filteredPartners.length > 0 && (
            <div className="absolute bg-gray-300 p-2 mt-1 border border-gray-500 rounded-md dark:bg-gray-700 z-20">
              <SearchedPartnerList
                filteredPartners={filteredPartners}
                setFilteredPartners={setFilteredPartners}
                resultPartenrRefs={resultPartenrRefs}
                searchPartnerInputRef={searchPartnerInputRef}
                setPartnerQuery={setPartnerQuery}
                inputRef={inputRef}
                setSelectedPartner={setSelectedPartner}
              />
            </div>
          )}
        </div>
      </div>

      {/* for search product */}
      <div
        className="mt-2"
        tabIndex={-1}
        onBlur={(e) => {
          // Проверим, ушёл ли фокус с блока и его дочерних элементов
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setResults([]);
          }
        }}
      >
        <div className="flex items-center gap-2 print:hidden">
          <div className="flex-grow">
            <MySearchInput
              id="product-search"
              ref={inputRef}
              value={query}
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск товара... (INSERT)"
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (results.length > 0) {
                    resultRefs.current[focusedIndex]?.focus();
                  } else if (invoiceTable.length > 0) {
                    const firstNormalProduct = invoiceTable.find(
                      (item) => item.is_gift === false
                    );
                    if (firstNormalProduct) {
                      const firstProductId = firstNormalProduct.id;
                      setTimeout(() => {
                        quantityInputRefs.current[firstProductId]?.focus();
                        quantityInputRefs.current[firstProductId]?.select();
                      }, 0);
                    }
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  searchPartnerInputRef.current?.focus();
                  searchPartnerInputRef.current?.select();
                }
              }}
            />
          </div>
          <label
            htmlFor="product-search"
            className="block font-semibold text-gray-700 dark:text-gray-400 mb-1 w-24"
          >
            Продукты
          </label>

          {/* <MySearchInput
            id="product-search"
            ref={inputRef}
            value={query}
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск товара..."
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (results.length > 0) {
                  resultRefs.current[focusedIndex]?.focus();
                } else if (invoiceTable.length > 0) {
                  const firstNormalProduct = invoiceTable.find(
                    (item) => item.is_gift === false
                  );
                  if (firstNormalProduct) {
                    const firstProductId = firstNormalProduct.id;
                    setTimeout(() => {
                      quantityInputRefs.current[firstProductId]?.focus();
                      quantityInputRefs.current[firstProductId]?.select();
                    }, 0);
                  }
                }
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                searchPartnerInputRef.current?.focus();
                searchPartnerInputRef.current?.select();
              }
            }}
          /> */}
        </div>
        <div className="ml-20">
          {results.length > 0 &&
            (loading ? (
              <MyLoading />
            ) : (
              <div className="absolute bg-gray-300 p-2 mt-1 border border-gray-500 rounded-md dark:bg-gray-700">
                <SearchedProductList
                  t={t}
                  results={results}
                  setResults={setResults}
                  resultRefs={resultRefs}
                  selectedProducts={selectedProducts}
                  setSelectedProducts={setSelectedProducts}
                  invoiceTable={invoiceTable}
                  setInvoiceTable={setInvoiceTable}
                  priceType={priceType}
                  setPriceType={setPriceType}
                  inputRef={inputRef}
                  quantityInputRefs={quantityInputRefs}
                  setQuery={setQuery}
                  setNotification={setNotification}
                  showNotification={showNotification}
                  notification={notification}
                  Notification={Notification}
                  // setFreeProducts={setFreeProducts}
                  // freeProducts={freeProducts}
                />
              </div>
            ))}
        </div>
      </div>

      <div className="hidden print:block">
        {selectedWarehouse && (
          <div className="flex">
            <span className="w-36">Satyjy:</span>
            <span>{selectedWarehouse}</span>
          </div>
        )}
        {selectedPartner && (
          <div className="flex">
            <span className="w-36">Satyn alyjy:</span>
            <div>{selectedPartner}</div>
          </div>
        )}
      </div>

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
          inputRef={inputRef}
          adminVisibleColumns={adminVisibleColumns}
          userVisibleColumns={userVisibleColumns}
          handleDeleteProduct={handleDeleteProduct}
        />
      )}
      {selectedAwto && (
        <div className="mt-5 font-semibold hidden print:block">
          {selectedAwto}
        </div>
      )}
    </div>
  );
};

export default AddSaleInvoicePage;
