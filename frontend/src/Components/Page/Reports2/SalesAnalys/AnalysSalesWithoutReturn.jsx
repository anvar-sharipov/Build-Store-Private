import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import myAxios from "../../../axios";
import MyLoading2 from "../../../UI/MyLoading2";



const AnalysSalesWithoutReturn = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    document.title = "Анализ движения товаров";
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      setMessage("");
    } else {
      setMessage("error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("empty");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      const res = await myAxios.post("/upload_sales_excel_for_analis_with_return/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = res.headers["content-disposition"];
      let fileName = "sales_analysis.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match && match[1]) fileName = match[1];
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setMessage("success");
      setTimeout(() => setFile(null), 2000);
    } catch (error) {
      console.error("Ошибка при загрузке:", error);
      setMessage("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4"
          >
            <FileSpreadsheet className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Анализ продаж с учётом возврата
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Загрузите Excel-файл для получения детального анализа
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
        >
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <MyLoading2 />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-gray-600 dark:text-gray-400 font-medium"
              >
                Обработка файла...
              </motion.p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag & Drop Zone */}
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.01 }}
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : file 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-900/50'
                  }`}
              >
                <input
                  type="file"
                  name="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  <motion.div
                    animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                    className={`p-4 rounded-full ${
                      file 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                  >
                    {file ? (
                      <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    ) : (
                      <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    )}
                  </motion.div>

                  <div className="text-center">
                    {file ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          Перетащите файл сюда
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          или нажмите для выбора
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Поддерживаются форматы: XLS, XLSX
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!file}
                className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300
                  ${file 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/50' 
                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Получить анализ
                </span>
              </motion.button>
            </form>
          )}

          {/* Message Alert */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-6"
              >
                <div className={`flex items-start gap-3 p-4 rounded-xl ${
                  message === "success" 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {message === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      message === "success" 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {message === "success" && "Файл успешно загружен!"}
                      {message === "error" && "Ошибка при загрузке файла"}
                      {message === "empty" && "Пожалуйста, выберите файл"}
                    </p>
                    {message === "success" && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Анализ готов к использованию
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
        >
          {[
            { icon: FileSpreadsheet, text: "Excel файлы", color: "blue" },
            { icon: Loader2, text: "Быстрая обработка", color: "purple" },
            { icon: Download, text: "Готовый анализ", color: "green" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center shadow-sm"
            >
              <item.icon className={`w-6 h-6 mx-auto mb-2 text-${item.color}-600 dark:text-${item.color}-400`} />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnalysSalesWithoutReturn;