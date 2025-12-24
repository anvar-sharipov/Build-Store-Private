import { useFormikContext } from "formik";
import { useEffect } from "react";

const SyncFormik = ({ selectedPartner, selectedBuyer, selectedProduct, selectedProducts }) => {
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    if (selectedPartner) {
      setFieldValue("partner", selectedPartner.id);
    } else {
      setFieldValue("partner", "");
    }
  }, [selectedPartner]);

  useEffect(() => {
    if (selectedBuyer) {
      setFieldValue("buyer", selectedBuyer.id);
    } else {
      setFieldValue("buyer", "");
    }
  }, [selectedBuyer]);

  useEffect(() => {
    setFieldValue(
      "products",
      selectedProducts.map((p) => ({
        product: p.id,
        selected_quantity: p.selected_quantity,
        selected_price: p.selected_price,
      }))
    );
  }, [selectedProducts]);

  return null;
};

export default SyncFormik;
