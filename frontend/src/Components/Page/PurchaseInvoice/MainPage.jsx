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
import TotalsCalculator from "./table/TotalsCalculator";

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
  // const quantityRefs = useRef({});

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

  // const [fakturaBg, setFakturaBg] = useState(() => {
  //   const type = localStorage.getItem("wozwrat_or_prihod_purchase");
  //   if (type === "wozwrat") return "bg-red-300";
  //   if (type === "prihod") return "bg-green-300";
  //   return "bg-white";
  // });

  // // Если значение типа фактуры может меняться внутри формы:
  // useEffect(() => {
  //   if (!values) return;
  //   if (values.wozwrat_or_prihod === "wozwrat") setFakturaBg("bg-red-300");
  //   else if (values.wozwrat_or_prihod === "prihod") setFakturaBg("bg-green-300");
  //   else setFakturaBg("bg-white");
  // }, [values?.wozwrat_or_prihod]);

  const defaultValues = useMemo(() => {
    return getDefaultValues(id);
  }, [id]);

  // const defaultValues = getDefaultValues(id);
  const validationSchema = getInvoiceValidationSchema(t);


  return (
    <div>
      <Formik initialValues={defaultValues} enableReinitialize={true} onSubmit={(values) => console.log("OTPRAWLENO", values)} validationSchema={validationSchema}>
        
        {({ values, handleChange, setFieldValue }) => {
          // useEffect(() => {
          //   if (!id) {
          //     setFieldValue("invoice_date", dateProwodok);
          //   }
          // }, [dateProwodok]);
          console.log("values", values);
          useEffect(() => {
            setFieldValue("invoice_date", dateProwodok);
          }, [dateProwodok]);

          const fakturaBgDynamic = values.wozwrat_or_prihod === "wozwrat" ? "bg-red-200" : values.wozwrat_or_prihod === "prihod" ? "bg-green-200" : "bg-white";

          return (
            <Form className={`p-2 m-2 ${fakturaBgDynamic} h-screen`}>
              {/* Твой form fields здесь */}
              <InvoiceHead
                refs={refs}
                printVisibleColumns={printVisibleColumns}
                setPrintVisibleColumns={setPrintVisibleColumns}
                userPrintVisibleColumns={userPrintVisibleColumns}
                adminPrintVisibleColumns={adminPrintVisibleColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                adminVisibleColumns={adminVisibleColumns}
                userVisibleColumns={userVisibleColumns}
              />
              <div className="grid grid-cols-1 md:grid-cols-10 gap-4 print:block">
                {/* Левая колонка */}
                <div className="col-span-3 print:hidden">
                  <div
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-md p-3 flex flex-col gap-4
                    print:border-none print:shadow-none print:bg-transparent bg-gray-400"
                  >
                    <FetchWarehouse />
                    <FetchAwto refs={refs} />
                    <FetchPartner refs={refs} />
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

                    <TotalsCalculator />

                    <div>{values.products.length > 0 && <PTable printVisibleColumns={printVisibleColumns} visibleColumns={visibleColumns} id={id} refs={refs} />}</div>
                  </div>
                </div>
              </div>

              {/* <div className="mt-3 print:p-0 print:m-0 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-2xl mx-auto border border-gray-300 dark:border-gray-600 p-2 print:border-none"></div> */}

              <div className="hidden print:block mt-4">
                {values.awto?.id && (
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t("awto")}:</span>
                    <span className="text-gray-800 dark:text-gray-100 font-semibold print:!text-black">{values.awto?.name}</span>
                  </div>
                )}
              </div>

              {/* Кнопка в конце формы */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={!values.send || !values.products.length > 0}
                  className={`
                  px-4 py-2 rounded-xl font-semibold transition-colors duration-200
                  ${
                    values.send && values.products.length > 0
                      ? "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  }
                  print:hidden`}
                >
                  💾 {t("save")}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default MainPage;
