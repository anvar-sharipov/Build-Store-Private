import myAxios from "../../../../axios";
import { useState, useEffect, useRef } from "react";
import Xrow from "../../../../UI/Universal/Xrow";
import SelectInput from "../../../../UI/Universal/SelectInput";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWarehouse } from "../../../../../app/store/warehouseSlice";
import { setQuery } from "../../../../../app/store/searchQuerySlice";
import Input from "../../../../UI/Universal/Input";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";
import { setSortField } from "../../../../../app/store/ProductCardsSlice/productSortSlice";
import SearchInputWithLiFrontend from "../../../../UI/Universal/SearchInputWithLiFrontend";
import { fetchPartners_no_pag } from "../../../../fetchs/optionsFetchers";
import { setPartner, setAgent, setPrintExcel } from "../../../../../app/store/ProductCardsSlice/productSortSlice";
import { fetchAgents } from "../../../../fetchs/optionsFetchers";

const ProductCardsFilter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [partners, setPartners] = useState([]);
  const [agents, setAgents] = useState([]);
  // const [selectedPartner, setSelectedPartner] = useState(null);
  const { partner, agent } = useSelector((state) => state.productSort);

  // const { partner } = useSelector(state => state.productSort);

  // Загрузка partners only founder
  useEffect(() => {
    const loadPartners = async () => {
      const allpartner = await fetchPartners_no_pag();
      // const formatted = allpartner
      //   .filter((v) => v.type === "founder")
      //   .map((v) => ({
      //     ...v,
      //     id: String(v.id),
      //     name: v.name,
      //     type: v.type,
      //   }));
      setPartners(allpartner);
    };
    loadPartners();
  }, []);

  useEffect(() => {
    const loadAgents = async () => {
      const allagents = await fetchAgents();

      setAgents(allagents);
    };
    loadAgents();
  }, []);

  const partnerInputRef = useRef(null);
  const agentInputRef = useRef(null);

  const sortState = useSelector((state) => state.productSort);

  const query = useSelector((state) => state.search.query);

  console.log("query", query);

  const currentWarehouse = useSelector((state) => state.warehouse.currentWarehouse);

  const [warehouses, setWarehouses] = useState([]);

  //   const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const warehouseInputRef = useRef(null);

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const res = await myAxios.get("get_active_warehouses");
        const data = res.data.data;

        setWarehouses(data);

        // автоматически выбрать первый склад
        if (data.length > 0) {
          dispatch(setCurrentWarehouse(data[0]));
        }
      } catch (err) {
        console.error("Ошибка загрузки складов", err);
      }
    };

    loadWarehouses();
  }, [dispatch]);

  return (
    <div>
      {currentWarehouse ? (
        <Xrow
          selectedObject={currentWarehouse}
          setSelectedObject={(item) => dispatch(setCurrentWarehouse(item))}
          labelText="warehouse" // text dlya label inputa
          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.1 } }}
          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.1 } }}
          focusRef={warehouseInputRef} // chto focus esli X najat
          onlyDarkModeInputStyle={true}
          labelIcon="🏭"
          showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
        />
      ) : (
        <SelectInput
          list={warehouses}
          labelText="warehouse" // text dlya label inputa
          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.1 } }}
          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.1 } }}
          ref={warehouseInputRef}
          diasbledInput={false}
          onlyDarkModeInputStyle={true}
          selectedObject={currentWarehouse}
          setSelectedObject={(item) => dispatch(setCurrentWarehouse(item))}
          labelIcon="🏭"
          emptyOptionText="youNeedSelectWarehouse"
        />
      )}

      <br />

      <Input type="text" value={query} onChange={(e) => dispatch(setQuery(e.target.value))} onlyDarkModeInputStyle={true} label={`${t("product")}`} placeholder={t("enterProductName")} />

      <div className="flex flex-col gap-3 mt-3">
        <button className="flex justify-between items-center gap-2 px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-900 transition-colors" onClick={() => dispatch(setSortField("rashod"))}>
          <div>{t("sortByRashod")}</div>
          <div>{sortState.field === "rashod" ? (sortState.order === "asc" ? "↑" : "↓") : ""}</div>
        </button>

        <button className="flex justify-between items-center gap-2 px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-900 transition-colors" onClick={() => dispatch(setSortField("prihod"))}>
          <div>{t("sortByPrihod")}</div>
          <div>{sortState.field === "prihod" ? (sortState.order === "asc" ? "↑" : "↓") : ""}</div>
        </button>

        <button className="flex justify-between items-center gap-2 px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-900 transition-colors" onClick={() => dispatch(setSortField("wozwrat"))}>
          <div>{t("sortByWozwrat")}</div>
          <div>{sortState.field === "wozwrat" ? (sortState.order === "asc" ? "↑" : "↓") : ""}</div>
        </button>
      </div>

      <div className="mt-3">
        {/* partner search */}
        {partner?.id ? (
          <Xrow
            selectedObject={partner}
            setSelectedObject={(item) => dispatch(setPartner(item))}
            labelText="partner" // text dlya label inputa
            containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
            // labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
            // inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
            focusRef={partnerInputRef} // chto focus esli X najat
            onlyDarkModeInputStyle={true}
            labelIcon="👥"
            showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
            disabled={false}
          />
        ) : (
          <SearchInputWithLiFrontend
            list={partners} // spisok s kotorogo nado iskat
            placeholderText="search partner" // plasholder dlya Input
            labelText="partner" // text dlya label inputa
            containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr] min-w-0" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
            labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
            inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
            ref={partnerInputRef}
            diasbledInput={false}
            onlyDarkModeInputStyle={true}
            selectedObject={partner}
            setSelectedObject={(item) => dispatch(setPartner(item))}
            labelIcon="👥"
            handleFuseKeys={["name"]} // поле объекта, по которому ищем
            handleFuseThreshold={0.3} // насколько строго искать
            renderLabel={(item, { active }) => (
              <>
                <span className={`truncate ${active ? "text-white" : ""}`}>{item.name}</span>
              </>
            )}
          />
        )}
      </div>

      <div className="mt-3">
        {/* partner search */}
        {agent?.id ? (
          <Xrow
            selectedObject={agent}
            setSelectedObject={(item) => dispatch(setAgent(item))}
            labelText="agent" // text dlya label inputa
            containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
            // labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
            // inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
            focusRef={agentInputRef} // chto focus esli X najat
            onlyDarkModeInputStyle={true}
            labelIcon="👥"
            showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
            disabled={false}
          />
        ) : (
          <SearchInputWithLiFrontend
            list={agents} // spisok s kotorogo nado iskat
            placeholderText="search agent" // plasholder dlya Input
            labelText="agent" // text dlya label inputa
            containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr] min-w-0" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
            ref={agentInputRef}
            diasbledInput={false}
            onlyDarkModeInputStyle={true}
            selectedObject={agent}
            setSelectedObject={(item) => dispatch(setAgent(item))}
            labelIcon="👥"
            handleFuseKeys={["name"]} // поле объекта, по которому ищем
            handleFuseThreshold={0.3} // насколько строго искать
            renderLabel={(item, { active }) => (
              <>
                <span className={`truncate ${active ? "text-white" : ""}`}>{item.name}</span>
              </>
            )}
          />
        )}
      </div>
      

      <button onClick={() => dispatch(setPrintExcel(true))} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
        📊 Excel
      </button>
    </div>
  );
};

export default ProductCardsFilter;
