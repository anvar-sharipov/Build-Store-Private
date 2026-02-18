import { useSelector, useDispatch } from "react-redux";
import { resetAnalizProdajFilters, addWarehouse, removeWarehouse, setAnalyzeBy, setComparePrevious } from "../../../../../app/store/analizProdajSlice";
import { fetchWarehouses, fetchAgents } from "../../../../fetchs/optionsFetchers";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import XrowList from "../../../../UI/Universal/XrowList";
import MultipleSelectInputs from "../../../../UI/Universal/MultipleSelectInputs";

const AnalizProdajFilter = () => {
  const [listWarehouses, setListWarehouses] = useState([]);
  const { warehouses, analyzeBy, comparePrevious } = useSelector((state) => state.analizProdajFilters);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // 📊 4 типа анализа:
  // 📦 volume → по количеству
  // 💰 revenue → по выручке
  // 🏬 stock → залежавшийся товар
  // 📉 dynamics → падение относительно прошлого периода

  useEffect(() => {
    const loads = async () => {
      const allWarehouses = await fetchWarehouses();
      setListWarehouses(allWarehouses);

      //   const allAgents = await fetchAgents();
      //   setListAgents(allAgents);

      // const allUsers = await fetchUsers();
      // const adminUsers = allUsers.filter((u) => u.groups.includes("admin"));
      // setListUsers(adminUsers);
    };
    loads();
  }, []);

  useEffect(() => {
    if (warehouses.length === 0) {
      dispatch(resetAnalizProdajFilters());
    }
  }, [warehouses]);

  const selectAllWarehouses = () => {
    listWarehouses.forEach((w) => dispatch(addWarehouse(w)));
  };
  const clearAllWarehouses = () => {
    warehouses.forEach((w) => dispatch(removeWarehouse(w.id)));
  };

  return (
    <div className="mt-10">
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
        {/* selected warehouses list */}
        {warehouses.length > 0 && <XrowList list={warehouses} icon="🏬" deleteItem={(id) => dispatch(removeWarehouse(id))} onlyDark={true} />}
      </div>

      <select
        value={analyzeBy}
        onChange={(e) => dispatch(setAnalyzeBy(e.target.value))}
        className="
    mt-3
    w-full h-9 px-3
    rounded-lg
    bg-gray-800
    border border-gray-700
    text-white text-sm
    focus:outline-none
    focus:ring-2 focus:ring-cyan-500
    hover:border-cyan-500
    transition
  "
      >
        <option value="volume" className="bg-gray-800 text-white">
          📦 По количеству
        </option>
        <option value="revenue" className="bg-gray-800 text-white">
          💰 По выручке
        </option>
        <option value="stock" className="bg-gray-800 text-white">
          🏬 Залежавшийся товар
        </option>
        <option value="dynamics" className="bg-gray-800 text-white">
          📉 Падение продаж
        </option>
      </select>

      <label className="flex items-center gap-2 mt-3 text-sm text-gray-200 cursor-pointer">
        <input
          type="checkbox"
          checked={comparePrevious}
          onChange={(e) => dispatch(setComparePrevious(e.target.checked))}
          className="
      w-4 h-4
      bg-gray-800
      border-gray-600
      rounded
      accent-cyan-500
    "
        />
        Сравнить с прошлым периодом
      </label>
    </div>
  );
};

export default AnalizProdajFilter;
