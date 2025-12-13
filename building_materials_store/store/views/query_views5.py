from decimal import Decimal
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from ..models import Partner, Invoice, Transaction, Entry, Account, Warehouse, FreeItemForInvoiceItem, UnitForInvoiceItem, Product, UnitOfMeasurement
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict
from django.db.models import Sum, F, Q
from django.http import JsonResponse
from icecream import ic
from ..models import Invoice, InvoiceItem
from django.db import transaction as db_transaction
import pandas as pd


################################################################################################################################################################
################################################################################################################################################################
# BuhOborotTowarow (3 warianta moy, chatGpt i DeepSeek) START

# # DeepSeek uskorenny rabochiy
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def BuhOborotTowarow(request):
#     date_from = request.GET.get("dateFrom")
#     date_to = request.GET.get("dateTo")
#     warehouse_id = request.GET.get("warehouse")
#     with_wozwrat = request.GET.get("withWozwrat") == "true"

#     # Словарь для хранения баланса
#     balance = {}

#     # ---------------------------------------------
#     # 1) Начальные остатки (до dateFrom)
#     # ---------------------------------------------
#     start_items = InvoiceItem.objects.filter(
#         invoice__entry_created_at_handle__lt=date_from,
#         invoice__warehouse_id=warehouse_id
#     ).select_related(
#         "product__category", 
#         "product__base_unit", 
#         "invoice"
#     ).only(
#         "selected_quantity",
#         "product__id",
#         "product__name",
#         "product__category__name",
#         "product__base_unit__name",
#         "product__wholesale_price",
#         "invoice__wozwrat_or_prihod"
#     )

#     for item in start_items:
#         p = item.product
#         inv = item.invoice
        
#         if p.id not in balance:
#             balance[p.id] = {
#                 "category": p.category.name,
#                 "name": p.name,
#                 "unit": p.base_unit.name,
#                 "price": p.wholesale_price,
#                 "selected_quantity": 0,
#                 "oborot_selected_quantity_girdeji": 0,
#                 "oborot_selected_quantity_chykdajy": 0,
#                 "end_selected_quantity": 0
#             }
        
#         # Упрощенная логика для начальных остатков
#         if inv.wozwrat_or_prihod == "prihod":
#             balance[p.id]["selected_quantity"] += item.selected_quantity
#         elif inv.wozwrat_or_prihod == "rashod":
#             balance[p.id]["selected_quantity"] -= item.selected_quantity
#         elif inv.wozwrat_or_prihod == "wozwrat":
#             balance[p.id]["selected_quantity"] += item.selected_quantity

#     # ---------------------------------------------
#     # 2) Обороты за период
#     # ---------------------------------------------
#     period_items = InvoiceItem.objects.filter(
#         invoice__entry_created_at_handle__gte=date_from,
#         invoice__entry_created_at_handle__lte=date_to,
#         invoice__warehouse_id=warehouse_id
#     ).select_related(
#         "product__category",
#         "product__base_unit",
#         "invoice"
#     ).only(
#         "selected_quantity",
#         "product__id",
#         "product__name",
#         "product__category__name",
#         "product__base_unit__name",
#         "product__wholesale_price",
#         "invoice__wozwrat_or_prihod"
#     ).order_by(
#         "product__category__name", 
#         "product__name"
#     )

#     for item in period_items:
#         p = item.product
#         inv = item.invoice
        
#         # Создаем запись, если товара еще нет в балансе
#         if p.id not in balance:
#             balance[p.id] = {
#                 "category": p.category.name,
#                 "name": p.name,
#                 "unit": p.base_unit.name,
#                 "price": p.wholesale_price,
#                 "selected_quantity": 0,
#                 "oborot_selected_quantity_girdeji": 0,
#                 "oborot_selected_quantity_chykdajy": 0,
#                 "end_selected_quantity": 0
#             }
        
#         # Логика для оборотов
#         if inv.wozwrat_or_prihod == "prihod":
#             balance[p.id]["oborot_selected_quantity_girdeji"] += item.selected_quantity
        
#         elif inv.wozwrat_or_prihod == "rashod":
#             balance[p.id]["oborot_selected_quantity_chykdajy"] += item.selected_quantity
        
