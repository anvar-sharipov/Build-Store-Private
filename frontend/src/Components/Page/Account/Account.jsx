import React, { useState, useEffect } from "react";
import myAxios from "../../axios";

const Account = () => {
  const [currencies, setCurrencies] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    type: "",
    currency_id: "",
  });
  const [success, setSuccess] = useState(false);

  const accountTypes = {
    asset: "Актив",
    liability: "Пассив",
    income: "Доход",
    expense: "Расход",
  };

  useEffect(() => {
    fetchCurrencies();
    fetchAccounts();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const res = await myAxios.get("/currencys/");
      setCurrencies(res.data);
    } catch (err) {
      console.error("Ошибка загрузки валют:", err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await myAxios.get("/accounts/");
      setAccounts(res.data);
    } catch (err) {
      console.error("Ошибка загрузки счетов:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await myAxios.post("/accounts/", formData);
      setSuccess(true);
      setFormData({ number: "", name: "", type: "", currency_id: "" });
      fetchAccounts(); // обновляем список после добавления
    } catch (error) {
      setSuccess(false);
      console.error("Ошибка при создании счёта:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Добавить новый счёт</h2>

      {success && <p className="text-green-600 mb-2">Счёт успешно создан!</p>}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 mb-6 bg-white p-4 shadow rounded"
      >
        <input
          type="text"
          name="number"
          value={formData.number}
          onChange={handleChange}
          placeholder="Номер счёта (например 01.1)"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Название счёта"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Выберите тип счёта</option>
          {Object.entries(accountTypes).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          name="currency_id"
          value={formData.currency_id}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Выберите валюту</option>
          {currencies.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.symbol} ({currency.code}) — {currency.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Сохранить счёт
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">Список счетов</h3>
      <table className="w-full text-left border-collapse bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 border">Номер</th>
            <th className="px-3 py-2 border">Название</th>
            <th className="px-3 py-2 border">Тип</th>
            <th className="px-3 py-2 border">Валюта</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 border">{acc.number}</td>
              <td className="px-3 py-2 border">{acc.name}</td>
              <td className="px-3 py-2 border">{accountTypes[acc.type]}</td>
              <td className="px-3 py-2 border">
                {acc.currency?.symbol} ({acc.currency?.code})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Account;
