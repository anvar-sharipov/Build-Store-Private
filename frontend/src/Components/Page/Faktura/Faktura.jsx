import { useTranslation } from "react-i18next";
import FakturaAddAndSearchSection from "./sections/FakturaAddAndSearchSection";
import { useState, useEffect, useRef } from "react";
import SearchInputLikeRezka from "../../UI/SearchInputLikeRezka";

const Faktura = () => {
  const { t } = useTranslation();
  const addPurchaseIconRef = useRef(null);
  const addSalesIconRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  return (
    <div>
      <FakturaAddAndSearchSection
        t={t}
        addPurchaseIconRef={addPurchaseIconRef}
        addSalesIconRef={addSalesIconRef}
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <SearchInputLikeRezka />
    </div>
  );
};

export default Faktura;
