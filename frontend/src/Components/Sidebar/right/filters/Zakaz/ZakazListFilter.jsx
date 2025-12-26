import { PROCHEE } from "../../../../../routes";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ZakazNavigate from "./ZakazNavigate";
import SearchInputWithLiFrontend from "../../../../UI/Universal/SearchInputWithLiFrontend";
import Xrow from "../../../../UI/Universal/Xrow";
import { useState, useEffect, useRef } from "react";
import { fetchPartners_no_pag } from "../../../../fetchs/optionsFetchers";
import { X, ImageOff, Package, User, Warehouse } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedPartner, clearSelectedPartner, setSelectedBuyer, clearSelectedBuyer } from "../../../../../app/store/zakazSlice";

const ZakazListFilter = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const zakazCount = useSelector((state) => state.zakaz.count);
  const [partners, setPartners] = useState([]);
  // const [selectedPartner, setSelectedPartner] = useState(null);

  const selectedPartner = useSelector((state) => state.zakaz.selectedPartner);
  const selectedBuyer = useSelector((state) => state.zakaz.selectedBuyer);

  const dispatch = useDispatch();

  const partnerInputRef = useRef(null);
  const buyerInputRef = useRef(null);

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

  return (
    <div className=" mt-3 w-full rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-2 shadow-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-gray-400 text-sm font-medium">{t("Всего заказов")}:</div>
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{zakazCount}</div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

      <div className="mt-3 flex flex-col gap-3">
        <div>
          {selectedPartner ? (
            <Xrow
              selectedObject={selectedPartner}
              setSelectedObject={() => dispatch(clearSelectedPartner())}
              labelText="partner" // text dlya label inputa
              containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
              labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
              inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
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
              selectedObject={selectedPartner}
              setSelectedObject={(partner) => dispatch(setSelectedPartner(partner))}
              labelIcon="👥"
              handleFuseKeys={["name"]} // поле объекта, по которому ищем
              handleFuseThreshold={0.3} // насколько строго искать
              renderLabel={(item, { active }) => (
                <>
                  <div
                    className={`
                                  w-7 h-7 flex items-center justify-center rounded-md shrink-0
                                  ${active ? "bg-white/20" : "bg-gray-700 group-hover:bg-cyan-500/20"}
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

        <div>
          {selectedBuyer ? (
            <Xrow
              selectedObject={selectedBuyer}
              setSelectedObject={() => dispatch(clearSelectedBuyer())}
              labelText="buyer" // text dlya label inputa
              containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr]" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
              labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
              inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
              focusRef={buyerInputRef} // chto focus esli X najat
              onlyDarkModeInputStyle={true}
              labelIcon="👥"
              showXText={(item) => `${item.name}`} // eto budet pokazuwatsya w label name w dannom slucahe (mojno `${item.id}. ${item.name}`)
              disabled={false}
            />
          ) : (
            <SearchInputWithLiFrontend
              list={partners} // spisok s kotorogo nado iskat
              placeholderText="search buyer" // plasholder dlya Input
              labelText="buyer" // text dlya label inputa
              containerClass="flex flex-col" //"grid grid-cols-1 items-center md:grid-cols-[70px_1fr] min-w-0" // mojno menyat style containera dlya label i input, w odin ryad ili w odnu kolonku
              labelAnimation={{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.2 } }}
              inputAnimation={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: 0.2 } }}
              ref={buyerInputRef}
              diasbledInput={false}
              onlyDarkModeInputStyle={true}
              selectedObject={selectedBuyer}
              setSelectedObject={(buyer) => dispatch(setSelectedBuyer(buyer))}
              labelIcon="👥"
              handleFuseKeys={["name"]} // поле объекта, по которому ищем
              handleFuseThreshold={0.3} // насколько строго искать
              renderLabel={(item, { active }) => (
                <>
                  <div
                    className={`
                                  w-7 h-7 flex items-center justify-center rounded-md shrink-0
                                  ${active ? "bg-white/20" : "bg-gray-700 group-hover:bg-cyan-500/20"}
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
    </div>
  );
};

export default ZakazListFilter;
