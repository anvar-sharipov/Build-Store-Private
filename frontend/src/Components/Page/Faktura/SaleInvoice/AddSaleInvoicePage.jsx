import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, use, useMemo } from "react";
import SaleInvoiceForm2 from "./SaleInvoiceForm2";
import myAxios from "../../../axios";
import MySearchInput from "../../../UI/MySearchInput";
import SearchedProductList from "./SearchedProductList";
import MyLoading from "../../../UI/MyLoading";
import MyButton from "../../../UI/MyButton";
import Fuse from "fuse.js";
import { myClass } from "../../../tailwindClasses";
import SmartTooltip from "../../../SmartTooltip";
import { useTranslation } from "react-i18next";
import SearchedPartnerList from "./SearchedPartnerList";
import Notification from "../../../Notification";
import MyInput from "../../../UI/MyInput";
import MyModal from "../../../UI/MyModal";
import GetSaldo from "./GetSaldo";
import { ROUTES } from "../../../../routes";

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
  const [awtoQuery, setAwtoQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const searchPartnerInputRef = useRef(null);
  const searchAwtoInputRef = useRef(null);
  const resultRefs = useRef([]);
  const resultPartenrRefs = useRef([]);
  const resultAwtoRefs = useRef([]);
  const backBtn = useRef(null);
  const priceInputRefs = useRef({});
  const quantityInputRefs = useRef({});
  const unitSelectRefs = useRef({});
  const [allPartners, setAllPartners] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [allAwto, setAllAwto] = useState([]);
  const [allCurrency, setAllCurrency] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [filteredAwto, setFilteredAwto] = useState([]);
  const [firstElementRef, setFirstElementRef] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState({});
  const [selectedCurrency, setselectedCurrency] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedAwto, setSelectedAwto] = useState("");
  const [description, setDescription] = useState("");
  const [totalPaySumm, setTotalPaySumm] = useState(0);

  const [openEntryModal, setOpenEntryModal] = useState(false);
  const [selectedEntryForModal, setSelectedEntryForModal] = useState(null);

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("USD");

  // for json for save
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [selectedAwtoId, setSelectedAwtoId] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);

  const [isEntry, setIsEntry] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);

  // dlya wywoda balance partnera
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // selectedProducts
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [invoiceTable, setInvoiceTable] = useState([]);

  // page
  const [priceType, setPriceType] = useState("wholesale");

  const [selectedEntry, setSelectedEntry] = useState("");

  const handleDeleteProduct = (id) => {
    setInvoiceTable((prevTable) =>
      prevTable.filter(
        (product) => product.id !== id && product?.gift_for_product_id !== id
      )
    );
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  // localStorage.removeItem("visibleColumns")

  // table galochki START

  const defaultVisibleColumns = adminVisibleColumns;

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("visibleColumns");
    return saved ? JSON.parse(saved) : defaultVisibleColumns;
  });

  useEffect(() => {
    // console.log("dadadadadadadada", selectedCurrency);
  }, [selectedCurrency]);

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
          // console.log("tut");

          setLoading(true);
          try {
            const res = await myAxios.get(`search-products/?q=${query}`);
            setResults(res.data);
            // console.log("res.data", res.data);

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

  // get all currency (valuta)
  useEffect(() => {
    async function fetchCurrencys() {
      try {
        const res = await myAxios.get("currencys/");
        setAllCurrency(res.data);
      } catch (error) {
        console.error("Ошибка при загрузке valyut", error);
      }
    }
    fetchCurrencys();
  }, []);

  useEffect(() => {
    if (allCurrency.length > 0 && !selectedCurrencyId) {
      const first = allCurrency[0];
      setSelectedCurrencyId(first.id);
      setselectedCurrency(first.name);
    }
  }, [allCurrency]); //

  // get all partners
  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await myAxios.get("partners/");
        // console.log("res.data", res.data);

        setAllPartners(res.data);
      } catch (error) {
        console.error("Ошибка при загрузке партнёров", error);
      }
    }
    fetchPartners();
  }, []);

  // get all warehouses
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
    // Если список не пуст и ничего не выбрано — выбрать первый
    if (allWarehouses.length > 0 && !selectedWarehouseId) {
      const first = allWarehouses[0];
      setSelectedWarehouseId(first.id);
      setSelectedWarehouse(first.name);
    }
  }, [allWarehouses]); //

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
          className="block w-full px-3 py-2 border border-gray-300 rounded-md
               bg-white text-gray-900
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               dark:bg-gray-800 dark:text-white dark:border-gray-600
               dark:focus:ring-blue-400 dark:focus:border-blue-400
               print:border-none"
        />
      </div>
    );
  }

  const handleSaveInvoice = async () => {
    // console.log("invoiceTable:", invoiceTable);
    setSaveLoading(true);
    const items = invoiceTable.map((item) => {
      let productId;
      if (typeof item.id === "string" && item.id.includes("-gift-")) {
        productId = parseInt(item.id.split("-gift-")[0]);
      } else {
        productId = parseInt(item.id);
      }
      return {
        product_id: productId,
        quantity: item.selected_quantity,
        sale_price: item.wholesale_price_1pc,
      };
    });
    // console.log("totalPaySumm", totalPaySumm);

    const dataToSend = {
      buyer_id: selectedPartnerId,
      currency_id: selectedCurrencyId,
      status: "draft",
      warehouse_id: selectedWarehouseId,
      delivered_by_id: selectedAwtoId,
      items: items,
      // ...(selectedEntry && { entry_type: selectedEntry }),
      isEntry: isEntry,
      note: description,
      total_pay_summ: totalPaySumm,
    };

    // if (selectedEntry) {
    //   dataToSend.entry_type = selectedEntry;
    // }

    console.log("dataToSend", dataToSend);

    try {
      const res = await myAxios.post("sales-invoices/", dataToSend);
      console.log("Успешно сохранено:", res.data);
      navigate(ROUTES.MAIN);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      showNotification(t("commonSaveError"), "error");
    } finally {
      setSaveLoading(false);
    }

    // // (опционально) сохранить в стейт
    // setSendDataForSave(dataToSend);
  };

  // wywod istorii pokupok partnera posle najatiya na enter START #########
  // Подсчёт running_balance (накопительного сальдо)
  // Предполагаем: debit — сумма по дебету, credit — по кредиту (числа)
  // Сальдо = предыдущее сальдо + debit - credit
  const entriesWithBalance = useMemo(() => {
    let balance = 0;
    return entries.map((entry) => {
      balance += Number(entry.debit || 0) - Number(entry.credit || 0);
      return { ...entry, running_balance: balance.toFixed(2) };
    });
  }, [entries]);

  useEffect(() => {
    if (!selectedPartnerId) return;

    async function fetchEntries() {
      try {
        setError(null);
        const res = await myAxios.get(
          `/api/partner/${selectedPartnerId}/entries/`
        );
        // console.log("resssssss.data", res.data);

        setEntries(res.data);
      } catch (e) {
        setError("Ошибка загрузки истории");
      }
    }

    fetchEntries();
  }, [selectedPartnerId]);

  // wywod istorii pokupok partnera posle najatiya na enter END #########

  // Функция объединения и пересчёта сальдо нарастающим итогом
  function mergeEntriesWithRunningBalance(entries) {
    const map = new Map();

    // Объединяем по ключу
    entries.forEach((entry) => {
      const key = `${new Date(entry.date).toISOString().slice(0, 10)}|${
        entry.account.number
      }|${entry.transaction_obj?.description || ""}`;

      if (!map.has(key)) {
        map.set(key, {
          ...entry,
          debit: parseFloat(entry.debit) || 0,
          credit: parseFloat(entry.credit) || 0,
        });
      } else {
        const existing = map.get(key);
        existing.debit += parseFloat(entry.debit) || 0;
        existing.credit += parseFloat(entry.credit) || 0;
        map.set(key, existing);
      }
    });

    // Превращаем в массив
    const merged = Array.from(map.values());

    // Считаем нарастающее сальдо
    let runningBalance = 0;
    const result = merged.map((e) => {
      runningBalance += e.debit - e.credit;
      return {
        ...e,
        debit: e.debit === 0 ? "" : e.debit.toFixed(2),
        credit: e.credit === 0 ? "" : e.credit.toFixed(2),
        running_balance: runningBalance.toFixed(2),
      };
    });

    return result;
  }
  // console.log("entriesWithBalance", entriesWithBalance);

  const handleChangeIsEntry = (event) => {
    setIsEntry(event.target.checked);
    console.log("Is Entry:", event.target.checked);

    // Здесь можешь вызвать функцию, которая будет проводить проводку
    // if (event.target.checked) postTransaction();
  };

  return (
    <div className="p-4 w-full mx-auto print:border-none print:p-0 print:m-0">
      {/* head */}
      <div className="bg-yellow-400 dark:bg-gray-800 p-5">
        <div className="flex justify-between items-center pb-2 print:border-b print:border-gray-700 print:text-[14px] print:font-semibold">
          {/* Логотип слева */}
          <img
            src="/polisem.png"
            alt="polisem"
            width={140}
            className="flex-shrink-0 hidden print:block"
          />

          {/* Заголовок по центру */}
          <h1 className="font-bold text-center flex-1 dark:text-gray-400">
            Расходная накладная №
          </h1>

          <div className="mr-2">
            <DateInput />
          </div>

          {/* Кнопка назад справа */}
          <SmartTooltip tooltip={t("back")} shortcut="Escape">
            <div
              ref={backBtn}
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline hover:text-blue-800 cursor-pointer transition print:hidden"
            >
              <span>←</span>
              <span>{t("back")}</span>
            </div>
          </SmartTooltip>
        </div>

        {/* currency and warehouse */}
        <div className="flex gap-5 print:hidden">
          <div className="hidden">
            <select
              onChange={async (e) => {
                setSelectedCurrencyId(e.target.value);

                try {
                  const res = await myAxios.get("currency-rates");
                  setselectedCurrency(
                    res.data.find((cur) => cur.id.toString() !== e.target.value)
                  );
                  // console.log("selectedCurrency", selectedCurrency.rate);
                } catch (error) {
                  console.error("Ошибка при загрузке курсов валют", error);
                }
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                 bg-white text-gray-900 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 dark:bg-gray-800 dark:text-white dark:border-gray-600 
                 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            >
              <option value="" disabled>
                Выберите валюту
              </option>
              {allCurrency.map((cur) => (
                <option value={cur.id} key={cur.id}>
                  {cur.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedWarehouseId(selectedId);

                const selectedWarehouse = allWarehouses.find(
                  (w) => w.id.toString() === selectedId
                );
                if (selectedWarehouse) {
                  setSelectedWarehouse(selectedWarehouse.name);
                }
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                 bg-white text-gray-900 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 dark:bg-gray-800 dark:text-white dark:border-gray-600 
                 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            >
              <option value="" disabled>
                Выберите склад
              </option>
              {allWarehouses.map((w) => (
                <option value={w.id} key={w.id}>
                  {w.name} {w.location}
                </option>
              ))}
            </select>
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
          <div>
            {filteredAwto.length > 0 && (
              <div className="absolute bg-gray-300 p-2 mt-1 border border-gray-500 rounded-md dark:bg-gray-700 z-20 font-semibold">
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
                        setSelectedAwtoId(p.id);
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
                          setSelectedAwtoId(p.id);
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

          <div>
            {filteredPartners.length > 0 && (
              <div className="absolute bg-gray-300 p-2 mt-1 border border-gray-500 rounded-md dark:bg-gray-700 z-20 font-semibold">
                <SearchedPartnerList
                  setSelectedPartnerId={setSelectedPartnerId}
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
          </div>
          <div>
            {results.length > 0 &&
              (loading ? (
                <MyLoading />
              ) : (
                <div className="absolute bg-gray-100 mt-1 border border-gray-500 rounded-md dark:bg-gray-700 w-full font-semibold">
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

        <div className="hidden print:block print:text-[14px] print:font-semibold">
          {selectedWarehouse && (
            <div className="flex">
              <span className="w-36">Satyjy:</span>
              <span>{selectedWarehouse}</span>
            </div>
          )}
          {selectedPartner?.name && (
            <div className="flex">
              <span className="w-36">Satyn alyjy:</span>
              <div>{selectedPartner.name}</div>
            </div>
          )}
          {selectedCurrency && (
            <div className="hidden">
              <span className="w-36">Walyuta:</span>
              <div>{selectedCurrency.currency}</div>
            </div>
          )}
          {selectedAwto && (
            <div className="flex">
              <span className="w-36">Awto:</span>
              <div>{selectedAwto}</div>
            </div>
          )}
          {totalPaySumm && (
            <div className="flex">
              <span className="w-36">Summa plateja:</span>
              <div>{totalPaySumm}</div>
            </div>
          )}
        </div>
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
          totalPaySumm={totalPaySumm}
          setTotalPaySumm={setTotalPaySumm}
        />
      )}
      {/* {selectedAwto && (
        <div className="mt-5 font-semibold hidden print:block print:text-[14px] print:font-semibold">
          {selectedAwto}
        </div>
      )} */}

      <div className="bg-yellow-400 dark:bg-gray-800 p-5 mt-2">
        <GetSaldo
          entriesWithBalance={entriesWithBalance}
          selectedPartner={selectedPartner}
          setOpenEntryModal={setOpenEntryModal}
          setSelectedEntryForModal={setSelectedEntryForModal}
          selectedEntryForModal={selectedEntryForModal}
          myAxios={myAxios}
          openEntryModal={openEntryModal}
          mergeEntriesWithRunningBalance={mergeEntriesWithRunningBalance}
        />
        {invoiceTable.length > 0 && (
          <div>
            <div className="print:hidden">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                Примечание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border rounded-xl shadow-sm resize-y
             bg-white text-gray-900 border-gray-300
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             dark:bg-gray-800 dark:text-white dark:border-gray-600 
             dark:focus:ring-blue-400 dark:focus:border-blue-400
             placeholder-gray-400 dark:placeholder-gray-500 transition"
                placeholder="Введите дополнительную информацию..."
              ></textarea>
            </div>
            <div className="mt-2 flex justify-between items-center print:hidden">
              <div className="flex items-center space-x-2">
                <input
                  checked={isEntry}
                  onChange={handleChangeIsEntry}
                  id="post-transaction"
                  type="checkbox"
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="post-transaction"
                  className="text-gray-800 text-sm font-medium select-none"
                >
                  Сохранить с проводкой
                </label>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="payed_summ"
                  className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Введите сумму платёжа
                </label>
                <MyInput
                  id="payed_summ"
                  value={totalPaySumm}
                  onChange={(e) => setTotalPaySumm(e.target.value)}
                />
              </div>

              <div>
                {invoiceTable.length > 0 && (
                  <MyButton
                    variant="blue"
                    onClick={handleSaveInvoice}
                    disabled={saveLoading}
                  >
                    {saveLoading ? t("saving") : t("save")}
                  </MyButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Notification
        message={t(notification.message)}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
    </div>
  );
};

export default AddSaleInvoicePage;
