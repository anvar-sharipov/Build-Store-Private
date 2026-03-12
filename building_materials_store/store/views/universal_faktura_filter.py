from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from ..models import Invoice, InvoiceItem, ProductUnit, Product, StockSnapshot, ProductImage, Warehouse
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict
from django.db.models import Sum, F, Q, Case, When, Value, IntegerField, ExpressionWrapper, DecimalField
from django.http import JsonResponse
from icecream import ic
from django.db import transaction as db_transaction
import pandas as pd
from datetime import date
from django.shortcuts import get_object_or_404
import time
from django.db.models import Sum, F
from rest_framework import status
from django.http import JsonResponse, HttpResponse





from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side
from openpyxl.styles import numbers
from openpyxl.styles import PatternFill
from openpyxl.worksheet.page import PageMargins



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def universal_faktura_filter(request):
    
    dateFrom = request.GET.get("dateFrom")
    dateTo = request.GET.get("dateTo")
    
    consolidated = request.GET.get("consolidated")

    if consolidated is not None:
        consolidated = consolidated.lower() == "true"
    else:
        consolidated = False
    
    # faktura_types = request.GET.getlist("fakturaTypes")
    # faktura_types = request.GET.getlist("fakturaTypes[]")
    # warehouse_ids = request.GET.getlist("warehouseIds[]")
    faktura_types = (
        request.GET.getlist("fakturaTypes")
        or request.GET.getlist("fakturaTypes[]")
    )

    warehouse_ids = (
        request.GET.getlist("warehouseIds")
        or request.GET.getlist("warehouseIds[]")
    )
    
    warehouse2_ids = (
        request.GET.getlist("warehouse2Ids")
        or request.GET.getlist("warehouse2Ids[]")
    )
    
    partner_ids = (
        request.GET.getlist("partnerIds")
        or request.GET.getlist("partnerIds[]")
    )
    
    product_ids = (
        request.GET.getlist("productIds")
        or request.GET.getlist("productIds[]")
    )
    
    date_from = datetime.fromisoformat(dateFrom)
    date_to = datetime.fromisoformat(dateTo)
    
    data = []
    table_type = ""
    grand_total = {
        "qty": Decimal("0"),
        "summ": Decimal("0"),
        "profit": Decimal("0"),
        "difference": Decimal("0"),
        "weight": Decimal("0"),
    }
    
    if not partner_ids and product_ids:
        if len(faktura_types) == 1 and 'transfer' in faktura_types:

            grand_total = {
                "qty": Decimal("0"),
                "weight": Decimal("0"),
            }

            product = Product.objects.get(id=product_ids[0])
            weight_per_unit = Decimal(product.weight or 0)

            if consolidated:

                table_type = "only_product_transfer_consolidated"

                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        product_id__in=product_ids,
                        invoice__wozwrat_or_prihod="transfer",
                    )
                    .values(
                        "invoice__warehouse__name",
                        "invoice__warehouse2__name",
                    )
                    .annotate(
                        total_qty=Sum("selected_quantity")
                    )
                    .order_by("invoice__warehouse__name")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                if warehouse2_ids:
                    items = items.filter(invoice__warehouse2_id__in=warehouse2_ids)

                for index, row in enumerate(items, start=1):

                    qty = row["total_qty"] or Decimal("0")
                    total_weight = qty * weight_per_unit

                    grand_total["qty"] += qty
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "from_warehouse": row["invoice__warehouse__name"],
                        "to_warehouse": row["invoice__warehouse2__name"],
                        "selected_quantity": qty,
                        "kg": total_weight,
                    })

            else:

                table_type = "only_product_transfer"

                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        product_id__in=product_ids,
                        invoice__wozwrat_or_prihod="transfer",
                    )
                    .order_by("invoice__entry_created_at_handle")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                if warehouse2_ids:
                    items = items.filter(invoice__warehouse2_id__in=warehouse2_ids)

                for index, item in enumerate(items, start=1):

                    qty = item.selected_quantity or Decimal("0")
                    total_weight = qty * weight_per_unit

                    grand_total["qty"] += qty
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "from_warehouse": item.invoice.warehouse.name,
                        "to_warehouse": item.invoice.warehouse2.name,
                        "selected_quantity": qty,
                        "kg": total_weight,
                    })

            return Response({
                "table_type": table_type,
                "data": data,
                "grand_total": grand_total,
            })
        
        if len(product_ids) != 1:
            return Response({"message": "Only one product allowed in this report mode"}, status=400)
        if len(faktura_types) == 1 and 'rashod' in faktura_types:
            if consolidated:
                table_type = "only_product_consolidated"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }
                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        product_id__in=product_ids,
                        invoice__wozwrat_or_prihod__in=faktura_types,
                    )
                    .values(
                        "invoice__partner__id",
                        "invoice__partner__name",
                    )
                    .annotate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                        total_profit=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("purchase_price")),
                            output_field=DecimalField()
                        ),
                        total_difference=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("wholesale_price")),
                            output_field=DecimalField()
                        ),
                    )
                    .order_by("invoice__partner__name")
                )
                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)
                
                product = Product.objects.get(id=product_ids[0])
                weight_per_unit = Decimal(product.weight or 0)
                
                
                # usrednennaya sena
                for index, row in enumerate(items, start=1):
                    total_qty = row["total_qty"] or Decimal("0")
                    total_sum = row["total_sum"] or Decimal("0")

                    avg_price = (
                        total_sum / total_qty
                        if total_qty != 0
                        else Decimal("0")
                    )

                    total_weight = total_qty * weight_per_unit

                    grand_total["qty"] += total_qty
                    grand_total["summ"] += total_sum
                    # grand_total["profit"] += row["total_profit"]
                    # grand_total["difference"] += row["total_difference"]
                    
                    total_profit = row["total_profit"] or Decimal("0")
                    total_difference = row["total_difference"] or Decimal("0")

                    grand_total["profit"] += total_profit
                    grand_total["difference"] += total_difference

                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "partner": row["invoice__partner__name"],
                        "price": avg_price,  # ← вот это главное
                        "selected_quantity": total_qty,
                        "sale_sum": total_sum,
                        # "profit": row["total_profit"],
                        # "difference": row["total_difference"],
                        "profit": total_profit,
                        "difference": total_difference,
                        "kg": total_weight,
                    })
                
            else:
                table_type = "only_product"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }
                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "invoice__partner", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        product_id__in=product_ids,
                        invoice__wozwrat_or_prihod__in=faktura_types,  # если нужны только продажи
                    )
                    .order_by("invoice__entry_created_at_handle")
                )
                
                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)
                
                
                for index, item in enumerate(items, start=1):
                    
                    product = item.product
                    # ic(product.name)
                    # ic(item.purchase_price)
                    selected_quantity = item.selected_quantity or Decimal("0")
                    selected_price = item.selected_price or Decimal("0")
                    sale_sum = selected_quantity * selected_price
                    purchase_sum = selected_quantity * (item.purchase_price or Decimal("0"))
                    profit = sale_sum - purchase_sum
                    difference = sale_sum - selected_quantity * (item.wholesale_price or Decimal("0"))
                    weight = Decimal(product.weight) if product.weight not in [None, ""] else Decimal("0")
                    total_weight = selected_quantity * weight
                    
                    grand_total["qty"] += selected_quantity
                    grand_total["summ"] += sale_sum
                    grand_total["profit"] += profit
                    grand_total["difference"] += difference
                    grand_total["weight"] += total_weight
                    
                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "partner": item.invoice.partner.name if item.invoice.partner else "",
                        "product": item.product.name,
                        "price": sale_sum / selected_quantity,
                        "selected_quantity": selected_quantity,
                        "sale_sum": sale_sum,
                        "profit": profit,
                        "difference": difference,
                        "kg": total_weight,
                    })
                
        if len(faktura_types) == 1 and 'prihod' in faktura_types:
            if consolidated:
                table_type = "only_product_prihod_consolidated"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "weight": Decimal("0"),
                }
                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        product_id__in=product_ids,
                        invoice__wozwrat_or_prihod__in=faktura_types,
                    )
                    .values(
                        "invoice__partner__id",
                        "invoice__partner__name",
                    )
                    .annotate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                    )
                    .order_by("invoice__partner__name")
                )
                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)
                    
                product = Product.objects.get(id=product_ids[0])
                weight_per_unit = Decimal(product.weight or 0)
                
                # usrednennaya sena
                for index, row in enumerate(items, start=1):
                    total_qty = row["total_qty"] or Decimal("0")
                    total_sum = row["total_sum"] or Decimal("0")
                    
                    avg_price = (
                        total_sum / total_qty
                        if total_qty != 0
                        else Decimal("0")
                    )


                    total_weight = total_qty * weight_per_unit

                    grand_total["qty"] += total_qty
                    grand_total["summ"] += total_sum
                    grand_total["weight"] += total_weight


                    data.append({
                        "index": index,
                        "partner": row["invoice__partner__name"],
                        "price": avg_price,
                        "selected_quantity": total_qty,
                        "sale_sum": total_sum,
                        "kg": total_weight,
                    })
                    
            else:
                table_type = "only_product_prihod"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "weight": Decimal("0"),
                }
                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "invoice__partner", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        product_id__in=product_ids,
                        invoice__wozwrat_or_prihod__in=faktura_types,
                    )
                    .order_by("invoice__entry_created_at_handle")
                )
                
                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)
                
                
                for index, item in enumerate(items, start=1):
                    
                    product = item.product
                    # ic(product.name)
                    # ic(item.purchase_price)
                    selected_quantity = item.selected_quantity or Decimal("0")
                    selected_price = item.selected_price or Decimal("0")
                    sale_sum = selected_quantity * selected_price
                    weight = Decimal(product.weight) if product.weight not in [None, ""] else Decimal("0")
                    total_weight = selected_quantity * weight
                    
                    grand_total["qty"] += selected_quantity
                    grand_total["summ"] += sale_sum
                    grand_total["weight"] += total_weight
                    
                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "partner": item.invoice.partner.name if item.invoice.partner else "",
                        "product": item.product.name,
                        "price": sale_sum / selected_quantity,
                        "selected_quantity": selected_quantity,
                        "sale_sum": sale_sum,
                        "kg": total_weight,
                    })
                
        if len(faktura_types) == 1 and 'wozwrat' in faktura_types:
            if consolidated:
                table_type = "only_product_wozwrat_consolidated"

                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        product_id__in=product_ids,
                        invoice__wozwrat_or_prihod__in=faktura_types,
                    )
                    .values(
                        "invoice__partner__id",
                        "invoice__partner__name",
                    )
                    .annotate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                        total_profit=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("purchase_price")),
                            output_field=DecimalField()
                        ),
                        total_difference=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("wholesale_price")),
                            output_field=DecimalField()
                        ),
                    )
                    .order_by("invoice__partner__name")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                product = Product.objects.get(id=product_ids[0])
                weight_per_unit = Decimal(product.weight or 0)

                for index, row in enumerate(items, start=1):

                    # делаем возврат отрицательным
                    total_qty = -(row["total_qty"] or Decimal("0"))
                    total_sum = -(row["total_sum"] or Decimal("0"))
                    total_profit = -(row["total_profit"] or Decimal("0"))
                    total_difference = -(row["total_difference"] or Decimal("0"))

                    avg_price = (
                        abs(total_sum) / abs(total_qty)
                        if total_qty != 0
                        else Decimal("0")
                    )

                    total_weight = total_qty * weight_per_unit

                    grand_total["qty"] += total_qty
                    grand_total["summ"] += total_sum
                    grand_total["profit"] += total_profit
                    grand_total["difference"] += total_difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "partner": row["invoice__partner__name"],
                        "price": avg_price,
                        "selected_quantity": total_qty,
                        "sale_sum": total_sum,
                        "profit": total_profit,
                        "difference": total_difference,
                        "kg": total_weight,
                    })
            else:
                table_type = "only_product_wozwrat"

                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "invoice__partner", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        product_id__in=product_ids,
                        invoice__wozwrat_or_prihod__in=faktura_types,
                    )
                    .order_by("invoice__entry_created_at_handle")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, item in enumerate(items, start=1):

                    product = item.product

                    original_qty = item.selected_quantity or Decimal("0")
                    price = item.selected_price or Decimal("0")

                    # ВАЖНО — возврат = отрицательное движение
                    qty = -original_qty

                    sale_sum = qty * price
                    purchase_sum = qty * (item.purchase_price or Decimal("0"))
                    profit = sale_sum - purchase_sum
                    difference = sale_sum - qty * (item.wholesale_price or Decimal("0"))

                    weight = Decimal(product.weight or 0)
                    total_weight = qty * weight

                    grand_total["qty"] += qty
                    grand_total["summ"] += sale_sum
                    grand_total["profit"] += profit
                    grand_total["difference"] += difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "partner": item.invoice.partner.name if item.invoice.partner else "",
                        "product": product.name,
                        "price": price,
                        "selected_quantity": qty,
                        "sale_sum": sale_sum,
                        "profit": profit,
                        "difference": difference,
                        "kg": total_weight,
                    })
               
    if partner_ids and not product_ids:
        if len(partner_ids) != 1:
            return Response({"message": "Only one partner allowed in this report mode"}, status=400)
        
        if len(faktura_types) == 1 and 'rashod' in faktura_types:
            if consolidated:
                table_type = "only_partner_consolidated"

                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id__in=partner_ids,
                        invoice__wozwrat_or_prihod='rashod',
                    )
                    .values(
                        "product__id",
                        "product__name",
                        "product__weight",
                    )
                    .annotate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                        total_profit=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("purchase_price")),
                            output_field=DecimalField()
                        ),
                        total_difference=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("wholesale_price")),
                            output_field=DecimalField()
                        ),
                    )
                    .order_by("product__name")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, row in enumerate(items, start=1):

                    total_qty = row["total_qty"] or Decimal("0")
                    total_sum = row["total_sum"] or Decimal("0")
                    total_profit = row["total_profit"] or Decimal("0")
                    total_difference = row["total_difference"] or Decimal("0")

                    weight_per_unit = Decimal(row["product__weight"] or 0)
                    total_weight = total_qty * weight_per_unit

                    avg_price = (
                        total_sum / total_qty
                        if total_qty != 0
                        else Decimal("0")
                    )

                    grand_total["qty"] += total_qty
                    grand_total["summ"] += total_sum
                    grand_total["profit"] += total_profit
                    grand_total["difference"] += total_difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "product": row["product__name"],
                        "price": avg_price,
                        "selected_quantity": total_qty,
                        "sale_sum": total_sum,
                        "profit": total_profit,
                        "difference": total_difference,
                        "kg": total_weight,
                    })
            else:
                table_type = "only_partner"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "invoice__partner", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id__in=partner_ids,
                        invoice__wozwrat_or_prihod='rashod',
                    )
                    .order_by("invoice__entry_created_at_handle")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, item in enumerate(items, start=1):

                    product = item.product

                    qty = item.selected_quantity or Decimal("0")
                    price = item.selected_price or Decimal("0")

                    sale_sum = qty * price
                    purchase_sum = qty * (item.purchase_price or Decimal("0"))

                    profit = sale_sum - purchase_sum
                    difference = sale_sum - qty * (item.wholesale_price or Decimal("0"))

                    weight = Decimal(product.weight or 0)
                    total_weight = qty * weight

                    grand_total["qty"] += qty
                    grand_total["summ"] += sale_sum
                    grand_total["profit"] += profit
                    grand_total["difference"] += difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        # "partner": item.invoice.partner.name if item.invoice.partner else "",
                        "product": product.name,
                        "price": price,
                        "selected_quantity": qty,
                        "sale_sum": sale_sum,
                        "profit": profit,
                        "difference": difference,
                        "kg": total_weight,
                    })

        if len(faktura_types) == 1 and 'prihod' in faktura_types:
            if consolidated:
                table_type = "only_partner_prihod_consolidated"

                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id__in=partner_ids,
                        invoice__wozwrat_or_prihod='prihod',
                    )
                    .values(
                        "product__id",
                        "product__name",
                        "product__weight",
                    )
                    .annotate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                    )
                    .order_by("product__name")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, row in enumerate(items, start=1):

                    total_qty = row["total_qty"] or Decimal("0")
                    total_sum = row["total_sum"] or Decimal("0")

                    weight_per_unit = Decimal(row["product__weight"] or 0)
                    total_weight = total_qty * weight_per_unit

                    avg_price = (
                        total_sum / total_qty
                        if total_qty != 0
                        else Decimal("0")
                    )

                    grand_total["qty"] += total_qty
                    grand_total["summ"] += total_sum
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "product": row["product__name"],
                        "price": avg_price,
                        "selected_quantity": total_qty,
                        "sale_sum": total_sum,
                        "profit": Decimal("0"),
                        "difference": Decimal("0"),
                        "kg": total_weight,
                    })
          
            else:
                table_type = "only_partner_prihod"

                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id__in=partner_ids,
                        invoice__wozwrat_or_prihod='prihod',
                    )
                    .order_by("invoice__entry_created_at_handle")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, item in enumerate(items, start=1):

                    product = item.product

                    qty = item.selected_quantity or Decimal("0")
                    price = item.selected_price or Decimal("0")

                    total_sum = qty * price

                    weight = Decimal(product.weight or 0)
                    total_weight = qty * weight

                    grand_total["qty"] += qty
                    grand_total["summ"] += total_sum
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "product": product.name,
                        "price": price,
                        "selected_quantity": qty,
                        "sale_sum": total_sum,
                        "profit": Decimal("0"),
                        "difference": Decimal("0"),
                        "kg": total_weight,
                    })
        
        if len(faktura_types) == 1 and 'wozwrat' in faktura_types:
            if consolidated:
                table_type = "only_partner_wozwrat_consolidated"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id__in=partner_ids,
                        invoice__wozwrat_or_prihod='wozwrat',
                    )
                    .values(
                        "product__id",
                        "product__name",
                        "product__weight",
                    )
                    .annotate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                        total_profit=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("purchase_price")),
                            output_field=DecimalField()
                        ),
                        total_difference=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("wholesale_price")),
                            output_field=DecimalField()
                        ),
                    )
                    .order_by("product__name")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, row in enumerate(items, start=1):

                    # 🔴 делаем отрицательным
                    total_qty = -(row["total_qty"] or Decimal("0"))
                    total_sum = -(row["total_sum"] or Decimal("0"))
                    total_profit = -(row["total_profit"] or Decimal("0"))
                    total_difference = -(row["total_difference"] or Decimal("0"))

                    weight_per_unit = Decimal(row["product__weight"] or 0)
                    total_weight = total_qty * weight_per_unit

                    avg_price = (
                        abs(total_sum) / abs(total_qty)
                        if total_qty != 0
                        else Decimal("0")
                    )

                    grand_total["qty"] += total_qty
                    grand_total["summ"] += total_sum
                    grand_total["profit"] += total_profit
                    grand_total["difference"] += total_difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "product": row["product__name"],
                        "price": avg_price,
                        "selected_quantity": total_qty,
                        "sale_sum": total_sum,
                        "profit": total_profit,
                        "difference": total_difference,
                        "kg": total_weight,
                    })
            else:
                table_type = "only_partner_wozwrat"

                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id__in=partner_ids,
                        invoice__wozwrat_or_prihod='wozwrat',
                    )
                    .order_by("invoice__entry_created_at_handle")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, item in enumerate(items, start=1):

                    product = item.product

                    original_qty = item.selected_quantity or Decimal("0")
                    price = item.selected_price or Decimal("0")

                    # 🔴 возврат = отрицательное движение
                    qty = -original_qty

                    sale_sum = qty * price
                    purchase_sum = qty * (item.purchase_price or Decimal("0"))
                    profit = sale_sum - purchase_sum
                    difference = sale_sum - qty * (item.wholesale_price or Decimal("0"))

                    weight = Decimal(product.weight or 0)
                    total_weight = qty * weight

                    grand_total["qty"] += qty
                    grand_total["summ"] += sale_sum
                    grand_total["profit"] += profit
                    grand_total["difference"] += difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "product": product.name,
                        "price": price,
                        "selected_quantity": qty,
                        "sale_sum": sale_sum,
                        "profit": profit,
                        "difference": difference,
                        "kg": total_weight,
                    })
                    
    if partner_ids and product_ids:
        if len(partner_ids) != 1:
            return Response({"message": "Only one partner allowed in this report mode"}, status=400)
        
        if len(product_ids) != 1:
            return Response({"message": "Only one product allowed in this report mode"}, status=400)
        
        if len(faktura_types) == 1 and 'rashod' in faktura_types:
            if consolidated:
                table_type = "and_partner_and_product_rashod_consolidated"

                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id=partner_ids[0],
                        product_id=product_ids[0],
                        invoice__wozwrat_or_prihod='rashod',
                    )
                    .aggregate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                        total_profit=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("purchase_price")),
                            output_field=DecimalField()
                        ),
                        total_difference=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("wholesale_price")),
                            output_field=DecimalField()
                        ),
                    )
                )

                total_qty = items["total_qty"] or Decimal("0")
                total_sum = items["total_sum"] or Decimal("0")
                total_profit = items["total_profit"] or Decimal("0")
                total_difference = items["total_difference"] or Decimal("0")

                product = Product.objects.get(id=product_ids[0])
                weight_per_unit = Decimal(product.weight or 0)
                total_weight = total_qty * weight_per_unit

                avg_price = total_sum / total_qty if total_qty != 0 else Decimal("0")

                grand_total["qty"] = total_qty
                grand_total["summ"] = total_sum
                grand_total["profit"] = total_profit
                grand_total["difference"] = total_difference
                grand_total["weight"] = total_weight

                data.append({
                    "price": avg_price,
                    "selected_quantity": total_qty,
                    "sale_sum": total_sum,
                    "profit": total_profit,
                    "difference": total_difference,
                    "kg": total_weight,
                })
            else:
                table_type = "and_partner_and_product_rashod"

                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id=partner_ids[0],
                        product_id=product_ids[0],
                        invoice__wozwrat_or_prihod='rashod',
                    )
                    .order_by("invoice__entry_created_at_handle")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, item in enumerate(items, start=1):

                    qty = item.selected_quantity or Decimal("0")
                    price = item.selected_price or Decimal("0")

                    sale_sum = qty * price
                    purchase_sum = qty * (item.purchase_price or Decimal("0"))
                    profit = sale_sum - purchase_sum
                    difference = sale_sum - qty * (item.wholesale_price or Decimal("0"))

                    weight_per_unit = Decimal(item.product.weight or 0)
                    total_weight = qty * weight_per_unit

                    grand_total["qty"] += qty
                    grand_total["summ"] += sale_sum
                    grand_total["profit"] += profit
                    grand_total["difference"] += difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "price": price,
                        "selected_quantity": qty,
                        "sale_sum": sale_sum,
                        "profit": profit,
                        "difference": difference,
                        "kg": total_weight,
                    })
         
        if len(faktura_types) == 1 and 'prihod' in faktura_types:
            if consolidated:
                table_type = "and_partner_and_product_prihod_consolidated"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id=partner_ids[0],
                        product_id=product_ids[0],
                        invoice__wozwrat_or_prihod='prihod',
                    )
                    .aggregate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                    )
                )

                total_qty = items["total_qty"] or Decimal("0")
                total_sum = items["total_sum"] or Decimal("0")

                product = Product.objects.get(id=product_ids[0])
                weight_per_unit = Decimal(product.weight or 0)
                total_weight = total_qty * weight_per_unit

                avg_price = total_sum / total_qty if total_qty != 0 else Decimal("0")

                grand_total["qty"] = total_qty
                grand_total["summ"] = total_sum
                grand_total["weight"] = total_weight

                data.append({
                    "price": avg_price,
                    "selected_quantity": total_qty,
                    "sale_sum": total_sum,
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "kg": total_weight,
                })
            else:
                table_type = "and_partner_and_product_prihod"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id=partner_ids[0],
                        product_id=product_ids[0],
                        invoice__wozwrat_or_prihod='prihod',
                    )
                    .order_by("invoice__entry_created_at_handle")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, item in enumerate(items, start=1):

                    qty = item.selected_quantity or Decimal("0")
                    price = item.selected_price or Decimal("0")

                    total_sum = qty * price

                    weight_per_unit = Decimal(item.product.weight or 0)
                    total_weight = qty * weight_per_unit

                    grand_total["qty"] += qty
                    grand_total["summ"] += total_sum
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "price": price,
                        "selected_quantity": qty,
                        "sale_sum": total_sum,
                        "profit": Decimal("0"),
                        "difference": Decimal("0"),
                        "kg": total_weight,
                    })
        
        if len(faktura_types) == 1 and 'wozwrat' in faktura_types:
            if consolidated:
                table_type = "and_partner_and_product_wozwrat_consolidated"
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id=partner_ids[0],
                        product_id=product_ids[0],
                        invoice__wozwrat_or_prihod='wozwrat',
                    )
                    .aggregate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                        total_profit=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("purchase_price")),
                            output_field=DecimalField()
                        ),
                        total_difference=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("wholesale_price")),
                            output_field=DecimalField()
                        ),
                    )
                )

                # 🔴 делаем отрицательным
                total_qty = -(items["total_qty"] or Decimal("0"))
                total_sum = -(items["total_sum"] or Decimal("0"))
                total_profit = -(items["total_profit"] or Decimal("0"))
                total_difference = -(items["total_difference"] or Decimal("0"))

                product = Product.objects.get(id=product_ids[0])
                weight_per_unit = Decimal(product.weight or 0)
                total_weight = total_qty * weight_per_unit

                avg_price = (
                    abs(total_sum) / abs(total_qty)
                    if total_qty != 0
                    else Decimal("0")
                )

                grand_total["qty"] = total_qty
                grand_total["summ"] = total_sum
                grand_total["profit"] = total_profit
                grand_total["difference"] = total_difference
                grand_total["weight"] = total_weight

                data.append({
                    "price": avg_price,
                    "selected_quantity": total_qty,
                    "sale_sum": total_sum,
                    "profit": total_profit,
                    "difference": total_difference,
                    "kg": total_weight,
                })
            else:
                table_type = "and_partner_and_product_wozwrat"   
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                }

                items = (
                    InvoiceItem.objects
                    .select_related("invoice", "product")
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__partner_id=partner_ids[0],
                        product_id=product_ids[0],
                        invoice__wozwrat_or_prihod='wozwrat',
                    )
                    .order_by("invoice__entry_created_at_handle")
                )

                if warehouse_ids:
                    items = items.filter(invoice__warehouse_id__in=warehouse_ids)

                for index, item in enumerate(items, start=1):

                    original_qty = item.selected_quantity or Decimal("0")
                    price = item.selected_price or Decimal("0")

                    # 🔴 отрицательное движение
                    qty = -original_qty

                    sale_sum = qty * price
                    purchase_sum = qty * (item.purchase_price or Decimal("0"))
                    profit = sale_sum - purchase_sum
                    difference = sale_sum - qty * (item.wholesale_price or Decimal("0"))

                    weight_per_unit = Decimal(item.product.weight or 0)
                    total_weight = qty * weight_per_unit

                    grand_total["qty"] += qty
                    grand_total["summ"] += sale_sum
                    grand_total["profit"] += profit
                    grand_total["difference"] += difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "price": price,
                        "selected_quantity": qty,
                        "sale_sum": sale_sum,
                        "profit": profit,
                        "difference": difference,
                        "kg": total_weight,
                    }) 
          
    if not partner_ids and not product_ids:
        if len(faktura_types) == 1:
            
            invoice_type = faktura_types[0]
            
            if invoice_type != "transfer":
            
                grand_total = {
                    "qty": Decimal("0"),
                    "summ": Decimal("0"),
                    "profit": Decimal("0"),
                    "difference": Decimal("0"),
                    "weight": Decimal("0"),
                    "invoice_type": invoice_type,
                }

                base_queryset = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__wozwrat_or_prihod=invoice_type,
                    )
                )

                if warehouse_ids:
                    base_queryset = base_queryset.filter(
                        invoice__warehouse_id__in=warehouse_ids
                    )
        
                
                if consolidated:
                    table_type = f"not_partner_and_not_product_consolidated"
                    items = (
                        base_queryset
                        .values(
                            "product__id",
                            "product__name",
                            "product__weight",
                        )
                        .annotate(
                            total_qty=Sum("selected_quantity"),
                            total_sum=Sum(
                                F("selected_quantity") * F("selected_price"),
                                output_field=DecimalField()
                            ),
                            total_profit=Sum(
                                F("selected_quantity") *
                                (F("selected_price") - F("purchase_price")),
                                output_field=DecimalField()
                            ),
                            total_difference=Sum(
                                F("selected_quantity") *
                                (F("selected_price") - F("wholesale_price")),
                                output_field=DecimalField()
                            ),
                        )
                        .order_by("product__name")
                    )

                    for index, row in enumerate(items, start=1):

                        qty = row["total_qty"] or Decimal("0")
                        summ = row["total_sum"] or Decimal("0")
                        profit = row["total_profit"] or Decimal("0")
                        difference = row["total_difference"] or Decimal("0")

                        weight_per_unit = Decimal(row["product__weight"] or 0)
                        total_weight = qty * weight_per_unit

                        # 🔴 если возврат — делаем отрицательным
                        if invoice_type == "wozwrat":
                            qty = -qty
                            summ = -summ
                            profit = -profit
                            difference = -difference
                            total_weight = -total_weight

                        avg_price = summ / qty if qty != 0 else Decimal("0")

                        grand_total["qty"] += qty
                        grand_total["summ"] += summ
                        grand_total["profit"] += profit
                        grand_total["difference"] += difference
                        grand_total["weight"] += total_weight

                        data.append({
                            "index": index,
                            "product": row["product__name"],
                            "price": avg_price,
                            "selected_quantity": qty,
                            "sale_sum": summ,
                            "profit": profit,
                            "difference": difference,
                            "kg": total_weight,
                        })
            
                else:
                    table_type = f"not_partner_and_not_product"
                    items = (
                        base_queryset
                        .select_related("invoice", "product", "invoice__partner")
                        .order_by("invoice__entry_created_at_handle")
                    )

                    for index, item in enumerate(items, start=1):

                        qty = item.selected_quantity or Decimal("0")
                        price = item.selected_price or Decimal("0")

                        sale_sum = qty * price
                        purchase_sum = qty * (item.purchase_price or Decimal("0"))
                        profit = sale_sum - purchase_sum
                        difference = sale_sum - qty * (item.wholesale_price or Decimal("0"))

                        weight_per_unit = Decimal(item.product.weight or 0)
                        total_weight = qty * weight_per_unit

                        if invoice_type == "wozwrat":
                            qty = -qty
                            sale_sum = -sale_sum
                            profit = -profit
                            difference = -difference
                            total_weight = -total_weight

                        grand_total["qty"] += qty
                        grand_total["summ"] += sale_sum
                        grand_total["profit"] += profit
                        grand_total["difference"] += difference
                        grand_total["weight"] += total_weight

                        data.append({
                            "index": index,
                            "date": item.invoice.entry_created_at_handle,
                            "invoice_id": item.invoice.id,
                            "partner": item.invoice.partner.name if item.invoice.partner else "",
                            "product": item.product.name,
                            "price": price,
                            "selected_quantity": qty,
                            "sale_sum": sale_sum,
                            "profit": profit,
                            "difference": difference,
                            "kg": total_weight,
                        })
        
            if invoice_type == "transfer" and warehouse_ids and warehouse2_ids:

                if len(warehouse_ids) > 1:
                    return Response({"message": "Only one from warehouse allowed in this report mode"}, status=400)

                if len(warehouse2_ids) > 1:
                    return Response({"message": "Only one to warehouse allowed in this report mode"}, status=400)

                if warehouse_ids[0] == warehouse2_ids[0]:
                    return Response({"message": "warehouses cannot be the same"}, status=400)

                from_warehouse_id = warehouse_ids[0]
                to_warehouse_id = warehouse2_ids[0]

                base_queryset = (
                    InvoiceItem.objects
                    .filter(
                        invoice__entry_created_at_handle__range=(date_from, date_to),
                        invoice__canceled_at__isnull=True,
                        invoice__wozwrat_or_prihod="transfer",
                        invoice__warehouse_id=from_warehouse_id,
                        invoice__warehouse2_id=to_warehouse_id,
                    )
                )

                grand_total = {
                    "qty": Decimal("0"),
                    "weight": Decimal("0"),
                }

                data = []   # 🔥 обязательно очистить
                # ic("fdfddf")

                if consolidated:
                    table_type = "transfer_consolidated"

                    items = (
                        base_queryset
                        .values(
                            "product__id",
                            "product__name",
                            "product__weight",
                        )
                        .annotate(
                            total_qty=Sum("selected_quantity"),
                        )
                        .order_by("product__name")
                    )

                    for index, row in enumerate(items, start=1):

                        qty = row["total_qty"] or Decimal("0")
                        weight_per_unit = Decimal(row["product__weight"] or 0)
                        total_weight = qty * weight_per_unit

                        grand_total["qty"] += qty
                        grand_total["weight"] += total_weight
                        

                        data.append({
                            "index": index,
                            "product": row["product__name"],
                            "selected_quantity": qty,
                            "kg": total_weight,
                        })

                else:
                    table_type = "transfer_detailed"

                    items = (
                        base_queryset
                        .select_related("invoice", "product")
                        .order_by("invoice__entry_created_at_handle")
                    )

                    for index, item in enumerate(items, start=1):

                        qty = item.selected_quantity or Decimal("0")
                        weight_per_unit = Decimal(item.product.weight or 0)
                        total_weight = qty * weight_per_unit

                        grand_total["qty"] += qty
                        grand_total["weight"] += total_weight

                        data.append({
                            "index": index,
                            "date": item.invoice.entry_created_at_handle,
                            "invoice_id": item.invoice.id,
                            "from_warehouse": item.invoice.warehouse.name,
                            "to_warehouse": item.invoice.warehouse2.name,
                            "product": item.product.name,
                            "selected_quantity": qty,
                            "kg": total_weight,
                        })

                # 🔥 ВОТ ЭТО ГЛАВНОЕ
                return Response({
                    "table_type": table_type,
                    "data": data,
                    "grand_total": grand_total,
                })
        
        if len(faktura_types) > 1:
            
            
            grand_total = {
                "qty": Decimal("0"),
                "summ": Decimal("0"),
                "profit": Decimal("0"),
                "difference": Decimal("0"),
                "weight": Decimal("0"),
            }

            base_queryset = (
                InvoiceItem.objects
                .filter(
                    invoice__entry_created_at_handle__range=(date_from, date_to),
                    invoice__canceled_at__isnull=True,
                    invoice__wozwrat_or_prihod__in=faktura_types,
                )
            )

            if warehouse_ids:
                base_queryset = base_queryset.filter(
                    invoice__warehouse_id__in=warehouse_ids
                )
        
            
            if consolidated:
                table_type = "not_partner_and_not_product_multi_type_consolidated"

                items = (
                    base_queryset
                    .values(
                        "product__id",
                        "product__name",
                        "product__weight",
                        "invoice__wozwrat_or_prihod",
                    )
                    .annotate(
                        total_qty=Sum("selected_quantity"),
                        total_sum=Sum(
                            F("selected_quantity") * F("selected_price"),
                            output_field=DecimalField()
                        ),
                        total_profit=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("purchase_price")),
                            output_field=DecimalField()
                        ),
                        total_difference=Sum(
                            F("selected_quantity") *
                            (F("selected_price") - F("wholesale_price")),
                            output_field=DecimalField()
                        ),
                    )
                )

                for index, row in enumerate(items, start=1):

                    qty = row["total_qty"] or Decimal("0")
                    summ = row["total_sum"] or Decimal("0")
                    profit = row["total_profit"] or Decimal("0")
                    difference = row["total_difference"] or Decimal("0")

                    weight_per_unit = Decimal(row["product__weight"] or 0)
                    total_weight = qty * weight_per_unit

                    # 🔴 если возврат — делаем отрицательным
                    if row["invoice__wozwrat_or_prihod"] == "wozwrat":
                        qty = -qty
                        summ = -summ
                        profit = -profit
                        difference = -difference
                        total_weight = -total_weight

                    grand_total["qty"] += qty
                    grand_total["summ"] += summ
                    grand_total["profit"] += profit
                    grand_total["difference"] += difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "product": row["product__name"],
                        "invoice_type": row["invoice__wozwrat_or_prihod"],
                        "selected_quantity": qty,
                        "sale_sum": summ,
                        "profit": profit,
                        "difference": difference,
                        "kg": total_weight,
                    })
                    
            else:
                table_type = "not_partner_and_not_product_multi_type"

                items = (
                    base_queryset
                    .select_related("invoice", "product", "invoice__partner")
                    .order_by("invoice__entry_created_at_handle")
                )

                for index, item in enumerate(items, start=1):

                    qty = item.selected_quantity or Decimal("0")
                    price = item.selected_price or Decimal("0")

                    sale_sum = qty * price
                    purchase_sum = qty * (item.purchase_price or Decimal("0"))
                    profit = sale_sum - purchase_sum
                    difference = sale_sum - qty * (item.wholesale_price or Decimal("0"))

                    weight_per_unit = Decimal(item.product.weight or 0)
                    total_weight = qty * weight_per_unit

                    if item.invoice.wozwrat_or_prihod == "wozwrat":
                        qty = -qty
                        sale_sum = -sale_sum
                        profit = -profit
                        difference = -difference
                        total_weight = -total_weight

                    grand_total["qty"] += qty
                    grand_total["summ"] += sale_sum
                    grand_total["profit"] += profit
                    grand_total["difference"] += difference
                    grand_total["weight"] += total_weight

                    data.append({
                        "index": index,
                        "invoice_type": item.invoice.wozwrat_or_prihod,
                        "date": item.invoice.entry_created_at_handle,
                        "invoice_id": item.invoice.id,
                        "partner": item.invoice.partner.name if item.invoice.partner else "",
                        "product": item.product.name,
                        "selected_quantity": qty,
                        "sale_sum": sale_sum,
                        "profit": profit,
                        "difference": difference,
                        "kg": total_weight,
                    })

    return Response({"data": data, "table_type": table_type, "grand_total": grand_total})
    
