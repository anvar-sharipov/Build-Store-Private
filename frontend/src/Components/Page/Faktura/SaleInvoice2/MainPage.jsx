import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLoadOptions } from "./Utils/useLoadOptions";
import MyLoading from "../../../UI/MyLoading";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, Head } from "./Utils/Utils";
import Fuse from "fuse.js";
import SearchAwto from "./Utils/SearchAwto";
import SearchWarehouse from "./Utils/SearchWarehouse";
import SearchPartner from "./Utils/SearchPartner";
import SearchProduct from "./Utils/SearchProduct";
import MySearchInput from "../../../UI/MySearchInput";
import myAxios from "../../../axios";
import { defaultInitialValues, defaultValidationSchema } from "./Utils/DefaultInitialValues";
import InvoiceTable from "./Utils/invoiceTable/InvoiceTable";
import Notification from "../../../Notification";
import PriceType from "./Utils/invoiceTable/PriceType";

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
  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (!loading) partnerInputRef.current?.focus();
  }, [loading]);

  const onSubmit = async (values) => {
  try {
    // Подготовь данные, если надо, например, без лишних полей
    const dataToSend = { ...values };

    const res = await myAxios.post("sales-invoices/", dataToSend);
    console.log("Ответ сервера:", res.data);
  } catch (error) {
    console.error("Ошибка при отправке:", error);
  }
};

  return (
    <div className="px-5 py-2 print:border-none print:px-2 print:m-0">
      {loading ? (
        <MyLoading />
      ) : (
        <Formik
          initialValues={defaultInitialValues(fetchs)}
          validationSchema={defaultValidationSchema(t)}
          onSubmit={onSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
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

                {values.warehouses.id ? (
                  <SearchProduct
                    partnerInputRef={partnerInputRef}
                    productInputRef={productInputRef}
                    showNotification={showNotification}
                    productQuantityRefs={productQuantityRefs}
                  />
                ) : (
                  <div className="text-center text-gray-700 dark:text-gray-200 text-lg font-semibold mb-4">
                    {t("forSearchProductShooseWarehouse")}
                  </div>
                )}

                <PriceType />

                {values.products.length > 0 && (
                  <InvoiceTable
                    showNotification={showNotification}
                    productListRefs={productListRefs}
                    productQuantityRefs={productQuantityRefs}
                    productPriceRefs={productPriceRefs}
                  />
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
