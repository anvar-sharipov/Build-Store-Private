import { useFormikContext } from "formik";
import { useEffect } from "react";

const TotalsCalculator = () => {
  const { values, setFieldValue } = useFormikContext();

  useEffect(() => {
    const total = values.products.reduce((sum, p) => {
      return sum + (Number(p.selected_price) || 0) * (Number(p.selected_quantity) || 0);
    }, 0);

    setFieldValue("total_selected_price", total);
  }, [values.products, setFieldValue]);

  return null; // компонент только для логики
};

export default TotalsCalculator;
