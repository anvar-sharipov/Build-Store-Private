from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from ..models import Partner, Invoice, Transaction, Entry, Account, Warehouse, FreeItemForInvoiceItem, UnitForInvoiceItem, Product, UnitOfMeasurement, Employee, ProductUnit, ProductImage, InvoiceItem
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict
from django.db.models import Sum, F, Q
from django.http import JsonResponse
from icecream import ic
from django.db import transaction as db_transaction
import pandas as pd
from datetime import date

################################################################################################################################################################
################################################################################################################################################################
# BuhOborotTowarow (3 warianta moy, chatGpt i DeepSeek) START



# # old chat gpt uskorennyy rabochiy
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def BuhOborotTowarow(request):
#     dateFrom = request.GET.get("dateFrom")
#     dateTo = request.GET.get("dateTo")
#     warehouse = request.GET.get("warehouse")
#     withWozwrat = request.GET.get("withWozwrat") == "true"
#     categories = request.GET.get("categories")
#     products = request.GET.get("products")
#     emptyTurnovers = True if request.GET.get("emptyTurnovers") == "1" else False
    
#     ic(emptyTurnovers)
    
#     product_units = (
#         ProductUnit.objects
#         .filter(is_default_for_sale=True)
#         .select_related("unit")
#     )
    
#     unit_map = {
#         pu.product_id: pu
#         for pu in product_units
#     }
    
#     if categories:
#         category_ids = [int(c) for c in categories.split(",") if c.isdigit()]
#     else:
#         category_ids = []
        
#     if products:
#         product_ids = [int(c) for c in products.split(",") if c.isdigit()]
#     else:
#         product_ids = []
        

#     # Баланс по товарам
#     balance = {}

#     # ---------------------------------------------
#     # 1) SQL №1 — начальные остатки
#     # ---------------------------------------------
#     # start_items = InvoiceItem.objects.filter(
#     #     invoice__entry_created_at_handle__lt=dateFrom,
#     #     invoice__warehouse_id=warehouse
#     # ).select_related(
#     #     "product", "product__category", "product__base_unit", "invoice"
#     # )
    
#     start_items = InvoiceItem.objects.filter(
#     invoice__entry_created_at_handle__lt=dateFrom
#     ).filter(
#         Q(invoice__warehouse_id=warehouse) |
#         Q(invoice__warehouse2_id=warehouse)
#     ).select_related(
#         "product", "product__category", "product__base_unit", "invoice"
#     )
    
#     if category_ids:
#         start_items = start_items.filter(product__category_id__in=category_ids)
        
#     if product_ids:
#         start_items = start_items.filter(product__id__in=product_ids)

#     for item in start_items:
#         p = item.product
#         inv = item.invoice
        

#         if p.id not in balance:
#             pu = unit_map.get(p.id)
#             if pu:
#                 unit = pu.unit.name
#                 conversion_factor = pu.conversion_factor
#             else:
#                 unit = p.base_unit.name if p.base_unit else ""
#                 conversion_factor = 1
                
#             balance[p.id] = {
#                 "id": p.id,
#                 "category": p.category.name,
#                 "name": p.name,
#                 "unit": unit,
#                 "price": p.wholesale_price,
#                 "selected_quantity": 0,
#                 "income": 0,
#                 "outcome": 0,
#                 "oborot_selected_quantity_girdeji": 0,
#                 "oborot_selected_quantity_chykdajy": 0,
#                 "conversion_factor": conversion_factor,
#             }
#         cf = Decimal(balance[p.id]["conversion_factor"])
#         if inv.wozwrat_or_prihod == "prihod":
#             if inv.warehouse_id == int(warehouse):
#                 balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)

#         elif inv.wozwrat_or_prihod == "rashod":
#             if inv.warehouse_id == int(warehouse):
#                 balance[p.id]["selected_quantity"] -= (item.selected_quantity / cf)

#         elif inv.wozwrat_or_prihod == "wozwrat":
#             if inv.warehouse_id == int(warehouse):
#                 balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)
            
#         elif inv.wozwrat_or_prihod == "transfer":
#             # если со склада
#             if inv.warehouse_id == int(warehouse):
#                 balance[p.id]["selected_quantity"] -= (item.selected_quantity / cf)
#             # если на склад
#             elif inv.warehouse2_id == int(warehouse):
#                 balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)

#     # ---------------------------------------------
#     # 2) SQL №2 — обороты в периоде
#     # ---------------------------------------------
#     period_items = InvoiceItem.objects.filter(
#         invoice__entry_created_at_handle__gte=dateFrom,
#         invoice__entry_created_at_handle__lte=dateTo
#     ).filter(
#         Q(invoice__warehouse_id=warehouse) |
#         Q(invoice__warehouse2_id=warehouse)
#     ).select_related(
#         "product", "product__category", "product__base_unit", "invoice"
#     ).order_by(
#         "product__category__name", "product__name"
#     )
    
#     if category_ids:
#         period_items = period_items.filter(product__category_id__in=category_ids)
        
#     if product_ids:
#         period_items = period_items.filter(product__id__in=product_ids)

