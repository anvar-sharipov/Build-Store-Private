import MyModal2 from "../../../UI/MyModal2";
import { useTranslation } from "react-i18next";
import { ImageOff } from "lucide-react";
import { formatNumber2 } from "../../../UI/formatNumber2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TablePartners = ({
  setPartnersModal,
  lastDaysCount,
  selectedProductImages,
  activeImage,
  selectedProductName,
  setActiveImage,
  selectedProductId,
  selectedProductWholesalePrice,
  handleSort,
  renderSortArrow,
  sortedPartners,
  totals,
  partnersModal,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="print:hidden">
        {partnersModal && (
          <MyModal2 onClose={() => setPartnersModal(false)} widthVariant="wide">
            {(() => {
              const dateTo = new Date();
              const dateFrom = new Date();
              dateFrom.setDate(dateTo.getDate() - lastDaysCount);

              const formatDate = (d) => d.toLocaleDateString("ru-RU");

              return (
                <>
                  {/* HEADER */}
                  <div className="flex gap-3 mb-3">
                    <div className="flex flex-col items-center">
                      {selectedProductImages?.length > 0 ? (
                        <>
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                            <img src={`${BASE_URL}/media/${selectedProductImages[activeImage]}`} alt={selectedProductName} className="w-full h-full object-contain p-1" />
                          </div>

                          {selectedProductImages.length > 1 && (
                            <div className="flex gap-1 mt-1 flex-wrap justify-center">
                              {selectedProductImages.map((img, i) => (
                                <img
                                  key={i}
                                  src={`${BASE_URL}/media/${img}`}
                                  onClick={() => setActiveImage(i)}
                                  className={`w-6 h-6 object-cover rounded cursor-pointer border
                            ${activeImage === i ? "border-cyan-500" : "border-gray-300 hover:border-gray-500"}`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md">
                          <ImageOff className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-sm">
                      <div className="font-semibold leading-tight">{selectedProductName}</div>

                      <div className="text-gray-500 text-xs">ID: {selectedProductId}</div>

                      <div className="mt-1 text-xs">
                        Оптовая цена: <span className="font-semibold text-cyan-600">{formatNumber2(selectedProductWholesalePrice)}</span>
                      </div>

                      <div className="text-[11px] text-gray-500 mt-1">За последние {lastDaysCount} дней</div>

                      <div className="text-[11px] text-gray-500">
                        Период: {formatDate(dateFrom)} — {formatDate(dateTo)}
                      </div>
                    </div>
                  </div>

                  {/* TABLE CONTAINER */}
                  <div className="max-h-[60vh] overflow-y-auto border border-black">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="border border-black p-1">№</th>

                          <th onClick={() => handleSort("partner")} className="border border-black p-1 cursor-pointer">
                            Клиент {renderSortArrow("partner")}
                          </th>

                          <th onClick={() => handleSort("agents")} className="border border-black p-1 cursor-pointer">
                            Агенты {renderSortArrow("agents")}
                          </th>

                          <th onClick={() => handleSort("faktura_count")} className="border border-black p-1 cursor-pointer text-center">
                            Фактур {renderSortArrow("faktura_count")}
                          </th>

                          <th className="border border-black p-1 text-center" colSpan={2}>
                            Сумма
                          </th>
                        </tr>

                        <tr>
                          <th className="border border-black p-1"></th>
                          <th className="border border-black p-1"></th>
                          <th className="border border-black p-1"></th>
                          <th className="border border-black p-1"></th>

                          <th className="border border-black p-1 text-center cursor-pointer" onClick={() => handleSort("quantity")}>
                            Кол-во {renderSortArrow("quantity")}
                          </th>

                          <th onClick={() => handleSort("total_sum")} className="border border-black p-1 cursor-pointer text-center">
                            Цена {renderSortArrow("total_sum")}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {sortedPartners.map(([partner, info], index) => (
                          <tr key={partner} className="hover:bg-gray-50">
                            <td className="border border-black p-1 text-center">{index + 1}</td>

                            <td className="border border-black p-1">{partner}</td>

                            <td className="border border-black p-1">{(info.agents || []).join(", ")}</td>

                            <td className="border border-black p-1 text-center">{info.faktura_count}</td>

                            <td className="border border-black p-1 text-right">{formatNumber2(info.selected_quantity)}</td>

                            <td className="border border-black p-1 text-right">{formatNumber2(info.total_sum)}</td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot className="bg-gray-100 sticky bottom-0 z-10">
                        <tr>
                          <td className="border border-black p-1 text-center font-semibold">Итого</td>

                          <td className="border border-black p-1 text-center font-semibold">{sortedPartners.length}</td>

                          <td className="border border-black p-1 text-center font-semibold">{totals.agents}</td>

                          <td className="border border-black p-1 text-center font-semibold">{totals.faktura}</td>

                          <td className="border border-black p-1 text-right font-semibold">{formatNumber2(totals.qty)}</td>

                          <td className="border border-black p-1 text-right font-semibold">{formatNumber2(totals.sum)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              );
            })()}
          </MyModal2>
        )}
      </div>

      {/* for print */}
      <div>
        {partnersModal && (
          <div className="hidden print:block text-black text-[11px] p-4">
            {/* HEADER */}
            <div className="font-bold text-[13px] text-center">{selectedProductName}</div>
            <div className="font-bold text-[13px] text-center">Анализ Продаж за последниe {lastDaysCount} дней</div>
            <div className="flex items-start gap-3 mb-3">
              {/* Фото */}
              {selectedProductImages?.length > 0 ? (
                <img src={`${BASE_URL}/media/${selectedProductImages[0]}`} className="w-16 h-16 object-contain border" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center border text-[9px]">нет фото</div>
              )}

              {/* Информация */}
              <div className="flex-1 leading-tight">
                {/* <div className="font-bold text-[13px]">Клиенты товара</div> */}

                {/* <div className="font-semibold">{selectedProductName}</div> */}

                <div className="flex gap-4 text-[10px] mt-1">
                  <div>ID: {selectedProductId}</div>

                  <div>Цена: {formatNumber2(selectedProductWholesalePrice)}</div>

                  {/* <div>Дней: {lastDaysCount}</div> */}
                </div>

                {/* Период */}
                <div className="text-[10px] mt-1">
                  Период: {new Date(Date.now() - lastDaysCount * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  {" — "}
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* TABLE */}
            <table className="w-full border border-black border-collapse text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-1 py-0.5 w-6">№</th>

                  <th className="border border-black px-1 py-0.5">Клиент ({sortedPartners.length})</th>

                  <th className="border border-black px-1 py-0.5">Агенты ({totals.agents})</th>

                  <th className="border border-black px-1 py-0.5 w-12">Фактура ({totals.faktura})</th>

                  <th className="border border-black px-1 py-0.5 w-14">Кол-во</th>

                  <th className="border border-black px-1 py-0.5 w-16">Сумма</th>
                </tr>
              </thead>

              <tbody>
                {sortedPartners.map(([partner, info], index) => (
                  <tr key={partner} className="break-inside-avoid">
                    <td className="border border-black px-1 text-center">{index + 1}</td>

                    <td className="border border-black px-1">{partner}</td>

                    <td className="border border-black px-1">{(info.agents || []).join(", ")}</td>

                    <td className="border border-black px-1 text-center">{info.faktura_count}</td>

                    <td className="border border-black px-1 text-right">{formatNumber2(info.selected_quantity)}</td>

                    <td className="border border-black px-1 text-right">{formatNumber2(info.total_sum)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="bg-gray-100 sticky bottom-0 z-10">
                <tr>
                  <td className="border border-black p-1 text-center font-semibold">Итого</td>

                  <td className="border border-black p-1 text-center font-semibold">{sortedPartners.length}</td>

                  <td className="border border-black p-1 text-center font-semibold">{totals.agents}</td>

                  <td className="border border-black p-1 text-center font-semibold">{totals.faktura}</td>

                  <td className="border border-black p-1 text-right font-semibold">{formatNumber2(totals.qty)}</td>

                  <td className="border border-black p-1 text-right font-semibold">{formatNumber2(totals.sum)}</td>
                </tr>
              </tfoot>
            </table>

            {/* FOOTER */}
            <div className="flex justify-between text-[9px] mt-2">
              <div>Строк: {sortedPartners.length}</div>

              <div>Печать: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablePartners;
