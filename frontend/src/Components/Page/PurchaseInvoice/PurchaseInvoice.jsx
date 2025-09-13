import { useTranslation } from "react-i18next";
import Head from './Utils/Head'
import invoiceClasses from "./Utils/classes";
// import { useFormikContext } from "formik";

const PurchaseInvoice = () => {
    const { t } = useTranslation();
    // const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  return (
    <div>
        <Head />
    </div>
  )
}

export default PurchaseInvoice