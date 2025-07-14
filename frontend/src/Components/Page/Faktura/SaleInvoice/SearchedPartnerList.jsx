import React from "react";
import { motion } from "framer-motion";
import { myClass } from "../../../tailwindClasses";

const SearchedPartnerList = ({
  setSelectedPartnerId,
  filteredPartners,
  setFilteredPartners,
  resultPartenrRefs,
  searchPartnerInputRef,
  setPartnerQuery,
  inputRef,
  setSelectedPartner,
}) => {
  //   React.useEffect(() => {
  //     resultPartenrRefs.current = [];
  //   }, [filteredPartners]);
  return (
    <ul className="print:hidden">
      {filteredPartners.map((p, index) => (
        <li
          className={myClass.li}
          key={p.id}
          ref={(el) => (resultPartenrRefs.current[index] = el)}
          tabIndex={0}
          onClick={() => {
            setSelectedPartner(p.name);
            setPartnerQuery(p.name);
            setSelectedPartnerId(p.id)
            setTimeout(() => {
              setFilteredPartners("");
            }, 0);
            inputRef.current?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key == "ArrowUp") {
              e.preventDefault();
              if (index === 0) {
                searchPartnerInputRef.current?.focus();
              } else {
                resultPartenrRefs.current[index - 1]?.focus();
              }
            } else if (e.key == "ArrowDown") {
              e.preventDefault();
              if (index + 1 < filteredPartners.length) {
                resultPartenrRefs.current[index + 1]?.focus();
              }
            } else if (e.key === "Enter") {
              e.preventDefault();
              // e.target.innerHTML
              setSelectedPartner(p.name);
              setPartnerQuery(p.name);
              setSelectedPartnerId(p.id)
              setTimeout(() => {
                setFilteredPartners("");
              }, 0);
              inputRef.current?.focus();
            }
          }}
        >
          {p.name} ({p.type_display})
        </li>
      ))}
    </ul>
  );
};

export default SearchedPartnerList;
