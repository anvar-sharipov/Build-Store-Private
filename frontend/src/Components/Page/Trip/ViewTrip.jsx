import { useParams } from "react-router-dom";
import myAxios from "../../axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Coins, Package, Calculator, Car, Calendar } from "lucide-react";
import { formatNumber2 } from "../../UI/formatNumber2";
import React from "react";
import MyFormatDate from "../../UI/MyFormatDate";

const ViewTrip = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTrip = async () => {
    try {
      setLoading(true);
      const res = await myAxios.get("get_trip/", { params: { id } });
      setTrip(res.data.data);
    } catch (err) {
      console.error("Ошибка загрузки рейса:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `${t("trip")} № ${id}`;
  }, [t, id]);

  useEffect(() => {
    getTrip();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10 dark:text-gray-300">Загрузка...</div>;
  }

  if (!trip) {
    return <div className="text-center py-10 dark:text-gray-300">Рейс не найден</div>;
  }

  return (
    <div className="p-2 print:p-0 print:pt-2 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        {/* Logo */}
        <img src="/polisem.png" alt="polisem" width={100} className="rounded-lg" />

        {/* Info in one line */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">{t("trip")}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">№{trip?.id}</span>
          </div>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center space-x-2">
            <Car className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">{trip?.driver_name}</span>
          </div>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">{trip?.id && MyFormatDate(trip.created_at)}</span>
          </div>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">{t("invoice count")}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{trip?.id && trip.invoices_json.length}</span>
          </div>
        </div>

        {/* Price - раскомментируйте если нужно */}
        {/* {trip?.total_price && (
          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg">
            <Coins className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-bold text-green-700 dark:text-green-300">{formatNumber2(trip.total_price)}</span>
          </div>
        )} */}
      </div>

      {trip?.id && (
        <div className="space-y-2 print:space-y-1 mt-4">
          {/* Таблица товаров */}
          {trip?.aggregated_products?.length > 0 && (
            <div className="border border-gray-300 dark:border-gray-700 rounded print:border-gray-200 print:shadow-none overflow-hidden bg-white dark:bg-gray-800">
              {/* Заголовок таблицы - исправленная сетка с учетом столбца № */}
              <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-700 print:bg-gray-100 border-b border-gray-300 dark:border-gray-600">
                <div className="col-span-1 p-1 text-xs font-semibold border-r border-gray-300 dark:border-gray-600 dark:text-gray-200 text-center">№</div>
                <div className="col-span-4 print:col-span-6 p-1 text-xs font-semibold border-r border-gray-300 dark:border-gray-600 dark:text-gray-200">{t("products")}</div>
                <div className="col-span-2 print:col-span-2 p-1 text-xs font-semibold border-r border-gray-300 dark:border-gray-600 text-center dark:text-gray-200">{t("quantity")}</div>
                <div className="col-span-2 print:col-span-1 p-1 text-xs font-semibold border-r border-gray-300 dark:border-gray-600 text-right dark:text-gray-200">{t("Amount")}</div>
                <div className="col-span-2 print:col-span-1 p-1 text-xs font-semibold border-r border-gray-300 dark:border-gray-600 text-right dark:text-gray-200">{t("volumeLabel")}</div>
                <div className="col-span-1 print:col-span-1 p-1 text-xs font-semibold text-right dark:text-gray-200">{t("weightLabel")}</div>
              </div>

              {/* Тело таблицы */}
              {trip.aggregated_products.map((product, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 ${
                    index < trip.aggregated_products.length - 1
                      ? "border-b border-gray-200 dark:border-gray-600"
                      : ""
                  }`}
                >
                  <div className="col-span-1 p-1 border-r border-gray-300 dark:border-gray-600 text-xs text-center dark:text-gray-300">
                    {index + 1}
                  </div>
                  <div className="col-span-4 print:col-span-6 p-1 border-r border-gray-300 dark:border-gray-600">
                    <div className="text-xs dark:text-gray-300">
                      {product.name}
                      {product.is_gift && <span className="ml-1 text-[10px]">🎁</span>}
                    </div>
                  </div>
                  <div className="col-span-2 print:col-span-2 p-1 border-r border-gray-300 dark:border-gray-600 text-xs text-center dark:text-gray-300">
                    {formatNumber2(product.selected_quantity)} {product.unit}
                  </div>
                  <div className="col-span-2 print:col-span-1 p-1 border-r border-gray-300 dark:border-gray-600 text-xs font-medium text-right dark:text-gray-300">
                    {formatNumber2(product.total_price)}
                  </div>
                  <div className="col-span-2 print:col-span-1 p-1 border-r border-gray-300 dark:border-gray-600 text-xs text-right dark:text-gray-300">
                    {formatNumber2(product.volume)}
                  </div>
                  <div className="col-span-1 print:col-span-1 p-1 text-xs text-right dark:text-gray-300">
                    {formatNumber2(product.weight)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Итоги */}
          <div className="bg-gray-50 dark:bg-gray-800 print:bg-gray-100 border border-gray-300 dark:border-gray-700 rounded p-2 print:p-1">
            <div className="grid grid-cols-6 gap-0">
              {[
                { label: t("Amount"), value: trip.total_price, color: "text-green-700 dark:text-green-400" },
                { label: t("volumeLabel"), value: trip.total_volume, unit: t("m3"), color: "text-blue-700 dark:text-blue-400" },
                { label: t("weightLabel"), value: trip.total_weight, unit: t("kg"), color: "text-orange-700 dark:text-orange-400" },
                { label: t("lengthLabel"), value: trip.total_length, unit: t("sm"), color: "text-gray-700 dark:text-gray-300" },
                { label: t("widthLabel"), value: trip.total_width, unit: t("sm"), color: "text-gray-700 dark:text-gray-300" },
                { label: t("heightLabel"), value: trip.total_height, unit: t("sm"), color: "text-gray-700 dark:text-gray-300" },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-1 ${
                    index < 5 ? "border-r border-gray-300 dark:border-gray-600" : ""
                  } text-center`}
                >
                  <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">
                    {item.label}
                  </div>
                  <div className={`text-xs font-bold ${item.color} leading-tight`}>
                    {formatNumber2(item.value)}
                    {item.unit && <span className="text-[10px] ml-0.5">{item.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 text-right hidden print:block mt-3">
        {t("Print date")}: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default ViewTrip;