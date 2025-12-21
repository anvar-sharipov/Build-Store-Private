import { useTranslation } from "react-i18next";
import { forwardRef, useState, useMemo, useRef, useEffect, useId } from "react";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import useDebounce from "../../../hooks/useDebounce";

const SearchInputWithLiFrontend = forwardRef(
  (
    {
      list, // spisok s kotorogo nado iskat
      placeholderText, // plasholder dlya Input
      labelText, // text dlya label inputa
      containerClass,
      labelAnimation = {},
      inputAnimation = {},
      diasbledInput = false,
      onlyDarkModeInputStyle = false,

      selectedObject = null,
      setSelectedObject = null,


      renderLabel=null,

      handleFuseKeys = ["name"], // поле объекта, по которому ищем
      handleFuseThreshold = 0.3, // насколько строго искать

      refsFocusAfterSelect = null,
      refsFocusAfterArrowUp = null,

      focusAfterSelectRef = null, // focus kakogo objeckta sdelat posle selected parnter
      focusIfArrowDownRef = null,
      focusIfArrowUpRef = null,

      renderItem = null,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [searchResults, setSearchResults] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null); // Добавь один общий ref для всего автокомплита: nujno dlya Закрытие списка при клике вне компонента wrapperRef
    const listRefs = useRef([]);

    const reactId = useId();
    const inputId = `search-input-${reactId}`;

    const [inputValue, setInputValue] = useState("");
    const debouncedValue = useDebounce(inputValue, 300);

    // Определяем стили инпута
    const inputStyle = onlyDarkModeInputStyle
      ? `h-11 pl-11 pr-4 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 
       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 
       focus:border-cyan-500 transition-all duration-300 hover:border-gray-600 
       disabled:opacity-50 disabled:cursor-not-allowed w-full`
      : `h-11 pl-11 pr-4 bg-white dark:bg-gray-900/50 border border-gray-300 
       dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 
       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 
       focus:border-cyan-500 transition-all duration-300 hover:border-gray-400 
       dark:hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed w-full ${diasbledInput ? "cursor-not-allowed opacity-60" : ""}`;

    const labelStyle = onlyDarkModeInputStyle ? `text-sm font-semibold text-gray-300` : `text-sm font-semibold text-gray-700 dark:text-gray-300`;

    const ulStyle = onlyDarkModeInputStyle
      ? `absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-xl mt-1 max-h-60 overflow-auto shadow-lg`
      : `absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl mt-1 max-h-60 overflow-auto shadow-lg`;

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    // Ограничение результатов w li
    const MAX_RESULTS = 20;
    const limitedResults = useMemo(() => {
      return searchResults.slice(0, MAX_RESULTS);
    }, [searchResults]);

    const fuse = useMemo(() => {
      return new Fuse(list || [], {
        keys: handleFuseKeys, // поле объекта, по которому ищем
        threshold: handleFuseThreshold, // насколько строго искать
      });
    }, [list, handleFuseKeys, handleFuseThreshold]);
    useEffect(() => {
      if (!debouncedValue) {
        setSearchResults([]);
        setActiveIndex(-1);
        return;
      }

      const results = fuse.search(debouncedValue).map((r) => r.item);
      setSearchResults(results);
      setActiveIndex(-1);
    }, [debouncedValue, fuse]);

    const handleKeyDownInput = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!limitedResults.length) {
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
            setActiveIndex((prev) => (prev === -1 ? 0 : Math.min(prev + 1, limitedResults.length - 1)));
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
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : limitedResults.length - 1));
          }

          break;
        case "Enter":
          e.preventDefault();
          if (limitedResults.length) {
            if (activeIndex >= 0) {
              const selectedItem = limitedResults[activeIndex];

              if (setSelectedObject) {
                setSelectedObject(selectedItem);
              }

              if (refsFocusAfterSelect) {
                if (!refsFocusAfterSelect.ref1?.value?.id) {
                  refsFocusAfterSelect.ref1?.ref?.current?.focus();
                } else if (!refsFocusAfterSelect.ref2?.value?.id) {
                  refsFocusAfterSelect.ref2?.ref?.current?.focus();
                } else if (!refsFocusAfterSelect.ref3?.value?.id) {
                  refsFocusAfterSelect.ref3?.ref?.current?.focus();
                }
              }

              setSearchResults([]);

              setInputValue("");

              setActiveIndex(-1);
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

    // Если список длинный — активный элемент должен сам прокручиваться.
    useEffect(() => {
      if (activeIndex >= 0 && listRefs.current[activeIndex]) {
        listRefs.current[activeIndex].scrollIntoView({
          block: "nearest",
        });
      }
    }, [activeIndex, limitedResults]);

    // Закрытие списка при клике вне компонента
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (!wrapperRef.current) return;
        if (!wrapperRef.current.contains(e.target)) {
          setSearchResults([]);
          setActiveIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // listRefs.current стоит чистить при изменении списка, а то refs копятся, если список сильно меняется. Добавь:
    useEffect(() => {
      listRefs.current = [];
    }, [limitedResults]);

    return (
      <div className={containerClass}>
        <motion.label {...labelAnimation} htmlFor={inputId} className={`${labelStyle} print:!text-black`}>
          {t(labelText)}:
        </motion.label>

        <motion.div {...inputAnimation} className="relative print:hidden" ref={wrapperRef}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <motion.input
            whileFocus={{ scale: 1.01 }}
            id={inputId}
            ref={ref}
            type="text"
            placeholder={t(placeholderText)}
            disabled={diasbledInput}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownInput}
            autoComplete="off"
            className={`h-9 w-full pl-9 pr-3 text-sm rounded-lg border transition placeholder-gray-400
              ${
                diasbledInput
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700"
                  : "bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:border-gray-600"
              }
          `}
          />
          {limitedResults.length > 0 && (
            <ul className={ulStyle}>
              {limitedResults.map((item, index) => (
                <li
                  key={item.id}
                  ref={(el) => (listRefs.current[index] = el)}
                  className={`
                      group
                      px-3 py-1.5
                      text-xs
                      leading-tight
                      cursor-pointer
                      flex items-center gap-2
                      border-b border-gray-200 dark:border-gray-700
                      ${index === activeIndex ? "bg-cyan-500 text-white" : onlyDarkModeInputStyle ? "hover:bg-gray-700 text-gray-100" : "hover:bg-cyan-100 dark:hover:bg-gray-700"}
                  `}
                  onClick={() => {
                    if (setSelectedObject) setSelectedObject(item);

                    if (refsFocusAfterSelect) {
                      if (!refsFocusAfterSelect.ref1?.value?.id) {
                        refsFocusAfterSelect.ref1?.ref?.current?.focus();
                      } else if (!refsFocusAfterSelect.ref2?.value?.id) {
                        refsFocusAfterSelect.ref2?.ref?.current?.focus();
                      } else if (!refsFocusAfterSelect.ref3?.value?.id) {
                        refsFocusAfterSelect.ref3?.ref?.current?.focus();
                      }
                    }

                    setSearchResults([]);
                    setInputValue("");
                    setActiveIndex(-1);
                  }}
                >
                  {renderLabel &&
                    renderLabel(item, {
                      index,
                      active: index === activeIndex,
                    })}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    );
  }
);

SearchInputWithLiFrontend.displayName = "SearchInputWithLiFrontend";

export default SearchInputWithLiFrontend;
