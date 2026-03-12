# from django.shortcuts import render
import time
# from django.http import HttpResponse
# import openpyxl
# from openpyxl.utils import get_column_letter
# from icecream import ic
# from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
# from collections import OrderedDict
# from collections import defaultdict
from icecream import ic
import os
from django.conf import settings


from rest_framework import viewsets
from .. models import *
# from .serializers import *

from .. serializers.base_serializers import *
from .. serializers.entry_serializers import *
from .. serializers.partner_serializers import *
from .. serializers.product_serializers import *
from .. serializers.register_serializers import *
from .. serializers.sale_invoice_serializers import *

# from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view

from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import render, get_object_or_404
# from rest_framework.generics import CreateAPIView
from django_filters.rest_framework import DjangoFilterBackend
from .. filters import ProductFilter
# from django.views.decorators.http import require_GET
# from django.http import JsonResponse
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Case, When, Value, IntegerField, Q
from django.utils.dateparse import parse_date
from django.db.models import Sum, F, Count
from django.db.models import F, Count, DecimalField
# from openpyxl.styles import Font
from rest_framework.exceptions import PermissionDenied
# from django.db import transaction
# from datetime import datetime
from rest_framework.parsers import MultiPartParser, FormParser

# from rest_framework.pagination import PageNumberPagination
from django.db.models.functions import Coalesce

from . base_views import IsInAdminOrWarehouseGroup, CustomPageNumberPagination

from ..my_func.get_unit_map import get_unit_map 
from ..my_func.get_unit_map import get_unit_map2 
from ..my_func.get_unit_and_cf import get_unit_and_cf
from ..my_func.date_str_to_dateFormat import date_str_to_dateFormat
from ..my_func.get_reserved_quantity import get_reserved_quantity
from ..my_func.get_reserved_quantity_map import get_reserved_quantity_map
import re




class ProductUnitViewSet(viewsets.ModelViewSet):
    queryset = ProductUnit.objects.all()
    serializer_class = ProductUnitSerializer
    permission_classes = [IsAuthenticated]  



# class ProductImageViewSet(viewsets.ModelViewSet):
#     queryset = ProductImage.objects.all()
#     serializer_class = ProductImageSerializer
#     permission_classes = [IsAuthenticated]  
#     parser_classes = [MultiPartParser, FormParser]


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated]  
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        # print("=== VIEWSET CREATE DEBUG ===")
        # print("Request data keys:", list(request.data.keys()))
        # print("Request FILES keys:", list(request.FILES.keys()))
        # print("Product ID:", request.data.get('product'))
        # print("Alt text:", request.data.get('alt_text'))
        if 'image' in request.FILES:
            image = request.FILES['image']
        #     print("Image file:", image.name, image.size, image.content_type)
        # print("MEDIA_ROOT exists:", os.path.exists(settings.MEDIA_ROOT))
        # print("MEDIA_ROOT path:", settings.MEDIA_ROOT)
        # print("=== END VIEWSET DEBUG ===")
        
        response = super().create(request, *args, **kwargs)
        # print("=== RESPONSE DEBUG ===")
        # print("Response data:", response.data)
        # print("=== END RESPONSE DEBUG ===")
        return response





