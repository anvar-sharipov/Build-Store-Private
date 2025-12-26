from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from ..models import Product, Zakaz, ZakazItem, Warehouse, Partner
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




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_product_for_zakaz_input_search(request):
    q = request.GET.get("q", "").strip()  # получаем поисковый запрос
    w = request.GET.get("w", "").strip()  # получаем поисковый запрос
    data = []

    if q and w:
        # Фильтруем продукты по имени, игнорируя регистр
        products = (
            Product.objects
            .filter(name__icontains=q, warehouse_products__warehouse_id=w)
            .annotate(
                exact_match=Case(
                    When(name__iexact=q, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                ),
                warehouse_quantity=Sum(
                    "warehouse_products__quantity",
                    filter=Q(warehouse_products__warehouse_id=w),
                ),
            )
            .select_related("base_unit")                     # FK
            .prefetch_related(
                "images",
                "units__unit",                               # ProductUnit → Unit
            )
            .order_by("exact_match", "name").distinct()[:20]
        )

        
        for p in products:
            image_obj = p.images.first()

            conversion_factor = 1
            unit_name = p.base_unit.name if p.base_unit else None

            default_unit = p.units.filter(is_default_for_sale=True).first()

            if default_unit:
                
                conversion_factor = int(default_unit.conversion_factor)
                unit_name = default_unit.unit.name
            if p.warehouse_quantity != 0:
                quantity = p.warehouse_quantity / conversion_factor 
            else:
                quantity = 0
            data.append({
                "id": p.id,
                "name": p.name,
                "image": image_obj.image.url if image_obj else None,
                "unit": unit_name,
                "conversion_factor": conversion_factor,
                "quantity_in_warehouse": quantity,
                "purchase_price": p.purchase_price,
                "selected_price": p.purchase_price,
                "weight": p.weight,
                "volume": p.volume
            })
            

    return JsonResponse(data, safe=False)



# @csrf_exempt
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def save_zakaz(request):
#     data = request.data
    
#     buyer_id = data.get("buyer")
#     partner_id = data.get("partner")
#     warehouse_id = data.get("warehouse")
#     products = data.get("products", [])
#     date_str = data.get("date")
#     unit = data.get("unit")
    
#     isEdit = data.get("isEdit")
#     id = data.get("id")

#     if date_str:
#         try:
#             # ожидаем формат YYYY-MM-DD
#             date_obj = datetime.strptime(date_str, "%Y-%m-%d")
#         except ValueError:
#             return JsonResponse(
#                 {"status": "error", "message": "invalid date format, use YYYY-MM-DD"},
#                 status=400
#             )
#     else:
#         date_obj = None
    
#     # --- warehouse ---
#     try:
#         warehouse = Warehouse.objects.get(id=warehouse_id)
#     except Warehouse.DoesNotExist:
#         return JsonResponse({"status": "error", "message": "warehouse not found"}, status=404)
    
#     # --- partner ---
#     partner = None
#     if partner_id:
#         try:
#             partner = Partner.objects.get(id=partner_id)
#         except Partner.DoesNotExist:
#             return JsonResponse({"status": "error", "message": "Partner not found"}, status=404)
    
#     # --- buyer ---
#     buyer = None
#     if buyer_id:
#         try:
#             buyer = Partner.objects.get(id=buyer_id)
#         except Partner.DoesNotExist:
#             return JsonResponse({"status": "error", "message": "buyer not found"}, status=404)

#     # --- validation products ---
#     if products and not isinstance(products, list):
#         return JsonResponse({"status": "error", "message": "products must be a list"}, status=400)

#     try:
#         with db_transaction.atomic():
#             zakaz = Zakaz.objects.create(
#                 warehouse=warehouse,
#                 partner=partner,
#                 buyer=buyer,
#                 created_by=request.user,
#                 updated_by=request.user,
#                 created_at_handle=date_obj,
#                 updated_at_handle=date_obj
#             )

#             # если товары есть — сохраняем
#             for item in products:
#                 product_id = item.get("product")
#                 qty = Decimal(item.get("selected_quantity")) if item.get("selected_quantity") not in ["", None] else Decimal(0)
#                 price = Decimal(item.get("selected_price")) if item.get("selected_price") not in ["", None] else Decimal(0)

#                 if not product_id:
#                     return JsonResponse({"status": "error", "message": "product not found"}, status=404)

#                 product = get_object_or_404(Product, id=product_id)

#                 if qty < Decimal(0):
#                     return JsonResponse({"status": "error", "message": "quantity cant be less than zero"}, status=400)
                
#                 if price < Decimal(0):
#                     return JsonResponse({"status": "error", "message": "price cant be less than zero"}, status=400)

#                 ZakazItem.objects.create(
#                     zakaz=zakaz,
#                     product=product,
#                     selected_quantity=qty,
#                     selected_price=price,
#                     unit=unit
#                 )

#     except Exception as e:
#         return JsonResponse({"status": "error", "message": "transactionChange", "reason_for_the_error": str(e)}, status=400)

#     return JsonResponse({"message": "zakaz saved", "zakaz_id": zakaz.id})
    
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_zakaz(request):
    data = request.data
    
    buyer_id = data.get("buyer")
    partner_id = data.get("partner")
    warehouse_id = data.get("warehouse")
    products = data.get("products", [])
    date_str = data.get("date")
    unit = data.get("unit")
    
    isEdit = data.get("isEdit", False)
    zakaz_id = data.get("id")

    # --- проверка даты ---
    if date_str:
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return JsonResponse(
                {"status": "error", "message": "invalid date format, use YYYY-MM-DD"},
                status=400
            )
    else:
        date_obj = None

    # --- warehouse ---
    try:
        warehouse = Warehouse.objects.get(id=warehouse_id)
    except Warehouse.DoesNotExist:
        return JsonResponse({"status": "error", "message": "warehouse not found"}, status=404)
    
    # --- partner ---
    partner = None
    if partner_id:
        try:
            partner = Partner.objects.get(id=partner_id)
        except Partner.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Partner not found"}, status=404)
    
    # --- buyer ---
    buyer = None
    if buyer_id:
        try:
            buyer = Partner.objects.get(id=buyer_id)
        except Partner.DoesNotExist:
            return JsonResponse({"status": "error", "message": "buyer not found"}, status=404)

    # --- validation products ---
    if products and not isinstance(products, list):
        return JsonResponse({"status": "error", "message": "products must be a list"}, status=400)

    try:
        with db_transaction.atomic():
            if isEdit and zakaz_id:
                # --- редактирование ---
                zakaz = get_object_or_404(Zakaz, id=zakaz_id)
                zakaz.warehouse = warehouse
                zakaz.partner = partner
                zakaz.buyer = buyer
                zakaz.updated_by = request.user
                zakaz.updated_at_handle = date_obj
                zakaz.save()

                # удаляем старые позиции
                ZakazItem.objects.filter(zakaz=zakaz).delete()
            else:
                # --- создание нового заказа ---
                zakaz = Zakaz.objects.create(
                    warehouse=warehouse,
                    partner=partner,
                    buyer=buyer,
                    created_by=request.user,
                    updated_by=request.user,
                    created_at_handle=date_obj,
                    updated_at_handle=date_obj
                )

            # --- сохраняем товары ---
            for item in products:
                product_id = item.get("product")
                qty = Decimal(item.get("selected_quantity")) if item.get("selected_quantity") not in ["", None] else Decimal(0)
                price = Decimal(item.get("selected_price")) if item.get("selected_price") not in ["", None] else Decimal(0)

                if not product_id:
                    return JsonResponse({"status": "error", "message": "product not found"}, status=404)

                product = get_object_or_404(Product, id=product_id)

                if qty < Decimal(0):
                    return JsonResponse({"status": "error", "message": "quantity cant be less than zero"}, status=400)
                
                if price < Decimal(0):
                    return JsonResponse({"status": "error", "message": "price cant be less than zero"}, status=400)

                ZakazItem.objects.create(
                    zakaz=zakaz,
                    product=product,
                    selected_quantity=qty,
                    selected_price=price,
                    unit=unit
                )

    except Exception as e:
        return JsonResponse({"status": "error", "message": "transactionChange", "reason_for_the_error": str(e)}, status=400)

    return JsonResponse({"message": "zakaz saved", "zakaz_id": zakaz.id})



@api_view(['GET'])
@permission_classes([IsAuthenticated])    
def zakaz_list(request):
    
    dateFrom = request.GET.get('dateFrom')
    dateTo = request.GET.get('dateTo')
    partner_id = request.GET.get('partner_id') 
    buyer_id = request.GET.get('buyer_id') 
    ic(buyer_id)
    
    # time.sleep(2)
    
 
    
    data = []
    
    # zakaz = Zakaz.objects.filter(created_at_handle__range=[dateFrom, dateTo])
    
    zakaz = (
        Zakaz.objects
        .filter(created_at_handle__range=[dateFrom, dateTo])
        .annotate(
            products_count=Sum('items__selected_quantity'),
            products_total_price=Sum(
                F('items__selected_quantity') * F('items__selected_price')
            )
        ).order_by("-pk")
    )
    
    if partner_id:
        zakaz = zakaz.filter(partner__id=partner_id)
        
    if buyer_id:
        zakaz = zakaz.filter(buyer__id=buyer_id)
    
    # Zakaz.objects.all().delete()
    
    for z in zakaz:
        
        # items = z.items.all()
        # products = []
        # if items:
        #     for i in items:
        #         p = {
        #             "product": i.product.id,
        #             "selected_quantity": i.selected_quantity,
        #             "selected_price": i.selected_price,
        #             "weight": i.product.weight,
        #             "volume": i.product.volume,
        #             "unit": i.unit,
        #         }
        #         products.append(p)
        d = {
            "id": z.id,
            "warehouse_name": z.warehouse.name,
            "partner_name": z.partner.name if z.partner else None,
            "buyer_name": z.buyer.name if z.buyer else None,
            "created_at_handle": z.created_at_handle,
            "updated_at_handle": z.updated_at_handle,
            "updated_by_name": z.updated_by.username,
            "created_by_name": z.created_by.username,
            "products_count": z.products_count or 0,
            "products_total_price": z.products_total_price or 0,
            
            # "products": products,
            
        }
        
        # d = {
        #     "warehouse": z.warehouse.id,
        #     "partner": z.partner.id if z.partner else None,
        #     "buyer": z.buyer.id if z.buyer else None,
        #     "created_at_handle": z.created_at_handle,
        #     "updated_at_handle": z.updated_at_handle,
        #     "updated_by": z.updated_by,
        #     "products": products,
            
        # }
        
        data.append(d)
        
                
        
    
    return JsonResponse({
        "data": data
    })
    


@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_zakaz_data(request, id):
    data = []
    try:
        zakaz = Zakaz.objects.get(id=id)
    except:
        return JsonResponse({"status": "error", "message": "zakaz not found"}, status=404)
    
    partner = None
    buyer = None
    if zakaz.partner:
        partner = {
            "id": zakaz.partner.id,
            "name": zakaz.partner.name,
        }
    if zakaz.buyer:
        ic(zakaz.buyer)
        buyer = {
            "id": zakaz.buyer.id,
            "name": zakaz.buyer.name,
        }
     
     
    items = zakaz.items.all()
    products = []
    if items:
        for p in items:
            image_obj = p.product.images.first()
            conversion_factor = 1
            unit_name = p.product.base_unit.name if p.product.base_unit else None
            default_unit = p.product.units.filter(is_default_for_sale=True).first()
            if default_unit:
                conversion_factor = int(default_unit.conversion_factor)
                unit_name = default_unit.unit.name
                
       
                    

            pr = {
                "id": p.product.id,
                "name": p.product.name,
                "image": image_obj.image.url if image_obj else None,
                "unit": unit_name,
                "conversion_factor": conversion_factor,
                "quantity_in_warehouse": 1,
                "purchase_price": p.product.purchase_price,
                "selected_price": p.selected_price,
                "selected_quantity": p.selected_quantity,
                "weight": p.product.weight,
                "volume": p.product.volume,
                
            }
            products.append(pr)
            


    data = {
        "warehouse": {"id": zakaz.warehouse.id, "name":zakaz.warehouse.name},
        "partner": partner,
        "buyer": buyer,
        "products": products
    }
    

    return JsonResponse({
            "data": data
        })
    



    
  
    

    

    
   
   
    