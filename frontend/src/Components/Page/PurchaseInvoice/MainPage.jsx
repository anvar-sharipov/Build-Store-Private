import { useTranslation } from "react-i18next";
import InvoiceHead from "./Utils/InvoiceHead";
import { Formik, Form } from "formik";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useContext, useState } from "react";
import invoiceClasses from "./Utils/classes";
import * as Yup from "yup";
import getDefaultValues from "./Utils/defaultValues";
import getInvoiceValidationSchema from "./Utils/validationSchema";
import FetchWarehouse from "./fetchs/FetchWarehouse";
import FetchAwto from "./fetchs/FetchAwto";
import FetchPartner from "./fetchs/FetchPartner";
import FetchProduct from "./fetchs/FetchProduct";
import { DateContext } from "../../UI/DateProvider";
import PTable from "./table/PTable";
import { motion, AnimatePresence } from "framer-motion";
import SubmitButton from "./Utils/SubmitButton";
import { MdPrint } from "react-icons/md";
import { MdPrintDisabled } from "react-icons/md";
import myAxios from "../../axios";
import Saldo from "./Utils/Saldo";
import Notification from "../../Notification";
import Notification2 from "../../Notification2";
import Comment from "./Utils/Comment";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes";
import InfoAboutInvoice from "./Utils/InfoAboutInvoice";
import { useNotification } from "../../context/NotificationContext";
import { AuthContext } from "../../../AuthContext";
import Saldo2 from "./Utils/Saldo2";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const userVisibleColumns = {
  discount_percent: true,
  qr_code: false,
  image: true,
  purchase: false,
  income: false,
  discount: false,
  volume: false,
  weight: false,
  dimensions: false,
};

const adminVisibleColumns = {
  discount_percent: true,
  qr_code: true,
  image: true,
  purchase: true,
  income: true,
  discount: true,
  volume: true,
  weight: true,
  dimensions: true,
};

const userPrintVisibleColumns = {
  discount_percent: true,
  qr_code: false,
  image: true,
  purchase: false,
  income: false,
  discount: false,
  volume: false,
  weight: false,
  dimensions: false,
};

const adminPrintVisibleColumns = {
  discount_percent: true,
  qr_code: true,
  image: true,
  purchase: true,
  income: true,
  discount: true,
  volume: true,
  weight: true,
  dimensions: true,
};

const MainPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const { showNotification } = useNotification();
  const [dateMargin, setDateMargin] = useState("");

  const { authUser, authGroup } = useContext(AuthContext);
  const draftCreatedRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const isSavingRef = useRef(false);
  const latestValuesRef = useRef(null);

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState(null);

  const [fakturaType, setFakturaType] = useState(() => {
    return localStorage.getItem("wozwrat_or_prihod_purchase") || "";
  });
  

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // const [notification, setNotification] = useState({ message: "", type: "" });
  // const timeoutRef = useRef(null);
  // const showNotification = (message, type) => {
  //   // setNotification({ message, type });
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }
  //   setNotification({ message, type });
  //   // создаём новый
  //   timeoutRef.current = setTimeout(() => {
  //     setNotification({ message: "", type: "" });
  //     timeoutRef.current = null; // очищаем ref после срабатывания
  //   }, 3000);
  //   // setTimeout(() => setNotification({ message: "", type: "" }), 30000);
  // };
  // useEffect(() => {
  //   return () => {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //   };
  // }, []);

  // В самом начале компонента MainPage:
  // const [notification, setNotification] = useState(null);
  // const timeoutRef = useRef(null);
  // // Простая функция showNotification (без сложной логики):
  // const showNotification = (message, type) => {
  //   // Очищаем предыдущий таймаут если есть
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }
  //   // Просто устанавливаем новое уведомление - AnimatePresence сам обработает плавную смену
  //   setNotification({
  //     message,
  //     type,
  //     id: Date.now(), // Уникальный ID для каждого уведомления
  //   });
  // };

  const [saldo, setSaldo] = useState(null);
  const [saldo2, setSaldo2] = useState(null);
  const [letPrintSaldo, setLetPrintSaldo] = useState(() => {
    const show = localStorage.getItem("letPrintSaldo");
    return show === "true"; // вернёт true только если строка "true"
  });
  useEffect(() => {
    localStorage.setItem("letPrintSaldo", letPrintSaldo);
  }, [letPrintSaldo]);

  const [letPrintInfo, setLetPrintInfo] = useState(() => {
    const show = localStorage.getItem("letPrintInfo");
    return show === "true"; // вернёт true только если строка "true"
  });
  useEffect(() => {
    localStorage.setItem("letPrintInfo", letPrintInfo);
  }, [letPrintInfo]);

  useEffect(() => {
    const get_margin_date = async () => {
      try {
        const res = await myAxios.get("/get_margin_date");
        setDateMargin(res.data.date_focus);
      } catch (error) {
        console.log("cant get margin date", error);
      }
    };
    get_margin_date();
  }, []);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("visibleColumnsPurchase");
    return saved ? JSON.parse(saved) : adminVisibleColumns;
  });

  const [printVisibleColumns, setPrintVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("printVisibleColumnsPurchase");
    return saved ? JSON.parse(saved) : adminPrintVisibleColumns;
  });

  useEffect(() => {
    localStorage.setItem("visibleColumnsPurchase", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem("printVisibleColumnsPurchase", JSON.stringify(printVisibleColumns));
  }, [printVisibleColumns]);

  const refs = {
    // ne swyazannye s values.products table
    awtoRef: useRef(null),
    awtoX_Ref: useRef(null),
    awtoListRef: useRef([]),
    partnerRef: useRef(null),
    partnerX_Ref: useRef(null),
    partnerListRef: useRef([]),
    productRef: useRef(null),
    productListRef: useRef([]),

    // values.products table refs
    quantityRefs: useRef({}),
    priceRefs: useRef({}),
  };

  const { dateFrom, setDateFrom, dateTo, setDateTo, dateProwodok, setDateProwodok } = useContext(DateContext);

  //   useEffect(() => {
  // const handleKeyDown = (e) => {
  //   if (e.ctrlKey && e.key === "Enter") {
  //     e.preventDefault();
  //     refs.
  //   }

  // }
  //   }, [])

  // const defaultValues = useMemo(() => {
  //   return getDefaultValues(id);
  // }, [id]);

  useEffect(() => {
    document.title = `${t("faktura")} ${t(fakturaType)} ${id ? `№${id}` : ""}`; // название вкладки
  }, [fakturaType]);

  useEffect(() => {
    let mounted = true;

    const loadValues = async () => {
      const values = await getDefaultValues(id, dateProwodok, setDateProwodok);
      if (mounted) {
        setInitialValues(values);
      }
    };

    loadValues();

    return () => {
      mounted = false;
    };
  }, [id]); // dateProwodok

  // const defaultValues = getDefaultValues(id);
  const validationSchema = getInvoiceValidationSchema(t);

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  if (!initialValues) {
    return <div>{t("loading")}...</div>; // пока грузится
  }

  // const handleOpenInvoice = (id) => {
  //   if (id) {
  //     navigate(`/purchase-invoices/update/${id}`);
  //   } else {
  //     navigate(ROUTES.PURCHASE_INVOICE_CREATE);
  //   }
  // };

  const handleOpenInvoice = (newId) => {
    if (!newId) {
      navigate(ROUTES.PURCHASE_INVOICE_CREATE);
      return;
    }

    if (String(id) === String(newId)) return;

    navigate(`/purchase-invoices/update/${newId}`);
  };

  const getSaldo = async (date, partnerId) => {
    console.log("date", date);
    console.log("partnerId", partnerId);

    try {
      const saldo = await myAxios.get("get_saldo_for_partner_for_selected_date", {
        params: { date: date, partnerId: partnerId },
      });

      setSaldo(saldo.data.saldo);
      console.log("saldo", saldo.data.saldo);
    } catch (error) {
      console.log("error get_saldo_for_partner_for_selected_date from fetchPartner", error);
    }
  };

  const getSaldo2 = async (partnerId, dateFrom, dateTo, invoice_date = false) => {
    if (!invoice_date) return;

    try {
      const saldo = await myAxios.get("get_saldo_for_partner_for_selected_date2", {
        params: {
          partnerId: partnerId,
          dateFrom: dateFrom,
          dateTo: dateTo,
          invoice_date,
        },
      });

      setSaldo2(saldo.data.saldo);
    } catch (error) {
      console.log("error get_saldo_for_partner_for_selected_date2 from fetchPartner", error);
    }
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        // validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setFieldValue }) => {
          // console.log('here');

          const date_margin = localStorage.getItem("date_margin"); // "2025-10-04"
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0]; // "2025-10-04"
          // Способ 1: через строки (т.к. YYYY-MM-DD сравниваются корректно)
          // if (todayStr < date_margin || date_margin !== dateMargin) {

          //   showNotification(t("permission denied"), "error");
          //   return;
          // }

          // console.log("valuesUUUUUUUUU", values);
          // values.products.forEach((p, idx) => {
          //   console.log("name", p.name);
          //   console.log("discount_percent", p.discount_percent);
          //   console.log("selected_price", p.selected_price);
          //   console.log("price_after_discount", p.price_after_discount);
          //   console.log("discount_auto", p.discount_auto);
          //   console.log("discount_amount", p.discount_amount);
          //   console.log("is_custom_price", p.is_custom_price);
          //   console.log("wholesale_price", p.wholesale_price);
          //   console.log("retail_price", p.retail_price);
          //   console.log("quantity_discounts", p.quantity_discounts);
          //   console.log("selected_quantity", p.selected_quantity);
          //   console.log("=============================================================");
          //   console.log("=============================================================");
            


            
          // })
          // return
          

          try {
            const response = await myAxios.post("/save-invoice/", values, {
              headers: {
                "X-CSRFToken": getCookie("csrftoken"), // если нужно CSRF
              },
            });

            if (response.data.already_entry) {
              setFieldValue("already_entry", true);
            }
            if (response.data?.is_updated) {
              showNotification(`${t("faktura")} № ${response.data.id} ${t("saved")}`, "success");
              // setTimeout(() => {
              //   window.location.reload();
              // }, 1000);
            } else {
              showNotification(t(response.data.message), "success");
              // handleOpenInvoice(response.data.id);
            }

            handleOpenInvoice(response.data.id);
            if (values.partner?.id) {
              console.log("dede");

              // const getSaldo2 = async (partnerId, dateFrom, dateTo, invoice_date = false)
              // getSaldo(values.invoice_date2, values.partner?.id);
              // console.log("values.invoice_date2", values.invoice_date);
              // console.log("values.partner?.id", values.partner?.id);

              getSaldo2(values.partner?.id, dateFrom, dateTo, values.invoice_date2);
            }
            // setSaldo(null)
            // resetForm();
          } catch (error) {
            if (error.response) {
              console.error("Ошибка при отправке", error.response.status, error.response.data);

              if (error.response.data.not_fined_product_name) {
                showNotification(`${t(error.response.data.message)} "${error.response.data.not_fined_product_name}"`, "error");
              } else if (error.response.data.not_fined_unit_name) {
                showNotification(`${t(error.response.data.message)} "${error.response.data.not_fined_unit_name}"`, "error");
              } else if (error.response.data.reason_for_the_error) {
                showNotification(`${t(error.response.data.message)} "${error.response.data.reason_for_the_error}"`, "error");
              } else {
                showNotification(`${t(error.response.data.message)}`, "error");
              }
            } else {
              console.error("Ошибка сети", error.message);
            }
          } finally {
            // window.location.reload();
            // navigate(0);
          }
        }}
      >
        {({ values, handleChange, setFieldValue }) => {
          useEffect(() => {
            setFieldValue("invoice_date", dateProwodok);
          }, [dateProwodok]);

          // #################################################################################
          // useEffect(() => {
          //   const createDraftIfFirstProduct = async () => {
          //     if (!id && !draftCreatedRef.current && values.products?.length > 0) {
          //       draftCreatedRef.current = true;

          //       console.log("создаём черновик");

          //       await document.querySelector("form").requestSubmit();
          //     }
          //   };

          //   createDraftIfFirstProduct();
          // }, [values.products]);

          // useEffect(() => {
          //   latestValuesRef.current = values;
          // }, [values]);

          // useEffect(() => {
          //   if (!id) return;
          //   if (values.is_entry) return;
          //   if (!values.products?.length) return;

          //   if (saveTimeoutRef.current) {
          //     clearTimeout(saveTimeoutRef.current);
          //   }

          //   saveTimeoutRef.current = setTimeout(async () => {
          //     if (isSavingRef.current) return;

          //     try {
          //       isSavingRef.current = true;
          //       setIsAutoSaving(true);
          //       setAutoSaveError(null);

          //       await myAxios.post("save-invoice/", latestValuesRef.current);

          //       setShowSavedMessage(true);

          //       setTimeout(() => {
          //         setShowSavedMessage(false);
          //       }, 2000);
          //     } catch (err) {
          //       console.error("Ошибка автосохранения", err);

          //       if (err.response?.data) {
          //         // если backend вернул текст ошибки
          //         setAutoSaveError(err.response.data.detail || t("invoice not saved"));
          //       } else {
          //         setAutoSaveError("Ошибка соединения с сервером");
          //       }
          //     } finally {
          //       isSavingRef.current = false;
          //       setIsAutoSaving(false);
          //     }
          //   }, 1500);

          //   return () => {
          //     if (saveTimeoutRef.current) {
          //       clearTimeout(saveTimeoutRef.current);
          //     }
          //   };
          // }, [values]);

          // #################################################################################


          const fakturaBgDynamic =
            values.wozwrat_or_prihod === "wozwrat" ? "bg-red-200 dark:bg-red-900" : values.wozwrat_or_prihod === "prihod" ? "bg-green-200 dark:bg-green-900" : "bg-white dark:bg-gray-900";


          
          return (
            <Form>
              {/* Твой form fields здесь */}
              <InvoiceHead
                refs={refs}
                fakturaBgDynamic={fakturaBgDynamic}
                printVisibleColumns={printVisibleColumns}
                setPrintVisibleColumns={setPrintVisibleColumns}
                userPrintVisibleColumns={userPrintVisibleColumns}
                adminPrintVisibleColumns={adminPrintVisibleColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                adminVisibleColumns={adminVisibleColumns}
                userVisibleColumns={userVisibleColumns}
                setFakturaType={setFakturaType}
                id={id}
                showNotification={showNotification}
                authGroup={authGroup}
                saldo2={saldo2}
                letPrintSaldo={letPrintSaldo}
                setLetPrintSaldo={setLetPrintSaldo}
                setSaldo2={setSaldo2}
                getSaldo2={getSaldo2}
              />

              <div className="fixed top-25 left-1/2 -translate-x-1/2 z-50">
                <AnimatePresence mode="wait">
                  {showSavedMessage && !isAutoSaving && !autoSaveError && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 px-6 py-3 
                   rounded-2xl shadow-xl backdrop-blur-md
                   bg-emerald-500/90 dark:bg-emerald-600/90
                   text-white"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">{t("invoice saved")}</span>
                    </motion.div>
                  )}

                  {autoSaveError && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 px-6 py-3 
                   rounded-2xl shadow-xl backdrop-blur-md
                   bg-red-500/90 dark:bg-red-600/90
                   text-white max-w-md"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium break-words">{autoSaveError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <fieldset disabled={values.already_entry || authGroup !== "admin" || values.canceled_at}>
                <div className="grid grid-cols-1 md:grid-cols-10 gap-4 print:block">
                  {/* Левая колонка */}
                  <div className="col-span-3 print:hidden">
                    <div
                      className="rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-md p-3 flex flex-col gap-4
                    print:border-none print:shadow-none print:bg-transparent bg-gray-400"
                    >
                      <FetchWarehouse />
                      <FetchAwto refs={refs} />
                      <FetchPartner
                        refs={refs}
                        setSaldo={setSaldo}
                        // dateProwodok={dateProwodok}
                        saldo={saldo}
                        getSaldo={getSaldo}
                        getSaldo2={getSaldo2}
                        setSaldo2={setSaldo2}
                        // dateFrom={dateFrom}
                        // dateTo={dateTo}
                      />
                      <Comment />
                    </div>
                    {/* <Saldo saldo={saldo} letPrintSaldo={letPrintSaldo} setLetPrintSaldo={setLetPrintSaldo} /> */}
                    <Saldo2 saldo2={saldo2} letPrintSaldo={letPrintSaldo} setLetPrintSaldo={setLetPrintSaldo} setSaldo2={setSaldo2} className="print:hidden" />

                    <div className="flex justify-end">
                      {values.products && values.products.length > 0 && <SubmitButton dateProwodok={dateProwodok} fakturaType={fakturaType} fakturaBgDynamic={fakturaBgDynamic} />}
                    </div>
                  </div>

                  {/* for print */}
                  <div className="hidden print:block">
                    {values.warehouse?.id && (
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t("warehouse")}:</span>
                        <span className="text-gray-800 dark:text-gray-100 font-semibold print:!text-black">{values.warehouse?.name}</span>
                      </div>
                    )}
                    {values.partner?.id && (
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t("partner")}:</span>
                        <span className="text-gray-800 dark:text-gray-100 font-semibold print:!text-black">{values.partner?.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Правая колонка */}
                  <div className="col-span-7">
                    <div
                      className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-400 dark:bg-gray-900 shadow-md p-3 flex flex-col gap-4
                    print:border-none print:shadow-none print:bg-transparent print:m-0 print:p-0"
                    >
                      <div className="mt-2 print:hidden">
                        <FetchProduct refs={refs} invoice_id={id} />
                      </div>

                      <div>{values.products && values.products.length > 0 && <PTable printVisibleColumns={printVisibleColumns} visibleColumns={visibleColumns} id={id} refs={refs} />}</div>
                      <div className="w-full sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[30%] 2xl:w-[25%]">
                        {id && (
                          <div className="print:hidden mt-5 ml-0 sm:ml-2 md:ml-3 lg:ml-4 xl:ml-5 2xl:ml-6">
                            <InfoAboutInvoice values={values} letPrintInfo={letPrintInfo} setLetPrintInfo={setLetPrintInfo} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden print:block">
                  {values.awto?.id && (
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{t("awto")}:</span>
                      <span className="text-gray-800 dark:text-gray-100 font-semibold print:!text-black">{values.awto?.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-5 items-end print:mt-3">
                  <div className="hidden print:block">
                    {/* <Saldo saldo={saldo} letPrintSaldo={letPrintSaldo} setLetPrintSaldo={setLetPrintSaldo} /> */}
                    <Saldo2 saldo2={saldo2} letPrintSaldo={letPrintSaldo} setLetPrintSaldo={setLetPrintSaldo} setSaldo2={setSaldo2} />
                  </div>

                  {/* for print */}
                  {id && (
                    <div className="hidden print:block mt-5 ml-5">
                      <InfoAboutInvoice values={values} letPrintInfo={letPrintInfo} setLetPrintInfo={setLetPrintInfo} />
                    </div>
                  )}
                </div>
                <div className="hidden print:flex w-full items-center justify-center print:py-6">
                  <div className="text-center">
                    <p className="print:text-2xl font-serif font-semibold tracking-wide leading-relaxed">Işiňiz haýyrly we bereketli bolsun!</p>
                  
                    {/* <div className="mt-4 h-1 w-24 mx-auto bg-black"></div> */}
                  </div>
                </div>

                {/* <div className="flex justify-end">{values.products.length > 0 && <SubmitButton dateProwodok={dateProwodok} />}</div> */}
              </fieldset>
            </Form>
          );
        }}
      </Formik>
      {/* <Notification2 message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} /> */}
      {/* {notification && (
        <Notification2
          message={t(notification.message)}
          type={notification.type}
          onClose={() => {
            setNotification(null);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }}
        />
      )} */}
    </div>
  );
};

export default MainPage;
