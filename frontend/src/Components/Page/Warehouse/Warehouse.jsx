import { useEffect, useState } from "react";
import myAxios from "../../axios";

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await myAxios.get("/warehouses/");
      setWarehouses(res.data);
    } catch (error) {
      console.error("Ошибка при загрузке складов", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, location, is_active: isActive };
      if (editingId) {
        await myAxios.put(`/warehouses/${editingId}/`, payload);
      } else {
        await myAxios.post("/warehouses/", payload);
      }
      setName("");
      setLocation("");
      setIsActive(true);
      setEditingId(null);
      fetchWarehouses();
    } catch (error) {
      console.error("Ошибка при сохранении склада", error);
    }
  };

  const handleEdit = (warehouse) => {
    setName(warehouse.name);
    setLocation(warehouse.location);
    setIsActive(warehouse.is_active);
    setEditingId(warehouse.id);
  };

  const handleCancel = () => {
    setName("");
    setLocation("");
    setIsActive(true);
    setEditingId(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 dark:bg-gray-900 dark:text-white transition">
      <h2 className="text-2xl font-bold mb-4">
        {editingId ? "Изменить склад" : "Добавить склад"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Название склада"
          className="w-full px-4 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring focus:border-blue-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Адрес (необязательно)"
          className="w-full px-4 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring focus:border-blue-400"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800"
          />
          <span>Активен</span>
        </label>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition"
          >
            {editingId ? "Сохранить изменения" : "Добавить"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded-md transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      <h3 className="text-xl font-semibold mb-2">Список складов</h3>
      <ul className="space-y-2">
        {warehouses.map((w) => (
          <li
            key={w.id}
            className="flex justify-between items-center border rounded-md px-4 py-2 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <div>
              <div className="font-medium">{w.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {w.location || "Без адреса"}
              </div>
              <div className={`text-sm font-semibold ${w.is_active ? "text-green-600" : "text-red-500"}`}>
                {w.is_active ? "Активен" : "Неактивен"}
              </div>
            </div>
            <button
              onClick={() => handleEdit(w)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm dark:text-blue-400 dark:hover:text-blue-300"
            >
              Изменить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Warehouse;
