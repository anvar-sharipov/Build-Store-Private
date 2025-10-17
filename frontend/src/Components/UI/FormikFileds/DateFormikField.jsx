import { Field, ErrorMessage } from "formik";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

const DateFormikField = ({
  label,
  name,
  min,
  className = "",
  labelClassName = "",
  inputClassName = "",
  errorClassName = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col space-y-2 ${className}`}
    >
      {label && (
        <label
          htmlFor={name}
          className={`text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 ${labelClassName}`}
        >
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {label}
        </label>
      )}

      <div className="relative group">
        <Field name={name}>
          {({ field, meta }) => (
            <>
              <input
                {...field}
                type="date"
                id={name}
                min={min}
                className={`
                  w-full px-4 py-3 
                  bg-white dark:bg-gray-800 
                  border-2 border-gray-200 dark:border-gray-700
                  rounded-xl
                  text-gray-900 dark:text-gray-100
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  transition-all duration-300 ease-out
                  focus:outline-none 
                  focus:border-indigo-500 dark:focus:border-indigo-400
                  focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/20
                  hover:border-gray-300 dark:hover:border-gray-600
                  ${meta.touched && meta.error 
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500/10' 
                    : ''
                  }
                  ${inputClassName}
                `}
              />
              
              {/* Подсветка при фокусе */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-20 dark:group-focus-within:opacity-10 pointer-events-none transition-opacity duration-300"
                initial={false}
              />
            </>
          )}
        </Field>
      </div>

      <ErrorMessage name={name}>
        {(msg) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 ${errorClassName}`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {msg}
          </motion.div>
        )}
      </ErrorMessage>
    </motion.div>
  );
};

export default DateFormikField;