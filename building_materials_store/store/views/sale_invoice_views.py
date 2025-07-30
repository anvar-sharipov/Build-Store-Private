# from django.shortcuts import render
# import time
# from django.http import HttpResponse
# import openpyxl
# from openpyxl.utils import get_column_letter
# from icecream import ic
from rest_framework.decorators import action
# from rest_framework.filters import OrderingFilter
# from collections import OrderedDict
# from collections import defaultdict

from django_filters.rest_framework import DjangoFilterBackend
from .. filters import SalesInvoiceFilter


from rest_framework import viewsets, status
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
from rest_framework.decorators import action

# from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import render, get_object_or_404
# from rest_framework.generics import CreateAPIView
# from django_filters.rest_framework import DjangoFilterBackend
# from .. filters import ProductFilter
# from django.views.decorators.http import require_GET
# from django.http import JsonResponse
# from django.contrib.postgres.search import TrigramSimilarity
# from django.db.models import Q
# from django.utils.dateparse import parse_datetime, parse_date
# from django.db.models import Sum, F, Count
# from openpyxl.styles import Font
# from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from datetime import datetime   

# from rest_framework.pagination import PageNumberPagination

from . base_views import IsInAdminOrWarehouseGroup, CustomPageNumberPagination



class SalesInvoiceViewSet(viewsets.ModelViewSet):
    

    queryset = SalesInvoice.objects.all()  # ОБЯЗАТЕЛЬНО
    serializer_class = SalesInvoiceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPageNumberPagination

    filter_backends = [DjangoFilterBackend]
    filterset_class = SalesInvoiceFilter



    def get_queryset(self):
        return SalesInvoice.objects.select_related(
            'buyer', 'delivered_by', 'created_by'
        ).prefetch_related('items__product').all().order_by('-pk')

    # def perform_create(self, serializer):
    #     serializer.save(created_by=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        
        try:
            with transaction.atomic():
                data = request.data  # вот здесь JSON из React
                created_by = request.user
                total_amount = data['footerTotalPrice']
                withPosting = data['withPosting']
                comment = data['comment']
                type_price = data['priceType']
                
                invoice_date_str = data.get('invoice_date')
                invoice_date = None
                if invoice_date_str:
                    # invoice_date = datetime.strptime(invoice_date_str, '%Y-%m-%d')
                    date_part = datetime.strptime(invoice_date_str, '%Y-%m-%d').date()
                    time_part = datetime.now().time()
                    invoice_date = datetime.combine(date_part, time_part)
                    
                # ic(data)

                

                warehouse_id = data.get('warehouses', {}).get('id')
                if not warehouse_id:
                    return Response({'detail': 'youNeedSelectWarehouse'}, status=status.HTTP_400_BAD_REQUEST)
                warehouse = Warehouse.objects.get(pk=data['warehouses']['id'])

                try:
                    partner = Partner.objects.get(pk=data['partner']['id'])
                except:
                    partner = None

                try:
                    delivered_by = Employee.objects.get(pk=data['awto']['id'])
                except:
                    delivered_by = None

            

                if withPosting:
                    if not partner:
                        return Response({'detail': 'chooseClient'}, status=status.HTTP_400_BAD_REQUEST)
                    if not delivered_by:
                        return Response({'detail': 'chooseAwto'}, status=status.HTTP_400_BAD_REQUEST)

                test = SalesInvoice.objects.get(pk=62)
                ic(test.buyer)
                invoice = SalesInvoice.objects.create(
                    buyer=partner,
                    created_by=created_by,
                    warehouse=warehouse,
                    total_amount=Decimal(total_amount),
                    delivered_by=delivered_by,
                    note=comment,
                    invoice_date=invoice_date,
                    total_pay_summ=Decimal("0.00"),
                    isEntry=withPosting,
                    type_price=type_price
                )

                # Сохраняем позиции товаров
                for product in data['products']:
                    product_id = product['id']
                    
                    product_obj = Product.objects.get(pk=product_id)
                    quantity = Decimal(product['selected_quantity'])
                    sale_price = Decimal(product['selected_price'])


                    SalesInvoiceItem.objects.create(
                        invoice=invoice,
                        product=product_obj,
                        quantity=quantity,
                        sale_price=sale_price
                    )

                # ic(data['gifts'])

                for product in data['gifts']:
                    product_id = product['gift_product']
                    
                    product_obj = Product.objects.get(pk=product_id)
                    quantity = Decimal(product['selected_quantity'])
                    sale_price = 0


                    SalesInvoiceItem.objects.create(
                        invoice=invoice,
                        product=product_obj,
                        quantity=quantity,
                        sale_price=sale_price,
                        is_gift=True
                    )
                serializer = self.get_serializer(invoice)
                # return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response({'detail': 'successSave'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                
                invoice_id = self.kwargs.get('pk')
                invoice = SalesInvoice.objects.get(pk=invoice_id)

                invoice.total_amount = Decimal(data['footerTotalPrice'])
                invoice.note = data['comment']
                invoice.type_price = data['priceType']
                invoice.isEntry = data['withPosting']

                invoice_date_str = data.get('invoice_date')
                if invoice_date_str:
                    date_part = datetime.strptime(invoice_date_str, '%Y-%m-%d').date()
                    time_part = datetime.now().time()
                    invoice.invoice_date = datetime.combine(date_part, time_part)

                try:
                    partner = Partner.objects.get(pk=data['partner']['id'])
                    invoice.buyer = partner
                except:
                    invoice.buyer = None

                try:
                    delivered_by = Employee.objects.get(pk=data['awto']['id'])
                    invoice.delivered_by = delivered_by
                except:
                    invoice.delivered_by = None

                warehouse_id = data.get('warehouses', {}).get('id')
                if not warehouse_id:
                    return Response({'detail': 'youNeedSelectWarehouse'}, status=status.HTTP_400_BAD_REQUEST)
                invoice.warehouse = Warehouse.objects.get(pk=warehouse_id)

                invoice.save()

                # Удаляем старые позиции
                invoice.items.all().delete()

                # Добавляем заново товары
                for product in data['products']:
                    product_id = product['id']
                    product_obj = Product.objects.get(pk=product_id)
                    quantity = Decimal(product['selected_quantity'])
                    sale_price = Decimal(product['selected_price'])

                    SalesInvoiceItem.objects.create(
                        invoice=invoice,
                        product=product_obj,
                        quantity=quantity,
                        sale_price=sale_price
                    )

                # Подарки
                ic(data)
                for product in data['gifts']:
                    product_id = product['id']
                    product_obj = Product.objects.get(pk=product_id)
                    quantity = Decimal(product['selected_quantity'])

                    SalesInvoiceItem.objects.create(
                        invoice=invoice,
                        product=product_obj,
                        quantity=quantity,
                        sale_price=0,
                        is_gift=True
                    )

                return Response({'detail': 'successSave'}, status=status.HTTP_200_OK)
        except Exception as e:
            ic(e)
            return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)

            

