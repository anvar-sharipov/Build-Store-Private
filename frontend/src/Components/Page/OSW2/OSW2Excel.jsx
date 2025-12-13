import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import MyFormatDate from "../../UI/MyFormatDate";
import { formatNumber2 } from "../../UI/formatNumber2";

const OSW2Excel = async (osw, dateFrom, dateTo) => {
  // 1. Форматирование дат
  const formatDate = MyFormatDate;
  const formatPeriod = (from, to) => `${formatDate(from)} - ${formatDate(to)}`;

  // 2. Создание книги и листа
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ОСВ");

  // 3. ДОБАВЛЕНИЕ ЛОГОТИПА (из папки public)
  try {
    const logoUrl = `${window.location.origin}/polisem.png`;
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
      buffer: buffer,
      extension: "png",
    });

    // Логотип в ячейках A1:B5
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      br: { col: 2, row: 5 }, // Занимает 2 колонки (A-B) и 5 строк
      editAs: "oneCell",
    });
  } catch (error) {
    console.warn("Логотип не загружен:", error);
  }

  // 4. НАСТРОЙКА КОЛОНОК (БЕЗ АВТОМАТИЧЕСКИХ ЗАГОЛОВКОВ!)
  worksheet.columns = [
    { width: 10 }, // A: Счет
    { width: 40 }, // B: Наименование счета
    { width: 15 }, // C: Начало Дт
    { width: 15 }, // D: Начало Кт
    { width: 15 }, // E: Оборот Дт
    { width: 15 }, // F: Оборот Кт
    { width: 15 }, // G: Конец Дт
    { width: 15 }, // H: Конец Кт
  ];

  // 5. Стилизация заголовков

  // Главный заголовок (строка 6, так как логотип занимает 5 строк)
  const titleRow = worksheet.getRow(6);
  titleRow.getCell(1).value = "Оборотно-сальдовая ведомость по счетам";
  titleRow.getCell(1).style = {
    font: { size: 16, bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } },
    alignment: { horizontal: "center", vertical: "middle" },
  };
  worksheet.mergeCells("A6:H6");

  // Подзаголовок периода (строка 7)
  const periodRow = worksheet.getRow(7);
  periodRow.getCell(1).value = `Период: ${formatPeriod(dateFrom, dateTo)}`;
  periodRow.getCell(1).style = {
    font: { size: 12, bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B9BD5" } },
    alignment: { horizontal: "center", vertical: "middle" },
  };
  worksheet.mergeCells("A7:H7");

  // Дата формирования (строка 8)
  const dateRow = worksheet.getRow(8);
  dateRow.getCell(2).value = "Дата формирования:";
  dateRow.getCell(3).value = formatDate(new Date().toISOString());

  // Стиль для ячейки с текстом "Дата формирования:"
  dateRow.getCell(1).style = {
    font: { bold: true },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } },
    alignment: { horizontal: "left", vertical: "middle" },
    // border: {
    //   bottom: { style: "medium", color: { argb: "FF000000" } },
    //   left: { style: "medium", color: { argb: "FF000000" } },
    //   right: { style: "thin", color: { argb: "FF000000" } },
    // },
  };

  // Стиль для ячейки с датой
  dateRow.getCell(2).style = {
    font: { size: 10 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } },
    alignment: { horizontal: "left", vertical: "middle" },
    // border: {
    //   bottom: { style: "medium", color: { argb: "FF000000" } },
    //   left: { style: "thin", color: { argb: "FF000000" } },
    //   right: { style: "medium", color: { argb: "FF000000" } },
    // },
  };

  // Объединяем остальные ячейки в строке даты
  worksheet.mergeCells("C8:H8");
  dateRow.getCell(3).style = {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } },
    // border: {
    //   bottom: { style: "medium", color: { argb: "FF000000" } },
    //   left: { style: "thin", color: { argb: "FF000000" } },
    //   right: { style: "medium", color: { argb: "FF000000" } },
    // },
  };

  // Заголовки таблицы (строки 10-11)
  const headerRow1 = worksheet.getRow(10);
  ["Счет", "Наименование счета", "Сальдо на начало", "", "Обороты за период", "", "Сальдо на конец", ""].forEach((text, idx) => {
    headerRow1.getCell(idx + 1).value = text;
  });

  // Стиль для первой строки заголовка
  for (let i = 1; i <= 8; i++) {
    headerRow1.getCell(i).style = {
      font: { size: 11, bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
        left: { style: "medium", color: { argb: "FF000000" } },
        right: { style: "medium", color: { argb: "FF000000" } },
      },
    };
  }

  // Мерджинг для групповых заголовков
  worksheet.mergeCells("C10:D10"); // Сальдо на начало
  worksheet.mergeCells("E10:F10"); // Обороты за период
  worksheet.mergeCells("G10:H10"); // Сальдо на конец

  // Вторая строка заголовка с подписями Дебет/Кредит (строка 11)
  const headerRow2 = worksheet.getRow(11);
  ["", "", "Дебет", "Кредит", "Дебет", "Кредит", "Дебет", "Кредит"].forEach((text, idx) => {
    headerRow2.getCell(idx + 1).value = text;
    headerRow2.getCell(idx + 1).style = {
      font: { size: 10, bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B9BD5" } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin", color: { argb: "FFFFFFFF" } },
        bottom: { style: "medium", color: { argb: "FF000000" } },
        left: { style: "medium", color: { argb: "FF000000" } },
        right: { style: "medium", color: { argb: "FF000000" } },
      },
    };
  });

  // 6. Добавление данных (начиная со строки 12)
  let currentRow = 12;
  osw.forEach((o, index) => {
    const row = worksheet.getRow(currentRow);

    // Данные
    row.getCell(1).value = o.number;
    row.getCell(2).value = o.name;
    row.getCell(3).value = formatNumber2(o.initial_debit, 2) // o.initial_debit || 0;
    row.getCell(4).value = formatNumber2(o.initial_credit, 2) // o.initial_credit || 0;
    row.getCell(5).value = formatNumber2(o.debit, 2) // o.debit || 0;
    row.getCell(6).value = formatNumber2(o.credit, 2) // o.credit || 0;
    row.getCell(7).value = parseFloat(o.final_balance) > 0 ? formatNumber2(o.final_balance, 2) : formatNumber2(0, 2); // parseFloat(o.final_balance) > 0 ? o.final_balance : 0;
    row.getCell(8).value = parseFloat(o.final_balance) < 0 ? formatNumber2(Math.abs(o.final_balance), 2) : formatNumber2(0, 2); // parseFloat(o.final_balance) < 0 ? Math.abs(o.final_balance) : 0;

    // Стиль для строк данных
    for (let i = 1; i <= 8; i++) {
      const cell = row.getCell(i);

      // Базовый стиль
      cell.style = {
        font: { size: 10 },
        alignment: {
          horizontal: i === 2 ? "left" : i >= 3 ? "right" : "center",
          vertical: "middle",
          wrapText: i === 2,
        },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
        fill: index % 2 === 0 ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } } : { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } },
      };

      // Числовой формат для денежных колонок (C-H)
      if (i >= 3) {
        cell.numFmt = "# ##0.00;[Red]-# ##0.00";
      }
    }

    currentRow++;
  });

  // 7. Итоговая строка
  const totalRow = worksheet.getRow(currentRow);

  // Вычисление итогов
  const totals = osw.reduce(
    (acc, o) => {
      if (!o.is_parent) {
        acc.initDebit += o.initial_debit || 0;
        acc.initCredit += o.initial_credit || 0;
        acc.turnDebit += o.debit || 0;
        acc.turnCredit += o.credit || 0;

        // Используем final_balance для расчета итогов на конец
        const finalBalance = parseFloat(o.final_balance) || 0;
        if (finalBalance > 0) {
          acc.endDebit += finalBalance;
        } else if (finalBalance < 0) {
          acc.endCredit += Math.abs(finalBalance);
        }
      }
      return acc;
    },
    {
      initDebit: 0,
      initCredit: 0,
      turnDebit: 0,
      turnCredit: 0,
      endDebit: 0,
      endCredit: 0,
    }
  );

  // Заполнение итоговой строки
  totalRow.getCell(1).value = "ИТОГО:";
  totalRow.getCell(3).value = totals.initDebit;
  totalRow.getCell(4).value = totals.initCredit;
  totalRow.getCell(5).value = totals.turnDebit;
  totalRow.getCell(6).value = totals.turnCredit;
  totalRow.getCell(7).value = totals.endDebit;
  totalRow.getCell(8).value = totals.endCredit;

  // Стиль итоговой строки
  for (let i = 1; i <= 8; i++) {
    const cell = totalRow.getCell(i);
    cell.style = {
      font: { size: 10, bold: true },
      alignment: {
        horizontal: i === 1 ? "center" : i === 2 ? "right" : "right",
        vertical: "middle",
      },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6E0B4" } },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "medium", color: { argb: "FF000000" } },
        left: { style: i === 1 ? "medium" : "thin", color: { argb: "FF000000" } },
        right: { style: i === 8 ? "medium" : "thin", color: { argb: "FF000000" } },
      },
    };

    // Числовой формат для денежных колонок
    if (i >= 3) {
      cell.numFmt = "# ##0.00;[Red]-# ##0.00";
    }
  }

  // Объединение ячеек для заголовка "ИТОГО:"
  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);

  // 8. Заморозка строк
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 11, // Замораживаем строки 0-10 (логотип + все заголовки)
      xSplit: 0,
      topLeftCell: "A12", // Первая ячейка после замороженных строк
    },
  ];

  // 9. Сохранение файла
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const formattedDateFrom = formatDate(dateFrom).replace(/\./g, "-");
  const formattedDateTo = formatDate(dateTo).replace(/\./g, "-");
  saveAs(blob, `ОСВ_${formattedDateFrom}_${formattedDateTo}.xlsx`);
};

