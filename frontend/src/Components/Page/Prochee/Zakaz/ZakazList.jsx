import myAxios from "../../../axios";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useContext } from "react";
import { DateContext } from "../../../UI/DateProvider";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ZakazList = () => {
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);
  const { t } = useTranslation();
  const [loadingList, setLoadingList] = useState(false);

  const getZakazList = async () => {
    setLoadingList(true);
    try {
      const res = await myAxios.get("zakaz_list", {
        params: {
          dateFrom,
          dateTo,
        },
      });
      console.log("res", res);
    } catch (err) {
      console.log("cant getZakazList", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (!dateFrom || !dateTo) {
      return;
    }

    const timer = setTimeout(getZakazList, 800);
    return () => clearTimeout(timer);
  }, [dateFrom, dateTo]);

  return (
    <div>
      {loadingList ? (
        <div className="flex items-center justify-center min-h-[400px] print:hidden">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 dark:text-blue-400 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Загрузка данных...</p>
          </motion.div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default ZakazList;
