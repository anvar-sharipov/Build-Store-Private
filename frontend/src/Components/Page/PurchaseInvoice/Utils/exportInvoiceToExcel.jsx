import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatNumber2 } from "../../../UI/formatNumber2";

const exportInvoiceWithSaldoToExcel = async (values, visibleColumns, printVisibleColumns, t, awtoData, saldoForExcel, saldo2) => {
  console.log("ryryryr");

  const safeNumber = (v, decimals = null) => {
    if (v === null || v === undefined || v === "") return null;

    const n = Number(String(v).replace(",", "."));
    if (!Number.isFinite(n)) return null;

    if (typeof decimals === "number") {
      const factor = 10 ** decimals;
      return Math.round(n * factor) / factor;
    }

    return n;
  };

  const setExcelNumber = (cell, value, decimals = 2) => {
    const n = safeNumber(value, decimals);

    cell.value = n;
    cell.style = styles.numberRightCell;

    if (decimals === 0) {
      cell.numFmt = "#,##0";
    } else {
      cell.numFmt = `#,##0.${"0".repeat(decimals)}`;
    }
  };

  const toNumber = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  // const saldo = saldoForExcel;
  const saldo = saldo2;
  // console.log("saldo2GGGG", saldo2);

  try {
    // 1. Создание книги и листа
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Фактура с сальдо");

    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: "portrait", // или "landscape"
      fitToPage: true,
      fitToWidth: 1, // 👈 не более 1 страницы в ширину
      fitToHeight: 1, // 👈 не более 1 страницы в высоту
    };

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

    columnMapping.push({ key: "number", excelCol: colIndex++, title: "№     ✓", width: 5 });
    ~(
      // columnMapping.push({ key: "check", excelCol: colIndex++, title: "✓", width: 4 });
      columnMapping.push({ key: "name", excelCol: colIndex++, title: t("name2"), width: 40 })
    );

    if (printVisibleColumns.image) {
      columnMapping.push({ key: "image", excelCol: colIndex++, title: t("image"), width: 10 });
    }

    if (printVisibleColumns.qr_code) {
      columnMapping.push({ key: "qr_code", excelCol: colIndex++, title: "QR", width: 10 });
    }

    columnMapping.push({ key: "quantity", excelCol: colIndex++, title: t("q-ty"), width: 11 });
    columnMapping.push({ key: "unit", excelCol: colIndex++, title: t("un"), width: 8 });
    columnMapping.push({ key: "price", excelCol: colIndex++, title: "Цена за шт.", width: 11 });
    columnMapping.push({ key: "totalPrice", excelCol: colIndex++, title: "Общая цена", width: 15 });

    if (printVisibleColumns.purchase) {
      columnMapping.push({ key: "purchase_price", excelCol: colIndex++, title: "Цена приход за шт.", width: 15 });
      columnMapping.push({ key: "total_purchase", excelCol: colIndex++, title: "Общая цена приход", width: 15 });
    }

    if (printVisibleColumns.income) {
      columnMapping.push({ key: "income_per_unit", excelCol: colIndex++, title: "Доход за шт.", width: 12 });
      columnMapping.push({ key: "total_income", excelCol: colIndex++, title: "Общая цена доход", width: 15 });
    }

    if (printVisibleColumns.discount) {
      columnMapping.push({ key: "discount_per_unit", excelCol: colIndex++, title: "Скидка за шт.", width: 12 });
      columnMapping.push({ key: "total_discount", excelCol: colIndex++, title: "Общая цена скидка", width: 15 });
    }

    if (printVisibleColumns.volume) {
      columnMapping.push({ key: "total_volume", excelCol: colIndex++, title: "Объём (м³)", width: 12 });
    }

    if (printVisibleColumns.weight) {
      columnMapping.push({ key: "total_weight", excelCol: colIndex++, title: "Вес (кг)", width: 12 });
    }

    if (printVisibleColumns.dimensions) {
      columnMapping.push({ key: "total_length", excelCol: colIndex++, title: "Длина (см)", width: 12 });
      columnMapping.push({ key: "total_width", excelCol: colIndex++, title: "Ширина (см)", width: 12 });
      columnMapping.push({ key: "total_height", excelCol: colIndex++, title: "Высота (см)", width: 12 });
    }

    // 5. Настройка ширины колонок для основной таблицы
    worksheet.columns = columnMapping.map((col) => ({ width: col.width }));

    // 6. Стили
    const styles = {
      mainHeader: {
        font: { size: 16, bold: true },
        alignment: { horizontal: "center", vertical: "middle" },
      },

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

      dataRow: {
        font: { size: 14 },
        alignment: { horizontal: "left", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      numberCell: {
        font: { size: 14 },
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

      saldoHeader: {
        font: { size: 12, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } },
        alignment: { horizontal: "center", vertical: "middle" },
      },

      saldoData: {
        font: { size: 12 },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      },

      saldoTableHeader: {
        font: { size: 11, bold: true, color: { argb: "FFFFFFFF" } },
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
    let currentRow = 3;

    const titleRow = worksheet.getRow(1);
    titleRow.getCell(2).value = `${t(values.wozwrat_or_prihod)} ${t("faktura")} №${values.id || "Черновик"}`;
    titleRow.getCell(2).style = styles.mainHeader;
    worksheet.mergeCells(1, 2, 1, columnMapping.length);
    // currentRow += 2;

    // 9. Информация о документе
    const dateInfo = worksheet.getRow(currentRow);
    dateInfo.getCell(1).value = "Дата:";
    dateInfo.getCell(1).style = styles.boldInfoCell;
    dateInfo.getCell(2).value = formatDate(values.invoice_date || values.invoice_date2 || new Date().toLocaleDateString());
    dateInfo.getCell(2).style = styles.infoCell;
    currentRow++;

    if (values.warehouse_name) {
      const warehouseInfo = worksheet.getRow(currentRow);
      warehouseInfo.getCell(1).value = "Склад:";
      warehouseInfo.getCell(1).style = styles.boldInfoCell;
      warehouseInfo.getCell(2).value = values.warehouse_name + (values.warehouse?.currency ? ` ${values.warehouse.currency}` : "");
      warehouseInfo.getCell(2).style = styles.infoCell;
      currentRow++;
    }

    if (values.partner?.name) {
      const partnerInfo = worksheet.getRow(currentRow);
      partnerInfo.getCell(1).value = "Партнёр:";
      partnerInfo.getCell(1).style = styles.boldInfoCell;
      partnerInfo.getCell(2).value = values.partner.name;
      partnerInfo.getCell(2).style = styles.partnerCell;
      currentRow++;
    }

    const priceTypeInfo = worksheet.getRow(currentRow);
    priceTypeInfo.getCell(1).value = "Тип цены:";
    priceTypeInfo.getCell(1).style = styles.boldInfoCell;
    priceTypeInfo.getCell(2).value = values.type_price === "retail_price" ? "Розничная" : "Оптовая";
    priceTypeInfo.getCell(2).style = styles.infoCell;
    currentRow++;

    if (awtoData && awtoData.name) {
      const awtoInfo = worksheet.getRow(currentRow);
      awtoInfo.getCell(1).value = "Авто:";
      awtoInfo.getCell(1).style = styles.boldInfoCell;
      awtoInfo.getCell(2).value = awtoData.name;
      awtoInfo.getCell(2).style = styles.infoCell;
      currentRow++;
    }

    // currentRow += 2;

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

    values.products.forEach((product, index) => {
      const dataRow = worksheet.getRow(currentRow);
      // dataRow.height = 30

      const qty = toNumber(product.selected_quantity);
      const price = toNumber(product.selected_price);
      const purchasePrice = toNumber(product.purchase_price);
      const wholesalePrice = toNumber(product.wholesale_price);
      const volume = toNumber(product.volume);
      const weight = toNumber(product.weight);
      const length = toNumber(product.length);
      const width = toNumber(product.width);
      const height = toNumber(product.height);

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

      columnMapping.forEach((col) => {
        const cell = dataRow.getCell(col.excelCol);

        switch (col.key) {
          // case "number":
          //   cell.value = index + 1;
          //   cell.style = styles.numberCell;
          //   break;
          case "number": {
            // const mark = product.checked ? "✓" : "";
            cell.value = `    ${index + 1}`;
            cell.alignment = {
              horizontal: "left",
              vertical: "middle",
            };
            cell.border = styles.numberCell.border;
            break;
          }

          // case "check":
          //   cell.value = ""; // пусто
          //   cell.style = styles.numberCell; // центр + рамка
          //   break;

          case "name":
            cell.value = product.name || "";
            cell.style = styles.dataRow;
            cell.alignment = {
              horizontal: "left",
              vertical: "top",
              wrapText: true, // ← перенос строки
            };
            break;

          case "image":
            cell.value = product.images?.length > 0 ? "📷" : "";
            cell.style = styles.numberCell;
            break;

          case "qr_code":
            cell.value = product.qr_code ? "📋" : "";
            cell.style = styles.numberCell;
            break;

          case "quantity": {
            const q = safeNumber(qty);

            cell.value = Number(q);

            cell.alignment = {
              horizontal: "right",
              vertical: "middle", // ✅ ВОТ ОНО
            };

            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };

            cell.font = { size: 14 };

            if (Number.isInteger(q)) {
              cell.numFmt = "#,##0";
            } else {
              cell.numFmt = "#,##0.###";
            }

            break;
          }

          case "unit":
            const unit = product.unit_name_on_selected_warehouses || "";
            cell.value = unit;

            cell.font = { size: 12 }; // ✅ 11
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };

            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
            break;

          case "price":
            cell.value = safeNumber(price);

            cell.font = { size: 12 }; // ✅ 11
            cell.alignment = {
              horizontal: "right",
              vertical: "middle",
            };

            cell.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };

            cell.numFmt = "#,##0.000";
            break;

          case "totalPrice":
            // Общая цена: всегда 2 знака после запятой
            cell.value = totalPrice;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
            totals.totalPrice += totalPrice;
            break;

          case "purchase_price":
            cell.value = purchasePrice;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.000";
            break;

          case "total_purchase":
            cell.value = totalPurchase;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
            totals.totalPurchase += totalPurchase;
            break;

          case "income_per_unit":
            cell.value = incomePerUnit;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.000";
            break;

          case "total_income":
            cell.value = totalIncome;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
            totals.totalIncome += totalIncome;
            break;

          case "discount_per_unit":
            cell.value = discountPerUnit;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.000";
            break;

          case "total_discount":
            cell.value = totalDiscount;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
            totals.totalDiscount += totalDiscount;
            break;

          case "total_volume":
            cell.value = totalVolume;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
            totals.totalVolume += totalVolume;
            break;

          case "total_weight":
            cell.value = totalWeight;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
            totals.totalWeight += totalWeight;
            break;

          case "total_length":
            cell.value = totalLength;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
            totals.totalLength += totalLength;
            break;

          case "total_width":
            cell.value = totalWidth;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
            totals.totalWidth += totalWidth;
            break;

          case "total_height":
            cell.value = totalHeight;
            cell.style = styles.numberRightCell;
            cell.numFmt = "#,##0.00";
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

    for (let col = 1; col <= columnMapping.length; col++) {
      const cell = totalRow.getCell(col);
      cell.style = { ...styles.totalRow, alignment: { horizontal: "right" } };
    }

    const totalPriceCol = columnMapping.find((col) => col.key === "totalPrice");
    if (totalPriceCol) {
      const labelCol = totalPriceCol.excelCol - 1;
      totalRow.getCell(labelCol).value = "ИТОГО:";
      totalRow.getCell(labelCol).style = { ...styles.totalRow, alignment: { horizontal: "right" } };

      columnMapping.forEach((col) => {
        switch (col.key) {
          case "totalPrice":
            totalRow.getCell(col.excelCol).value = totals.totalPrice;

            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            break;

          case "total_purchase":
            totalRow.getCell(col.excelCol).value = totals.totalPurchase;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_income":
            totalRow.getCell(col.excelCol).value = totals.totalIncome;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_discount":
            totalRow.getCell(col.excelCol).value = totals.totalDiscount;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_volume":
            totalRow.getCell(col.excelCol).value = totals.totalVolume;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_weight":
            totalRow.getCell(col.excelCol).value = totals.totalWeight;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_length":
            totalRow.getCell(col.excelCol).value = totals.totalLength;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_width":
            totalRow.getCell(col.excelCol).value = totals.totalWidth;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;

          case "total_height":
            totalRow.getCell(col.excelCol).value = totals.totalHeight;
            totalRow.getCell(col.excelCol).numFmt = "#,##0.00";
            totalRow.getCell(col.excelCol).style = styles.totalRowNumber;
            break;
        }
      });
    }

    currentRow += 2;

    // const applySaldoRowBorder = (row, bold = false) => {
    //   for (let col = 1; col <= 4; col++) {
    //     const cell = row.getCell(col);

    //     if (cell.value === undefined) {
    //       cell.value = null;
    //     }

    //     cell.style = {
    //       ...styles.saldoData,
    //       font: bold ? { bold: true } : styles.saldoData.font,
    //       alignment: {
    //         horizontal: col >= 3 ? "right" : "left",
    //         vertical: "middle",
    //       },
    //     };
    //   }
    // };

    const applySaldoRowBorder = (row, bold = false) => {
      for (let col = 1; col <= 4; col++) {
        const cell = row.getCell(col);

        if (cell.value === undefined) {
          cell.value = null;
        }

        cell.border = styles.saldoData.border;

        cell.alignment = {
          horizontal: col >= 3 ? "right" : "left",
          vertical: "middle",
        };

        if (bold) {
          cell.font = { ...(cell.font || {}), bold: true };
        }
      }
    };

    worksheet.getColumn(1).width = 10; // Дата
    worksheet.getColumn(2).width = 60; // Описание
    worksheet.getColumn(3).width = 11; // Дебет
    worksheet.getColumn(4).width = 11; // Кредит

    // 14. Добавляем КОМПАКТНОЕ САЛЬДО если есть данные
    if (saldo && (saldo["60_USD"] || saldo["75_USD"])) {
      console.log("sesesese");

      const addCompactAccountTable = (accountKey, accountName) => {
        const accountData = saldo[accountKey];
        if (!accountData) return;

        const saldoHeaderRow = worksheet.getRow(currentRow);
        saldoHeaderRow.getCell(1).value = "Дата";
        saldoHeaderRow.getCell(2).value = "Описание";
        saldoHeaderRow.getCell(3).value = "Дебет";
        saldoHeaderRow.getCell(4).value = "Кредит";

        for (let i = 1; i <= 4; i++) {
          saldoHeaderRow.getCell(i).style = styles.saldoTableHeader;
        }
        currentRow++;

        const openingRow = worksheet.getRow(currentRow);
        openingRow.getCell(1).value = "Начало";
        openingRow.getCell(2).value = "Остаток на начало";
        const start_calc = accountData.start?.[0] - accountData.start?.[1];
        let start_debit = 0;
        let start_credit = 0;
        if (start_calc > 0) {
          start_debit = start_calc;
        } else if (start_calc < 0) {
          start_credit = Math.abs(start_calc);
        }
        openingRow.getCell(3).value = safeNumber(start_debit, 2);

        openingRow.getCell(3).style = { ...styles.saldoData, alignment: { horizontal: "right" } };
        openingRow.getCell(3).numFmt = "#,##0.00";
        openingRow.getCell(4).value = safeNumber(start_credit, 2);

        openingRow.getCell(4).style = { ...styles.saldoData, alignment: { horizontal: "right" } };
        openingRow.getCell(4).numFmt = "#,##0.00";
        applySaldoRowBorder(openingRow);
        currentRow++;

        // if (accountData.today_entries && accountData.today_entries.length > 0) {
        //   const entriesToShow = accountData.today_entries.slice(-5);

        //   entriesToShow.forEach((entry, idx) => {
        //     const dataRow = worksheet.getRow(currentRow);
        //     dataRow.getCell(1).value = entry[0]?.split(" ")[0]?.replace(/-/g, ".") || "";
        //     dataRow.getCell(2).value = entry[1] || "";

        //     const debitCell = dataRow.getCell(3);
        //     debitCell.value = safeNumber(entry[2]);
        //     debitCell.numFmt = "#,##0.00";
        //     debitCell.style = {
        //       ...styles.saldoData,
        //       alignment: { horizontal: "right" },
        //     };

        //     const creditCell = dataRow.getCell(4);
        //     creditCell.value = safeNumber(entry[3]);
        //     creditCell.numFmt = "#,##0.00";
        //     creditCell.style = { ...styles.saldoData, alignment: { horizontal: "right" } };
        //     applySaldoRowBorder(dataRow);
        //     currentRow++;
        //   });

        //   if (accountData.today_entries.length > 5) {
        //     const moreRow = worksheet.getRow(currentRow);
        //     moreRow.getCell(2).value = `... и еще ${accountData.today_entries.length - 5} операций`;
        //     moreRow.getCell(2).style = { ...styles.saldoData, font: { italic: true } };
        //     worksheet.mergeCells(currentRow, 2, currentRow, 4);
        //     currentRow++;
        //   }
        // }

        // console.log("accountKey:", accountKey);
        // console.log("accountData:", accountData);
        // console.log("today_entries:", accountData.today_entries);
        // console.log("today_entries length:", accountData.today_entries?.length);

        if (accountData.today_entries && accountData.today_entries.length > 0) {
          accountData.today_entries.forEach((entry) => {
            const dataRow = worksheet.getRow(currentRow);
            dataRow.getCell(1).value = entry[0]?.split(" ")[0]?.replace(/-/g, ".") || "";
            dataRow.getCell(2).value = entry[1] || "";

            const debitCell = dataRow.getCell(3);
            debitCell.value = safeNumber(entry[2], 2);

            debitCell.style = { ...styles.saldoData, alignment: { horizontal: "right" } };
            debitCell.numFmt = "#,##0.00";

            const creditCell = dataRow.getCell(4);
            creditCell.value = safeNumber(entry[3], 2);

            creditCell.style = { ...styles.saldoData, alignment: { horizontal: "right" } };
            creditCell.numFmt = "#,##0.00";

            applySaldoRowBorder(dataRow);
            currentRow++;
          });
        }

        const totalRow = worksheet.getRow(currentRow);
        totalRow.getCell(1).value = "Оборот";
        totalRow.getCell(2).value = "Итого оборот";
        totalRow.getCell(3).value = safeNumber(accountData.oborot?.[0], 2);

        // console.log("accountData.final?.[1]", accountData.final?.[0]);
        // console.log("formatNumber2(accountData.final?.[0])", formatNumber2(accountData.final?.[0]));

        totalRow.getCell(3).style = { ...styles.saldoData, alignment: { horizontal: "right" }, font: { bold: true } };
        totalRow.getCell(3).numFmt = "#,##0.00";

        totalRow.getCell(4).value = safeNumber(accountData.oborot?.[1], 2);

        totalRow.getCell(4).style = { ...styles.saldoData, alignment: { horizontal: "right" }, font: { bold: true } };
        totalRow.getCell(4).numFmt = "#,##0.00";
        applySaldoRowBorder(totalRow, true);
        currentRow++;

        const closingRow = worksheet.getRow(currentRow);
        closingRow.getCell(1).value = "Конец";
        closingRow.getCell(2).value = "Остаток на конец";
        closingRow.getCell(3).value = safeNumber(accountData.saldo?.[0], 2);

        closingRow.getCell(3).style = { ...styles.saldoData, alignment: { horizontal: "right" }, font: { bold: true } };
        closingRow.getCell(3).numFmt = "#,##0.00";
        closingRow.getCell(4).value = safeNumber(accountData.saldo?.[1], 2);

        closingRow.getCell(4).style = { ...styles.saldoData, alignment: { horizontal: "right" }, font: { bold: true } };
        closingRow.getCell(4).numFmt = "#,##0.00";
        applySaldoRowBorder(closingRow, true);
        currentRow += 2;
      };

      if (saldo["60_USD"]) {
        addCompactAccountTable("60_USD", "60 Клиент USD");
      }

      // if (values.partner?.type === "founder" && saldo["75_USD"]) {
      //   addCompactAccountTable("75_USD", "75 Учредитель USD");
      // }
    }

    // 15. Автонастройка ширины колонок для сальдо
    // worksheet.columns = [{ width: 10 }, { width: 60 }, { width: 12 }, { width: 12 }, ...columnMapping.slice(4).map((col) => ({ width: col.width }))];

    // 16. Сохранение файла
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

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
