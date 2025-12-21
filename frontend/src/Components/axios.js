// axiosInstance.js
import axios from "axios";
import { useEffect } from "react";
// const API_BASE = import.meta.env.VITE_BASE_URL;
const API_BASE = import.meta.env.VITE_BASE_URL || "";
// console.log('API_BASE', API_BASE);



const myAxios = axios.create({
  // baseURL: "http://localhost:8000/api/",
  baseURL: `${API_BASE}/api/`,
});

// Добавляем access токен в каждый запрос
myAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// Создаем отдельный экземпляр для refresh запросов (без interceptors)
const refreshAxios = axios.create({
  // baseURL: "http://localhost:8000/api/",
  baseURL: `${API_BASE}/api/`,
});

// Обработка 401 ошибок и попытка обновить токен
myAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если получили 401 и запрос ещё не повторяли
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        
        // Проверяем наличие refresh токена
        if (!refresh) {
          throw new Error("No refresh token");
        }

        // ВАЖНО: используем refreshAxios вместо обычного axios
        const res = await refreshAxios.post("token/refresh/", {
          refresh: refresh,
        });

        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);

        // Применяем новый access токен и повторяем запрос
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return myAxios(originalRequest);
        
      } catch (err) {
        // Не удалось обновить — очищаем токены и редирект на логин
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        
        // Предотвращаем множественные редиректы
        if (window.location.pathname !== "/login") {
          // window.location.href = "/login";
          const errorParam = encodeURIComponent("youDidntAuthenticated");
          window.location.href = `/login?error=${errorParam}`;
        }
        
        return Promise.reject(err);
      }
    }

    // Если ошибка не 401 или уже повторяли — пробрасываем
    return Promise.reject(error);
  }
);

export default myAxios;