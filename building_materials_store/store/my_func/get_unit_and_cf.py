from decimal import Decimal


def get_unit_and_cf(unit_map, product):
    pu = unit_map.get(product.id)
    if pu:
        unit = pu.unit.name
        conversion_factor = Decimal(pu.conversion_factor)
    else:
        unit = product.base_unit.name if product.base_unit else ""
        conversion_factor = Decimal("1")
        
    return unit, conversion_factor