import { useSelector, useDispatch } from "react-redux";
import { resetAnalizProdajFilters, addWarehouse, removeWarehouse, setSelectedAnalyzType } from "../../../../../app/store/analizProdajSlice";
import { fetchWarehouses, fetchAgents } from "../../../../fetchs/optionsFetchers";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import XrowList from "../../../../UI/Universal/XrowList";
import MultipleSelectInputs from "../../../../UI/Universal/MultipleSelectInputs";
import SelectInput from "../../../../UI/Universal/SelectInput";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import LastDaysAnalysis from "./LastDaysAnalysis";




const AnalizProdajFilter = () => {
  const [listWarehouses, setListWarehouses] = useState([]);
  const { warehouses, selectedAnalyzType  } = useSelector((state) => state.analizProdajFilters);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const analyzTypes = [{id: 1, name:t("last days analysis")}]
  const analyzTypeInputRef = useRef(null)
  // const [selectedAnalyzType, setSelectedAnalyzType] = useState(null);

  // console.log("selectedAnalyzType", selectedAnalyzType);
  

  // 📊 4 типа анализа:
  // 📦 volume → по количеству
  // 💰 revenue → по выручке
  // 🏬 stock → залежавшийся товар
  // 📉 dynamics → падение относительно прошлого периода

  useEffect(() => {
    const loads = async () => {
      const allWarehouses = await fetchWarehouses();
      setListWarehouses(allWarehouses);
    };
    loads();
  }, []);

  // useEffect(() => {
  //   if (warehouses.length === 0) {
  //     dispatch(resetAnalizProdajFilters());
  //   }
  // }, [warehouses]);

  const selectAllWarehouses = () => {
    listWarehouses.forEach((w) => dispatch(addWarehouse(w)));
  };
  const clearAllWarehouses = () => {
    warehouses.forEach((w) => dispatch(removeWarehouse(w.id)));
  };

  return (
    <div className="mt-10">
      <SelectInput
        list={analyzTypes}
        labelText={t("analyze type")} // text dlya label inputa
        containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
        labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.1 } }}
        inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.1 } }}
        ref={analyzTypeInputRef}
        diasbledInput={false}
        onlyDarkModeInputStyle={true}
        selectedObject={selectedAnalyzType}
        setSelectedObject={(obj) => dispatch(setSelectedAnalyzType(obj))}
        labelIcon="📈"
        emptyOptionText="select analyze type"
      />

      {selectedAnalyzType?.id && selectedAnalyzType.id === 1 && (
        <LastDaysAnalysis />
      )}

      {/* <div className="border border-gray-300 p-1 rounded-sm mt-3">
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
      </div> */}

    </div>
  );
};

export default AnalizProdajFilter;
