import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Форматирование чисел
const format = (num) =>
  new Intl.NumberFormat("ru-RU", {
    // minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num);

const InvoiceRow = ({
  p, // product
  idx, // index
  selectedPriceType, // obychnyy select optom ili roznisa
  quantityErrors, // {index: false ili true} w zawisimosti ot togo est hwatit na sklade kolichestwo wybrannogo produkta ili net
  setQuantityErrors,
  setSelectedProducts, // set samogo spiska productow
  setGiftProducts, // set spiska gift productow
  resultQuantityRefs, // ссылки на input'ы для фокуса и управления Кол-вом
}) => {

  
  const unitPrice = // Подсчёт цен и прибыли
    selectedPriceType === "wholesale_price"
      ? p.wholesale_price
      : p.retail_price;

  const priceSum = p.base_quantity * unitPrice;
  const profitPerUnit = unitPrice - p.purchase_price;
  const profitSum = profitPerUnit * p.base_quantity;
  const isError = quantityErrors[idx] || false;

  const getFactor = (unitId) => {
    if (unitId === p.base_unit_obj.id) return 1;
    return p.units.find((u) => u.unit === unitId)?.conversion_factor || 1;
  };

  const handlePriceChange = (newPrice) => {
    if (isNaN(newPrice)) return;

    setSelectedProducts((prev) =>
      prev.map((item, i) =>
        i === idx
          ? selectedPriceType === "wholesale_price"
            ? { ...item, wholesale_price: newPrice }
            : { ...item, retail_price: newPrice }
          : item
      )
    );
  };

  const handleQuantityChange = (newQuantity) => {
    const factor = getFactor(p.selected_unit?.id || p.base_unit_obj.id);
    const newBaseQuantity = (parseFloat(newQuantity) || 0) * factor;

    setGiftProducts((prev) =>
      prev.map((gift) =>
        gift.main_product_id === p.id
          ? {
              ...gift,
              calculatedQuantity: gift.baseUnitQuantity * newBaseQuantity,
            }
          : gift
      )
    );

    setSelectedProducts((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              selected_quantity: newQuantity,
              base_quantity: newBaseQuantity,
            }
          : item
      )
    );

    setQuantityErrors((prev) => ({
      ...prev,
      [idx]: newBaseQuantity > Number(p.quantity_in_stock),
    }));
  };

  const handleUnitChange = (newUnitId) => {
    const factor = getFactor(newUnitId);

    const newUnit =
      newUnitId === p.base_unit_obj.id
        ? p.base_unit_obj
        : {
            id: newUnitId,
            name: p.units.find((u) => u.unit === newUnitId)?.unit_name || "",
          };

    const newBaseQuantity = (parseFloat(p.selected_quantity) || 0) * factor;

    setGiftProducts((prev) =>
      prev.map((gift) =>
        gift.main_product_id === p.id
          ? {
              ...gift,
              calculatedQuantity: gift.baseUnitQuantity * newBaseQuantity,
            }
          : gift
      )
    );

    setSelectedProducts((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              selected_unit: newUnit,
              base_quantity: newBaseQuantity,
            }
          : item
      )
    );

    setQuantityErrors((prev) => ({
      ...prev,
      [idx]: newBaseQuantity > Number(p.quantity_in_stock),
    }));
  };

  // ✅ Валидация через Yup
  const validationSchema = Yup.object().shape({
    selected_quantity: Yup.number()
      .required("Обязательное поле")
      .moreThan(0, "Не может быть 0 или меньше"),
    price: Yup.number()
      .required("Обязательное поле")
      .moreThan(0, "Цена должна быть больше 0"),
  });

  return (
    <Formik
      initialValues={{
        selected_quantity: p.selected_quantity,
        price: unitPrice,
      }}
      onSubmit={() => {}}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <tr className="border-t">
          <td className="p-2 border">{idx + 1}</td>
          <td className="p-2 border">{p.name}</td>

          {/* Единицы */}
          <td className="p-2 border">
            <select
              className="border rounded px-2 py-1 w-full"
              value={p.selected_unit?.id || p.base_unit_obj.id}
              onChange={(e) => handleUnitChange(parseInt(e.target.value))}
            >
              <option value={p.base_unit_obj.id}>
                {p.base_unit_obj.name} (базовая)
              </option>
              {p.units
                .filter((u) => u.unit !== p.base_unit_obj.id)
                .map((u, i) => (
                  <option key={i} value={u.unit}>
                    {u.unit_name} ({u.conversion_factor})
                  </option>
                ))}
            </select>
          </td>

          {/* Кол-во */}
          <td className="p-2 border">
            <Field
              name="selected_quantity"
              type="number"
              innerRef={(el) => (resultQuantityRefs.current[idx] = el)}
              className={`w-20 px-2 py-1 border rounded ${
                isError ? "border-red-500 bg-red-100" : "border-gray-300"
              }`}
              onChange={(e) => {
                const val = e.target.value;
                setFieldValue("selected_quantity", val);
                handleQuantityChange(val);
              }}
            />
            <ErrorMessage
              name="selected_quantity"
              component="div"
              className="text-xs text-red-600"
            />
          </td>

          {/* В базовых ед. */}
          <td className="p-2 border">{format(p.base_quantity)}</td>

          {/* Цена */}
          <td className="p-2 border">
            <Field
              name="price"
              type="number"
              step="0.01"
              className="w-20 px-2 py-1 border rounded"
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFieldValue("price", val);
                handlePriceChange(val);
              }}
            />
            <ErrorMessage
              name="price"
              component="div"
              className="text-xs text-red-600"
            />
          </td>

          {/* Цена сумма */}
          <td className="p-2 border">{format(priceSum)}</td>

          {/* Прибыль за 1 */}
          <td className="p-2 border">{format(profitPerUnit)}</td>

          {/* Прибыль сумма */}
          <td className="p-2 border">{format(profitSum)}</td>
        </tr>
      )}
    </Formik>
  );
};

export default InvoiceRow;
