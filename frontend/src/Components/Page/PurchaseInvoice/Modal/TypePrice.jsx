import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

const TypePrice = () => {
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const { t } = useTranslation();

  return (
    <div>
      {/* <span className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{t("type faktura")}</span> */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="type_price"
            value="wholesale_price"
            checked={values.type_price === "wholesale_price"}
            onChange={(e) => {
              const newType = e.target.value;
              if (values.products.length > 0) {
                const updatedProducts = values.products.map((p) => {
                  if (p.is_custom_price) {
                    // пользователь ввёл вручную → оставляем
                    return p;
                  }
                  // иначе обновляем под тип
                  return {
                    ...p,
                    selected_price: newType === "retail_price" ? Number(p.retail_price) : Number(p.wholesale_price),
                  };
                });
                setFieldValue("products", updatedProducts);
              }
              setFieldValue("type_price", newType);
              localStorage.setItem("type_price", newType);
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
              }
            }}
          />
          <span className="text-gray-700 dark:text-gray-300">{t("wholesale_price")}</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="type_price"
            value="retail_price"
            checked={values.type_price === "retail_price"}
            onChange={(e) => {
              const newType = e.target.value;
              if (values.products.length > 0) {
                const updatedProducts = values.products.map((p) => {
                  if (p.is_custom_price) {
                    // пользователь ввёл вручную → оставляем
                    return p;
                  }
                  // иначе обновляем под тип
                  return {
                    ...p,
                    selected_price: newType === "retail_price" ? Number(p.retail_price) : Number(p.wholesale_price),
                  };
                });
                setFieldValue("products", updatedProducts);
              }
              setFieldValue("type_price", newType);
              localStorage.setItem("type_price", newType);
            }}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
              }
            }}
          />
          <span className="text-gray-700 dark:text-gray-300">{t("retail_price")}</span>
        </label>
      </div>
    </div>
  );
};

export default TypePrice;
