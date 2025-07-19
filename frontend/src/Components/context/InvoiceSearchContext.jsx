import React, { createContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const InvoiceSearchContext = createContext();

export function InvoiceSearchProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoiceSearchQuery, setInvoiseSearchQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    if (invoiceSearchQuery) {
      searchParams.set("search", invoiceSearchQuery);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  }, [invoiceSearchQuery]);

  return (
    <InvoiceSearchContext.Provider value={{ invoiceSearchQuery, setInvoiseSearchQuery, searchParams, setSearchParams }}>
      {children}
    </InvoiceSearchContext.Provider>
  );
}
