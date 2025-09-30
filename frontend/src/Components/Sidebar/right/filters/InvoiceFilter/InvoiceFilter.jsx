import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import myAxios from "../../../../axios";
import SelectPartner from "./SelectPartner";
import SelectEnryBoolen from "./SelectEnryBoolen";

const InvoiceFilter = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [wozwratOrPrihod, setWozwratOrPrihod] = useState(searchParams.get("wozwrat_or_prihod") || "");
  const [allPartners, setAllPartners] = useState([]);
  const partnerInputRef = useRef(null);
  const partnerListRef = useRef([]);
  const partnerX_Ref = useRef(null);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState("");

  // Загружаем сотрудников
  const fetchPartners = async () => {
    try {
      const res = await myAxios.get("/partners/?no_pagination=1");
      console.log("res.data", res.data);

      setAllPartners(res.data);
    } catch (error) {
      console.log("Ошибка при загрузке Partners", error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // При изменении фильтра обновляем URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (wozwratOrPrihod) {
      params.set("wozwrat_or_prihod", wozwratOrPrihod);
    } else {
      params.delete("wozwrat_or_prihod");
    }
    if (selectedPartner?.id) {
      params.set("partner_id", selectedPartner.id);
    } else {
      params.delete("partner_id");
    }
    if (selectedEntry === "entried" || selectedEntry === "notEntried") {
      params.set("selectedEntry", selectedEntry);
    } else {
      params.delete("selectedEntry");
    }
    setSearchParams(params);
  }, [wozwratOrPrihod, selectedPartner, selectedEntry]);

  // // Настраиваем Fuse
  // const fuse = useMemo(
  //   () =>
  //     new Fuse(allPartners, {
  //       keys: ["name"],
  //       threshold: 0.3,
  //     }),
  //   [allPartners]
  // );

  return (
    <div className="p-4 space-y-3 bg-gray-800 rounded-lg shadow">
      <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-400 mb-1">Тип фактуры</label>
        <div className="flex flex-col gap-1 bg-gray-900 border border-gray-700 rounded-lg p-2">
          {[
            { value: "", label: "Все" },
            { value: "wozwrat", label: "Возврат" },
            { value: "prihod", label: "Приход" },
            { value: "rashod", label: "Расход" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-gray-200">
              <input type="radio" name="wozwratOrPrihod" value={opt.value} checked={wozwratOrPrihod === opt.value} onChange={(e) => setWozwratOrPrihod(e.target.value)} className="accent-blue-500" />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <SelectPartner
          selectedPartner={selectedPartner}
          partnerX_Ref={partnerX_Ref}
          setSelectedPartner={setSelectedPartner}
          setFilteredPartners={setFilteredPartners}
          partnerListRef={partnerListRef}
          allPartners={allPartners}
          partnerInputRef={partnerInputRef}
          filteredPartners={filteredPartners}
        />

        <div className="mt-5">
          <SelectEnryBoolen setSelectedEntry={setSelectedEntry} selectedEntry={selectedEntry} />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilter;
