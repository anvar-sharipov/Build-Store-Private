import myAxios from "../../../../axios";
import { useState, useEffect, useRef } from "react";
import Xrow from "../../../../UI/Universal/Xrow";
import SelectInput from "../../../../UI/Universal/SelectInput";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWarehouse } from "../../../../../app/store/warehouseSlice";
import { setQuery } from "../../../../../app/store/searchQuerySlice";
import Input from "../../../../UI/Universal/Input";
import { useTranslation } from "react-i18next";

const ProductCardsFilter = () => {
    const {t} = useTranslation();
  const dispatch = useDispatch();

  const query = useSelector((state) => state.search.query);

console.log("query", query);

  const currentWarehouse = useSelector((state) => state.warehouse.currentWarehouse);

  const [warehouses, setWarehouses] = useState([]);
  
//   const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const { warehouseInputRef } = useRef(null);

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
      {currentWarehouse  ? (
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

    <Input 
        type="text"
        value={query}
        onChange={(e) => dispatch(setQuery(e.target.value))}
        onlyDarkModeInputStyle={true}
        label={`${t("product")}`}
        placeholder = {t("enterProductName")}
    />

    </div>
  );
};

export default ProductCardsFilter;