export default OSW2Excel;

// import * as XLSX from "xlsx-js-style";
// import { saveAs } from "file-saver";
// import MyFormatDate from "../../UI/MyFormatDate";

// const OSW2Excel = (osw, dateFrom, dateTo) => {
//   // -------------------------------
//   // 1) Подготовка данных с правильным форматом дат
//   // -------------------------------
//   const totalInitialDebit = osw.reduce((sum, o) => (!o.is_parent ? sum + o.initial_debit : sum), 0);
//   const totalInitialCredit = osw.reduce((sum, o) => (!o.is_parent ? sum + o.initial_credit : sum), 0);
//   const totalDebit = osw.reduce((sum, o) => (!o.is_parent ? sum + o.debit : sum), 0);
//   const totalCredit = osw.reduce((sum, o) => (!o.is_parent ? sum + o.credit : sum), 0);
//   const totalFinalDebit = osw.reduce((sum, o) => (!o.is_parent ? sum + o.final_debit : sum), 0);
//   const totalFinalCredit = osw.reduce((sum, o) => (!o.is_parent ? sum + o.final_credit : sum), 0);

//   // Форматируем даты в правильный формат DD.MM.YYYY
//   const formatDate = MyFormatDate; // Используем вашу функцию

//   // Создаём строку периода в формате "02.11.2025 - 30.11.2025"
//   const formatPeriod = (from, to) => {
//     const formattedFrom = formatDate(from);
//     const formattedTo = formatDate(to);
//     return `${formattedFrom} - ${formattedTo}`;
//   };

