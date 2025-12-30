from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from ..models import Invoice, InvoiceItem, ProductUnit, Product
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict
from django.db.models import Sum, F, Q, Case, When, Value, IntegerField
from django.http import JsonResponse
from icecream import ic
from django.db import transaction as db_transaction
import pandas as pd
from datetime import date
from django.shortcuts import get_object_or_404
import time
from django.db.models import Sum, F




# medlenno
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def product_cards(request):
#     warehouse_id = int(request.GET.get("warehouse_id"))
#     date_from = datetime.strptime(request.GET.get("date_from"), "%Y-%m-%d")
#     date_to = datetime.strptime(request.GET.get("date_to"), "%Y-%m-%d")

#     results = []

#     products = Product.objects.all()

#     for product in products:

#         # ---------- ЕДИНИЦА ИЗМЕРЕНИЯ ----------
#         unit_obj = ProductUnit.objects.filter(
#             product=product, is_default_for_sale=True
#         ).first()
#         unit = unit_obj.unit.name if unit_obj else product.base_unit.name

#         # ---------- НАЧАЛЬНЫЙ ОСТАТОК ----------
#         start_items = InvoiceItem.objects.filter(
#             product=product,
#             invoice__entry_created_at_handle__lt=date_from
#         ).filter(
#             Q(invoice__warehouse_id=warehouse_id) |
#             Q(invoice__warehouse2_id=warehouse_id)
#         )

#         start_qty = Decimal("0")

#         for item in start_items:
#             if item.invoice.wozwrat_or_prihod == "prihod":
#                 start_qty += item.selected_quantity
#             elif item.invoice.wozwrat_or_prihod == "rashod":
#                 start_qty -= item.selected_quantity
#             elif item.invoice.wozwrat_or_prihod == "transfer":
#                 if item.invoice.warehouse_id == warehouse_id:
#                     start_qty -= item.selected_quantity
#                 elif item.invoice.warehouse2_id == warehouse_id:
#                     start_qty += item.selected_quantity

#         # ---------- ДВИЖЕНИЯ ЗА ПЕРИОД ----------
#         period_items = InvoiceItem.objects.filter(
#             product=product,
#             invoice__entry_created_at_handle__range=(date_from, date_to)
#         )

#         prihod_items = period_items.filter(
#             Q(invoice__wozwrat_or_prihod="prihod") |
#             Q(invoice__wozwrat_or_prihod="transfer", invoice__warehouse2_id=warehouse_id)
#         )

#         rashod_items = period_items.filter(
#             Q(invoice__wozwrat_or_prihod="rashod") |
#             Q(invoice__wozwrat_or_prihod="transfer", invoice__warehouse_id=warehouse_id)
#         )

#         operations = []
#         prihod_qty = Decimal("0")
#         rashod_qty = Decimal("0")

#         for item in prihod_items:
#             qty = item.selected_quantity
#             prihod_qty += qty
#             operations.append({
#                 "date": item.invoice.entry_created_at_handle,
#                 "invoice_id": item.invoice.id,
#                 "partner": item.invoice.partner.name if item.invoice.partner else None,
#                 "comment": item.invoice.comment,
#                 "type": "prihod",
#                 "qty": qty,
#                 "price": item.selected_price,
#                 "sum": qty * (item.selected_price or 0),
#             })

#         for item in rashod_items:
#             qty = item.selected_quantity
#             rashod_qty += qty
#             operations.append({
#                 "date": item.invoice.entry_created_at_handle,
#                 "invoice_id": item.invoice.id,
#                 "partner": item.invoice.partner.name if item.invoice.partner else None,
#                 "comment": item.invoice.comment,
#                 "type": "rashod",
#                 "qty": qty,
#                 "price": item.selected_price,
#                 "sum": qty * (item.selected_price or 0),
#             })
            
#         # ❗ ВАЖНО: если нет движения — пропускаем товар
#         if prihod_qty == 0 and rashod_qty == 0:
#             continue

#         end_qty = start_qty + prihod_qty - rashod_qty

#         results.append({
#             "product_id": product.id,
#             "product_name": product.name,
#             "unit": unit,
#             "start_qty": start_qty,
#             "prihod": prihod_qty,
#             "rashod": rashod_qty,
#             "end_qty": end_qty,
#             "operations": sorted(operations, key=lambda x: x["date"])
#         })
        
#     ic(results)
        

#     return Response({
#         "date_from": date_from,
#         "date_to": date_to,
#         "warehouse_id": warehouse_id,
#         "products": results
#     })


