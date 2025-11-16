# from django.shortcuts import render
import time
# from django.http import HttpResponse
# import openpyxl
# from openpyxl.utils import get_column_letter
# from icecream import ic
# from rest_framework.decorators import action
# from rest_framework.filters import OrderingFilter
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
from django.db.models import Q
# from django.utils.dateparse import parse_datetime, parse_date
# from django.db.models import Sum, F, Count
from django.db.models import F, Count
# from openpyxl.styles import Font
from rest_framework.exceptions import PermissionDenied
# from django.db import transaction
# from datetime import datetime
from rest_framework.parsers import MultiPartParser, FormParser

# from rest_framework.pagination import PageNumberPagination

from . base_views import IsInAdminOrWarehouseGroup, CustomPageNumberPagination



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
 
    query = request.GET.get("search", "")
    warehouse = request.GET.get("warehouse", "")
    search_free = request.GET.get("search_free", "")
    product_id = request.query_params.get('id')
    search_in_invoice = request.GET.get("search_in_invoice", "")
    
    if query:
        
        # 🔹 1. Сначала ищем по qr_code
        results = Product.objects.filter(qr_code=query)
        not_qr_code = False
        
        # 🔹 2. Если по qr_code пусто → ищем по имени
        if not results.exists():
            # dlya list product w sale invoice
            results = Product.objects.annotate(
                similarity=TrigramSimilarity("name", query)
            ).filter(similarity__gt=0.2)
        else:
            not_qr_code = True
            
        

        if warehouse:
            results = results.filter(warehouse_products__warehouse_id=warehouse)

        if not not_qr_code:
            results = results.order_by("-similarity")[:10]

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
                'selected_quantity': 1,
                'selected_price': 1,
                "finded_from_QR": not_qr_code
            })
            data.append(serialized)
            # print(product, unit_name, quantity)

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
    elif search_free:
        warehouse_ids = request.GET.getlist("warehouses")
        if warehouse_ids:
            warehouse_ids = [int(w) for w in warehouse_ids if w.isdigit()]
        
        # Добавляем аннотацию с похожестью по триграммам
        results = Product.objects.annotate(
            similarity=TrigramSimilarity('name', search_free)
        ).filter(similarity__gt=0.1)  # порог схожести (можно подстроить)
        
        # eto ili
        # if warehouse_ids:
        #     results = results.filter(warehouse_products__warehouse_id__in=warehouse_ids)

        # a eto i (doljno byt wo wseh wybrannyh skladah)
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
        
        results = results.order_by('-similarity')[:10]  # сортируем по убыванию схожести

        data = []
        for product in results:
            serialized = ProductSerializer(product).data
            data.append(serialized)

    

       
        


    # return Response(ProductSerializer(results, many=True).data)
    return Response(data)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    pagination_class = CustomPageNumberPagination

    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter

    def get_permissions(self):
        return [IsInAdminOrWarehouseGroup()]

    def get_queryset(self):
        qs = Product.objects.all()
        qs = qs.select_related('category', 'base_unit', 'brand', 'model')
        qs = qs.prefetch_related('units__unit', 'images')
        qs = qs.annotate(total_quantity2=Sum('warehouse_products__quantity'))
        return qs.distinct()

    def list(self, request, *args, **kwargs):
        # time.sleep(1)  # для теста задержка
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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