//   // Основная структура данных
//   const sheetData = [
//     // Заголовок отчёта
//     ["Оборотно-сальдовая ведомость по счетам", "", "", "", "", "", "", ""],
//     [`Период: ${formatPeriod(dateFrom, dateTo)}`, "", "", "", "", "", "", ""],
//     ["Дата формирования:", formatDate(new Date().toISOString()), "", "", "", "", "", ""],
//     [], // Пустая строка для разделения

//     // Заголовок таблицы с подзаголовками
//     ["Счет", "Наименование счета", "Сальдо на начало", "", "Обороты за период", "", "Сальдо на конец", ""],
//     ["", "", "Дебет", "Кредит", "Дебет", "Кредит", "Дебет", "Кредит"],

//     // Данные
//     ...osw.map(o => [
//       o.number,
//       o.name,
//       o.initial_debit || 0,
//       o.initial_credit || 0,
//       o.debit || 0,
//       o.credit || 0,
//       parseFloat(o.final_balance) > 0 ? o.final_balance : 0,
//       parseFloat(o.final_balance) < 0 ? Math.abs(o.final_balance) : 0
//     ]),

//     // Итоговая строка
//     ["ИТОГО:", "", totalInitialDebit, totalInitialCredit, totalDebit, totalCredit, totalFinalDebit, totalFinalCredit]
//   ];

