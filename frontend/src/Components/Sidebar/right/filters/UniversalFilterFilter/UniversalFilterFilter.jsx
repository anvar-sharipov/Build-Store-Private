import { ArrowDownCircle, ArrowUpCircle, RotateCcw, Repeat } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleFakturaType,
  addWarehouse,
  removeWarehouse,
  addPartner,
  removePartner,
  addProduct,
  toggleConsolidated,
  removeProduct,
  addWarehouse2,
  removeWarehouse2,
} from "../../../../../app/store/universalFilterSlice";
import { useTranslation } from "react-i18next";
import SelectInput from "../../../../UI/Universal/SelectInput";
import { useEffect, useState, useRef } from "react";
import myAxios from "../../../../axios";
import MultipleSelectInputs from "../../../../UI/Universal/MultipleSelectInputs";
import { fetchWarehouses } from "../../../../fetchs/optionsFetchers";
import XrowList from "../../../../UI/Universal/XrowList";
import SearchInputWithLiBackend from "../../../../UI/Universal/SearchInputWithLiBackend";
import { Package } from "lucide-react";
import LoadingSpin from "../../../../UI/LoadingSpin";

const UniversalFilterFilter = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const fakturaTypes = useSelector((state) => state.fakturaFilter.faktura_type);

  const isChecked = (type) => fakturaTypes.includes(type);

  const [listWarehouses, setListWarehouses] = useState([]);
  const [listWarehouses2, setListWarehouses2] = useState([]);

  const { warehouses, partners, products, consolidated, warehouses2 } = useSelector((state) => state.fakturaFilter);

  const partnerInputRef = useRef(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    dispatch(addPartner(selectedPartner));
  }, [selectedPartner]);
  const deletePartner = (partner_id) => {
    dispatch(removePartner(partner_id));
  };

  const productInputRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(addProduct(selectedProduct));
  }, [selectedProduct]);
  const deleteProduct = (product_id) => {
    dispatch(removeProduct(product_id));
  };

  useEffect(() => {
    const loads = async () => {
      const allWarehouses = await fetchWarehouses();
      setListWarehouses(allWarehouses);
    };
    loads();
  }, []);

  useEffect(() => {
    const loads = async () => {
      const allWarehouses2 = await fetchWarehouses();
      setListWarehouses2(allWarehouses2);
    };
    loads();
  }, []);

  const selectAllWarehouses = () => {
    listWarehouses.forEach((w) => dispatch(addWarehouse(w)));
  };
  const clearAllWarehouses = () => {
    warehouses.forEach((w) => dispatch(removeWarehouse(w.id)));
  };

  const selectAllWarehouses2 = () => {
    listWarehouses2.forEach((w) => dispatch(addWarehouse2(w)));
  };
  const clearAllWarehouses2 = () => {
    warehouses2.forEach((w) => dispatch(removeWarehouse2(w.id)));
  };

  const checkboxStyle = "flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md";

  console.log("fakturaTypes", fakturaTypes);

  return (
    <div className="mt-3">
      <div className="text-xl font-semibold mb-4 text-gray-400 text-center">{t("operations filter")}</div>

      <div className="flex flex-wrap gap-2">
        {/* Приход */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition">
          <input type="checkbox" checked={isChecked("prihod")} onChange={() => dispatch(toggleFakturaType("prihod"))} className="accent-green-500 w-4 h-4" />
          <ArrowDownCircle size={16} className="text-green-500" />
          <span className="text-green-400 text-sm font-medium">{t("prihod")}</span>
        </label>

        {/* Расход */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition">
          <input type="checkbox" checked={isChecked("rashod")} onChange={() => dispatch(toggleFakturaType("rashod"))} className="accent-blue-500 w-4 h-4" />
          <ArrowUpCircle size={16} className="text-blue-500" />
          <span className="text-blue-400 text-sm font-medium">{t("rashod")}</span>
        </label>

        {/* Возврат */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition">
          <input type="checkbox" checked={isChecked("wozwrat")} onChange={() => dispatch(toggleFakturaType("wozwrat"))} className="accent-red-500 w-4 h-4" />
          <RotateCcw size={16} className="text-red-500" />
          <span className="text-red-400 text-sm font-medium">{t("wozwrat")}</span>
        </label>

        {/* Со склада на склад */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition">
          <input type="checkbox" checked={isChecked("transfer")} onChange={() => dispatch(toggleFakturaType("transfer"))} className="accent-purple-500 w-4 h-4" />
          <Repeat size={16} className="text-purple-500" />
          <span className="text-purple-400 text-sm font-medium">{t("transfer")}</span>
        </label>
      </div>

      {fakturaTypes.length > 0 && (
        <div>
          <hr className="mt-5 mb-5" />
          {fakturaTypes.length > 0 && fakturaTypes.includes("transfer") && (
            <div className="mt-2 flex flex-col gap-3">
              <div>
                <MultipleSelectInputs
                  title={t("from warehouse")}
                  list={listWarehouses}
                  choosedList={warehouses}
                  toggle={(w) => (warehouses.some((x) => x.id === w.id) ? dispatch(removeWarehouse(w.id)) : dispatch(addWarehouse(w)))}
                  toggleSelectAll={selectAllWarehouses}
                  toggleClearAll={clearAllWarehouses}
                  onlyDark={true}
                />
                {warehouses.length > 0 && <XrowList list={warehouses} icon="🏬" deleteItem={(id) => dispatch(removeWarehouse(id))} onlyDark={true} />}
              </div>

              <div>
                <MultipleSelectInputs
                  title={t("to warehouse")}
                  list={listWarehouses2}
                  choosedList={warehouses2}
                  toggle={(w) => (warehouses2.some((x) => x.id === w.id) ? dispatch(removeWarehouse2(w.id)) : dispatch(addWarehouse2(w)))}
                  toggleSelectAll={selectAllWarehouses2}
                  toggleClearAll={clearAllWarehouses2}
                  onlyDark={true}
                />
                {warehouses2.length > 0 && <XrowList list={warehouses2} icon="🏬" deleteItem={(id) => dispatch(removeWarehouse2(id))} onlyDark={true} />}
              </div>
            </div>
          )}

          {fakturaTypes.length > 0 && !fakturaTypes.includes("transfer") && (
            <div className="mt-2">
              <MultipleSelectInputs
                title={t("warehouses")}
                list={listWarehouses}
                choosedList={warehouses}
                toggle={(w) => (warehouses.some((x) => x.id === w.id) ? dispatch(removeWarehouse(w.id)) : dispatch(addWarehouse(w)))}
                toggleSelectAll={selectAllWarehouses}
                toggleClearAll={clearAllWarehouses}
                onlyDark={true}
              />
              {warehouses.length > 0 && <XrowList list={warehouses} icon="🏬" deleteItem={(id) => dispatch(removeWarehouse(id))} onlyDark={true} />}
            </div>
          )}

          <hr className="mt-5 mb-5" />

          <div className="mt-2">
            <SearchInputWithLiBackend
              asyncSearch={async (query) => {
                try {
                  const res = await myAxios.get("/search-partner-for-backend-input-search", {
                    params: {
                      q: query, // exclude already selected partners
                    },
                  });
                  return res.data; // ожидаем массив объектов { id, name, ... }
                } catch (err) {
                  console.error(err);
                  return [];
                }
              }}
              ref={partnerInputRef}
              placeholderText="search partner"
              labelText="partner"
              selectedObject={selectedPartner}
              setSelectedObject={setSelectedPartner}
              containerClass="flex flex-col"
              onlyDarkModeInputStyle={true}
              renderItemContent={(item, { active, index }) => (
                <div className="flex items-center gap-2 w-full">
                  {/* name */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-sm font-medium ${active ? "text-white" : ""}`}>{item.name}</span>
                  </div>
                </div>
              )}
            />
            {/* selected partners list */}
            {partners.length > 0 && <XrowList list={partners} icon="👥" deleteItem={deletePartner} onlyDark={true} />}
          </div>

          <hr className="mt-5 mb-5" />

          <div className="mt-2">
            <SearchInputWithLiBackend
              asyncSearch={async (query) => {
                try {
                  const res = await myAxios.get("/search-product-for-backend-input-search", {
                    params: {
                      q: query, // exclude already selected partners
                      w: warehouses.map((w) => w.id).join(","),
                    },
                  });
                  return res.data; // ожидаем массив объектов { id, name, ... }
                } catch (err) {
                  console.error(err);
                  return [];
                }
              }}
              ref={productInputRef}
              placeholderText="search product"
              labelText="product"
              selectedObject={selectedProduct}
              setSelectedObject={setSelectedProduct}
              containerClass="flex flex-col"
              onlyDarkModeInputStyle={true}
              renderItemContent={(item, { active, index }) => (
                <div className="flex items-center gap-2 w-full">
                  {/* name */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className={`text-sm font-medium ${active ? "text-white" : ""}`}>
                      <span>{item.name}</span>
                    </div>
                  </div>
                </div>
              )}
            />
            {products.length > 0 && <XrowList list={products} icon={<Package className="w-4 h-4" />} deleteItem={deleteProduct} onlyDark={true} />}
          </div>

          <hr className="mt-5 mb-5" />

          <div className="flex justify-center mt-4">
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition">
              <input type="checkbox" checked={consolidated} onChange={() => dispatch(toggleConsolidated())} className="accent-yellow-500 w-4 h-4" />
              <span className="text-yellow-400 text-sm font-medium">{t("consolidated")}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalFilterFilter;
