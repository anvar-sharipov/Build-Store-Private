import { useTranslation } from "react-i18next";
import Head from "./Utils/Head";
import invoiceClasses from "./Utils/classes";
// import { useFormikContext } from "formik";
import myAxios from "../../axios";
import { useEffect, useRef, useState } from "react";
import InvoiceList from "./InvoiceList";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes";

const PurchaseInvoice = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  const mainRefs = {
    searchInputRef: useRef(null),
    listRefs: useRef({}),
  };

  const fetchInvoices = async (filters = {}) => {
    try {
      // формируем query string
      const query = new URLSearchParams(filters).toString();
      const res = await myAxios.get(`get-invoices/?${query}`);
      console.log(res.data.invoices);
      setInvoices(res.data.invoices);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenInvoice = (id) => {
    if (id) {  
      navigate(`/purchase-invoices/update/${id}`);
    } else {
      navigate(ROUTES.PURCHASE_INVOICE_CREATE);
    }
  };

  // const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  return (
    <div>
      <Head mainRefs={mainRefs} handleOpenInvoice={handleOpenInvoice} />

      <InvoiceList invoices={invoices} mainRefs={mainRefs} handleOpenInvoice={handleOpenInvoice} />
    </div>
  );
};

export default PurchaseInvoice;
