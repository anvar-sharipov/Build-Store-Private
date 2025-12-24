import { PROCHEE } from "../../../../../routes"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next";

const ZakazListFilter = () => {
  const navigate = useNavigate();
  const {t} = useTranslation()

  return (
    <div className="w-full rounded-xl bg-gray-900 p-2 text-sm text-gray-200 shadow-md">
      <div
        onClick={() => navigate(PROCHEE.ZAKAZ)}
        className="
          cursor-pointer rounded-lg px-4 py-2
          transition
          hover:bg-gray-800 hover:text-white
          active:bg-gray-700
        "
      >
        {t("create zakaz")}
      </div>

      <div
        onClick={() => navigate(PROCHEE.ZAKAZ_LIST)}
        className="
          mt-1 cursor-pointer rounded-lg px-4 py-2
          transition
          hover:bg-gray-800 hover:text-white
          active:bg-gray-700
        "
      >
        {t("zakaz list")}
      </div>
    </div>
  )
}

export default ZakazListFilter
