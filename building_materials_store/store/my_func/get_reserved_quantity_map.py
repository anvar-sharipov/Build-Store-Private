from django.db.models import Sum
from ..models import InvoiceItem
from icecream import ic


def get_reserved_quantity_map(product_ids, warehouse_ids, exclude_invoice_id=None):
    
    if warehouse_ids:
        qs = InvoiceItem.objects.filter(
            product_id__in=product_ids,
            invoice__warehouse_id__in=warehouse_ids,
            invoice__is_entry=False,
            invoice__canceled_at__isnull=True
        )
    else:
        qs = InvoiceItem.objects.filter(
            product_id__in=product_ids,
            invoice__is_entry=False,
            invoice__canceled_at__isnull=True
        )
    
    # ic(product_ids)
    # ic(warehouse_ids)


    if exclude_invoice_id:
        qs = qs.exclude(invoice_id=exclude_invoice_id)

    qs = qs.values("product_id").annotate(
        total=Sum("selected_quantity")
    )

    return {row["product_id"]: row["total"] for row in qs}