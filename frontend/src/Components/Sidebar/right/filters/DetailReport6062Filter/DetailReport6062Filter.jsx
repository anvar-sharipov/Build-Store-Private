import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const DetailReport6062Filter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Берём текущие значения из URL
  const accountNumber = searchParams.get("accountNumber") || "";
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") || "");

  // Обновляем URL при изменении дат
  useEffect(() => {
    const params = { accountNumber };
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;

    setSearchParams(params);
  }, [dateFrom, dateTo, accountNumber, setSearchParams]);

  return (
    <div className="flex flex-col">
      <label>
        From: 
        <input 
          type="date" 
          value={dateFrom} 
          onChange={e => setDateFrom(e.target.value)} 
        />
      </label>
      <label>
        To: 
        <input 
          type="date" 
          value={dateTo} 
          onChange={e => setDateTo(e.target.value)} 
        />
      </label>
    </div>
  );
};

export default DetailReport6062Filter;
