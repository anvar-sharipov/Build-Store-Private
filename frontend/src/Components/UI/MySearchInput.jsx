import React from "react";
import { CiSearch } from "react-icons/ci";

const MySearchInput = React.forwardRef((props, ref) => {
  
  return (
    <div className={`relative w-full print:hidden`}>
      <CiSearch className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-300 z-10 pointer-events-none" />
      <input
        ref={ref}
        {...props}
        placeholder={props.placeholder}
        className="w-full h-9 pl-9 pr-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-300 dark:focus:border-blue-500 transition-all duration-300 ease-out transform focus:scale-[1.02]"
      />
    </div>
  );
});

MySearchInput.displayName = "MySearchInput";

export default MySearchInput;
