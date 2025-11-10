import { useState, useContext, useCallback, useRef, useEffect } from "react";
import { Calendar, FileText, Download, Search, CheckSquare, Square, Upload, Import } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DateContext } from "../../UI/DateProvider";
import { useTranslation } from "react-i18next";
import myAxios from "../../axios";
import { formatNumber } from "../../UI/formatNumber";
import MyFormatDate from "../../UI/MyFormatDate";

const ExportImportEntries = () => {
  const { t } = useTranslation();
  const { dateFrom, dateTo } = useContext(DateContext);

  const [entries, setEntries] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
      document.title = t("export_import_entry")
    }, [t])

  // Функция для сохранения результатов в файл
  const saveImportResultsToFile = (results, importData) => {
    if (!results || !importData) return;

    try {
      const successfulEntries = [];
      const failedEntries = [];

      results.details.forEach((detail, index) => {
        const originalEntry = importData.entries[index];
        if (!originalEntry) return;

        const entryInfo = {
          transaction_id: originalEntry.transaction_id || "unknown",
          description: originalEntry.description || "N/A",
          date: originalEntry.date || "N/A",
          debit_account: originalEntry.debit_account?.number || originalEntry.debit_account_number,
          credit_account: originalEntry.credit_account?.number || originalEntry.credit_account_number,
          amount: originalEntry.amount || 0,
          partner: originalEntry.partner?.name || originalEntry.partner_name || "N/A",
          status: detail.status,
          message: detail.message,
        };

        if (detail.status === "success") {
          successfulEntries.push(entryInfo);
        } else {
          failedEntries.push(entryInfo);
        }
      });

      let fileContent = "Импорт проводок - Результаты\n";
      fileContent += `Дата импорта: ${new Date().toLocaleString()}\n`;
      fileContent += `Успешно: ${results.success}, Ошибки: ${results.errors}\n\n`;

      if (successfulEntries.length > 0) {
        fileContent += "=== УСПЕШНО СОХРАНЕННЫЕ ПРОВОДКИ ===\n";
        fileContent += "ID;Дата;Описание;Дебет;Кредит;Сумма;Партнер;Статус\n";
        successfulEntries.forEach((entry) => {
          fileContent += `${entry.transaction_id};${entry.date};"${entry.description}";${entry.debit_account};${entry.credit_account};${formatNumber(entry.amount, 2)};"${entry.partner}";${entry.status}\n`;
        });
        fileContent += "\n";
      }

      if (failedEntries.length > 0) {
        fileContent += "=== НЕСОХРАНЕННЫЕ ПРОВОДКИ ===\n";
        fileContent += "ID;Дата;Описание;Дебет;Кредит;Сумма;Партнер;Статус;Ошибка\n";
        failedEntries.forEach((entry) => {
          fileContent += `${entry.transaction_id};${entry.date};"${entry.description}";${entry.debit_account};${entry.credit_account};${formatNumber(entry.amount, 2)};"${entry.partner}";${entry.status};"${entry.message}"\n`;
        });
      }

      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `import_entries_results_${new Date().toISOString().slice(0, 10)}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error saving import results:", err);
      setError("Ошибка при сохранении результатов импорта");
    }
  };

  // Функция для сохранения в Excel формате
  const saveImportResultsToExcel = (results, importData) => {
    if (!results || !importData) return;

    try {
      const allEntries = [];

      results.details.forEach((detail, index) => {
        const originalEntry = importData.entries[index];
        if (!originalEntry) return;

        allEntries.push({
          "ID транзакции": originalEntry.transaction_id || "unknown",
          "Дата": originalEntry.date || "N/A",
          "Описание": originalEntry.description || "N/A",
          "Дебет счет": originalEntry.debit_account?.number || originalEntry.debit_account_number,
          "Кредит счет": originalEntry.credit_account?.number || originalEntry.credit_account_number,
          "Сумма": originalEntry.amount || 0,
          "Партнер": originalEntry.partner?.name || originalEntry.partner_name || "N/A",
          "Статус импорта": detail.status === "success" ? "Успешно" : "Ошибка",
          "Сообщение": detail.message,
          "Новый ID": detail.status === "success" ? detail.new_transaction_id : "N/A",
          isError: detail.status !== "success",
        });
      });

      let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <title>Import Results - Entries</title>
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
        <h2>Результаты импорта проводок</h2>
        <p><strong>Дата импорта:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Статистика:</strong> Успешно: ${results.success}, Ошибки: ${results.errors}</p>
        <table>
          <thead>
            <tr>
              <th>ID транзакции</th>
              <th>Дата</th>
              <th>Описание</th>
              <th>Дебет счет</th>
              <th>Кредит счет</th>
              <th>Сумма</th>
              <th>Партнер</th>
              <th>Статус импорта</th>
              <th>Сообщение</th>
              <th>Новый ID</th>
            </tr>
          </thead>
          <tbody>
      `;

      allEntries.forEach((entry) => {
        const rowClass = entry.isError ? "error-row" : "success-row";

        htmlContent += `
        <tr class="${rowClass}">
          <td>${entry["ID транзакции"]}</td>
          <td>${entry["Дата"]}</td>
          <td>${entry["Описание"]}</td>
          <td>${entry["Дебет счет"]}</td>
          <td>${entry["Кредит счет"]}</td>
          <td>${formatNumber(entry["Сумма"], 2)}</td>
          <td>${entry["Партнер"]}</td>
          <td>${entry["Статус импорта"]}</td>
          <td>${entry["Сообщение"]}</td>
          <td>${entry["Новый ID"]}</td>
        </tr>
      `;
      });

      htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
      `;

      const blob = new Blob(["\uFEFF" + htmlContent], {
        type: "application/vnd.ms-excel",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `import_entries_results_${new Date().toISOString().slice(0, 10)}.xls`);
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
      const res = await myAxios.get("/get-entries-list", {
        params: { dateFrom, dateTo },
      });
      setEntries(res.data.data || []);
      setSelectedIds([]);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError(t("error_fetching_entries") || "Failed to fetch entries");
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === entries.length ? [] : entries.map((entry) => entry.transaction_id)));
  }, [entries]);

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) return;

    setIsLoading(true);
    try {
      const res = await myAxios.post(
        "/export-entries-json/",
        {
          entryIds: selectedIds,
          format: "json",
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `entries_export_${new Date().toISOString().slice(0, 10)}.json`);
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

  // Обработка импортированных данных
  const processImportData = async (importData, fileName) => {
    try {
      const results = {
        success: 0,
        errors: 0,
        details: [],
        fileName: fileName,
        importTime: new Date().toISOString(),
      };

      if (!importData.entries || !Array.isArray(importData.entries)) {
        setError("Invalid file format: expected 'entries' array");
        setImportLoading(false);
        return;
      }

      const originalImportData = { ...importData };

      for (const entryData of importData.entries) {
        try {
          if (entryData.status === "error") {
            results.details.push({
              transaction_id: entryData.transaction_id || "unknown",
              status: "error",
              message: entryData.message || "Entry had error during export",
            });
            results.errors++;
            continue;
          }

          const cleanData = {
            date: entryData.date,
            description: entryData.description,
            debitAccount: entryData.debit_account?.number || entryData.debit_account_number,
            creditAccount: entryData.credit_account?.number || entryData.credit_account_number,
            amount: entryData.amount,
            comment: entryData.description,
            partnerId: entryData.partner?.id || entryData.partner_id,
          };

          console.log("Sending clean data to create_entry:", cleanData);

          const response = await myAxios.post("/create_entry/", cleanData);

          if (response.data.transaction_id) {
            results.details.push({
              transaction_id: entryData.transaction_id,
              status: "success",
              message: t("Entry imported successfully with new ID: ") + response.data.transaction_id,
              new_transaction_id: response.data.transaction_id,
            });
            results.success++;
          } else {
            results.details.push({
              transaction_id: entryData.transaction_id || "unknown",
              status: "error",
              message: t(response.data.message) || "Unknown error",
            });
            results.errors++;
          }
        } catch (err) {
          console.error("Error importing entry:", err);
          const errorMessage = err.response?.data?.message || err.response?.data?.reason_for_the_error || err.message || "Import failed";

          results.details.push({
            transaction_id: entryData.transaction_id || "unknown",
            status: "error",
            message: t(errorMessage),
          });
          results.errors++;
        }
      }

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
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t("export_import_entries")}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {MyFormatDate(dateFrom)} - {MyFormatDate(dateTo)}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Import Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t("select_period_to_search_entries")}</p>
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              {isLoading ? t("searching") : t("search_entries")}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t("Import entries from JSON")}</p>
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" className="hidden" />
              <button
                onClick={triggerFileInput}
                disabled={importLoading}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {importLoading ? t("Importing...") : t("Import entries JSON")}
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
                  onClick={() => saveImportResultsToExcel(importResults, { entries: [] })}
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
                      {t("Transaction")} № {detail.transaction_id}
                    </span>
                    <span className="text-xs">{detail.message}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries List */}
        <AnimatePresence>
          {entries.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-6">
              {/* Header with select all */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                    {selectedIds.length === entries.length ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5 text-gray-400" />}
                    <span>
                      {selectedIds.length} {t("selected_of")} {entries.length}
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

              {/* Entries */}
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.transaction_id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 group"
                  >
                    <label className="flex items-center gap-4 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(entry.transaction_id)}
                        onChange={() => toggleSelect(entry.transaction_id)}
                        className="w-4 h-4 text-indigo-500 rounded border-gray-300 dark:border-gray-500 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">{t("transaction")} № {entry.transaction_id}</span>
                          <span className="text-sm text-gray-500">{MyFormatDate(entry.date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{entry.description}</p>
                          {entry.partner && (
                            <div className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {entry.partner}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Дебет: {entry.debit_account}</span>
                          <span>Кредит: {entry.credit_account}</span>
                        </div>
                      </div>
                    </label>

                    <div className="flex items-center gap-4 ml-4">
                      <span className="font-bold text-gray-800 dark:text-gray-100">{formatNumber(entry.amount, 2)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {entries.length === 0 && !isLoading && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">{t("no_entries_found")}</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">{t("select_period_and_search_entries")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ExportImportEntries;