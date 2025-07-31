import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLoadOptions } from "./Utils/useLoadOptions";
import MyLoading from "../../../UI/MyLoading";
import { Formik, Form } from "formik";
import { Button, Head } from "./Utils/Utils";
import SearchAwto from "./Utils/SearchAwto";
import SearchWarehouse from "./Utils/SearchWarehouse";
import SearchPartner from "./Utils/SearchPartner";
import SearchProduct from "./Utils/SearchProduct";
import myAxios from "../../../axios";
import { defaultInitialValues, defaultValidationSchema } from "./Utils/DefaultInitialValues";
import InvoiceTable from "./Utils/invoiceTable/InvoiceTable";
import Notification from "../../../Notification";
import PriceType from "./Utils/invoiceTable/PriceType";
import { useParams } from "react-router-dom";
import VisibleHideInputs from "./Utils/VisibleHideInputs";
import PrintVisibleHideInputs from "./Utils/PrintVisibleHideInputs";
import { Settings } from "lucide-react";

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
  const { fetchs, loading } = useLoadOptions();
  const warehouseInputRef = useRef(null);
  const awtoInputRef = useRef(null);
  const partnerInputRef = useRef(null);
  const productInputRef = useRef(null);
  const productListRefs = useRef([]);
  const productQuantityRefs = useRef([]);
  const productPriceRefs = useRef([]);
  const { t } = useTranslation();
  const { id } = useParams();
  const [defaultValues, setDefaultValues] = useState(null);
  const [openParametrs, setOpenParametrs] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // localStorage.removeItem("visibleColumns");
  // localStorage.removeItem("printVisibleColumns");

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("visibleColumns");
    return saved ? JSON.parse(saved) : adminVisibleColumns;
  });

  const [printVisibleColumns, setPrintVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("printVisibleColumns");
    return saved ? JSON.parse(saved) : adminPrintVisibleColumns;
  });

  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem("printVisibleColumns", JSON.stringify(printVisibleColumns));
  }, [printVisibleColumns]);

  useEffect(() => {
    if (id) {
      // console.log("eto update ==");
      const fetchInvoice = async () => {
        try {
          const res = await myAxios.get(`sales-invoices/${id}/`);
          setDefaultValues(defaultInitialValues(fetchs, res.data));
        } catch (error) {
          console.log("oshobka pri zagrezke invoice", error);
        } finally {
        }
      };
      fetchInvoice();
    } else {
      setDefaultValues(defaultInitialValues(fetchs, false));
      partnerInputRef.current?.focus();
    }
  }, [id, fetchs]);

  useEffect(() => {
    if (!loading) partnerInputRef.current?.focus();
  }, [loading, defaultValues]);

  const onSubmit = async (values) => {
    try {
      const dataToSend = { ...values };
      if (id) {
        const res = await myAxios.put(`sales-invoices/${id}/`, dataToSend);
        showNotification(t(res.data.detail), "success");
      } else {
        const res = await myAxios.post("sales-invoices/", dataToSend);
        showNotification(t(res.data.detail), "success");
      }

      // console.log("Ответ сервера:", res.data);
    } catch (error) {
      showNotification(t(error.response.data.detail), "error");
      console.error("Ошибка при отправке:", error.response.data.detail);
    }
  };

  return (
    <div className="px-5 py-2 print:border-none print:px-2 print:m-0">
      {loading || defaultValues === null ? (
        <MyLoading />
      ) : (
        <Formik key={JSON.stringify(defaultValues)} initialValues={defaultValues} validationSchema={defaultValidationSchema(t)} onSubmit={onSubmit} validateOnChange={true} validateOnBlur={true}>
          {({ values, setFieldValue, errors, touched, handleBlur }) => {
            useEffect(() => {
              // console.log("Formik values changed:", values);
            }, [values]);

            return (
              <Form>
                <Head />

                <SearchWarehouse warehouseInputRef={warehouseInputRef} awtoInputRef={awtoInputRef} fetchs={fetchs} />

                <SearchAwto awtoInputRef={awtoInputRef} warehouseInputRef={warehouseInputRef} partnerInputRef={partnerInputRef} fetchs={fetchs} />

                <SearchPartner partnerInputRef={partnerInputRef} productInputRef={productInputRef} awtoInputRef={awtoInputRef} fetchs={fetchs} />

                {values.warehouses && values.warehouses.id ? (
                  <SearchProduct partnerInputRef={partnerInputRef} productInputRef={productInputRef} showNotification={showNotification} productQuantityRefs={productQuantityRefs} />
                ) : (
                  <div className="text-center text-gray-700 dark:text-gray-200 text-lg font-semibold mb-4">{t("forSearchProductShooseWarehouse")}</div>
                )}

                <div className="relative print:hidden">
                  <button
                    onClick={() => setOpenParametrs((prev) => !prev)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    title="Настройки отображения"
                    type="button"
                  >
                    <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                  </button>

                  {openParametrs && (
                    <div className="absolute z-50 mt-2 p-4 bg-white dark:bg-gray-900 border rounded-lg shadow-lg space-y-4">
                      <PriceType />
                      <div className="flex justify-between">
                        <VisibleHideInputs visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} adminVisibleColumns={adminVisibleColumns} userVisibleColumns={userVisibleColumns} />
                        <PrintVisibleHideInputs
                          printVisibleColumns={printVisibleColumns}
                          setPrintVisibleColumns={setPrintVisibleColumns}
                          userPrintVisibleColumns={userPrintVisibleColumns}
                          adminPrintVisibleColumns={adminPrintVisibleColumns}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* // adminVisibleColumns userVisibleColumns  userPrintVisibleColumns adminPrintVisibleColumns */}
                {values.products.length > 0 && (
                  <InvoiceTable
                    showNotification={showNotification}
                    productListRefs={productListRefs}
                    productQuantityRefs={productQuantityRefs}
                    productPriceRefs={productPriceRefs}
                    productInputRef={productInputRef}
                    visibleColumns={visibleColumns}
                    printVisibleColumns={printVisibleColumns}
                  />
                )}
                {values.awto && Object.keys(values.awto).length > 0 && (
                  <div className="hidden print:block mt-2">
                    {t("delivers")}: {values.awto?.name}
                  </div>
                )}

                <Button />
              </Form>
            );
          }}
        </Formik>
      )}
      <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
    </div>
  );
};

export default MainPage;
