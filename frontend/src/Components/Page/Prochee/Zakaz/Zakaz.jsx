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
import { X, ImageOff, Package, User } from "lucide-react";
import { formatNumber2 } from "../../../UI/formatNumber2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
  const productInputRef = useRef(null);

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
        // console.log(res.data.data);
        const results = res.data.data 
        if (results.length > 0) {
          setSelectedWarehouse(results[0])
        }
        setWarehouses(results);
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

  useEffect(() => {
    console.log("selectedProduct", selectedProduct);
  }, [selectedProduct]);

  return (
    <div>
      <div className="p-4 print:hidden">
        <motion.div
          className="flex justify-between border-b-2 border-gray-300 mb-3"
          initial={{ opacity: 0, y: -20 }} // стартовые значения
          animate={{ opacity: 1, y: 0 }} // анимация при монтировании
          // exit={{ opacity: 0, y: -10 }} // анимация при размонтировании
          transition={{ duration: 0.6 }} // длительность анимации
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
                <div className="grid grid-cols-[2fr_3fr] gap-4">
                  <div className="min-w-0 border-r border-gray-300 dark:border-gray-700 pr-4">
                    <div className="flex flex-col gap-2">
                      {/* warehouse search */}
                      {selectedWarehouse ? (
                        <Xrow
                          selectedObject={selectedWarehouse}
                          setSelectedObject={setSelectedWarehouse}
                          labelText="warehouse" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.1 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.1 } }}
                          focusRef={warehouseInputRef} // chto focus esli X najat
                          onlyDarkModeInputStyle={false}
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
                          onlyDarkModeInputStyle={false}
                          selectedObject={selectedWarehouse}
                          setSelectedObject={setSelectedWarehouse}
                          labelIcon="🏭"
                          emptyOptionText="youNeedSelectWarehouse"
                          refsFocusAfterSelect={{
                            ref1: { ref: partnerInputRef, value: selectedPartner },
                            ref2: { ref: buyerInputRef, value: selectedBuyer },
                            ref3: { ref: productInputRef, value: selectedProduct },
                          }}
                        />
                      )}

                      {/* partner search */}
                      {selectedPartner?.id ? (
                        <Xrow
                          selectedObject={selectedPartner}
                          setSelectedObject={setSelectedPartner}
                          labelText="partner" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
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
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr] min-w-0" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
                          ref={partnerInputRef}
                          diasbledInput={false}
                          onlyDarkModeInputStyle={false}
                          selectedObject={selectedPartner}
                          setSelectedObject={setSelectedPartner}
                          labelIcon="👥"
                          handleFuseKeys={["name"]} // поле объекта, по которому ищем
                          handleFuseThreshold={0.3} // насколько строго искать
                          refsFocusAfterSelect={{
                            // eto mojno ispolzowat i w focus pri wybore i pri arrow down
                            ref1: { ref: buyerInputRef, value: selectedBuyer },
                            ref2: { ref: productInputRef, value: selectedProduct },
                          }}
                          refsFocusAfterArrowUp={null}
                          renderLabel={(item, { active }) => (
                            <>
                              <div
                                className={`
                                  w-7 h-7 flex items-center justify-center rounded-md shrink-0
                                  ${active ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/20"}
                                `}
                              >
                                <User className="w-4 h-4" />
                              </div>

                              <span className={`truncate ${active ? "text-white" : ""}`}>{item.name}</span>
                            </>
                          )}
                        />
                      )}

                      {/* buyer search */}
                      {selectedBuyer ? (
                        <Xrow
                          selectedObject={selectedBuyer}
                          setSelectedObject={setSelectedBuyer}
                          labelText="buyer" // text dlya label inputa
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.3 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.3 } }}
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
                          containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr] min-w-0" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
                          labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.3 } }}
                          inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.3 } }}
                          ref={buyerInputRef}
                          diasbledInput={false}
                          onlyDarkModeInputStyle={false}
                          selectedObject={selectedBuyer}
                          setSelectedObject={setSelectedBuyer}
                          labelIcon="👥"
                          handleFuseKeys={["name"]} // поле объекта, по которому ищем
                          handleFuseThreshold={0.3} // насколько строго искать
                          refsFocusAfterSelect={{
                            // eto mojno ispolzowat i w focus pri wybore i pri arrow down
                            ref1: { ref: productInputRef, value: selectedProduct },
                          }}
                          refsFocusAfterArrowUp={{
                            // eto mojno ispolzowat i w focus pri wybore i pri arrow down
                            ref1: { ref: partnerInputRef, value: selectedPartner },
                          }}
                          renderLabel={(item, { active }) => (
                            <>
                              <div
                                className={`
                                  w-7 h-7 flex items-center justify-center rounded-md shrink-0
                                  ${active ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/20"}
                                `}
                              >
                                <User className="w-4 h-4" />
                              </div>

                              <span className={`truncate ${active ? "text-white" : ""}`}>{item.name}</span>
                            </>
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    {/* product search */}
                    <SearchInputWithLiBackend
                      asyncSearch={async (query) => {
                        try {
                          const res = await myAxios.get("/search-product-for-zakaz-input-search", {
                            params: { q: query, w: selectedWarehouse?.id },
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
                      labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.4 } }}
                      inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.4 } }}
                      onlyDarkModeInputStyle={false}
                      refsFocusAfterSelect={null}
                      refsFocusAfterArrowUp={{
                        ref1: { ref: buyerInputRef, value: selectedBuyer },
                        ref2: { ref: partnerInputRef, value: selectedPartner },
                      }}
                      disabled={selectedWarehouse?.id ? false : true}
                      disableMessage={selectedWarehouse?.id ? "Поле недоступно" : "forSearchProductShooseWarehouse"}
                      renderItemContent={(item, { active, index }) => (
                        <div className="flex items-center gap-2 w-full">
                          {item.image ? (
                            <img src={`${BASE_URL}${item.image}`} alt={item.name || "item"} className={`w-9 h-9 object-cover rounded-md shrink-0 ${active ? "ring-1 ring-white/40" : ""}`} />
                          ) : (
                            <div
                              className={`w-9 h-9 flex items-center justify-center rounded-md shrink-0
                                ${active ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/20"}`}
                            >
                              <ImageOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}

                          {/* name */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-sm font-medium truncate ${active ? "text-white" : ""}`}>{item.name}</span>
                          </div>

                          {/* quantity */}
                          <div className="shrink-0 text-right">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-md
                                ${
                                  item.quantity > 0
                                    ? active
                                      ? "bg-white/20 text-white"
                                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                            >
                              {formatNumber2(item.quantity)}
                            </span>
                          </div>
                        </div>
                      )}
                    />

                    <div className="overflow-x-auto rounded-xl border border-black dark:border-gray-700 mt-7">
                      <table className="min-w-full text-xs text-gray-700 dark:text-gray-200 border border-black dark:border-gray-700 border-collapse">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
                          <tr>
                            <th className="px-2 py-2 text-center w-10 border border-black dark:border-gray-700">№</th>
                            <th className="px-3 py-2 text-left border border-black dark:border-gray-700">Наименование товара</th>
                            <th className="px-2 py-2 text-center w-24 border border-black dark:border-gray-700">Ед.</th>
                            <th className="px-2 py-2 text-right w-20 border border-black dark:border-gray-700">Кол-во</th>
                            <th className="px-2 py-2 text-right w-24 border border-black dark:border-gray-700">Цена</th>
                            <th className="px-2 py-2 text-right w-24 border border-black dark:border-gray-700">Сумма</th>
                            <th className="px-2 py-2 text-right w-16 border border-black dark:border-gray-700">Кг</th>
                            <th className="px-2 py-2 text-right w-16 border border-black dark:border-gray-700">Куб</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="px-2 py-1 text-center border border-black dark:border-gray-700">1</td>
                            <td className="px-3 py-1 truncate max-w-xs border border-black dark:border-gray-700">Товар пример длинного названия</td>
                            <td className="px-2 py-1 text-center border border-black dark:border-gray-700">шт</td>
                            <td className="px-2 py-1 text-right border border-black dark:border-gray-700">10</td>
                            <td className="px-2 py-1 text-right border border-black dark:border-gray-700">120.00</td>
                            <td className="px-2 py-1 text-right font-medium border border-black dark:border-gray-700">1200.00</td>
                            <td className="px-2 py-1 text-right border border-black dark:border-gray-700">2.5</td>
                            <td className="px-2 py-1 text-right border border-black dark:border-gray-700">0.12</td>
                          </tr>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="px-2 py-1 text-center border border-black dark:border-gray-700">1</td>
                            <td className="px-3 py-1 truncate max-w-xs border border-black dark:border-gray-700">Товар пример длинного названия</td>
                            <td className="px-2 py-1 text-center border border-black dark:border-gray-700">шт</td>
                            <td className="px-2 py-1 text-right border border-black dark:border-gray-700">10</td>
                            <td className="px-2 py-1 text-right border border-black dark:border-gray-700">120.00</td>
                            <td className="px-2 py-1 text-right font-medium border border-black dark:border-gray-700">1200.00</td>
                            <td className="px-2 py-1 text-right border border-black dark:border-gray-700">2.5</td>
                            <td className="px-2 py-1 text-right border border-black dark:border-gray-700">0.12</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <button type="submit">{t("Save")}</button>
              </Form>
            );
          }}
        </Formik>
      </div>
      <div className="hidden print:block">
        <div className="flex justify-between border-b-2 border-gray-300 mb-3">
          <div>
            <img src="/polisem.png" alt="polisem-icon" className="h-12 lg:h-14 w-auto" />
          </div>
          <h2 className="self-end mb-0 text-xl font-bold text-center print:!text-black">{t("Create zakaz")}</h2>
          <div className="self-end mb-0 text-sm font-bold text-gray-900 dark:text-white truncate print:!text-black">{MyFormatDate(dateProwodok)}</div>
        </div>

        {selectedWarehouse?.id && (
          <Xrow
            selectedObject={selectedWarehouse}
            setSelectedObject={setSelectedWarehouse}
            labelText="warehouse" // text dlya label inputa
            containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
            labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.1 } }}
            inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.1 } }}
            focusRef={warehouseInputRef} // chto focus esli X najat
            onlyDarkModeInputStyle={false}
            labelIcon="🏭"
            showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
          />
        )}

        {selectedPartner?.id && (
          <Xrow
            selectedObject={selectedPartner}
            setSelectedObject={setSelectedPartner}
            labelText="partner" // text dlya label inputa
            containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
            labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
            inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
            focusRef={partnerInputRef} // chto focus esli X najat
            onlyDarkModeInputStyle={false}
            labelIcon="👥"
            showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
            disabled={false}
          />
        )}

        {selectedBuyer?.id && (
          <Xrow
            selectedObject={selectedBuyer}
            setSelectedObject={setSelectedBuyer}
            labelText="buyer" // text dlya label inputa
            containerClass="grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
            labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.3 } }}
            inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.3 } }}
            focusRef={buyerInputRef} // chto focus esli X najat
            onlyDarkModeInputStyle={false}
            labelIcon="👥"
            showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
          />
        )}
      </div>
    </div>
  );
};

export default Zakaz;
