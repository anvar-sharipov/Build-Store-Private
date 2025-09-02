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
from django.contrib.contenttypes.models import ContentType


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
                comment = data['comment'] if data['comment'] != None else ''
                type_price = data['priceType']
                
                
               
                
              
                try:
                    warehouse = data['warehouses']
                    warehouse_obj = Warehouse.objects.get(pk=warehouse['id'])
                except:
                    return Response({'detail': 'youNeedSelectWarehouse'}, status=status.HTTP_400_BAD_REQUEST)
                
                invoice_date_str = data.get('invoice_date')

                if invoice_date_str:
                    try:
                        date_part = datetime.strptime(invoice_date_str, '%Y-%m-%d').date()
                        time_part = datetime.now().time()
                        invoice_date = datetime.combine(date_part, time_part)
                    except ValueError:
                        return Response({'detail': 'errorDate'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'detail': 'errorDate'}, status=status.HTTP_400_BAD_REQUEST)
                

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
                    
                    if partner.type != "klient" and partner.type != "both" and partner.type != "founder":
                        return Response({'detail': 'CantBeSaleForSupplier'}, status=status.HTTP_400_BAD_REQUEST)
                    
     
                
                invoice = SalesInvoice.objects.create(
                    buyer=partner,
                    created_by=created_by,
                    warehouse=warehouse,
                    total_amount=Decimal(total_amount),
                    delivered_by=delivered_by,
                    # note=comment,
                    invoice_date=invoice_date,
                    total_pay_summ=Decimal("0.00"),
                    isEntry=withPosting,
                    type_price=type_price
                )
                
                invoice.note = f"Faktura № {invoice.pk}\n{comment}"
                invoice.save()
                
                
            

                
                if withPosting:
                    # Определяем операцию (например, 'sale')
                    operation = Operation.objects.get(code="sale")  

                    # Ищем правило проводки
                    rules = CustomePostingRule.objects.filter(operation__code="sale", directory_type=partner.type)
          
                    if not rules:
                        return Response({'detail': 'NoPostingRuleFound'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    transaction_obj = Transaction.objects.create(
                        description=comment,
                        invoice=invoice,
                        partner=partner
                    )

                
                # Сохраняем позиции товаров
                for product in data['products']:
                    
                    product_id = product['id']
                    product_obj = Product.objects.get(pk=product_id)
                    quantity = product['selected_quantity']
                    sale_price = Decimal(product['selected_price'])
                     
                    purchase_price = Decimal(product['purchase_price'])
                    retail_price = Decimal(product['retail_price'])
                    wholesale_price = Decimal(product['wholesale_price'])
                    ic('tut')
                    profit = (Decimal(sale_price) - Decimal(purchase_price)) * Decimal(quantity)
                    
                    conversion_factor = 1
                    units = product['units']
                    for u in units:
                        if u['is_default_for_sale']:
                            conversion_factor = Decimal(u['conversion_factor'])
                            
                    minus_to_stock = conversion_factor * Decimal(quantity)
                    ic(minus_to_stock)
                    wp = WarehouseProduct.objects.get(warehouse=warehouse, product=product_obj)
                    wp.quantity -= Decimal(minus_to_stock)
                    wp.save()
                    
                    

                    if withPosting:
                        partner.balance -= Decimal(sale_price * quantity) 
                        for rule in rules:
                            if rule.amount_type == 'revenue': # Выручка (12)
                                revenue_price = Decimal(sale_price * quantity)
                                Entry.objects.create(
                                    transaction=transaction_obj,
                                    account=rule.debit_account,
                                    product=product_obj,
                                    warehouse=warehouse,
                                    debit=revenue_price,
                                )
                                
                                Entry.objects.create(
                                    transaction=transaction_obj,
                                    account=rule.credit_account,
                                    product=product_obj,
                                    warehouse=warehouse,
                                    credit=revenue_price
                                )
                                
                            elif rule.amount_type == 'profit': # прибыль (12)
                                profit_price = Decimal((sale_price - purchase_price) * quantity)
                                Entry.objects.create(
                                    transaction=transaction_obj,
                                    account=rule.debit_account,
                                    product=product_obj,
                                    warehouse=warehouse,
                                    debit=profit_price,
                                )
                                
                                Entry.objects.create(
                                    transaction=transaction_obj,
                                    account=rule.credit_account,
                                    product=product_obj,
                                    warehouse=warehouse,
                                    credit=profit_price
                                )
                            
            
                    SalesInvoiceItem.objects.create(
                        invoice=invoice,
                        product=product_obj,
                        quantity=quantity,
                        sale_price=sale_price,
                        purchase_price=purchase_price,
                        retail_price=retail_price,
                        wholesale_price=wholesale_price,
                    )
                
    

                for product in data['gifts']:
                    product_id = product['gift_product']
                    
                    product_obj = Product.objects.get(pk=product_id)
                    quantity = Decimal(product['selected_quantity'])
                    sale_price = 0
                    
                    conversion_factor = 1
                    units = product['units']
                    for u in units:
                        if u['is_default_for_sale']:
                            conversion_factor = Decimal(u['conversion_factor'])
                            
                    minus_to_stock = conversion_factor * quantity
                    ic(minus_to_stock)
                    wp = WarehouseProduct.objects.get(warehouse=warehouse, product=product_obj)
                    wp.quantity -= Decimal(minus_to_stock)
                    wp.save()

               
      
                    SalesInvoiceItem.objects.create(
                        invoice=invoice,
                        product=product_obj,
                        quantity=quantity,
                        sale_price=sale_price,
                        is_gift=True
                    )
                if withPosting:
                    partner.save()
                serializer = self.get_serializer(invoice)
                # 1/0
                # return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response({'detail': 'successSave', "invoice_id": invoice.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            ic(e)
            return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                withPosting = data['withPosting']
                comment = data['comment'] if data['comment'] != None else ''
  
                invoice_id = self.kwargs.get('pk')
                invoice = SalesInvoice.objects.get(pk=invoice_id)
                
                
                # nado wernut na sklad wse pered update, chtoby zatem snowa wzyat is sklada s nowymi dannymi
                for i in invoice.items.all():
                    product_last_obj = i.product
                    quantity_last = i.quantity
                    sale_price_last = i.sale_price
                    is_gift_last = i.is_gift

                    purchase_price_last = i.purchase_price
                    retail_price_last = i.retail_price
                    wholesale_price_last = i.wholesale_price
                    
                    ic(product_last_obj)
                    ic(quantity_last)
                    ic(sale_price_last)
                    ic(is_gift_last)
                    ic(purchase_price_last)
                    ic(retail_price_last)
                    ic(wholesale_price_last)
                    
                    
                    units_last = ProductUnit.objects.filter(product=product_last_obj)
                    conversion_factor_last = 1
                    if units_last.exists():
                        for u in units_last:
                            if u.is_default_for_sale:
                                conversion_factor_last = Decimal(u.conversion_factor)
                            
                    minus_to_stock_last = conversion_factor_last * Decimal(quantity_last)
                    wp = WarehouseProduct.objects.get(warehouse=invoice.warehouse, product=product_last_obj)
                    wp.quantity += Decimal(minus_to_stock_last)
                    wp.save()
                
                if invoice.isEntry:  
                    return Response({'detail': 'alreadyPosted'}, status=status.HTTP_400_BAD_REQUEST)
                
                invoice.total_amount = Decimal(data['footerTotalPrice'])
                invoice.note = data['comment']
                invoice.type_price = data['priceType']
                invoice.isEntry = data['withPosting']
                
                


                invoice_date_str = data.get('invoice_date')
                
                if invoice_date_str:
                    try:
                        date_part = datetime.strptime(invoice_date_str, '%Y-%m-%d').date()
                        time_part = datetime.now().time()
                        invoice_date = datetime.combine(date_part, time_part)
                    except ValueError:
                        return Response({'detail': 'errorDate'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'detail': 'errorDate'}, status=status.HTTP_400_BAD_REQUEST)
                
                invoice.invoice_date = invoice_date
                
                ic(data['partner']['id'])
                try:
                    partner = Partner.objects.get(pk=data['partner']['id'])
                    
                    invoice.buyer = partner
                    
                    if withPosting:
                        if partner.type != "klient" and partner.type != "both" and partner.type != "founder":
                            return Response({'detail': 'CantBeSaleForSupplier'}, status=status.HTTP_400_BAD_REQUEST)
                        
                        # accounts = partner.partner_accounts.all()  # вернёт список PartnerAccount
                        # founder = False
                        # for pa in accounts:
                        #     if pa.account.number == "75":
                        #         founder = True
                        #         break
                            
                        # total_profit = data['footerTotalPriceProfit']
                        
                except:
                    invoice.buyer = None
                    if withPosting:
                        ic('tut')
                        return Response({'detail': 'chooseClient'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    

                try:
                    delivered_by = Employee.objects.get(pk=data['awto']['id'])
                    invoice.delivered_by = delivered_by
                except:
                    invoice.delivered_by = None
                    if withPosting:
                        return Response({'detail': 'chooseAwto'}, status=status.HTTP_400_BAD_REQUEST)

                warehouse_id = data.get('warehouses', {}).get('id')
                if not warehouse_id:
                    return Response({'detail': 'youNeedSelectWarehouse'}, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    warehouse = Warehouse.objects.get(pk=warehouse_id)
                except:
                    return Response({'detail': 'youNeedSelectWarehouse'}, status=status.HTTP_400_BAD_REQUEST)
                
                invoice.warehouse = warehouse

                invoice.save()

                # Удаляем старые позиции
                invoice.items.all().delete()
                
                if withPosting:
                    operation = Operation.objects.get(code="sale")  

                    # Ищем правило проводки
                    rules = CustomePostingRule.objects.filter(operation=operation, directory_type=partner.type)
        
                    if not rules:
                        return Response({'detail': 'NoPostingRuleFound'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    transaction_obj = Transaction.objects.create(
                        description=comment,
                        invoice=invoice,
                        partner=partner
                    )

                # Добавляем заново товары
                for product in data['products']:
                    product_id = product['id']
                    product_obj = Product.objects.get(pk=product_id)
                    quantity = Decimal(product['selected_quantity'])
                    sale_price = Decimal(product['selected_price'])
                    
                    
           

                  
                    purchase_price = Decimal(product['purchase_price'])
                    retail_price = Decimal(product['retail_price'])
                    wholesale_price = Decimal(product['wholesale_price'])
                    
                    conversion_factor = 1
                    units = product['units']
                    for u in units:
                        if u['is_default_for_sale']:
                            conversion_factor = Decimal(u['conversion_factor'])
                            
                    minus_to_stock = conversion_factor * Decimal(quantity)
                    ic(minus_to_stock)
                    wp = WarehouseProduct.objects.get(warehouse=warehouse, product=product_obj)
                    wp.quantity -= Decimal(minus_to_stock)
                    wp.save()
                    
                    SalesInvoiceItem.objects.create(
                        invoice=invoice,
                        product=product_obj,
                        quantity=quantity,
                        sale_price=sale_price,
                        purchase_price=purchase_price,
                        retail_price=retail_price,
                        wholesale_price=wholesale_price,
                    )
                    
                    if withPosting:  
                        partner.balance -= Decimal(sale_price * quantity) 
                        for rule in rules:
                            if rule.amount_type == 'revenue': # Выручка (12)
                                revenue_price = Decimal(sale_price * quantity)
                                Entry.objects.create(
                                    transaction=transaction_obj,
                                    account=rule.debit_account,
                                    product=product_obj,
                                    warehouse=warehouse,
                                    debit=revenue_price,
                                )
                                
                                Entry.objects.create(
                                    transaction=transaction_obj,
                                    account=rule.credit_account,
                                    product=product_obj,
                                    warehouse=warehouse,
                                    credit=revenue_price
                                )
                                
                            elif rule.amount_type == 'profit': # прибыль (12)
                             
                                profit_price = Decimal((sale_price - purchase_price) * quantity)
                                Entry.objects.create(
                                    transaction=transaction_obj,
                                    account=rule.debit_account,
                                    product=product_obj,
                                    warehouse=warehouse,
                                    debit=profit_price,
                                )
                                
                                Entry.objects.create(
                                    transaction=transaction_obj,
                                    account=rule.credit_account,
                                    product=product_obj,
                                    warehouse=warehouse,
                                    credit=profit_price
                                )
            

                # Подарки
                for product in data['gifts']:
                    product_id = product['id']
                    product_obj = Product.objects.get(pk=product_id)
                    quantity = Decimal(product['selected_quantity']) 
                    
                    conversion_factor = 1
                    units = product['units']
                    for u in units:
                        if u['is_default_for_sale']:
                            conversion_factor = Decimal(u['conversion_factor'])
                            
                    minus_to_stock = conversion_factor * quantity
                    ic(minus_to_stock)
                    wp = WarehouseProduct.objects.get(warehouse=warehouse, product=product_obj)
                    wp.quantity -= Decimal(minus_to_stock)
                    wp.save()
                    
                    
                    SalesInvoiceItem.objects.create(
                        invoice=invoice,
                        product=product_obj,
                        quantity=quantity,
                        sale_price=Decimal(0),
                        is_gift=True
                    )
                    
                if withPosting:
                    partner.save()
                return Response({'detail': 'successSave'}, status=status.HTTP_200_OK)
        except Exception as e:
            ic(e)
            return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)

            

