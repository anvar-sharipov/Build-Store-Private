import MyFormatDate from "../../../UI/MyFormatDate";
import { DateContext } from "../../../UI/DateProvider";
import { useContext } from "react";
import Xrow from "../../../UI/Universal/Xrow";
import { useTranslation } from "react-i18next";
import { formatNumber2 } from "../../../UI/formatNumber2";

const ZakazForPrint = ({
  selectedWarehouse,
  setSelectedWarehouse,
  warehouseInputRef,
  selectedPartner,
  setSelectedPartner,
  partnerInputRef,
  selectedBuyer,
  setSelectedBuyer,
  buyerInputRef,
  selectedProducts,
  totals,
  show,
  isEdit, 
  id,
}) => {
  const { dateProwodok } = useContext(DateContext);
  const { t } = useTranslation();
  return (
    <div className="hidden print:block">
      <div className="flex justify-between border-b-2 border-gray-300 mb-3">
        <div>
          <img src="/polisem.png" alt="polisem-icon" className="h-12 lg:h-14 w-auto" />
        </div>
        <h2 className="self-end mb-0 text-xl font-bold text-center print:!text-black">
          {isEdit ? (
            <div>
              {t("Zakaz")} № {id}
            </div>
          ) : (
            t("Create zakaz")
          )}
        </h2>
        <div className="self-end mb-0 text-sm font-bold text-gray-900 dark:text-white truncate print:!text-black">{MyFormatDate(dateProwodok)}</div>
      </div>

      {selectedWarehouse?.id && (
        <Xrow
          selectedObject={selectedWarehouse}
          setSelectedObject={setSelectedWarehouse}
          labelText="warehouse" // text dlya label inputa
          containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.1 } }}
          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.1 } }}
          focusRef={warehouseInputRef} // chto focus esli X najat
          onlyDarkModeInputStyle={false}
          labelIcon="🏭"
          showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
        />
      )}

      {selectedPartner?.id && (
        <Xrow
          selectedObject={selectedPartner}
          setSelectedObject={setSelectedPartner}
          labelText="partner" // text dlya label inputa
          containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
          focusRef={partnerInputRef} // chto focus esli X najat
          onlyDarkModeInputStyle={false}
          labelIcon="👥"
          showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
          disabled={false}
        />
      )}

      {selectedBuyer?.id && (
        <Xrow
          selectedObject={selectedBuyer}
          setSelectedObject={setSelectedBuyer}
          labelText="buyer" // text dlya label inputa
          containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.3 } }}
          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.3 } }}
          focusRef={buyerInputRef} // chto focus esli X najat
          onlyDarkModeInputStyle={false}
          labelIcon="👥"
          showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-black dark:border-gray-700 mt-7">
        <table className="min-w-full text-xs !text-black dark:text-gray-200 border border-black dark:border-gray-700 border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
            <tr>
              <th className="px-2 py-2 text-center w-10 border border-black dark:border-gray-700">№</th>
              <th className="px-3 py-2 text-left border border-black dark:border-gray-700">{t("product name")}</th>
              <th className="px-2 py-2 text-center w-24 border border-black dark:border-gray-700">{t("uni")}</th>
              <th className="px-2 py-2 text-right w-20 border border-black dark:border-gray-700">{t("q-ty")}</th>
              {show("price") && <th className="px-2 py-2 text-right w-24 border border-black dark:border-gray-700">{t("Price")}</th>}
              {show("total_price") && <th className="px-2 py-2 text-right w-24 border border-black dark:border-gray-700">{t("Amount")}</th>}
              {show("weight") && <th className="px-2 py-2 text-right w-16 border border-black dark:border-gray-700">{t("kg")}</th>}
              {show("volume") && <th className="px-2 py-2 text-right w-16 border border-black dark:border-gray-700">Куб</th>}
            </tr>
          </thead>

          <tbody>
            {selectedProducts.length > 0 &&
              selectedProducts.map((product, index) => {
                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-2 py-1 text-center border border-black dark:border-gray-700">{index + 1}</td>
                    <td className="px-3 py-1 truncate max-w-xs border border-black dark:border-gray-700">{product.name}</td>
                    <td className="px-2 py-1 text-center border border-black dark:border-gray-700">{product.unit}</td>
                    <td className="px-2 py-1 text-right border border-black dark:border-gray-700">{product.selected_quantity}</td>
                    {show("price") && <td className="px-2 py-1 text-right border border-black dark:border-gray-700">{product.selected_price}</td>}
                    {show("total_price") && (
                      <td className="px-2 py-1 text-right font-medium border border-black dark:border-gray-700">
                        {formatNumber2(parseFloat(product.selected_quantity) * parseFloat(product.selected_price))}
                      </td>
                    )}
                    {show("weight") && (
                      <td className="px-2 py-1 text-right border border-black dark:border-gray-700">{formatNumber2(parseFloat(product.weight) * parseFloat(product.selected_quantity))}</td>
                    )}
                    {show("volume") && (
                      <td className="px-2 py-1 text-right border border-black dark:border-gray-700">{formatNumber2(parseFloat(product.volume) * parseFloat(product.selected_quantity))}</td>
                    )}
                  </tr>
                );
              })}
          </tbody>
          <tfoot className="bg-gray-100 dark:bg-gray-800 font-semibold">
            <tr>
              <td className="px-3 py-2 text-right border border-black dark:border-gray-700"></td>
              <td className="px-3 py-2 text-right border border-black dark:border-gray-700"></td>
              <td className="px-3 py-2 text-right border border-black dark:border-gray-700">{t("itogo")}:</td>

              <td className="px-2 py-2 text-right border border-black dark:border-gray-700">{formatNumber2(totals.qty)}</td>

              {show("price") && <td className="px-2 py-2 border border-black dark:border-gray-700"></td>}

              {show("total_price") && <td className="px-2 py-2 text-right border border-black dark:border-gray-700">{formatNumber2(totals.sum)}</td>}

              {show("weight") && <td className="px-2 py-2 text-right border border-black dark:border-gray-700">{formatNumber2(totals.weight)}</td>}

              {show("volume") && <td className="px-2 py-2 text-right border border-black dark:border-gray-700">{formatNumber2(totals.volume)}</td>}

              <td className="border border-black dark:border-gray-700"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ZakazForPrint;
