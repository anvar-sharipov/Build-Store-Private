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
# from django.db.models import Q
# from django.utils.dateparse import parse_datetime, parse_date
# from django.db.models import Sum, F, Count
# from openpyxl.styles import Font
from rest_framework.exceptions import PermissionDenied
# from django.db import transaction
# from datetime import datetime

# from rest_framework.pagination import PageNumberPagination

from . base_views import IsInAdminOrWarehouseGroup, CustomPageNumberPagination



class ProductUnitViewSet(viewsets.ModelViewSet):
    queryset = ProductUnit.objects.all()
    serializer_class = ProductUnitSerializer
    permission_classes = [IsAuthenticated]  



class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated]  


# dlya poiska producta for free add
@api_view(["GET"])
def search_products(request):
 
    query = request.GET.get("search", "")
    warehouse = request.GET.get("warehouse", "")

    product_id = request.query_params.get('id')

  
    if query:
        # print('warehouse', warehouse)
        results = Product.objects.annotate(
            similarity=TrigramSimilarity("name", query)
        ).filter(similarity__gt=0.1)

        

        if warehouse:
            results = results.filter(warehouse_products__warehouse_id=warehouse)

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
            })
            data.append(serialized)
            # print(product, unit_name, quantity)
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
        time.sleep(2)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        print('request.user.username', request.user.username)
        if request.user.username != 'anvar':
            raise PermissionDenied("Удаление товара разрешено только администратору")
        return super().destroy(request, *args, **kwargs)
