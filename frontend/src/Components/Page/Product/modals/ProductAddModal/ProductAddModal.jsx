import ProductEditModal2 from "../ProductEditModal/ProductEditModal2";

const ProductAddModal = ({
  setProducts,
  setProductAddModal,
  productAddModal,
  options,
  setOptions,
  t,
  setProductAddModalOpen,
  productAddModalOpen,
  showNotification,
  setNotification,
  notification,
  warehouses
}) => {
  const emptyProduct = {
    id: null,
    name: "",
    description: "",
    sku: "",
    qr_code: "",
    quantity: 0,
    purchase_price: 0,
    retail_price: 0,
    wholesale_price: 0,
    weight: "",
    volume: "",
    length: "",
    width: "",
    height: "",
    is_active: true,
    base_unit_obj: null,
    category_name_obj: null,
    brand_obj: null,
    model_obj: null,
    tags_obj: [],
    units: [],
    free_items: [],
    warehouses: []
  };

  return (
    <ProductEditModal2
      setProducts={setProducts}
      productEditModal2={{
        open: productAddModalOpen,
        data: emptyProduct,
        index: null,
      }}
      setProductEditModal2={() => setProductAddModalOpen(false)}
      options={options}
      setOptions={setOptions}
      t={t}
      isCreate={true}
      showNotification={showNotification}
      setNotification={setNotification}
      notification={notification}
      warehouses={warehouses}
    />
  );
};

export default ProductAddModal;
