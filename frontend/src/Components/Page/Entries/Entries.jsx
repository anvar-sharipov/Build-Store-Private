import { useEffect, useState, useContext } from "react";
import myAxios from "../../axios";
import { DateContext } from "../../UI/DateProvider";

const Entries = () => {
  const { dateProwodok, setDateProwodok } = useContext(DateContext);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    date: dateProwodok || "",
    debit: "",
    credit: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await myAxios.get("accounts");
        setAccounts(res.data);
      } catch (error) {
        console.log("error get accounts", error);
      }
    };
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "date") {
      setDateProwodok(e.target.value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: dateProwodok,
    }));
  }, [dateProwodok]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);

    try {
      const res = await myAxios.post("universal_entries/", formData);
      if (res.data.success) {
        alert(`Проводка добавлена! ID транзакции: ${res.data.transaction_id}`);

        // Очистка формы после успешного добавления
        setFormData({
          date: dateProwodok || "",
          debit: "",
          credit: "",
          amount: "",
          description: "",
        });
      } else {
        alert("Ошибка при добавлении проводки");
      }
    } catch (error) {
      console.error("Ошибка при отправке проводки:", error);
      alert("Произошла ошибка на сервере. Проверьте консоль.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Добавить проводку</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
        {/* Дата */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 text-gray-700 dark:text-gray-300">Дата</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
        </div>

        {/* Сумма */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 text-gray-700 dark:text-gray-300">Сумма</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="0.00"
          />
        </div>

        {/* Дебет */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 text-gray-700 dark:text-gray-300">Дебет</label>
          <select name="debit" value={formData.debit} onChange={handleChange} className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">Выберите счет</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.number}>
                {acc.number} — {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Кредит */}
        <div className="flex flex-col">
          <label className="text-sm mb-1 text-gray-700 dark:text-gray-300">Кредит</label>
          <select name="credit" value={formData.credit} onChange={handleChange} className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option value="">Выберите счет</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.number}>
                {acc.number} — {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Описание */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm mb-1 text-gray-700 dark:text-gray-300">Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Например: Продажа товара за наличные"
          />
        </div>

        {/* Кнопка */}
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 dark:hover:bg-blue-500 transition">
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
};

export default Entries;