//   // -------------------------------
//   // 2) Создание рабочего листа
//   // -------------------------------
//   const ws = XLSX.utils.aoa_to_sheet(sheetData);

//   // -------------------------------
//   // 3) Определение диапазона ячеек
//   // -------------------------------
//   const range = XLSX.utils.decode_range(ws["!ref"]);

//   // Мерджинг ячеек для заголовков
//   ws['!merges'] = [
//     // Главный заголовок
//     { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
//     // Подзаголовок периода
//     { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
//     // Дата формирования
//     { s: { r: 2, c: 1 }, e: { r: 2, c: 7 } },
//     // Заголовок таблицы - САЛЬДО НА НАЧАЛО
//     { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } },
//     // Заголовок таблицы - ОБОРОТЫ ЗА ПЕРИОД
//     { s: { r: 4, c: 4 }, e: { r: 4, c: 5 } },
//     // Заголовок таблицы - САЛЬДО НА КОНЕЦ
//     { s: { r: 4, c: 6 }, e: { r: 4, c: 7 } },
//     // Итоговая строка
//     { s: { r: range.e.r, c: 0 }, e: { r: range.e.r, c: 1 } }
//   ];

//   // -------------------------------
//   // 4) Применение стилей
//   // -------------------------------
//   for (let R = range.s.r; R <= range.e.r; ++R) {
//     for (let C = range.s.c; C <= range.e.c; ++C) {
//       const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
//       const cell = ws[cellRef];
//       if (!cell) continue;

//       // Базовый стиль для всех ячеек
//       cell.s = {
//         font: { sz: 10, name: "Calibri" },
//         alignment: {
//           horizontal: "center",
//           vertical: "center",
//           wrapText: true
//         },
//         border: {
//           top: { style: "thin", color: { rgb: "000000" } },
//           bottom: { style: "thin", color: { rgb: "000000" } },
//           left: { style: "thin", color: { rgb: "000000" } },
//           right: { style: "thin", color: { rgb: "000000" } }
//         }
//       };

//       // Стиль для главного заголовка (строка 0)
//       if (R === 0) {
//         cell.s = {
//           font: { sz: 16, bold: true, color: { rgb: "FFFFFF" } },
//           alignment: { horizontal: "center", vertical: "center" },
//           fill: { fgColor: { rgb: "4472C4" } },
//           border: {
//             top: { style: "medium", color: { rgb: "000000" } },
//             bottom: { style: "medium", color: { rgb: "000000" } },
//             left: { style: "medium", color: { rgb: "000000" } },
//             right: { style: "medium", color: { rgb: "000000" } }
//           }
//         };
//       }

