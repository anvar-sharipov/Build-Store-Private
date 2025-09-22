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

  const defaultValues = useMemo(() => {
    return getDefaultValues(id);
  }, [id]);

  // const defaultValues = getDefaultValues(id);
  const validationSchema = getInvoiceValidationSchema(t);

  return (
    <div>
      <Formik initialValues={defaultValues} enableReinitialize={true} onSubmit={(values) => console.log("OTPRAWLENO", values)} validationSchema={validationSchema}>
        {({ values, handleChange, setFieldValue }) => {
          useEffect(() => {
            setFieldValue("invoice_date", dateProwodok);
          }, [dateProwodok]);

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

                    <div>{values.products.length > 0 && <PTable printVisibleColumns={printVisibleColumns} visibleColumns={visibleColumns} id={id} refs={refs} />}</div>
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

              {/* saldo */}
              {saldo && (
                <div className={`p-4 bg-white dark:bg-gray-900 rounded-xl shadow text-gray-700 dark:text-gray-200 mt-5 mx-auto max-w-2xl ${letPrintSaldo ? "print:block" : "print:hidden"}`}>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center flex justify-center items-center gap-2 print:!text-black">
                    Карточка: {values.partner.name}
                    {letPrintSaldo ? (
                      <MdPrint
                        className="print:hidden"
                        onClick={() => {
                          setLetPrintSaldo((v) => !v);
                        }}
                      />
                    ) : (
                      <MdPrintDisabled
                        onClick={() => {
                          setLetPrintSaldo((v) => !v);
                        }}
                      />
                    )}{" "}
                  </h2>

                  <table className="min-w-full table-auto border-collapse print:table-fixed print:border print:border-black mt-4">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:bg-white print:!text-black">
                        <th colSpan={2} className="px-2 py-1 border border-black">
                          Показатель
                        </th>
                        <th className="px-2 py-1 border border-black">Дебет</th>
                        <th className="px-2 py-1 border border-black">Кредит</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                        <td colSpan={2} className="px-2 py-1 border font-semibold border-black">
                          Остаток на начало
                        </td>
                        <td className="px-2 py-1 border border-black font-semibold">{saldo.start[0]}</td>
                        <td className="px-2 py-1 border border-black font-semibold">{saldo.start[1]}</td>
                      </tr>
                      {saldo.today_entries.length > 0 ? (
                        saldo.today_entries.map((e, idx) => {
                          return (
                            <tr key={idx} className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                              <td className="px-2 py-1 border border-black">{e[0]}</td>
                              <td className="px-2 py-1 border border-black">{e[1]}</td>
                              <td className="px-2 py-1 border whitespace-pre-line border-black">{parseFloat(e[2]) !== 0 ? e[2] : "-"}</td>
                              <td className="px-2 py-1 border border-black">{parseFloat(e[3]) !== 0 ? e[3] : "-"}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                          <td className="px-2 py-1 border border-black">-</td>
                          <td className="px-2 py-1 border border-black">-</td>
                          <td className="px-2 py-1 border whitespace-pre-line border-black">-</td>
                          <td className="px-2 py-1 border border-black">-</td>
                        </tr>
                      )}
                      <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                        <td colSpan={2} className="px-2 py-1 border font-semibold border-black">
                          Итого оборот
                        </td>
                        <td className="px-2 py-1 border border-black font-semibold">{saldo.final[0]}</td>
                        <td className="px-2 py-1 border border-black font-semibold">{saldo.final[1]}</td>
                      </tr>
                      <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                        <td colSpan={2} className="px-2 py-1 border font-semibold border-black">
                          Остаток на конец
                        </td>
                        <td className="px-2 py-1 border font-semibold border-black">{parseFloat(saldo.saldo[0]) !== 0 ? saldo.saldo[0] : "-"}</td>
                        <td className="px-2 py-1 border font-semibold border-black">{parseFloat(saldo.saldo[1]) !== 0 ? saldo.saldo[1] : "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end">{values.products.length > 0 && <SubmitButton dateProwodok={dateProwodok} />}</div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default MainPage;
