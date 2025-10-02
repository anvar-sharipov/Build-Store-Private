import MyModal2 from "../../UI/MyModal2";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

const CloseDayModal = ({ setOpenModalCloseDay, handleSubmit, dateProwodok, setDateProwodok, setReason, reason }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await handleSubmit(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MyModal2 onClose={() => setOpenModalCloseDay(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
      >
        <form onSubmit={onSubmit} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Header с градиентом */}
          <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative flex items-center justify-center space-x-3"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Закрытие дня</h2>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Дата блок */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Дата закрытия</label>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border-2 border-indigo-200 dark:border-indigo-700 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Выбранная дата</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {dateProwodok ? new Date(dateProwodok).toLocaleDateString("ru-RU", { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        }) : "Не выбрана"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <input type="hidden" value={dateProwodok} onChange={(e) => setDateProwodok(e.target.value)} required />
            </motion.div>

            {/* Комментарий */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Комментарий</label>
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">(необязательно)</span>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 group-focus-within:opacity-10 transition-opacity duration-300"></div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading}
                  className="relative w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-300 resize-none
                           shadow-sm hover:shadow-md
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Добавьте комментарий о причине закрытия дня..."
                  rows={4}
                />
              </div>
            </motion.div>

            {/* Информационный блок */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">Внимание!</p>
                <p>После закрытия дня все проводки будут зафиксированы и не смогут быть изменены.</p>
              </div>
            </motion.div>

            {/* Кнопки */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-3 pt-2"
            >
              <button
                type="button"
                onClick={() => setOpenModalCloseDay(false)}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-gray-700 dark:text-gray-300 font-semibold rounded-lg
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         shadow-sm hover:shadow-md
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Отмена
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 group relative py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                         hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700
                         text-white font-semibold rounded-lg overflow-hidden
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         shadow-lg hover:shadow-xl
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Закрытие...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Подтвердить</span>
                    </>
                  )}
                </span>
                
                {/* Шиммер эффект */}
                {!isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </button>
            </motion.div>
          </div>

          {/* Нижняя декоративная линия */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        </form>
      </motion.div>
    </MyModal2>
  );
};

export default CloseDayModal;