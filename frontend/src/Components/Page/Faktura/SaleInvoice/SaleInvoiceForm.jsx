import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import * as Yup from "yup";

const SaleInvoiceForm = ({ selectedProducts, priceType, setPriceType }) => {
    

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        customer: "",
        priceType: priceType,
        products: selectedProducts.map((p) => ({
          ...p,
          purchase_price: parseFloat(p.purchase_price) || 0,
          wholesale_price: parseFloat(p.wholesale_price) || 0,
          retail_price: parseFloat(p.retail_price) || 0,
          quantity_in_stock: parseFloat(p.quantity) || 0,
          selected_quantity: "",
          base_quantity: 0,
          selected_unit: p.base_unit_obj || {
            id: 1,
            name: "шт",
            conversion_factor: 1,
          },
        })),
      }}
      validationSchema={Yup.object({
        customer: Yup.string().required("Выберите клиента"),
      })}
      onSubmit={(values) => {
        console.log("Отправка накладной:", values);
      }}
    >
      {({ values, setFieldValue }) => {
        const handleQuantityChange = (value, index) => {
          const quantity = parseFloat(value) || 0;
          const factor =
            values.products[index].selected_unit?.conversion_factor || 1;
          const baseQuantity = quantity * factor;

          setFieldValue(`products[${index}].selected_quantity`, value);
          setFieldValue(`products[${index}].base_quantity`, baseQuantity);
        };

        return (
          <Form className="space-y-4">
            <div>
              <label className="block font-semibold">Клиент</label>
              <Field name="customer" className="border p-2 w-full" />
              <ErrorMessage
                name="customer"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Для отладки, показываем текущие products */}
            {/* <pre>{JSON.stringify(values.products, null, 2)}</pre> */}

            {/* select opt, rozn */}
            <div className="flex items-center gap-4">
              <label className="font-semibold">Тип цены:</label>

              <label className="flex items-center gap-1">
                <Field
                  type="radio"
                  name="priceType"
                  value="wholesale"
                  onChange={(e) => {
                    setFieldValue("priceType", e.target.value);
                    setPriceType(e.target.value);
                  }}
                  checked={values.priceType === "wholesale"}
                />
                <span>Опт</span>
              </label>

              <label className="flex items-center gap-1">
                <Field
                  type="radio"
                  name="priceType"
                  value="retail"
                  onChange={(e) => {
                    setFieldValue("priceType", e.target.value);
                    setPriceType(e.target.value);
                  }}
                  checked={values.priceType === "retail"}
                />
                <span>Розница</span>
              </label>
            </div>

            {/* Таблица только для больших экранов */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[800px] sm:min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">№</th>
                    <th className="p-2 border">Bar code</th>
                    <th className="p-2 border">Товар</th>
                    <th className="p-2 border">Ед. изм</th>
                    <th className="p-2 border">Кол-во</th>
                    <th className="p-2 border">Баз. кол-во</th>

                    <th className="p-2 border">
                      {values.priceType === "retail"
                        ? "Цена (розн.)"
                        : "Цена (опт.)"}
                    </th>

                    <th className="p-2 border">
                      {values.priceType === "retail"
                        ? "Сумма (розн.)"
                        : "Сумма (опт.)"}
                    </th>

                    <th className="p-2 border">Цена прих. за шт.</th>
                    <th className="p-2 border">Сумма прих.</th>
                    <th className="p-2 border">Разн. за шт.</th>
                    <th className="p-2 border">Разн. сумма</th>
                    <th className="p-2 border">Скидка за шт.</th>
                    <th className="p-2 border">Скидка сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {values.products.map((p, idx) => {
                    const unitPrice = // Цена (опт./roz)
                      values.priceType === "retail"
                        ? p.retail_price
                        : p.wholesale_price;

                    const priceSum = unitPrice * p.base_quantity; // Сумма (опт./roz)

                    const purchasePerUnit = p.purchase_price; // Цена прих. за шт.
                    const purchaseSum = purchasePerUnit * p.base_quantity; // Сумма прих.

                    const profitPerUnit = unitPrice - p.purchase_price; // Разн. за шт.
                    const profitSum = profitPerUnit * p.base_quantity; // Разн. сумма

                    let discountPerUnit =
                      unitPrice -
                      p.purchase_price -
                      (p.wholesale_price - p.purchase_price);
                    // console.log(
                    //   `(${p.retail_price} - ${p.purchase_price}) - (${p.wholesale_price} - ${p.purchase_price})`
                    // );
                    // console.log('gg', unitPrice);

                    // console.log('optom', p.wholesale_price);
                    // console.log('prihod', p.purchase_price);
                    // console.log('rozissa', p.retail_price);

                    // const discountPerUnit = p.retail_price - p.wholesale_price; // Скидка за шт.
                    let discountSum = discountPerUnit * p.base_quantity; // Скидка сумма

                    return (
                      <tr key={p.id}>
                        <td className="p-2 border">{idx + 1}</td>
                        <td className="p-2 border">{p.qr_code || "—"}</td>
                        <td className="p-2 border">{p.name}</td>
                        <td className="p-2 border">
                          <select
                            className="border px-2 py-1 rounded"
                            value={p.selected_unit?.id || 1}
                            onChange={(e) => {
                              const unitId = parseInt(e.target.value);
                              const unitInfo = p.units.find(
                                (u) => u.unit === unitId
                              ) ||
                                p.base_unit_obj || {
                                  id: 1,
                                  name: "шт",
                                  conversion_factor: 1,
                                };
                              const factor = unitInfo.conversion_factor || 1;
                              const quantity =
                                parseFloat(p.selected_quantity) || 0;
                              const baseQuantity = quantity * factor;

                              setFieldValue(`products[${idx}].selected_unit`, {
                                id: unitInfo.unit || unitInfo.id,
                                name: unitInfo.unit_name || unitInfo.name,
                                conversion_factor: factor,
                              });
                              setFieldValue(
                                `products[${idx}].base_quantity`,
                                baseQuantity
                              );
                            }}
                          >
                            <option value="">{p.base_unit_obj.name}</option>
                            {p.units.map((u) => (
                              <option key={u.unit} value={u.unit}>
                                {u.unit_name} ({u.conversion_factor})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border">
                          <input
                            type="number"
                            className="border px-2 py-1 rounded w-20"
                            value={p.selected_quantity}
                            min={0.01}
                            step={0.01}
                            onChange={(e) =>
                              handleQuantityChange(e.target.value, idx)
                            }
                          />
                        </td>
                        <td className="p-2 border">
                          {p.base_quantity.toFixed(2)}
                        </td>
                        <td className="p-2 border">
                          <input
                            type="number"
                            className="border px-2 py-1 rounded w-20"
                            value={unitPrice}
                            min={0.01}
                            step={0.01}
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;

                              const priceField =
                                values.priceType === "retail"
                                  ? "retail_price"
                                  : "wholesale_price";

                              //   setFieldValue(
                              //     `products[${idx}].${priceField}`,
                              //     newPrice
                              //   );


                              const discountPerUnit =
                                unitPrice -
                                p.purchase_price -
                                (p.wholesale_price - p.purchase_price);
                              // console.log(
                              //   `(${p.retail_price} - ${p.purchase_price}) - (${p.wholesale_price} - ${p.purchase_price})`
                              // );
                              // console.log('gg', unitPrice);

                              // console.log('optom', p.wholesale_price);
                              // console.log('prihod', p.purchase_price);
                              // console.log('rozissa', p.retail_price);

                              // const discountPerUnit = p.retail_price - p.wholesale_price; // Скидка за шт.
                              const discountSum =
                                discountPerUnit * p.base_quantity; // Скидка сумма

                              const updatedProducts = [...values.products];
                              console.log("updatedProducts", updatedProducts);

                              updatedProducts[idx] = {
                                ...updatedProducts[idx],
                                [priceField]: newPrice,
                              };


                              setFieldValue("products", updatedProducts);
                            }}
                          />
                        </td>
                        <td className="p-2 border">{priceSum.toFixed(2)}</td>

                        <td className="p-2 border">
                          {purchasePerUnit.toFixed(2)}
                        </td>
                        <td className="p-2 border">{purchaseSum.toFixed(2)}</td>
                        <td className="p-2 border">
                          {profitPerUnit.toFixed(2)}
                        </td>
                        <td className="p-2 border">{profitSum.toFixed(2)}</td>
                        <td className="p-2 border">
                          {discountPerUnit.toFixed(2)}
                        </td>
                        <td className="p-2 border">{discountSum.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Мобильная версия */}
            <div className="md:hidden space-y-4">
              {values.products.map((p, idx) => (
                <div key={p.id} className="border p-2 rounded shadow">
                  <div className="font-semibold">{p.name}</div>
                  <div>Кол-во: {p.selected_quantity}</div>
                  <div>
                    Цена:{" "}
                    {values.priceType === "retail"
                      ? p.retail_price
                      : p.wholesale_price}
                  </div>
                  <div>
                    Сумма:{" "}
                    {(
                      (values.priceType === "retail"
                        ? p.retail_price
                        : p.wholesale_price) * p.base_quantity
                    ).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Сохранить накладную
            </button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default SaleInvoiceForm;
