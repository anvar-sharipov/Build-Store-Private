import { useState } from "react";
import InvoiceRow from "./InvoiceRow";

const PuchaseInvoiceList = ({
  selectedProducts,
  setSelectedProducts,
  giftProducts,
  setGiftProducts,
  t,
  resultQuantityRefs,
  selectedPriceType, // select opt ili roznisa
}) => {
  const [quantityErrors, setQuantityErrors] = useState({});


  const totalPriceSum = selectedProducts.reduce((sum, p) => {
    const pricePerUnit =
      selectedPriceType === "wholesale_price"
        ? p.wholesale_price
        : p.retail_price;
    const quantity = parseFloat(p.selected_quantity) || 0;
    return sum + pricePerUnit * quantity;
  }, 0);

  const totalProfitSum = selectedProducts.reduce((sum, p) => {
    const pricePerUnit =
      selectedPriceType === "wholesale_price"
        ? p.wholesale_price
        : p.retail_price;
    const profitPerUnit = pricePerUnit - p.purchase_price;
    const quantity = parseFloat(p.selected_quantity) || 0;
    return sum + profitPerUnit * quantity;
  }, 0);

  return (
    <table className="min-w-full mt-6 text-sm border border-gray-300 rounded">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-2 border">№</th>
          <th className="p-2 border">Товар</th>
          <th className="p-2 border">Ед. изм</th>
          <th className="p-2 border">Кол-во</th>
          <th className="p-2 border">В базовых ед.</th>
          <th className="p-2 border">Цена за 1</th>
          <th className="p-2 border">Цена сумма</th>
          <th className="p-2 border">Прибыль за 1</th>
          <th className="p-2 border">Прибыль сумма</th>
        </tr>
      </thead>
      <tbody>
        {selectedProducts.map((p, idx) => (
          <InvoiceRow
            key={idx}
            p={p}
            idx={idx}
            selectedPriceType={selectedPriceType}
            quantityErrors={quantityErrors}
            setQuantityErrors={setQuantityErrors}
            setSelectedProducts={setSelectedProducts}
            setGiftProducts={setGiftProducts}
            resultQuantityRefs={resultQuantityRefs}
          />
        ))}

        {giftProducts.length > 0 &&
          giftProducts.map((giftProduct, idx) => {
            console.log('giftProduct', giftProduct);
            
            const inStock = Number(giftProduct.gift_product_quantity_in_stock);
            const required = Number(giftProduct.calculatedQuantity || 0);
            const isNotEnough = inStock < required;

            return (
              <tr
                key={`${giftProduct.gift_product_id}-${giftProduct.main_product_id}`}
                className="bg-blue-50"
              >
                <td className="p-2 border">
                  {selectedProducts.length + idx + 1}
                </td>
                <td className="p-2 border">{giftProduct.gift_name}</td>
                <td className="p-2 border">
                  {giftProduct.gift_product_unit_name}
                </td>
                <td
                  className={`p-2 border ${
                    isNotEnough ? "bg-red-200 text-red-700 font-semibold" : ""
                  }`}
                >
                  {/* {giftProduct.calculatedQuantity} */}
                  {giftProduct.calculatedQuantity.toLocaleString("ru-RU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td
                  className="p-2 border col-span-3 text-sm italic text-gray-600 bg-blue-100 rounded-md"
                  colSpan={5}
                >
                  🎁 Для товара:{" "}
                  <span className="font-semibold text-blue-800">
                    {giftProduct.main_product_name}
                  </span>
                </td>
              </tr>
            );
          })}
      </tbody>
      <tfoot className="bg-gray-100 font-semibold">
        <tr>
          <td className="p-2 border" colSpan={6}>
            Итого
          </td>
          <td className="p-2 border">
            {totalPriceSum.toLocaleString("ru-RU", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
          <td className="p-2 border"></td>
          <td className="p-2 border">
            {totalProfitSum.toLocaleString("ru-RU", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default PuchaseInvoiceList;
