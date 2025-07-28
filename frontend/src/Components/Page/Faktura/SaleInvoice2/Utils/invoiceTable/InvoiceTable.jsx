import { formatNumber } from "../../../../../UI/formatNumber";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import TDQuantity from "./TDQuantity";
import TDPrice from "./TDPrice";
import THead from "./THead";

const InvoiceTable = ({ showNotification, productListRefs, productQuantityRefs, productPriceRefs }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext();
  return (
    <div>
      {values.products.length > 0 && (
        <table>
          <THead />
          <tbody>
            {values.products.map((product, index) => {
              // console.log("product", product);

              return (
                <tr key={product.id} ref={(el) => (productListRefs.current[product.id] = el)} tabIndex={0}>
                  <td>{index + 1}</td>
                  <td>{product.name}</td>
                  <TDQuantity product={product} index={index} showNotification={showNotification} productQuantityRefs={productQuantityRefs} />
                  <td>{product.unit_name_on_selected_warehouses}</td>
                  <TDPrice product={product} index={index} productPriceRefs={productPriceRefs} />
                  <td>
                    {values.products.map((p) => {
                      if (p.id === product.id) {
                        return parseFloat(p.selected_quantity) * parseFloat(p.selected_price);
                      }
                    })}
                  </td>
                </tr>
              );
            })}
            {values.gifts.map((product, index) => {
              // console.log("product gift", product);
              return (
                <tr key={product.id}>
                  <td>{index + 1 + values.products.length}</td>
                  <td>{product.name}</td>
                  <td>{formatNumber(product.selected_quantity)}</td>
                  <td>{product.unit_name_on_selected_warehouses}</td>
                  <td></td>
                  <td></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>Itogo:</td>
              <td>{values.footerTotalPrice}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default InvoiceTable;
