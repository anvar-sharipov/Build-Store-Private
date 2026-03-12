import Input from "../../../../UI/Universal/Input";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  setLastDaysCount,
  triggerSearch,
  triggerExcel,
  addWarehouse,
  removeWarehouse,
  setSortBrend,
  setFullList,
  addBrand,
  removeBrand,
  addCategory,
  removeCategory,
  setDontShowZero,
} from "../../../../../app/store/analizProdajSlice";
import { useSelector, useDispatch } from "react-redux";
import MyButton from "../../../../UI/MyButton";
import LoadingSpin from "../../../../UI/LoadingSpin";
import MultipleSelectInputs from "../../../../UI/Universal/MultipleSelectInputs";
import { fetchWarehouses, fetchBrands, fetchCategories } from "../../../../fetchs/optionsFetchers";
import XrowList from "../../../../UI/Universal/XrowList";
import ExcelButton from "../../../../UI/Universal/ExcelButton";

const LastDaysAnalysis = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { lastDaysCount, loading, warehouses, sortBrend, fullList, brands, categories, dontShowZero } = useSelector((state) => state.analizProdajFilters);
  const [listWarehouses, setListWarehouses] = useState([]);
  const [listBrands, setListBrands] = useState([]);
  const [listCategories, setListCategories] = useState([]);

  useEffect(() => {
    const loads = async () => {
      const allWarehouses = await fetchWarehouses();
      setListWarehouses(allWarehouses);

      const allBrands = await fetchBrands();
      setListBrands(allBrands);

      const allCategories = await fetchCategories();
      setListCategories(allCategories);
    };
    loads();
  }, []);

  const selectAllWarehouses = () => {
    listWarehouses.forEach((w) => dispatch(addWarehouse(w)));
  };
  const clearAllWarehouses = () => {
    warehouses.forEach((w) => dispatch(removeWarehouse(w.id)));
  };

  const selectAllBrands = () => {
    listBrands.forEach((w) => dispatch(addBrand(w)));
  };
  const clearAllBrands = () => {
    brands.forEach((w) => dispatch(removeBrand(w.id)));
  };

  const selectAllCategories = () => {
    listCategories.forEach((w) => dispatch(addCategory(w)));
  };
  const clearAllCategories = () => {
    categories.forEach((w) => dispatch(removeCategory(w.id)));
  };

  return (
    <div className="mt-3">
      <Input
        type="number"
        value={lastDaysCount ?? ""}
        onChange={(e) => dispatch(setLastDaysCount(e.target.value === "" ? null : Number(e.target.value)))}
        onlyDarkModeInputStyle={true}
        label={t("enter day count")}
        placeholder={t("enter day count")}
      />

      {parseFloat(lastDaysCount) > 0 && (
        <div className="mt-3">

          <div className="border border-gray-300 p-1 rounded-sm mt-3">
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

          <div className="border border-gray-300 p-1 rounded-sm mt-3">
            <MultipleSelectInputs
              title={t("brands")}
              list={listBrands}
              choosedList={brands}
              toggle={(w) => (brands.some((x) => x.id === w.id) ? dispatch(removeBrand(w.id)) : dispatch(addBrand(w)))}
              toggleSelectAll={selectAllBrands}
              toggleClearAll={clearAllBrands}
              onlyDark={true}
            />
            {brands.length > 0 && <XrowList list={brands} icon="🏬" deleteItem={(id) => dispatch(removeBrand(id))} onlyDark={true} />}
          </div>

          <div className="border border-gray-300 p-1 rounded-sm mt-3">
            <MultipleSelectInputs
              title={t("categories")}
              list={listCategories}
              choosedList={categories}
              toggle={(w) => (categories.some((x) => x.id === w.id) ? dispatch(removeCategory(w.id)) : dispatch(addCategory(w)))}
              toggleSelectAll={selectAllCategories}
              toggleClearAll={clearAllCategories}
              onlyDark={true}
            />
            {categories.length > 0 && <XrowList list={categories} icon="🏬" deleteItem={(id) => dispatch(removeCategory(id))} onlyDark={true} />}
          </div>

          <div className="mt-3 flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-200">
              <input type="checkbox" checked={sortBrend} onChange={(e) => dispatch(setSortBrend(e.target.checked))} />
              {t("sort by brand")}
            </label>
          </div>

          <div className="mt-3 flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-200">
              <input type="checkbox" checked={fullList} onChange={(e) => dispatch(setFullList(e.target.checked))} />
              {t("full list")}
            </label>
          </div>

          <div className="mt-3 flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-200">
              <input type="checkbox" checked={dontShowZero} onChange={(e) => dispatch(setDontShowZero(e.target.checked))} />
              {t("show zero")}
            </label>
          </div>

          <div className="mt-3 flex gap-3">
            <MyButton variant="green" size="sm" onlyDark={true} disabled={loading} onClick={() => dispatch(triggerSearch())}>
              {loading ? t("search") : t("search analysis")}
            </MyButton>
            {/* onClick={() => downloadExcelEntries()} disabled={downloadExcel} type="button" */}
            <ExcelButton classname="px-3 py-1" onClick={() => dispatch(triggerExcel())} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LastDaysAnalysis;
