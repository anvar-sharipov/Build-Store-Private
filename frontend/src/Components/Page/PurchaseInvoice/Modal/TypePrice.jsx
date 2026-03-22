import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

const TypePrice = ({ authGroup }) => {
  const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const { t } = useTranslation();
  const change_type = new Audio("/sounds/change_type.mp3");

  return (
    <div>
      <fieldset disabled={authGroup !== "admin" || values.already_entry || values.canceled_at}>
        {/* <span className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{t("type faktura")}</span> */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="type_price"
              value="wholesale_price"
              checked={values.type_price === "wholesale_price"}
              onChange={(e) => {
                change_type.currentTime = 0;
                change_type.play();
                const newType = e.target.value;
                if (values.products.length > 0) {
                  setFieldValue("products", []);
                  // const updatedProducts = values.products.map((p) => {
                  //   if (p.is_custom_price) {
                  //     // пользователь ввёл вручную → оставляем
                  //     return p;
                  //   }
                  //   // иначе обновляем под тип
                  //   // console.log("newType TTEE", newType);
                  //   const basePrice = newType === "retail_price" ? Number(p.retail_price) : Number(p.wholesale_price);
                  //   const discount = p.discount_percent || 0;
                  //   const price_after_discount = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;

                  //   // console.log("basePrice TT", basePrice);
                  //   // console.log("p.wholesale_price TT", p.wholesale_price);

                  //   return {
                  //     ...p,
                  //     selected_price: price_after_discount,
                  //     price_after_discount,
                  //   };
                  // });
                  // setFieldValue("products", updatedProducts);
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
                change_type.currentTime = 0;
                change_type.play();
                const newType = e.target.value;

                if (values.products.length > 0) {
                  setFieldValue("products", []);
                  // const updatedProducts = values.products.map((p) => {
                  //   if (p.is_custom_price) {
                  //     // пользователь ввёл вручную → оставляем
                  //     return p;
                  //   }
                  //   // иначе обновляем под тип
                  //   const basePrice = newType === "retail_price" ? Number(p.retail_price) : Number(p.wholesale_price);
                  //   const discount = p.discount_percent || 0;
                  //   const price_after_discount = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
                  //   return {
                  //     ...p,
                  //     selected_price: price_after_discount,
                  //     price_after_discount,
                  //   };
                  // });
                  // setFieldValue("products", updatedProducts);
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
      </fieldset>
    </div>
  );
};

export default TypePrice;
