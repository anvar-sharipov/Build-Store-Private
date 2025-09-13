import React, { useRef, useState, useCallback, useEffect } from "react";
import Notification from "../../Notification";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ImportPartners = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const { t } = useTranslation();

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };
  const location = useLocation();
  useEffect(() => {
    if (location.state?.notification) {
      showNotification(location.state.notification, "success");
    }
  }, [location.state]);

  const API_URL = import.meta.env.VITE_BASE_URL + "/api/admin-import-partners/";

  const handleFileSelect = (f) => {
    setFile(f);
    setMessage("");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFileSelect(f);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleBrowse = () => inputRef.current?.click();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Выберите файл для загрузки");
      return;
    }

    setLoading(true);
    setProgress(0);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_URL, true);

    // Прогресс загрузки
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setLoading(false);

      try {
        const res = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          setMessage(res.detail || "Файл успешно загружен!");
          showNotification(res.detail, "success");
          setFile(null);
          setProgress(100);
        } else {
          setMessage(res.detail || "Ошибка загрузки файла");
          showNotification(t(res.detail), "error");
        }
      } catch (err) {
        setMessage("Ошибка обработки ответа сервера");
      }
    };

    xhr.onerror = () => {
      setLoading(false);
      setMessage("Ошибка сети при загрузке файла");
    };

    xhr.send(formData);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">Импорт товаров</h2>

      {/* Статическое предупреждение */}
      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
        Если изменить имя, добавится новый партнер. Например, если "Aman" заменить на "aman", то будет два партнера: первый "Aman", второй "aman". Имя менять нельзя, но добавлять новые можно. Поле
        type должно быть либо "klient", либо "founder".
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={[
            "rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer",
            dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/40" : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700",
          ].join(" ")}
          onClick={handleBrowse}
        >
          <p className="text-gray-600 dark:text-gray-300">
            Перетащите файл <span className="font-medium">.xlsx/.xls</span> сюда или кликните
          </p>
          {file && <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">Выбран: {file.name}</p>}
          <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0])} />
        </div>

        {/* Progress */}
        {loading && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {/* Сообщение */}
        {message && <p className="text-center text-sm mt-2 text-gray-700 dark:text-gray-200">{message}</p>}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md transition dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? "Загрузка..." : "Загрузить"}
        </button>
      </form>

      <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
    </div>
  );
};

export default ImportPartners;
