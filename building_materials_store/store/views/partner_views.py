# from django.shortcuts import render
# import time
# from django.http import HttpResponse
# import openpyxl
# from openpyxl.utils import get_column_letter
# from icecream import ic
# from rest_framework.decorators import action
# from rest_framework.filters import OrderingFilter
# from collections import OrderedDict
from collections import defaultdict


from rest_framework import viewsets, status
from .. models import *
# from .serializers import *

from .. serializers.base_serializers import *
from .. serializers.entry_serializers import *
from .. serializers.partner_serializers import *
from .. serializers.product_serializers import *
from .. serializers.purchase_invoice_serializers import *
from .. serializers.register_serializers import *
from .. serializers.sale_invoice_serializers import *

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, action

from rest_framework.decorators import api_view, permission_classes
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
# from django.db import transaction
# from datetime import datetime

# from rest_framework.pagination import PageNumberPagination

from . base_views import IsInAdminOrWarehouseGroup

class PartnerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Partner.objects.all().order_by('-pk')
    serializer_class = PartnerSerializer

    def get_permissions(self):
        return [IsInAdminOrWarehouseGroup()]

    def get_queryset(self):
        queryset = super().get_queryset()
        agent_id = self.request.query_params.get('agent_id')
        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # time.sleep(2)
        self.perform_destroy(instance)
        return Response(
            {"message": "partnerDeleted"},
            status=status.HTTP_204_NO_CONTENT
        )
    

    def update(self, request, *args, **kwargs):
        # time.sleep(2)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data) # res.data
    


class PartnerEntriesView(APIView):
    def get(self, request, partner_id):
        entries = Entry.objects.filter(
            transaction__partner_id=partner_id,
            # account__number__startswith='62.'
            account__number='62'
        ).order_by('account__currency__code', 'transaction__date', 'id')

        grouped = defaultdict(list)
        balances = defaultdict(lambda: Decimal('0.00'))

        for entry in entries:
            currency = entry.account.currency.code
            debit = Decimal(entry.debit or '0')
            credit = Decimal(entry.credit or '0')

            balances[currency] += debit - credit

            data = EntrySerializer(entry).data
            data['running_balance'] = str(balances[currency])
            grouped[currency].append(data)

        result = []
        for currency_code, items in grouped.items():
            result.append({
                'currency': currency_code,
                'entries': items,
                'final_balance': str(balances[currency_code])
            })
        print('result', result)
        return Response(result)
    