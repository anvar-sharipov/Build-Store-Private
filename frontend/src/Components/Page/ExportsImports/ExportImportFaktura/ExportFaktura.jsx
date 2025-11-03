import { useState, useContext, useCallback, useRef } from "react";
import { Calendar, FileText, Download, Search, CheckSquare, Square, Upload, Import } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DateContext } from "../../../UI/DateProvider";
import { useTranslation } from "react-i18next";
import myAxios from "../../../axios";
import { formatNumber } from "../../../UI/formatNumber";
import MyFormatDate from "../../../UI/MyFormatDate";

const ExportFaktura = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);

  const [invoices, setInvoices] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const fileInputRef = useRef(null);

  // Функция для сохранения результатов в файл
  const saveImportResultsToFile = (results, importData) => {
    if (!results || !importData) return;

    try {
      // Создаем массивы для успешных и неуспешных операций
      const successfulInvoices = [];
      const failedInvoices = [];

      // Сопоставляем результаты с исходными данными
      results.details.forEach((detail, index) => {
        const originalInvoice = importData.invoices[index];
        if (!originalInvoice) return;

        const invoiceInfo = {
          invoice_number: originalInvoice.id || "unknown",
          partner_name: originalInvoice.partner?.name || originalInvoice.partner || "N/A",
          is_entry: originalInvoice.is_entry ? "Да" : "Нет",
          date_invoice: originalInvoice.invoice_date || "N/A",
          total_price: originalInvoice.total_selected_price || originalInvoice.total_price || 0,
          status: detail.status,
          message: detail.message,
        };

        if (detail.status === "success") {
          successfulInvoices.push(invoiceInfo);
        } else {
          failedInvoices.push(invoiceInfo);
        }
      });

      // Создаем содержимое для файла
      let fileContent = "Импорт фактур - Результаты\n";
      fileContent += `Дата импорта: ${new Date().toLocaleString()}\n`;
      fileContent += `Успешно: ${results.success}, Ошибки: ${results.errors}\n\n`;

      if (successfulInvoices.length > 0) {
        fileContent += "=== УСПЕШНО СОХРАНЕННЫЕ ФАКТУРЫ ===\n";
        fileContent += "№ Фактуры;Партнер;Проведена;Дата;Сумма;Статус\n";
        successfulInvoices.forEach((inv) => {
          fileContent += `${inv.invoice_number};"${inv.partner_name}";${inv.is_entry};${inv.date_invoice};${formatNumber(inv.total_price, 3)};${inv.status}\n`;
        });
        fileContent += "\n";
      }

      if (failedInvoices.length > 0) {
        fileContent += "=== НЕСОХРАНЕННЫЕ ФАКТУРЫ ===\n";
        fileContent += "№ Фактуры;Партнер;Проведена;Дата;Сумма;Статус;Ошибка\n";
        failedInvoices.forEach((inv) => {
          fileContent += `${inv.invoice_number};"${inv.partner_name}";${inv.is_entry};${inv.date_invoice};${formatNumber(inv.total_price, 3)};${inv.status};"${inv.message}"\n`;
        });
      }

      // Создаем и скачиваем файл
      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `import_results_${new Date().toISOString().slice(0, 10)}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error saving import results:", err);
      setError("Ошибка при сохранении результатов импорта");
    }
  };

  // Функция для сохранения в Excel формате (CSV)
  const saveImportResultsToExcel = (results, importData) => {
    if (!results || !importData) return;

    try {
      const allInvoices = [];

      // Собираем все данные
      results.details.forEach((detail, index) => {
        const originalInvoice = importData.invoices[index];
        if (!originalInvoice) return;

        allInvoices.push({
          "Номер фактуры": originalInvoice.id_test_faktura || "unknown",
          Партнер: originalInvoice.partner?.name || originalInvoice.partner || "N/A",
          Проведена: originalInvoice.is_entry ? "Да" : "Нет",
          "Дата фактуры": originalInvoice.invoice_date || "N/A",
          "Общая сумма": originalInvoice.total_selected_price || originalInvoice.total_price || 0,
          "Статус импорта": detail.status === "success" ? "Успешно" : "Ошибка",
          Сообщение: detail.message,
          "Новый номер фактуры": detail.status === "success" ? detail.id_test_faktura : "N/A",
          isError: detail.status !== "success", // Флаг для ошибки
        });
      });

      // Создаем CSV содержимое с поддержкой цветов через HTML
      let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <title>Import Results</title>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Import Results</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th {
            background-color: #f2f2f2;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .error-row {
            background-color: #ffebee;
            color: #c62828;
          }
          .success-row {
            background-color: #ffffff;
          }
        </style>
      </head>
      <body>
        <h2>Результаты импорта фактур</h2>
        <p><strong>Дата импорта:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Статистика:</strong> Успешно: ${results.success}, Ошибки: ${results.errors}</p>
        <table>
          <thead>
            <tr>
              <th>Номер фактуры</th>
              <th>Партнер</th>
              <th>Проведена</th>
              <th>Дата фактуры</th>
              <th>Общая сумма</th>
              <th>Статус импорта</th>
              <th>Сообщение</th>
              <th>Новый номер фактуры</th>
            </tr>
          </thead>
          <tbody>
    `;

      // Добавляем строки таблицы
      allInvoices.forEach((inv) => {
        const rowClass = inv.isError ? "error-row" : "success-row";

        htmlContent += `
        <tr class="${rowClass}">
          <td>${inv["Номер фактуры"]}</td>
          <td>${inv["Партнер"]}</td>
          <td>${inv["Проведена"]}</td>
          <td>${inv["Дата фактуры"]}</td>
          <td>${formatNumber(inv["Общая сумма"], 3)}</td>
          <td>${inv["Статус импорта"]}</td>
          <td>${inv["Сообщение"]}</td>
          <td>${inv["Новый номер фактуры"]}</td>
        </tr>
      `;
      });

      htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

      // Создаем и скачиваем файл
      const blob = new Blob(["\uFEFF" + htmlContent], {
        type: "application/vnd.ms-excel",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `import_results_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error saving Excel results:", err);
      setError("Ошибка при сохранении Excel файла");
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await myAxios.get("/get-invoice-list", {
        params: { dateFrom, dateTo },
      });
      setInvoices(res.data.data || []);
      setSelectedIds([]);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(t("error_fetching_invoices") || "Failed to fetch invoices");
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === invoices.length ? [] : invoices.map((inv) => inv.id)));
  }, [invoices]);

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) return;

    setIsLoading(true);
    try {
      const res = await myAxios.post(
        "/export-invoices-json/",
        {
          invoiceIds: selectedIds,
          format: "json",
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoices_export_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      setError(t("export_error") || "Export failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для обработки импорта файла
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setError("Please select a JSON file");
      return;
    }

    setImportLoading(true);
    setError("");
    setImportResults(null);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        await processImportData(jsonData, file.name);
      } catch (err) {
        console.error("Error parsing JSON:", err);
        setError("Invalid JSON file format");
        setImportLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setImportLoading(false);
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  // Обработка импортированных данных с сохранением исходного файла
  const processImportData = async (importData, fileName) => {
    try {
      const results = {
        success: 0,
        errors: 0,
        details: [],
        fileName: fileName,
        importTime: new Date().toISOString(),
      };

      if (!importData.invoices || !Array.isArray(importData.invoices)) {
        setError("Invalid file format: expected 'invoices' array");
        setImportLoading(false);
        return;
      }

      // Сохраняем исходные данные для последующего экспорта
      const originalImportData = { ...importData };

      for (const invoiceData of importData.invoices) {
        // console.log("invoiceData", invoiceData);
        try {
          if (invoiceData.status === "error") {
            results.details.push({
              id: invoiceData.id || "unknown",
              status: "error",
              message: invoiceData.message || "Invoice had error during export",
            });
            results.errors++;
            continue;
          }

          const cleanData = {
            is_entry: invoiceData.is_entry,
            id_test_faktura: invoiceData.id_test_faktura,
            awto: invoiceData.awto,
            awto_send: invoiceData.awto_send,
            partner: invoiceData.partner,
            partner_send: invoiceData.partner_send,
            send: invoiceData.send,
            invoice_date: invoiceData.invoice_date,
            products: invoiceData.products,
            type_price: invoiceData.type_price,
            warehouse: invoiceData.warehouse,
            warehouse2: invoiceData.warehouse2,
            wozwrat_or_prihod: invoiceData.wozwrat_or_prihod,
            comment: invoiceData.comment,
          };
          console.log("invoiceData.id_test_faktura", invoiceData.id_test_faktura);

          console.log("Sending clean data to save-invoice:", cleanData);

          const response = await myAxios.post("/save-invoice/", cleanData);

          if (response.data.status === "ok") {
            results.details.push({
              id: response.data.id,
              status: "success",
              message: t("Invoice imported successfully with new ID: ") + response.data.id,
              id_test_faktura: invoiceData.id_test_faktura,
            });
            results.success++;
          } else {
            results.details.push({
              id: "unknown",
              status: "error",
              message: t(response.data.message) || "Unknown error",
              id_test_faktura: invoiceData.id_test_faktura,
            });
            results.errors++;
          }
        } catch (err) {
          console.error("Error importing invoice:", err);
          const errorMessage = err.response?.data?.message || err.response?.data?.reason_for_the_error || err.message || "Import failed";

          results.details.push({
            id: invoiceData.id || "unknown",
            status: "error",
            message: t(errorMessage),
            id_test_faktura: invoiceData.id_test_faktura,
          });
          results.errors++;
        }
      }
      // console.log("results", results);

      setImportResults(results);

      // Автоматически сохраняем результаты после импорта
      if (results.details.length > 0) {
        setTimeout(() => {
          saveImportResultsToExcel(results, originalImportData);
        }, 1000);
      }

      if (results.success > 0) {
        handleExport();
      }
    } catch (err) {
      console.error("Import processing error:", err);
      setError("Error processing import data: " + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // Ручное сохранение результатов
  const handleSaveResults = (format = "excel") => {
    if (!importResults) return;

    // Нужно переимпортировать исходный файл или хранить его в состоянии
    // В реальном приложении нужно хранить originalImportData в состоянии
    setError("Для сохранения результатов перезагрузите исходный JSON файл");
  };

  const getStatusColor = (type) => {
    return type === "wozwrat" ? "text-red-500" : "text-green-500";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 space-y-6 border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t("export_faktura")}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {MyFormatDate(dateFrom)} - {MyFormatDate(dateTo)}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Import Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t("select_period_to_search")}</p>
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              {isLoading ? t("searching") : t("search2")}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t("Import invoices from JSON")}</p>
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" className="hidden" />
              <button
                onClick={triggerFileInput}
                disabled={importLoading}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {importLoading ? t("Importing...") : t("Import JSON")}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Import Results */}
        <AnimatePresence>
          {importResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-green-800 dark:text-green-400">
                  {t("Import Results:")} {importResults.success} {t("successful")}, {importResults.errors} {t("failed")}
                </h3>
                <button
                  onClick={() => saveImportResultsToExcel(importResults, { invoices: [] })}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1 px-3 rounded transition-all duration-200"
                >
                  <Download className="w-3 h-3" />
                  {t("Save Results to excel file")}
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto text-sm">
                {importResults.details.map((detail, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-1 px-2 rounded ${
                      detail.status === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }`}
                  >
                    <span>
                      {t("Invoice")} № {detail.id_test_faktura}
                    </span>
                    <span className="text-xs">{detail.message}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Остальной код остается без изменений */}
        {/* Invoices List */}
        <AnimatePresence>
          {invoices.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-6">
              {/* Header with select all */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                    {selectedIds.length === invoices.length ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5 text-gray-400" />}
                    <span>
                      {selectedIds.length} {t("selected_of")} {invoices.length}
                    </span>
                  </button>
                </div>

                <div className="flex gap-2">
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleExportSelected}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {t("export_selected")} ({selectedIds.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Invoices */}
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {invoices.map((inv, index) => (
                  <motion.div
                    key={inv.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 group"
                  >
                    <label className="flex items-center gap-4 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                        className="w-4 h-4 text-indigo-500 rounded border-gray-300 dark:border-gray-500 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">№ {inv.id}</span>
                          <span className={`text-sm font-medium ${getStatusColor(inv.wozwrat_or_prihod)}`}>{t(inv.wozwrat_or_prihod)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{inv.partner}</p>
                          <div
                            className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                              inv.is_entry ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            }`}
                          >
                            {inv.is_entry ? "✓ Проведена" : "⏳ Не проведена"}
                          </div>
                        </div>
                      </div>
                    </label>

                    <div className="flex items-center gap-4 ml-4">
                      <span className="font-bold text-gray-800 dark:text-gray-100">{formatNumber(inv.total_selected_price, 3)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {invoices.length === 0 && !isLoading && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">{t("no_invoices_found")}</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">{t("select_period_and_search")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ExportFaktura;
