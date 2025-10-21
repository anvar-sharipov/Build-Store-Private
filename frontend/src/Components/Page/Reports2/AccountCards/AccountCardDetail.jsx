import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import myAxios from "../../../axios";
import { DateContext } from "../../../UI/DateProvider";

const AccountCardDetail = () => {
  const { id } = useParams();
  const [cards, setCards] = useState([]);
  const { dateFrom, dateTo } = useContext(DateContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await myAxios.get(`get_account_cards/${id}/`, {
          params: { dateFrom, dateTo },
        });
        setCards(res.data);
        console.log("res.data", res.data);
      } catch (error) {
        console.error("Ошибка при получении детальной карточки:", error);
      }
    };
    fetchData();
  }, [id, dateFrom, dateTo]);

  if (!cards.length) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="p-2 space-y-6">
      {cards.map((data, i) => (
        <div key={i} className="print:break-inside-avoid">
          {/* Шапка карточки */}
          {/* <div className="print:table-header-repeat">
            <h2 className="text-base font-semibold mb-1">
              Карточка счёта: {data.account} {data.partner && `— ${data.partner}`}
            </h2>
            <p className="text-sm mb-2">
              Период с {data.date_from} по {data.date_to}
            </p>
          </div> */}

          {/* Таблица */}
          <table className="w-full border border-black border-collapse text-sm print:break-inside-avoid">
            <thead className="table-header-repeat bg-gray-200">
              <tr>
                <th colSpan={5} className="border border-black p-1 text-left">
                  <div>
                    <h2 className="text-base font-semibold mb-1">
                      Карточка счёта: {data.account} {data.partner && `— ${data.partner}`}
                    </h2>
                    <p className="text-sm mb-2">
                      Период с {data.date_from} по {data.date_to}
                    </p>
                  </div>
                </th>
              </tr>
              <tr>
                <th className="border border-black p-1">Дата</th>
                <th className="border border-black p-1">Операции</th>
                <th className="border border-black p-1 text-right">Дебет</th>
                <th className="border border-black p-1 text-right">Кредит</th>
                <th className="border border-black p-1 text-right">Текущее сальдо</th>
              </tr>
            </thead>
            <tbody>
              {/* Начальный баланс */}
              <tr className="font-semibold bg-gray-100">
                <td className="border border-black p-1">{data.date_from}</td>
                <td className="border border-black p-1">Saldo на начало</td>
                <td className="border border-black p-1 text-right">{data.saldo_start}</td>
                <td className="border border-black p-1 text-right"></td>
                <td className="border border-black p-1 text-right">{data.saldo_start}</td>
              </tr>

              {/* Операции */}
              {data.movements.map((m, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-1">{m.date}</td>
                  <td className="border border-black p-1">{m.description}</td>
                  <td className="border border-black p-1 text-right">{m.debit}</td>
                  <td className="border border-black p-1 text-right">{m.credit}</td>
                  <td className="border border-black p-1 text-right">{m.saldo}</td>
                </tr>
              ))}

              {/* Обороты */}
              <tr className="font-semibold bg-gray-200">
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1">Обороты за период</td>
                <td className="border border-black p-1 text-right">{data.debit_turnover}</td>
                <td className="border border-black p-1 text-right">{data.credit_turnover}</td>
                <td className="border border-black p-1 text-right"></td>
              </tr>

              {/* Конечный баланс */}
              <tr className="font-semibold bg-gray-100">
                <td className="border border-black p-1">{data.date_to}</td>
                <td className="border border-black p-1">Saldo на конец</td>
                <td className="border border-black p-1 text-right">{data.saldo_end}</td>
                <td className="border border-black p-1 text-right"></td>
                <td className="border border-black p-1 text-right">{data.saldo_end}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default AccountCardDetail;
