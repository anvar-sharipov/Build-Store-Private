import { useSelector, useDispatch } from "react-redux";
// import { resetSkidkaFilters } from "../../../../../app/store/skidkaFiltersSlice";
import { addPartner, removePartner, addWarehouse, removeWarehouse, addAgent, removeAgent } from "../../../../../app/store/skidkaFiltersSlice";
import SearchInputWithLiBackend from "../../../../UI/Universal/SearchInputWithLiBackend";
import myAxios from "../../../../axios";
import { useEffect, useRef, useState } from "react";
import XrowList from "../../../../UI/Universal/XrowList";
import { fetchWarehouses, fetchAgents } from "../../../../fetchs/optionsFetchers";
import MultipleSelectInputs from "../../../../UI/Universal/MultipleSelectInputs";
import { useTranslation } from "react-i18next";

const SkidkaNasenkaFilter = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const { partners, warehouses, agents } = useSelector((state) => state.skidkaFilters);
  const [listWarehouses, setListWarehouses] = useState([]);
  const [listAgents, setListAgents] = useState([]);

  const partnerInputRef = useRef(null);
  const warehousesDropdownRef = useRef(null);
  const [openAllWarehouses, setOpenAllWarehouses] = useState(false);

  // Загрузка partners only founder
  useEffect(() => {
    const loads = async () => {
      const allWarehouses = await fetchWarehouses();
      setListWarehouses(allWarehouses);

      const allAgents = await fetchAgents();
      setListAgents(allAgents);
    };
    loads();
  }, []);

  useEffect(() => {
    dispatch(addPartner(selectedPartner));
  }, [selectedPartner]);

  const deletePartner = (partner_id) => {
    dispatch(removePartner(partner_id));
  };

  //   console.log(partners, users, agents, products, categories, warehouses, only, sortPrice);

  const selectAllWarehouses = () => {
    listWarehouses.forEach((w) => dispatch(addWarehouse(w)));
  };

  const clearAllWarehouses = () => {
    warehouses.forEach((w) => dispatch(removeWarehouse(w.id)));
  };

  const selectAllAgents = () => {
    listAgents.forEach((a) => dispatch(addAgent(a)));
  };

  const clearAllAgents = () => {
    agents.forEach((a) => dispatch(removeAgent(a.id)));
  };

  return (
    <div>
      {/* Search partner from backend */}
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
              <span className={`text-sm font-medium truncate ${active ? "text-white" : ""}`}>{item.name}</span>
            </div>
          </div>
        )}
      />

      {/* selected partners list */}
      {partners.length > 0 && <XrowList list={partners} icon="👥" deleteItem={deletePartner} onlyDark={true} />}

      {/* Select multiple warehouses */}
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

      {/* Select multiple agents */}
      <MultipleSelectInputs
        title={t("agents")}
        list={listAgents}
        choosedList={agents}
        toggle={(w) => (agents.some((x) => x.id === w.id) ? dispatch(removeAgent(w.id)) : dispatch(addAgent(w)))}
        toggleSelectAll={selectAllAgents}
        toggleClearAll={clearAllAgents}
        onlyDark={true}
      />
      {/* selected agents list */}
      {agents.length > 0 && <XrowList list={agents} icon="👥" deleteItem={(id) => dispatch(removeAgent(id))} onlyDark={true} />}
    </div>
  );
};

export default SkidkaNasenkaFilter;
