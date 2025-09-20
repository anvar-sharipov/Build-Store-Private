// ProductEditModal2.jsx
import MyModal2 from "../../../../UI/MyModal2";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import BasicTab from "./tabs/BasicTab";
import PricesTab from "./tabs/PricesTab";
import DimensionsTab from "./tabs/DimensionsTab";
import CategoriesTab from "./tabs/CategoriesTab";
import HeaderForTabs from "./tabs/HeaderForTabs";
import myAxios from "../../../../axios";
import { CiNoWaitingSign } from "react-icons/ci";

import { Package, Tag, DollarSign, Ruler, Image } from "lucide-react";
import { myClass } from "../../../../tailwindClasses";
import ImagesTab from "./tabs/ImagesTab";

const ProductEditModal2 = ({
  setProducts,
  productEditModal2,
  setProductEditModal2,
  options,
  t,
  setOptions,
  isCreate,
  showNotification,
  setNotification,
  notification,
  warehouses,
}) => {
  const [product, setProduct] = useState(productEditModal2.data);
  const [activeTab, setActiveTab] = useState("basic");
  const [loadingModal, setLoadingModal] = useState(false);

  // console.log("product", product);
  // console.log('options', options);

  const tabs = [
    { id: "basic", label: t("basic"), icon: Package },
    { id: "prices", label: t("prices"), icon: DollarSign },
    { id: "dimensions", label: t("dimensions"), icon: Ruler },
    { id: "categories", label: t("categories"), icon: Tag },
    { id: "images", label: t("images"), icon: Image },
  ];

  const initialValues = {
    id: product.id,
    name: product.name || "",
    description: product.description || "",
    sku: product.sku || "",
    qr_code: product.qr_code || "",
    // quantity: product.quantity || 0,
    purchase_price: product.purchase_price || 0,
    retail_price: product.retail_price || 0,
    wholesale_price: product.wholesale_price || 0,
    firma_price: product.firma_price || 0,
    weight: product.weight || "",
    volume: product.volume || "",
    length: product.length || "",
    width: product.width || "",
    height: product.height || "",
    is_active: product.is_active ?? true,
    base_unit: product.base_unit_obj ? String(product.base_unit_obj.id) : "",
    category: product.category_name_obj
      ? String(product.category_name_obj.id)
      : "",
    brand: product.brand_obj ? String(product.brand_obj.id) : "",
    model: product.model_obj ? String(product.model_obj.id) : "",
    tags: product.tags_obj ? product.tags_obj.map((tag) => String(tag.id)) : [],
    units: product.units || [],
    free_items: product.free_items || [],
    // Вот так:
    warehouses:
      product.warehouses_data && product.warehouses_data.length > 0
        ? product.warehouses_data.map((wp) => ({
            warehouse: String(wp.warehouse_id),
            quantity: wp.quantity.toString(),
          }))
        : [
            {
              warehouse:
                options.warehouses.length > 0
                  ? String(options.warehouses[0].value) // ← выбираем первый склад
                  : "",
              quantity: 0,
            },
          ],
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t("requiredName"))
      .test("check-unique-name", t("uniqueNameError"), async function (value) {
        if (!value || value === initialValues.name) return true;

        try {
          const res = await myAxios(
            `/check-name-unique/?name=${encodeURIComponent(value)}`
          );
          return !res.data.exists;
        } catch (e) {
          console.log("errorr in check-name-unique", e);
          return true;
        }
      }),
    // quantity: Yup.number()
    //   .typeError(t("enterNumber"))
    //   .min(0, t("quantityNonNegative"))
    //   .notRequired(),
    base_unit: Yup.number()
      .required(t("selectUnit"))
      .typeError(t("invalidValue")),
    category: Yup.number()
      .required(t("selectCategory"))
      .typeError(t("invalidValue")),
    // warehouse: Yup.number()
    //   .required(t("selectWarehouse"))
    //   .typeError(t("invalidValue")),
    purchase_price: Yup.number()
      .typeError(t("enterPrice"))
      .min(0, t("priceNonNegative"))
      .notRequired(),
    retail_price: Yup.number()
      .typeError(t("enterPrice"))
      .min(0, t("priceNonNegative"))
      .notRequired(),
    wholesale_price: Yup.number()
      .typeError(t("enterPrice"))
      .min(0, t("priceNonNegative"))
      .notRequired(),
    weight: Yup.number().min(0, t("nonNegative")).notRequired(),
    volume: Yup.number().min(0, t("nonNegative")).notRequired(),
    length: Yup.number().min(0, t("nonNegative")).notRequired(),
    width: Yup.number().min(0, t("nonNegative")).notRequired(),
    height: Yup.number().min(0, t("nonNegative")).notRequired(),
    units: Yup.array().of(
      Yup.object().shape({
        unit: Yup.number()
          .required(t("selectUnit"))
          .typeError(t("invalidValue")),
        conversion_factor: Yup.number()
          .required(t("enterConversionFactor"))
          .positive(t("positiveFactor"))
          .typeError(t("invalidValue")),
        is_default_for_sale: Yup.boolean(),
      })
    ),
    free_items: Yup.array().of(
      Yup.object().shape({
        quantity_per_unit: Yup.number()
          .required(t("enterQuantity"))
          .min(0, t("quantityNonNegative"))
          .typeError(t("invalidValue")),
        gift_product: Yup.string().required(t("selectProduct")),
      })
    ),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      images: product.images ? product.images.map((img) => img.id) : [],
    };
    setLoadingModal(true);
    try {
      let res;
      if (isCreate) {
        // console.log("payload", payload);

        res = await myAxios.post(`/products/`, payload);
        setProducts((prev) => [res.data, ...prev]);
      } else {
        res = await myAxios.put(`/products/${values.id}/`, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === res.data.id ? res.data : p))
        );
      }
    } catch (error) {
      // console.log("eerrorrr", error);

      if (error.response && error.response.status === 403) {
        // Показываем уведомление пользователю
        showNotification(t(error.response.data.detail), "error");
      } else {
        console.error("Произошла ошибка", error);
      }
    } finally {
      setLoadingModal(false);
      setProductEditModal2({ open: false, data: null, index: null });
    }
  };

  return (
    <MyModal2
      onClose={() => {
        setProductEditModal2({ open: false, data: null, index: null });
      }}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnMount={true}
      >
        {({ touched, errors, isValid, isSubmitting }) => (
          <Form>
            <HeaderForTabs
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <div className="flex flex-col max-h-[80vh] border p-2 bg-gray-200 dark:bg-gray-800">
              <div className="flex-1 overflow-auto pr-1">
                {activeTab === "basic" ? (
                  <BasicTab
                    options={options}
                    loadingModal={loadingModal}
                    setOptions={setOptions}
                    productId={product.id}
                    t={t}
                    warehouses={warehouses}
                  />
                ) : activeTab === "prices" ? (
                  <PricesTab options={options} setOptions={setOptions} t={t} />
                ) : activeTab === "dimensions" ? (
                  <DimensionsTab
                    options={options}
                    setOptions={setOptions}
                    t={t}
                  />
                ) : activeTab === "categories" ? (
                  <CategoriesTab
                    options={options}
                    setOptions={setOptions}
                    className={errors.category ? "bg-red-300" : ""}
                    t={t}
                  />
                ) : activeTab === "images" ? (
                  <ImagesTab
                    options={options}
                    setOptions={setOptions}
                    product={product}
                    setProduct={setProduct}
                    t={t}
                    
                  />
                ) : null}
              </div>

              <div className="mt-4 pt-2 border-t border-gray-300 text-right dark:bg-gray-900 sticky bottom-0">
                <button
                  type="submit"
                  className={myClass.button}
                  disabled={!isValid || isSubmitting || loadingModal}
                >
                  {loadingModal ? (
                    <span className="flex items-center gap-2">
                      <CiNoWaitingSign className="animate-spin" />
                      {t("saving")}
                    </span>
                  ) : isCreate ? (
                    t("save")
                  ) : (
                    t("edit")
                  )}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </MyModal2>
  );
};

export default ProductEditModal2;
