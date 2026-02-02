import { useTranslation } from "react-i18next";
import { DateContext } from "../../../UI/DateProvider";
import MyFormatDate from "../../../UI/MyFormatDate";
import { useContext, useEffect, useState, useRef } from "react";
import { fetchPartners_no_pag } from "../../../fetchs/optionsFetchers";
import myAxios from "../../../axios";
import { Formik, Form, Field } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import SearchInputWithLiFrontend from "../../../UI/Universal/SearchInputWithLiFrontend";
import Xrow from "../../../UI/Universal/Xrow";
import SearchInputWithLiBackend from "../../../UI/Universal/SearchInputWithLiBackend";
import SelectInput from "../../../UI/Universal/SelectInput";
import { X, ImageOff, Package, User, Warehouse } from "lucide-react";
import { formatNumber2 } from "../../../UI/formatNumber2";
import ZakazForPrint from "./ZakazForPrint";
import SyncFormik from "./SyncFormik";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { useNotification } from "../../../context/NotificationContext";
import { useParams } from "react-router-dom";
import MyModal2 from "../../../UI/MyModal2";
import { useNavigate } from "react-router-dom";

const ALL_COLUMNS = ["price", "total_price", "weight", "volume"];

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Zakaz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);


  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);
  const [partners, setPartners] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [savedZakazId, setSavedZakazId] = useState(null);

  const [saveModal, setSaveModal] = useState(false);
  const [formValuesToSave, setFormValuesToSave] = useState(null);

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const partnerInputRef = useRef(null);
  const buyerInputRef = useRef(null);
  const warehouseInputRef = useRef(null);
  const productInputRef = useRef(null);

  const [searchParams] = useSearchParams();
  const visibleCols = searchParams.get("cols")?.split(",").filter(Boolean) || ALL_COLUMNS;

  const show = (col) => visibleCols.includes(col);

  const priceInputRefs = useRef({});
  const prevLengthRef = useRef(0);

  const qtyRefs = useRef({});
  const priceRefs = useRef({});

  const [focusedCell, setFocusedCell] = useState({
    rowIndex: null,
    field: null, // "qty" | "price"
  });

  useEffect(() => {
    if (!savedZakazId) return;
    navigate("/zakaz-list", { state: { focusId: savedZakazId } });
  }, [savedZakazId]);

  // Загрузка partners only founder
  useEffect(() => {
    const loadPartners = async () => {
      const allpartner = await fetchPartners_no_pag();
      const formatted = allpartner
        .filter((v) => v.type === "founder")
        .map((v) => ({
          ...v,
          id: String(v.id),
          name: v.name,
          type: v.type,
        }));
      setPartners(formatted);
    };
    loadPartners();
  }, []);

  // Загрузка складов
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const res = await myAxios.get("get_active_warehouses");
   
        const results = res.data.data;
        if (results.length > 0) {
          setSelectedWarehouse(results[0]);
        }
        setWarehouses(results);
      } catch (err) {
        console.log("cant get warehouses");
      }
    };
    loadWarehouses();
  }, []);

  useEffect(() => {
    {
      isEdit ? (document.title = t("update zakaz")) : (document.title = t("create zakaz"));
    }

    partnerInputRef.current?.focus();
  }, [t, isEdit]);

  useEffect(() => {
    if (!id) return;

    const loadZakaz = async () => {
      try {
        const res = await myAxios.get(`/zakaz/${id}`);
   
        setSelectedWarehouse(res.data.data.warehouse);
        setSelectedPartner(res.data.data.partner);
        setSelectedBuyer(res.data.data.buyer);
        setSelectedProducts(res.data.data.products);
      } catch (err) {
        showNotification(t(err.response.data.message), "error");
        console.error("Ошибка загрузки заказа", err);
      }
    };

    loadZakaz();
  }, [id]);

  useEffect(() => {
    if (!selectedProduct) return;
;

    handleAddProduct(selectedProduct);
  }, [selectedProduct]);

  const handleAddProduct = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);

      if (exists) {
        return prev.map((p) => (p.id === product.id ? { ...p, selected_quantity: p.selected_quantity + 1 } : p));
      }

      return [
        ...prev,
        {
          ...product,
          selected_quantity: 1,
          selected_price: product.selected_price ?? product.purchase_price,
        },
      ];
    });
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const totals = useMemo(() => {
    return selectedProducts.reduce(
      (acc, p) => {
        const qty = Number(p.selected_quantity) || 0;
        const price = Number(p.selected_price) || 0;
        const weight = Number(p.weight) || 0;
        const volume = Number(p.volume) || 0;

        acc.qty += qty;
        acc.sum += qty * price;
        acc.weight += qty * weight;
        acc.volume += qty * volume;

        return acc;
      },
      { qty: 0, sum: 0, weight: 0, volume: 0 }
    );
  }, [selectedProducts]);

  const updateProductField = (id, field, value) => {
    setSelectedProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // useEffect(() => {
  //   if (selectedProducts.length > prevLengthRef.current) {
  //     const last = selectedProducts[selectedProducts.length - 1];

  //     setTimeout(() => {
  //       qtyRefs.current[last.id]?.focus();
  //       qtyRefs.current[last.id]?.select();
  //     }, 0);
  //   }

  //   prevLengthRef.current = selectedProducts.length;
  // }, [selectedProducts.length]);

  useEffect(() => {
    if (selectedProducts.length > prevLengthRef.current) {
      setFocusedCell({
        rowIndex: selectedProducts.length - 1,
        field: "qty",
      });
    }

    prevLengthRef.current = selectedProducts.length;
  }, [selectedProducts.length]);

  useEffect(() => {
    if (focusedCell.rowIndex === null) return;
    // if (selectedProducts.length > prevLengthRef.current) return;

    const product = selectedProducts[focusedCell.rowIndex];
    if (!product) return;

    const ref = focusedCell.field === "qty" ? qtyRefs.current[product.id] : priceRefs.current[product.id];

    ref?.focus();
    ref?.select();
  }, [focusedCell]);

  const handleCellKeyDown = (e, rowIndex, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      productInputRef.current?.focus();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();

      // если последняя строка — назад в product input
      if (rowIndex === selectedProducts.length - 1) {
        productInputRef.current?.focus();
        setFocusedCell({ rowIndex: null, field: null });
        return;
      }

      setFocusedCell({ rowIndex: rowIndex + 1, field });
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      // если первая строка → в product input
      if (rowIndex === 0) {
        productInputRef.current?.focus();
        setFocusedCell({ rowIndex: null, field: null });
        return;
      }

      setFocusedCell({ rowIndex: rowIndex - 1, field });
    }
  };

  const handleSave = async (value) => {
    const hasProducts = Array.isArray(value.products) && value.products.length > 0;
    const hasBuyer = !!value.buyer;
    const hasPartner = !!value.partner;
    const hasWarehouse = !!value.warehouse;

    if (!hasProducts && !hasBuyer && !hasPartner && !hasWarehouse) {
      showNotification("Заполните хотя бы одно поле", "error");
      return;
    }

    try {
      const res = await myAxios.post("/save_zakaz/", value);

      showNotification(t(res.data.message), "success");
      setSavedZakazId(res.data.zakaz_id);
    } catch (err) {
      if (err.response.data.message === "transactionChange") {
        showNotification(t(err.response.data.reason_for_the_error), "error");
      } else {
        showNotification(t(err.response.data.message), "error");
      }

     
    } finally {
    }
  };

  useEffect(() => {
    if (!isEdit) {
      // сброс формы и выбранных объектов при create
      setSelectedWarehouse(null);
      setSelectedPartner(null);
      setSelectedBuyer(null);
      setSelectedProducts([]);
    }
  }, [isEdit]);

  return (
    <div>
      <div className="p-4 print:hidden">
        <motion.div
          className="flex justify-between border-b-2 border-gray-300 mb-3"
          initial={{ opacity: 0, y: -20 }} // стартовые значения
          animate={{ opacity: 1, y: 0 }} // анимация при монтировании
          // exit={{ opacity: 0, y: -10 }} // анимация при размонтировании
          transition={{ duration: 0.6 }} // длительность анимации
        >
          <div>
            <img src="/polisem.png" alt="polisem-icon" className="h-12 lg:h-14 w-auto" />
          </div>
          <h2 className="self-end mb-0 text-xl font-bold text-center print:!text-black">
            {isEdit ? (
              <div>
                {t("Zakaz")} № {id}
              </div>
            ) : (
              t("Create zakaz")
            )}
          </h2>
          <div className="self-end mb-0 text-sm font-bold text-gray-900 dark:text-white truncate print:!text-black">{MyFormatDate(dateProwodok)}</div>
        </motion.div>

        <Formik
          initialValues={{
            partner: "",
            buyer: "",
            products: [],
            warehouse: "",
          }}
          onSubmit={(values) => {
            setFormValuesToSave({ ...values, date: dateProwodok, isEdit: isEdit, id: id });
            setSaveModal(true); // открываем модалку
          }}
        >
          {({ values, setFieldValue }) => {
            return (
              <Form>
                <div className="grid grid-cols-[2fr_3fr] gap-4">
                  <SyncFormik
                    selectedPartner={selectedPartner}
                    selectedBuyer={selectedBuyer}
                    selectedProduct={selectedProduct}
                    selectedProducts={selectedProducts}
                    selectedWarehouse={selectedWarehouse}
                    setSelectedProducts={setSelectedProducts}
                  />
                  <div className="min-w-0 border-r border-gray-300 dark:border-gray-700 pr-4">
                    <div className="flex flex-col gap-2">
                      {/* warehouse search */}
                      {selectedWarehouse ? (
                        <Xrow
                          selectedObject={selectedWarehouse}
                          setSelectedObject={setSelectedWarehouse}
                          labelText="warehouse" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.1 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.1 } }}
                          focusRef={warehouseInputRef} // chto focus esli X najat
                          onlyDarkModeInputStyle={false}
                          labelIcon="🏭"
                          showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
                        />
                      ) : (
                        <SelectInput
                          list={warehouses}
                          labelText="warehouse" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.1 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.1 } }}
                          ref={warehouseInputRef}
                          diasbledInput={false}
                          onlyDarkModeInputStyle={false}
                          selectedObject={selectedWarehouse}
                          setSelectedObject={setSelectedWarehouse}
                          labelIcon="🏭"
                          emptyOptionText="youNeedSelectWarehouse"
                          refsFocusAfterSelect={{
                            ref1: { ref: partnerInputRef, value: selectedPartner },
                            ref2: { ref: buyerInputRef, value: selectedBuyer },
                            ref3: { ref: productInputRef, value: selectedProduct },
                          }}
                        />
                      )}

                      {/* partner search */}
                      {selectedPartner?.id ? (
                        <Xrow
                          selectedObject={selectedPartner}
                          setSelectedObject={setSelectedPartner}
                          labelText="partner" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
                          focusRef={partnerInputRef} // chto focus esli X najat
                          onlyDarkModeInputStyle={false}
                          labelIcon="👥"
                          showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
                          disabled={false}
                        />
                      ) : (
                        <SearchInputWithLiFrontend
                          list={partners} // spisok s kotorogo nado iskat
                          placeholderText="search partner" // plasholder dlya Input
                          labelText="partner" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr] min-w-0" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
                          ref={partnerInputRef}
                          diasbledInput={false}
                          onlyDarkModeInputStyle={false}
                          selectedObject={selectedPartner}
                          setSelectedObject={setSelectedPartner}
                          labelIcon="👥"
                          handleFuseKeys={["name"]} // поле объекта, по которому ищем
                          handleFuseThreshold={0.3} // насколько строго искать
                          refsFocusAfterSelect={{
                            // eto mojno ispolzowat i w focus pri wybore i pri arrow down
                            ref1: { ref: buyerInputRef, value: selectedBuyer },
                            ref2: { ref: productInputRef, value: selectedProduct },
                          }}
                          refsFocusAfterArrowUp={null}
                          renderLabel={(item, { active }) => (
                            <>
                              <div
                                className={`
                                  w-7 h-7 flex items-center justify-center rounded-md shrink-0
                                  ${active ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/20"}
                                `}
                              >
                                <User className="w-4 h-4" />
                              </div>

                              <span className={`truncate ${active ? "text-white" : ""}`}>{item.name}</span>
                            </>
                          )}
                        />
                      )}

                      {/* buyer search */}
                      {selectedBuyer ? (
                        <Xrow
                          selectedObject={selectedBuyer}
                          setSelectedObject={setSelectedBuyer}
                          labelText="buyer" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.3 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.3 } }}
                          focusRef={buyerInputRef} // chto focus esli X najat
                          onlyDarkModeInputStyle={false}
                          labelIcon="👥"
                          showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
                        />
                      ) : (
                        <SearchInputWithLiFrontend
                          list={partners} // spisok s kotorogo nado iskat
                          placeholderText="search buyer" // plasholder dlya Input
                          labelText="buyer" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr] min-w-0" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.3 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.3 } }}
                          ref={buyerInputRef}
                          diasbledInput={false}
                          onlyDarkModeInputStyle={false}
                          selectedObject={selectedBuyer}
                          setSelectedObject={setSelectedBuyer}
                          labelIcon="👥"
                          handleFuseKeys={["name"]} // поле объекта, по которому ищем
                          handleFuseThreshold={0.3} // насколько строго искать
                          refsFocusAfterSelect={{
                            // eto mojno ispolzowat i w focus pri wybore i pri arrow down
                            ref1: { ref: productInputRef, value: selectedProduct },
                          }}
                          refsFocusAfterArrowUp={{
                            // eto mojno ispolzowat i w focus pri wybore i pri arrow down
                            ref1: { ref: partnerInputRef, value: selectedPartner },
                          }}
                          renderLabel={(item, { active }) => (
                            <>
                              <div
                                className={`
                                  w-7 h-7 flex items-center justify-center rounded-md shrink-0
                                  ${active ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/20"}
                                `}
                              >
                                <User className="w-4 h-4" />
                              </div>

                              <span className={`truncate ${active ? "text-white" : ""}`}>{item.name}</span>
                            </>
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    {/* product search */}
                    <SearchInputWithLiBackend
                      asyncSearch={async (query) => {
                        try {
                          const res = await myAxios.get("/search-product-for-zakaz-input-search", {
                            params: { q: query, w: selectedWarehouse?.id },
                          });
                          return res.data; // ожидаем массив объектов { id, name, ... }
                        } catch (err) {
                          console.error(err);
                          return [];
                        }
                      }}
                      ref={productInputRef}
                      placeholderText="search product"
                      labelText="product"
                      selectedObject={selectedProduct}
                      setSelectedObject={setSelectedProduct}
                      containerClass="flex flex-col"
                      labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.4 } }}
                      inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.4 } }}
                      onlyDarkModeInputStyle={false}
                      refsFocusAfterSelect={null}
                      refsFocusAfterArrowUp={{
                        ref1: { ref: buyerInputRef, value: selectedBuyer },
                        ref2: { ref: partnerInputRef, value: selectedPartner },
                      }}
                      // eto chisto dlya Zakaz.jsx ne uniwersalnyy props
                      selectedProducts={selectedProducts}
                      setFocusedCell={setFocusedCell}
                      disabled={selectedWarehouse?.id ? false : true}
                      disableMessage={selectedWarehouse?.id ? "Поле недоступно" : "forSearchProductShooseWarehouse"}
                      renderItemContent={(item, { active, index }) => (
                        <div className="flex items-center gap-2 w-full">
                          {item.image ? (
                            <img src={`${BASE_URL}${item.image}`} alt={item.name || "item"} className={`w-9 h-9 object-cover rounded-md shrink-0 ${active ? "ring-1 ring-white/40" : ""}`} />
                          ) : (
                            <div
                              className={`w-9 h-9 flex items-center justify-center rounded-md shrink-0
                                ${active ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/20"}`}
                            >
                              <ImageOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}

                          {/* name */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-sm font-medium truncate ${active ? "text-white" : ""}`}>{item.name}</span>
                          </div>

                          {/* quantity */}
                          <div className="shrink-0 text-right">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-md
                                ${
                                  item.quantity_in_warehouse > 0
                                    ? active
                                      ? "bg-white/20 text-white"
                                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                            >
                              {formatNumber2(item.quantity_in_warehouse)}
                            </span>
                          </div>
                        </div>
                      )}
                    />
                    {selectedProducts.length > 0 && (
                      <div className="overflow-x-auto rounded-xl border border-black dark:border-gray-700 mt-7">
                        <motion.table
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1 }}
                          className="min-w-full text-xs text-black dark:text-gray-200 border border-black dark:border-gray-700 border-collapse"
                        >
                          <thead className="bg-gray-100 dark:bg-gray-800 text-[11px] uppercase tracking-wide text-black dark:text-gray-400">
                            <tr>
                              <th className="px-2 py-2 text-center w-10 border border-black dark:border-gray-700">№</th>
                              <th className="px-3 py-2 text-left border border-black dark:border-gray-700">{t("product name")}</th>
                              <th className="px-2 py-2 text-center w-24 border border-black dark:border-gray-700">{t("uni")}</th>
                              <th className="px-2 py-2 text-right w-20 border border-black dark:border-gray-700">{t("q-ty")}</th>
                              {show("price") && <th className="px-2 py-2 text-right w-24 border border-black dark:border-gray-700">{t("Price")}</th>}
                              {show("total_price") && <th className="px-2 py-2 text-right w-24 border border-black dark:border-gray-700">{t("Amount")}</th>}
                              {show("weight") && <th className="px-2 py-2 text-right w-16 border border-black dark:border-gray-700">{t("kg")}</th>}
                              {show("volume") && <th className="px-2 py-2 text-right w-16 border border-black dark:border-gray-700">Куб</th>}
                              <th className="px-1 py-2 text-center w-8 border border-black dark:border-gray-700"></th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedProducts.map((product, index) => {
                              return (
                                <tr
                                  key={product.id}
                                  className={`transition ${focusedCell.rowIndex === index ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500/40" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                >
                                  <td className="px-2 py-1 text-center border border-black dark:border-gray-700">{index + 1}</td>
                                  <td className="px-3 py-1 truncate max-w-xs border border-black dark:border-gray-700">{product.name}</td>
                                  <td className="px-2 py-1 text-center border border-black dark:border-gray-700">{product.unit}</td>
                                  {/* <td className="px-2 py-1 text-right border border-black dark:border-gray-700">{product.selected_quantity}</td> */}
                                  <td className="px-2 py-1 text-right border border-black dark:border-gray-700">
                                    <input
                                      ref={(el) => {
                                        if (el) qtyRefs.current[product.id] = el;
                                      }}
                                      type="text"
                                      // min="0"
                                      // step="0.001"
                                      value={product.selected_quantity}
                                      onChange={(e) => {
                                        let val = e.target.value;

                                        val = val.replace(",", ".");

                                        if (val.startsWith(".")) {
                                          val = "0" + val;
                                        }

                                        if (!/^\d*\.?\d{0,3}$/.test(val)) return;

                                        // разрешаем только цифры и одну точку
                                        if (!/^\d*\.?\d*$/.test(val)) return;
                                        updateProductField(product.id, "selected_quantity", val);
                                      }}
                                      className="w-16 bg-transparent text-right text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      onFocus={() => setFocusedCell({ rowIndex: index, field: "qty" })}
                                      onKeyDown={(e) => handleCellKeyDown(e, index, "qty")}
                                    />
                                  </td>
                                  {show("price") && (
                                    <td className="px-2 py-1 text-right border border-black dark:border-gray-700">
                                      <input
                                        ref={(el) => {
                                          if (el) priceRefs.current[product.id] = el;
                                        }}
                                        type="text"
                                        inputMode="decimal"
                                        value={product.selected_price}
                                        onChange={(e) => {
                                          let val = e.target.value;

                                          // заменяем запятую на точку
                                          val = val.replace(",", ".");

                                          if (val.startsWith(".")) {
                                            val = "0" + val;
                                          }

                                          if (!/^\d*\.?\d{0,3}$/.test(val)) return;

                                          // разрешаем только цифры и одну точку
                                          if (!/^\d*\.?\d*$/.test(val)) return;

                                          updateProductField(product.id, "selected_price", val);
                                        }}
                                        className="w-20 bg-transparent text-right text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onFocus={() => setFocusedCell({ rowIndex: index, field: "price" })}
                                        onKeyDown={(e) => handleCellKeyDown(e, index, "price")}
                                      />
                                    </td>
                                  )}
                                  {show("total_price") && (
                                    <td className="px-2 py-1 text-right font-medium border border-black dark:border-gray-700">
                                      {formatNumber2(parseFloat(product.selected_quantity) * parseFloat(product.selected_price))}
                                    </td>
                                  )}
                                  {show("weight") && (
                                    <td className="px-2 py-1 text-right border border-black dark:border-gray-700">
                                      {formatNumber2(parseFloat(product.weight) * parseFloat(product.selected_quantity))}
                                    </td>
                                  )}
                                  {show("volume") && (
                                    <td className="px-2 py-1 text-right border border-black dark:border-gray-700">
                                      {formatNumber2(parseFloat(product.volume) * parseFloat(product.selected_quantity))}
                                    </td>
                                  )}
                                  <td className="px-1 py-1 text-center border border-black dark:border-gray-700">
                                    <button type="button" onClick={() => removeProduct(product.id)} className="text-gray-400 hover:text-red-600 transition text-xs leading-none" title="Удалить">
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-gray-100 dark:bg-gray-800 font-semibold">
                            <tr>
                              <td className="px-3 py-2 text-right border border-black dark:border-gray-700"></td>
                              <td className="px-3 py-2 text-right border border-black dark:border-gray-700"></td>
                              <td className="px-3 py-2 text-right border border-black dark:border-gray-700">{t("itogo")}:</td>

                              <td className="px-2 py-2 text-right border border-black dark:border-gray-700">{formatNumber2(totals.qty)}</td>

                              {show("price") && <td className="px-2 py-2 border border-black dark:border-gray-700"></td>}

                              {show("total_price") && <td className="px-2 py-2 text-right border border-black dark:border-gray-700">{formatNumber2(totals.sum)}</td>}

                              {show("weight") && <td className="px-2 py-2 text-right border border-black dark:border-gray-700">{formatNumber2(totals.weight)}</td>}

                              {show("volume") && <td className="px-2 py-2 text-right border border-black dark:border-gray-700">{formatNumber2(totals.volume)}</td>}

                              <td className="border border-black dark:border-gray-700"></td>
                            </tr>
                          </tfoot>
                        </motion.table>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit">{t("Save")}</button>
              </Form>
            );
          }}
        </Formik>
      </div>

      <ZakazForPrint
        selectedWarehouse={selectedWarehouse}
        setSelectedWarehouse={setSelectedWarehouse}
        warehouseInputRef={warehouseInputRef}
        selectedPartner={selectedPartner}
        setSelectedPartner={setSelectedPartner}
        partnerInputRef={partnerInputRef}
        selectedBuyer={selectedBuyer}
        setSelectedBuyer={setSelectedBuyer}
        buyerInputRef={buyerInputRef}
        selectedProducts={selectedProducts}
        totals={totals}
        show={show}
        isEdit={isEdit}
        id={id}
      />

      {saveModal && (
        <MyModal2 onClose={() => setSaveModal(false)}>
          <div>
            <p>Вы уверены, что хотите сохранить заказ?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setSaveModal(false)} className="px-4 py-2 border rounded">
                Отмена
              </button>
              <button
                onClick={() => {
                  handleSave(formValuesToSave);
                  setSaveModal(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </MyModal2>
      )}
    </div>
  );
};

export default Zakaz;
