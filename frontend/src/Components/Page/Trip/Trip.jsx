import { motion, AnimatePresence } from "framer-motion";
import myAxios from "../../axios";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field } from "formik";
import { DateContext } from "../../UI/DateProvider";
import { useContext, useEffect, useState, useRef } from "react";
import useDebounce from "../../../hooks/useDebounce";
import { Spin } from "antd";
import { Coins, Search, X, Plus, Trash2, User, Send, FileText, ArrowRight, ArrowLeft, MessageCircle, Calendar, Truck, Box, Weight, Eye, Edit3, FileSpreadsheet, Printer } from "lucide-react";
import { formatNumber2 } from "../../UI/formatNumber2";
import { useNotification } from "../../context/NotificationContext";
import MyFormatDate from "../../UI/MyFormatDate";
import { useNavigate } from "react-router-dom";
import { PROCHEE } from "../../../routes";

const Trip = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  // , setDateProwodok, setDateFrom, setDateTo
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);
  const [invoices, setInvoices] = useState([]);
  const [trips, setTrips] = useState([]);
  const [query, setQuery] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState(null);
  const [totalVolume, setTotalVolume] = useState({
    volume: 0,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    price: 0,
  });

  const queryInput = useRef(null);
  const driverRefs = useRef([]);
  const invoiceRefs = useRef([]);
  const driverTxtRef = useRef(null);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    document.title = t("trips");
  }, [t]);

  useEffect(() => {
    queryInput.current?.focus();
  }, []);

  const getTrips = async () => {
    try {
      const res = await myAxios.get("get_trips", {
        params: {
          dateFrom,
          dateTo,
        },
      });
      console.log("res.data", res.data.data);
      setTrips(res.data.data);
    } catch (err) {
      console.log("cant get_trips", err);
    }
  };
  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    // setSelectedInvoices([]);
    getTrips();
  }, [dateFrom, dateTo]);

  const handleSelectDriver = (driver, setFieldValue) => {
    setFieldValue("driver", driver.id);
    setSelectedDriver(driver);
    setDrivers([]);
    setQuery("");
    setActiveInvoiceId(null);
    getInvoices(driver.id);
  };

  const getInvoices = async (driverId) => {
    if (!driverId || !dateFrom || !dateTo) return;
    setInvoicesLoading(true);
    try {
      const res = await myAxios.get(`get_invoices_for_trip/`, {
        params: { dateFrom, dateTo, driverId: driverId },
      });
      // setInvoices(res.data.invoices);
      setInvoices(res.data.invoices.filter((inv) => !selectedInvoices.some((sel) => sel.id === inv.id)));
      if (res.data.invoices.length > 0) {
        setActiveInvoiceId(res.data.invoices[0].id);
      } else {
        setActiveInvoiceId(null);
        setTotalVolume({
          volume: 0,
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
          price: 0,
        });
      }
    } catch (error) {
      console.error("Ошибка при получении накладных:", error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    getInvoices(selectedDriver?.id);
  }, [dateFrom, dateTo, selectedDriver]);

  const driverInputKeyDown = (e, setFieldValue) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < drivers.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : drivers.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelectDriver(drivers[activeIndex], setFieldValue);
      } else {
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && driverRefs.current[activeIndex]) {
      driverRefs.current[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (!debouncedQuery) {
      setDrivers([]);
      setQueryLoading(false);
      return;
    }
    const getDrivers = async () => {
      try {
        const res = await myAxios.get("get_driver_list/", {
          params: { query: debouncedQuery },
        });
        setDrivers(res.data.data);
      } catch (err) {
        console.log("cant get_driver_list = ", err);
      } finally {
        setQueryLoading(false);
      }
    };
    getDrivers();
  }, [debouncedQuery]);

  const invoicesKeyDown = (e) => {
    const ids = invoices.map((i) => i.id);
    let currentIndex = ids.indexOf(activeInvoiceId);
    if (currentIndex === -1) currentIndex = 0;

    if (e.key === "ArrowDown") {
      const nextId = ids[(currentIndex + 1) % ids.length];
      setActiveInvoiceId(nextId);
      invoiceRefs.current[nextId]?.focus();
    }
    if (e.key === "ArrowUp") {
      const prevId = ids[(currentIndex - 1 + ids.length) % ids.length];
      setActiveInvoiceId(prevId);
      invoiceRefs.current[prevId]?.focus();
    }
  };

  useEffect(() => {
    if (activeInvoiceId) {
      invoiceRefs.current[activeInvoiceId]?.focus();
    }
  }, [invoices, activeInvoiceId]);

  const handleSelectInvoice = (inv, setFieldValue, values) => {
    if (!selectedInvoices.find((i) => i.id === inv.id)) {
      // Добавляем в начало списка
      setSelectedInvoices((prev) => [inv, ...prev]);
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
      setFieldValue("invoice_ids", [inv.id, ...values.invoice_ids]);

      // Анимация добавления
      setRecentlyAdded(inv.id);
      setTimeout(() => setRecentlyAdded(null), 1000);
    }
  };

  const handleRemoveSelectedInvoice = (inv, setFieldValue, values) => {
    setSelectedInvoices((prev) => prev.filter((i) => i.id !== inv.id));
    // setInvoices((prev) => [...prev, inv].sort((a, b) => b.id - a.id));
    setInvoices((prev) => [...prev, inv]);
    setFieldValue(
      "invoice_ids",
      values.invoice_ids.filter((id) => id !== inv.id)
    );
  };

  useEffect(() => {
    const totals = selectedInvoices.reduce(
      (acc, inv) => {
        acc.volume += parseFloat(inv.volume) || 0;
        acc.weight += parseFloat(inv.weight) || 0;
        acc.length += parseFloat(inv.length) || 0;
        acc.width += parseFloat(inv.width) || 0;
        acc.height += parseFloat(inv.height) || 0;
        acc.price += parseFloat(inv.total_selected_price) || 0;
        return acc;
      },
      { volume: 0, weight: 0, length: 0, width: 0, height: 0, price: 0 }
    );
    setTotalVolume(totals);
  }, [selectedInvoices]);

  const getInvoiceTypeColor = (type) => {
    const colors = {
      rashod: "bg-indigo-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      prihod: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      wozwrat: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getInvoiceTypeText = (type) => {
    const texts = {
      rashod: t("rashod"), //"Продажа",
      prihod: t("prihod"), // "Закупка",
      wozwrat: t("wozwrat"), // "Возврат",
      transfer: t("transfer"), // "Переход",
    };
    return texts[type] || type;
  };

  const invoiceAnimation = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, x: -100 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  };

  const selectedInvoiceAnimation = {
    initial: { opacity: 0, x: 100, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 100 },
    transition: { type: "spring", stiffness: 500, damping: 30 },
  };

  const saveTrip = async (values) => {
    console.log("values", values);
    try {
      const res = await myAxios.post(`/save_trip/`, values);
      // console.log("res", res);

      showNotification(t(res.data.message), "success");
      getTrips();
    } catch (err) {
      if (err.response.data.message == "transactionChange") {
        showNotification(`${t(err.response.data.message)}: ${err.response.data.reason_for_the_error}`, "error");
      } else if (err.response.data.message == "Cant find invoice") {
        showNotification(`${t(err.response.data.message)}: ${err.response.data.missing}`, "error");
      } else {
        showNotification(`${t(err.response.data.message)}`, "error");
      }
    }
  };

  const handleViewTrip = (tripId) => {
    // Логика просмотра поездки
    console.log("View trip:", tripId);
    navigate(`/trip/${tripId}`);
  };

  const handleUpdateTrip = (trip, setFieldValue) => {
    // Логика редактирования поездки
    // console.log("Update trip:", tripId);
    setFieldValue("comment", trip.comment);
    setFieldValue("driver", trip.driver_id);
    setFieldValue(
      "invoice_ids",
      trip.invoices_json.map((invoice) => {
        return invoice.id;
      })
    );
    setFieldValue("dateProwodok", trip.created_handle);
    setFieldValue("update_id", trip.id);

    setDrivers([]);
    setSelectedDriver({ id: trip.driver_id, name: trip.driver_name });
    setSelectedInvoices(trip.invoices_json);

    // window.scrollTo({
    //   top: 0,
    //   behavior: "smooth",
    // });

    const scrollToSaveBtn = () => {
      driverTxtRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };
    setTimeout(() => {
      scrollToSaveBtn();
    }, 0);
  };

  const handleExportExcel = (tripId) => {
    // Логика экспорта в Excel
    console.log("Export to Excel:", tripId);
  };

  const handlePrintTrip = (tripId) => {
    // Логика печати
    console.log("Print trip:", tripId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("trips")}</h1>
        </div>

        <Formik
          initialValues={{ driver: null, comment: "", invoice_ids: [], dateProwodok: dateProwodok, update_id: null }}
          onSubmit={(values) => {
            saveTrip(values);
            console.log("values", values);
          }}
        >
          {({ setFieldValue, values }) => {
            useEffect(() => {
              setFieldValue("dateProwodok", dateProwodok);
            }, [dateProwodok]);

            return (
              <Form className="space-y-4">
                {/* Driver and Comment in one row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Driver Selection */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" ref={driverTxtRef}>
                      {t("driver")}
                    </label>

                    {selectedDriver?.id ? (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
                      >
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{selectedDriver.name}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => {
                            setSelectedDriver(null);
                            setTimeout(() => {
                              queryInput.current?.focus();
                            }, 0);
                            setFieldValue("driver", null);
                            setInvoices([]);
                            setSelectedInvoices([]);
                            setFieldValue("invoice_ids", []);
                            setFieldValue("update_id", null);
                            setFieldValue("dateProwodok", dateProwodok);
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            autoComplete="off"
                            type="text"
                            ref={queryInput}
                            onChange={(e) => {
                              const value = e.target.value;
                              setQuery(value);
                              setActiveIndex(-1);
                              if (value === "") {
                                setDrivers([]);
                                setQueryLoading(false);
                              } else {
                                setQueryLoading(true);
                              }
                            }}
                            onKeyDown={(e) => driverInputKeyDown(e, setFieldValue)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Поиск водителя..."
                          />
                          {queryLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Spin size="small" />
                            </div>
                          )}
                        </div>

                        <AnimatePresence>
                          {drivers.length > 0 && (
                            <motion.ul
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto"
                            >
                              {drivers.map((driver, index) => (
                                <motion.li
                                  key={driver.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  onClick={() => handleSelectDriver(driver, setFieldValue)}
                                  ref={(el) => (driverRefs.current[index] = el)}
                                  className={`p-2 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 text-sm transition-colors ${
                                    activeIndex === index ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-600"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <User className="w-3 h-3 text-gray-400" />
                                    <span className="font-medium">{driver.name}</span>
                                    <span className="text-gray-500 text-xs">ID: {driver.id}</span>
                                  </div>
                                </motion.li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Comment Field */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("comment")}</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Field
                        as="textarea"
                        name="comment"
                        placeholder={t("add_comment")}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm min-h-[42px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Invoices Section - Compact */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Available Invoices */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-500" />
                          {t("Available invoices")}
                          {invoicesLoading && <Spin size="small" className="ml-2" />}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {invoices.length} {t("pcs")}
                        </span>
                      </div>

                      {invoices.length > 0 ? (
                        <motion.div layout className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                          <AnimatePresence>
                            {invoices.map((inv) => (
                              <motion.div
                                key={inv.id}
                                {...invoiceAnimation}
                                ref={(el) => {
                                  if (el) invoiceRefs.current[inv.id] = el;
                                  else delete invoiceRefs.current[inv.id];
                                }}
                                onKeyDown={invoicesKeyDown}
                                tabIndex={0}
                                className={`p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 cursor-pointer transition-all ${
                                  activeInvoiceId === inv.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                                onClick={() => {
                                  setActiveInvoiceId(inv.id);
                                  setTimeout(() => invoiceRefs.current[inv.id]?.focus(), 0);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                      <span className="font-semibold text-gray-900 dark:text-white text-sm">№{inv.id}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getInvoiceTypeColor(inv.wozwrat_or_prihod)}`}>{getInvoiceTypeText(inv.wozwrat_or_prihod)}</span>
                                        <span className="flex items-center text-xs font-medium text-gray-900 dark:text-white">
                                          <Coins className="w-3 h-3 mr-1 text-green-500" />
                                          {formatNumber2(inv.total_selected_price)}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{inv.partner || "—"}</p>
                                        <span className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {MyFormatDate(inv.invoice_date)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectInvoice(inv, setFieldValue, values);
                                    }}
                                    className="ml-2 p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex-shrink-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        !invoicesLoading && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Нет доступных накладных</p>
                          </motion.div>
                        )
                      )}
                    </div>

                    {/* Selected Invoices */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-green-500" />
                          {t("Selected invoices")}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {selectedInvoices.length} {t("pcs")}
                        </span>
                      </div>

                      {selectedInvoices.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <ArrowLeft className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Выберите накладные</p>
                        </motion.div>
                      ) : (
                        <motion.div layout className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                          <AnimatePresence>
                            {selectedInvoices.map((inv) => (
                              <motion.div
                                key={inv.id}
                                {...selectedInvoiceAnimation}
                                className="p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-all"
                                style={{
                                  backgroundColor: recentlyAdded === inv.id ? "rgb(239 246 255)" : "transparent",
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                      <span className="font-semibold text-gray-900 dark:text-white text-sm">№{inv.id}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getInvoiceTypeColor(inv.wozwrat_or_prihod)}`}>{getInvoiceTypeText(inv.wozwrat_or_prihod)}</span>
                                        <span className="flex items-center text-xs font-medium text-gray-900 dark:text-white">
                                          <Coins className="w-3 h-3 mr-1 text-green-500" />
                                          {formatNumber2(inv.total_selected_price)}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{inv.partner || "—"}</p>
                                        <span className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded shrink-0 ml-2">
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {MyFormatDate(inv.invoice_date)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => handleRemoveSelectedInvoice(inv, setFieldValue, values)}
                                    className="ml-2 p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex-shrink-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      )}
                      {/* Totals */}
                      {selectedInvoices.length > 0 && (totalVolume?.volume || totalVolume?.weight || totalVolume?.length || totalVolume?.width || totalVolume?.height || totalVolume?.price) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 p-3 rounded-lg flex flex-wrap items-center justify-center gap-4 text-sm"
                        >
                          {[
                            { key: "volume", label: t("volumeLabel2"), unit: t("m3") },
                            { key: "weight", label: t("weightLabel2"), unit: t("kg") },
                            { key: "length", label: t("lengthLabel2"), unit: t("sm") },
                            { key: "width", label: t("widthLabel2"), unit: t("sm") },
                            { key: "height", label: t("heightLabel2"), unit: t("sm") },
                            { key: "price", label: t("Price"), unit: "" },
                          ]
                            .filter(({ key }) => totalVolume?.[key] > 0) // Фильтруем только те поля, которые есть и > 0
                            .map(({ key, label, unit }) => (
                              <div key={key} className="flex items-center space-x-1 bg-white dark:bg-gray-600 px-3 py-1.5 rounded-lg shadow-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">{formatNumber2(totalVolume[key])}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">{unit}</span>
                              </div>
                            ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t("save")}</span>
                </motion.button>

                {trips.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {trips.map((trip) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 p-4"
                      >
                        {/* Header with trip number and price */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {t("trip")} №{trip.id}
                              </h3>
                              <div className="flex items-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg border border-green-200 dark:border-green-700">
                                <Coins className="w-3 h-3 text-green-600 dark:text-green-400 mr-1" />
                                <span className="font-bold text-green-700 dark:text-green-300 text-sm">
                                  {formatNumber2(trip.total_price)} {trip.comment}
                                </span>
                              </div>
                            </div>

                            {/* Driver and Date in one line */}
                            <div className="flex items-center space-x-3">
                              <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">{trip.driver_name}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {MyFormatDate(trip.created_handle)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 ml-2">
                            {/* View Icon */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewTrip(trip.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="Просмотр"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>

                            {/* Edit Icon */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateTrip(trip, setFieldValue)}
                              className="p-1.5 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Редактировать"
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>

                            {/* Excel Icon */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleExportExcel(trip.id)}
                              className="p-1.5 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Экспорт в Excel"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </motion.button>

                            {/* Print Icon */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePrintTrip(trip.id)}
                              className="p-1.5 text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900 rounded-lg transition-colors"
                              title="Печать"
                            >
                              <Printer className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Trip details - Physical parameters with labels */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span>{t("volumeLabel2")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatNumber2(trip.total_volume)} {t("m3")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span>{t("weightLabel2")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatNumber2(trip.total_weight)} {t("kg")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span>{t("lengthLabel2")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatNumber2(trip.total_length)} {t("sm")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span>{t("widthLabel2")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatNumber2(trip.total_width)} {t("sm")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span>{t("heightLabel2")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatNumber2(trip.total_height)} {t("sm")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                            <span>{t("Invoice")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {trip.invoices_json.length || 0} {t("pcs")}
                            </span>
                          </div>
                        </div>
                        {trip.comment && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-start space-x-2 text-sm">
                              <MessageCircle className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">{t("comment2")}:</span>
                                <p className="text-gray-700 dark:text-gray-300">{trip.comment}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </Form>
            );
          }}
        </Formik>
      </motion.div>
    </div>
  );
};

export default Trip;
