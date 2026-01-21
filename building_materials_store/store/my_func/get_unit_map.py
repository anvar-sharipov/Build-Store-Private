from ..models import ProductUnit
from icecream import ic





def get_unit_map():
    product_units = (
        ProductUnit.objects
        .filter(is_default_for_sale=True)
        .select_related("unit")
    )
    unit_map = {pu.product_id: pu for pu in product_units}
    return unit_map