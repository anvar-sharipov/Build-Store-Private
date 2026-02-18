from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from ..models import Invoice, InvoiceItem, ProductUnit, Product, StockSnapshot, ProductImage, Warehouse
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
from rest_framework import status



@api_view(['GET'])
def get_product_turnover_history(request):
    product_id = request.GET.get("product_id")
    date_from = request.GET.get("dateFrom")
    date_to = request.GET.get("dateTo")
    warheousesId = request.GET.get("warheousesId")
    
    # ic(product_id, date_from, date_to, warheousesId)
    
    if not date_from or not date_to:
        return Response(
            {"error": "choose diapazon date"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    try:
        day_start = datetime.strptime(date_from, "%Y-%m-%d").date()
        day_end = datetime.strptime(date_to, "%Y-%m-%d").date()
    except ValueError:
        return Response(
            {"error": "invalid diapazon date format"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    if day_start > day_end:
        return Response(
            {"error": "date start must be <= date end"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    day_start_str = day_start.strftime("%d.%m.%Y")
    day_end_str = day_end.strftime("%d.%m.%Y")
    warehouse_ids = []
    if warheousesId:
        warehouse_ids = warheousesId.split(",")
        warehouse_ids = [int(id) for id in warehouse_ids]
        
    if warehouse_ids:
        pass
    #     # Новый формат: несколько складов
    #     try:
    #         warehouse_ids = [int(id.strip()) for id in warheousesId.split(",") if id.strip().isdigit()]
    #     except ValueError:
    #         return JsonResponse({"status": "error", "message": "Invalid warehouse IDs"}, status=400)
    # elif warheousesId and warheousesId.isdigit():
    #     # Старый формат: один склад
    #     warehouse_ids = [int(warehouse_id_param)]
    else:
        pass
        # return JsonResponse(
        #     {"status": "error", "message": "choose correct warehouse(s)"},
        #     status=400
        # )
    
    if not product_id:
        return JsonResponse(
            {"status": "error", "message": "choose correct product"},
            status=400
        )

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse(
            {"status": "error", "message": "product not found"},
            status=404
        )

    # базовая единица по умолчанию
    unit_name = product.base_unit.name
    conversion_factor = 1

    default_unit = ProductUnit.objects.filter(
        product=product,
        is_default_for_sale=True
    ).select_related('unit').first()

    if default_unit:
        unit_name = default_unit.unit.name
        conversion_factor = float(default_unit.conversion_factor)

    # Данные для каждого склада
    warehouses_data = {}
    all_rows = []
    
    if not warehouse_ids:
        warehouse_ids = list(Warehouse.objects.values_list("id", flat=True))
    
    if warehouse_ids:
        for warehouse_id in warehouse_ids:
            try:
                warehouse_obj = Warehouse.objects.get(id=warehouse_id)
            except Warehouse.DoesNotExist:
                continue
            
            items = (
                InvoiceItem.objects
                .filter(
                    product_id=product.id,
                    invoice__entry_created_at_handle__lt=day_start
                )
                .filter(
                    Q(invoice__warehouse_id=warehouse_id) |
                    Q(invoice__warehouse2_id=warehouse_id)
                )
                .select_related("invoice")
            )
            
            start_quantity = Decimal("0")
            cf = Decimal(str(conversion_factor))
            
            for item in items:
                inv = item.invoice
                if inv.canceled_at != None:
                    continue
                qty = Decimal(item.selected_quantity) / cf

                if inv.wozwrat_or_prihod == "prihod":
                    if inv.warehouse_id == warehouse_id:
                        start_quantity += qty

                elif inv.wozwrat_or_prihod == "rashod":
                    if inv.warehouse_id == warehouse_id:
                        start_quantity -= qty

                elif inv.wozwrat_or_prihod == "wozwrat":
                    if inv.warehouse_id == warehouse_id:
                        start_quantity += qty

                elif inv.wozwrat_or_prihod == "transfer":
                    if inv.warehouse_id == warehouse_id:
                        start_quantity -= qty
                    elif inv.warehouse2_id == warehouse_id:
                        start_quantity += qty
            
            period_items = (
                InvoiceItem.objects
                .filter(
                    product_id=product.id,
                    invoice__entry_created_at_handle__gte=day_start,
                    invoice__entry_created_at_handle__lte=day_end
                )
                .filter(
                    Q(invoice__warehouse_id=warehouse_id) |
                    Q(invoice__warehouse2_id=warehouse_id)
                )
                .select_related("invoice", "invoice__partner")
                .order_by("invoice__entry_created_at_handle", "invoice_id")
            )
            
            rows = []
            balance_qty = start_quantity
            cf = Decimal(str(conversion_factor))

            for item in period_items:
                inv = item.invoice
                if inv.canceled_at != None:
                    continue
                qty = Decimal(item.selected_quantity) / cf
                price = Decimal(item.selected_price)
                income_qty = Decimal("0")
                outcome_qty = Decimal("0")
                return_qty = Decimal("0")

                # ПРИХОД
                if inv.wozwrat_or_prihod == "prihod" and inv.warehouse_id == warehouse_id:
                    income_qty = qty
                    balance_qty += qty

                # РАСХОД
                elif inv.wozwrat_or_prihod == "rashod" and inv.warehouse_id == warehouse_id:
                    outcome_qty = qty
                    balance_qty -= qty

                # ВОЗВРАТ
                elif inv.wozwrat_or_prihod == "wozwrat" and inv.warehouse_id == warehouse_id:
                    return_qty = qty
                    balance_qty += qty

                # ПЕРЕМЕЩЕНИЕ
                elif inv.wozwrat_or_prihod == "transfer":
                    if inv.warehouse_id == warehouse_id:
                        outcome_qty = qty
                        balance_qty -= qty
                    elif inv.warehouse2_id == warehouse_id:
                        income_qty = qty
                        balance_qty += qty
                
                row_data = {
                    "date": inv.entry_created_at_handle,
                    "invoice_id": inv.id,
                    "partner": inv.partner.name if inv.partner else "",
                    "operation": inv.wozwrat_or_prihod,
                    "text": f"{inv.get_wozwrat_or_prihod_display()} №{inv.id} ({inv.comment})",

                    "price": price,

                    "income_qty": income_qty,
                    "income_sum": income_qty * price,

                    "outcome_qty": outcome_qty,
                    "outcome_sum": outcome_qty * price,

                    "return_qty": return_qty,
                    "return_sum": return_qty * price,

                    "balance_qty": balance_qty,
                    "balance_sum": balance_qty * price,

                    "warehouse_id": warehouse_id,
                }
                rows.append(row_data)
                all_rows.append(row_data)
            
            total_income_qty = Decimal("0")
            total_income_sum = Decimal("0")
            total_outcome_qty = Decimal("0")
            total_outcome_sum = Decimal("0")
            total_return_qty = Decimal("0")
            total_return_sum = Decimal("0")

            for r in rows:
                total_income_qty += r["income_qty"]
                total_income_sum += r["income_sum"]

                total_outcome_qty += r["outcome_qty"]
                total_outcome_sum += r["outcome_sum"]

                total_return_qty += r["return_qty"]
                total_return_sum += r["return_sum"]

            end_quantity = (
                start_quantity
                + total_income_qty
                + total_return_qty
                - total_outcome_qty
            )
            end_sum = end_quantity * product.wholesale_price
            
            warehouses_data[str(warehouse_id)] = {
                "id": warehouse_id,
                "name": warehouse_obj.name,
                "start_quantity": start_quantity,
                "income_qty": total_income_qty,
                "income_sum": total_income_sum,
                "outcome_qty": total_outcome_qty,
                "outcome_sum": total_outcome_sum,
                "return_qty": total_return_qty,
                "return_sum": total_return_sum,
                "end_quantity": end_quantity,
                "end_sum": end_sum,
            }
        
    # Сортируем общие строки по дате
    all_rows.sort(key=lambda x: x["date"])
    
    # Агрегируем общие данные
    total_start_quantity = sum(wh["start_quantity"] for wh in warehouses_data.values())
    total_income_qty = sum(wh["income_qty"] for wh in warehouses_data.values())
    total_income_sum = sum(wh["income_sum"] for wh in warehouses_data.values())
    total_outcome_qty = sum(wh["outcome_qty"] for wh in warehouses_data.values())
    total_outcome_sum = sum(wh["outcome_sum"] for wh in warehouses_data.values())
    total_return_qty = sum(wh.get("return_qty", 0) for wh in warehouses_data.values())
    total_return_sum = sum(wh.get("return_sum", 0) for wh in warehouses_data.values())
    total_end_quantity = sum(wh["end_quantity"] for wh in warehouses_data.values())
    total_end_sum = total_end_quantity * product.wholesale_price
    
    product_image = (
        ProductImage.objects
        .filter(product=product)
        .only("image")
        .first()
    )

    image_url = product_image.image.url if product_image else None
                    
    data = {
        "product_id": product.id,
        "product_name": product.name,
        "product_unit": unit_name,
        "product_wholesale_price": product.wholesale_price,
        "product_retail_price": product.retail_price,
        "warehouses": warehouses_data,
        "start_quantity": total_start_quantity,
        "image": image_url,
        "turnover": {
            "income_qty": total_income_qty,
            "income_sum": total_income_sum,
            "outcome_qty": total_outcome_qty,
            "outcome_sum": total_outcome_sum,
            "return_qty": total_return_qty,
            "return_sum": total_return_sum,
        },
        "end": {
            "quantity": total_end_quantity,
            "sum": total_end_sum
        },
        "rows": all_rows,
    }
    
    return JsonResponse({"data": data})
    
