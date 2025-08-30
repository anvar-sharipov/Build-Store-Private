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
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../../UI/formatNumber";
import { MdPrint } from "react-icons/md";
import { MdPrintDisabled } from "react-icons/md";

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
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

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

  useEffect(() => {
    if (id) {
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
              // console.log("Formik values changed:", values);
            }, [values]);

            return (
              <Form>
                <Head />

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

                <SearchPartner partnerInputRef={partnerInputRef} productInputRef={productInputRef} awtoInputRef={awtoInputRef} fetchs={fetchs} />

                {!values.disabled &&
                  (values.warehouses && values.warehouses.id ? (
                    <SearchProduct partnerInputRef={partnerInputRef} productInputRef={productInputRef} showNotification={showNotification} productQuantityRefs={productQuantityRefs} />
                  ) : (
                    <div className="text-center text-gray-700 dark:text-gray-200 text-lg font-semibold mb-4">{t("forSearchProductShooseWarehouse")}</div>
                  ))}

                {/* <div className="relative print:hidden">
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
                </div> */}

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
                    id={id}
                  />
                )}

                {values.awto && Object.keys(values.awto).length > 0 && (
                  <div className="hidden print:block print:text-black print:mt-3">
                    {t("delivers")}: {values.awto?.name}
                  </div>
                )}

                {/* {values.partner?.id > 0 && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-2 text-gray-700">Финансовая информация</h2>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Сальдо на начало дня:</span>
                        <span className="font-medium text-gray-800">{values.partner.balance_on_date} сум</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Оборот за сегодня:</span>
                        <span className="font-medium text-gray-800">{values.partner.today_sales} сум</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Конечное сальдо:</span>
                        <span className="font-semibold text-blue-700">{values.partner.final_balance} сум</span>
                      </div>
                    </div>
                  </div>
                )} */}
                {/* dlya pokaza i debet i kredet toje */}

                {values.partner?.id > 0 && (
                  <div className={`p-4 bg-white dark:bg-gray-900 rounded-xl shadow text-gray-700 dark:text-gray-200 mt-5 mx-auto max-w-2xl ${letPrintSaldo ? "print:block" : "print:hidden"}`}>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center flex justify-center items-center gap-2">
                      Финансовые показатели{" "}
                      {letPrintSaldo ? (
                        <MdPrint
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
                          <th className="px-2 py-1 border">Показатель</th>
                          <th className="px-2 py-1 border">Дт</th>
                          <th className="px-2 py-1 border">Кт</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                          <td className="px-2 py-1 border font-medium">На начало дня</td>
                          <td className="px-2 py-1 border">{values.partner.balance_on_date[0]}</td>
                          <td className="px-2 py-1 border">{values.partner.balance_on_date[1]}</td>
                        </tr>
                        <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                          <td className="px-2 py-1 border font-medium">Обороты</td>
                          <td className="px-2 py-1 border">{values.partner.today_sales[0]}</td>
                          <td className="px-2 py-1 border">{values.partner.today_sales[1]}</td>
                        </tr>
                        <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                          <td className="px-2 py-1 border font-medium">На конец дня</td>
                          <td className="px-2 py-1 border">{values.partner.balance_on_date[0] + values.partner.today_sales[0]}</td>
                          <td className="px-2 py-1 border">{values.partner.balance_on_date[1] + values.partner.today_sales[1]}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-2 py-1 border text-end font-semibold">
                            {/* Баланс: {values.partner.balance_on_date[0] + values.partner.today_sales[0] - (values.partner.balance_on_date[1] + values.partner.today_sales[1])} */}
                            Баланс: {formatNumber(values.partner.balance)}
                          </td>
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
