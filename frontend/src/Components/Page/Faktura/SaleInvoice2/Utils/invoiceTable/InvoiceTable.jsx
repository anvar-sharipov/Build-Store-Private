import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import THead from "./THead";
import refreshTable from "./refreshTable";
import TFoot from "./TFoot";
import TDProducts from "./TDProducts";
import TDGifts from "./TDGifts";


const InvoiceTable = ({ showNotification, productListRefs, productQuantityRefs, productPriceRefs, productInputRef, visibleColumns, printVisibleColumns, id }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, validateField, setFieldTouched, errors } = useFormikContext();
  const handleDeleteProduct = (id) => {
    const newProducts = values.products.filter((p) => p.id !== id);
    setFieldValue("products", newProducts);
    refreshTable({ ...values, products: newProducts }, setFieldValue, values.warehouses.id, false, "deleteProduct");
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
          <THead visibleColumns={visibleColumns} printVisibleColumns={printVisibleColumns} />
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