#         elif inv.wozwrat_or_prihod == "wozwrat":
#             if with_wozwrat:
#                 balance[p.id]["oborot_selected_quantity_girdeji"] += item.selected_quantity
#             else:
#                 # Обратите внимание: здесь -item.selected_quantity
#                 balance[p.id]["oborot_selected_quantity_chykdajy"] -= item.selected_quantity

#     # ---------------------------------------------
#     # 3) Расчет итоговых остатков
#     # ---------------------------------------------
#     result_data = []
#     for p_id, data in balance.items():
#         data["end_selected_quantity"] = (
#             data["selected_quantity"]
#             + data["oborot_selected_quantity_girdeji"]
#             - data["oborot_selected_quantity_chykdajy"]
#         )
#         result_data.append(data)

#     return JsonResponse({"data": result_data})

# chat gpt uskorennyy rabochiy
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def BuhOborotTowarow(request):
    dateFrom = request.GET.get("dateFrom")
    dateTo = request.GET.get("dateTo")
    warehouse = request.GET.get("warehouse")
    withWozwrat = request.GET.get("withWozwrat") == "true"
    categories = request.GET.get("categories")
    products = request.GET.get("products")
    
    if categories:
        category_ids = [int(c) for c in categories.split(",") if c.isdigit()]
    else:
        category_ids = []
        
    if products:
        product_ids = [int(c) for c in products.split(",") if c.isdigit()]
    else:
        product_ids = []
        

    # Баланс по товарам
    balance = {}

    # ---------------------------------------------
    # 1) SQL №1 — начальные остатки
    # ---------------------------------------------
    start_items = InvoiceItem.objects.filter(
        invoice__entry_created_at_handle__lt=dateFrom,
        invoice__warehouse_id=warehouse
    ).select_related(
        "product", "product__category", "product__base_unit", "invoice"
    )
    
    if category_ids:
        start_items = start_items.filter(product__category_id__in=category_ids)
        
    if product_ids:
        ic(product_ids)
        start_items = start_items.filter(product__id__in=product_ids)

    for item in start_items:
        p = item.product
        inv = item.invoice

        if p.id not in balance:
            balance[p.id] = {
                "category": p.category.name,
                "name": p.name,
                "unit": p.base_unit.name,
                "price": p.wholesale_price,
                "selected_quantity": 0,
                "income": 0,
                "outcome": 0,
                "oborot_selected_quantity_girdeji": 0,
                "oborot_selected_quantity_chykdajy": 0
            }

        if inv.wozwrat_or_prihod == "prihod":
            balance[p.id]["selected_quantity"] += item.selected_quantity

        elif inv.wozwrat_or_prihod == "rashod":
            balance[p.id]["selected_quantity"] -= item.selected_quantity

        elif inv.wozwrat_or_prihod == "wozwrat":
            balance[p.id]["selected_quantity"] += item.selected_quantity

    # ---------------------------------------------
    # 2) SQL №2 — обороты в периоде
    # ---------------------------------------------
    period_items = InvoiceItem.objects.filter(
        invoice__entry_created_at_handle__gte=dateFrom,
        invoice__entry_created_at_handle__lte=dateTo,
        invoice__warehouse_id=warehouse
    ).select_related(
        "product", "product__category", "product__base_unit", "invoice"
    ).order_by(
        "product__category__name", "product__name"
    )
    
    if category_ids:
        period_items = period_items.filter(product__category_id__in=category_ids)
        
    if product_ids:
        period_items = period_items.filter(product__id__in=product_ids)

    for item in period_items:
        p = item.product
        inv = item.invoice

        if p.id not in balance:
            balance[p.id] = {
                "category": p.category.name,
                "name": p.name,
                "unit": p.base_unit.name,
                "price": p.wholesale_price,
                "selected_quantity": 0,
                "income": 0,
                "outcome": 0,
                "oborot_selected_quantity_girdeji": 0,
                "oborot_selected_quantity_chykdajy": 0
            }

        if inv.wozwrat_or_prihod == "prihod":
            balance[p.id]["oborot_selected_quantity_girdeji"] += item.selected_quantity

        elif inv.wozwrat_or_prihod == "rashod":
            balance[p.id]["oborot_selected_quantity_chykdajy"] += item.selected_quantity

        elif inv.wozwrat_or_prihod == "wozwrat":
            if withWozwrat:
                balance[p.id]["oborot_selected_quantity_girdeji"] += item.selected_quantity
            else:
                balance[p.id]["oborot_selected_quantity_chykdajy"] -= item.selected_quantity

    # ---------------------------------------------
    # 3) Итог
    # ---------------------------------------------
    for p_id, d in balance.items():
        d["end_selected_quantity"] = (
            d["selected_quantity"]
            + d["oborot_selected_quantity_girdeji"]
            - d["oborot_selected_quantity_chykdajy"]
        )

    return JsonResponse({"data": list(balance.values())})



