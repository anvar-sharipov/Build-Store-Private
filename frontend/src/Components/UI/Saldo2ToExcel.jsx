import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const Saldo2ToExcel = async (saldo2, partnerName, partnerType, accountType, t) => {
  // 1. Создание книги и листа
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Сальдо по счетам");

  // 2. Добавление логотипа (опционально) - УМЕНЬШЕННЫЙ РАЗМЕР
  try {
    const logoUrl = `${window.location.origin}/polisem.png`;
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
      buffer: buffer,
      extension: "png",
    });

    // Уменьшаем изображение: занимает 1 колонку и 2 строки
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      br: { col: 1, row: 2 },
      editAs: "oneCell",
    });
  } catch (error) {
    console.warn("Логотип не загружен:", error);
  }

  // 3. Настройка колонок
  worksheet.columns = [
    { width: 15 }, // A: Дата
    { width: 50 }, // B: Описание/Счет
    { width: 16 }, // C: Дебет
    { width: 16 }, // D: Кредит
  ];

  // Стили для переиспользования
  const styles = {
    header1: {
      font: { size: 14, bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: accountType === "debit" ? "FF2E7D32" : "FFC62828" } },
      alignment: { horizontal: "center", vertical: "middle" },
    },
    header2: {
      font: { size: 12, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
    accountHeader: {
      font: { size: 11, bold: true, color: { argb: accountType === "debit" ? "FF2E7D32" : "FFC62828" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } },
      alignment: { horizontal: "center", vertical: "middle" },
    },
    tableHeader: {
      font: { size: 10, bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B9BD5" } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
    openingBalance: {
      font: { size: 10, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE3F2FD" } },
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
    dataRow: (rowIndex) => ({
      font: { size: 9 },
      alignment: {
        horizontal: (col) => (col === 2 ? "left" : col >= 3 ? "right" : "center"),
        vertical: "middle",
        wrapText: true,
      },
      border: {
        top: { style: "thin", color: { argb: "FFD9D9D9" } },
        bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
        left: { style: "thin", color: { argb: "FFD9D9D9" } },
        right: { style: "thin", color: { argb: "FFD9D9D9" } },
      },
      fill: rowIndex % 2 === 0 ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } } : { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F8F8" } },
    }),
    totalRow: {
      font: { size: 10, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } },
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
    closingBalance: {
      font: { size: 10, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFC8E6C9" } },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "medium", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
  };

  // 4. Заголовки отчета - СДВИГАЕМ ИЗ-ЗА УМЕНЬШЕННОГО ЛОГОТИПА
  let currentRow = 3; // Было 5, теперь 3 (логотип занимает строки 0-2)

  // Главный заголовок
  const titleRow = worksheet.getRow(currentRow);
  titleRow.getCell(1).value = `${partnerName || t("partner")}`;
  titleRow.getCell(1).style = styles.header1;
  worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
  currentRow++;

  // Дата формирования
  const dateRow = worksheet.getRow(currentRow);
  const now = new Date();
  const formatExcelDate = (date) => {
    return date.toLocaleDateString("ru-RU").replace(/\//g, ".");
  };

  dateRow.getCell(1).value = "Дата формирования:";
  dateRow.getCell(2).value = formatExcelDate(now);
  dateRow.getCell(2).style = { font: { size: 9 } };
  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  currentRow += 2;

  // 5. Вспомогательная функция для форматирования чисел
  const formatNumber = (value) => {
    if (!value || value === "0" || value === "0.00" || value === 0) {
      return "-";
    }

    // Если это уже строка с форматом, оставляем как есть
    if (typeof value === "string" && value.includes(".")) {
      // Убираем возможные пробелы и форматируем
      const num = parseFloat(value.replace(/\s/g, ""));
      if (isNaN(num)) return "-";

      // Форматируем с разделителями тысяч
      return num.toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // Если это число
    const num = parseFloat(value);
    if (isNaN(num)) return "-";

    return num.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 6. Функция для форматирования даты из данных
  const formatEntryDate = (dateString) => {
    if (!dateString) return "";

    try {
      // Пробуем разные форматы даты
      if (dateString.includes("T")) {
        // ISO формат: "2025-09-01T00:00:00"
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU").replace(/\//g, ".");
      } else if (dateString.includes(" ")) {
        // Формат: "2025-09-01 00:00:00"
        const [datePart] = dateString.split(" ");
        const [year, month, day] = datePart.split("-");
        return `${day}.${month}.${year}`;
      } else if (dateString.includes("-")) {
        // Формат: "2025-09-01"
        const [year, month, day] = dateString.split("-");
        return `${day}.${month}.${year}`;
      }

      return dateString;
    } catch (error) {
      console.warn("Ошибка форматирования даты:", dateString, error);
      return dateString;
    }
  };

  // 7. Функция для добавления таблицы счета
  const addAccountTable = (accountKey, accountName) => {
    const accountData = saldo2[accountKey];
    if (!accountData) {
      console.warn(`Нет данных для счета: ${accountKey}`);
      return;
    }

    // Заголовок счета
    const accountHeaderRow = worksheet.getRow(currentRow);
    accountHeaderRow.getCell(1).value = accountName;
    accountHeaderRow.getCell(1).style = styles.accountHeader;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    currentRow++;

    // Заголовки таблицы
    const tableHeaderRow = worksheet.getRow(currentRow);
    tableHeaderRow.getCell(1).value = t("Date") || "Дата";
    tableHeaderRow.getCell(2).value = accountName;
    tableHeaderRow.getCell(3).value = t("Debit") || "Дебет";
    tableHeaderRow.getCell(4).value = t("Credit") || "Кредит";

    for (let i = 1; i <= 4; i++) {
      tableHeaderRow.getCell(i).style = styles.tableHeader;
    }
    currentRow++;

    // Начальное сальдо
    const openingRow = worksheet.getRow(currentRow);
    openingRow.getCell(1).value = t("Opening balance") || "Остаток на начало";
    openingRow.getCell(1).style = styles.openingBalance;
    openingRow.getCell(2).style = styles.openingBalance;

    // Используем данные из start[0] и start[1]
    let saldo_start_debit = 0
    let saldo_start_credit = 0
    const saldo_row = accountData.start?.[0] - accountData.start?.[1]
    if (saldo_row > 0) {
      saldo_start_debit = saldo_row
    } else if (saldo_row < 0) {
      saldo_start_credit = Math.abs(saldo_row)
    }
    const startDebit = saldo_start_debit;
    const startCredit = saldo_start_credit;

    openingRow.getCell(3).value = formatNumber(startDebit);
    openingRow.getCell(3).style = { ...styles.openingBalance, alignment: { horizontal: "right" } };
    openingRow.getCell(4).value = formatNumber(startCredit);
    openingRow.getCell(4).style = { ...styles.openingBalance, alignment: { horizontal: "right" } };
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    currentRow++;

    // Обороты за день
    if (accountData.today_entries && accountData.today_entries.length > 0) {
      accountData.today_entries.forEach((entry, idx) => {
        const dataRow = worksheet.getRow(currentRow);

        // entry - это массив: [date, description, debit, credit, transactionId]
        const dateStr = formatEntryDate(entry[0]);
        const description = entry[1] || "";
        const debit = entry[2] || "0";
        const credit = entry[3] || "0";

        dataRow.getCell(1).value = dateStr;
        dataRow.getCell(2).value = description;
        dataRow.getCell(3).value = formatNumber(debit);
        dataRow.getCell(4).value = formatNumber(credit);

        for (let i = 1; i <= 4; i++) {
          const cell = dataRow.getCell(i);
          cell.style = styles.dataRow(currentRow);

          // Устанавливаем числовой формат для колонок с числами
          if (i >= 3) {
            const cellValue = cell.value;
            if (cellValue === "-") {
              cell.numFmt = "@";
            } else {
              // Преобразуем строку в число для Excel
              const numValue = parseFloat(cellValue.toString().replace(/\s/g, "").replace(",", "."));
              cell.value = isNaN(numValue) ? 0 : numValue;
              cell.numFmt = "#,##0.00;[Red]-#,##0.00";
            }
          }
        }

        currentRow++;
      });
    } else {
      // Нет данных
      const noDataRow = worksheet.getRow(currentRow);
      noDataRow.getCell(1).value = "-";
      noDataRow.getCell(2).value = "Нет операций";
      noDataRow.getCell(3).value = "-";
      noDataRow.getCell(4).value = "-";

      for (let i = 1; i <= 4; i++) {
        const cell = noDataRow.getCell(i);
        cell.style = styles.dataRow(currentRow);
        if (i >= 3) {
          cell.numFmt = "@";
        }
      }

      currentRow++;
    }

    // Итоговый оборот
    const totalTurnoverRow = worksheet.getRow(currentRow);
    totalTurnoverRow.getCell(1).value = t("Total turnover") || "Итого оборот";
    totalTurnoverRow.getCell(1).style = styles.totalRow;
    totalTurnoverRow.getCell(2).style = styles.totalRow;

    // Используем данные из final[0] и final[1]
    const finalDebit = accountData.final?.[0] || "0";
    const finalCredit = accountData.final?.[1] || "0";

    totalTurnoverRow.getCell(3).value = formatNumber(finalDebit);
    totalTurnoverRow.getCell(3).style = { ...styles.totalRow, alignment: { horizontal: "right" } };
    totalTurnoverRow.getCell(4).value = formatNumber(finalCredit);
    totalTurnoverRow.getCell(4).style = { ...styles.totalRow, alignment: { horizontal: "right" } };
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    currentRow++;

    // Конечное сальдо
    const closingRow = worksheet.getRow(currentRow);
    closingRow.getCell(1).value = t("Closing balance") || "Остаток на конец";
    closingRow.getCell(1).style = styles.closingBalance;
    closingRow.getCell(2).style = styles.closingBalance;

    // Используем данные из saldo[0] и saldo[1]
    const saldoDebit = accountData.saldo?.[0] || "0";
    const saldoCredit = accountData.saldo?.[1] || "0";

    closingRow.getCell(3).value = formatNumber(saldoDebit);
    closingRow.getCell(3).style = { ...styles.closingBalance, alignment: { horizontal: "right" } };
    closingRow.getCell(4).value = formatNumber(saldoCredit);
    closingRow.getCell(4).style = { ...styles.closingBalance, alignment: { horizontal: "right" } };
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);

    // Устанавливаем числовой формат для итоговых значений
    for (let i = 3; i <= 4; i++) {
      const cell = closingRow.getCell(i);
      const cellValue = cell.value;
      if (cellValue === "-") {
        cell.numFmt = "@";
      } else {
        const numValue = parseFloat(cellValue.toString().replace(/\s/g, "").replace(",", "."));
        cell.value = isNaN(numValue) ? 0 : numValue;
        cell.numFmt = "#,##0.00;[Red]-#,##0.00";
      }
    }

    currentRow += 2; // Отступ между таблицами
  };

  // 8. Добавляем таблицы для счетов
  if (saldo2["60_USD"]) {
    addAccountTable("60_USD", "60 Клиент USD");
  }

  if (partnerType === "founder" && saldo2["75_USD"]) {
    addAccountTable("75_USD", "75 Учредитель USD");
  }

  // 9. Автофильтр (если есть данные)
  const hasData = Object.keys(saldo2 || {}).some((key) => saldo2[key]?.today_entries?.length > 0);

  if (hasData && currentRow > 8) {
    // Корректируем диапазон автофильтра
    const firstDataRow = 7; // Первая строка с данными после заголовков
    const lastDataRow = currentRow - 3;
    
    if (lastDataRow >= firstDataRow) {
      worksheet.autoFilter = {
        from: { row: firstDataRow, column: 1 },
        to: { row: lastDataRow, column: 4 },
      };
    }
  }

  // 10. Заморозка строк с заголовками - КОРРЕКТИРУЕМ ИЗ-ЗА СДВИГА
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 6, // Замораживаем заголовки (первые 6 строк)
      xSplit: 0,
      topLeftCell: "A7", // Первая строка после заголовков
      activeCell: "A7",
    },
  ];

  // 11. Сохранение файла
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Очищаем имя файла от недопустимых символов
    const cleanPartnerName = (partnerName || "партнер")
      .replace(/[^\w\sа-яА-Я]/gi, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);

    const fileName = `Сальдо_${accountType === "debit" ? "дебет" : "кредит"}_${cleanPartnerName}_${formatExcelDate(now).replace(/\./g, "-")}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error("Ошибка при сохранении файла:", error);
    throw error;
  }
};

export default Saldo2ToExcel;