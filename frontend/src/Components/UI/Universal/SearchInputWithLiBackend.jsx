import React, { useState, useRef, useEffect, useId } from "react";
import { motion } from "framer-motion";
import useDebounce from "../../../hooks/useDebounce";

const SearchInputWithLiBackend = ({
  asyncSearch, // async (query) => [{ id, name, ... }]
  placeholderText = "Search...",
  labelText = "Search",
  selectedObject = null,
  setSelectedObject = null,
  focusAfterSelectRef = null, // куда фокус после выбора
  containerClass = "grid grid-cols-1 items-center md:grid-cols-[70px_1fr]",
  labelIcon = "📦",
  labelAnimation = {},
  inputAnimation = {},
}) => {
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const listRefs = useRef([]);
  const reactId = useId();
  const inputId = `backend-search-input-${reactId}`;

  const debouncedValue = useDebounce(inputValue, 300);

  const inputStyle =
    "h-11 pl-11 pr-4 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-600 w-full";

  const labelStyle = "text-sm font-semibold text-gray-700 dark:text-gray-300";

  const ulStyle = "absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl mt-1 max-h-60 overflow-auto shadow-lg";

  useEffect(() => {
    if (!debouncedValue) {
      setSearchResults([]);
      setActiveIndex(-1);
      return;
    }

    const doSearch = async () => {
      if (asyncSearch) {
        try {
          const results = await asyncSearch(debouncedValue);
          setSearchResults(results);
          setActiveIndex(-1);
        } catch (err) {
          console.error(err);
          setSearchResults([]);
        }
      }
    };

    doSearch();
  }, [debouncedValue, asyncSearch]);

  const limitedResults = searchResults.slice(0, 20);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev === limitedResults.length - 1 ? 0 : prev + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? limitedResults.length - 1 : prev - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) {
          const selectedItem = limitedResults[activeIndex];
          setSelectedObject && setSelectedObject(selectedItem);
          setInputValue("");
          setSearchResults([]);
          setActiveIndex(-1);
          focusAfterSelectRef?.current?.focus();
        }
        break;
      case "Escape":
        setSearchResults([]);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRefs.current[activeIndex]) {
      listRefs.current[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, limitedResults]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSearchResults([]);
        setActiveIndex(-1);
        // setTimeout(() => {
        //     ref.current?.value = ""
        // }, 0);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    listRefs.current = [];
  }, [limitedResults]);

  return (
    <div className={containerClass}>
      <motion.label {...labelAnimation} htmlFor={inputId} className={`${labelStyle} print:!text-black`}>
        {labelText}:
      </motion.label>
      <motion.div {...inputAnimation} className="relative print:hidden" ref={wrapperRef}>
        {/* <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">{labelIcon}</div> */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <motion.input
          id={inputId}
          type="text"
          placeholder={placeholderText}
          className={inputStyle}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {limitedResults.length > 0 && (
          <ul className={ulStyle}>
            {limitedResults.map((item, index) => (
              <li
                key={item.id}
                ref={(el) => (listRefs.current[index] = el)}
                className={`px-4 py-2 cursor-pointer ${index === activeIndex ? "bg-cyan-500 text-white" : "hover:bg-cyan-100 dark:hover:bg-gray-700"}`}
                onClick={() => {
                  setSelectedObject && setSelectedObject(item);
                  setInputValue("");
                  setSearchResults([]);
                  setActiveIndex(-1);
                  focusAfterSelectRef?.current?.focus();
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default SearchInputWithLiBackend;
