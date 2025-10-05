import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLock } from "react-icons/fi";
import myAxios from "./axios";
import { useTranslation } from "react-i18next";
import Notification from "./Notification";
import { ROUTES } from "../routes";

export default function Login() {
  const { t } = useTranslation();
  const location = useLocation();

  const [notification, setNotification] = useState({ message: "", type: "" });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // useEffect(() => {
  //   if (location.state?.message && location.state?.type) {
  //     setNotification({
  //       message: location.state?.message,
  //       type: location.state?.type,
  //     });
  //     setTimeout(() => {
  //       setNotification({
  //         message: "",
  //         type: "",
  //       });
  //     }, 3000);
  //   }
  // }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorKey = params.get("error");

    if (errorKey) {
      setNotification({
        message: t(errorKey),
        type: "error",
      });

      // убираем параметр из URL, чтобы при обновлении не показывалось снова
      window.history.replaceState({}, "", "/login");
    }

    if (location.state?.message && location.state?.type) {
      setNotification({
        message: t(location.state.message),
        type: location.state.type,
      });
      setTimeout(() => {
        setNotification({
          message: "",
          type: "",
        });
      }, 3000);
    }
  }, [location]);

  const login = (e) => {
    e.preventDefault();
    myAxios
      .post("token/", { username, password })
      .then((res) => {
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        setMessageType("success");
        setMessage("Успешный вход");
        window.location = ROUTES.PURCHASEINVOICE;
      })
      .catch(() => {
        setMessageType("error");
        setMessage("Ошибка входа");
      });
  };

  useEffect(() => {
    document.title = "Login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 mt-10">
      {/* Уведомление о доступе */}
      <Notification
        message={t(notification.message)}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />
      <form
        onSubmit={login}
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
          {t("login2")}
        </h2>

        <div className="relative mb-6">
          <FiUser className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-300 text-lg" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("userName")}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-800 dark:text-white 
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>

        <div className="relative mb-6">
          <FiLock className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-300 text-lg" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-800 dark:text-white 
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
        >
          {t("login")}
        </button>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-6 p-3 rounded text-center font-medium shadow-sm
                ${
                  messageType === "success"
                    ? "bg-green-100 dark:bg-green-200 text-green-700"
                    : "bg-red-100 dark:bg-red-200 text-red-700"
                }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
