import { PROCHEE } from "../../../../../routes";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ZakazNavigate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const change_wkladka = new Audio("/sounds/change_wkladka.mp3");
  return (
    <div className=" text-sm w-full rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-2 shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/30">
      <div
        onClick={() => {
          navigate(PROCHEE.ZAKAZ);
          change_wkladka.currentTime = 0;
          change_wkladka.play();
        }}
        className="
          group relative cursor-pointer rounded-xl px-4 py-3
          bg-gradient-to-r from-gray-800 to-gray-900
          transition-all duration-200
          hover:from-blue-900/50 hover:to-gray-800
          hover:border-blue-500/50
          active:bg-gray-700
          border border-gray-700
          shadow-inner
        "
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-200"></div>
          <span className="font-medium text-gray-200 group-hover:text-blue-300 transition-colors">{t("create zakaz")}</span>
        </div>
      </div>

      <div
        onClick={() => {
          navigate(PROCHEE.ZAKAZ_LIST);
          change_wkladka.currentTime = 0;
          change_wkladka.play();
        }}
        className="
          group relative cursor-pointer rounded-xl px-4 py-3 mt-2
          bg-gradient-to-r from-gray-800 to-gray-900
          transition-all duration-200
          hover:from-green-900/50 hover:to-gray-800
          hover:border-green-500/50
          active:bg-gray-700
          border border-gray-700
          shadow-inner
        "
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-200"></div>
          <span className="font-medium text-gray-200 group-hover:text-green-300 transition-colors">{t("zakaz list")}</span>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-30 blur-sm"></div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 opacity-20 blur-sm"></div>
    </div>
  );
};

export default ZakazNavigate;
