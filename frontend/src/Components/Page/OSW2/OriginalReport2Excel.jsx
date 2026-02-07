import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import MyFormatDate from "../../UI/MyFormatDate";
import { formatNumber2 } from "../../UI/formatNumber2";

const OriginalReport2Excel = async (data, totals, dateFrom, dateTo, accountNumber, t, hyphenOr0) => {
  // 1. Создание книги и листа
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ОСВ по контрагентам");
  

  // 2. Добавление логотипа
  try {
    const logoUrl = `${window.location.origin}/polisem.png`;
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
      buffer: buffer,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      br: { col: 2, row: 5 },
      editAs: "oneCell",
    });
  } catch (error) {
    console.warn("Логотип не загружен:", error);
  }

  // 3. Настройка колонок
  worksheet.columns = [
    { width: 8 },  // A: №/agent
    { width: 40 }, // B: Контрагент
    { width: 16 }, // C: Нач. Дт
    { width: 16 }, // D: Нач. Кт
    { width: 16 }, // E: Оборот Дт
    { width: 16 }, // F: Оборот Кт
    { width: 16 }, // G: Кон. Дт
    { width: 16 }, // H: Кон. Кт
  ];

  // Стили для переиспользования
  const styles = {
    header1: {
      font: { size: 16, bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } },
      alignment: { horizontal: "center", vertical: "middle" },
    },
    header2: {
      font: { size: 12, bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B9BD5" } },
      alignment: { horizontal: "center", vertical: "middle" },
    },
    infoCell: {
      font: { size: 10 },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } },
    },
    tableHeader1: {
      font: { size: 11, bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
        left: { style: "medium", color: { argb: "FF000000" } },
        right: { style: "medium", color: { argb: "FF000000" } },
      },
    },
    tableHeader2: {
      font: { size: 10, bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B9BD5" } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin", color: { argb: "FFFFFFFF" } },
        bottom: { style: "medium", color: { argb: "FF000000" } },
        left: { style: "medium", color: { argb: "FF000000" } },
        right: { style: "medium", color: { argb: "FF000000" } },
      },
    },
    dataRow: (rowIndex) => ({
      font: { size: 10 },
      alignment: {
        horizontal: (col) => (col === 2 ? "left" : col >= 3 ? "right" : "center"),
        vertical: "middle",
        wrapText: (col) => col === 2,
      },
      border: {
        top: { style: "thin", color: { argb: "FFD9D9D9" } },
        bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
        left: { style: "thin", color: { argb: "FFD9D9D9" } },
        right: { style: "thin", color: { argb: "FFD9D9D9" } },
      },
      fill: rowIndex % 2 === 0 
        ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } }
        : { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F8F8" } },
    }),
    totalExpandedRow: {
      font: { size: 10, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } },
      alignment: { horizontal: "right", vertical: "middle" },
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
    totalRow: {
      font: { size: 10, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6E0B4" } },
      alignment: { horizontal: "right", vertical: "middle" },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "medium", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    },
  };

  // 4. Заголовки отчета
  const formatDate = MyFormatDate;

  // Главный заголовок (строка 6)
  const titleRow = worksheet.getRow(6);
  titleRow.getCell(1).value = "Оборотно-сальдовая ведомость по контрагентам";
  titleRow.getCell(1).style = styles.header1;
  worksheet.mergeCells("A6:H6");

  // Подзаголовок периода (строка 7)
  const periodRow = worksheet.getRow(7);
  periodRow.getCell(1).value = `Период: ${formatDate(dateFrom)} - ${formatDate(dateTo)} | Счет: ${accountNumber}`;
  periodRow.getCell(1).style = styles.header2;
  worksheet.mergeCells("A7:H7");

  // Дата формирования (строка 8)
  const infoRow = worksheet.getRow(8);
  infoRow.getCell(1).value = "Дата формирования:";
  infoRow.getCell(1).style = { ...styles.infoCell, font: { ...styles.infoCell.font, bold: true } };

  infoRow.getCell(2).value = formatDate(new Date().toISOString());
  infoRow.getCell(2).style = styles.infoCell;

  worksheet.mergeCells("C8:H8");
  infoRow.getCell(3).style = styles.infoCell;

  // 5. Заголовки таблицы (строки 10-11)
  let currentRow = 10;

  const headerRow1 = worksheet.getRow(currentRow);
  ["№/agent", t("subconto") || "Контрагент", t("openingBalance") || "Сальдо на начало", "", 
   t("periodTurnover") || "Обороты за период", "", 
   t("endingBalance") || "Сальдо на конец", ""].forEach((text, idx) => {
    headerRow1.getCell(idx + 1).value = text;
    headerRow1.getCell(idx + 1).style = styles.tableHeader1;
  });
  worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
  worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
  worksheet.mergeCells(`G${currentRow}:H${currentRow}`);
  currentRow++;

  const headerRow2 = worksheet.getRow(currentRow);
  ["", "", "Дебет", "Кредит", "Дебет", "Кредит", "Дебет", "Кредит"].forEach((text, idx) => {
    headerRow2.getCell(idx + 1).value = text;
    headerRow2.getCell(idx + 1).style = styles.tableHeader2;
  });
  currentRow++;

  // 6. Добавление данных
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((row, index) => {
      const dataRow = worksheet.getRow(currentRow);

      // Формируем значение для колонки №/agent
      const agentInfo = row.agent?.id ? `${index + 1} - ${row.agent.id}` : (index + 1).toString();
      dataRow.getCell(1).value = agentInfo;
      dataRow.getCell(2).value = row.partner_name;
      
      // Используем formatNumber2 для форматирования чисел
      dataRow.getCell(3).value = formatNumber2(row.debit_before, 2, hyphenOr0);
      dataRow.getCell(4).value = formatNumber2(row.credit_before, 2, hyphenOr0);
      dataRow.getCell(5).value = formatNumber2(row.debit_oborot, 2, hyphenOr0);
      dataRow.getCell(6).value = formatNumber2(row.credit_oborot, 2, hyphenOr0);
      dataRow.getCell(7).value = formatNumber2(row.saldo_end_debit, 2, hyphenOr0);
      dataRow.getCell(8).value = formatNumber2(row.saldo_end_credit, 2, hyphenOr0);

      // Применение стилей
      for (let i = 1; i <= 8; i++) {
        const cell = dataRow.getCell(i);
        cell.style = styles.dataRow(currentRow);

        // Для числовых колонок устанавливаем числовой формат
        if (i >= 3) {
          // Для Excel используем числовые значения, а не строки
          const cellValue = cell.value;
          if (cellValue === "0.00" || cellValue === "-") {
            cell.value = hyphenOr0 ? "-" : 0;
            cell.numFmt = hyphenOr0 ? '@' : "# ##0.00;[Red]-# ##0.00";
          } else if (typeof cellValue === 'string') {
            // Парсим строку обратно в число для Excel
            const numValue = parseFloat(cellValue.replace(/[^\d.-]/g, ''));
            cell.value = isNaN(numValue) ? 0 : numValue;
            cell.numFmt = "# ##0.00;[Red]-# ##0.00";
          } else {
            cell.numFmt = "# ##0.00;[Red]-# ##0.00";
          }
        }
      }

      currentRow++;
    });

    // 7. Итоговые строки
    // Развернутые итоги
    const totalExpandedRow = worksheet.getRow(currentRow);
    totalExpandedRow.getCell(2).value = t("totalExpanded") || "Итого развернуто:";
    totalExpandedRow.getCell(3).value = formatNumber2(totals.debit_before_total, 2, hyphenOr0);
    totalExpandedRow.getCell(4).value = formatNumber2(totals.credit_before_total, 2, hyphenOr0);
    totalExpandedRow.getCell(5).value = formatNumber2(totals.debit_oborot_total, 2, hyphenOr0);
    totalExpandedRow.getCell(6).value = formatNumber2(totals.credit_oborot_total, 2, hyphenOr0);
    totalExpandedRow.getCell(7).value = formatNumber2(totals.saldo_end_debit_total, 2, hyphenOr0);
    totalExpandedRow.getCell(8).value = formatNumber2(totals.saldo_end_credit_total, 2, hyphenOr0);

    for (let i = 1; i <= 8; i++) {
      const cell = totalExpandedRow.getCell(i);
      cell.style = styles.totalExpandedRow;
      if (i >= 3) {
        if (cell.value === "0.00" || cell.value === "-") {
          cell.value = hyphenOr0 ? "-" : 0;
          cell.numFmt = hyphenOr0 ? '@' : "# ##0.00;[Red]-# ##0.00";
        } else {
          const numValue = parseFloat(cell.value?.toString().replace(/[^\d.-]/g, ''));
          cell.value = isNaN(numValue) ? 0 : numValue;
          cell.numFmt = "# ##0.00;[Red]-# ##0.00";
        }
      }
    }
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    currentRow++;

    // Сальдированные итоги
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(2).value = t("total") || "Итого:";
    totalRow.getCell(3).value = formatNumber2(totals.saldo_summ_before_debit, 2, hyphenOr0);
    totalRow.getCell(4).value = formatNumber2(totals.saldo_summ_before_credit, 2, hyphenOr0);
    totalRow.getCell(5).value = formatNumber2(totals.saldo_summ_oborot_debit, 2, hyphenOr0);
    totalRow.getCell(6).value = formatNumber2(totals.saldo_summ_oborot_credit, 2, hyphenOr0);
    totalRow.getCell(7).value = formatNumber2(totals.saldo_summ_end_debit, 2, hyphenOr0);
    totalRow.getCell(8).value = formatNumber2(totals.saldo_summ_end_credit, 2, hyphenOr0);

    for (let i = 1; i <= 8; i++) {
      const cell = totalRow.getCell(i);
      cell.style = styles.totalRow;
      if (i >= 3) {
        if (cell.value === "0.00" || cell.value === "-") {
          cell.value = hyphenOr0 ? "-" : 0;
          cell.numFmt = hyphenOr0 ? '@' : "# ##0.00;[Red]-# ##0.00";
        } else {
          const numValue = parseFloat(cell.value?.toString().replace(/[^\d.-]/g, ''));
          cell.value = isNaN(numValue) ? 0 : numValue;
          cell.numFmt = "# ##0.00;[Red]-# ##0.00";
        }
      }
    }
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  } else {
    // Если данных нет
    const noDataRow = worksheet.getRow(currentRow);
    noDataRow.getCell(1).value = "Нет данных";
    noDataRow.getCell(1).style = {
      font: { size: 11, italic: true, color: { argb: "FF808080" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
  }

  // 8. Заморозка строк
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 11, // Замораживаем заголовки (строки 0-10)
      xSplit: 2,  // Замораживаем первые 2 колонки
      topLeftCell: "C12",
      activeCell: "C12",
    },
  ];

  // 9. Автофильтр
  if (Array.isArray(data) && data.length > 0) {
    worksheet.autoFilter = {
      from: { row: 10, column: 1 },
      to: { row: 10, column: 8 },
    };
  }

  // 10. Сохранение файла
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const formattedDateFrom = formatDate(dateFrom).replace(/\./g, "-");
  const formattedDateTo = formatDate(dateTo).replace(/\./g, "-");
  saveAs(blob, `ОСВ_по_контрагентам_${accountNumber}_${formattedDateFrom}_${formattedDateTo}.xlsx`);
};

export default OriginalReport2Excel;