# # moy rabochiy
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def BuhOborotTowarow(request):
#     dateFrom = request.GET.get('dateFrom')
#     dateTo = request.GET.get('dateTo')
#     warehouse = request.GET.get('warehouse')
#     withWozwrat = True if request.GET.get('withWozwrat') == "true" else False
#     ic(withWozwrat, type(withWozwrat))
    
    

#     # 1. Начальный остаток
#     start_invoices = Invoice.objects.filter(
#         entry_created_at_handle__lt=dateFrom,
#         warehouse_id=warehouse
#     )
    
#     # Invoice.objects.all().delete()
#     # InvoiceItem.objects.all().delete()
#     # FreeItemForInvoiceItem.objects.all().delete()
#     # UnitForInvoiceItem.objects.all().delete()

#     initial_balance = {}

#     for invoice in start_invoices:
#         for item in invoice.items.all():
#             p = item.product
#             qty = item.selected_quantity
            

#             if p.id not in initial_balance:
#                 initial_balance[p.id] = {
#                     "category": p.category.name,
#                     "name": p.name,
#                     "unit": p.base_unit.name,
#                     "price": p.wholesale_price,
#                     "selected_quantity": 0,
#                     "income": 0,
#                     "outcome": 0,
#                     "oborot_selected_quantity_girdeji": 0,
#                     "oborot_selected_quantity_chykdajy": 0
#                 }

#             # Если invoice тип "приход"
#             if invoice.wozwrat_or_prihod == "prihod":
#                 initial_balance[p.id]["selected_quantity"] += qty
#             # Если тип расход
#             if invoice.wozwrat_or_prihod == "rashod":
#                 initial_balance[p.id]["selected_quantity"] -= qty
#             # Если invoice тип "wozwrat"
#             if invoice.wozwrat_or_prihod == "wozwrat":
#                     initial_balance[p.id]["selected_quantity"] += qty

#     # 2. Период оборота
#     period_invoices = Invoice.objects.filter(
#         entry_created_at_handle__gte=dateFrom,
#         entry_created_at_handle__lte=dateTo,
#         warehouse_id=warehouse
#     )

#     for invoice in period_invoices:
#         for item in invoice.items.all().order_by("product__category__name", "product__name"):
#             p = item.product
#             qty = item.selected_quantity

#             if p.id not in initial_balance:
#                 initial_balance[p.id] = {
#                     "category": p.category.name,
#                     "name": p.name,
#                     "unit": p.base_unit.name,
#                     "price": p.wholesale_price,
#                     "selected_quantity": 0,
#                     "income": 0,
#                     "outcome": 0,
#                     "oborot_selected_quantity_girdeji": 0,
#                     "oborot_selected_quantity_chykdajy": 0
#                 }

#             if invoice.wozwrat_or_prihod == "prihod":
#                 initial_balance[p.id]["oborot_selected_quantity_girdeji"] += qty
#             if invoice.wozwrat_or_prihod == "rashod":
#                 initial_balance[p.id]["oborot_selected_quantity_chykdajy"] += qty
#             if invoice.wozwrat_or_prihod == "wozwrat":
#                 if withWozwrat:
#                     initial_balance[p.id]["oborot_selected_quantity_girdeji"] += qty
#                 else:
#                     initial_balance[p.id]["oborot_selected_quantity_chykdajy"] += -qty
                    

