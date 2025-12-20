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

      labelIcon = "icon here",

      getItemLabel = (item) => item.name,

      handleFuseKeys = ["name"], // поле объекта, по которому ищем
      handleFuseThreshold = 0.3, // насколько строго искать
      focusAfterSelectRef = null, // focus kakogo objeckta sdelat posle selected parnter
      focusIfArrowDownRef = null,
      focusIfArrowUpRef = null,
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
            if (focusIfArrowDownRef) {
              focusIfArrowDownRef.current?.focus();
            }
          } else {
            setActiveIndex((prev) => (prev === -1 ? 0 : Math.min(prev + 1, limitedResults.length - 1)));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!limitedResults.length) {
            if (focusIfArrowUpRef) {
              focusIfArrowUpRef.current?.focus();
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

              if (focusAfterSelectRef) {
                focusAfterSelectRef.current?.focus();
              }
              // ref.current.value = getItemLabel(selectedItem);
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
            className={inputStyle}
            onChange={handleInputChange}
            value={inputValue}
            onKeyDown={handleKeyDownInput}
            autoComplete="off"
          />
          {limitedResults.length > 0 && (
            <ul className={ulStyle}>
              {limitedResults.map((item, index) => (
                <li
                  key={item.id}
                  ref={(el) => {
                    listRefs.current[index] = el;
                  }}
                  className={`px-4 py-2 cursor-pointer ${
                    index === activeIndex ? "bg-cyan-500 text-white" : onlyDarkModeInputStyle ? "hover:bg-gray-700 text-white" : "hover:bg-cyan-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    if (setSelectedObject) {
                      setSelectedObject(item);
                    }

                    setSearchResults([]);
                    setInputValue("");

                    setActiveIndex(-1);
                  }}
                >
                  <div className="flex gap-2">
                    {labelIcon && (
                      <div
                        className={`w-8 h-8 ${
                          onlyDarkModeInputStyle ? "group-hover:bg-cyan-500/20" : "group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20"
                        } group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-colors`}
                      >
                        {labelIcon}
                      </div>
                    )}
                    {getItemLabel(item)}
                  </div>
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
