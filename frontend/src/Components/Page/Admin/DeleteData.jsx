import { useState } from "react";
import myAxios from "../../axios";

const DeleteData = () => {
  const [selectedModel, setSelectedModel] = useState("delete_partners");
  const [password, setPassword] = useState("");

  const options = [
    { value: "delete_partners", label: "Delete Partners" },
    { value: "delete_products", label: "Delete Products" },
    { value: "delete_agents", label: "Delete agents" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault(); // чтобы страница не перезагружалась
    try {
      const res = await myAxios.get("delete_data", {
        params: {
          models_name: selectedModel,
          password: password, // отправляем пароль на бэкенд
        },
      });
      
      if (res.data.date_focus) {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // "2025-10-04"
        localStorage.setItem("date_margin", formattedDate);
        const setDateMargin = async () => {
          try {
            const res = await myAxios.post("set_date_focus/");
          } catch (error) {
            console.log("cant set date focus", error);
          }
        };
        setDateMargin()
      }
      if (res.data.success) {
        alert("Данные успешно удалены!");
      } else {
        alert("Неверный пароль!");
      }
    } catch (error) {
      console.error("Error deleting models:", error);
      alert("Ошибка при удалении данных");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <label htmlFor="delete_data" className="block mb-2 text-gray-700 font-semibold">
        Выберите действие:
      </label>
      <select
        id="delete_data"
        name="delete_data"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o, idx) => (
          <option key={idx} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label htmlFor="password" className="block mb-2 text-gray-700 font-semibold">
        Пароль:
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Введите пароль"
        className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button type="submit" className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
        Submit
      </button>
    </form>
  );
};

export default DeleteData;
