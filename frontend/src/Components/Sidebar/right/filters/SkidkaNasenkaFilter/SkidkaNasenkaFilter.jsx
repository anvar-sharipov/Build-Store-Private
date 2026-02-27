import { useSelector, useDispatch } from "react-redux";
import { resetSkidkaFilters } from "../../../../../app/store/skidkaFiltersSlice";
import {
  addPartner,
  removePartner,
  addWarehouse,
  removeWarehouse,
  addAgent,
  removeAgent,
  addProduct,
  removeProduct,
  addUser,
  removeUser,
  setSortPrice,
  setPrintExcel,
  togglePrintExcel,
} from "../../../../../app/store/skidkaFiltersSlice";
import SearchInputWithLiBackend from "../../../../UI/Universal/SearchInputWithLiBackend";
import myAxios from "../../../../axios";
import { useEffect, useRef, useState } from "react";
import XrowList from "../../../../UI/Universal/XrowList";
import { fetchWarehouses, fetchAgents } from "../../../../fetchs/optionsFetchers";
import MultipleSelectInputs from "../../../../UI/Universal/MultipleSelectInputs";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import MyButton from "../../../../UI/MyButton";

const SkidkaNasenkaFilter = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { partners, warehouses, agents, products, users, sortPrice, printExcel } = useSelector((state) => state.skidkaFilters);
  const [listWarehouses, setListWarehouses] = useState([]);
  const [listAgents, setListAgents] = useState([]);

  const partnerInputRef = useRef(null);
  const userInputRef = useRef(null);
  const productInputRef = useRef(null);
  const warehousesDropdownRef = useRef(null);
  const [openAllWarehouses, setOpenAllWarehouses] = useState(false);

  useEffect(() => {
    if (warehouses.length === 0) {
      dispatch(resetSkidkaFilters());
    }
  }, [warehouses]);

  // Загрузка partners only founder
  useEffect(() => {
    const loads = async () => {
      const allWarehouses = await fetchWarehouses();
      setListWarehouses(allWarehouses);

      const allAgents = await fetchAgents();
      setListAgents(allAgents);

      // const allUsers = await fetchUsers();
      // const adminUsers = allUsers.filter((u) => u.groups.includes("admin"));
      // setListUsers(adminUsers);
    };
    loads();
  }, []);

  useEffect(() => {
    dispatch(addPartner(selectedPartner));
  }, [selectedPartner]);
  const deletePartner = (partner_id) => {
    dispatch(removePartner(partner_id));
  };

  useEffect(() => {
    dispatch(addUser(selectedUser));
  }, [selectedUser]);
  const deleteUser = (user_id) => {
    dispatch(removeUser(user_id));
  };

  useEffect(() => {
    dispatch(addProduct(selectedProduct));
  }, [selectedProduct]);
  const deleteProduct = (product_id) => {
    dispatch(removeProduct(product_id));
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
      {warehouses.length > 0 && (
        <div className="mt-3 text-gray-300 text-sm text-center flex gap-3">
          <MyButton variant="green" className="px-2" onClick={() => dispatch(setPrintExcel(true))}>
            📊 Excel
          </MyButton>
          <MyButton variant="red" className="px-2" onClick={() => dispatch(resetSkidkaFilters())}>
            {t("cancelFilter")}
          </MyButton>
        </div>
      )}

      {/* Select multiple warehouses ########################################################################################################### */}
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

      {warehouses.length > 0 && (
        <div>
          {/* Search product with current warehouse from backend ########################################################################################################### */}
          <div className="border border-gray-300 p-1 rounded-sm mt-3">
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

          {/* Search partner from backend ########################################################################################################### */}
          <div className="border border-gray-300 p-1 rounded-sm mt-3">
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

          {/* Search user from backend ########################################################################################################### */}
          <div className="border border-gray-300 p-1 rounded-sm mt-3">
            <SearchInputWithLiBackend
              asyncSearch={async (query) => {
                try {
                  const res = await myAxios.get("/search-user-for-backend-input-search", {
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
              ref={userInputRef}
              placeholderText="search kassir"
              labelText="kassir"
              selectedObject={selectedUser}
              setSelectedObject={setSelectedUser}
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
            {users.length > 0 && <XrowList list={users} icon="👥" deleteItem={deleteUser} onlyDark={true} />}
          </div>

          {/* Select multiple agents ########################################################################################################### */}
          <div className="border border-gray-300 p-1 rounded-sm mt-3">
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

          <div className="mt-2 text-sm text-gray-300 flex gap-3">
            <MyButton variant="blue" onClick={() => dispatch(setSortPrice("asc"))}>
              {t("asc")}
            </MyButton>
            <MyButton variant="blue" onClick={() => dispatch(setSortPrice("desc"))}>
              {t("desc")}
            </MyButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkidkaNasenkaFilter;
