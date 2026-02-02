import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import MyFormatDate from "../../UI/MyFormatDate";
import { formatNumber2 } from "../../UI/formatNumber2";

const AgentReport2Excel = async (data, totals, grandTotals, dateFrom, dateTo, accountNumber, sortByAgent, t, hyphenOr0) => {
  // 1. Создание книги и листа
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ОСВ по агентам");

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
    { width: 6 }, // A: №
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
    agentHeader: {
      font: { size: 11, bold: true, color: { argb: "FF000000" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2F0D9" } },
      alignment: { horizontal: "left", vertical: "middle" },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
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
      fill: rowIndex % 2 === 0 ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } } : { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F8F8" } },
    }),
    subtotalRow: {
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
    grandTotalRow: {
      font: { size: 11, bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD966" } },
      alignment: { horizontal: "right", vertical: "middle" },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "medium", color: { argb: "FF000000" } },
        left: { style: "medium", color: { argb: "FF000000" } },
        right: { style: "medium", color: { argb: "FF000000" } },
      },
    },
  };

  // 4. Заголовки отчета
  const formatDate = MyFormatDate;

  // Главный заголовок (строка 6)
  const titleRow = worksheet.getRow(6);
  titleRow.getCell(1).value = "Оборотно-сальдовая ведомость по счету (группировка по агентам)";
  titleRow.getCell(1).style = styles.header1;
  worksheet.mergeCells("A6:H6");

  // Подзаголовок периода (строка 7)
  const periodRow = worksheet.getRow(7);
  periodRow.getCell(1).value = `Период: ${formatDate(dateFrom)} - ${formatDate(dateTo)} | Счет: ${accountNumber}`;
  periodRow.getCell(1).style = styles.header2;
  worksheet.mergeCells("A7:H7");

  // Дата формирования и дополнительная информация (строка 8)
  const infoRow = worksheet.getRow(8);
  infoRow.getCell(2).value = "Дата формирования:";
  infoRow.getCell(2).style = { ...styles.infoCell, font: { ...styles.infoCell.font, bold: true } };

  infoRow.getCell(3).value = formatDate(new Date().toISOString());
  infoRow.getCell(3).style = styles.infoCell;

  worksheet.mergeCells("C8:H8");
  infoRow.getCell(3).style = styles.infoCell;

  let currentRow = 10;
  const formatNumber = (num) => parseFloat(num || 0).toFixed(2);

  // 5. Добавление данных по агентам
  Object.entries(data).forEach(([agentName, partners]) => {


    const agentTotalsData = totals[agentName]?.[0];
    if (!partners || !Array.isArray(partners) || partners.length === 0) return;

    const displayAgentName = agentName === "no_agent" ? t("noAgent") || "Без агента" : agentName;

    // Заголовок агента (строка для названия агента)
    const agentHeaderRow = worksheet.getRow(currentRow);
    agentHeaderRow.getCell(2).value = displayAgentName;
    agentHeaderRow.getCell(2).style = styles.agentHeader;
    worksheet.mergeCells(`B${currentRow}:H${currentRow}`);
    currentRow++;

    // Заголовки таблицы
    const headerRow1 = worksheet.getRow(currentRow);
    ["№", "Контрагент", "Сальдо на начало", "", "Обороты за период", "", "Сальдо на конец", ""].forEach((text, idx) => {
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

    // Данные контрагентов
    partners.forEach((row, index) => {
      const dataRow = worksheet.getRow(currentRow);

      dataRow.getCell(1).value = index + 1;
      dataRow.getCell(2).value = row.partner_name;
      dataRow.getCell(3).value = formatNumber2(row.debit_before, 2, hyphenOr0) // parseFloat(row.debit_before || 0);
      dataRow.getCell(4).value = formatNumber2(row.credit_before, 2, hyphenOr0) // parseFloat(row.credit_before || 0);
      dataRow.getCell(5).value = formatNumber2(row.debit_oborot, 2, hyphenOr0) // parseFloat(row.debit_oborot || 0);
      dataRow.getCell(6).value = formatNumber2(row.credit_oborot, 2, hyphenOr0) // parseFloat(row.credit_oborot || 0);
      dataRow.getCell(7).value = formatNumber2(row.saldo_end_debit, 2, hyphenOr0) // parseFloat(row.saldo_end_debit || 0);
      dataRow.getCell(8).value = formatNumber2(row.saldo_end_credit, 2, hyphenOr0) // parseFloat(row.saldo_end_credit || 0);

      // Применение стилей
      for (let i = 1; i <= 8; i++) {
        const cell = dataRow.getCell(i);
        cell.style = styles.dataRow(currentRow);

        // Числовой формат для денежных колонок
        if (i >= 3) {
          cell.numFmt = "# ##0.00;[Red]-# ##0.00";
        }
      }

      currentRow++;
    });

    // Итоги по агенту (развернутые)
    if (agentTotalsData) {
      const subtotalExpandedRow = worksheet.getRow(currentRow);
      subtotalExpandedRow.getCell(2).value = `Итого развернуто ${displayAgentName}:`;
      subtotalExpandedRow.getCell(3).value = formatNumber2(agentTotalsData.debit_before_total, 2, hyphenOr0) // parseFloat(agentTotalsData.debit_before_total || 0);
      subtotalExpandedRow.getCell(4).value = formatNumber2(agentTotalsData.credit_before_total, 2, hyphenOr0) // parseFloat(agentTotalsData.credit_before_total || 0);
      subtotalExpandedRow.getCell(5).value = formatNumber2(agentTotalsData.debit_oborot_total, 2, hyphenOr0) // parseFloat(agentTotalsData.debit_oborot_total || 0);
      subtotalExpandedRow.getCell(6).value = formatNumber2(agentTotalsData.credit_oborot_total, 2, hyphenOr0) // parseFloat(agentTotalsData.credit_oborot_total || 0);
      subtotalExpandedRow.getCell(7).value = formatNumber2(agentTotalsData.saldo_end_debit_total, 2, hyphenOr0) // parseFloat(agentTotalsData.saldo_end_debit_total || 0);
      subtotalExpandedRow.getCell(8).value = formatNumber2(agentTotalsData.saldo_end_credit_total, 2, hyphenOr0) // parseFloat(agentTotalsData.saldo_end_credit_total || 0);

      for (let i = 1; i <= 8; i++) {
        const cell = subtotalExpandedRow.getCell(i);
        cell.style = styles.subtotalRow;
        if (i >= 3) {
          cell.numFmt = "# ##0.00;[Red]-# ##0.00";
        }
      }
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
      currentRow++;

      // Итоги по агенту (сальдированные)
      const subtotalRow = worksheet.getRow(currentRow);
      subtotalRow.getCell(2).value = `Итого ${displayAgentName}:`;
      subtotalRow.getCell(3).value = parseFloat(agentTotalsData.saldo_summ_before_debit || 0);
      subtotalRow.getCell(4).value = parseFloat(agentTotalsData.saldo_summ_before_credit || 0);
      subtotalRow.getCell(5).value = parseFloat(agentTotalsData.saldo_summ_oborot_debit || 0);
      subtotalRow.getCell(6).value = parseFloat(agentTotalsData.saldo_summ_oborot_credit || 0);
      subtotalRow.getCell(7).value = parseFloat(agentTotalsData.saldo_summ_end_debit || 0);
      subtotalRow.getCell(8).value = parseFloat(agentTotalsData.saldo_summ_end_credit || 0);

      for (let i = 1; i <= 8; i++) {
        const cell = subtotalRow.getCell(i);
        cell.style = styles.totalRow;
        if (i >= 3) {
          cell.numFmt = "# ##0.00;[Red]-# ##0.00";
        }
      }
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
      currentRow++;
    }

    // Пустая строка между агентами
    currentRow++;
  });

  // 6. Общие итоги
  if (grandTotals) {
    // Пустая строка перед общими итогами
    currentRow++;

    const grandTotalHeaderRow = worksheet.getRow(currentRow);
    grandTotalHeaderRow.getCell(1).value = "ОБЩИЙ ИТОГ";
    grandTotalHeaderRow.getCell(1).style = {
      ...styles.agentHeader,
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD966" } },
    };
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    currentRow++;

    // Заголовки для общих итогов
    const grandHeaderRow1 = worksheet.getRow(currentRow);
    ["", "", "Сальдо на начало", "", "Обороты за период", "", "Сальдо на конец", ""].forEach((text, idx) => {
      grandHeaderRow1.getCell(idx + 1).value = text;
      grandHeaderRow1.getCell(idx + 1).style = styles.tableHeader1;
    });
    worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
    worksheet.mergeCells(`E${currentRow}:F${currentRow}`);
    worksheet.mergeCells(`G${currentRow}:H${currentRow}`);
    currentRow++;

    const grandHeaderRow2 = worksheet.getRow(currentRow);
    ["", "", "Дебет", "Кредит", "Дебет", "Кредит", "Дебет", "Кредит"].forEach((text, idx) => {
      grandHeaderRow2.getCell(idx + 1).value = text;
      grandHeaderRow2.getCell(idx + 1).style = styles.tableHeader2;
    });
    currentRow++;

    // Развернутые итоги
    const grandExpandedRow = worksheet.getRow(currentRow);
    grandExpandedRow.getCell(2).value = "Итого развернуто:";
    grandExpandedRow.getCell(3).value = parseFloat(grandTotals.debit_before_total || 0);
    grandExpandedRow.getCell(4).value = parseFloat(grandTotals.credit_before_total || 0);
    grandExpandedRow.getCell(5).value = parseFloat(grandTotals.debit_oborot_total || 0);
    grandExpandedRow.getCell(6).value = parseFloat(grandTotals.credit_oborot_total || 0);
    grandExpandedRow.getCell(7).value = parseFloat(grandTotals.saldo_end_debit_total || 0);
    grandExpandedRow.getCell(8).value = parseFloat(grandTotals.saldo_end_credit_total || 0);

    for (let i = 1; i <= 8; i++) {
      const cell = grandExpandedRow.getCell(i);
      cell.style = styles.grandTotalRow;
      if (i >= 3) {
        cell.numFmt = "# ##0.00;[Red]-# ##0.00";
      }
    }
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    currentRow++;

    // Сальдированные итоги
    const grandTotalRow = worksheet.getRow(currentRow);
    grandTotalRow.getCell(2).value = "Итого:";
    grandTotalRow.getCell(3).value = parseFloat(grandTotals.saldo_summ_before_debit || 0);
    grandTotalRow.getCell(4).value = parseFloat(grandTotals.saldo_summ_before_credit || 0);
    grandTotalRow.getCell(5).value = parseFloat(grandTotals.saldo_summ_oborot_debit || 0);
    grandTotalRow.getCell(6).value = parseFloat(grandTotals.saldo_summ_oborot_credit || 0);
    grandTotalRow.getCell(7).value = parseFloat(grandTotals.saldo_summ_end_debit || 0);
    grandTotalRow.getCell(8).value = parseFloat(grandTotals.saldo_summ_end_credit || 0);

    for (let i = 1; i <= 8; i++) {
      const cell = grandTotalRow.getCell(i);
      cell.style = { ...styles.grandTotalRow, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6E0B4" } } };
      if (i >= 3) {
        cell.numFmt = "# ##0.00;[Red]-# ##0.00";
      }
    }
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
  }

  // 7. Заморозка строк
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 9, // Замораживаем до строки с информацией
      xSplit: 2, // Замораживаем первые 2 колонки (№ и Контрагент)
      topLeftCell: "C10",
      activeCell: "C10",
    },
  ];

  // 8. Автофильтр для заголовков таблиц
  // Добавляем автофильтр к первой таблице (можно адаптировать для каждой таблицы агента)
  worksheet.autoFilter = {
    from: { row: 10, column: 1 },
    to: { row: 10, column: 8 },
  };

  // 9. Сохранение файла
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const formattedDateFrom = formatDate(dateFrom).replace(/\./g, "-");
  const formattedDateTo = formatDate(dateTo).replace(/\./g, "-");
  saveAs(blob, `ОСВ_по_агентам_${accountNumber}_${formattedDateFrom}_${formattedDateTo}.xlsx`);
};

export default AgentReport2Excel;
