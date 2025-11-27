# from django.shortcuts import render
import time
# from django.http import HttpResponse
# import openpyxl
# from openpyxl.utils import get_column_letter
# from icecream import ic
# from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
# from collections import OrderedDict
from collections import defaultdict
from icecream import ic
from decimal import Decimal, InvalidOperation


from rest_framework import viewsets, status

from store.filters import PartnerFilter
from .. models import *
# from .serializers import *

from .. serializers.base_serializers import *
from .. serializers.entry_serializers import *
from .. serializers.partner_serializers import *
from .. serializers.product_serializers import *
from .. serializers.register_serializers import *
from .. serializers.sale_invoice_serializers import *

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, action

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import filters
from django.db.models import Value
from django.db.models.functions import Greatest
# from django.shortcuts import render, get_object_or_404
# from rest_framework.generics import CreateAPIView
from django_filters.rest_framework import DjangoFilterBackend
# from .. filters import ProductFilter
# from django.views.decorators.http import require_GET
# from django.http import JsonResponse
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Q, Sum
# from django.utils.dateparse import parse_datetime, parse_date
from django.db.models import Sum, Case, When, Value, F
from django.db.models.functions import Coalesce
# from openpyxl.styles import Font
# from rest_framework.exceptions import PermissionDenied
from django.db import transaction
# from datetime import datetime

# from rest_framework.pagination import PageNumberPagination
from . base_views import IsInAdminOrWarehouseGroup, CustomPageNumberPagination


# class PartnerNoPaginationViewSet(viewsets.ModelViewSet):
#     queryset = Partner.objects.all()
#     serializer_class = PartnerSerializer
#     pagination_class = None

# kod rabochiy no usd i tmt balance po polyam sortiruyutsya i pokazuwayut tut , a ne po prowodkam
# class PartnerViewSet(viewsets.ModelViewSet):
#     permission_classes = [IsAuthenticated]
#     queryset = Partner.objects.all()
#     serializer_class = PartnerSerializer
#     pagination_class = CustomPageNumberPagination
#     filter_backends = [DjangoFilterBackend]
#     filterset_class = PartnerFilter

#     def get_permissions(self):
#         return [IsInAdminOrWarehouseGroup()]

#     def paginate_queryset(self, queryset):
#         """
#         Если в query-параметрах есть ?no_pagination=1, то отключаем пагинацию и отдаём весь queryset.
#         """
#         if self.request.query_params.get('no_pagination') == '1':
#             return None
#         return super().paginate_queryset(queryset)
    
#     def get_queryset(self):
#         """
#         Применяем фильтрацию и сортировку
#         """
#         queryset = super().get_queryset()
        
#         # Сначала применяем фильтры через DjangoFilterBackend
#         queryset = self.filter_queryset(queryset)
        
#         # Затем применяем сортировку
#         sort_value = self.request.query_params.get('sort', 'desc')
        
#         sort_map = {
#             'asc': 'pk',
#             'desc': '-pk',
#             'balance_tmt_asc': 'balance_tmt',
#             'balance_tmt_desc': '-balance_tmt',
#             'balance_usd_asc': 'balance_usd',
#             'balance_usd_desc': '-balance_usd',
#         }
        
#         order_field = sort_map.get(sort_value, '-pk')
#         queryset = queryset.order_by(order_field)
        
#         return queryset
    
#     def list(self, request, *args, **kwargs):
#         """
#         Переопределяем list для корректной работы сортировки
#         """
#         queryset = self.get_queryset()
        
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)

#     def create(self, request, *args, **kwargs):
#         try:
#             with transaction.atomic():
#                 data = request.data
#                 agent = data.get('agent')
#                 balance = data.get('balance')
#                 is_active = data.get('is_active')
#                 name = data.get('name')
#                 partner_type = data.get('type')

#                 if not name or not name.strip():
#                     return Response({'detail': 'errorName'}, status=status.HTTP_400_BAD_REQUEST)

