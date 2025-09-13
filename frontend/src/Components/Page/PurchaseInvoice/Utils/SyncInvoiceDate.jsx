import { useFormikContext } from "formik";

const SyncInvoiceDate = ({ dateProwodok, id }) => {
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    if (!id) {
      setFieldValue("invoice_date", dateProwodok);
    }
  }, [dateProwodok, id, setFieldValue]);

  return null;
};
