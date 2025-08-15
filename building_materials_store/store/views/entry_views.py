# from django.shortcuts import render
import time
# from django.http import HttpResponse
# import openpyxl
# from openpyxl.utils import get_column_letter
from icecream import ic
# from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
# from collections import OrderedDict
# from collections import defaultdict

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


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
# from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated, SAFE_METHODS
# from rest_framework.decorators import action

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import render, get_object_or_404
# from rest_framework.generics import CreateAPIView
from django_filters.rest_framework import DjangoFilterBackend
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
# from datetime import datetime

# from rest_framework.pagination import PageNumberPagination



class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer



class EntryViewSet(viewsets.ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'account': ['exact'],
        'transaction__date': ['gte', 'lte'],
    }


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-date')
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'partner': ['exact'],
        'date': ['gte', 'lte'],
    }

    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionWriteSerializer
        return TransactionSerializer
    
    
    


@api_view(['POST'])
def partner_transaction(request):
    data = request.data  # JSON из фронтенда уже распарсен
    time.sleep(2)

    partner = data.get('partner', {})
    debet = data.get('debet', {})
    kredit = data.get('kredit', {})
    amount = data.get('amount')
    comment = data.get('comment')
    
    if not partner:
        return Response({'detail': 'youNeedSelectPartner'}, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    if not debet:
        return Response({'detail': 'youNeedSelectdebet'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not kredit:
        return Response({'detail': 'youNeedSelectkredit'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not amount:
        return Response({'detail': 'writeAmount'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not comment:
        return Response({'detail': 'writeComment'}, status=status.HTTP_400_BAD_REQUEST)
    
  
    try:
        partner_obj = Partner.objects.get(id=partner.get('id'))
        debet_obj = Account.objects.get(id=debet.get('id'))
        kredit_obj = Account.objects.get(id=kredit.get('id'))
    except (Partner.DoesNotExist, Account.DoesNotExist):
        return Response({'detail': 'Account or Partner not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
    if debet_obj.number != "75" and debet_obj.number != "60" and kredit_obj.number != "75" and kredit_obj.number != "60":
        return Response({'detail': 'choose75Or60Account'}, status=status.HTTP_404_NOT_FOUND)
        
    
    
    

    try:
        with transaction.atomic():
            transaction_obj = Transaction.objects.create(
                description=comment,
                partner=partner_obj
            )
            
            Entry.objects.create(
                transaction=transaction_obj,
                account=debet_obj,
                debit=Decimal(amount),
                credit=Decimal('0.00')
                )
            
            Entry.objects.create(
                transaction=transaction_obj,
                account=kredit_obj,
                debit=Decimal('0.00'),
                credit=Decimal(amount)
                )
            
            # if kredit_obj.number == "75" or kredit_obj.number == "60":
            #     partner_obj.balance -= Decimal(amount)
            #     partner_obj.save()
                
            # if debet_obj.number == "75" or debet_obj.number == "60":
            #     partner_obj.balance += Decimal(amount)
            #     partner_obj.save()
            
            if kredit_obj.number in ["75", "60"]:
                partner_obj.balance -= Decimal(amount)  # кредит уменьшает долг
            elif debet_obj.number in ["75", "60"]:
                partner_obj.balance += Decimal(amount)  # дебет увеличивает долг
            
            # return Response({"message": "данные получены"}, status=200)
            partner_data = {
                "id": partner_obj.id,
                "name": partner_obj.name,
                "balance": str(partner_obj.balance),  # отправляем как строку, чтобы не было проблем с Decimal
                "type": partner_obj.type,
            }
            return Response({'detail': 'successSave', 'partner': partner_data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        ic(e)
        return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)

    # # Тут можно добавить валидацию данных
    # if not all([partner_id, debet_id, kredit_id, amount]):
    #     return Response({"error": "Некоторые поля отсутствуют"}, status=status.HTTP_400_BAD_REQUEST)

    # # Пример: создание записи в модели Transaction (предположим, есть такая модель)

    # try:
    #     partner = Partner.objects.get(id=partner_id)
    #     debet_account = Account.objects.get(id=debet_id)
    #     kredit_account = Account.objects.get(id=kredit_id)
        
    #     transaction = Transaction.objects.create(
    #         partner=partner,
    #         debet=debet_account,
    #         kredit=kredit_account,
    #         amount=amount,
    #         comment=comment
    #     )

    #     return Response({"success": True, "transaction_id": transaction.id})

    # except Partner.DoesNotExist:
    #     return Response({"error": "Partner not found"}, status=status.HTTP_404_NOT_FOUND)
    # except Account.DoesNotExist:
    #     return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)