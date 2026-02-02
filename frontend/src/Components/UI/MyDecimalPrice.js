// import Decimal from "decimal.js";

// const MyDecimalPrice = (v) =>
//   new Decimal(v).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

// export default MyDecimalPrice

import Decimal from "decimal.js";

const MyDecimalPrice = (qty, price) => new Decimal(qty).mul(new Decimal(price)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

// const sumMoney = (items, priceKey, qtyKey) =>
//   items.reduce((acc, item) => {
//     const price = new Decimal(item[priceKey] || 0);
//     const qty = new Decimal(item[qtyKey] || 0);
//     return acc.plus(price.mul(qty));
//   }, new Decimal(0))
//   .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
//   .toNumber();

const sumMoney = (items, priceKey, qtyKey) =>
  items
    .reduce((acc, item) => {
      const price = new Decimal(item[priceKey] || 0);
      const qty = new Decimal(item[qtyKey] || 0);

      const rowSum = price.mul(qty).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      return acc.plus(rowSum);
    }, new Decimal(0))
    .toNumber();

const sumDiffMoney = (items, priceA, priceB, qtyKey) =>
  items
    .reduce((acc, item) => {
      const a = new Decimal(item[priceA] || 0);
      const b = new Decimal(item[priceB] || 0);
      const qty = new Decimal(item[qtyKey] || 0);
      return acc.plus(a.minus(b).mul(qty));
    }, new Decimal(0))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();

export { sumDiffMoney, sumMoney, MyDecimalPrice };
