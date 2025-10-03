import * as Yup from "yup";

const getInvoiceValidationSchema = (t) => {
  return Yup.object().shape({
    invoice_date: Yup.date()
      // .required(t("date_required"))
      // .max(new Date(), t("date_future_not_allowed")), // запрет будущей даты
  });
};

export default getInvoiceValidationSchema;