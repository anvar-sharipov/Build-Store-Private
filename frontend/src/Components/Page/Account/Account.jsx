import { useState, useEffect } from "react";
import { Edit3, Plus, Check, X, User, CreditCard, TrendingUp, TrendingDown, DollarSign, BarChart3, Trash2 } from "lucide-react";
import myAxios from "../../axios";

const Account = () => {
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    type: "asset",
    description: "",
    parent: "",
    is_active: true,
  });

  const [accounts, setAccounts] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchAccounts = () => {
    myAxios
      .get("accounts/")
      .then((res) => setAccounts(res.data))
      .catch(() => setAccounts([]));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Вы уверены, что хотите удалить счёт?");
    if (!confirm) return;

    try {
      await myAxios.delete(`accounts/${id}/`);
      setSuccess("Счёт успешно удалён!");
      setError(null);
      fetchAccounts();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError("Ошибка при удалении счёта.");
      setSuccess(null);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await myAxios.put(`accounts/${editId}/`, formData);
        setSuccess("Счёт успешно обновлён!");
      } else {
        await myAxios.post("accounts/", formData);
        setSuccess("Счёт успешно добавлен!");
      }

      setError(null);
      setFormData({
        number: "",
        name: "",
        type: "asset",
        description: "",
        parent: "",
        is_active: true,
      });
      setEditId(null);
      setIsFormVisible(false);
      fetchAccounts();
      
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError("Ошибка при сохранении счёта.");
      setSuccess(null);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleEdit = (account) => {
    setFormData({
      number: account.number,
      name: account.name,
      type: account.type,
      description: account.description || "",
      parent: account.parent || "",
      is_active: account.is_active,
    });
    setEditId(account.id);
    setSuccess(null);
    setError(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setFormData({
      number: "",
      name: "",
      type: "asset",
      description: "",
      parent: "",
      is_active: true,
    });
    setEditId(null);
    setError(null);
    setSuccess(null);
    setIsFormVisible(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "asset": return <CreditCard className="w-4 h-4" />;
      case "liability": return <TrendingDown className="w-4 h-4" />;
      case "income": return <TrendingUp className="w-4 h-4" />;
      case "expense": return <DollarSign className="w-4 h-4" />;
      case "both": return <BarChart3 className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "asset": return "text-blue-600 bg-blue-50";
      case "liability": return "text-red-600 bg-red-50";
      case "income": return "text-green-600 bg-green-50";
      case "expense": return "text-orange-600 bg-orange-50";
      case "both": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "asset": return "Актив";
      case "liability": return "Пассив";
      case "income": return "Доход";
      case "expense": return "Расход";
      case "both": return "Актив/Пассив";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Управление счетами</h1>
          <p className="text-gray-600">Создавайте и управляйте счетами вашей компании</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl shadow-sm flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600" />
              {success}
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm flex items-center gap-3">
              <X className="w-5 h-5 text-red-600" />
              {error}
            </div>
          </div>
        )}

        {/* Add Account Button */}
        {!isFormVisible && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setIsFormVisible(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Добавить новый счёт
            </button>
          </div>
        )}

        {/* Form */}
        {isFormVisible && (
          <div className="mb-8 animate-in slide-in-from-top duration-500">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {editId ? <Edit3 className="w-6 h-6 text-blue-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
                  {editId ? "Редактировать счёт" : "Добавить новый счёт"}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Номер счёта</label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    placeholder="Введите номер счёта"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Название</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    placeholder="Введите название счёта"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Тип счёта</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    required
                  >
                    <option value="asset">Актив</option>
                    <option value="liability">Пассив</option>
                    <option value="income">Доход</option>
                    <option value="expense">Расход</option>
                    <option value="both">Актив и Пассив</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Родительский счёт</label>
                  <select
                    name="parent"
                    value={formData.parent}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 transition-colors"
                  >
                    <option value="">Нет родительского счёта</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.number} - {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Описание</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-0 transition-colors resize-none"
                    placeholder="Введите описание счёта"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                      Счёт активен
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {editId ? "Сохранить изменения" : "Добавить счёт"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800">Список счетов</h3>
            <p className="text-gray-600 mt-1">Всего счетов: {accounts.length}</p>
          </div>

          {accounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Номер</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Тип</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Родитель</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accounts.map((acc, index) => (
                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors duration-150" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{acc.number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{acc.name}</div>
                        {acc.description && (
                          <div className="text-sm text-gray-500 mt-1">{acc.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(acc.type)}`}>
                          {getTypeIcon(acc.type)}
                          {getTypeLabel(acc.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {accounts.find((a) => a.id === acc.parent)?.number || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          acc.is_active 
                            ? "text-green-800 bg-green-100" 
                            : "text-red-800 bg-red-100"
                        }`}>
                          {acc.is_active ? "Активен" : "Неактивен"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(acc)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <Edit3 className="w-4 h-4" />
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(acc.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <CreditCard className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Счета отсутствуют</h3>
              <p className="text-gray-500 mb-6">Создайте свой первый счёт для начала работы</p>
              <button
                onClick={() => setIsFormVisible(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Добавить счёт
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;