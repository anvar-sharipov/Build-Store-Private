import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Notification2 = ({ message, type = "info", onClose, id }) => {
  useEffect(() => {
    if (message) {
      const audio = new Audio(
        type === "success" ? "/sounds/success.mp3" : 
        type === "error" ? "/sounds/error.mp3" :
        type === "warning" ? "/sounds/warning.mp3" :
        type === "faktura_success" ? "/sounds/faktura_success.mp3" : "/sounds/warning.mp3"
      );
      audio.play().catch(() => {}); // Игнорируем ошибки воспроизведения
    }
  }, [message, type]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600",
          border: "border-emerald-400",
          shadow: "shadow-emerald-500/25",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          glow: "shadow-2xl shadow-emerald-500/30"
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-red-500 via-rose-500 to-red-600",
          border: "border-red-400",
          shadow: "shadow-red-500/25",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          glow: "shadow-2xl shadow-red-500/30"
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600",
          border: "border-amber-400",
          shadow: "shadow-amber-500/25",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          glow: "shadow-2xl shadow-amber-500/30"
        };
      default: // info
        return {
          bg: "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600",
          border: "border-blue-400",
          shadow: "shadow-blue-500/25",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          glow: "shadow-2xl shadow-blue-500/30"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={id || message + type} // Уникальный ключ для каждого уведомления
          initial={{ opacity: 0, x: 400, scale: 0.3 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 25
            }
          }}
          exit={{ 
            opacity: 0, 
            x: 400, 
            scale: 0.5,
            transition: {
              duration: 0.2,
              ease: "easeInOut"
            }
          }}
          className={`fixed top-6 right-6 z-[9999] min-w-[320px] max-w-[420px]`}
        >
          <div className={`relative overflow-hidden rounded-2xl ${styles.bg} ${styles.glow} backdrop-blur-sm border ${styles.border}`}>
            {/* Шиммер эффект */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
            
            {/* Основной контент */}
            <div className="relative p-4 pr-12">
              <div className="flex items-start space-x-3">
                {/* Иконка с анимацией */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                  className="flex-shrink-0 p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white"
                >
                  {styles.icon}
                </motion.div>

                {/* Текст сообщения */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex-1 text-white font-medium text-sm leading-relaxed"
                >
                  {message}
                </motion.div>
              </div>
            </div>

            {/* Кнопка закрытия */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(255, 255, 255, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm"
              aria-label="Закрыть уведомление"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Прогресс бар (декоративный) */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>

          {/* Дополнительное свечение */}
          <motion.div
            className={`absolute inset-0 rounded-2xl ${styles.shadow} opacity-50 -z-10`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification2;