//       // Стиль для подзаголовка периода (строка 1)
//       if (R === 1) {
//         cell.s = {
//           font: { sz: 12, bold: true, color: { rgb: "FFFFFF" } },
//           alignment: { horizontal: "center", vertical: "center" },
//           fill: { fgColor: { rgb: "5B9BD5" } },
//           border: {
//             left: { style: "medium", color: { rgb: "000000" } },
//             right: { style: "medium", color: { rgb: "000000" } }
//           }
//         };
//       }

//       // Стиль для даты формирования (строка 2)
//       if (R === 2) {
//         if (C === 0) {
//           cell.s = {
//             font: { sz: 10, bold: true, color: { rgb: "000000" } },
//             alignment: { horizontal: "left", vertical: "center" },
//             fill: { fgColor: { rgb: "D9E1F2" } },
//             border: {
//               bottom: { style: "medium", color: { rgb: "000000" } },
//               left: { style: "medium", color: { rgb: "000000" } }
//             }
//           };
//         } else if (C === 1) {
//           cell.s = {
//             font: { sz: 10, color: { rgb: "000000" } },
//             alignment: { horizontal: "left", vertical: "center" },
//             fill: { fgColor: { rgb: "D9E1F2" } },
//             border: {
//               bottom: { style: "medium", color: { rgb: "000000" } },
//               right: { style: "medium", color: { rgb: "000000" } }
//             }
//           };
//         }
//       }

//       // Стиль для заголовка таблицы (строка 4)
//       if (R === 4) {
//         if (C === 0 || C === 1) {
//           cell.s = {
//             font: { sz: 11, bold: true, color: { rgb: "FFFFFF" } },
//             alignment: { horizontal: "center", vertical: "center" },
//             fill: { fgColor: { rgb: "2F5597" } },
//             border: {
//               top: { style: "medium", color: { rgb: "000000" } },
//               bottom: { style: "medium", color: { rgb: "000000" } },
//               left: { style: "medium", color: { rgb: "000000" } },
//               right: { style: "medium", color: { rgb: "000000" } }
//             }
//           };
//         } else if (C === 2 || C === 4 || C === 6) {
//           cell.s = {
//             font: { sz: 11, bold: true, color: { rgb: "FFFFFF" } },
//             alignment: { horizontal: "center", vertical: "center" },
//             fill: { fgColor: { rgb: "2F5597" } },
//             border: {
//               top: { style: "medium", color: { rgb: "000000" } },
//               bottom: { style: "thin", color: { rgb: "FFFFFF" } },
//               left: { style: "medium", color: { rgb: "000000" } },
//               right: { style: "medium", color: { rgb: "000000" } }
//             }
//           };
//         }
//       }

//       // Стиль для подзаголовков столбцов (строка 5)
//       if (R === 5) {
//         cell.s = {
//           font: { sz: 10, bold: true, color: { rgb: "FFFFFF" } },
//           alignment: { horizontal: "center", vertical: "center" },
//           fill: { fgColor: { rgb: "5B9BD5" } },
//           border: {
//             top: { style: "thin", color: { rgb: "FFFFFF" } },
//             bottom: { style: "medium", color: { rgb: "000000" } },
//             left: { style: "medium", color: { rgb: "000000" } },
//             right: { style: "medium", color: { rgb: "000000" } }
//           }
//         };
//       }

//       // Стиль для данных (начиная со строки 6)
//       if (R >= 6 && R < range.e.r) {
//         if (C === 1) {
//           cell.s.alignment.horizontal = "left";
//           cell.s.alignment.wrapText = true;
//         }

//         if (C === 0) {
//           cell.s.alignment.horizontal = "center";
//         }

//         if (C >= 2) {
//           cell.s.alignment.horizontal = "right";
//           cell.z = '# ##0.00;[Red]-# ##0.00';
//         }

//         if (R % 2 === 0) {
//           cell.s.fill = { fgColor: { rgb: "FFFFFF" } };
//         } else {
//           cell.s.fill = { fgColor: { rgb: "F2F2F2" } };
//         }
//       }

