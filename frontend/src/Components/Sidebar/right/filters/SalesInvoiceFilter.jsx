import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const SalesInvoiceFilter = ({ searchParams, setSearchParams, t }) => {
  console.log("searchParams", searchParams);

  const initialValues = {
    isEntry: searchParams.get("isEntry") || "",
  };

  const onSubmit = (values) => {
    // создаём копию текущих параметров
    const params = new URLSearchParams(searchParams);



    if (values.isEntry !== "") {
      params.set("isEntry", values.isEntry);
    } else {
      params.delete("isEntry");
    }

    // Не трогаем параметр 'search', он останется, если был
    setSearchParams(params);
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ values, setFieldValue, resetForm }) => (
        <Form className="text-gray-400 text-sm">
          <div className="border p-2 border-gray-600 rounded mt-4">
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-300">{t("prowedena?")}</span>
              <Field
                as="select"
                name="isEntry"
                className="border rounded px-2 py-1 bg-gray-800 border-gray-600"
              >
                <option value="">{t("all")}</option>
                <option value="true">{t("Prowedennye")}</option>
                <option value="false">{t("Ne_Prowedennye")}</option>
              </Field>
            </label>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {t("acceptFilter")}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                const params = new URLSearchParams(searchParams);
                params.delete("isEntry");
                // search оставить как есть, если нужно можно удалить params.delete("search");
                setSearchParams(params);
                // setSearchQuery("");
              }}
              className="flex-1 px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500 transition"
            >
              {t("cancelFilter")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SalesInvoiceFilter;
