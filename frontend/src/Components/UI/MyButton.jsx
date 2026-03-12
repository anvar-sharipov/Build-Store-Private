import React, { forwardRef } from "react";
import { motion } from "framer-motion";

const sizeClasses = {
  sm: "text-sm px-3 py-1 rounded-md",
  md: "text-sm px-4 py-2 rounded-lg",
  lg: "text-base px-5 py-2.5 rounded-xl",
};

const baseClasses = "inline-flex items-center gap-1 transition focus:outline-none focus:ring-2 focus:ring-offset-2";

const MyButton = forwardRef(({ children, variant = "blue", size = "md", disabled = false, className = "", onlyDark = false, ...props }, ref) => {
  
  let variantClasses = {
      green: "border-2 border-green-500 hover:bg-green-500 hover:text-white focus:ring-green-500",
      blue: "border-2 border-blue-500 hover:bg-blue-500 hover:text-white focus:ring-blue-500",
      red: "border-2 border-red-500 hover:bg-red-500 hover:text-white focus:ring-red-500",
      gray: "border-2 border-gray-500 hover:bg-gray-500 hover:text-white focus:ring-gray-500",
      disabled: "bg-gray-400 cursor-not-allowed border-gray-400",
    };
  if (onlyDark) {
    variantClasses = {
      green: "border-2 border-green-500 hover:bg-green-500 hover:text-white focus:ring-green-500 text-gray-500",
      blue: "border-2 border-blue-500 hover:bg-blue-500 hover:text-white focus:ring-blue-500 text-gray-500",
      red: "border-2 border-red-500 hover:bg-red-500 hover:text-white focus:ring-red-500 text-gray-500",
      gray: "border-2 border-gray-500 hover:bg-gray-500 hover:text-white focus:ring-gray-500 text-gray-500",
      disabled: "bg-gray-400 cursor-not-allowed border-gray-400",
    };
  }
  const variantClass = variantClasses[variant] || "";
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const disabledClass = disabled ? variantClasses.disabled : "";

  const combinedClassName = `${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

  return (
    <motion.button
      ref={ref}
      className={combinedClassName}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

export default MyButton;

// import React, { forwardRef } from "react";
// import { motion } from "framer-motion";

// const variantClasses = {
//   green: "gap-1 border-2 border-green-500 rounded-md px-3 py-1 hover:bg-green-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
//   blue: "gap-1 border-2 border-blue-500 rounded-md px-3 py-1 hover:bg-blue-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
//   red: "gap-1 border-2 border-red-500 rounded-md px-3 py-1 hover:bg-red-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
//   gray: "gap-1 border-2 border-gray-500 rounded-md px-3 py-1 hover:bg-gray-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
//   disabled: "bg-gray-400 cursor-not-allowed",
// };

// const sizeClasses = {
//   sm: "text-sm px-3 py-1 rounded-md",
//   md: "text-sm px-4 py-2 rounded-lg",
//   lg: "text-base px-5 py-2.5 rounded-xl",
// };

// const MyButton = forwardRef(({ children, variant, disabled, size = "md", className = "", ...props }, ref) => {
//   const variantClass = variantClasses[variant] || "";
//   const disabledClass = disabled ? variantClasses.disabled : "";
//   const combinedClassName = `${variantClass} ${disabledClass} ${className}`.trim();

//   return (
//     <motion.button
//       ref={ref} // вот тут передаем ref дальше
//       className={combinedClassName}
//       disabled={disabled}
//       whileHover={disabled ? {} : { scale: 1.05 }}
//       whileTap={disabled ? {} : { scale: 0.95 }}
//       {...props}
//     >
//       {children}
//     </motion.button>
//   );
// });

// export default MyButton;
