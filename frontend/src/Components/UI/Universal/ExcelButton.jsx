import { motion } from "framer-motion";

const ExcelButton = ({ classname, ...props }) => {
  return (
    <motion.button
      {...props}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-1 px-3 py-2 ${classname} print:hidden`}
    >
      <span>📊 Excel</span>
    </motion.button>
  );
};

export default ExcelButton;