#                 if balance is None:
#                     return Response({'detail': 'balanceMissing'}, status=status.HTTP_400_BAD_REQUEST)

#                 try:
#                     balance_value = Decimal(balance)
#                 except (InvalidOperation, TypeError):
#                     return Response({'detail': 'balanceInvalid'}, status=status.HTTP_400_BAD_REQUEST)

#                 if Partner.objects.filter(name=name).exists():
#                     return Response({'detail': 'alreadyHavePartner'}, status=status.HTTP_400_BAD_REQUEST)

#                 if balance_value < 0:
#                     return Response({'detail': 'balanceNegative'}, status=status.HTTP_400_BAD_REQUEST)

#                 agent_obj = Agent.objects.get(id=agent["id"]) if agent else None

#                 partner = Partner.objects.create(
#                     name=name,
#                     balance=balance_value,
#                     is_active=is_active,
#                     type=partner_type,
#                     agent=agent_obj
#                 )

#                 serializer = PartnerSerializer(partner)
#                 return Response({
#                     'detail': 'successSave',
#                     "partner_id": partner.id,
#                     'partner': serializer.data
#                 }, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             ic(e)
#             return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)

#     def update(self, request, *args, **kwargs):
#         try:
#             with transaction.atomic():
#                 data = request.data
#                 partner_id = data.get("id")
#                 agent = data.get("agent")
#                 balance = data.get("balance")
#                 is_active = data.get("is_active")
#                 name = data.get("name")
#                 partner_type = data.get("type")

#                 if not partner_id:
#                     return Response({'detail': 'missingPartnerId'}, status=status.HTTP_400_BAD_REQUEST)

#                 try:
#                     partner = Partner.objects.get(id=partner_id)
#                 except Partner.DoesNotExist:
#                     return Response({'detail': 'partnerNotFound'}, status=status.HTTP_404_NOT_FOUND)

#                 if not name or not name.strip():
#                     return Response({'detail': 'errorName'}, status=status.HTTP_400_BAD_REQUEST)

#                 if balance is None:
#                     return Response({'detail': 'balanceMissing'}, status=status.HTTP_400_BAD_REQUEST)

#                 try:
#                     balance_value = Decimal(balance)
#                 except (InvalidOperation, TypeError):
#                     return Response({'detail': 'balanceInvalid'}, status=status.HTTP_400_BAD_REQUEST)

#                 if Partner.objects.filter(name=name).exclude(id=partner_id).exists():
#                     return Response({'detail': 'alreadyHavePartner'}, status=status.HTTP_400_BAD_REQUEST)

#                 partner.name = name
#                 partner.balance = balance_value
#                 partner.is_active = is_active
#                 partner.type = partner_type
#                 partner.agent = Agent.objects.get(id=agent["id"]) if agent else None
#                 partner.save()

#                 serializer = PartnerSerializer(partner)
#                 return Response({
#                     'detail': 'successUpdated',
#                     'partner': serializer.data
#                 }, status=status.HTTP_200_OK)

#         except Exception as e:
#             ic(e)
#             return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)
        

      
      
from django.db.models import Sum, Case, When, Value, F, DecimalField
from django.db.models.functions import Coalesce
from decimal import Decimal

class PartnerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    pagination_class = CustomPageNumberPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PartnerFilter

    def get_permissions(self):
        return [IsInAdminOrWarehouseGroup()]

    def paginate_queryset(self, queryset):
        
        if self.request.query_params.get('no_pagination') == '1':
            return None
        return super().paginate_queryset(queryset)
    
    # def get_queryset(self):
    #     """
    #     Применяем фильтрацию и сортировку с аннотацией вычисляемых балансов
    #     """
    #     queryset = super().get_queryset().order_by("-name")
        
    #     # Сначала применяем фильтры через DjangoFilterBackend
    #     queryset = self.filter_queryset(queryset)
        
    #     # ВСЕГДА добавляем аннотации балансов (для сортировки и сериализатора)
    #     queryset = queryset.annotate(
    #         computed_balance_usd=Coalesce(
    #             Sum(
    #                 Case(
    #                     When(
    #                         transaction__entries__account__number__in=['60', '75'],
    #                         then=F('transaction__entries__debit') - F('transaction__entries__credit')
    #                     ),
    #                     default=Value(0),
    #                     output_field=DecimalField(max_digits=12, decimal_places=2)  # ← ДОБАВЛЕНО
    #                 ),
    #                 output_field=DecimalField(max_digits=12, decimal_places=2)  # ← ДОБАВЛЕНО
    #             ),
    #             Value(0, output_field=DecimalField(max_digits=12, decimal_places=2))  # ← ДОБАВЛЕНО
    #         ),
    #         computed_balance_tmt=Coalesce(
    #             Sum(
    #                 Case(
    #                     When(
    #                         transaction__entries__account__number__in=['62', '76'],
    #                         then=F('transaction__entries__debit') - F('transaction__entries__credit')
    #                     ),
    #                     default=Value(0),
    #                     output_field=DecimalField(max_digits=12, decimal_places=2)  # ← ДОБАВЛЕНО
    #                 ),
    #                 output_field=DecimalField(max_digits=12, decimal_places=2)  # ← ДОБАВЛЕНО
    #             ),
    #             Value(0, output_field=DecimalField(max_digits=12, decimal_places=2))  # ← ДОБАВЛЕНО
    #         )
    #     ).prefetch_related('transaction_set__entries__account')
        
    #     # Затем применяем сортировку
    #     sort_value = self.request.query_params.get('sort', 'desc')
        
    #     # Обновляем карту сортировки для вычисляемых полей
    #     sort_map = {
    #         'balance_tmt_asc': 'computed_balance_tmt',
    #         'balance_tmt_desc': '-computed_balance_tmt',
    #         'balance_usd_asc': 'computed_balance_usd',
    #         'balance_usd_desc': '-computed_balance_usd',
    #         'asc': 'pk',
    #         'desc': '-pk',
    #     }
        
    #     order_field = sort_map.get(sort_value, '-pk')
    #     queryset = queryset.order_by(order_field)
        
    #     return queryset
    
    def get_queryset(self):
        """
        Применяем фильтрацию и сортировку с аннотацией вычисляемых балансов
        """
        # 1. Базовый queryset без order_by
        queryset = super().get_queryset()

        # 2. Добавляем аннотации балансов
        queryset = queryset.annotate(
            computed_balance_usd=Coalesce(
                Sum(
                    Case(
                        When(
                            transaction__entries__account__number__in=['60', '75'],
                            then=F('transaction__entries__debit') - F('transaction__entries__credit')
                        ),
                        default=Value(0),
                        output_field=DecimalField(max_digits=12, decimal_places=2)
                    ),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                ),
                Value(0, output_field=DecimalField(max_digits=12, decimal_places=2))
            ),
            computed_balance_tmt=Coalesce(
                Sum(
                    Case(
                        When(
                            transaction__entries__account__number__in=['62', '76'],
                            then=F('transaction__entries__debit') - F('transaction__entries__credit')
                        ),
                        default=Value(0),
                        output_field=DecimalField(max_digits=12, decimal_places=2)
                    ),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                ),
                Value(0, output_field=DecimalField(max_digits=12, decimal_places=2))
            )
        ).prefetch_related('transaction_set__entries__account')

        # 3. Применяем фильтры через DjangoFilterBackend
        queryset = self.filter_queryset(queryset)

        # 4. Определяем сортировку
        sort_value = self.request.query_params.get('sort', None)

        sort_map = {
            'balance_tmt_asc': 'computed_balance_tmt',
            'balance_tmt_desc': '-computed_balance_tmt',
            'balance_usd_asc': 'computed_balance_usd',
            'balance_usd_desc': '-computed_balance_usd',
            'asc': 'pk',
            'desc': '-pk',
        }

        # Если сортировка не передана — сортировка по name по умолчанию
        order_field = sort_map.get(sort_value, 'name')
        queryset = queryset.order_by(order_field)

        return queryset

    
    def list(self, request, *args, **kwargs):
        """
        Переопределяем list для корректной работы сортировки
        """
        queryset = self.get_queryset()
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # Остальные методы create, update остаются без изменений
    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                agent = data.get('agent')
                balance = data.get('balance')
                is_active = data.get('is_active')
                name = data.get('name')
                partner_type = data.get('type')

                if not name or not name.strip():
                    return Response({'detail': 'errorName'}, status=status.HTTP_400_BAD_REQUEST)

                if balance is None:
                    return Response({'detail': 'balanceMissing'}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    balance_value = Decimal(balance)
                except (InvalidOperation, TypeError):
                    return Response({'detail': 'balanceInvalid'}, status=status.HTTP_400_BAD_REQUEST)

                if Partner.objects.filter(name=name).exists():
                    return Response({'detail': 'alreadyHavePartner'}, status=status.HTTP_400_BAD_REQUEST)

                if balance_value < 0:
                    return Response({'detail': 'balanceNegative'}, status=status.HTTP_400_BAD_REQUEST)

                agent_obj = Agent.objects.get(id=agent["id"]) if agent else None

                partner = Partner.objects.create(
                    name=name,
                    balance=balance_value,
                    is_active=is_active,
                    type=partner_type,
                    agent=agent_obj
                )

                serializer = PartnerSerializer(partner)
                return Response({
                    'detail': 'successSave',
                    "partner_id": partner.id,
                    'partner': serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            ic(e)
            return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                partner_id = data.get("id")
                agent = data.get("agent")
                balance = data.get("balance")
                is_active = data.get("is_active")
                name = data.get("name")
                partner_type = data.get("type")

                if not partner_id:
                    return Response({'detail': 'missingPartnerId'}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    partner = Partner.objects.get(id=partner_id)
                except Partner.DoesNotExist:
                    return Response({'detail': 'partnerNotFound'}, status=status.HTTP_404_NOT_FOUND)

                if not name or not name.strip():
                    return Response({'detail': 'errorName'}, status=status.HTTP_400_BAD_REQUEST)

                if balance is None:
                    return Response({'detail': 'balanceMissing'}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    balance_value = Decimal(balance)
                except (InvalidOperation, TypeError):
                    return Response({'detail': 'balanceInvalid'}, status=status.HTTP_400_BAD_REQUEST)

                if Partner.objects.filter(name=name).exclude(id=partner_id).exists():
                    return Response({'detail': 'alreadyHavePartner'}, status=status.HTTP_400_BAD_REQUEST)

                partner.name = name
                partner.balance = balance_value
                partner.is_active = is_active
                partner.type = partner_type
                partner.agent = Agent.objects.get(id=agent["id"]) if agent else None
                partner.save()

                serializer = PartnerSerializer(partner)
                return Response({
                    'detail': 'successUpdated',
                    'partner': serializer.data
                }, status=status.HTTP_200_OK)

        except Exception as e:
            ic(e)
            return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)
        
        
        
        
        
    
class PartnerEntriesView(APIView):
    def get(self, request, partner_id):
        entries = Entry.objects.filter(
            transaction__partner_id=partner_id,
            account__number='62'
        ).order_by('transaction__date', 'id')

        result = []
        running_balance = Decimal('0.00')

        for entry in entries:
            debit = Decimal(entry.debit or '0')
            credit = Decimal(entry.credit or '0')
            running_balance += debit - credit

            data = EntrySerializer(entry).data
            data['running_balance'] = str(running_balance)
            result.append(data)

        return Response({
            'entries': result,
            'final_balance': str(running_balance)
        })
            