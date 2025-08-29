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
# from django.db.models import F, Count
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


class PartnerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Partner.objects.all().order_by('-pk')
    serializer_class = PartnerSerializer
    pagination_class = CustomPageNumberPagination
    # filter_backends = [filters.SearchFilter]
    # search_fields = ['name']
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PartnerFilter
    ordering_fields = ['balance']  # 👈 укажи разрешённые поля для сортировки
    ordering = ['-pk']  # 👈 сортировка по умолчанию

    def get_permissions(self):
        return [IsInAdminOrWarehouseGroup()]
    
    


    def paginate_queryset(self, queryset):
        ic('tut2222')        
        """
        Если в query-параметрах есть ?no_pagination=1, 
        то отключаем пагинацию и отдаём весь queryset.
        """
        if self.request.query_params.get('no_pagination') == '1':
            return None
        return super().paginate_queryset(queryset)

    # def get_queryset(self):
    #     queryset = super().get_queryset()
    #     agent_id = self.request.query_params.get('agent_id')
    #     search = self.request.query_params.get('search')

    #     if agent_id:
    #         queryset = queryset.filter(agent_id=agent_id)

    #     if search:
    #         # Добавляем аннотацию с похожестью
    #         queryset = queryset.annotate(
    #             similarity=TrigramSimilarity('name', search),
    #         ).filter(similarity__gt=0.1)  # порог — настроить по желанию

    #         # Сортируем по убыванию похожести
    #         queryset = queryset.order_by('-similarity', '-pk')

    #     return queryset
    
    
    def create(self, request, *args, **kwargs):
        ic('tut5')
        # time.sleep(2)
        try:
            with transaction.atomic():
                data = request.data
                ic('tut3')
                agent = data['agent']
                ic('tut4')
                balance = data['balance']
                is_active = data['is_active']
                name = data['name']
                partner_type  = data['type']
                # accounts_id = data['accounts_id']
                
                ic(data)
                
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
                
                # Можно добавить проверку на отрицательное значение, если нужно
                if balance_value < 0:
                    return Response({'detail': 'balanceNegative'}, status=status.HTTP_400_BAD_REQUEST)
                ic('tut1')
                agent_obj = Agent.objects.get(id=agent["id"]) if agent else None
                ic('tut2')
            
                partner = Partner.objects.create(
                    name=name,
                    balance=balance_value,
                    is_active=is_active,
                    type=partner_type ,
                    agent=agent_obj
                )
                
                # if accounts_id:
                #     for acc in accounts_id:
                #         a = Account.objects.get(id=acc['id'])
                #         PartnerAccount.objects.create(
                #             partner=partner,
                #             account=a,
                #             role=partner_type
                #         )
                                
                # return Response({"message": "данные получены"}, status=200)
                serializer = PartnerSerializer(partner)
                return Response({'detail': 'successSave', "partner_id": partner.id, 'partner': serializer.data}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            ic(e)
            return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    def update(self, request, *args, **kwargs):
        # time.sleep(2)
        try:
            with transaction.atomic():
                data = request.data
                partner_id = data.get("id")
                agent = data.get("agent")
                balance = data.get("balance")
                is_active = data.get("is_active")
                name = data.get("name")
                partner_type = data.get("type")
                # accounts_id = data.get("accounts_id")

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

                if balance_value < 0:
                    return Response({'detail': 'balanceNegative'}, status=status.HTTP_400_BAD_REQUEST)

                # Проверка на дубликат имени
                if Partner.objects.filter(name=name).exclude(id=partner_id).exists():
                    return Response({'detail': 'alreadyHavePartner'}, status=status.HTTP_400_BAD_REQUEST)

                # Обновляем партнёра
                partner.name = name
                partner.balance = balance_value
                partner.is_active = is_active
                partner.type = partner_type
                partner.agent = Agent.objects.get(id=agent["id"]) if agent else None
                partner.save()

                # # Обновим аккаунты
                # PartnerAccount.objects.filter(partner=partner).delete()
                # if accounts_id:
                #     for acc in accounts_id:
                #         a = Account.objects.get(id=acc['id'])
                #         PartnerAccount.objects.create(
                #             partner=partner,
                #             account=a,
                #             role=partner_type
                #         )
                serializer = PartnerSerializer(partner)
                return Response({'detail': 'successUpdated', 'partner': serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            ic(e)
            return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)
            
        
    
    
    
    
        

        # serializer = self.get_serializer(data=data)
        # serializer.is_valid(raise_exception=True)
        # partner = serializer.save()

        # return Response(serializer.data, status=status.HTTP_201_CREATED)

    # def destroy(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     # time.sleep(2)
    #     self.perform_destroy(instance)
    #     return Response(
    #         {"message": "partnerDeleted"},
    #         status=status.HTTP_204_NO_CONTENT
    #     )
    

    # def update(self, request, *args, **kwargs):
    #     # time.sleep(2)
    #     partial = kwargs.pop('partial', False)
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=request.data, partial=partial)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)
    #     return Response(serializer.data) # res.data
    


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
            