#     # 3. Итоговые остатки
#     for p_id, data in initial_balance.items():
#         data["end_selected_quantity"] = data["selected_quantity"] + data["oborot_selected_quantity_girdeji"] - data["oborot_selected_quantity_chykdajy"]
        
    
#     data = list(initial_balance.values())
#     new_data = []
#     for d in data:
#         if d["name"] == "AB-3, AKRENK 3KG POL (4)":
#             ic(d)
#     # return JsonResponse({"data": initial_balance})
#     return JsonResponse({
#         "data": data
#     })


# BuhOborotTowarow (3 warianta moy, chatGpt i DeepSeek) END
################################################################################################################################################################
################################################################################################################################################################



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_warehouses(request):
    ic("get_active_warehouses")
    warehouses = Warehouse.objects.all()
    data = []
    if warehouses:
        for w in warehouses:
            d = {
                "id": w.id,
                "name": w.name,
                "is_active": w.is_active,
                "location": w.location,
                "currency_name": w.currency.name if w.currency else "",
                "currency_code": w.currency.code if w.currency else "",
            }
            data.append(d)
    # ic(data)
    return JsonResponse({
        "data": data,
    })
    
    
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_initial_stock(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=400)

    if "file" not in request.FILES:
        return JsonResponse({"error": "No file provided"}, status=400)

    excel_file = request.FILES["file"]
    
    warehouse = Warehouse.objects.get(name="Sklad 1 USD")
    ic(warehouse)

    try:
        # Читаем Excel
        df = pd.read_excel(excel_file)
        # for _, row in df.iterrows():
        #     # ic(row)
        #     name = str(row["haryt"]).strip()
        #     qty = Decimal(row["sany"])
        #     price = Decimal(row["baha"])
        #     unit = row["ol"]
        #     unit_obj = UnitOfMeasurement.objects.get(name=unit)
            
        #     p = Product.objects.get(name=name)
        #     ic(name, qty, price, unit, unit_obj.name)

        # Ожидаемые колонки:
        # # name, quantity, price (или любые твои)
        # required_columns = ["name", "quantity"]
        # for col in required_columns:
        #     if col not in df.columns:
        #         return JsonResponse({"error": f"Column '{col}' not found in Excel"}, status=400)

        

        count = 0
        try:
            with db_transaction.atomic():
                # Создаём системный invoice
                invoice = Invoice.objects.create(
                    wozwrat_or_prihod="prihod",
                    comment="Первоначальный приход из Excel",
                    invoice_date="2025-08-31",
                    entry_created_at="2025-08-31",
                    created_at_handle="2025-08-31",
                    updated_at_handle="2025-08-31",
                    entry_created_at_handle="2025-08-31",
                    created_by=request.user,
                    warehouse=warehouse,
                )
            
                for _, row in df.iterrows():
                    name = str(row["haryt"]).strip()
                    qty = Decimal(row["sany"])
                    price = Decimal(row["baha"])
                    unit = row["ol"]
                    unit_obj = UnitOfMeasurement.objects.get(name=unit)
                    

                    product = Product.objects.get(name=name)

                    # Создаём InvoiceItem
                    InvoiceItem.objects.create(
                        invoice=invoice,
                        product=product,
                        selected_quantity=qty,
                        selected_price=price,
                        unit_name_on_selected_warehouses=unit,
                        base_unit_obj=unit_obj,
                    )

                    count += 1
        except Exception as e:
            ic(e)
            # create error
            return JsonResponse({"status": "error", "message": "transactionChange", "reason_for_the_error": str(e)}, status=400)

        return JsonResponse({
            "status": "success",
            "imported_rows": count,
            # "invoice_id": invoice.id
            "invoice_id": None
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)    
    
    





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_products_id_and_name(request):
    warehouse_id = request.GET.get("warehouseId")
    data = []
    if warehouse_id:
        products = Product.objects.filter(
            warehouse_products__warehouse_id=warehouse_id,
        )
        if products:
            for p in products:
                d = {
                    "id": p.id,
                    "name": p.name
                }
                data.append(d)
        
    return JsonResponse({
        "data": data,
    })