import { useState, useEffect } from 'react';
import {
  fetchWarehouses,
  fetchPartners,
  fetchEmployeers,
} from "../../../../fetchs/optionsFetchers";

export function useLoadOptions() {
  const [fetchs, setFetchs] = useState({
    AllWarehouses: [],
    AllPartners: [],
    AllEmployeers: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [AllWarehouses, AllPartners, AllEmployeers] = await Promise.all([
          fetchWarehouses(),
          fetchPartners(),
          fetchEmployeers(),
        ]);

        if (AllWarehouses) {
          const formatted = AllWarehouses.map((v) => ({
            id: String(v.id),
            name: v.name,
          }));
          setFetchs((prev) => ({ ...prev, AllWarehouses: formatted }));
        }
        if (AllPartners) {
          const formatted = AllPartners.map((v) => ({
            ...v,
            id: String(v.id),
            name: v.name,
            type: v.type,
          }));
          setFetchs((prev) => ({ ...prev, AllPartners: formatted }));
        }
        if (AllEmployeers) {
          const formatted = AllEmployeers.map((v) => ({
            id: String(v.id),
            name: v.name,
          }));
          setFetchs((prev) => ({ ...prev, AllEmployeers: formatted }));
        }
      } catch (e) {
        console.error("Ошибка загрузки данных:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return { fetchs, loading };
}
