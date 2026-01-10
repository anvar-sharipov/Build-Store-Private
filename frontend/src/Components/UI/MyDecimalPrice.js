import Decimal from "decimal.js";

const MyDecimalPrice = (v) =>
  new Decimal(v).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();


export default MyDecimalPrice