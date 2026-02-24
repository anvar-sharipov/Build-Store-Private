import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const Saldo2ToExcel = async (saldo2, partnerName, partnerType, accountType, t, date_from, date_to, MyFormatDate) => {
  // console.log("dsdsds");

  // 1. Создание книги и листа
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Сальдо по счетам");

  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "portrait", // или "landscape" если нужно
    fitToPage: true,
    fitToWidth: 1, // ВАЖНО → 1 страница по ширине
    fitToHeight: 0, // 0 = по высоте без ограничения
    margins: {
      left: 0.6,
      right: 0.2,
      top: 0.2,
      bottom: 0.2,
      header: 0.3,
      footer: 0.3,
    },
  };

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
      font: { size: 14, bold: true },
      // fill: { type: "pattern", pattern: "solid", fgColor: { argb: accountType === "debit" ? "FF2E7D32" : "FFC62828" } },
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
      font: { size: 11, bold: true },
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
      font: { size: 11, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } },
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
    closingBalance: {
      font: { size: 11, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } },
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
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  currentRow++;
  const periodDates = worksheet.getRow(currentRow);
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  periodDates.getCell(2).value = `На период c ${date_from} по ${date_to}`;
  periodDates.alignment = { horizontal: "center", vertical: "middle" };

  currentRow++;

  // Дата формирования
  // const dateRow = worksheet.getRow(currentRow);
  const now = new Date();
  const formatExcelDate = (date) => {
    return date.toLocaleDateString("ru-RU").replace(/\//g, ".");
  };

  // dateRow.getCell(1).value = "Дата формирования:";
  // dateRow.getCell(2).value = formatExcelDate(now);
  // dateRow.getCell(2).style = { font: { size: 9 } };
  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  currentRow += 1;

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
  // const formatEntryDate = (dateString) => {
  //   if (!dateString) return "";

  //   try {
  //     // Пробуем разные форматы даты
  //     if (dateString.includes("T")) {
  //       // ISO формат: "2025-09-01T00:00:00"
  //       const date = new Date(dateString);
  //       return date.toLocaleDateString("ru-RU").replace(/\//g, ".");
  //     } else if (dateString.includes(" ")) {
  //       // Формат: "2025-09-01 00:00:00"
  //       const [datePart] = dateString.split(" ");
  //       const [year, month, day] = datePart.split("-");
  //       return `${day}.${month}.${year}`;
  //     } else if (dateString.includes("-")) {
  //       // Формат: "2025-09-01"
  //       const [year, month, day] = dateString.split("-");
  //       return `${day}.${month}.${year}`;
  //     }

  //     return dateString;
  //   } catch (error) {
  //     console.warn("Ошибка форматирования даты:", dateString, error);
  //     return dateString;
  //   }
  // };
  const formatEntryDate = (dateString) => {
    if (!dateString) return "";

    try {
      // Убираем время если есть
      const cleanDate = dateString.split(" ")[0];

      // Определяем разделитель
      let separator = "-";
      if (cleanDate.includes(".")) separator = ".";
      if (cleanDate.includes("/")) separator = "/";

      const parts = cleanDate.split(separator);

      if (parts.length !== 3) return dateString;

      let day, month, year;

      // Если формат начинается с года (YYYY-MM-DD)
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        // Если формат начинается с дня (DD-MM-YYYY)
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }

      day = String(day).padStart(2, "0");
      month = String(month).padStart(2, "0");

      return `${day}.${month}.${year}`;
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
    // const accountHeaderRow = worksheet.getRow(currentRow);
    // accountHeaderRow.getCell(1).value = accountName;
    // accountHeaderRow.getCell(1).style = styles.accountHeader;
    // worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    // currentRow++;

    // Заголовки таблицы
    const tableHeaderRow = worksheet.getRow(currentRow);
    tableHeaderRow.getCell(1).value = t("Date");
    tableHeaderRow.getCell(2).value = accountName;
    tableHeaderRow.getCell(3).value = t("Debit");
    tableHeaderRow.getCell(4).value = t("Credit");
    tableHeaderRow.getCell(5).value = t("balance_ostatok");

    for (let i = 1; i <= 5; i++) {
      tableHeaderRow.getCell(i).style = styles.tableHeader;
    }
    currentRow++;

    // Начальное сальдо
    const openingRow = worksheet.getRow(currentRow);
    openingRow.getCell(1).value = `${t("Opening balance")} ${date_from}`;
    openingRow.getCell(1).style = styles.openingBalance;
    openingRow.getCell(2).style = styles.openingBalance;

    // Используем данные из start[0] и start[1]
    let saldo_start_debit = 0;
    let saldo_start_credit = 0;
    const saldo_row = accountData.start?.[0] - accountData.start?.[1];
    let ostatok = accountData.start?.[0] - accountData.start?.[1];
    if (saldo_row > 0) {
      saldo_start_debit = saldo_row;
    } else if (saldo_row < 0) {
      saldo_start_credit = Math.abs(saldo_row);
    }
    const startDebit = saldo_start_debit;
    const startCredit = saldo_start_credit;

    openingRow.getCell(3).value = formatNumber(startDebit);
    openingRow.getCell(3).style = { ...styles.openingBalance, alignment: { horizontal: "right" } };
    openingRow.getCell(4).value = formatNumber(startCredit);
    openingRow.getCell(4).style = { ...styles.openingBalance, alignment: { horizontal: "right" } };
    openingRow.getCell(5).value = ostatok != 0 ? ostatok : "-";
    openingRow.getCell(5).style = { ...styles.openingBalance, alignment: { horizontal: "right" } };
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    currentRow++;

    // Обороты за день
    if (accountData.today_entries && accountData.today_entries.length > 0) {
      accountData.today_entries.forEach((entry) => {
        const dataRow = worksheet.getRow(currentRow);

        const dateStr = formatEntryDate(entry[0]);
        const description = entry[1] || "";

        const debitRaw = entry[2];
        const creditRaw = entry[3];

        dataRow.getCell(1).value = dateStr;
        dataRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

        for (let i = 1; i < 6; i++) {
          dataRow.getCell(i).border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        }

        dataRow.getCell(2).value = description;

        const handleNumberCell = (cell, value) => {
          const num = parseFloat(value);

          // Если 0 или пусто → "-"
          if (!value || isNaN(num) || num === 0) {
            cell.value = "-";
            cell.numFmt = "@"; // текстовый формат
            cell.alignment = { horizontal: "right", vertical: "middle" };
            return;
          }

          cell.value = num;
          cell.numFmt = "#,##0.00;[Red]-#,##0.00";
          cell.alignment = { horizontal: "right", vertical: "middle" };
        };

        ostatok += debitRaw - creditRaw;

        handleNumberCell(dataRow.getCell(3), debitRaw);
        handleNumberCell(dataRow.getCell(4), creditRaw);
        handleNumberCell(dataRow.getCell(5), ostatok);

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
    totalTurnoverRow.getCell(1).value = t("Total turnover");
    totalTurnoverRow.getCell(1).style = styles.totalRow;
    totalTurnoverRow.getCell(2).style = styles.totalRow;

    // Используем данные из final[0] и final[1]
    const finalDebit = accountData.final?.[0] || "0";
    const finalCredit = accountData.final?.[1] || "0";

    totalTurnoverRow.getCell(3).value = formatNumber(finalDebit);
    totalTurnoverRow.getCell(3).style = { ...styles.totalRow, alignment: { horizontal: "right" } };
    totalTurnoverRow.getCell(4).value = formatNumber(finalCredit);
    totalTurnoverRow.getCell(4).style = { ...styles.totalRow, alignment: { horizontal: "right" } };

    totalTurnoverRow.getCell(5).value = "-";
    totalTurnoverRow.getCell(5).style = { ...styles.totalRow, alignment: { horizontal: "right" } };
    totalTurnoverRow.getCell(5).border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
    // totalTurnoverRow.getCell(5).value = formatNumber(ostatok);
    // totalTurnoverRow.getCell(5).style = { ...styles.totalRow, alignment: { horizontal: "right" } };

    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    currentRow++;

    // Конечное сальдо
    const closingRow = worksheet.getRow(currentRow);
    closingRow.getCell(1).value = t("Closing balance");
    closingRow.getCell(1).style = styles.closingBalance;
    closingRow.getCell(2).style = styles.closingBalance;

    // Используем данные из saldo[0] и saldo[1]
    const saldoDebit = accountData.saldo?.[0] || "0";
    const saldoCredit = accountData.saldo?.[1] || "0";

    closingRow.getCell(3).value = formatNumber(saldoDebit);
    closingRow.getCell(3).style = { ...styles.closingBalance, alignment: { horizontal: "right" } };
    closingRow.getCell(4).value = formatNumber(saldoCredit);
    closingRow.getCell(4).style = { ...styles.closingBalance, alignment: { horizontal: "right" } };

    closingRow.getCell(5).value = formatNumber(ostatok);
    closingRow.getCell(5).style = { ...styles.closingBalance, alignment: { horizontal: "right" } };

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
  if (partnerType === "klient" && saldo2["60_USD"]) {
    addAccountTable("60_USD", "60 Клиент USD");
  }

  if (partnerType === "founder" && saldo2["75_USD"]) {
    addAccountTable("75_USD", "75 Учредитель USD");
  }

  // 9. Автофильтр (если есть данные)
  const hasData = Object.keys(saldo2 || {}).some((key) => saldo2[key]?.today_entries?.length > 0);

  // if (hasData && currentRow > 8) {
  //   // Корректируем диапазон автофильтра
  //   const firstDataRow = 7; // Первая строка с данными после заголовков
  //   const lastDataRow = currentRow - 3;

  //   // if (lastDataRow >= firstDataRow) {
  //   //   worksheet.autoFilter = {
  //   //     from: { row: firstDataRow, column: 1 },
  //   //     to: { row: lastDataRow, column: 4 },
  //   //   };
  //   // }
  // }

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
