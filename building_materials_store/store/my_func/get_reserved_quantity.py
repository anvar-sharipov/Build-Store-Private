from ..models import InvoiceItem
from icecream import ic
from django.db.models import Sum

def get_reserved_quantity(product, warehouse, exclude_invoice_id=None):
    qs = InvoiceItem.objects.filter(
        product=product,
        invoice__warehouse_id=warehouse,
        invoice__is_entry=False,
        invoice__canceled_at__isnull=True
    )

    if exclude_invoice_id:
        qs = qs.exclude(invoice_id=exclude_invoice_id)

    return qs.aggregate(
        total=Sum("selected_quantity")
    )["total"] or 0