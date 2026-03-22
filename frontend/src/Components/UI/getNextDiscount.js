export default function getNextDiscount(qty, rules) {
    // console.log("rulesRRRRRRR", rules);
    
  const sorted = [...rules].sort((a, b) => Number(a.min_quantity) - Number(b.min_quantity));

  for (const rule of sorted) {
    if (qty < Number(rule.min_quantity)) {
      return {
        need: Number(rule.min_quantity) - qty,
        discount: Number(rule.discount_percent),
      };
    }
  }

  return null;
}
