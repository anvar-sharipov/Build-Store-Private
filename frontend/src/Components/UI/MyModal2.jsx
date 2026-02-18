// import { useEffect } from "react";
// import { IoCloseSharp } from "react-icons/io5";
// import { motion, AnimatePresence } from "framer-motion";

// const MyModal2 = ({ onClose, children, loading, myClass = "" }) => {
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === "Escape" && !loading) {
//         onClose();
//       } else {
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [onClose, loading]);

//   useEffect(() => {
//     const open_modal2 = new Audio("/sounds/open_modal2.mp3");
//     open_modal2.play();
//   }, [loading]);

//   return (
//     <AnimatePresence>
//       <motion.div
//         className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.2 }}
//         onClick={(e) => {
//           if (e.target === e.currentTarget && !loading) {
//             onClose();
//           }
//         }}
//       >
//         <motion.div
//           className={`relative
//              rounded-xl sm:rounded-2xl shadow-2xl
//              border border-gray-200/20 dark:border-gray-700/30 backdrop-blur-xl
//              w-full max-w-2xl md:max-w-3xl lg:max-w-4xl
//              max-h-[90vh] p-4 sm:p-6 md:p-8 ${myClass === "" ? "bg-white dark:bg-gray-900" : myClass}`}
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           transition={{ type: "spring", stiffness: 300, damping: 25 }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Кнопка закрытия */}
//           <button
//             onClick={() => !loading && onClose()}
//             disabled={loading}
//             className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800
//                        hover:bg-red-50 dark:hover:bg-red-900/20
//                        text-gray-500 hover:text-red-600 dark:hover:text-red-400
//                        transition-all duration-200
//                        disabled:opacity-50 disabled:cursor-not-allowed"
//             aria-label="Close modal"
//           >
//             <IoCloseSharp className="text-xl" />
//           </button>

//           {/* Контент */}
//           <div className="w-full h-auto max-h-[80vh] overflow-y-auto pr-1">{children}</div>

//           {/* Лоадер */}
//           {loading && (
//             <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
//               <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
//             </div>
//           )}
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default MyModal2;

import { useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

const MyModal2 = ({
  onClose,
  children,
  loading,
  myClass = "",
  closeOnBackdropClick = true, // Новый пропс по умолчанию true
  widthVariant = "default", // default | full | wide
}) => {
  const widthClasses = {
    default: "w-full max-w-2xl md:max-w-3xl lg:max-w-4xl",
    full: "w-full max-w-full",
    wide: "w-[90%] max-w-full",
  };


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, loading]);

  useEffect(() => {
    const open_modal2 = new Audio("/sounds/open_modal2.mp3");
    open_modal2.play();
  }, [loading]);

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          // Проверяем пропс closeOnBackdropClick
          if (e.target === e.currentTarget && !loading && closeOnBackdropClick) {
            onClose();
          }
        }}
      >
        {/* w-full max-w-2xl md:max-w-3xl lg:max-w-4xl  */}
        <motion.div
          className={`relative 
             rounded-xl sm:rounded-2xl shadow-2xl 
             border border-gray-200/20 dark:border-gray-700/30 backdrop-blur-xl
             
             ${widthClasses[widthVariant]}
             max-h-[90vh] p-4 sm:p-6 md:p-8 ${myClass === "" ? "bg-white dark:bg-gray-900" : myClass}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 
                       hover:bg-red-50 dark:hover:bg-red-900/20 
                       text-gray-500 hover:text-red-600 dark:hover:text-red-400 
                       transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <IoCloseSharp className="text-xl" />
          </button>

          {/* Контент */}
          <div className="w-full h-auto max-h-[80vh] overflow-y-auto pr-1">{children}</div>

          {/* Лоадер */}
          {loading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MyModal2;
