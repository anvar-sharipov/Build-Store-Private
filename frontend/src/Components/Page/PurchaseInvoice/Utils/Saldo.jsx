import { useFormikContext } from "formik";
import { MdPrint } from "react-icons/md";
import { MdPrintDisabled } from "react-icons/md";

const Saldo = ({saldo, letPrintSaldo, setLetPrintSaldo}) => {
  const { values } = useFormikContext();

  return (
    <div>
      {saldo && (
        <div className={`p-4 bg-white dark:bg-gray-900 rounded-xl shadow text-gray-700 dark:text-gray-200 mt-5 mx-auto max-w-2xl ${letPrintSaldo ? "print:block" : "print:hidden"}`}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center flex justify-center items-center gap-2 print:!text-black">
            Карточка: {values.partner.name}
            {letPrintSaldo ? (
              <MdPrint
                className="print:hidden"
                onClick={() => {
                  setLetPrintSaldo((v) => !v);
                }}
              />
            ) : (
              <MdPrintDisabled
                onClick={() => {
                  setLetPrintSaldo((v) => !v);
                }}
              />
            )}{" "}
          </h2>

          <table className="min-w-full table-auto border-collapse print:table-fixed print:border print:border-black mt-4">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 print:bg-white print:!text-black">
                <th colSpan={2} className="px-2 py-1 border border-black">
                  Показатель
                </th>
                <th className="px-2 py-1 border border-black">Дебет</th>
                <th className="px-2 py-1 border border-black">Кредит</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                <td colSpan={2} className="px-2 py-1 border font-semibold border-black">
                  Остаток на начало
                </td>
                <td className="px-2 py-1 border border-black font-semibold">{saldo.start[0]}</td>
                <td className="px-2 py-1 border border-black font-semibold">{saldo.start[1]}</td>
              </tr>
              {saldo.today_entries.length > 0 ? (
                saldo.today_entries.map((e, idx) => {
                  return (
                    <tr key={idx} className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                      <td className="px-2 py-1 border border-black">{e[0]}</td>
                      <td className="px-2 py-1 border border-black">{e[1]}</td>
                      <td className="px-2 py-1 border whitespace-pre-line border-black">{parseFloat(e[2]) !== 0 ? e[2] : "-"}</td>
                      <td className="px-2 py-1 border border-black">{parseFloat(e[3]) !== 0 ? e[3] : "-"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                  <td className="px-2 py-1 border border-black">-</td>
                  <td className="px-2 py-1 border border-black">-</td>
                  <td className="px-2 py-1 border whitespace-pre-line border-black">-</td>
                  <td className="px-2 py-1 border border-black">-</td>
                </tr>
              )}
              <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                <td colSpan={2} className="px-2 py-1 border font-semibold border-black">
                  Итого оборот
                </td>
                <td className="px-2 py-1 border border-black font-semibold">{saldo.final[0]}</td>
                <td className="px-2 py-1 border border-black font-semibold">{saldo.final[1]}</td>
              </tr>
              <tr className="text-gray-700 dark:text-gray-200 print:!text-black print:bg-white">
                <td colSpan={2} className="px-2 py-1 border font-semibold border-black">
                  Остаток на конец
                </td>
                <td className="px-2 py-1 border font-semibold border-black">{parseFloat(saldo.saldo[0]) !== 0 ? saldo.saldo[0] : "-"}</td>
                <td className="px-2 py-1 border font-semibold border-black">{parseFloat(saldo.saldo[1]) !== 0 ? saldo.saldo[1] : "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Saldo;
