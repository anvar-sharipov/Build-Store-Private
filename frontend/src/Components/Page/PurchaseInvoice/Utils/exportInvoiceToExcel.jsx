import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatNumber2 } from "../../../UI/formatNumber2";

const exportInvoiceWithSaldoToExcel = async (values, visibleColumns, printVisibleColumns, t, awtoData, saldoForExcel, dateProwodok) => {
  console.log("values", values.partner?.name);

  const saldo = saldoForExcel;

  try {
    // 1. Создание книги и листа
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Фактура с сальдо");

    // 2. Добавление логотипа (маленький как во втором примере)
    try {
      const logoUrl = `${window.location.origin}/polisem.png`;
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();

      const imageId = workbook.addImage({
        buffer: buffer,
        extension: "png",
      });

      // Маленький логотип: 1 колонку и 2 строки
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        br: { col: 1, row: 2 },
        editAs: "oneCell",
      });
    } catch (error) {
      console.warn("Логотип не загружен:", error);
    }

    // 3. Проверяем наличие товаров
    if (!values.products || values.products.length === 0) {
      alert(t("No products to export"));
      return;
    }

    // 4. Создаем маппинг колонок для основной таблицы
    const columnMapping = [];
    let colIndex = 1;

    // №
    columnMapping.push({ key: "number", excelCol: colIndex++, title: "№", width: 5 });

    // Наименование
    columnMapping.push({ key: "name", excelCol: colIndex++, title: t("name2"), width: 40 });

    // Изображение (если видимо)
    if (printVisibleColumns.image) {
      columnMapping.push({ key: "image", excelCol: colIndex++, title: t("image"), width: 10 });
    }

    // QR код (если видимо)
    if (printVisibleColumns.qr_code) {
      columnMapping.push({ key: "qr_code", excelCol: colIndex++, title: "QR", width: 10 });
    }

    // Количество
    columnMapping.push({ key: "quantity", excelCol: colIndex++, title: t("q-ty"), width: 12 });

    // Ед. изм.
    columnMapping.push({ key: "unit", excelCol: colIndex++, title: t("un"), width: 8 });

    // Цена за шт.
    columnMapping.push({ key: "price", excelCol: colIndex++, title: "Цена за шт.", width: 12 });

    // Общая цена
    columnMapping.push({ key: "totalPrice", excelCol: colIndex++, title: "Общая цена", width: 15 });

    // Приход (если видимо)
    if (printVisibleColumns.purchase) {
      columnMapping.push({ key: "purchase_price", excelCol: colIndex++, title: "Цена приход за шт.", width: 15 });
      columnMapping.push({ key: "total_purchase", excelCol: colIndex++, title: "Общая цена приход", width: 15 });
    }

    // Доход (если видимо)
    if (printVisibleColumns.income) {
      columnMapping.push({ key: "income_per_unit", excelCol: colIndex++, title: "Доход за шт.", width: 12 });
      columnMapping.push({ key: "total_income", excelCol: colIndex++, title: "Общая цена доход", width: 15 });
    }

    // Скидка (если видимо)
    if (printVisibleColumns.discount) {
      columnMapping.push({ key: "discount_per_unit", excelCol: colIndex++, title: "Скидка за шт.", width: 12 });
      columnMapping.push({ key: "total_discount", excelCol: colIndex++, title: "Общая цена скидка", width: 15 });
    }

    // Объем (если видимо)
    if (printVisibleColumns.volume) {
      columnMapping.push({ key: "total_volume", excelCol: colIndex++, title: "Объём (м³)", width: 12 });
    }

    // Вес (если видимо)
    if (printVisibleColumns.weight) {
      columnMapping.push({ key: "total_weight", excelCol: colIndex++, title: "Вес (кг)", width: 12 });
    }

    // Габариты (если видимо)
    if (printVisibleColumns.dimensions) {
      columnMapping.push({ key: "total_length", excelCol: colIndex++, title: "Длина (см)", width: 12 });
      columnMapping.push({ key: "total_width", excelCol: colIndex++, title: "Ширина (см)", width: 12 });
      columnMapping.push({ key: "total_height", excelCol: colIndex++, title: "Высота (см)", width: 12 });
    }

    // 5. Настройка ширины колонок для основной таблицы
    worksheet.columns = columnMapping.map((col) => ({ width: col.width }));

    // 6. Стили
    const styles = {
      // Основной заголовок
      // mainHeader: {
      //   font: { size: 16, bold: true, color: { argb: "FFFFFFFF" } },
      //   fill: { type: "pattern", pattern: "solid", fgColor: { argb: values.wozwrat_or_prihod === "prihod" ? "FF2E7D32" : "FFC62828" } },
      //   alignment: { horizontal: "center", vertical: "middle" },
      // },
      mainHeader: {
        font: { size: 16, bold: true }, // цвет текста тоже можно убрать или изменить
        alignment: { horizontal: "center", vertical: "middle" },
      },

      // Заголовки таблицы товаров - с РАМКОЙ
      tableHeader: {
        font: { size: 10, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5B9BD5" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      // Данные товаров - с ПОЛНОЙ РАМКОЙ
      dataRow: {
        font: { size: 12 },
        alignment: { horizontal: "left", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      numberCell: {
        font: { size: 12 },
        alignment: { horizontal: "center", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      numberRightCell: {
        font: { size: 12 },
        alignment: { horizontal: "right", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      // Итоговая строка - с РАМКОЙ
      totalRow: {
        font: { size: 10, bold: true },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } },
        alignment: { horizontal: "right", vertical: "middle" },
        border: {
          top: { style: "medium", color: { argb: "FF000000" } },
          bottom: { style: "medium", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      // Итоговая строка для ячеек с числами
      totalRowNumber: {
        font: { size: 10, bold: true },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } },
        alignment: { horizontal: "right", vertical: "middle" },
        border: {
          top: { style: "medium", color: { argb: "FF000000" } },
          bottom: { style: "medium", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      // Информационные ячейки
      infoCell: {
        font: { size: 10 },
        alignment: { horizontal: "left", vertical: "middle" },
      },

      boldInfoCell: {
        font: { size: 10, bold: true },
        alignment: { horizontal: "left", vertical: "middle" },
      },

      partnerCell: {
        font: { size: 16, bold: true },
        alignment: { horizontal: "left", vertical: "middle" },
      },

      // Заголовок сальдо
      saldoHeader: {
        font: { size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } },
        alignment: { horizontal: "center", vertical: "middle" },
      },

      // Данные сальдо - с РАМКОЙ
      saldoData: {
        font: { size: 9 },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      // Заголовок таблицы сальдо - с РАМКОЙ
      saldoTableHeader: {
        font: { size: 9, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF808080" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },
    };

    // 7. Вспомогательные функции
    const formatNumber = (value) => {
      if (!value && value !== 0) return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (error) {
        return dateString;
      }
    };

    // 8. Заголовок документа
    let currentRow = 3; // Сдвигаем из-за логотипа (занимает строки 0-2)

    // Основной заголовок накладной
    const titleRow = worksheet.getRow(currentRow);
    titleRow.getCell(1).value = `${t(values.wozwrat_or_prihod)} ${t("faktura")} №${values.id || "Черновик"}`;
    titleRow.getCell(1).style = styles.mainHeader;
    worksheet.mergeCells(currentRow, 1, currentRow, columnMapping.length);
    currentRow += 2;

    // 9. Информация о документе
    // Дата
    const dateInfo = worksheet.getRow(currentRow);
    dateInfo.getCell(1).value = "Дата:";
    dateInfo.getCell(1).style = styles.boldInfoCell;
    dateInfo.getCell(2).value = formatDate(values.invoice_date || values.invoice_date2 || new Date().toLocaleDateString());
    dateInfo.getCell(2).style = styles.infoCell;
    currentRow++;

    // Склад
    if (values.warehouse_name) {
      const warehouseInfo = worksheet.getRow(currentRow);
      warehouseInfo.getCell(1).value = "Склад:";
      warehouseInfo.getCell(1).style = styles.boldInfoCell;
      warehouseInfo.getCell(2).value = values.warehouse_name + (values.warehouse?.currency ? ` ${values.warehouse.currency}` : "");
      warehouseInfo.getCell(2).style = styles.infoCell;
      currentRow++;
    }

    // Партнер (добавляем здесь, над "Авто")
    if (values.partner?.name) {
      const partnerInfo = worksheet.getRow(currentRow);
      partnerInfo.getCell(1).value = "Партнёр:";
      partnerInfo.getCell(1).style = styles.boldInfoCell;

      let partnerText = values.partner.name;
      // if (values.partner?.phone) {
      //   partnerText += ` (Тел: ${values.partner.phone})`;
      // }
      // if (values.partner?.address) {
      //   partnerText += `, Адрес: ${values.partner.address}`;
      // }

      partnerInfo.getCell(2).value = partnerText;
      partnerInfo.getCell(2).style = styles.partnerCell;
      currentRow++;
    }

    // Тип цены
    const priceTypeInfo = worksheet.getRow(currentRow);
    priceTypeInfo.getCell(1).value = "Тип цены:";
    priceTypeInfo.getCell(1).style = styles.boldInfoCell;
    priceTypeInfo.getCell(2).value = values.type_price === "retail_price" ? "Розничная" : "Оптовая";
    priceTypeInfo.getCell(2).style = styles.infoCell;
    currentRow++;

    // Авто
    if (awtoData && awtoData.name) {
      const awtoInfo = worksheet.getRow(currentRow);
      awtoInfo.getCell(1).value = "Авто:";
      awtoInfo.getCell(1).style = styles.boldInfoCell;
      awtoInfo.getCell(2).value = awtoData.name;
      awtoInfo.getCell(2).style = styles.infoCell;
      currentRow++;
    }

    currentRow += 2;

    // 10. Заголовки таблицы товаров
    const headerRow = worksheet.getRow(currentRow);
    columnMapping.forEach((col) => {
      headerRow.getCell(col.excelCol).value = col.title;
      headerRow.getCell(col.excelCol).style = styles.tableHeader;
    });
    currentRow++;

    // 11. Данные товаров
    const totals = {
      totalPrice: 0,
      totalPurchase: 0,
      totalIncome: 0,
      totalDiscount: 0,
      totalVolume: 0,
      totalWeight: 0,
      totalLength: 0,
      totalWidth: 0,
      totalHeight: 0,
    };

    // Запоминаем начальную строку для таблицы (для рамки вокруг всей таблицы)
    const tableStartRow = currentRow - 1; // строка с заголовками
    const tableEndCol = columnMapping.length;

    values.products.forEach((product, index) => {
      const dataRow = worksheet.getRow(currentRow);

      // Расчет значений для строки
      const qty = formatNumber(product.selected_quantity);
      const price = formatNumber2(product.selected_price);
      const purchasePrice = formatNumber2(product.purchase_price);
      const wholesalePrice = formatNumber2(product.wholesale_price);
      const volume = formatNumber2(product.volume);
      const weight = formatNumber2(product.weight);
      const length = formatNumber2(product.length);
      const width = formatNumber2(product.width);
      const height = formatNumber2(product.height);

      const totalPrice = qty * price;
      const totalPurchase = qty * purchasePrice;
      const incomePerUnit = price - purchasePrice;
      const totalIncome = qty * incomePerUnit;
      const discountPerUnit = price - wholesalePrice;
      const totalDiscount = qty * discountPerUnit;
      const totalVolume = qty * volume;
      const totalWeight = qty * weight;
      const totalLength = qty * length;
      const totalWidth = qty * width;
      const totalHeight = qty * height;

      // Заполняем ячейки
      columnMapping.forEach((col) => {
        const cell = dataRow.getCell(col.excelCol);

        switch (col.key) {
          case "number":
            cell.value = index + 1;
            cell.style = styles.numberCell;
            break;

          case "name":
            cell.value = product.name || "";
            cell.style = styles.dataRow;
            break;

          case "image":
            cell.value = product.images?.length > 0 ? "📷" : "";
            cell.style = styles.numberCell;
            break;

          case "qr_code":
            cell.value = product.qr_code ? "📋" : "";
            cell.style = styles.numberCell;
            break;

          case "quantity":
            cell.value = qty;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            break;

          case "unit":
            cell.value = product.unit_name_on_selected_warehouses || "";
            cell.style = styles.numberCell;
            break;

          case "price":
            cell.value = price;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            break;

          case "totalPrice":
            cell.value = totalPrice;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalPrice += totalPrice;
            break;

          case "purchase_price":
            cell.value = purchasePrice;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            break;

          case "total_purchase":
            cell.value = totalPurchase;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalPurchase += totalPurchase;
            break;

          case "income_per_unit":
            cell.value = incomePerUnit;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            break;

          case "total_income":
            cell.value = totalIncome;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalIncome += totalIncome;
            break;

          case "discount_per_unit":
            cell.value = discountPerUnit;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            break;

          case "total_discount":
            cell.value = totalDiscount;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalDiscount += totalDiscount;
            break;

          case "total_volume":
            cell.value = totalVolume;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalVolume += totalVolume;
            break;

          case "total_weight":
            cell.value = totalWeight;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalWeight += totalWeight;
            break;

          case "total_length":
            cell.value = totalLength;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalLength += totalLength;
            break;

          case "total_width":
            cell.value = totalWidth;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalWidth += totalWidth;
            break;

          case "total_height":
            cell.value = totalHeight;
            cell.numFmt = "#,##0.000";
            cell.style = styles.numberRightCell;
            totals.totalHeight += totalHeight;
            break;

          default:
            cell.value = "";
            cell.style = styles.dataRow;
        }
      });

      currentRow++;
    });

    // 12. Итоговая строка товаров
    const totalRow = worksheet.getRow(currentRow);

    // Заполняем ВСЕ ячейки итоговой строки рамкой
    for (let col = 1; col <= columnMapping.length; col++) {
      const cell = totalRow.getCell(col);
      cell.style = { ...styles.totalRow, alignment: { horizontal: "right" } };
    }

    // Находим колонку "Общая цена" для подписи "ИТОГО:"
    const totalPriceCol = columnMapping.find((col) => col.key === "totalPrice");
    if (totalPriceCol) {
      const labelCol = totalPriceCol.excelCol - 1;
      totalRow.getCell(labelCol).value = "ИТОГО:";
      totalRow.getCell(labelCol).style = { ...styles.totalRow, alignment: { horizontal: "right" } };

      // Заполняем итоги
      columnMapping.forEach((col) => {
        switch (col.key) {
          case "totalPrice":
            totalRow.getCell(col.excelCol).value = totals.totalPrice;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_purchase":
            totalRow.getCell(col.excelCol).value = totals.totalPurchase;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_income":
            totalRow.getCell(col.excelCol).value = totals.totalIncome;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_discount":
            totalRow.getCell(col.excelCol).value = totals.totalDiscount;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_volume":
            totalRow.getCell(col.excelCol).value = totals.totalVolume;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_weight":
            totalRow.getCell(col.excelCol).value = totals.totalWeight;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_length":
            totalRow.getCell(col.excelCol).value = totals.totalLength;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_width":
            totalRow.getCell(col.excelCol).value = totals.totalWidth;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_height":
            totalRow.getCell(col.excelCol).value = totals.totalHeight;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.000";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;
        }
      });
    }

    // 13. Добавляем внешнюю рамку вокруг всей таблицы товаров (если нужно)
    // Можно добавить более толстую рамку вокруг всей таблицы
    const tableEndRow = currentRow; // строка с итогами

    // // Раскомментируйте для внешней рамки вокруг всей таблицы:
    // // Верхняя рамка таблицы
    // for (let col = 1; col <= tableEndCol; col++) {
    //   const cell = worksheet.getRow(tableStartRow).getCell(col);
    //   cell.border = {
    //     ...cell.border,
    //     top: { style: "medium", color: { argb: "FF000000" } }
    //   };
    // }

    // // Нижняя рамка таблицы (итоговая строка уже имеет medium границу)
    // // Левая и правая рамки таблицы
    // for (let row = tableStartRow; row <= tableEndRow; row++) {
    //   const leftCell = worksheet.getRow(row).getCell(1);
    //   const rightCell = worksheet.getRow(row).getCell(tableEndCol);

    //   leftCell.border = {
    //     ...leftCell.border,
    //     left: { style: "medium", color: { argb: "FF000000" } }
    //   };

    //   rightCell.border = {
    //     ...rightCell.border,
    //     right: { style: "medium", color: { argb: "FF000000" } }
    //   };
    // }

    currentRow += 2;
    const applySaldoRowBorder = (row, bold = false) => {
      for (let col = 1; col <= 4; col++) {
        const cell = row.getCell(col);

        // важно: если ячейка пустая — создаём
        if (cell.value === undefined) {
          cell.value = "";
        }

        cell.style = {
          ...styles.saldoData,
          font: bold ? { bold: true } : styles.saldoData.font,
          alignment: {
            horizontal: col >= 3 ? "right" : "left",
            vertical: "middle",
          },
        };
      }
    };

    // 14. Добавляем КОМПАКТНОЕ САЛЬДО если есть данные
    if (saldo && (saldo["60_USD"] || saldo["75_USD"])) {
      // Заголовок сальдо с указанием партнера
      // const saldoTitleRow = worksheet.getRow(currentRow);
      // saldoTitleRow.getCell(1).value = `Карточка сальдо: ${values.partner?.name || "Партнер"}`;
      // saldoTitleRow.getCell(1).style = styles.saldoHeader;
      // worksheet.mergeCells(currentRow, 1, currentRow, 4);
      // currentRow++;

      // Компактная функция для добавления таблицы счета
      const addCompactAccountTable = (accountKey, accountName) => {
        const accountData = saldo[accountKey];
        if (!accountData) return;

        // Название счета (компактно)
        // const accountNameRow = worksheet.getRow(currentRow);
        // accountNameRow.getCell(1).value = accountName;
        // accountNameRow.getCell(1).style = { ...styles.boldInfoCell, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } } };
        // worksheet.mergeCells(currentRow, 1, currentRow, 4);
        // currentRow++;

        // Заголовки таблицы
        const saldoHeaderRow = worksheet.getRow(currentRow);
        saldoHeaderRow.getCell(1).value = "Дата";
        saldoHeaderRow.getCell(2).value = "Описание";
        saldoHeaderRow.getCell(3).value = "Дебет";
        saldoHeaderRow.getCell(4).value = "Кредит";

        for (let i = 1; i <= 4; i++) {
          saldoHeaderRow.getCell(i).style = styles.saldoTableHeader;
        }
        currentRow++;

        // Начальное сальдо (одна строка)
        const openingRow = worksheet.getRow(currentRow);
        openingRow.getCell(1).value = "Начало";
        openingRow.getCell(2).value = "Остаток на начало";
        const start_calc = accountData.start?.[0] - accountData.start?.[1]
        let start_debit = 0 
        let start_credit = 0 
        if (start_calc > 0) {
          start_debit = start_calc
        } else if (start_calc < 0) {
          start_credit = Math.abs(start_calc)
        }
        openingRow.getCell(3).value = formatNumber2(start_debit) || "0";
        openingRow.getCell(3).style = { ...styles.saldoData, alignment: { horizontal: "right" } };
        openingRow.getCell(4).value = formatNumber2(start_credit) || "0";
        openingRow.getCell(4).style = { ...styles.saldoData, alignment: { horizontal: "right" } };
        applySaldoRowBorder(openingRow);
        currentRow++;

        // Обороты за день (максимум 5 последних операций)
        if (accountData.today_entries && accountData.today_entries.length > 0) {
          const entriesToShow = accountData.today_entries.slice(-5); // Показываем последние 5 операций

          entriesToShow.forEach((entry, idx) => {
            const dataRow = worksheet.getRow(currentRow);
            dataRow.getCell(1).value = entry[0]?.split(" ")[0]?.replace(/-/g, ".") || "";
            dataRow.getCell(2).value = entry[1] || "";
            dataRow.getCell(3).value = entry[2] !== "0" ? formatNumber2(entry[2]) : "-";
            dataRow.getCell(3).style = { ...styles.saldoData, alignment: { horizontal: "right" } };
            dataRow.getCell(4).value = entry[3] !== "0" ? formatNumber2(entry[3]) : "-";
            dataRow.getCell(4).style = { ...styles.saldoData, alignment: { horizontal: "right" } };
            applySaldoRowBorder(dataRow);
            currentRow++;
          });

          // Если операций больше 5, показываем "..."
          if (accountData.today_entries.length > 5) {
            const moreRow = worksheet.getRow(currentRow);
            moreRow.getCell(2).value = `... и еще ${accountData.today_entries.length - 5} операций`;
            moreRow.getCell(2).style = { ...styles.saldoData, font: { italic: true } };
            worksheet.mergeCells(currentRow, 2, currentRow, 4);
            currentRow++;
          }
     
        }

        // Итоговый оборот (одна строка)
        const totalRow = worksheet.getRow(currentRow);
        totalRow.getCell(1).value = "Оборот";
        totalRow.getCell(2).value = "Итого оборот";
        totalRow.getCell(3).value = formatNumber2(accountData.final?.[0]) || "0";
        totalRow.getCell(3).style = { ...styles.saldoData, alignment: { horizontal: "right" }, font: { bold: true } };
        totalRow.getCell(4).value = formatNumber2(accountData.final?.[1]) || "0";
        totalRow.getCell(4).style = { ...styles.saldoData, alignment: { horizontal: "right" }, font: { bold: true } };
        applySaldoRowBorder(totalRow, true);
        currentRow++;

        // Конечное сальдо (одна строка)
        const closingRow = worksheet.getRow(currentRow);
        closingRow.getCell(1).value = "Конец";
        closingRow.getCell(2).value = "Остаток на конец";
        closingRow.getCell(3).value = accountData.saldo?.[0] !== "0" ? formatNumber2(accountData.saldo?.[0]) : "-";
        closingRow.getCell(3).style = { ...styles.saldoData, alignment: { horizontal: "right" }, font: { bold: true } };
        closingRow.getCell(4).value = accountData.saldo?.[1] !== "0" ? formatNumber2(accountData.saldo?.[1]) : "-";
        closingRow.getCell(4).style = { ...styles.saldoData, alignment: { horizontal: "right" }, font: { bold: true } };
        applySaldoRowBorder(closingRow, true);
        currentRow += 2;
      };

      // Добавляем таблицы счетов
      if (saldo["60_USD"]) {
        addCompactAccountTable("60_USD", "60 Клиент USD");
      }

      if (values.partner?.type === "founder" && saldo["75_USD"]) {
        addCompactAccountTable("75_USD", "75 Учредитель USD");
      }
    }

    // 15. Автонастройка ширины колонок для сальдо
    worksheet.columns = [
      { width: 10 }, // A: Дата/Тип
      { width: 60 }, // B: Описание
      { width: 12 }, // C: Дебет
      { width: 12 }, // D: Кредит
      ...columnMapping.slice(4).map((col) => ({ width: col.width })), // Остальные колонки основной таблицы
    ];

    // 16. Сохранение файла
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Генерируем имя файла с именем партнера
    const invoiceType = t(values.wozwrat_or_prihod);
    const invoiceNumber = values.id || "draft";
    const partnerName = values.partner?.name
      ? values.partner.name
          .replace(/[^\w\sа-яА-Я]/gi, "")
          .replace(/\s+/g, "_")
          .substring(0, 30)
      : "partner";
    const date = new Date().toISOString().split("T")[0];
    const fileName = `${invoiceType}_${invoiceNumber}_${partnerName}_${date}.xlsx`;

    saveAs(blob, fileName);

    console.log("Excel файл успешно создан!");
  } catch (error) {
    console.error("Ошибка при экспорте в Excel:", error);
    alert(`Ошибка при экспорте: ${error.message}`);
  }
};

export default exportInvoiceWithSaldoToExcel;
