import { X } from "lucide-react";
import { motion } from "framer-motion";

const XrowList = ({list, icon, deleteItem, onlyDark = false }) => {
  return (
    <motion.ul
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`
            mt-1 space-y-1
            rounded-lg
            border 
            shadow-sm
            p-1
            ${onlyDark ? "border-gray-700 bg-gray-800" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"}
            `}
        >
          {list.map((item) => (
            <motion.li
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className={`
                group
                flex items-center justify-between
                gap-2
                h-9
                px-3
                rounded-md
                cursor-pointer
                transition-colors
                
                ${onlyDark ? "hover:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
        `}
            >
              {/* LEFT */}
              <div className="flex items-center gap-2 min-w-0">
                <span className={`flex-shrink-0 ${onlyDark ? "text-gray-500" : "text-gray-400 dark:text-gray-500"}`}>{icon}</span>

                <span
                  className={`
                    text-[11px] font-medium truncate
                    text-gray-900 dark:text-white
                    group-hover:text-cyan-600 dark:group-hover:text-cyan-400
                    ${onlyDark ? "group-hover:text-cyan-400 text-white" : "text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400"}
                    `}
                  title={item.name}
                >
                  {item.name}
                </span>
              </div>

              {/* RIGHT — select */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteItem(item.id)}
                className={`
                    flex-shrink-0
                    w-6 h-6
                    rounded-md
                    flex items-center justify-center
                    transition
                    focus:outline-none
                    focus:ring-1
                    focus:ring-cyan-500

                    text-gray-400
                    hover:text-cyan-500
                    hover:bg-gray-200
                    dark:text-gray-500
                    dark:hover:text-cyan-400
                    dark:hover:bg-gray-600
                    ${onlyDark ? "text-gray-500 hover:text-cyan-400 hover:bg-gray-600" : "text-gray-400 hover:text-cyan-500 hover:bg-gray-200 dark:text-gray-500 dark:hover:text-cyan-400 dark:hover:bg-gray-600"}
                `}
              >
                <X className="w-3.5 h-3.5 print:hidden" />
              </motion.button>
            </motion.li>
          ))}
        </motion.ul>
  )
}

export default XrowList