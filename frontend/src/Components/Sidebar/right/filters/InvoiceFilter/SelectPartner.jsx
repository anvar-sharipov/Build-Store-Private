import { FaTimes } from "react-icons/fa";
import Fuse from "fuse.js";
import { useMemo } from "react";
import { CiSearch } from "react-icons/ci";

const SelectPartner = ({ selectedPartner, partnerX_Ref, setSelectedPartner, setFilteredPartners, partnerListRef, allPartners, partnerInputRef, filteredPartners }) => {
  // Настраиваем Fuse
  const fuse = useMemo(
    () =>
      new Fuse(allPartners, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [allPartners]
  );
  return (
    <div>
      {selectedPartner?.id ? (
        <div>
          <div className="w-full flex items-center justify-between print:hidden my-1 mt-5">
            <div className="flex items-center gap-2 border border-gray-600 rounded-md px-2 py-1 bg-gray-800 shadow-sm flex-1">
              <span className="text-gray-100 font-medium">{selectedPartner?.name}</span>
            </div>
            {selectedPartner?.name && (
              <button
                type="button"
                ref={partnerX_Ref}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                    setSelectedPartner(null);
                    setFilteredPartners([]);
                    partnerListRef.current = [];
                    setTimeout(() => {
                      partnerInputRef.current?.focus();
                    }, 0);
                  }
                  // else if (e.key == "ArrowDown") {
                  //   e.preventDefault();
                  //   refs.productRef.current?.focus();
                  // }
                }}
                onClick={() => {
                  setSelectedPartner(null);
                  setFilteredPartners([]);
                  partnerListRef.current = [];
                  setTimeout(() => {
                    partnerInputRef.current?.focus();
                  }, 0);
                }}
                className="ml-3 p-1 rounded-full  hover:bg-red-700 
                             text-red-400 transition-colors duration-200 
                             flex items-center justify-center focus:bg-indigo-200"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1">По партнёрам</label>
          <div className={`relative w-full print:hidden`}>
            <CiSearch className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-300 z-10 pointer-events-none" />
            <input
              type="text"
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setFilteredPartners([]);
                  setTimeout(() => {
                    partnerListRef.current = [];
                  }, 0);
                  return;
                }
                const results = value
                  ? fuse
                      .search(value)
                      .slice(0, 20)
                      .map((r) => r.item)
                  : allPartners;
                setFilteredPartners(results);
              }}
              autoComplete="off"
              ref={partnerInputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                } else if (e.key == "ArrowDown") {
                  e.preventDefault();
                  if (partnerListRef.current?.length > 0) {
                    partnerListRef.current[0]?.focus();
                  }
                }
              }}
              className="w-full h-9 pl-9 pr-3 rounded border  bg-gray-800 text-gray-100  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 border-blue-300 focus:border-blue-500 transition-all duration-300 ease-out transform focus:scale-[1.005]"
            />
          </div>


          {filteredPartners.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-70 border border-black dark:border-black rounded-md shadow-sm dark:bg-white bg-gray-200 dark:text-gray-800 text-black">
              {filteredPartners.map((emp, idx) => (
                <li
                  tabIndex={0}
                  ref={(el) => (partnerListRef.current[idx] = el)}
                  key={emp.id}
                  className="px-3 cursor-pointer dark:hover:bg-blue-100 hover:bg-blue-100 border divide-y divide-black focus:bg-indigo-200"
                  onClick={() => {
                    setSelectedPartner(emp);
                    setFilteredPartners([]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      setSelectedPartner(emp);
                      setFilteredPartners([]);
                    } else if (e.key == "ArrowDown") {
                      e.preventDefault();
                      if (partnerListRef.current.length > idx + 1) {
                        partnerListRef.current[idx + 1]?.focus();
                      }
                    } else if (e.key == "ArrowUp") {
                      e.preventDefault();
                      if (idx === 0) {
                        partnerInputRef.current?.focus();
                      } else {
                        partnerListRef.current[idx - 1]?.focus();
                      }
                    }
                  }}
                >
                  {emp.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectPartner;
