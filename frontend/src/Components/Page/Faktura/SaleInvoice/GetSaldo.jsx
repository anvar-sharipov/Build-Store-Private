import { useState } from "react";
import MyModal from "../../../UI/MyModal";
import MyLoading from "../../../UI/MyLoading";
import { formatNumber } from "../../../UI/formatNumber";

const GetSaldo = ({
  entriesWithBalance,
  selectedPartner,
  setOpenEntryModal,
  setSelectedEntryForModal,
  selectedEntryForModal,
  myAxios,
  openEntryModal,
  mergeEntriesWithRunningBalance,
}) => {
  const [loadingModal, setLoadingModal] = useState(false);
  return (
    <div>
      {entriesWithBalance.length > 0 &&
        entriesWithBalance.map((group, index) => (
          <div
            key={index}
            className="rounded p-4 shadow-sm bg-white dark:bg-gray-800 max-w-5xl mx-auto mb-6 print:m-0 print:p-0"
          >
            <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-100 print:mb-0">
              Карточка счёта: 62 (Покупатели)
            </h2>

            {/* <p className="text-gray-600 dark:text-gray-300 mb-4 print:mb-0 print:text-black">
              Покупатель: {selectedPartner.name} <br />
            </p> */}

            <div className="overflow-auto max-h-[400px] print:text-[14px]">
              <table className="w-full border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <tr>
                    <th className="px-2 py-1 border print:p-0 print:border-black">Дата</th>
                    {/* <th className="px-2 py-1 border print:p-0">Счёт</th> */}
                    <th className="px-2 py-1 border print:p-0 print:border-black">Операция</th>
                    <th className="px-2 py-1 border print:p-0 print:border-black">Дебет</th>
                    <th className="px-2 py-1 border print:p-0 print:border-black">Кредит</th>
                    <th className="px-2 py-1 border font-semibold print:p-0 print:border-black">
                      Сальдо
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {mergeEntriesWithRunningBalance(group.entries).map(
                    (entry) => (
                      <tr
                        key={entry.id}
                        onClick={async () => {
                          setOpenEntryModal(true);
                          setSelectedEntryForModal(entry);
                          setLoadingModal(true);
                          try {
                            const res = await myAxios.get(
                              `transactions/${entry.transaction}`
                            );
                            console.log("res", res);
                            setSelectedEntryForModal(res.data);
                          } catch (error) {
                            console.log(
                              "ne udalos poluchit infu o prowodke",
                              error
                            );
                          } finally {
                            setLoadingModal(false);
                          }
                        }}
                        className="border-t cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <td className="px-2 py-1 border print:p-0 text-center print:border-black">
                          {new Date(entry.date).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        {/* <td className="px-2 py-1 border print:p-0 text-center">
                          {entry.account.number}
                        </td> */}
                        <td className="px-2 py-1 border print:p-0 print:border-black">
                          {entry.transaction_obj?.description || "-"}
                        </td>
                        <td className="px-2 py-1 border print:p-0 text-center print:border-black">
                          {formatNumber(entry.debit)}
                        </td>
                        <td className="px-2 py-1 border print:p-0 text-center print:border-black">
                          {formatNumber(entry.credit)}
                        </td>
                        <td className="px-2 py-1 border print:p-0 font-semibold text-center print:border-black">
                          {formatNumber(entry.running_balance)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

                <tfoot className="bg-gray-200 dark:bg-gray-800 font-semibold">
                  <tr>
                    <td colSpan={2} className="px-2 py-1 border text-right print:border-black">
                      Итого:
                    </td>
                    <td className="px-2 py-1 border text-center print:border-black">
                      {formatNumber(
                        group.entries.reduce(
                          (sum, e) => sum + parseFloat(e.debit || 0),
                          0
                        )
                      )}
                    </td>
                    <td className="px-2 py-1 border text-center print:border-black">
                      {formatNumber(
                        group.entries.reduce(
                          (sum, e) => sum + parseFloat(e.credit || 0),
                          0
                        )
                      )}
                    </td>
                    <td className="px-2 py-1 border print:border-black">{formatNumber(group.final_balance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}

      {openEntryModal && (
        <MyModal
          onClose={() => {
            setSelectedEntryForModal(null);
            setOpenEntryModal(false);
          }}
        >
          {loadingModal ? (
            <MyLoading />
          ) : (
            <div className="font-sans text-gray-800">
              <h2 className="border-b-2 border-blue-500 pb-2 mb-4 text-blue-600 text-lg font-semibold">
                Информация о накладной №{selectedEntryForModal.invoice_obj?.id}
              </h2>

              <div className="space-y-2">
                <p>
                  <span className="font-bold">Статус:</span>{" "}
                  <span className="capitalize">
                    {selectedEntryForModal.invoice_obj?.status}
                  </span>
                </p>

                <p>
                  <span className="font-bold">Покупатель:</span>{" "}
                  {selectedEntryForModal.invoice_obj?.buyer?.name}
                </p>

                <p>
                  <span className="font-bold">Дата создания:</span>{" "}
                  {new Date(
                    selectedEntryForModal.invoice_obj?.created_at
                  ).toLocaleString("ru-RU")}
                </p>

                <p>
                  <span className="font-bold">Сумма Товаров:</span>{" "}
                  {selectedEntryForModal.invoice_obj?.total_amount}{" "}
                  {/* {selectedEntryForModal.invoice_obj?.currency} */}
                </p>
                <p>
                  <span className="font-bold">Сумма платёжа:</span>{" "}
                  {selectedEntryForModal.invoice_obj?.total_pay_summ}{" "}
                  {/* {selectedEntryForModal.invoice_obj?.currency} */}
                </p>

                <p>
                  <span className="font-bold">Склад:</span>{" "}
                  {selectedEntryForModal.invoice_obj?.warehouse?.name || "—"}
                </p>
              </div>

              <div className="mt-5">
                <p className="font-bold mb-2">Товары:</p>
                <ul className="list-disc pl-5 max-h-48 overflow-y-auto space-y-1">
                  {selectedEntryForModal.invoice_obj?.items?.map((item) => (
                    <li key={item.id} className="text-sm">
                      <span className="font-semibold">
                        {item.product?.name}
                      </span>{" "}
                      — Кол-во:{" "}
                      <span className="text-gray-600">{item.quantity}</span>,
                      Цена:{" "}
                      <span className="text-gray-600">{item.sale_price}</span>
                    </li>
                  )) || <li>Товаров нет</li>}
                </ul>
              </div>

              <p className="mt-4">
                <span className="font-bold">Примечание:</span>{" "}
                {selectedEntryForModal.invoice_obj?.note || "—"}
              </p>
            </div>
          )}
        </MyModal>
      )}
    </div>
  );
};

export default GetSaldo;
