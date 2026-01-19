import myAxios from "../../axios";
import { useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import { useTranslation } from "react-i18next";

const Univresal = () => {
  const { t } = useTranslation();

  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    type: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sendData = async () => {
      try {
        const res = await myAxios.post("/admin/universal/", formData);
        console.log("res", res);
        showNotification(t(res.data.message), "success");
      } catch (error) {
        console.error("Error submitting form:", error);
        showNotification(t(error.response.data.message), "error");
      } finally {
      }
    };
    sendData();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 text-center">Universal Form</h2>

        {/* Select */}
        <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          <option value="">Select type</option>
          <option value="change_one_coin_1">change s 1 504 932,65 na 1 504 932,66</option>
          <option value="change_one_coin_1_for_account_75">change_one_coin_1_for_account_75</option>
          
        </select>

        {/* Text input */}
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="password"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Univresal;
