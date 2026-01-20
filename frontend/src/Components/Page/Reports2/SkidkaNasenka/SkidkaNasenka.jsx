import { DateContext } from "../../../UI/DateProvider";
import { useContext, useState, useEffect, use } from "react";
import myAxios from "../../../axios";
import { AuthContext } from "../../../../AuthContext";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../context/NotificationContext";
import { Loader2 } from "lucide-react";
import LoadingSip from "../../../UI/LoadingSpin";
import { useSelector, useDispatch } from "react-redux";
import { resetSkidkaFilters } from "../../../../app/store/skidkaFiltersSlice";

const SkidkaNasenka = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const { dateFrom, dateTo } = useContext(DateContext);
  const { authGroups } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { partners, warehouses, agents } = useSelector((state) => state.skidkaFilters);

  useEffect(() => {
    console.log("partners from page", partners);
  }, [partners]);

  useEffect(() => {
    dispatch(resetSkidkaFilters());
  }, [dispatch]);

  const isAdmin = authGroups?.includes("admin") || false;

  useEffect(() => {
    document.title = t("skidka_nasenka");
  }, [t]);

  const fetchSkidka = async () => {
    setLoading(true);
    try {
      const res = await myAxios.get("skidka_nasenka/", {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
          partners: partners.map(p => p.id).join(","),
          warehouses: warehouses.map(w => w.id).join(","),
          agents: agents.map(a => a.id).join(","),
        },
      });
    } catch (error) {
      console.error("Error fetching skidka data:", error.response.data.message || error);
      showNotification(t(error.response.data.message || error), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    fetchSkidka();
  }, [dateFrom, dateTo, partners, warehouses, agents]);

  return <div>{loading ? <LoadingSip /> : <div>gg</div>}</div>;
};

export default SkidkaNasenka;
