// import Decimal from "decimal.js";

// const MyDecimalPrice = (v) =>
//   new Decimal(v).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

// export default MyDecimalPrice

import Decimal from "decimal.js";

const safeDecimal = (value) => {
  try {
    if (value === null || value === undefined) {
      return new Decimal(0);
    }

    const normalized = String(value).replace(",", ".").trim();

    // Разрешаем:
    // 123
    // 123.45
    // .45
    // 0.45
    // 0
    const isValidNumber = /^-?\d*(\.\d*)?$/.test(normalized);

    // Если невалидное число или просто "." или "-"
    if (!isValidNumber || normalized === "" || normalized === "." || normalized === "-" || normalized === "-.") {
      return new Decimal(0);
    }

    return new Decimal(normalized);
  } catch (e) {
    return new Decimal(0);
  }
};
// const MyDecimalPrice = (qty, price) => new Decimal(qty).mul(new Decimal(price)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
const MyDecimalPrice = (qty, price) => safeDecimal(qty).mul(safeDecimal(price)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

const sumMoney = (items, priceKey, qtyKey) =>
  items
    .reduce((acc, item) => {
      let price = 0;
      if (priceKey === "selected_price") {
        if (item.price_after_discount > 0) {
          price = safeDecimal(item["price_after_discount"]);
        } else {
          price = safeDecimal(item["selected_price"]);
        }
      } else {
        price = safeDecimal(item[priceKey]);
      }

      const qty = safeDecimal(item[qtyKey]);

      const rowSum = price.mul(qty).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      return acc.plus(rowSum);
    }, new Decimal(0))
    .toNumber();

// const sumMoney = (items, priceKey, qtyKey) =>
//   items
//     .reduce((acc, item) => {
//       const price = new Decimal(item[priceKey] || 0);
//       const qty = new Decimal(item[qtyKey] || 0);

//       const rowSum = price.mul(qty).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

//       return acc.plus(rowSum);
//     }, new Decimal(0))
//     .toNumber();

const sumDiffMoney = (items, priceA, priceB, qtyKey) =>
  items
    .reduce((acc, item) => {
      let a;
      let b;
      if (priceA == "selected_price") {
        if (item.price_after_discount > 0) {
          a = safeDecimal(item["price_after_discount"]);
          b = safeDecimal(item[priceB]);
        } else {
          a = safeDecimal(item[priceA]);
          b = safeDecimal(item[priceB]);
        }
      } else {
        a = safeDecimal(item[priceA]);
        b = safeDecimal(item[priceB]);
      }

      const qty = safeDecimal(item[qtyKey]);

      return acc.plus(a.minus(b).mul(qty));
    }, new Decimal(0))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();

// const sumDiffMoney = (items, priceA, priceB, qtyKey) =>
//   items
//     .reduce((acc, item) => {
//       const a = new Decimal(item[priceA] || 0);
//       const b = new Decimal(item[priceB] || 0);
//       const qty = new Decimal(item[qtyKey] || 0);
//       return acc.plus(a.minus(b).mul(qty));
//     }, new Decimal(0))
//     .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
//     .toNumber();

export { sumDiffMoney, sumMoney, MyDecimalPrice };
