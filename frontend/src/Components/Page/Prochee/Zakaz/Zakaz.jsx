import { useTranslation } from "react-i18next";
import { DateContext } from "../../../UI/DateProvider";
import MyFormatDate from "../../../UI/MyFormatDate";
import { useContext, useEffect, useState, useRef } from "react";
import { fetchPartners_no_pag } from "../../../fetchs/optionsFetchers";
import myAxios from "../../../axios";
import { Formik, Form, Field } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import SearchInputWithLiFrontend from "../../../UI/Universal/SearchInputWithLiFrontend";
import Xrow from "../../../UI/Universal/Xrow";
import SearchInputWithLiBackend from "../../../UI/Universal/SearchInputWithLiBackend";
import SelectInput from "../../../UI/Universal/SelectInput";

const Zakaz = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);
  const [partners, setPartners] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const partnerInputRef = useRef(null);
  const buyerInputRef = useRef(null);
  const warehouseInputRef = useRef(null);

  // Загрузка partners only founder
  useEffect(() => {
    const loadPartners = async () => {
      const allpartner = await fetchPartners_no_pag();
      const formatted = allpartner
        .filter((v) => v.type === "founder")
        .map((v) => ({
          ...v,
          id: String(v.id),
          name: v.name,
          type: v.type,
        }));
      setPartners(formatted);
    };
    loadPartners();
  }, []);

  // Загрузка складов
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const res = await myAxios.get("get_active_warehouses");
        setWarehouses(res.data.data);
      } catch (err) {
        console.log("cant get warehouses");
      }
    };
    loadWarehouses();
  }, []);

  useEffect(() => {
    document.title = t("Zakazy");
    partnerInputRef.current?.focus();
  }, []);

  useEffect(() => {
    console.log("selectedPartner", selectedPartner);
  }, [selectedPartner]);

  useEffect(() => {
    console.log("selectedBuyer", selectedBuyer);
  }, [selectedBuyer]);

  return (
    <div className="p-4">
      <motion.div
        className="flex justify-between border-b-2 border-gray-300 mb-3"
        initial={{ opacity: 0, y: -20 }} // стартовые значения
        animate={{ opacity: 1, y: 0 }} // анимация при монтировании
        // exit={{ opacity: 0, y: -10 }} // анимация при размонтировании
        transition={{ duration: 1 }} // длительность анимации
      >
        <div>
          <img src="/polisem.png" alt="polisem-icon" className="h-12 lg:h-14 w-auto" />
        </div>
        <h2 className="self-end mb-0 text-xl font-bold text-center print:!text-black">{t("Create zakaz")}</h2>
        <div className="self-end mb-0 text-sm font-bold text-gray-900 dark:text-white truncate print:!text-black">{MyFormatDate(dateProwodok)}</div>
      </motion.div>

      <Formik
        initialValues={{
          partner: "",
          buyer: "",
          products: [],
        }}
        onSubmit={(values) => {
          const valuesForPost = {
            ...values,
            date: dateProwodok,
          };
          console.log(valuesForPost);
        }}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              <div className="flex flex-col gap-3">
                {/* warehouse search */}
                {selectedWarehouse ? (
                  <Xrow
                    selectedObject={selectedWarehouse}
                    setSelectedObject={setSelectedWarehouse}
                    labelText="warehouse" // text dlya label inputa
                    containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                    labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
                    inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
                    focusRef={warehouseInputRef} // chto focus esli X najat
                    onlyDarkModeInputStyle={false}
                    labelIcon="📦"
                    showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
                  />
                ) : (
                  <SelectInput
                    list={warehouses}
                    labelText="warehouse" // text dlya label inputa
                    containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                    labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
                    inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
                    ref={warehouseInputRef}
                    diasbledInput={false}
                    onlyDarkModeInputStyle={false}
                    selectedObject={selectedWarehouse}
                    setSelectedObject={setSelectedWarehouse}
                    labelIcon="🏭"
                    emptyOptionText="choose warehouse"
                  />
                )}

                {/* partner search */}
                {selectedPartner?.id ? (
                  <Xrow
                    selectedObject={selectedPartner}
                    setSelectedObject={setSelectedPartner}
                    labelText="partner" // text dlya label inputa
                    containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                    labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.4 } }}
                    inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.4 } }}
                    focusRef={partnerInputRef} // chto focus esli X najat
                    onlyDarkModeInputStyle={false}
                    labelIcon="👥"
                    showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
                    disabled={false}
                  />
                ) : (
                  <SearchInputWithLiFrontend
                    list={partners} // spisok s kotorogo nado iskat
                    placeholderText="search partner" // plasholder dlya Input
                    labelText="partner" // text dlya label inputa
                    containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                    labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.4 } }}
                    inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.4 } }}
                    ref={partnerInputRef}
                    diasbledInput={false}
                    onlyDarkModeInputStyle={false}
                    selectedObject={selectedPartner}
                    setSelectedObject={setSelectedPartner}
                    labelIcon="👥"
                    getItemLabel={(item) => item.name} // (item) => что_показать_в_input_и_li
                    handleFuseKeys={["name"]} // поле объекта, по которому ищем
                    handleFuseThreshold={0.3} // насколько строго искать
                    focusAfterSelectRef={buyerInputRef}
                    focusIfArrowDownRef={buyerInputRef}
                    focusIfArrowUpRef={null}
                  />
                )}

                {/* buyer search */}
                {selectedBuyer ? (
                  <Xrow
                    selectedObject={selectedBuyer}
                    setSelectedObject={setSelectedBuyer}
                    labelText="buyer" // text dlya label inputa
                    containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                    labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.6 } }}
                    inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.6 } }}
                    focusRef={buyerInputRef} // chto focus esli X najat
                    onlyDarkModeInputStyle={false}
                    labelIcon="👥"
                    showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
                  />
                ) : (
                  <SearchInputWithLiFrontend
                    list={partners} // spisok s kotorogo nado iskat
                    placeholderText="search buyer" // plasholder dlya Input
                    labelText="buyer" // text dlya label inputa
                    containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                    labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.6 } }}
                    inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.6 } }}
                    ref={buyerInputRef}
                    diasbledInput={false}
                    onlyDarkModeInputStyle={false}
                    selectedObject={selectedBuyer}
                    setSelectedObject={setSelectedBuyer}
                    labelIcon="👥"
                    getItemLabel={(item) => item.name} // (item) => что_показать_в_input_и_li
                    handleFuseKeys={["name"]} // поле объекта, по которому ищем
                    handleFuseThreshold={0.3} // насколько строго искать
                    focusAfterSelectRef={buyerInputRef}
                    focusIfArrowDownRef={null}
                    focusIfArrowUpRef={partnerInputRef}
                  />
                )}

                

                {/* product search */}
                <SearchInputWithLiBackend
                  asyncSearch={async (query) => {
                    try {
                      const res = await myAxios.get("/search-product-for-zakaz-input-search", {
                        params: { q: query },
                      });
                      return res.data; // ожидаем массив объектов { id, name, ... }
                    } catch (err) {
                      console.error(err);
                      return [];
                    }
                  }}
                  placeholderText="search product"
                  labelText="product"
                  selectedObject={selectedProduct}
                  setSelectedObject={setSelectedProduct}
                  labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.8 } }}
                  inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.8 } }}
                />
              </div>

              <button type="submit">{t("Save")}</button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Zakaz;
