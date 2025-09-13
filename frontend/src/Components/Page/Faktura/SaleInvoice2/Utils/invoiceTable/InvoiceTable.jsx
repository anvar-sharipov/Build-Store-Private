import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import THead from "./THead";
import refreshTable from "./refreshTable";
import TFoot from "./TFoot";
import TDProducts from "./TDProducts";
import TDGifts from "./TDGifts";
import myAxios from "../../../../../axios";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../../../routes";

const InvoiceTable = ({ showNotification, productListRefs, productQuantityRefs, productPriceRefs, productInputRef, visibleColumns, printVisibleColumns, id }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, validateField, setFieldTouched, errors } = useFormikContext();
  const navigate = useNavigate();
  // console.log('val', values);

  const handleDeleteProduct = (id) => {
    const newProducts = values.products.filter((p) => p.id !== id);
    setFieldValue("products", newProducts);
    refreshTable({ ...values, products: newProducts }, setFieldValue, values.warehouses.id, false, "deleteProduct");
  };

  const handleDeleteInvoice = async (id) => {
    try {
      const res = await myAxios.delete(`sales-invoices/${id}/`);
      console.log("res.data.detail", res);
      // showNotification(t(res.data.detail), "success");
      // dispatch(showNotificationAction({ message: t(res.data.detail), type: 'success' }));
      // navigate(ROUTES.MAIN);
      // setTimeout(() => {
      //   navigate(ROUTES.MAIN);
      // }, 100);
      navigate(ROUTES.MAIN, { state: { notification: t(res.data.detail) } });
    } catch (error) {
      console.log("oshobka pri popytkr udalit invoice", error);
      showNotification(t(error.response.data.detail), "error");
    } finally {
    }

    console.log("invoice daleted, id = ", id);
  };

  const handleDeleteGift = (id) => {
    const newProducts = values.gifts.filter((p) => p.id !== id);
    setFieldValue("gifts", newProducts);
    // refreshTable({ ...values, products: newProducts }, setFieldValue, values.warehouses.id, false, "deleteProduct");
  };

  return (
    <div className="overflow-x-auto print:mt-3 print:ml-0 print:mr-0 print:mb-0 my-5">
      {values.products.length > 0 && (
        <table className="table-auto border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 print:leading-tight print:!text-black mx-auto print:mx-0">
          <THead visibleColumns={visibleColumns} printVisibleColumns={printVisibleColumns} handleDeleteInvoice={handleDeleteInvoice} />
          <tbody>
            <TDProducts
              handleDeleteProduct={handleDeleteProduct}
              visibleColumns={visibleColumns}
              printVisibleColumns={printVisibleColumns}
              showNotification={showNotification}
              productQuantityRefs={productQuantityRefs}
              productListRefs={productListRefs}
              productInputRef={productInputRef}
              productPriceRefs={productPriceRefs}
              id={id}
            />

            <TDGifts
              handleDeleteProduct={handleDeleteProduct}
              visibleColumns={visibleColumns}
              printVisibleColumns={printVisibleColumns}
              showNotification={showNotification}
              productQuantityRefs={productQuantityRefs}
              productListRefs={productListRefs}
              productInputRef={productInputRef}
              productPriceRefs={productPriceRefs}
              handleDeleteGift={handleDeleteGift}
              id={id}
            />
          </tbody>
          <TFoot visibleColumns={visibleColumns} printVisibleColumns={printVisibleColumns} />
        </table>
      )}
    </div>
  );
};

export default InvoiceTable;
