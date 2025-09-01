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
from rest_framework.exceptions import APIException


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
    
    
    

class RuleError(APIException):
    status_code = 404
    default_detail = "Rule error"
    default_code = "rule_error"
@api_view(['POST'])
def partner_transaction(request):

    data = request.data  # JSON из фронтенда уже распарсен
    # time.sleep(2)

    partner = data.get('partner', {})
    amount = data.get('amount')
    comment = data.get('comment')
    
    if not partner:
        return Response({'detail': 'youNeedSelectPartner'}, status=status.HTTP_400_BAD_REQUEST)
    
    
    if not amount:
        return Response({'detail': 'writeAmount'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        amount = Decimal(amount)
    except:
        return Response({'detail': 'amount must be a digit'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not comment:
        return Response({'detail': 'writeComment'}, status=status.HTTP_400_BAD_REQUEST)
    
  
    try:
        partner_obj = Partner.objects.get(id=partner.get('id'))
    except (Partner.DoesNotExist):
        return Response({'detail': 'Partner not found'}, status=status.HTTP_404_NOT_FOUND)
    

    if "type" not in data:
        return Response({'detail': 'choose one of type of pays income or expense'}, status=status.HTTP_404_NOT_FOUND)
    
    if data["partner"]["type"] not in ["founder", "klient"]:
        return Response({'detail': 'choose founder or client'}, status=status.HTTP_404_NOT_FOUND)
    
    rules = CustomePostingRule.objects.filter(operation__code="pays", pays_type=data['type'], directory_type=data["partner"]["type"])
    if not rules:
        return Response({'detail': 'create rule for pays'}, status=status.HTTP_404_NOT_FOUND)
        
    
    try:
        with transaction.atomic():
            ic("da income GGGGG", data)

            trasnaction_obj = Transaction.objects.create(description=data["comment"], partner=partner_obj)
            for rule in rules:
                
                if not rule.debit_account:
                    raise RuleError("dont have account debit in entry rule")
                Entry.objects.create(transaction=trasnaction_obj, account=rule.debit_account, debit=amount)
            
                if not rule.credit_account:
                    raise RuleError("dont have account credit in entry rule")
                Entry.objects.create(transaction=trasnaction_obj, account=rule.credit_account, credit=amount)
      
            if data['type'] == 'income':
                partner_obj.balance += amount
            elif data['type'] == 'expense':
                partner_obj.balance -= amount
            else:
                raise RuleError("choose one of type of pays income or expense")
                
            partner_obj.save()
                
            # 1/0
    except RuleError as e:
        return Response({'detail': str(e)}, status=e.status_code)
    except Exception as e:
        return Response({'detail': 'transactionChange'}, status=status.HTTP_400_BAD_REQUEST)
    
    partnerSerializer = PartnerSerializer(partner_obj)
    return Response({'detail': 'successPay', "partner": partnerSerializer.data}, status=status.HTTP_200_OK)
    
