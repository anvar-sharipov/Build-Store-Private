import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchInputLikeRezka = forwardRef((props, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  // Синхронизируем состояние с props.value
  useEffect(() => {
    if (props.value && props.value !== '') {
      setIsExpanded(true);
    } else if (props.value === '') {
      // Не закрываем сразу, если input в фокусе
      if (document.activeElement !== inputRef.current) {
        setIsExpanded(false);
      }
    }
  }, [props.value]);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  const handleBlur = (e) => {
    // Вызываем оригинальный onBlur если есть
    if (props.onBlur) {
      props.onBlur(e);
    }
    
    // Закрываем только если нет значения
    if (!props.value || props.value === '') {
      setIsExpanded(false);
    }
  };

  const handleChange = (e) => {
    // Вызываем оригинальный onChange
    if (props.onChange) {
      props.onChange(e);
    }
  };

  // Прокидываем реф наружу
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (!isExpanded) {
        setIsExpanded(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      } else {
        inputRef.current?.focus();
      }
    },
    blur: () => {
      inputRef.current?.blur();
    },
    select: () => {
      inputRef.current?.select();
    },
    clear: () => {
      if (props.onChange) {
        props.onChange({ target: { value: '' } });
      }
    },
    isExpanded,
  }));

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <input
          {...props}
          ref={inputRef}
          type="text"
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={props.placeholder || "Поиск..."}
          className={`
            h-9 pl-4 pr-12 rounded border border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
            placeholder-gray-400 dark:placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
            focus:border-blue-300 dark:focus:border-blue-500 
            transition-all duration-300 ease-in-out
            ${isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'}
          `}
          style={{
            transform: isExpanded ? 'translateX(0)' : 'translateX(36px)',
          }}
        />
        <button
          onClick={handleToggle}
          className={`
            absolute right-0 w-9 h-9
            rounded flex items-center justify-center
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-400
          `}
          style={{
            zIndex: 10,
          }}
          type="button"
        >
          <Search
            size={16}
            className={`dark:text-gray-500 transition-transform duration-300 ${
              isExpanded ? 'rotate-90' : 'rotate-0'
            }`}
          />
        </button>
      </div>
      {isExpanded && (
        <div className="absolute inset-0 bg-blue-500 opacity-20 rounded blur-xl animate-pulse"  />
      )}
    </div>
  );
});

SearchInputLikeRezka.displayName = "SearchInputLikeRezka";

export default SearchInputLikeRezka;