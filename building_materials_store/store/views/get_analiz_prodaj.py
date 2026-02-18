from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from ..models import Invoice, InvoiceItem, ProductUnit, Product, StockSnapshot, ProductImage, Warehouse, FreeProduct
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
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from rest_framework import status
from django.db.models.functions import Coalesce


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_analiz_prodaj(request):
    ic("analiz_prodaj")
    
    date_from = request.GET.get("dateFrom")
    date_to = request.GET.get("dateTo")
    
    warehouses = request.GET.get("warehouses", "")
    
    analyze_by = request.GET.get("analyzeBy", "revenue")
    compare_previous = request.GET.get("comparePrevious") == "true"
        
    # 📊 4 типа анализа:
    # 📦 volume → по количеству
    # 💰 revenue → по выручке
    # 🏬 stock → залежавшийся товар
    # 📉 dynamics → падение относительно прошлого периода
    
    # ic(analyze_by)
    # ic(compare_previous)
    
    


    
    

    # partner = request.GET.get("partner")
    
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
    if warehouses:
        warehouse_ids = warehouses.split(",")
        warehouse_ids = [int(id) for id in warehouse_ids]
    
    # ic(day_start)
    # ic(day_end)
    # ic(warehouse_ids)
    
    query = Invoice.objects.filter(
        entry_created_at_handle__range=(day_start, day_end),
        is_entry=True,
        wozwrat_or_prihod="rashod",
    )
    
    if warehouse_ids:
        query = query.filter(warehouse_id__in=warehouse_ids)
        
    free_product_ids = FreeProduct.objects.values_list(
        "gift_product_id",
        flat=True
    ).distinct()
    
    invoices_count = InvoiceItem.objects.filter(
        invoice__in=query
    ).exclude(
        product_id__in=free_product_ids
    ).values("invoice_id").distinct().count()
    
    
    
    total_sum = InvoiceItem.objects.filter(
        invoice__in=query,
    ).exclude(
        product_id__in=free_product_ids
    ).aggregate(
        total=Sum(F("selected_quantity") * F("selected_price"))
    )["total"] or 0
    
    
    
    total_qty = InvoiceItem.objects.filter(
        invoice__in=query,
    ).exclude(
        product_id__in=free_product_ids
    ).aggregate(
        total=Sum("selected_quantity")
    )["total"] or 0
    
    
    # Средний чек — это: Средняя сумма одной продажи (одного инвойса)
    avg_check = 0
    if invoices_count > 0:
        avg_check = (total_sum / invoices_count).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )
        
        

    products = Product.objects.filter(
        is_active=True
    ).exclude(
        id__in=free_product_ids
    )

    
    products = products.annotate(
        total_qty=Sum(
            "invoiceitem__selected_quantity",
            filter=Q(
                invoiceitem__invoice__in=query
            ) & ~Q(
                invoiceitem__product_id__in=free_product_ids
            )
        ),
        total_sum=Sum(
            ExpressionWrapper(
                F("invoiceitem__selected_quantity") *
                F("invoiceitem__selected_price"),
                output_field=DecimalField()
            ),
            filter=Q(
                invoiceitem__invoice__in=query
            ) & ~Q(
                invoiceitem__product_id__in=free_product_ids
            )
        )
    )
    
    products = products.annotate(
        total_stock=Coalesce(
            Sum(
                "warehouse_products__quantity",
                filter=Q(
                    warehouse_products__warehouse_id__in=warehouse_ids
                ) if warehouse_ids else Q()
            ),
            0,
            output_field=DecimalField()
        )
    )
    
    products_list = []

    for p in products:
        qty = p.total_qty or 0
        sum_ = p.total_sum or 0

        products_list.append({
            "product_id": p.id,
            "product_name": p.name,
            "total_qty": qty,
            "total_sum": sum_,
        })
        
    # Убираем None
    for p in products_list:
        p["total_qty"] = p["total_qty"] or 0
        p["total_sum"] = p["total_sum"] or 0
        
    if analyze_by == "volume":
        # 📦 по количеству
        products_list.sort(key=lambda x: x["total_qty"], reverse=True)

    elif analyze_by == "revenue":
        # 💰 по выручке
        products_list.sort(key=lambda x: x["total_sum"], reverse=True)

    elif analyze_by == "stock":
        filtered = []

        for p in products:
            stock_qty = p.total_stock or 0
            sold_qty = p.total_qty or 0

            if stock_qty > 0 and sold_qty == 0:
                filtered.append({
                    "product_id": p.id,
                    "product_name": p.name,
                    "stock_qty": stock_qty,
                    "total_qty": sold_qty,
                    "total_sum": p.total_sum or 0,
                })

        products_list = filtered
        products_list.sort(key=lambda x: x["stock_qty"], reverse=True)

    elif analyze_by == "dynamics":
        pass  # позже сделаем
    
    # ic(products_list)
        
    good_products = []
    bad_products = []
    no_sales_products = []

    test = 0
    for p in products_list:
        # test += 1
        # if test < 20:
        #     ic(p)
        if p["total_qty"] == 0:
            no_sales_products.append(p)
        elif p["total_qty"] >= 50:   # пример порога
            good_products.append(p)
        else:
            bad_products.append(p)
            
    # ic(len(good_products))
    # ic(len(bad_products))
    # ic(len(no_sales_products))
        
        
        
        
        
        
  
    
    # "products": products_list[:20],
    data = {
        "summary": {
            "total_sum": total_sum,
            "total_qty": total_qty,
            "avg_check": avg_check,
            "invoices_count": invoices_count,
        },
        "products": products_list,
        "total_products": len(products_list),
    }

    return Response(data)