//       // Стиль для итоговой строки
//       if (R === range.e.r) {
//         if (C === 0 || C === 1) {
//           cell.s = {
//             font: { sz: 10, bold: true, color: { rgb: "000000" } },
//             alignment: {
//               horizontal: C === 0 ? "center" : "right",
//               vertical: "center"
//             },
//             fill: { fgColor: { rgb: "C6E0B4" } },
//             border: {
//               top: { style: "medium", color: { rgb: "000000" } },
//               bottom: { style: "medium", color: { rgb: "000000" } },
//               left: { style: "medium", color: { rgb: "000000" } },
//               right: { style: C === 1 ? "medium" : "thin", color: { rgb: "000000" } }
//             }
//           };
//         } else {
//           cell.s = {
//             font: { sz: 10, bold: true, color: { rgb: "000000" } },
//             alignment: { horizontal: "right", vertical: "center" },
//             fill: { fgColor: { rgb: "C6E0B4" } },
//             border: {
//               top: { style: "medium", color: { rgb: "000000" } },
//               bottom: { style: "medium", color: { rgb: "000000" } },
//               left: { style: "thin", color: { rgb: "000000" } },
//               right: { style: "medium", color: { rgb: "000000" } }
//             }
//           };
//           cell.z = '# ##0.00;[Red]-# ##0.00';
//         }
//       }
//     }
//   }

//   // -------------------------------
//   // 5) Настройка ширины столбцов
//   // -------------------------------
//   ws['!cols'] = [
//     { wch: 10 },  // A: Счет
//     { wch: 40 },  // B: Наименование
//     { wch: 15 },  // C: Начало Дт
//     { wch: 15 },  // D: Начало Кт
//     { wch: 15 },  // E: Оборот Дт
//     { wch: 15 },  // F: Оборот Кт
//     { wch: 15 },  // G: Конец Дт
//     { wch: 15 }   // H: Конец Кт
//   ];

//   // -------------------------------
//   // 6) Настройка высоты строк
//   // -------------------------------
//   ws['!rows'] = [
//     { hpt: 30 }, // Строка 0
//     { hpt: 25 }, // Строка 1
//     { hpt: 20 }, // Строка 2
//     { hpt: 5 },  // Пустая строка 3
//     { hpt: 25 }, // Заголовок таблицы 4
//     { hpt: 20 }, // Подзаголовки столбцов 5
//   ];

//   for (let i = 6; i <= range.e.r; i++) {
//     if (!ws['!rows']) ws['!rows'] = [];
//     ws['!rows'][i] = { hpt: 18 };
//   }

//   // -------------------------------
//   // 7) Заморозка областей
//   // -------------------------------
//   ws['!freeze'] = {
//     xSplit: 0,
//     ySplit: 6,
//     topLeftCell: "A7"
//   };

//   // -------------------------------
//   // 8) Создание книги и сохранение
//   // -------------------------------
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "ОСВ");

//   // Настройки печати
//   ws['!margins'] = {
//     left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
//     header: 0.3, footer: 0.3
//   };

//   ws['!pageSetup'] = {
//     orientation: 'landscape',
//     paperSize: 9,
//     fitToPage: true,
//     fitToWidth: 1,
//     fitToHeight: 0,
//     margins: {
//       left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
//       header: 0.3, footer: 0.3
//     }
//   };

//   ws['!printOptions'] = {
//     repeatRows: '0:5'
//   };

//   const excelBuffer = XLSX.write(wb, {
//     bookType: "xlsx",
//     type: "array",
//     cellStyles: true
//   });

//   const blob = new Blob([excelBuffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   });

//   // Форматируем даты для имени файла
//   const formattedDateFrom = formatDate(dateFrom).replace(/\./g, '-');
//   const formattedDateTo = formatDate(dateTo).replace(/\./g, '-');
//   const fileName = `ОСВ_${formattedDateFrom}_${formattedDateTo}.xlsx`;

//   saveAs(blob, fileName);
// };

// export default OSW2Excel;
