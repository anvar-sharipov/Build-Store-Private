from django.db.models import Sum
from collections import defaultdict
from ..models import InvoiceItem
from icecream import ic


def get_reserved_quantity_map(product_ids, warehouse_ids, exclude_invoice_id=None):
    

    if warehouse_ids:
        qs = InvoiceItem.objects.filter(
            product_id__in=product_ids,
            invoice__warehouse_id__in=warehouse_ids,
            invoice__is_entry=False,
            invoice__canceled_at__isnull=True,
            invoice__wozwrat_or_prihod__in=["rashod", "transfer"]
        )
    else:
        qs = InvoiceItem.objects.filter(
            product_id__in=product_ids,
            invoice__is_entry=False,
            invoice__canceled_at__isnull=True,
            invoice__wozwrat_or_prihod__in=["rashod", "transfer"]
        )

    if exclude_invoice_id:
        qs = qs.exclude(invoice_id=exclude_invoice_id)

    # ========================
    # TOTAL RESERVED
    # ========================
    totals = qs.values("product_id").annotate(
        total=Sum("selected_quantity")
    )

    reserved_map = {row["product_id"]: row["total"] for row in totals}

    # ========================
    # DETAIL INFO
    # ========================
    detail_map = defaultdict(list)

    detail_qs = qs.values(
        "product_id",
        "invoice_id",
        "selected_quantity"
    )

    for row in detail_qs:
        detail_map[row["product_id"]].append({
            "invoice_id": row["invoice_id"],
            "qty": row["selected_quantity"]
        })

    return reserved_map, detail_map


# from django.db.models import Sum
# from ..models import InvoiceItem
# from icecream import ic


# def get_reserved_quantity_map(product_ids, warehouse_ids, exclude_invoice_id=None):
    
#     if warehouse_ids:
#         qs = InvoiceItem.objects.filter(
#             product_id__in=product_ids,
#             invoice__warehouse_id__in=warehouse_ids,
#             invoice__is_entry=False,
#             invoice__canceled_at__isnull=True,
#             invoice__wozwrat_or_prihod="rashod"
            
#         )
#     else:
#         qs = InvoiceItem.objects.filter(
#             product_id__in=product_ids,
#             invoice__is_entry=False,
#             invoice__canceled_at__isnull=True,
#             invoice__wozwrat_or_prihod="rashod"
#         )
    
#     # ic(product_ids)
#     # ic(warehouse_ids)


#     if exclude_invoice_id:
#         qs = qs.exclude(invoice_id=exclude_invoice_id)
    
#     qs = qs.values("product_id", "invoice_id", "selected_quantity").annotate(
#         total=Sum("selected_quantity")
#     )
    
#     for i in qs:
#         ic(i["invoice_id"])
#         ic(i["selected_quantity"])

    

#     return {row["product_id"]: row["total"], row["invoice_id"]: row["selected_quantity"] for row in qs}