from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from ..models import Partner, Invoice, Transaction, Entry, Account, Warehouse, FreeItemForInvoiceItem, UnitForInvoiceItem, Product, UnitOfMeasurement, Employee, ProductUnit, ProductImage
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
from datetime import date

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
    emptyTurnovers = True if request.GET.get("emptyTurnovers") == "1" else False
    
    ic(emptyTurnovers)
    
    product_units = (
        ProductUnit.objects
        .filter(is_default_for_sale=True)
        .select_related("unit")
    )
    
    unit_map = {
        pu.product_id: pu
        for pu in product_units
    }
    
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
    # start_items = InvoiceItem.objects.filter(
    #     invoice__entry_created_at_handle__lt=dateFrom,
    #     invoice__warehouse_id=warehouse
    # ).select_related(
    #     "product", "product__category", "product__base_unit", "invoice"
    # )
    
    start_items = InvoiceItem.objects.filter(
    invoice__entry_created_at_handle__lt=dateFrom
    ).filter(
        Q(invoice__warehouse_id=warehouse) |
        Q(invoice__warehouse2_id=warehouse)
    ).select_related(
        "product", "product__category", "product__base_unit", "invoice"
    )
    
    if category_ids:
        start_items = start_items.filter(product__category_id__in=category_ids)
        
    if product_ids:
        start_items = start_items.filter(product__id__in=product_ids)

    for item in start_items:
        p = item.product
        inv = item.invoice
        

        if p.id not in balance:
            pu = unit_map.get(p.id)
            if pu:
                unit = pu.unit.name
                conversion_factor = pu.conversion_factor
            else:
                unit = p.base_unit.name if p.base_unit else ""
                conversion_factor = 1
                
            balance[p.id] = {
                "id": p.id,
                "category": p.category.name,
                "name": p.name,
                "unit": unit,
                "price": p.wholesale_price,
                "selected_quantity": 0,
                "income": 0,
                "outcome": 0,
                "oborot_selected_quantity_girdeji": 0,
                "oborot_selected_quantity_chykdajy": 0,
                "conversion_factor": conversion_factor,
            }
        cf = Decimal(balance[p.id]["conversion_factor"])
        if inv.wozwrat_or_prihod == "prihod":
            if inv.warehouse_id == int(warehouse):
                balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)

        elif inv.wozwrat_or_prihod == "rashod":
            if inv.warehouse_id == int(warehouse):
                balance[p.id]["selected_quantity"] -= (item.selected_quantity / cf)

        elif inv.wozwrat_or_prihod == "wozwrat":
            if inv.warehouse_id == int(warehouse):
                balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)
            
        elif inv.wozwrat_or_prihod == "transfer":
            # если со склада
            if inv.warehouse_id == int(warehouse):
                balance[p.id]["selected_quantity"] -= (item.selected_quantity / cf)
            # если на склад
            elif inv.warehouse2_id == int(warehouse):
                balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)

    # ---------------------------------------------
    # 2) SQL №2 — обороты в периоде
    # ---------------------------------------------
    period_items = InvoiceItem.objects.filter(
        invoice__entry_created_at_handle__gte=dateFrom,
        invoice__entry_created_at_handle__lte=dateTo
    ).filter(
        Q(invoice__warehouse_id=warehouse) |
        Q(invoice__warehouse2_id=warehouse)
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
            
            pu = unit_map.get(p.id)
            if pu:
                unit = pu.unit.name
                conversion_factor = pu.conversion_factor
            else:
                unit = p.base_unit.name if p.base_unit else ""
                conversion_factor = 1

            balance[p.id] = {
                "id": p.id,
                "category": p.category.name,
                "name": p.name,
                "unit": unit,
                "price": p.wholesale_price,
                "selected_quantity": 0,
                "income": 0,
                "outcome": 0,
                "oborot_selected_quantity_girdeji": 0,
                "oborot_selected_quantity_chykdajy": 0,
                "conversion_factor": conversion_factor,
            }
        cf = Decimal(balance[p.id]["conversion_factor"])
        if inv.wozwrat_or_prihod == "prihod":
            if inv.warehouse_id == int(warehouse):
                balance[p.id]["oborot_selected_quantity_girdeji"] += (item.selected_quantity / cf)

        elif inv.wozwrat_or_prihod == "rashod":
            if inv.warehouse_id == int(warehouse):
                balance[p.id]["oborot_selected_quantity_chykdajy"] += (item.selected_quantity / cf)

        elif inv.wozwrat_or_prihod == "wozwrat":
            if inv.warehouse_id == int(warehouse):
                if withWozwrat:
                    balance[p.id]["oborot_selected_quantity_girdeji"] += (item.selected_quantity / cf)
                else:
                    balance[p.id]["oborot_selected_quantity_chykdajy"] -= (item.selected_quantity / cf)
        elif inv.wozwrat_or_prihod == "transfer":
            # уход со склада
            if inv.warehouse_id == int(warehouse):
                balance[p.id]["oborot_selected_quantity_chykdajy"] += (item.selected_quantity / cf)
            # приход на склад
            elif inv.warehouse2_id == int(warehouse):
                balance[p.id]["oborot_selected_quantity_girdeji"] += (item.selected_quantity / cf)

    # ---------------------------------------------
    # 3) Итог
    # ---------------------------------------------
    for p_id, d in balance.items():
        d["end_selected_quantity"] = (
            d["selected_quantity"]
            + d["oborot_selected_quantity_girdeji"]
            - d["oborot_selected_quantity_chykdajy"]
        )
        
    if not emptyTurnovers:
        balance = {
            p_id: d
            for p_id, d in balance.items()
            if d["oborot_selected_quantity_girdeji"] != 0
            or d["oborot_selected_quantity_chykdajy"] != 0
        }

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
        
        dt = date(2025, 8, 31)

        

        count = 0
        try:
            with db_transaction.atomic():
                # Создаём системный invoice
                invoice = Invoice.objects.create(
                    wozwrat_or_prihod="prihod",
                    comment="Первоначальный приход из Excel",
                    invoice_date=dt,
                    entry_created_at=dt,
                    created_at_handle=dt,
                    updated_at_handle=dt,
                    entry_created_at_handle=dt,
                    created_by=request.user,
                    warehouse=warehouse,
                    is_entry=True,
                )
                
                
                transaction = Transaction.objects.create(
                    description="Первоначальный приход из Excel",
                    date=dt,
                    invoice=invoice,
                    created_by=request.user
                )
                
                warehouse_account = Account.objects.get(number="40.1")
                fond_account = Account.objects.get(number="80")
                 
            
                for _, row in df.iterrows():
                    name = str(row["haryt"]).strip()
                    # qty = Decimal(row["sany"])
                    # price = Decimal(row["baha"])
                    qty = Decimal(str(row["sany"]))
                    price = Decimal(str(row["baha"]))
                    unit = row["ol"]
                    unit_obj = UnitOfMeasurement.objects.get(name=unit)
                    
                    # amount = (qty * price).quantize(Decimal("0.01"))
                    amount = (qty * price).quantize(
                        Decimal("0.01"),
                        rounding=ROUND_HALF_UP
                    )       

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
                    
                    Entry.objects.create(
                        transaction=transaction,
                        account=warehouse_account,
                        product=product,
                        warehouse=warehouse,
                        debit=amount
                    )

                    Entry.objects.create(
                        transaction=transaction,
                        account=fond_account,
                        credit=amount
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
    
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_buh_oborot_detail(request, product_id):
    
    dateFrom = request.GET.get("dateFrom")
    dateTo = request.GET.get("dateTo")
    
    warehouseId_raw = request.GET.get("warehouseId")
    if not warehouseId_raw or not warehouseId_raw.isdigit():
        return JsonResponse(
            {"status": "error", "message": "choose correct warehouse"},
            status=400
        )
    warehouseId = int(warehouseId_raw)

    
    ic(dateFrom)
    ic(dateTo)
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
        
    if not warehouseId:
        return JsonResponse(
            {"status": "error", "message": "choose correct warehouse"},
            status=400
        )

    try:
        warehouse_obj = Warehouse.objects.get(id=warehouseId)
    except Warehouse.DoesNotExist:
        return JsonResponse(
            {"status": "error", "message": "warehouse not found"},
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

    data = {
        "product_id": product.id,
        "product_name": product.name,
        "product_unit": unit_name,          # ✅ строка
        "conversion_factor": conversion_factor,  # ✅ float
    }
    
    items = (
        InvoiceItem.objects
        .filter(
            product_id=product.id,
            invoice__entry_created_at_handle__lt=dateFrom
        )
        .filter(
            Q(invoice__warehouse_id=warehouseId) |
            Q(invoice__warehouse2_id=warehouseId)
        )
        .select_related("invoice")
    )
    
    start_quantity = Decimal("0")
    cf = Decimal(str(conversion_factor))
    
    for item in items:
        inv = item.invoice
        qty = Decimal(item.selected_quantity) / cf

        if inv.wozwrat_or_prihod == "prihod":
            if inv.warehouse_id == warehouseId:
                start_quantity += qty

        elif inv.wozwrat_or_prihod == "rashod":
            if inv.warehouse_id == warehouseId:
                start_quantity -= qty

        elif inv.wozwrat_or_prihod == "wozwrat":
            if inv.warehouse_id == warehouseId:
                start_quantity += qty

        elif inv.wozwrat_or_prihod == "transfer":
            if inv.warehouse_id == warehouseId:
                start_quantity -= qty
            elif inv.warehouse2_id == warehouseId:
                start_quantity += qty
                
                
    period_items = (
        InvoiceItem.objects
        .filter(
            product_id=product.id,
            invoice__entry_created_at_handle__gte=dateFrom,
            invoice__entry_created_at_handle__lte=dateTo
        )
        .filter(
            Q(invoice__warehouse_id=warehouseId) |
            Q(invoice__warehouse2_id=warehouseId)
        )
        .select_related("invoice", "invoice__partner")
        .order_by("invoice__entry_created_at_handle", "invoice_id")
    )
    
    rows = []
    balance_qty = start_quantity
    cf = Decimal(str(conversion_factor))

    for item in period_items:
        inv = item.invoice
        qty = Decimal(item.selected_quantity) / cf
        price = Decimal(item.selected_price)
        income_qty = Decimal("0")
        outcome_qty = Decimal("0")

        # ПРИХОД
        if inv.wozwrat_or_prihod == "prihod" and inv.warehouse_id == warehouseId:
            income_qty = qty
            balance_qty += qty

        # РАСХОД
        elif inv.wozwrat_or_prihod == "rashod" and inv.warehouse_id == warehouseId:
            outcome_qty = qty
            balance_qty -= qty

        # ВОЗВРАТ
        elif inv.wozwrat_or_prihod == "wozwrat" and inv.warehouse_id == warehouseId:
            income_qty = qty
            balance_qty += qty

        # ПЕРЕМЕЩЕНИЕ
        elif inv.wozwrat_or_prihod == "transfer":
            if inv.warehouse_id == warehouseId:
                outcome_qty = qty
                balance_qty -= qty
            elif inv.warehouse2_id == warehouseId:
                income_qty = qty
                balance_qty += qty
        ic("invoice_id", inv.id)
        rows.append({
            "date": inv.entry_created_at_handle,
            "invoice_id": inv.id,
            "partner": inv.partner.name if inv.partner else "",
            "text": f"{inv.get_wozwrat_or_prihod_display()} №{inv.id} ({inv.comment})",
            "price": price,
            "income_qty": income_qty,
            "income_sum": income_qty * price,
            "outcome_qty": outcome_qty,
            "outcome_sum": outcome_qty * price,
            "balance_qty": balance_qty,
            "balance_sum": balance_qty * price,
        })
        
        
    total_income_qty = Decimal("0")
    total_income_sum = Decimal("0")
    total_outcome_qty = Decimal("0")
    total_outcome_sum = Decimal("0")

    for r in rows:
        total_income_qty += r["income_qty"]
        total_income_sum += r["income_sum"]
        total_outcome_qty += r["outcome_qty"]
        total_outcome_sum += r["outcome_sum"]

    end_quantity = start_quantity + total_income_qty - total_outcome_qty
    end_sum = end_quantity * product.wholesale_price
    
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
        "warehouse_id": warehouse_obj.id,
        "warehouse_name": warehouse_obj.name,
        # "conversion_factor": float(conversion_factor),
        "start_quantity": start_quantity,
        "image": image_url,
        "turnover": {
            "income_qty": total_income_qty,
            "income_sum": total_income_sum,
            "outcome_qty": total_outcome_qty,
            "outcome_sum": total_outcome_sum,
        },

        "end": {
            "quantity": end_quantity,
            "sum": end_sum
        },
        "rows": rows,
    }
                
    
    

    return JsonResponse({"data": data})
    
    
    
    
    
    
    