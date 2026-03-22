def get_quantity_discounts(product):
    discounts = product.quantity_discounts.all()

    return [
        {
            "id": d.id,
            "min_quantity": str(d.min_quantity),
            "discount_percent": str(d.discount_percent),
        }
        for d in discounts
    ]