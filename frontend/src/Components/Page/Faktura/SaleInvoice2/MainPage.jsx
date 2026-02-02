import { useEffect, useState, useRef, useMemo, useContext } from "react";
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
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../../UI/formatNumber";
import { MdPrint } from "react-icons/md";
import { MdPrintDisabled } from "react-icons/md";
import { tr } from "framer-motion/client";
import { DateContext } from "../../../UI/DateProvider";

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
  const [saldo, setSaldo] = useState(null);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [globalPartnerId, setGlobalPartnerId] = useState(null);
  const [globalDate, setGlobalDate] = useState(null);
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const { dateFrom, setDateFrom, dateTo, setDateTo, dateProwodok, setDateProwodok } = useContext(DateContext);

  const [letPrintSaldo, setLetPrintSaldo] = useState(() => {
    const show = localStorage.getItem("letPrintSaldo");
    return show === "true"; // вернёт true только если строка "true"
  });
  useEffect(() => {
    localStorage.setItem("letPrintSaldo", letPrintSaldo);
  }, [letPrintSaldo]);

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

  const getSaldo = async (date, partnerId) => {
    try {
      const saldo = await myAxios.get("get_saldo_for_partner_for_selected_date", {
        params: { date: date, partnerId: partnerId },
      });
      setSaldo(saldo.data.saldo);
    } catch (error) {
      console.log("error get_saldo_for_partner_for_selected_date", error);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchInvoice = async () => {
        try {
          const res = await myAxios.get(`sales-invoices/${id}/`);
          setDefaultValues(defaultInitialValues(fetchs, res.data, dateProwodok));
        
          getSaldo(res.data.invoice_date.split("T")[0], res.data.buyer.id);
        } catch (error) {
          console.log("oshobka pri zagrezke invoice", error);
        } finally {
        }
      };
      fetchInvoice();
    } else {
      setDefaultValues(defaultInitialValues(fetchs, false, dateProwodok));
     
      partnerInputRef.current?.focus();
    }
  }, [id, fetchs]);

  useEffect(() => {
 
    if (globalPartnerId && globalDate) {
      getSaldo(globalDate, globalPartnerId);
    } else {
      setSaldo(null);
    }
  }, [globalPartnerId, globalDate]);

  useEffect(() => {
    if (!loading) partnerInputRef.current?.focus();
  }, [loading, defaultValues]);

  const onSubmit = async (values) => {
    try {
      const dataToSend = { ...values };
      if (id) {
        const res = await myAxios.put(`sales-invoices/${id}/`, dataToSend);
        showNotification(t(res.data.detail), "success");
        if (values.withPosting) values.disabled = true;
      } else {
        const res = await myAxios.post("sales-invoices/", dataToSend);
        showNotification(t(res.data.detail), "success");
        navigate(`/sale-invoices/update/${res.data.invoice_id}`);
      }
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
         
            }, [values]);

            useEffect(() => {
              if (!id) {
                setFieldValue("invoice_date", dateProwodok);
              }
            }, [dateProwodok]);

            return (
              <Form>
                <Head getSaldo={getSaldo} setGlobalDate={setGlobalDate} id={id} />

                <SearchWarehouse
                  warehouseInputRef={warehouseInputRef}
                  awtoInputRef={awtoInputRef}
                  fetchs={fetchs}
                  printVisibleColumns={printVisibleColumns}
                  setPrintVisibleColumns={setPrintVisibleColumns}
                  userPrintVisibleColumns={userPrintVisibleColumns}
                  adminPrintVisibleColumns={adminPrintVisibleColumns}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={setVisibleColumns}
                  adminVisibleColumns={adminVisibleColumns}
                  userVisibleColumns={userVisibleColumns}
                />

                <SearchAwto awtoInputRef={awtoInputRef} warehouseInputRef={warehouseInputRef} partnerInputRef={partnerInputRef} fetchs={fetchs} />

                <SearchPartner
                  partnerInputRef={partnerInputRef}
                  productInputRef={productInputRef}
                  awtoInputRef={awtoInputRef}
                  fetchs={fetchs}
                  setGlobalPartnerId={setGlobalPartnerId}
                  setSaldo={setSaldo}
                  setGlobalDate={setGlobalDate}
                  getSaldo={getSaldo}
                />

                {!values.disabled &&
                  (values.warehouses && values.warehouses.id ? (
                    <SearchProduct partnerInputRef={partnerInputRef} productInputRef={productInputRef} showNotification={showNotification} productQuantityRefs={productQuantityRefs} />
                  ) : (
                    <div className="text-center text-gray-700 dark:text-gray-200 text-lg font-semibold mb-4">{t("forSearchProductShooseWarehouse")}</div>
                  ))}

                {values.products.length > 0 && (
                  <InvoiceTable
                    showNotification={showNotification}
                    productListRefs={productListRefs}
                    productQuantityRefs={productQuantityRefs}
                    productPriceRefs={productPriceRefs}
                    productInputRef={productInputRef}
                    visibleColumns={visibleColumns}
                    printVisibleColumns={printVisibleColumns}
                    id={id}
                  />
                )}

                {values.awto && Object.keys(values.awto).length > 0 && (
                  <div className="hidden print:block print:text-black print:mt-3">
                    {t("delivers")}: {values.awto?.name}
                  </div>
                )}

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

                <Button productInputRef={productInputRef} />
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
