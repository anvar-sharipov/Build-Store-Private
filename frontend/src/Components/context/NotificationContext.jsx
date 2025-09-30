import { createContext, useContext, useState, useCallback } from "react";
// import Notification2 from "../UI/Notification2"; // Путь к твоему компоненту
import Notification2 from "../Notification2";


const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification должен использоваться внутри NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Показать уведомление
  const showNotification = useCallback((message, type = "info", duration = 10000) => {
    const id = Date.now() + Math.random();
    const newNotification = { id, message, type };
    
    setNotifications(prev => [...prev, newNotification]);

    // Автоматически удалить через duration мс
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Удалить уведомление
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Очистить все уведомления
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotification, 
        removeNotification, 
        clearAll,
        notifications 
      }}
    >
      {children}
      
      {/* Рендер всех уведомлений */}
      <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
        {notifications.map((notif, index) => (
          <div 
            key={notif.id} 
            className="pointer-events-auto"
            style={{ 
              transform: `translateY(${index * 10}px)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <Notification2
              message={notif.message}
              type={notif.type}
              id={notif.id}
              onClose={() => removeNotification(notif.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};