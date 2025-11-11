export function formatNumber2(value, fixed = 2) {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);
  if (isNaN(num)) return "";

  // Если значение реально равно 0 → показываем "-"
  if (num === 0) return "-";

  // Округление с нужным количеством знаков
  const formatted = num.toFixed(fixed);
  const [whole, frac] = formatted.split(".");

  // Добавляем пробелы в тысячах
  const wholeFormatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${wholeFormatted}.${frac}`;
}