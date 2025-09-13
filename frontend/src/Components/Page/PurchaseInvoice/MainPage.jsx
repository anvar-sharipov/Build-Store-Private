import { useTranslation } from "react-i18next";
import InvoiceHead from "./Utils/InvoiceHead";
import { Formik, Form } from "formik";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useContext } from "react";
import invoiceClasses from "./Utils/classes";
import * as Yup from "yup";
import getDefaultValues from "./Utils/defaultValues";
import getInvoiceValidationSchema from "./Utils/validationSchema";
import FetchWarehouse from "./fetchs/FetchWarehouse";
import FetchAwto from "./fetchs/FetchAwto";
import FetchPartner from "./fetchs/FetchPartner";
import FetchProduct from "./fetchs/FetchProduct";
import { DateContext } from "../../UI/DateProvider";



const MainPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  

  const autoInputRef = useRef(null);
  const partnerInputRef = useRef(null);
  const productInputRef = useRef(null);


  const { dateFrom, setDateFrom, dateTo, setDateTo, dateProwodok, setDateProwodok } = useContext(DateContext);

  const defaultValues = useMemo(() => {
    return getDefaultValues(id, dateProwodok);
  }, [id, dateProwodok]);

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

          
          return (
            <Form className="p-2 m-2 ">
              {/* Твой form fields здесь */}
              <InvoiceHead />
              <div className="mt-3 print:p-0 print:m-0 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-2xl mx-auto border border-gray-300 dark:border-gray-600 p-2 print:border-none">
                <div>
                  <FetchWarehouse />
                  <FetchAwto autoInputRef={autoInputRef} />
                  <FetchPartner partnerInputRef={partnerInputRef} />
                </div>
                <div className="mt-5">
                  <FetchProduct productInputRef={productInputRef} />
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
                {values.awto?.id && (
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t("awto")}:</span>
                    <span className="text-gray-800 dark:text-gray-100 font-semibold print:!text-black">{values.awto?.name}</span>
                  </div>
                )}
              </div>

              {/* Кнопка в конце формы */}
              <div className="flex justify-end mt-6">
                <button type="submit" className={invoiceClasses.purchaseInvoiceSubmitBtn}>
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