# dlya poiska producta for free add
@api_view(["GET"])
def search_products(request):
    ic("qaswdxx")
    
    
    
 
    query = request.GET.get("search", "")
    warehouse = request.GET.get("warehouse", "")
    search_free = request.GET.get("search_free", "")
    product_id = request.query_params.get('id')
    search_in_invoice = request.GET.get("search_in_invoice", "")
    invoice_id = request.GET.get("invoice_id", "") 
    wozwrat_or_prihod = request.GET.get("wozwrat_or_prihod", "")
    
    
   
    
    # warehouses_objs = Warehouse.obj
    
    if query:
        
        
        
        
        # # 🔹 1. Сначала ищем по qr_code
        # results = Product.objects.filter(qr_code=query)
        # not_qr_code = False
  
        
        # # 🔹 2. Если по qr_code пусто → ищем по имени
        # if not results.exists():
        #     # dlya list product w sale invoice
        #     results = Product.objects.annotate(
        #         similarity=TrigramSimilarity("name", query)
        #     ).filter(similarity__gt=0.2)
        # else:
        #     not_qr_code = True
            
        

        # if warehouse:
        #     results = results.filter(warehouse_products__warehouse_id=warehouse)

        # if not not_qr_code:
        #     results = results.order_by("-similarity")[:10]

        # data = []
        # for product in results:
        #     if warehouse:
        #         quantity = product.warehouse_products.filter(
        #             warehouse_id=warehouse
        #         ).aggregate(total=models.Sum('quantity'))['total'] or 0
        #         base_quantity_in_stock = quantity
        #     else:
        #         quantity = product.get_total_quantity()

        #     unit_name = product.base_unit.name if product.base_unit else ""
        #     for unit in product.units.all():
        #         if unit.is_default_for_sale and unit.conversion_factor:
        #             # print('quantity', quantity)
        #             # print('unit.conversion_factor', unit.conversion_factor)
        #             quantity = float(quantity) / float(unit.conversion_factor)
        #             unit_name = unit.unit.name
        #             break

        #     serialized = ProductSerializer(product).data
        #     serialized.update({
        #         'quantity_on_selected_warehouses': quantity,
        #         'unit_name_on_selected_warehouses': unit_name,
        #         'base_quantity_in_stock': base_quantity_in_stock,
        #         'selected_quantity': 1,
        #         'selected_price': 1,
        #         "finded_from_QR": not_qr_code
        #     })
        #     data.append(serialized)
        #     # print(product, unit_name, quantity)
        
        
        query = query.strip()
        finded_from_qr = False

        # --- 1) Поиск по QR-коду ---
        results = Product.objects.filter(qr_code=query)
        finded_from_qr = results.exists()
        

        # --- 2) Если по QR ничего не найдено — ищем по имени ---
        if not finded_from_qr:
            

            # # Создаём базовый queryset без slice
            # tmp_results = Product.objects.annotate(
            #     rank=Case(
            #         # 1: Полное совпадение
            #         When(name__iexact=query, then=Value(1)),
            #         # 2: Начинается с query
            #         When(name__istartswith=query, then=Value(2)),
            #         # 3: Содержит query
            #         When(name__icontains=query, then=Value(3)),
            #         # 4: всё остальное — триграммы
            #         default=Value(4),
            #         output_field=IntegerField()
            #     ),
            #     similarity=TrigramSimilarity("name", query)
            # ).filter(
            #     Q(name__icontains=query) | Q(similarity__gt=0.1)
            # ).order_by("rank", "-similarity")
            
            
            
            # tmp_results = Product.objects.annotate(
            #         rank=Case(
            #             When(name__iexact=query, then=Value(1)),
            #             When(name__istartswith=query, then=Value(2)),
            #             When(name__icontains=query, then=Value(3)),
            #             output_field=IntegerField()
            #         )
            #     ).filter(
            #         name__icontains=query
            #     ).order_by("rank")
            
            
            
            # нормализация
            # query2 = query.lower().strip()
            # query2 = re.sub(r"[^\w\s]", " ", query2)
            # words = query2.split()
            
            # ic("aga")

            # # AND поиск по каждому слову
            # q = Q()
            # for word in words:
            #     q &= Q(name__icontains=word)

            # tmp_results = (
            #     Product.objects
            #     .annotate(
            #         rank=Case(
            #             When(name__icontains=query, then=Value(1)),
            #             When(name__istartswith=query, then=Value(2)),
            #             When(name__iexact=query, then=Value(3)),
            #             default=Value(4),
            #             output_field=IntegerField(),
            #         )
            #     )
            #     .filter(q)
            #     .order_by("rank", "name")
            # )
            
            
            raw_query = query.strip()                # "ab-3"
            norm_query = raw_query.lower()
            # norm_query = re.sub(r"[^\w\s-]", "", norm_query)
            norm_query = re.sub(r"[^\w\s/-]", " ", norm_query)

            words = norm_query.replace("-", " ").split()

            # AND поиск
            q = Q()
            for word in words:
                q &= Q(name__icontains=word)

            tmp_results = (
                Product.objects
                .annotate(
                    rank=Case(
                        # 1️⃣ точное совпадение
                        When(name__iexact=raw_query, then=Value(1)),

                        # 2️⃣ начинается с ab-3
                        When(name__istartswith=raw_query, then=Value(2)),

                        # 3️⃣ содержит ab-3
                        When(name__icontains=raw_query, then=Value(3)),

                        default=Value(4),
                        output_field=IntegerField(),
                    )
                )
                .filter(q)
                .order_by("rank", "name")
            )
            
            # --- Фильтрация по складу ---
            
            if warehouse:
                tmp_results = tmp_results.filter(
                    warehouse_products__warehouse_id=warehouse,
                )
          
            if wozwrat_or_prihod == "rashod":
                tmp_results = tmp_results.filter(
                    warehouse_products__quantity__gt=0,
                )

            # --- Slice применяем только в самом конце ---
            results = tmp_results #[:30]

        else:
            # Если qr найден — то можно применить фильтрацию по складу сразу
            if warehouse:
                results = results.filter(
                    warehouse_products__warehouse_id=warehouse
                )

        # --- Формируем ответ ---
        data = []
        product_ids = [p.id for p in results]
        reserved_map = get_reserved_quantity_map(product_ids, [warehouse], invoice_id)
        ic("tut22")
        warehouse_quantity_map = dict(
            WarehouseProduct.objects
            .filter(product_id__in=product_ids, warehouse_id=warehouse)
            .values_list('product_id')
            .annotate(total=Sum('quantity'))
        )
        # unit_map = get_unit_map()
        unit_map = get_unit_map2(product_ids)
        
        serializer = ProductSerializer(
            results,
            many=True,
            context={
                "request": request,
                "reserved_map": reserved_map,
                "warehouse_quantity_map": warehouse_quantity_map,
            }
        )

        data = serializer.data
        
        # for product in results:
       
            
        #     # qty_in_drafts = get_reserved_quantity(product, warehouse, invoice_id)
            
        #     qty_in_drafts = reserved_map.get(product.id, 0)
            
        

        #     # Подсчёт количества
        #     if warehouse:
        #         # quantity = product.warehouse_products.filter(
        #         #     warehouse_id=warehouse
        #         # ).aggregate(total=models.Sum('quantity'))['total'] or 0
        #         # base_quantity_in_stock = quantity
        #         quantity = warehouse_quantity_map.get(product.id, 0)
        #         base_quantity_in_stock = quantity
        #     else:
        #         quantity = product.get_total_quantity()
        #         base_quantity_in_stock = quantity

        #     # Конвертация по юнитам
        #     # unit_name = product.base_unit.name if product.base_unit else ""
        #     # for unit in product.units.all():
        #     #     if unit.is_default_for_sale and unit.conversion_factor:
        #     #         quantity = float(quantity) / float(unit.conversion_factor)
        #     #         unit_name = unit.unit.name
        #     #         break
        #     unit_name, cf = get_unit_and_cf(unit_map, product)
        #     qty_in_drafts = Decimal(qty_in_drafts) / cf
        #     quantity = Decimal(quantity) / cf

        #     # Сериализация
        #     # serialized = ProductSerializer(product).data
        #     serialized = ProductSerializer(
        #         product,
        #         context={
        #             "request": request,
        #             "reserved_map": reserved_map,
        #             "warehouse_quantity_map": warehouse_quantity_map,
        #         }
        #     ).data

        #     serialized.update({
        #         'quantity_on_selected_warehouses': quantity,
        #         'unit_name_on_selected_warehouses': unit_name,
        #         'base_quantity_in_stock': base_quantity_in_stock,
        #         'selected_quantity': 1,
        #         'selected_price': 1,
        #         "finded_from_QR": finded_from_qr,
        #         'qty_in_drafts': qty_in_drafts
        #     })

        #     data.append(serialized)
        
        for i, product in enumerate(results):

            qty_in_drafts = reserved_map.get(product.id, 0)

            if warehouse:
                quantity = warehouse_quantity_map.get(product.id, 0)
                base_quantity_in_stock = quantity
            else:
                quantity = product.get_total_quantity()
                base_quantity_in_stock = quantity

            unit_name, cf = get_unit_and_cf(unit_map, product)

            quantity = Decimal(quantity) / cf
            qty_in_drafts = Decimal(qty_in_drafts) / cf

            data[i].update({
                'quantity_on_selected_warehouses': quantity,
                'unit_name_on_selected_warehouses': unit_name,
                'base_quantity_in_stock': base_quantity_in_stock,
                'selected_quantity': 1,
                'selected_price': 1,
                "finded_from_QR": finded_from_qr,
                'qty_in_drafts': qty_in_drafts
            })
            
            
            
        ic("tut33")

    # esli poisk produkta s sales invoice (esli najal na enter wybor producta)
    
    
    elif search_in_invoice:
        
        
        product_id = request.GET.get("id", "")
        warehouse = request.GET.get("warehouse", "")
        
   
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Продукт не найден"}, status=404)

        # warehouse_products = product.warehouse_products.filter(warehouse_id=warehouse)
        warehouse_products2 = WarehouseProduct.objects.get(warehouse__id=warehouse, product__id=product.id).product
        
        quantity = warehouse_products2.warehouse_products.filter(warehouse_id=warehouse).aggregate(total=models.Sum('quantity'))['total'] or 0
        base_quantity_in_stock = quantity

        unit_name = warehouse_products2.base_unit.name if warehouse_products2.base_unit else ""
        for unit in warehouse_products2.units.all():
            if unit.is_default_for_sale and unit.conversion_factor:
                # print('quantity', quantity)
                # print('unit.conversion_factor', unit.conversion_factor)
                quantity = float(quantity) / float(unit.conversion_factor)
                unit_name = unit.unit.name
                break
        
        data = []
        serialized = ProductSerializer(warehouse_products2).data
        serialized.update({
                'quantity_on_selected_warehouses': quantity,
                'unit_name_on_selected_warehouses': unit_name,
                'base_quantity_in_stock': base_quantity_in_stock,
                'selected_quantity': 1,
            })
        data.append(serialized)
        

        
        # for wp in warehouse_products:  # wp = warehouse_product
        #     product = wp.product
        #     base_quantity_in_stock = wp.quantity  # Кол-во на складе в базовой единице

        #     quantity = base_quantity_in_stock
        #     unit_name = product.base_unit.name if product.base_unit else ""

        #     for unit in product.units.all():
        #         if unit.is_default_for_sale and unit.conversion_factor:
        #             quantity = float(quantity) / float(unit.conversion_factor)
        #             unit_name = unit.unit.name
        #             break

        #     serialized = ProductSerializer(product).data
        #     serialized.update({
        #         'quantity_on_selected_warehouses': quantity,
        #         'unit_name_on_selected_warehouses': unit_name,
        #         'base_quantity_in_stock': base_quantity_in_stock,
        #     })
        #     data.append(serialized)

    elif product_id:
        
       
        
        
 
        results = Product.objects.filter(id=product_id)
        data = []
        for product in results:
            if warehouse:
                quantity = product.warehouse_products.filter(
                    warehouse_id=warehouse
                ).aggregate(total=models.Sum('quantity'))['total'] or 0
                base_quantity_in_stock = quantity
            else:
                quantity = product.get_total_quantity()
            unit_name = product.base_unit.name if product.base_unit else ""
            for unit in product.units.all():
                if unit.is_default_for_sale and unit.conversion_factor:
                    # print('quantity', quantity)
                    # print('unit.conversion_factor', unit.conversion_factor)
                    quantity = float(quantity) / float(unit.conversion_factor)
                    unit_name = unit.unit.name
                    break
            serialized = ProductSerializer(product).data
            serialized.update({
                'quantity_on_selected_warehouses': quantity,
                'unit_name_on_selected_warehouses': unit_name,
                'base_quantity_in_stock': base_quantity_in_stock,
            })
            data.append(serialized)
    
    
    # elif search_free:
    #     ic("search gift")
        
    #     warehouse_ids = request.GET.getlist("warehouses")
    #     if warehouse_ids:
    #         warehouse_ids = [int(w) for w in warehouse_ids if w.isdigit()]
        
    #     # Добавляем аннотацию с похожестью по триграммам
    #     results = Product.objects.annotate(
    #         similarity=TrigramSimilarity('name', search_free)
    #     ).filter(similarity__gt=0.1)  # порог схожести (можно подстроить)
        
    #     # eto ili
    #     # if warehouse_ids:
    #     #     results = results.filter(warehouse_products__warehouse_id__in=warehouse_ids)

    #     # a eto i (doljno byt wo wseh wybrannyh skladah)
    #     if warehouse_ids:
    #         results = results.annotate(
    #             warehouses_count=Count(
    #                 'warehouse_products__warehouse_id',
    #                 filter=Q(warehouse_products__warehouse_id__in=warehouse_ids),
    #                 distinct=True
    #             )
    #         ).filter(
    #             warehouses_count=len(warehouse_ids)
    #         )
        
    #     results = results.order_by('-similarity')[:10]  # сортируем по убыванию схожести

    #     data = []
    #     for product in results:
    #         serialized = ProductSerializer(product).data
    #         data.append(serialized)
    
    elif search_free:
        ic("search gift")

        warehouse_ids = request.GET.getlist("warehouses")
        if warehouse_ids:
            warehouse_ids = [int(w) for w in warehouse_ids if w.isdigit()]

        raw_query = search_free.strip()

        results = (
            Product.objects
            .annotate(
                rank=Case(
                    When(name__iexact=raw_query, then=Value(1)),
                    When(name__istartswith=raw_query, then=Value(2)),
                    When(name__icontains=raw_query, then=Value(3)),
                    default=Value(4),
                    output_field=IntegerField(),
                )
            )
            .filter(name__icontains=raw_query)
        )

        # ✅ склад фильтруем ДО slice
        if warehouse_ids:
            results = results.annotate(
                warehouses_count=Count(
                    'warehouse_products__warehouse_id',
                    filter=Q(warehouse_products__warehouse_id__in=warehouse_ids),
                    distinct=True
                )
            ).filter(
                warehouses_count=len(warehouse_ids)
            )

        # ✅ сортировка
        results = results.order_by("rank", "name")

        # ✅ slice В САМОМ КОНЦЕ
        results = results[:100]

        data = []
        for product in results:
            serialized = ProductSerializer(product).data
            data.append(serialized)

    

       
        


    # return Response(ProductSerializer(results, many=True).data)
    return Response(data)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    pagination_class = CustomPageNumberPagination

    # filter_backends = [DjangoFilterBackend]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter

    def get_permissions(self):
        return [IsInAdminOrWarehouseGroup()]

    def get_queryset(self):
        ic("wtwtwtw")

        qs = Product.objects.all()
        
        
        
        # qs = qs.annotate(
        #     test_qty=Coalesce(
        #         Sum('invoice_items__qty'),
        #         0,
        #         output_field=IntegerField()
        #     ),
        #     test_sum=Coalesce(
        #         Sum(
        #             F('invoice_items__qty') * F('invoice_items__price'),
        #             output_field=DecimalField()
        #         ),
        #         0
        #     )
        # )
        
        qs = qs.select_related('category', 'base_unit', 'brand', 'model')
        qs = qs.prefetch_related('units__unit', 'images')
        qs = qs.annotate(total_quantity2=Sum('warehouse_products__quantity'))
        # qs = qs.annotate(
        #     total_quantity=Sum('warehouse_products__quantity')
        # )
        
        # ---------- ОБОРОТ ----------
  

        return qs.distinct()

    # def list(self, request, *args, **kwargs):
    #     queryset = self.filter_queryset(self.get_queryset())

    #     page = self.paginate_queryset(queryset)
        
    #     meta = {
    #         "test1": 1,
    #         "test2": 2,
    #     }
    #     if page is not None:
    #         serializer = self.get_serializer(page, many=True)
    #         response = self.get_paginated_response(serializer.data)
    #         response.data['meta'] = meta
    #         return response

    #     serializer = self.get_serializer(queryset, many=True)
        
    #     return Response({
    #         "results": serializer.data,
    #         "meta": meta,
    #         # serializer.data
    #         })
    
    def list(self, request, *args, **kwargs):
        ic("dadadasss")
        
        
        
        unit_map = get_unit_map()
     
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        current_products = page if page is not None else queryset
        product_ids = [p.id for p in current_products]
        
        
        
        
        dateFrom = request.query_params.get('date_from')
        dateTo = request.query_params.get('date_to')
        
        
        if not dateFrom or not dateTo:
            return Response(
                {"error": "date_from and date_to are required"},
                status=400
            )
            
        # if date_from > date_to:
        #     return Response(
        #         {"error": "date_from must be less than or equal to date_to"},
        #         status=400
        #     )
        
        date_from = date_str_to_dateFormat(dateFrom)
        date_to = date_str_to_dateFormat(dateTo)
        
        closing = (
            DayClosing.objects
            .filter(date__lt=date_from)
            .order_by("-date")
            .first()
        )
        
        ic(date_from)
        ic(date_to)
        
        warehouse_ids = request.query_params.get('warehouse')
        warehouse_ids = warehouse_ids.split(',') if warehouse_ids else []
        warehouse_ids = list(map(int, warehouse_ids))
        
        reserved_map = get_reserved_quantity_map(product_ids, warehouse_ids)
        ic(reserved_map)
        
        if not warehouse_ids:
            warehouse_ids = [w.id for w in Warehouse.objects.all()]
       

        start_data = {}
        turnover_data = {}

        if closing:
            ic("start from snapshot")

            snapshots = (
                StockSnapshot.objects
                .filter(
                    closing=closing,
                    warehouse_id__in=warehouse_ids
                )
                .select_related("product")
                .values(
                    "product_id",
                    "product__wholesale_price"
                )
                .annotate(qty=Sum("quantity"))
            )

            for row in snapshots:
                p_id = row["product_id"]

                turnover_data[p_id] = {
                    "id": p_id,
                    "start_quantity": row["qty"] or Decimal("0"),
                    "turnover_quantity_prihod": Decimal("0"),
                    "turnover_quantity_rashod": Decimal("0"),
                    "turnover_quantity_wozwrat": Decimal("0"),
                    "price": row["product__wholesale_price"],
                    # unit и cf добавим позже, когда понадобится product
                    "unit": "",
                    "conversion_factor": Decimal("1"),
                }

            ic("snapshot products:", len(turnover_data))
            
            # qty_2 = start_data.get(413)

            # ic("product_id=2 qty:", qty_2)
            
        else:
            ic("tutssss2 start_items")
            
        
            # остаток на начало периода
            start_items = InvoiceItem.objects.filter(
                invoice__entry_created_at_handle__lt=date_from,
                invoice__canceled_at__isnull=True
                ).filter(
                    Q(invoice__warehouse_id__in=warehouse_ids) |
                    Q(invoice__warehouse2_id__in=warehouse_ids)
                ).select_related(
                    "product", "product__base_unit", "invoice"
                )
            
            for item in start_items:
                p = item.product  
                inv = item.invoice
                # if inv.canceled_at != None:
                #     continue
                
                unit, cf = get_unit_and_cf(unit_map, p)

                if p.id not in turnover_data:
                    # pu = unit_map.get(p.id)
                    # if pu:
                    #     unit = pu.unit.name
                    #     conversion_factor = pu.conversion_factor
                    # else:
                    #     unit = p.base_unit.name if p.base_unit else ""
                    #     conversion_factor = 1
                    
                    
                    
                    turnover_data[p.id] = {
                        "id": p.id,
                        "start_quantity": Decimal("0"),
                        "turnover_quantity_prihod": Decimal("0"),
                        "turnover_quantity_rashod": Decimal("0"),
                        "turnover_quantity_wozwrat": Decimal("0"),
                        # "total_price": Decimal("0"),
                        "price": p.wholesale_price,
                        "unit": unit,
                        "conversion_factor": cf,
                    }
                    
                cf = Decimal(turnover_data[p.id]["conversion_factor"])
                # if p.id == 2:
                #     ic(unit)
                #     ic(cf)
                #     ic(item.selected_quantity)
                qty = item.selected_quantity
                
                if inv.wozwrat_or_prihod == "prihod":
                    
                    if inv.warehouse_id in warehouse_ids:
                        # if p.id == 2:
                        #     ic("prihod")
                        #     ic(unit)
                        #     ic(cf)
                        #     ic(item.selected_quantity)
                        turnover_data[p.id]["start_quantity"] += qty
                elif inv.wozwrat_or_prihod == "rashod":
                    
                    if inv.warehouse_id in warehouse_ids:
                        # if p.id == 2:
                        #     ic("rashod")
                        #     ic(unit)
                        #     ic(cf)
                        #     ic(item.selected_quantity)
                        turnover_data[p.id]["start_quantity"] -= qty
                elif inv.wozwrat_or_prihod == "wozwrat":
                    if inv.warehouse_id in warehouse_ids:
                        turnover_data[p.id]["start_quantity"] += qty
                elif inv.wozwrat_or_prihod == "transfer":
                    # если со склада (и склад в выбранных)
                    if inv.warehouse_id in warehouse_ids:
                        turnover_data[p.id]["start_quantity"] -= qty
                    # если на склад (и склад в выбранных)
                    elif inv.warehouse2_id in warehouse_ids:
                        turnover_data[p.id]["start_quantity"] += qty
        

        # оборот за период
       
        period_items = InvoiceItem.objects.filter(
            invoice__entry_created_at_handle__range=[date_from, date_to]
        ).filter(
            Q(invoice__warehouse_id__in=warehouse_ids) |
            Q(invoice__warehouse2_id__in=warehouse_ids)
        ).select_related(
            "product", "product__base_unit", "invoice"
        )
        
        for item in period_items:
            
            p = item.product  
            inv = item.invoice
            if inv.canceled_at != None:
                continue
            
            if p.id not in turnover_data:
                # pu = unit_map.get(p.id)
                # if pu:
                #     # unit = pu.unit.name
                #     conversion_factor = pu.conversion_factor
                # else:
                #     # unit = p.base_unit.name if p.base_unit else ""
                #     conversion_factor = 1
                
                unit, cf = get_unit_and_cf(unit_map, p)
                # ic(unit, cf)
                    
                turnover_data[p.id] = {
                    "id": p.id,
                    "start_quantity": Decimal("0"),
                    "turnover_quantity_prihod": Decimal("0"),
                    "turnover_quantity_rashod": Decimal("0"),
                    "turnover_quantity_wozwrat": Decimal("0"),
                    # "total_price": Decimal("0"),
                    "price": p.wholesale_price,
                    # "unit": unit,
                    "conversion_factor": cf,
                }
            # ic(unit, cf)
                
            cf = Decimal(turnover_data[p.id]["conversion_factor"])
            qty = item.selected_quantity
            
            if inv.wozwrat_or_prihod == "prihod":
                if inv.warehouse_id in warehouse_ids:
                    turnover_data[p.id]["turnover_quantity_prihod"] += qty
            elif inv.wozwrat_or_prihod == "rashod":
                if inv.warehouse_id in warehouse_ids:
                    turnover_data[p.id]["turnover_quantity_rashod"] += qty
            elif inv.wozwrat_or_prihod == "wozwrat":
                if inv.warehouse_id in warehouse_ids:
                    turnover_data[p.id]["turnover_quantity_wozwrat"] += qty
            elif inv.wozwrat_or_prihod == "transfer":
                # если со склада (и склад в выбранных)
                if inv.warehouse_id in warehouse_ids:
                    turnover_data[p.id]["turnover_quantity_rashod"] += qty
                # если на склад (и склад в выбранных)
                elif inv.warehouse2_id in warehouse_ids:
                    turnover_data[p.id]["turnover_quantity_prihod"] += qty
        
        
        for id, data in turnover_data.items():
            qty_end = Decimal("0") 
            qty_end += data["start_quantity"] 
            qty_end += data["turnover_quantity_prihod"] 
            qty_end -= data["turnover_quantity_rashod"] 
            qty_end += data["turnover_quantity_wozwrat"] 
            
            data["qty_end"] = qty_end


        # serializer = self.get_serializer(
        #     page if page is not None else queryset,
        #     many=True,
        #     context={
        #         "request": request,
        #         "turnover_data": turnover_data,
        #     }
        # )
        
        # serializer = self.get_serializer(
        #     page if page is not None else queryset,
        #     many=True,
        #     context={
        #         "request": request,
        #         "turnover_data": turnover_data,
        #         "warehouse_ids": warehouse_ids,
        #     }
        # )
        
        serializer = self.get_serializer(
            current_products,
            many=True,
            context={
                "request": request,
                "turnover_data": turnover_data,
                "reserved_map": reserved_map,
            }
        )

        meta = {"test1": 1}
        # ic("tut2", serializer.data)
        if page is not None:
            response = self.get_paginated_response(serializer.data)
            response.data["meta"] = meta
            return response
        
        return Response({
            "results": serializer.data,
            "meta": meta,
        })

    def retrieve(self, request, *args, **kwargs):
        # time.sleep(1)  # задержка для теста
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        # time.sleep(2)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        # print('request.user.username', request.user.username)
        if request.user.username != 'anvar':
            raise PermissionDenied("Удаление товара разрешено только администратору")
        return super().destroy(request, *args, **kwargs)
