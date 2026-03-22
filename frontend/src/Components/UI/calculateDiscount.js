export default function calculateDiscount(product, qty, percent = 0, price_type = 'wholesale_price') {
  if (percent === 0) {
    const rules = [...(product.quantity_discounts || [])].sort((a, b) => a.min_quantity - b.min_quantity);
    for (const rule of rules) {
      if (qty >= rule.min_quantity) {
        percent = Number(rule.discount_percent);
      }
    }
  }

//   console.log("price_type VVVVVVVVVVVVV", price_type);
  

  let price = Number(product.wholesale_price) || 0;
  if (price_type === 'retail_price') {
    price = Number(product.retail_price) || 0;
  }
  
//   console.log("price VVVVVVVVVVVVV", price);
  

  const price_after_discount = +(price * (1 - percent / 100)).toFixed(3);
  const discount_amount = +(price - price_after_discount).toFixed(3);
    // console.log("wqwqw", percent);

  return {
    percent,
    price_after_discount,
    discount_amount,
  };
}

// export default function calculateDiscount(product, qty, percent=0) {

//   let percent = 0;
//   const rules = [...(product.quantity_discounts || [])].sort((a, b) => Number(a.min_quantity) - Number(b.min_quantity));
//   // console.log("rules", rules);
//   rules.forEach((rule) => {
//     if (qty >= Number(rule.min_quantity)) {
//       percent = Number(rule.discount_percent);
//     }
//   });

//   const price = Number(product.wholesale_price) || 0;

//   const price_after_discount = +(price * (1 - percent / 100)).toFixed(3);
//   const discount_amount = +(price - price_after_discount).toFixed(3);

//   return {
//     percent: percent,
//     price_after_discount: price_after_discount,
//     discount_amount: discount_amount,
//   };
// }
