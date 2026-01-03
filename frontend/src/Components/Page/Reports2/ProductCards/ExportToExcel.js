// Импорт библиотеки ExcelJS для работы с Excel
import * as ExcelJS from "exceljs";

// Импорт функции для сохранения файла на компьютер
import { saveAs } from "file-saver";

import MyFormatDate from "../../../UI/MyFormatDate";
import { formatNumber2 } from "../../../UI/formatNumber2";

const borderThin = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

const grayBg = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE0E0E0" }, // тёмно-серый (temnee)
};

const bgRed = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFCCCC" },
};

const bgGreen = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD9F2E6" },
};

const grayBg2 = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF5F5F5" }, // тёмно-серый (swetlee)
};

const fontRed = {
  color: { argb: "FFCC0000" },
};

const fontGreen = {
  color: { argb: "FF2F855A" },
};

const fontBlue = {
  color: { argb: "FF1D4ED8" },
};

// Главная функция экспорта в Excel
export const ExportToExcel = async (cards, dateFrom, dateTo) => {
  // Создаём новую Excel-книгу (аналог файла .xlsx)
  const workbook = new ExcelJS.Workbook();

  // Добавляем лист с названием "Product Cards"
  const sheet = workbook.addWorksheet("Product Cards");

  try {
    // Формируем путь к логотипу из папки public
    const logoUrl = `${window.location.origin}/polisem.png`;

    // Загружаем картинку по URL
    const response = await fetch(logoUrl);

    // Преобразуем ответ в Blob (двоичные данные)
    const blob = await response.blob();

    // Преобразуем Blob в ArrayBuffer (нужно ExcelJS)
    const buffer = await blob.arrayBuffer();

    // Добавляем изображение в Excel и получаем его ID
    const imageId = workbook.addImage({
      buffer: buffer, // бинарные данные картинки
      extension: "png", // формат изображения
    });

    // Добавляем изображение на лист
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 }, // верхний левый угол (A1)
      br: { col: 2, row: 2 }, // нижний правый угол (примерно A1:D6)
    });
  } catch (error) {
    // Если логотип не загрузился — просто покажем предупреждение
    console.warn("Логотип не загружен:", error);
  }

  // Объединяем ячейки B1 → G1
  sheet.mergeCells("B1:G1");

  // Записываем текст
  const titleCell = sheet.getCell("B1");
  titleCell.value = `ОТЧЁТ ПО ТОВАРАМ`;

  // Стили текста
  titleCell.font = {
    size: 12,
    bold: true,
  };

  titleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  // Высота первой строки
  sheet.getRow(1).height = 35;

  sheet.mergeCells("B2:G2");
  const dateCell = sheet.getCell("B2");
  dateCell.value = `${MyFormatDate(dateFrom)} - ${MyFormatDate(dateTo)}`;

  dateCell.font = {
    size: 10,
  };

  dateCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  let startRow = 4;

  cards.products.forEach((product) => {
    // ===== Название товара =====
    sheet.mergeCells(`A${startRow}:L${startRow}`);
    sheet.getCell(`A${startRow}`).value = `${product.product_name} (Цена: ${product.retail_price})`;
    sheet.getCell(`A${startRow}`).font = { bold: true };
    sheet.getCell(`A${startRow}`).alignment = { horizontal: "center" };

    startRow += 1;

    // ===== Заголовки таблицы =====
    sheet.getCell(`A${startRow}`).value = "Дата";
    sheet.getCell(`B${startRow}`).value = "Партнёр";
    sheet.getCell(`C${startRow}`).value = "Комментарий";
    sheet.getCell(`D${startRow}`).value = "Цена";

    sheet.mergeCells(`E${startRow}:F${startRow}`);
    sheet.getCell(`E${startRow}`).value = "Приход";

    sheet.mergeCells(`G${startRow}:H${startRow}`);
    sheet.getCell(`G${startRow}`).value = "Расход";

    sheet.mergeCells(`I${startRow}:J${startRow}`);
    sheet.getCell(`I${startRow}`).value = "Возврат";

    sheet.mergeCells(`K${startRow}:L${startRow}`);
    sheet.getCell(`K${startRow}`).value = "Остаток";

    const startColfill = 1;
    const endColfill = 12;
    for (let col = startColfill; col <= endColfill; col++) {
      sheet.getCell(startRow, col).fill = grayBg;
    }

    // ===== Подзаголовки =====
    startRow += 1;

    sheet.getCell(`E${startRow}`).value = "Кол-во";
    sheet.getCell(`F${startRow}`).value = "Всего";
    sheet.getCell(`G${startRow}`).value = "Кол-во";
    sheet.getCell(`H${startRow}`).value = "Всего";
    sheet.getCell(`I${startRow}`).value = "Кол-во";
    sheet.getCell(`J${startRow}`).value = "Всего";
    sheet.getCell(`K${startRow}`).value = "Кол-во";
    sheet.getCell(`L${startRow}`).value = "Всего";

    for (let col = 1; col <= 12; col++) {
      sheet.getCell(startRow, col).fill = grayBg2;
    }

    // стили для двух строк заголовков
    for (let r = startRow - 1; r <= startRow; r++) {
      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].forEach((col) => {
        const cell = sheet.getCell(`${col}${r}`);
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }

    // 👉 смещаем строку дальше под данные товара
    startRow += 1;

    sheet.getCell(`A${startRow}`).value = "Остаток на начало";
    sheet.getCell(`K${startRow}`).value = product.start_qty;
    sheet.getCell(`L${startRow}`).value = formatNumber2(product.start_qty * product.retail_price);

    const startCol = 1; // A
    const endCol = 12; // K
    for (let col = startCol; col <= endCol; col++) {
      sheet.getCell(startRow, col).border = borderThin;
      sheet.getCell(startRow, col).font = { size: 10, bold: true };
    }

    startRow += 1;
    let runningBalance = product.start_qty;
    let total_prihod = 0; // prihod itogo balance
    let total_rashod = 0; // rashod itogo balance
    let total_wozwrat = 0; // wozwrat itogo balance

    if (product.operations.length > 0) {
      product.operations.forEach((f, idx) => {
        sheet.getCell(`A${startRow}`).value = MyFormatDate(f.date);
        sheet.getCell(`A${startRow}`).border = borderThin;
        sheet.getCell(`B${startRow}`).value = f.partner;
        sheet.getCell(`C${startRow}`).value = f.comment;
        sheet.getCell(`D${startRow}`).value = f.price;
        if (f.price < product.retail_price) {
          sheet.getCell(`D${startRow}`).fill = bgRed;
        } else if (f.price > product.retail_price) {
          sheet.getCell(`D${startRow}`).fill = bgGreen;
        }
        if (f.type == "prihod") {
          runningBalance += f.qty;
          total_prihod += f.sum;
          sheet.getCell(`E${startRow}`).value = f.qty ? f.qty : "";
          sheet.getCell(`F${startRow}`).value = f.sum ? formatNumber2(f.sum, 2) : "";
          sheet.getCell(`E${startRow}`).font = fontGreen;
          sheet.getCell(`F${startRow}`).font = fontGreen;
        } else if (f.type == "rashod") {
          runningBalance -= f.qty;
          total_rashod += f.sum;
          sheet.getCell(`G${startRow}`).value = f.qty ? f.qty : "";
          sheet.getCell(`H${startRow}`).value = f.sum ? formatNumber2(f.sum, 2) : "";
          sheet.getCell(`G${startRow}`).font = fontRed;
          sheet.getCell(`H${startRow}`).font = fontRed;
        } else if (f.type == "wozwrat") {
          runningBalance += f.qty;
          total_wozwrat += f.sum;
          sheet.getCell(`I${startRow}`).value = f.qty ? f.qty : "";
          sheet.getCell(`J${startRow}`).value = f.sum ? formatNumber2(f.sum, 2) : "";
          sheet.getCell(`I${startRow}`).font = fontBlue;
          sheet.getCell(`J${startRow}`).font = fontBlue;
        }

        sheet.getCell(`K${startRow}`).value = runningBalance ? runningBalance : "";
        sheet.getCell(`L${startRow}`).value = runningBalance * product.retail_price ? formatNumber2(runningBalance * product.retail_price) : "";
        const startCol = 1; // A
        const endCol = 12; // K
        for (let col = startCol; col <= endCol; col++) {
          sheet.getCell(startRow, col).border = borderThin;
          // sheet.getCell(startRow, col).font = { size: 10 };
        }
        startRow += 1;
      });

      sheet.getCell(`A${startRow}`).value = "Итого";
      sheet.getCell(`E${startRow}`).value = product.prihod ? product.prihod : "";
      sheet.getCell(`F${startRow}`).value = total_prihod ? formatNumber2(total_prihod) : "";

      sheet.getCell(`G${startRow}`).value = product.rashod ? product.rashod : "";
      sheet.getCell(`H${startRow}`).value = total_rashod ? formatNumber2(total_rashod) : "";

      sheet.getCell(`I${startRow}`).value = product.wozwrat ? product.wozwrat : "";
      sheet.getCell(`J${startRow}`).value = total_wozwrat ? formatNumber2(total_wozwrat) : "";

      sheet.getCell(`K${startRow}`).value = runningBalance ? runningBalance : "";
      sheet.getCell(`L${startRow}`).value = runningBalance * product.retail_price ? formatNumber2(runningBalance * product.retail_price) : "";

      const startCol = 1; // A
      const endCol = 12; // K
      for (let col = startCol; col <= endCol; col++) {
        sheet.getCell(startRow, col).border = borderThin;
        sheet.getCell(startRow, col).font = { size: 10, bold: true };
      }

      startRow += 1;
      // console.log("product", product);
    }
    startRow += 1;

    // product.operations.forEach((op, idx) => {
    //     sheet.getCell(`A${startRow}`).value = "Остаток на начало"
    //     sheet.getCell(`D${startRow}`).value = MyFormatDate(op.partner)
    //     if (op.type == "prihod") {
    //         sheet.getCell(`D${startRow}`).value = MyFormatDate(op.comment)
    //     }

    //     startRow += 1;
    // })
  });

  //   sheet.getCell("A4").value = "Дата";
  //   sheet.getCell("B4").value = "Партнёр";
  //   sheet.getCell("C4").value = "Comment";

  //   sheet.mergeCells("D4:E4");
  //   sheet.getCell("D4").value = "prihod";

  //   sheet.mergeCells("F4:G4");
  //   sheet.getCell("F4").value = "rashod";

  //   sheet.mergeCells("H4:I4");
  //   sheet.getCell("H4").value = "wozwrat";

  //   sheet.mergeCells("J4:K4");
  //   sheet.getCell("J4").value = "ostatok";

  //   sheet.getCell("D5").value = "Кол-во";
  //   sheet.getCell("E5").value = "Всего";
  //   sheet.getCell("F5").value = "Кол-во";
  //   sheet.getCell("G5").value = "Всего";
  //   sheet.getCell("H5").value = "Кол-во";
  //   sheet.getCell("I5").value = "Всего";
  //   sheet.getCell("J5").value = "Кол-во";
  //   sheet.getCell("K5").value = "Всего";

  //   // ======= СТИЛИ (общие) =======
  //   ["A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "I4", "J4", "K4", "A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "I5", "J5", "K5"].forEach((cell) => {
  //     sheet.getCell(cell).alignment = {
  //       vertical: "middle",
  //       horizontal: "center",
  //     };
  //     sheet.getCell(cell).font = { bold: true };
  //     sheet.getCell(cell).border = {
  //       top: { style: "thin" },
  //       left: { style: "thin" },
  //       bottom: { style: "thin" },
  //       right: { style: "thin" },
  //     };
  //   });

  // Генерируем Excel-файл в памяти
  const buffer = await workbook.xlsx.writeBuffer();

  // Создаём Blob для скачивания
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Сохраняем файл пользователю
  saveAs(blob, "product_cards.xlsx");
};