#     for item in period_items:
#         p = item.product
#         inv = item.invoice
        
        
#         if p.id not in balance:
            
#             pu = unit_map.get(p.id)
#             if pu:
#                 unit = pu.unit.name
#                 conversion_factor = pu.conversion_factor
#             else:
#                 unit = p.base_unit.name if p.base_unit else ""
#                 conversion_factor = 1

#             balance[p.id] = {
#                 "id": p.id,
#                 "category": p.category.name,
#                 "name": p.name,
#                 "unit": unit,
#                 "price": p.wholesale_price,
#                 "selected_quantity": 0,
#                 "income": 0,
#                 "outcome": 0,
#                 "oborot_selected_quantity_girdeji": 0,
#                 "oborot_selected_quantity_chykdajy": 0,
#                 "conversion_factor": conversion_factor,
#             }
#         cf = Decimal(balance[p.id]["conversion_factor"])
#         if inv.wozwrat_or_prihod == "prihod":
#             if inv.warehouse_id == int(warehouse):
#                 balance[p.id]["oborot_selected_quantity_girdeji"] += (item.selected_quantity / cf)

#         elif inv.wozwrat_or_prihod == "rashod":
#             if inv.warehouse_id == int(warehouse):
#                 balance[p.id]["oborot_selected_quantity_chykdajy"] += (item.selected_quantity / cf)

#         elif inv.wozwrat_or_prihod == "wozwrat":
#             if inv.warehouse_id == int(warehouse):
#                 if withWozwrat:
#                     balance[p.id]["oborot_selected_quantity_girdeji"] += (item.selected_quantity / cf)
#                 else:
#                     balance[p.id]["oborot_selected_quantity_chykdajy"] -= (item.selected_quantity / cf)
#         elif inv.wozwrat_or_prihod == "transfer":
#             # уход со склада
#             if inv.warehouse_id == int(warehouse):
#                 balance[p.id]["oborot_selected_quantity_chykdajy"] += (item.selected_quantity / cf)
#             # приход на склад
#             elif inv.warehouse2_id == int(warehouse):
#                 balance[p.id]["oborot_selected_quantity_girdeji"] += (item.selected_quantity / cf)

#     # ---------------------------------------------
#     # 3) Итог
#     # ---------------------------------------------
#     for p_id, d in balance.items():
#         d["end_selected_quantity"] = (
#             d["selected_quantity"]
#             + d["oborot_selected_quantity_girdeji"]
#             - d["oborot_selected_quantity_chykdajy"]
#         )
        
#     if not emptyTurnovers:
#         balance = {
#             p_id: d
#             for p_id, d in balance.items()
#             if d["oborot_selected_quantity_girdeji"] != 0
#             or d["oborot_selected_quantity_chykdajy"] != 0
#         }

#     return JsonResponse({"data": list(balance.values())})

