

// DateContext.js
import { createContext, useState, useEffect } from "react";

export const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const today = new Date().toISOString().split("T")[0];

  const [dateProwodok, setDateProwodok] = useState(() => localStorage.getItem("dateProwodok") || today);
  const [dateFrom, setDateFrom] = useState(() => localStorage.getItem("dateFrom") || today);
  const [dateTo, setDateTo] = useState(() => localStorage.getItem("dateTo") || today);

  useEffect(() => { localStorage.setItem("dateProwodok", dateProwodok); }, [dateProwodok]);
  useEffect(() => { localStorage.setItem("dateFrom", dateFrom); }, [dateFrom]);
  useEffect(() => { localStorage.setItem("dateTo", dateTo); }, [dateTo]);

  return (
    <DateContext.Provider value={{ dateProwodok, setDateProwodok, dateFrom, setDateFrom, dateTo, setDateTo }}>
      {children}
    </DateContext.Provider>
  );
};
