import myAxios from "../../axios";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field } from "formik";
import { DateContext } from "../../UI/DateProvider";
import { useContext, useEffect, useState } from "react";

const Trip = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    document.title = t("trips");
  }, [t]);

  // useEffect(() => {
  //   const getInvoices = async () => {
  //     try {
  //       // Проверяем что даты есть
  //       if (!dateFrom || !dateTo) return;

  //       const res = await myAxios.get(`get_invoices_for_trip/`, {
  //         params: {
  //           dateFrom: dateFrom,
  //           dateTo: dateTo,
  //         },
  //       });
  //       console.log("res.", res.data);

  //       setInvoices(res.data); // сохраняем полученные накладные
  //     } catch (error) {
  //       console.error("Ошибка при получении накладных:", error);
  //     }
  //   };

  //   getInvoices();
  // }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!query) return;
    const getPartners = async () => {
      try {
        const res = await myAxios.get("get_partner_list/", {
          params: {
            query,
          },
        });
        console.log("res", res);
        console.log("query", query);
        
      } catch (err) {
        console.log("cant get_partner_list = ", err);
      } finally {
      }
    };
    getPartners();
  }, [query]);

  return (
    <div>
      <Formik
        initialValues={{
          driver: "",
          comment: "",
        }}
        onSubmit={(values) => {
          console.log("values", values);
        }}
      >
        <Form>
          <label htmlFor="driver">Партнёр</label>
          <input type="text" id="driver" onChange={(e) => setQuery(e.target.value)} />
          {/* <Field name="partner" placeholder="Введите партнёра" /> */}

          <Field as="textarea" name="comment" placeholder="Комментарий" />

          <button type="submit">Отправить</button>
        </Form>
      </Formik>
    </div>
  );
};

export default Trip;
