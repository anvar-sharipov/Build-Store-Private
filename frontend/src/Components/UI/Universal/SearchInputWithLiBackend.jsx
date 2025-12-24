import React, { useState, useRef, useEffect, useId, forwardRef } from "react";
import { motion } from "framer-motion";
import useDebounce from "../../../hooks/useDebounce";
import { useTranslation } from "react-i18next";

const SearchInputWithLiBackend = forwardRef(
  (
    {
      asyncSearch, // async (query) => [{ id, name, ... }]
      placeholderText = "Search...",
      labelText = "Search",
      selectedObject = null,
      setSelectedObject = null,
      containerClass = "grid grid-cols-1 items-center md:grid-cols-[70px_1fr]",
      labelIcon = "📦",
      labelAnimation = {},
      inputAnimation = {},
      onlyDarkModeInputStyle = false,
      refsFocusAfterSelect = null,
      refsFocusAfterArrowUp = null,
      refsFocusAfterArrowDown = null,
      disabled = false,
      disableMessage = "Поле недоступно",
      renderItemContent = "",

      // eto chisto dlya Zakaz.jsx ne uniwersalnyy props
      selectedProducts = null,
      setFocusedCell = null,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    const [showDisableHint, setShowDisableHint] = useState(false);

    const wrapperRef = useRef(null);
    const listRefs = useRef([]);
    const reactId = useId();
    const inputId = `backend-search-input-${reactId}`;

    const debouncedValue = useDebounce(inputValue, 300);

    const inputStyle = `h-11 pl-11 pr-4 ${
      onlyDarkModeInputStyle
        ? "bg-gray-900/50 border-gray-700 text-gray-200 hover:border-gray-600"
        : "bg-white dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-600"
    } border rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 w-full`;

    const labelStyle = `text-sm font-semibold ${onlyDarkModeInputStyle ? "text-gray-300" : "text-gray-700 dark:text-gray-300"} `;

    const ulStyle = `absolute z-10 w-full ${
      onlyDarkModeInputStyle ? "bg-gray-800 border-gray-700" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
    } border  rounded-xl mt-1 max-h-60 overflow-auto shadow-lg`;

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
          if (selectedProducts && limitedResults.length === 0) {
            if (selectedProducts.length > 0) {
              e.preventDefault();
              setFocusedCell({ rowIndex: 0, field: "qty" });
            }
          } else if (!limitedResults.length) {
            if (refsFocusAfterSelect) {
              if (!refsFocusAfterSelect.ref1?.value?.id) {
                refsFocusAfterSelect.ref1?.ref?.current?.focus();
              } else if (!refsFocusAfterSelect.ref2?.value?.id) {
                refsFocusAfterSelect.ref2?.ref?.current?.focus();
              } else if (!refsFocusAfterSelect.ref3?.value?.id) {
                refsFocusAfterSelect.ref3?.ref?.current?.focus();
              }
            }
          } else {
            setActiveIndex((prev) => (prev === limitedResults.length - 1 ? 0 : prev + 1));
          }

          break;
        case "ArrowUp":
          e.preventDefault();
          if (!limitedResults.length) {
            if (refsFocusAfterArrowUp) {
              if (!refsFocusAfterArrowUp.ref1?.value?.id) {
                refsFocusAfterArrowUp.ref1?.ref?.current?.focus();
              } else if (!refsFocusAfterArrowUp.ref2?.value?.id) {
                refsFocusAfterArrowUp.ref2?.ref?.current?.focus();
              } else if (!refsFocusAfterArrowUp.ref3?.value?.id) {
                refsFocusAfterArrowUp.ref3?.ref?.current?.focus();
              }
            }
          } else {
            setActiveIndex((prev) => (prev <= 0 ? limitedResults.length - 1 : prev - 1));
          }

          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0) {
            const selectedItem = limitedResults[activeIndex];
            setSelectedObject && setSelectedObject(selectedItem);
            setInputValue("");
            setSearchResults([]);
            setActiveIndex(-1);
            if (refsFocusAfterSelect) {
              if (!refsFocusAfterSelect.ref1?.value?.id) {
                refsFocusAfterSelect.ref1?.ref?.current?.focus();
              } else if (!refsFocusAfterSelect.ref2?.value?.id) {
                refsFocusAfterSelect.ref2?.ref?.current?.focus();
              } else if (!refsFocusAfterSelect.ref3?.value?.id) {
                refsFocusAfterSelect.ref3?.ref?.current?.focus();
              }
            }
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
        <motion.label {...labelAnimation} htmlFor={inputId} className={`${labelStyle}`}>
          {t(labelText)}:
        </motion.label>
        <motion.div {...inputAnimation} className="relative" ref={wrapperRef}>
          {/* <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">{labelIcon}</div> */}
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="relative" onMouseEnter={() => disabled && setShowDisableHint(true)} onMouseLeave={() => setShowDisableHint(false)}>
            <motion.input
              id={inputId}
              ref={ref}
              type="text"
              placeholder={t(placeholderText)}
              disabled={disabled}
              value={inputValue}
              autoComplete="off"
              onChange={(e) => {
                if (!disabled) setInputValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (!disabled) handleKeyDown(e);
              }}
              className={`h-9 w-full pl-9 pr-3 text-sm rounded-lg border transition placeholder-gray-400
                ${
                  disabled
                    ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700"
                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:border-gray-600"
                }
            `}
            />

            {disabled && showDisableHint && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: -10 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 -top-2 z-50
                 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg
                 shadow-lg whitespace-nowrap"
              >
                {t(disableMessage)}
              </motion.div>
            )}
          </div>

          {limitedResults.length > 0 && (
            <ul className={ulStyle}>
              {limitedResults.map((item, index) => {
                const active = index === activeIndex; // ← ВОТ ЭТОГО НЕ ХВАТАЛО

                return (
                  <li
                    key={item.id}
                    ref={(el) => (listRefs.current[index] = el)}
                    className={`
                        group px-3 py-2 cursor-pointer transition
                        ${active ? "bg-cyan-500 text-white" : onlyDarkModeInputStyle ? "hover:bg-gray-700 text-gray-100" : "hover:bg-cyan-100 dark:hover:bg-gray-700"}
                    `}
                    onClick={() => {
                      setSelectedObject && setSelectedObject(item);
                      setInputValue("");
                      setSearchResults([]);
                      setActiveIndex(-1);

                      if (refsFocusAfterSelect) {
                        if (!refsFocusAfterSelect.ref1?.value?.id) {
                          refsFocusAfterSelect.ref1?.ref?.current?.focus();
                        } else if (!refsFocusAfterSelect.ref2?.value?.id) {
                          refsFocusAfterSelect.ref2?.ref?.current?.focus();
                        } else if (!refsFocusAfterSelect.ref3?.value?.id) {
                          refsFocusAfterSelect.ref3?.ref?.current?.focus();
                        }
                      }
                    }}
                  >
                    {renderItemContent && renderItemContent(item, { active, index })}
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </div>
    );
  }
);

SearchInputWithLiBackend.displayName = "SearchInputWithLiBackend";

export default SearchInputWithLiBackend;
