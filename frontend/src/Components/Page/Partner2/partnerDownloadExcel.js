import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export const partnerDownloadExcel = (data, t) => {

  const worksheetData = data.map((emp, idx) => ({
    // "№": idx + 1,
    [t("id")]: emp.id,
    [t("partner")]: emp.name,
    [t("type")]: emp.type_display,
    [t("type_eng")]: emp.type_display,
    [t("is_active")]: emp.is_active,
    [t("balance")]: emp.balance,
    [t("balance_usd")]: emp.balance_usd,
    [t("balance_tmt")]: emp.balance_tmt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "partners");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  const date = new Date();
  const formattedDate = date.toISOString().slice(0, 10);

  saveAs(blob, `${t("partners")}_${formattedDate}.xlsx`);
};
