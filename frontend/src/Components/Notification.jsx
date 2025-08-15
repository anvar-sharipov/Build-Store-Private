import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const audio = new Audio(type === "success" ? "/sounds/success.mp3" : "/sounds/error.mp3");
      audio.play();
    }
  }, [message, type]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className={`notification ${type}`}
          style={{
            position: "fixed",
            top: 80,
            right: 20,
            padding: "1rem 2rem",
            borderRadius: "8px",
            backgroundColor: type === "success" ? "#4caf50" : "#f44336",
            color: "white",
            zIndex: 9999,
          }}
        >
          {message}
          <button
            onClick={onClose}
            style={{
              marginLeft: "1rem",
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;

// import { motion, AnimatePresence } from 'framer-motion';

// const Notification = ({ message, type, onClose }) => {
//   return (
//     <AnimatePresence>
//       {message && (
//         <motion.div
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -50 }}
//           transition={{ duration: 0.5 }}
//           className={`notification ${type}`}
//           style={{
//             position: 'fixed',
//             top: 80,
//             right: 20,
//             padding: '1rem 2rem',
//             borderRadius: '8px',
//             backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
//             color: 'white',
//             zIndex: 9999,
//           }}
//         >
//           {message}
//           <button onClick={onClose} style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Notification;
