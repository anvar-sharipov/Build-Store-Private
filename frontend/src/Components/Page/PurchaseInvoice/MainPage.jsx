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
import Comment from "./Utils/Comment";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes";

const userVisibleColumns = {
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

  const [fakturaType, setFakturaType] = useState(() => {
    return localStorage.getItem("wozwrat_or_prihod_purchase") || "";
  });

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const [saldo, setSaldo] = useState(null);
  const [letPrintSaldo, setLetPrintSaldo] = useState(() => {
    const show = localStorage.getItem("letPrintSaldo");
    return show === "true"; // вернёт true только если строка "true"
  });
  useEffect(() => {
    localStorage.setItem("letPrintSaldo", letPrintSaldo);
  }, [letPrintSaldo]);

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
  console.log("dateProwodok", dateProwodok);

  // const defaultValues = useMemo(() => {
  //   return getDefaultValues(id);
  // }, [id]);

  useEffect(() => {
    document.title = `${t("faktura")} ${t(fakturaType)}`; // название вкладки
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

  const handleOpenInvoice = (id) => {
    if (id) {
      navigate(`/purchase-invoices/update/${id}`);
    } else {
      navigate(ROUTES.PURCHASE_INVOICE_CREATE);
    }
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          console.log("Успешно отправлено values", values);
          console.log('FFFFFFFFF values');
          
          try {
            const response = await myAxios.post("/save-invoice/", values, {
              headers: {
                "X-CSRFToken": getCookie("csrftoken"), // если нужно CSRF
              },
            });

            console.log("Успешно отправлено", response.data);
            showNotification(t(response.data.message), "success");
            console.log("response.data.id", response.data);

            handleOpenInvoice(response.data.id);
            // setSaldo(null)
            // resetForm();
          } catch (error) {
            if (error.response) {
              console.error("Ошибка при отправке", error.response.status, error.response.data);
              // console.log();

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
          }
        }}
      >
        {({ values, handleChange, setFieldValue }) => {
          useEffect(() => {
            setFieldValue("invoice_date", dateProwodok);
          }, [dateProwodok]);

          console.log("values", values);

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
              />
              <div className="grid grid-cols-1 md:grid-cols-10 gap-4 print:block p-5">
                {/* Левая колонка */}
                <div className="col-span-3 print:hidden">
                  <div
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-md p-3 flex flex-col gap-4
                    print:border-none print:shadow-none print:bg-transparent bg-gray-400"
                  >
                    <FetchWarehouse />
                    <FetchAwto refs={refs} />
                    <FetchPartner refs={refs} setSaldo={setSaldo} dateProwodok={dateProwodok} saldo={saldo} />
                    <Comment />
                  </div>
                  <Saldo saldo={saldo} letPrintSaldo={letPrintSaldo} setLetPrintSaldo={setLetPrintSaldo} />
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
                      <FetchProduct refs={refs} />
                    </div>

                    <div>{values.products && values.products.length > 0 && <PTable printVisibleColumns={printVisibleColumns} visibleColumns={visibleColumns} id={id} refs={refs} />}</div>
                    {id && (
                      <div className="print:hidden mt-5">
                        <div className="text-gray-700 dark:text-gray-200">
                          Создано: <span className="font-medium">{values.created_at || "—"}</span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-200">
                          Обновлено: <span className="font-medium">{values.updated_at || "—"}</span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-200">
                          Создал как черновик: <span className="font-medium">{values.created_by || "—"}</span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-200">
                          Проводку сделал: <span className={values.entry_created_by ? "font-medium" : "text-red-500"}>{values.entry_created_by || "Пока не проводили"}</span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-200">
                          Проводка сделана: <span className={values.entry_created_at ? "font-medium" : "text-red-500"}>{values.entry_created_at || "Пока не проводили"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden print:block mt-4 ml-5">
                {values.awto?.id && (
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t("awto")}:</span>
                    <span className="text-gray-800 dark:text-gray-100 font-semibold print:!text-black">{values.awto?.name}</span>
                  </div>
                )}
              </div>

              <div className="hidden print:block">
                <Saldo saldo={saldo} letPrintSaldo={letPrintSaldo} setLetPrintSaldo={setLetPrintSaldo} />
              </div>
              {id && (
                <div className="hidden print:block mt-5">
                  <div className="text-gray-700 dark:text-gray-200">
                    Создано: <span className="font-medium">{values.created_at || "—"}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">
                    Обновлено: <span className="font-medium">{values.updated_at || "—"}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">
                    Создал как черновик: <span className="font-medium">{values.created_by || "—"}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">
                    Проводку сделал: <span className={values.entry_created_by ? "font-medium" : "text-red-500"}>{values.entry_created_by || "Пока не проводили"}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">
                    Проводка сделана: <span className={values.entry_created_at ? "font-medium" : "text-red-500"}>{values.entry_created_at || "Пока не проводили"}</span>
                  </div>
                </div>
              )}

              {/* <div className="flex justify-end">{values.products.length > 0 && <SubmitButton dateProwodok={dateProwodok} />}</div> */}
            </Form>
          );
        }}
      </Formik>
      <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
    </div>
  );
};

export default MainPage;
