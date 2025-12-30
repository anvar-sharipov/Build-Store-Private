// Импорт библиотеки ExcelJS для работы с Excel
import * as ExcelJS from "exceljs";

// Импорт функции для сохранения файла на компьютер
import { saveAs } from "file-saver";

import MyFormatDate from "../../../UI/MyFormatDate";
import { formatNumber2 } from "../../../UI/formatNumber2";

// Главная функция экспорта в Excel
export const exportToExcel = async (cards, dateFrom, dateTo) => {
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
    size: 14,
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
    size: 12,
  };

  dateCell.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  let startRow = 4;

  cards.products.forEach((product) => {
    // ===== Название товара =====
    sheet.mergeCells(`A${startRow}:K${startRow}`);
    sheet.getCell(`A${startRow}`).value = `${product.product_name} (Цена: ${product.retail_price})`;
    sheet.getCell(`A${startRow}`).font = { bold: true };
    sheet.getCell(`A${startRow}`).alignment = { horizontal: "center" };

    startRow += 1;

    // ===== Заголовки таблицы =====
    sheet.getCell(`A${startRow}`).value = "Дата";
    sheet.getCell(`B${startRow}`).value = "Партнёр";
    sheet.getCell(`C${startRow}`).value = "Комментарий";

    sheet.mergeCells(`D${startRow}:E${startRow}`);
    sheet.getCell(`D${startRow}`).value = "Приход";

    sheet.mergeCells(`F${startRow}:G${startRow}`);
    sheet.getCell(`F${startRow}`).value = "Расход";

    sheet.mergeCells(`H${startRow}:I${startRow}`);
    sheet.getCell(`H${startRow}`).value = "Возврат";

    sheet.mergeCells(`J${startRow}:K${startRow}`);
    sheet.getCell(`J${startRow}`).value = "Остаток";

    // ===== Подзаголовки =====
    startRow += 1;

    sheet.getCell(`D${startRow}`).value = "Кол-во";
    sheet.getCell(`E${startRow}`).value = "Всего";
    sheet.getCell(`F${startRow}`).value = "Кол-во";
    sheet.getCell(`G${startRow}`).value = "Всего";
    sheet.getCell(`H${startRow}`).value = "Кол-во";
    sheet.getCell(`I${startRow}`).value = "Всего";
    sheet.getCell(`J${startRow}`).value = "Кол-во";
    sheet.getCell(`K${startRow}`).value = "Всего";

    // стили для двух строк заголовков
    for (let r = startRow - 1; r <= startRow; r++) {
      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].forEach((col) => {
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

    sheet.getCell(`A${startRow}`).value = "Остаток на начало"
    sheet.getCell(`J${startRow}`).value = formatNumber2(product.start_qty, 0)
    sheet.getCell(`K${startRow}`).value = formatNumber2(product.start_qty * product.retail_price)

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