# ispolzowanie neskolkih warehouse

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def BuhOborotTowarow(request):
    dateFrom = request.GET.get("dateFrom")
    dateTo = request.GET.get("dateTo")
    
    # Поддержка нового параметра warehouses и старого warehouse
    warehouses_param = request.GET.get("warehouses", "")
    warehouse_param = request.GET.get("warehouse", "")
    
    categories = request.GET.get("categories")
    products = request.GET.get("products")
    emptyTurnovers = True if request.GET.get("emptyTurnovers") == "1" else False
    
    # Обработка параметра складов
    warehouse_ids = []
    
    if warehouses_param:
        try:
            warehouse_ids = [int(id.strip()) for id in warehouses_param.split(",") if id.strip().isdigit()]
        except ValueError:
            return JsonResponse({"status": "error", "message": "Invalid warehouse IDs"}, status=400)
    elif warehouse_param and warehouse_param.isdigit():
        warehouse_ids = [int(warehouse_param)]
    
    if not warehouse_ids:
        return JsonResponse({"status": "error", "message": "Warehouse(s) not selected"}, status=400)
    
    # ic(warehouse_ids)
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
    # 1) SQL №1 — начальные остатки (суммируем по всем складам сразу)
    # ---------------------------------------------
    start_items = InvoiceItem.objects.filter(
        invoice__entry_created_at_handle__lt=dateFrom
    ).filter(
        Q(invoice__warehouse_id__in=warehouse_ids) |
        Q(invoice__warehouse2_id__in=warehouse_ids)
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
        if inv.canceled_at != None:
            continue
        
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
                "selected_quantity": Decimal("0"),
                "oborot_selected_quantity_girdeji": Decimal("0"),
                "oborot_selected_quantity_chykdajy": Decimal("0"),
                "oborot_selected_quantity_wozwrat": Decimal("0"),
                "conversion_factor": conversion_factor,
            }
        
        cf = Decimal(balance[p.id]["conversion_factor"])
        
        
        # Проверяем принадлежность к выбранным складам
        if inv.wozwrat_or_prihod == "prihod":
            if inv.warehouse_id in warehouse_ids:
                balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)

        elif inv.wozwrat_or_prihod == "rashod":
            if inv.warehouse_id in warehouse_ids:
                balance[p.id]["selected_quantity"] -= (item.selected_quantity / cf)

        elif inv.wozwrat_or_prihod == "wozwrat":
            if inv.warehouse_id in warehouse_ids:
                balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)
            
        elif inv.wozwrat_or_prihod == "transfer":
            # если со склада (и склад в выбранных)
            if inv.warehouse_id in warehouse_ids:
                balance[p.id]["selected_quantity"] -= (item.selected_quantity / cf)
            # если на склад (и склад в выбранных)
            elif inv.warehouse2_id in warehouse_ids:
                balance[p.id]["selected_quantity"] += (item.selected_quantity / cf)

    # ---------------------------------------------
    # 2) SQL №2 — обороты в периоде (суммируем по всем складам)
    # ---------------------------------------------
    period_items = InvoiceItem.objects.filter(
        invoice__entry_created_at_handle__gte=dateFrom,
        invoice__entry_created_at_handle__lte=dateTo
    ).filter(
        Q(invoice__warehouse_id__in=warehouse_ids) |
        Q(invoice__warehouse2_id__in=warehouse_ids)
    ).select_related(
        "product", "product__category", "product__base_unit", "invoice"
    ).order_by(
        "product__category__name", "product__name"
    )
    
    # ic(period_items)
    # ic(warehouse_ids)
    

    
    if category_ids:
        period_items = period_items.filter(product__category_id__in=category_ids)
        
    if product_ids:
        period_items = period_items.filter(product__id__in=product_ids)

    for item in period_items:
        p = item.product
        # if p.id == 606:
        #     ic(p)
        inv = item.invoice
        
        if inv.canceled_at != None:
            continue
        
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
                "selected_quantity": Decimal("0"),
                "oborot_selected_quantity_girdeji": Decimal("0"),
                "oborot_selected_quantity_chykdajy": Decimal("0"),
                "oborot_selected_quantity_wozwrat": Decimal("0"),
                "conversion_factor": conversion_factor,
            }
        
        cf = Decimal(balance[p.id]["conversion_factor"])
        
        if inv.wozwrat_or_prihod == "prihod":
            if inv.warehouse_id in warehouse_ids:
                balance[p.id]["oborot_selected_quantity_girdeji"] += (item.selected_quantity / cf)

        elif inv.wozwrat_or_prihod == "rashod":
            if inv.warehouse_id in warehouse_ids:
                balance[p.id]["oborot_selected_quantity_chykdajy"] += (item.selected_quantity / cf)

        elif inv.wozwrat_or_prihod == "wozwrat":
            if inv.warehouse_id in warehouse_ids:
                    balance[p.id]["oborot_selected_quantity_wozwrat"] += (item.selected_quantity / cf)
        elif inv.wozwrat_or_prihod == "transfer":
            # уход со склада (и склад в выбранных)
            if inv.warehouse_id in warehouse_ids:
                balance[p.id]["oborot_selected_quantity_chykdajy"] += (item.selected_quantity / cf)
            # приход на склад (и склад в выбранных)
            elif inv.warehouse2_id in warehouse_ids:
                balance[p.id]["oborot_selected_quantity_girdeji"] += (item.selected_quantity / cf)

    # ---------------------------------------------
    # 3) Итог
    # ---------------------------------------------
    for p_id, d in balance.items():
        d["end_selected_quantity"] = (
            d["selected_quantity"]
            + d["oborot_selected_quantity_girdeji"]
            - d["oborot_selected_quantity_chykdajy"]
            + d["oborot_selected_quantity_wozwrat"]
        )
        
    if not emptyTurnovers:
        balance = {
            p_id: d
            for p_id, d in balance.items()
            if d["oborot_selected_quantity_girdeji"] != Decimal("0")
            or d["oborot_selected_quantity_chykdajy"] != Decimal("0")
            or d["oborot_selected_quantity_wozwrat"] != Decimal("0")
        }

    return JsonResponse({"data": list(balance.values())})



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
    
    # Поддержка нового параметра warehouses и старого warehouseId
    warehouses_param = request.GET.get("warehouses", "")
    warehouse_id_param = request.GET.get("warehouseId", "")
    
    if warehouses_param:
        # Новый формат: несколько складов
        try:
            warehouse_ids = [int(id.strip()) for id in warehouses_param.split(",") if id.strip().isdigit()]
        except ValueError:
            return JsonResponse({"status": "error", "message": "Invalid warehouse IDs"}, status=400)
    elif warehouse_id_param and warehouse_id_param.isdigit():
        # Старый формат: один склад
        warehouse_ids = [int(warehouse_id_param)]
    else:
        return JsonResponse(
            {"status": "error", "message": "choose correct warehouse(s)"},
            status=400
        )
    
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
    
    for warehouse_id in warehouse_ids:
        try:
            warehouse_obj = Warehouse.objects.get(id=warehouse_id)
        except Warehouse.DoesNotExist:
            continue
        
        items = (
            InvoiceItem.objects
            .filter(
                product_id=product.id,
                invoice__entry_created_at_handle__lt=dateFrom
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
                invoice__entry_created_at_handle__gte=dateFrom,
                invoice__entry_created_at_handle__lte=dateTo
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
                
    
    
    
    
    
    
    