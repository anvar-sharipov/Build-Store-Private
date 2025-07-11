export function formatNumber(value, fixed=2) {
  const number = Number(parseFloat(value).toFixed(fixed));
  if (isNaN(number)) return "";

  const parts = number.toString().split(".");
  const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  if (parts[1] && parts[1] !== "00") {
    return `${whole}.${parts[1]}`;
  }

  return whole;
}