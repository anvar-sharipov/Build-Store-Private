export function formatNumber2(value, fixed = 2, nullOrHyphen = true) {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);
  if (isNaN(num)) return "";

  // Если значение реально равно 0 → показываем "-"
  if (num === 0) {
    if (nullOrHyphen) {
      return "-";
    } else {
      return fixed === 0 ? "0" : "0.00";
    }
  }

  // Если fixed = 0 → выводим целое число без дробной части
  if (fixed === 0) {
    const whole = Math.round(num); // округляем
    const wholeFormatted = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return wholeFormatted;
  }

  // Округление с нужным количеством знаков
  const formatted = num.toFixed(fixed);
  const [whole, frac] = formatted.split(".");

  // Разделяем тысячи пробелами
  const wholeFormatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${wholeFormatted}.${frac}`;
}

// // isklyuchitelno dlya OSW gde 0 eto - i 2 sifry posle tochki
// export function formatNumber2(value, fixed = 2, nullOrHyphen = true) {
//   if (value === null || value === undefined || value === "") return "";

//   const num = Number(value);
//   if (isNaN(num)) return "";

//   // Если значение реально равно 0 → показываем "-"
//   if (num === 0) {
//     if (nullOrHyphen) {
//       return "-"
//     } else {
//       return "0.00"
//     }
//   } ;

//   // Округление с нужным количеством знаков
//   const formatted = num.toFixed(fixed);
//   const [whole, frac] = formatted.split(".");

//   // Добавляем пробелы в тысячах
//   const wholeFormatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

//   return `${wholeFormatted}.${frac}`;
// }