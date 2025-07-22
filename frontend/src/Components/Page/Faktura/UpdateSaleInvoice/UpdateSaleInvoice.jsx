import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import myAxios from "../../../axios";
import MyLoading from "../../../UI/MyLoading";
import SmartTooltip from "../../../SmartTooltip";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MySearchInput from "../../../UI/MySearchInput";
import Fuse from "fuse.js";
import { myClass } from "../../../tailwindClasses";
import Notification from "../../../Notification";
import UpdateInvoiceForm2 from "./UpdateInvoiceForm2";
import MyButton from "../../../UI/MyButton";
import MyInput from "../../../UI/MyInput";
import { ROUTES } from "../../../../routes";
import GetSaldo2 from "../SaleInvoice/GetSaldo2";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineDown } from "react-icons/ai";

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

const UpdateSaleInvoice = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false); // dlya galochek
  const { id } = useParams(); // Получаем ID из URL
  const [invoice, setInvoice] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const backBtn = useRef(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [filteredAwto, setFilteredAwto] = useState([]);
  const [allAwto, setAllAwto] = useState([]);
  const [awtoQuery, setAwtoQuery] = useState("");
  const searchAwtoInputRef = useRef(null);
  const searchPartnerInputRef = useRef(null);
  const [selectedAwto, setSelectedAwto] = useState("");
  const [selectedAwtoId, setSelectedAwtoId] = useState(null);
  const resultAwtoRefs = useRef([]);
  const [stopOpenAwtoList, setStopOpenAwtoList] = useState(false);
  const [stopOpenPartnerList, setStopOpenPartnerList] = useState(false);
  const [partnerQuery, setPartnerQuery] = useState("");
  const [filteredPartners, setFilteredPartners] = useState([]);
  const resultPartenrRefs = useRef([]);
  const inputRef = useRef(null);
  const [selectedPartner, setSelectedPartner] = useState({});
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [allPartners, setAllPartners] = useState([]);
  const priceInputRefs = useRef({});
  const unitSelectRefs = useRef({});
  const [totalPaySumm, setTotalPaySumm] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);
  //   product
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const resultRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [invoiceTable, setInvoiceTable] = useState([]);
  const quantityInputRefs = useRef({});

  //   saldo
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);
  const [isEntry, setIsEntry] = useState(false);
  const [openEntryModal, setOpenEntryModal] = useState(false);
  const [selectedEntryForModal, setSelectedEntryForModal] = useState(null);
  const [description, setDescription] = useState("");

  const [notification, setNotification] = useState({ message: "", type: "" });
  const [priceType, setPriceType] = useState("wholesale");

  const [totalDebit, setTotalDebit] = useState(0)

  //   Visible columns START
  const defaultVisibleColumns = adminVisibleColumns;

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("visibleColumns");
    return saved ? JSON.parse(saved) : defaultVisibleColumns;
  });

  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  //   Visible columns END

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

  useEffect(() => {
    setLoading(true);
    const fetchInvoice = async () => {
      try {
        const res = await myAxios.get(`sales-invoices/${id}/`);
        setInvoice(res.data);
      } catch (error) {
        console.log("Не удалось загрузить invoice", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  // for serach partner START
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

  const fuse = new Fuse(allPartners, {
    keys: ["name"],
    threshold: 0.3,
  });

  useEffect(() => {
    if (!partnerQuery) {
      setFilteredPartners([]);
      return;
    }
    const partnerResults = fuse.search(partnerQuery);
    const matched = partnerResults.map((result) => result.item);
    setFilteredPartners(matched);
  }, [partnerQuery, allPartners]);

  // for serach partner END

  // for serach product
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchProducts = async () => {
        if (query.length >= 2) {
          //   setLoading(true);
          try {
            const res = await myAxios.get(`search-products/?q=${query}`);
            setResults(res.data);
            // console.log("res.data", res.data);

            setFocusedIndex(0);
          } catch (error) {
            console.error(error);
          } finally {
            // setLoading(false);
          }
        } else {
          setResults([]);
        }
      };
      fetchProducts();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);
  // ########################################################################################################################## updateQuantity START
  const updateQuantity = (productId, new_quantity) => {
    setInvoiceTable((prevTable) =>
      prevTable.map((item) => {
        if (item.id === productId) {
          const factor = item.selected_unit.conversion_factor;
          const new_base_quantity = new_quantity * factor;

          let not_enough = false;
          if (parseFloat(item.quantity_in_stok) < new_base_quantity) {
            not_enough = true;
            setShowStockMessageIds((prev) => [...prev, item.id]);
            setTimeout(() => {
              setShowStockMessageIds((prev) =>
                prev.filter((id) => id !== item.id)
              );
            }, 3000);
          }

          const new_purchase_price_summ =
            item.purchase_price_1pc * new_quantity;
          const new_difference_price_summ =
            new_quantity * (parseFloat(item.difference_price) || 0);
          const new_discount_price_summ =
            new_quantity * parseFloat(item.discount_difference_price);

          const priceFieldSumm =
            priceType === "wholesale"
              ? "wholesale_price_summ"
              : "retail_price_summ";
          const new_price_summ =
            priceType === "wholesale"
              ? new_quantity * item.wholesale_price_1pc
              : new_quantity * item.retail_price_1pc;

          return {
            ...item,
            selected_quantity: new_quantity,
            base_quantity: new_base_quantity,
            [priceFieldSumm]: new_price_summ,
            purchase_price_summ: new_purchase_price_summ,
            difference_price_summ: new_difference_price_summ,
            discount_difference_price_summ: new_discount_price_summ,
            manually_changed_fields: {
              ...item.manually_changed_fields,
              quantity: true,
              not_enough,
            },
          };
        }

        // Подарки
        if (item.gift_for_product_id === productId) {
          let not_enough_gift = false;
          const factor = item.selected_unit.conversion_factor;
          const parent = prevTable.find((p) => p.id === productId);
          const gift_quantity = item.original_quantity_per_unit * new_quantity;

          if (item.quantity_in_stok / factor < gift_quantity) {
            not_enough_gift = true;
            setShowStockMessageIds((prev) => [...prev, item.id]);
            setTimeout(() => {
              setShowStockMessageIds((prev) =>
                prev.filter((id) => id !== item.id)
              );
            }, 3000);
          }

          return {
            ...item,
            selected_quantity: gift_quantity,
            manually_changed_fields: {
              ...item.manually_changed_fields,
              not_enough: not_enough_gift,
            },
          };
        }

        return item;
      })
    );
  };

  // ########################################################################################################################## updateQuantity END

  //   ######################################################################################################################## invoice START
  useEffect(() => {
    if (!invoice) return;
    // console.log("invoice", invoice);

    searchPartnerInputRef.current?.focus();
    // setTimeout(() => {
    //   if (invoice.total_pay_summ) {
    //     setTotalPaySumm(invoice.total_pay_summ);
    //   }
    // }, 50);

    if (invoice.note) {
      setDescription(invoice.note);
    }

    if (invoice.isEntry) {
      setIsEntry(invoice.isEntry);
    }

    if (invoice.warehouse?.id > 0) {
      setSelectedWarehouseId(invoice.warehouse.id);
      setSelectedWarehouse(invoice.warehouse);
    } else if (allWarehouses.length > 0) {
      setSelectedWarehouseId(allWarehouses[0].id);
      setSelectedWarehouse(allWarehouses[0].name);
    }

    if (invoice?.delivered_by) {
      setSelectedAwto(invoice?.delivered_by);
      setSelectedAwtoId(invoice?.delivered_by.id);
      setAwtoQuery(invoice?.delivered_by.name);
      setFilteredAwto([]);
      setStopOpenAwtoList(true);
    }

    if (invoice?.created_at) {
      const formattedDate = new Date(invoice.created_at)
        .toISOString()
        .split("T")[0];
      setSelectedDate(formattedDate);
    }

    if (invoice.buyer) {
      setPartnerQuery(invoice.buyer.name);
      setSelectedPartner(invoice.buyer);
      setSelectedPartnerId(invoice.buyer.id);
      setStopOpenPartnerList(true);
    }
    const loadProducts = async () => {
      try {
        const productResponses = await Promise.all(
          invoice.items.map((item) =>
            myAxios.get(`products/${item.product.id}`).then((res) => ({
              data: res.data,
              quantity: item.quantity,
            }))
          )
        );

        for (const { data, quantity } of productResponses) {
          if (parseFloat(data.purchase_price) !== 0) {
            // console.log("data", data);

            await handleSelectProduct(data); // если она асинхронная
            updateQuantity(data.id, quantity);
          }
        }

        // ✅ Здесь уже точно всё обработано — ставим сумму
        if (invoice.total_pay_summ) {
          // console.log('invoice.total_pay_summ', invoice.total_pay_summ);

          setTotalPaySumm(invoice.total_pay_summ);
        }
      } catch (error) {
        console.log("Ошибка при загрузке продуктов:", error);
      } finally {
      }
    };

    loadProducts();
  }, [invoice]);
  //   ######################################################################################################################## invoice END

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

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  //   ############################################################################################################################# handleFreeProducts START
  async function handleFreeProducts(product) {
    if (product.free_items.length === 0) return;

    try {
      const free_products = product.free_items.map((g) => {
        return {
          id: g.gift_product,
          gift_quantity_per_unit: g.quantity_per_unit,
        };
      });

      const gift_results = [];

      for (const p of free_products) {
        const res = await myAxios.get(`products/${p.id}`);
        // console.log("res.data", res.data);

        gift_results.push({
          ...res.data,
          gift_quantity: parseFloat(p.gift_quantity_per_unit) || 1,
          gift_for_product_id: product.id,
          gift_for_product_name: product.name,
        });
      }

      // Добавляем каждый подарок в таблицу
      gift_results.forEach((gift) => {
        let selected_unit = null;
        // console.log('gift.units', gift.units);
        // console.log('gift.units', gift.units > 0);
        if (gift.units.length > 0) {
          // console.log('tut', gift);

          const defaultUnit = gift.units.find((u) => u.is_default_for_sale);
          // console.log('defaultUnit', defaultUnit);

          if (defaultUnit) {
            selected_unit = {
              id: defaultUnit.unit,
              name: defaultUnit.unit_name,
              conversion_factor: defaultUnit.conversion_factor,
            };
            // console.log("selected_unit", selected_unit);
          } else {
            selected_unit = {
              id: gift.base_unit_obj.id,
              name: gift.base_unit_obj.name,
              conversion_factor: 1,
            };
          }
        } else {
          selected_unit = {
            id: gift.base_unit_obj.id,
            name: gift.base_unit_obj.name,
            conversion_factor: 1,
          };
        }

        setInvoiceTable((prev) => [
          ...prev,
          {
            // id: `${gift.id}-gift-${gift.gift_for_product_id}`, // уникальный id
            id: gift.id,
            qr_code: gift.qr_code,
            name: gift.name,
            gift_for_product_name: gift.gift_for_product_name,
            quantity_in_stok: gift.quantity,
            selected_unit,
            selected_quantity: gift.gift_quantity,
            original_quantity_per_unit: gift.gift_quantity,
            base_quantity: gift.gift_quantity,
            wholesale_price_1pc: 0,
            original_wholesale_price_1pc: 0,
            wholesale_price_summ: 0,

            purchase_price_1pc: 0,
            purchase_price_summ: 0,

            retail_price_1pc: 0,
            original_retail_price_1pc: 0,
            retail_price_summ: 0,

            difference_price: 0,
            difference_price_summ: 0,

            original_difference_price_retail: 0,
            original_difference_price_wholesale: 0,
            original_discount_difference_price_retail: 0,
            original_discount_difference_price_wholesale: 0,

            discount_difference_price: 0,
            original_discount_difference_price: 0,
            discount_difference_price_summ: 0,

            units: gift.units,
            base_unit: gift.base_unit_obj,
            quantity_in_stock: gift.quantity,

            manually_changed_fields: {
              price: false,
              quantity: false,
              not_enough: false,
            },

            is_gift: true,
            gift_for_product_id: gift.gift_for_product_id,

            volume: gift.volume,
            weight: gift.weight,
            length: gift.length,
            width: gift.width,
            height: gift.height,
          },
        ]);
      });
    } catch (error) {
      console.error("Ошибка при получении подарочных продуктов:", error);
    }
  }
  //   ############################################################################################################################# handleFreeProducts END

  // ############################################################################################################################ handleSelectProduct START

  const handleSelectProduct = async (product) => {
    const alreadyExists = invoiceTable.some((p) => p.id === product.id);

    if (alreadyExists) {
      showNotification("Продукт уже добавлен", "error");
      return;
    }

    let selected_unit = null;
    if (product.units.length > 0) {
      const defaultUnit = product.units.find((u) => u.is_default_for_sale);
      if (defaultUnit) {
        selected_unit = {
          id: defaultUnit.unit,
          name: defaultUnit.unit_name,
          conversion_factor: defaultUnit.conversion_factor,
        };
      } else {
        selected_unit = {
          id: product.base_unit_obj.id,
          name: product.base_unit_obj.name,
          conversion_factor: 1,
        };
      }
    } else {
      selected_unit = {
        id: product.base_unit_obj.id,
        name: product.base_unit_obj.name,
        conversion_factor: 1,
      };
    }

    let difference_price;
    let discount_difference_price;
    const original_difference_price_wholesale =
      (product.wholesale_price - product.purchase_price) *
      selected_unit.conversion_factor;
    const original_difference_price_retail =
      (product.retail_price - product.purchase_price) *
      selected_unit.conversion_factor;
    const original_discount_difference_price_wholesale = 0;
    const original_discount_difference_price_retail =
      (product.retail_price -
        product.purchase_price -
        (product.wholesale_price - product.purchase_price)) *
      selected_unit.conversion_factor;

    if (priceType === "wholesale") {
      difference_price =
        (product.wholesale_price - product.purchase_price) *
        selected_unit.conversion_factor;
      discount_difference_price = 0;
    } else {
      difference_price =
        (product.retail_price - product.purchase_price) *
        selected_unit.conversion_factor;
      discount_difference_price =
        (product.retail_price -
          product.purchase_price -
          (product.wholesale_price - product.purchase_price)) *
        selected_unit.conversion_factor;
    }

    const wholesale_price_1pc =
      selected_unit.conversion_factor * product.wholesale_price;
    const retail_price_1pc =
      selected_unit.conversion_factor * product.retail_price;
    const purchase_price_1pc =
      selected_unit.conversion_factor * product.purchase_price;

    await handleFreeProducts(product);

    setInvoiceTable((prev) => [
      ...prev,
      {
        id: product.id,
        qr_code: product.qr_code,
        name: product.name,
        quantity_in_stok: product.quantity,
        selected_unit,
        selected_quantity: 1,
        base_quantity: 1,

        wholesale_price_1pc,
        original_wholesale_price_1pc: wholesale_price_1pc,
        wholesale_price_summ: wholesale_price_1pc,

        purchase_price_1pc,
        purchase_price_summ: purchase_price_1pc,

        retail_price_1pc,
        original_retail_price_1pc: retail_price_1pc,
        retail_price_summ: retail_price_1pc,

        difference_price,
        difference_price_summ: difference_price,

        original_difference_price_retail,
        original_difference_price_wholesale,

        original_discount_difference_price_retail,
        original_discount_difference_price_wholesale,

        discount_difference_price,
        original_discount_difference_price: discount_difference_price,
        discount_difference_price_summ: discount_difference_price,

        units: product.units,
        base_unit: product.base_unit_obj,
        quantity_in_stock: product.quantity,

        manually_changed_fields: {
          price: false,
          quantity: false,
          not_enough: false,
        },
        is_gift: false,
        volume: product.volume || 0,
        weight: product.weight || 0,
        length: product.length || 0,
        width: product.width || 0,
        height: product.height || 0,
      },
    ]);

    setResults("");
    setTimeout(() => {
      quantityInputRefs.current[product.id]?.focus();
      quantityInputRefs.current[product.id]?.select();
    }, 0);
    setQuery("");
  };

  // ############################################################################################################################ handleSelectProduct END

  const handleDeleteProduct = (id) => {
    setInvoiceTable((prevTable) =>
      prevTable.filter(
        (product) => product.id !== id && product?.gift_for_product_id !== id
      )
    );
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  // for saldo START
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
        const res = await myAxios.get(`partner/${selectedPartnerId}/entries/`);

        setEntries(res.data.entries);
      } catch (e) {
        setError("Ошибка загрузки истории");
      }
    }

    fetchEntries();
  }, [selectedPartnerId]);

  const handleChangeIsEntry = (event) => {
    setIsEntry(event.target.checked);
    // console.log("Is Entry:", event.target.checked);

    // Здесь можешь вызвать функцию, которая будет проводить проводку
    // if (event.target.checked) postTransaction();
  };

  // for saldo END

  const handleSaveInvoice = async () => {
    // console.log("invoiceTable:", invoiceTable);
    setSaveLoading(true);
    const items = invoiceTable.map((item) => {
      // let productId;
      // if (typeof item.id === "string" && item.id.includes("-gift-")) {
      //   productId = parseInt(item.id.split("-gift-")[0]);
      // } else {
        const productId = parseInt(item.id);
      // }
      return {
        product_id: productId,
        quantity: item.selected_quantity,
        sale_price: item.wholesale_price_1pc,
      };
    });
    // console.log("totalPaySumm", totalPaySumm);

    const dataToSend = {
      buyer_id: selectedPartnerId,
      // currency_id: 1,
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

    // console.log("dataToSend", dataToSend);

    try {
      const res = await myAxios.put(
        `sales-invoices/${invoice.id}/`,
        dataToSend
      );
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

  if (loading) return <MyLoading />;
  if (!invoice) return null;

  return (
    <>
      {invoice && (
        <div className="w-full mx-auto print:border-none print:p-0 print:m-0">
          {/* head  */}
          <div className="bg-yellow-400 dark:bg-gray-800 p-5">
            <div className="print:flex justify-between items-center pb-2 print:border-b print:border-gray-700 print:text-[14px] print:font-semibold hidden">
              <img
                src="/polisem.png"
                alt="polisem"
                width={140}
                className="flex-shrink-0 hidden print:block"
              />
              {/* Заголовок по центру */}
              <h1 className="font-bold text-center flex-1 dark:text-gray-400 print:hidden">
                редактирования расходной накладной № {invoice?.id}{" "}
              </h1>
              <h1 className="font-bold text-center flex-1 dark:text-gray-400 hidden print:block print:text-[24px] print:font-semibold">
                Фактура № {invoice?.id}{" "}
              </h1>

              <div className="mr-2">
                <input
                  type="date"
                  value={selectedDate ?? ""}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={invoice.isEntry}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md
               bg-white text-gray-900
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               dark:bg-gray-800 dark:text-white dark:border-gray-600
               dark:focus:ring-blue-400 dark:focus:border-blue-400
               print:border-none"
                />
              </div>
            </div>

            {/* warehouse and back button */}
            <div className="flex print:hidden justify-between items-center">
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
                  className="block w-full  rounded-md 
                 bg-yellow-400 h-8 text-gray-900 
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
              <h1 className="font-bold text-center flex-1 dark:text-gray-400 print:hidden">
                Редактирования фактуры № {invoice?.id}{" "}
              </h1>
              <div>
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
            </div>

            {/* search awto (employee) */}
            <div
              className="mt-1"
              tabIndex={-1}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setFilteredAwto([]);
                }
              }}
            >
              <div className="flex items-center gap-2 print:hidden">
                <div className="flex-grow">
                  <MySearchInput
                    disabled={invoice.isEntry}
                    placeholder="Поиск awto..."
                    id="awto-search"
                    value={awtoQuery}
                    ref={searchAwtoInputRef}
                    autoComplete="off"
                    onChange={(e) => {
                      setAwtoQuery(e.target.value);
                      setStopOpenAwtoList(false);
                    }}
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
                {filteredAwto.length > 0 && !stopOpenAwtoList && (
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
              className="mt-1"
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
                    disabled={invoice.isEntry}
                    placeholder="Поиск партнёра..."
                    id="partner-search"
                    ref={searchPartnerInputRef}
                    value={partnerQuery}
                    autoComplete="off"
                    onChange={(e) => {
                      setPartnerQuery(e.target.value);
                      setStopOpenPartnerList(false);
                    }}
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
                {filteredPartners.length > 0 && !stopOpenPartnerList && (
                  <div className="absolute bg-gray-300 p-2 mt-1 border border-gray-500 rounded-md dark:bg-gray-700 z-20 font-semibold">
                    <ul className="print:hidden">
                      {filteredPartners.map((p, index) => (
                        <li
                          className={myClass.li}
                          key={p.id}
                          ref={(el) => (resultPartenrRefs.current[index] = el)}
                          tabIndex={0}
                          onClick={() => {
                            setSelectedPartner(p);
                            setPartnerQuery(p.name);
                            setSelectedPartnerId(p.id);
                            setTimeout(() => {
                              setFilteredPartners("");
                            }, 0);
                            inputRef.current?.focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key == "ArrowUp") {
                              e.preventDefault();
                              if (index === 0) {
                                searchPartnerInputRef.current?.focus();
                              } else {
                                resultPartenrRefs.current[index - 1]?.focus();
                              }
                            } else if (e.key == "ArrowDown") {
                              e.preventDefault();
                              if (index + 1 < filteredPartners.length) {
                                resultPartenrRefs.current[index + 1]?.focus();
                              }
                            } else if (e.key === "Enter") {
                              e.preventDefault();
                              // e.target.innerHTML
                              setSelectedPartner(p);
                              setPartnerQuery(p.name);
                              setSelectedPartnerId(p.id);
                              setTimeout(() => {
                                setFilteredPartners("");
                              }, 0);
                              inputRef.current?.focus();
                            }
                          }}
                        >
                          {p.name} ({p.type_display})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* for search product */}
            <div
              className="mt-1"
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
                    disabled={invoice.isEntry}
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
                              quantityInputRefs.current[
                                firstProductId
                              ]?.focus();
                              quantityInputRefs.current[
                                firstProductId
                              ]?.select();
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
                      <div>
                        <ul className="print:hidden">
                          {results.length > 0 &&
                            results.map((product, index) => (
                              <li
                                className={myClass.li}
                                key={product.id}
                                ref={(el) => (resultRefs.current[index] = el)}
                                tabIndex={0}
                                onClick={() => handleSelectProduct(product)}
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    await handleSelectProduct(product);
                                  } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    if (index === 0) {
                                      inputRef.current?.focus();
                                      inputRef.current?.select();
                                    } else {
                                      resultRefs.current[index - 1]?.focus();
                                    }
                                  } else if (
                                    e.key === "ArrowDown" &&
                                    index + 1 < results.length
                                  ) {
                                    e.preventDefault();
                                    resultRefs.current[index + 1]?.focus();
                                  }
                                }}
                              >
                                <div className="flex justify-between w-full">
                                  <div>{product.name}</div>
                                  {/* <div>{product.quantity}</div> */}
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {invoiceTable.length > 0 && (
              <div className="print:hidden">
                <div
                  className="flex text-center items-center gap-2 text-blue-600 hover:underline hover:text-blue-800 cursor-pointer transition"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span>Настройки</span>
                  <AiOutlineDown
                    className={`transition-transform duration-300 transform ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="print:hidden p-4 shadow-sm dark:bg-gray-800 max-w-full flex flex-col gap-4 mt-2 print:p-0 print:m-0"
                    >
                      {/* Тип цены и чекбоксы в одной строке, wrap для чекбоксов */}

                      <div className="flex flex-wrap items-center gap-6">
                        {/* Тип цены */}
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Тип цены:
                          </span>
                          <label className="flex items-center gap-1 cursor-pointer select-none text-gray-800 dark:text-gray-200">
                            <input
                              type="radio"
                              name="priceType"
                              value="wholesale"
                              onChange={(e) => {
                                setPriceType(e.target.value);
                                setInvoiceTable((prev) =>
                                  prev.map((item) => {
                                    return {
                                      ...item,
                                      selected_quantity: item.selected_quantity,
                                      base_quantity: 1,
                                      wholesale_price_1pc:
                                        item.original_wholesale_price_1pc,
                                      wholesale_price_summ:
                                        item.original_wholesale_price_1pc *
                                        item.selected_quantity,
                                      retail_price_1pc:
                                        item.original_retail_price_1pc,
                                      retail_price_summ:
                                        item.original_retail_price_1pc,
                                      purchase_price_summ:
                                        item.purchase_price_1pc *
                                        item.selected_quantity,
                                      difference_price:
                                        item.original_difference_price_wholesale,
                                      difference_price_summ:
                                        item.original_difference_price_wholesale *
                                        item.selected_quantity,
                                      discount_difference_price:
                                        item.original_discount_difference_price_wholesale,
                                      discount_difference_price_summ:
                                        item.original_discount_difference_price_wholesale *
                                        item.selected_quantity,
                                      manually_changed_fields: {
                                        ...item.manually_changed_fields,
                                        price: false,
                                      },
                                    };
                                  })
                                );
                              }}
                              checked={priceType === "wholesale"}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                            />
                            <span>Опт</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer select-none text-gray-800 dark:text-gray-200">
                            <input
                              type="radio"
                              name="priceType"
                              value="retail"
                              onChange={(e) => {
                                setPriceType(e.target.value);
                                setInvoiceTable((prev) =>
                                  prev.map((item) => {
                                    return {
                                      ...item,
                                      selected_quantity: item.selected_quantity,
                                      base_quantity: 1,
                                      wholesale_price_1pc:
                                        item.original_wholesale_price_1pc,
                                      wholesale_price_summ:
                                        item.original_wholesale_price_1pc,
                                      retail_price_1pc:
                                        item.original_retail_price_1pc,
                                      retail_price_summ:
                                        item.original_retail_price_1pc *
                                        item.selected_quantity,
                                      purchase_price_summ:
                                        item.purchase_price_1pc *
                                        item.selected_quantity,
                                      difference_price:
                                        item.original_difference_price_retail,
                                      difference_price_summ:
                                        item.original_difference_price_retail *
                                        item.selected_quantity,
                                      discount_difference_price:
                                        item.original_discount_difference_price_retail,
                                      discount_difference_price_summ:
                                        item.original_discount_difference_price_retail *
                                        item.selected_quantity,
                                      manually_changed_fields: {
                                        ...item.manually_changed_fields,
                                        price: false,
                                      },
                                    };
                                  })
                                );
                              }}
                              checked={priceType === "retail"}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                            />
                            <span>Розница</span>
                          </label>
                        </div>

                        {/* Чекбоксы */}
                        <div className="flex flex-wrap gap-4 flex-1 min-w-[300px]">
                          {[
                            { key: "qr_code", label: "QR code" },
                            { key: "purchase", label: "Приход" },
                            { key: "income", label: "Доход" },
                            { key: "discount", label: "Скидка" },
                            { key: "volume", label: "Объём (м³)" },
                            { key: "weight", label: "Вес (кг)" },
                            { key: "dimensions", label: "Размеры" },
                          ].map(({ key, label }) => (
                            <label
                              key={key}
                              className="flex items-center gap-2 cursor-pointer select-none text-gray-800 dark:text-gray-200"
                            >
                              <input
                                type="checkbox"
                                checked={visibleColumns[key]}
                                onChange={(e) =>
                                  setVisibleColumns((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Кнопки управления галочками с меньшими размерами */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setVisibleColumns(userVisibleColumns)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 text-white rounded text-sm transition"
                          type="button"
                        >
                          Снять все галочки
                        </button>
                        <button
                          onClick={() => setVisibleColumns(adminVisibleColumns)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400 text-white rounded transition"
                          type="button"
                        >
                          Вставить все галочки
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="hidden print:block print:text-[13px] print:font-normal print:leading-tight space-y-0.5">
              {selectedWarehouse.name && (
                <div>
                  <b>Satyjy:</b> {selectedWarehouse.name}
                </div>
              )}
              {selectedPartner?.name && (
                <div>
                  <b>Satyn alyjy:</b> {selectedPartner.name}
                </div>
              )}
              {/* {selectedCurrency && (
            <div>
              <b>Walyuta:</b> {selectedCurrency.currency}
            </div>
          )} */}
              {selectedAwto.name && (
                <div>
                  <b>Awto:</b> {selectedAwto.name}
                </div>
              )}
            </div>
          </div>
          {invoiceTable.length > 0 && (
            <UpdateInvoiceForm2
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
              invoice={invoice}
              setTotalDebit={setTotalDebit}
            />
          )}
        </div>
      )}
      {/* {selectedAwto?.name && (
        <div className="mt-5 font-semibold hidden print:block print:text-[14px] print:font-semibold">
          {selectedAwto.name}
        </div>
      )} */}
      {invoiceTable.length > 0 && (
        <div className="lg:flex lg:flex-row gap-4 print:block print:w-full bg-yellow-400 p-4">
          {/* Левая часть */}
          <div className="flex-1 space-y-3 print:hidden">
            {/* Примечание */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Примечание
              </label>
              <textarea
                disabled={invoice.isEntry}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="1"
                className="w-full px-3 py-1.5 border rounded-lg shadow-sm resize-y
        bg-white text-gray-900 border-gray-300
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        dark:bg-gray-800 dark:text-white dark:border-gray-600 
        dark:focus:ring-blue-400 dark:focus:border-blue-400
        placeholder-gray-400 dark:placeholder-gray-500 text-sm transition"
                placeholder="Введите дополнительную информацию..."
              />
            </div>

            {/* Нижний блок: чекбокс, сумма, кнопка */}
            <div className="mt-2 flex flex-wrap justify-between items-center gap-2 print:hidden">
              {/* Чекбокс */}
              <label
                htmlFor="post-transaction"
                className="inline-flex items-center space-x-1 text-gray-800"
              >
                <input
                  disabled={invoice.isEntry}
                  checked={isEntry}
                  onChange={handleChangeIsEntry}
                  id="post-transaction"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm select-none">С проводкой</span>
              </label>
              {/* <input
                disabled={invoice.isEntry}
                checked={isEntry}
                onChange={handleChangeIsEntry}
                id="post-transaction"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              /> */}

              {/* Сумма платёжа */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="payed_summ"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Оплата:
                </label>
                <MyInput
                  disabled={invoice.isEntry}
                  id="payed_summ"
                  value={totalPaySumm}
                  onChange={(e) => setTotalPaySumm(e.target.value)}
                  className="w-24"
                />
              </div>
              {/* <div>
                <label
                  htmlFor="payed_summ"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Сумма платёжа
                </label>
                <MyInput
                  disabled={invoice.isEntry}
                  id="payed_summ"
                  value={totalPaySumm}
                  onChange={(e) => setTotalPaySumm(e.target.value)}
                />
              </div> */}

              {/* Кнопка */}

              <MyButton
                  variant="blue"
                  onClick={handleSaveInvoice}
                  disabled={invoice.isEntry || saveLoading}
                >
                  {saveLoading ? t("saving") : t("save")}
                </MyButton>

              {/* <div className="sm:text-right">
                <MyButton
                  variant="blue"
                  onClick={handleSaveInvoice}
                  disabled={invoice.isEntry || saveLoading}
                >
                  {saveLoading ? t("saving") : t("save")}
                </MyButton>
              </div> */}
            </div>
          </div>

          {/* Правая часть */}
          <div className="flex-shrink-0 w-full lg:w-auto print:w-full">
            <GetSaldo2 entries={entries} setTotalDebit={setTotalDebit} totalDebit={totalDebit} totalPaySumm={totalPaySumm} />
          </div>
        </div>
      )}

      <Notification
        message={t(notification.message)}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
    </>
  );
};

export default UpdateSaleInvoice;