# bystro
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def product_cards(request):
    warehouse_id = int(request.GET.get("warehouse_id"))
    date_from = datetime.strptime(request.GET.get("date_from"), "%Y-%m-%d")
    # date_to = datetime.strptime(request.GET.get("date_to"), "%Y-%m-%d")
    # date_to лучше включать полностью (до конца дня) Иначе записи за этот день после 00:00 могут не попасть.
    date_to = datetime.strptime(request.GET.get("date_to"), "%Y-%m-%d") + timedelta(days=1)
    field = request.GET.get("field")
    order = request.GET.get("order")
    partner = request.GET.get("partner")
    
    query = request.GET.get("query")
    agent = request.GET.get("agent")

    

    # 1️⃣ Загружаем все товары + единицы
    # products = (
    #     Product.objects
    #     .select_related("base_unit")
    #     .prefetch_related("units")
    # ).order_by("name")
    products = (
        Product.objects
        .select_related("base_unit")
        .prefetch_related("units")
        .order_by("name")
    )
    
    if query:
        products = products.filter(name__icontains=query)
        


    # 2️⃣ Загружаем ВСЕ движения одним запросом
    items = (
        InvoiceItem.objects
        .select_related("invoice", "invoice__partner")
        .filter(invoice__entry_created_at_handle__lte=date_to)
    )
    
    if partner:
        items = items.filter(invoice__partner_id=int(partner))
        
    if agent:
        items = items.filter(invoice__partner__agent_id=int(agent))

    results = []

    for product in products:
        # единица измерения
        unit_obj = next(
            (u for u in product.units.all() if u.is_default_for_sale),
            None
        )
        unit = unit_obj.unit.name if unit_obj else product.base_unit.name

        # все движения по товару
        product_items = [i for i in items if i.product_id == product.id]

        start_qty = Decimal("0")
        prihod_qty = Decimal("0")
        rashod_qty = Decimal("0")
        wozwrat_qty = Decimal("0")
        operations = []

        for item in product_items:
            inv = item.invoice
            qty = item.selected_quantity

            # ---------- НАЧАЛЬНЫЙ ОСТАТОК ----------
            if inv.entry_created_at_handle < date_from:
                if inv.wozwrat_or_prihod == "prihod":
                    start_qty += qty
                elif inv.wozwrat_or_prihod == "rashod":
                    start_qty -= qty
                elif inv.wozwrat_or_prihod == "transfer":
                    if inv.warehouse_id == warehouse_id:
                        start_qty -= qty
                    elif inv.warehouse2_id == warehouse_id:
                        start_qty += qty
                continue

            # ---------- ДВИЖЕНИЕ ----------
            if not (date_from <= inv.entry_created_at_handle <= date_to):
                continue

            if inv.wozwrat_or_prihod == "prihod":
                prihod_qty += qty
                typ = "prihod"

            elif inv.wozwrat_or_prihod == "rashod":
                rashod_qty += qty
                typ = "rashod"

            elif inv.wozwrat_or_prihod == "wozwrat":
                wozwrat_qty += qty
                typ = "wozwrat"

            elif inv.wozwrat_or_prihod == "transfer":
                if inv.warehouse_id == warehouse_id:
                    rashod_qty += qty
                    typ = "rashod"
                elif inv.warehouse2_id == warehouse_id:
                    prihod_qty += qty
                    typ = "prihod"
            else:
                continue

            operations.append({
                "date": inv.entry_created_at_handle,
                "invoice_id": inv.id,
                "partner": inv.partner.name if inv.partner else None,
                "comment": inv.comment,
                "type": typ,
                "qty": qty,
                "price": item.selected_price,
                "sum": qty * (item.selected_price or 0),
            })

        # ❗ пропускаем если нет движения
        if prihod_qty == 0 and rashod_qty == 0 and wozwrat_qty == 0:
            continue

        results.append({
            "product_id": product.id,
            "product_name": product.name,
            "retail_price": product.retail_price,
            "unit": unit,
            "start_qty": start_qty,
            "prihod": prihod_qty,
            "rashod": rashod_qty,
            "wozwrat": wozwrat_qty,
            "end_qty": start_qty + prihod_qty - rashod_qty + wozwrat_qty,
            "operations": sorted(operations, key=lambda x: x["date"]),
        })
        
        # сортировка по приходу / расходу / возврату
        if field in ["prihod", "rashod", "wozwrat"]:
            reverse = order == "desc"
            results = sorted(
                results,
                key=lambda x: x.get(field, 0),
                reverse=reverse
            )


    return Response({
        "warehouse_id": warehouse_id,
        "date_from": date_from,
        "date_to": date_to,
        "products": results,
    })
