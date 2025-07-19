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
# from datetime import datetime

# from rest_framework.pagination import PageNumberPagination

# from . base_views import IsInAdminOrWarehouseGroup, CustomPageNumberPagination



class PurchaseInvoiceViewSet(viewsets.ModelViewSet):
    queryset = PurchaseInvoice.objects.all()  # ОБЯЗАТЕЛЬНО добавить!
    serializer_class = PurchaseInvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PurchaseInvoice.objects.select_related(
            'supplier', 'created_by', 'canceled_by'
        ).prefetch_related('items__product').all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @transaction.atomic
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        invoice = self.get_object()
        if invoice.is_canceled:
            return Response({'detail': 'Накладная уже отменена'}, status=status.HTTP_400_BAD_REQUEST)
        reason = request.data.get('cancel_reason')
        if not reason:
            return Response({'cancel_reason': 'Это поле обязательно'}, status=status.HTTP_400_BAD_REQUEST)

        invoice.is_canceled = True
        invoice.canceled_at = timezone.now()
        invoice.cancel_reason = reason
        invoice.canceled_by = request.user
        invoice.save()

        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
    

class PurchaseReturnInvoiceViewSet(viewsets.ModelViewSet):
    queryset = PurchaseReturnInvoice.objects.all()  # ОБЯЗАТЕЛЬНО
    serializer_class = PurchaseReturnInvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PurchaseReturnInvoice.objects.select_related(
            'original_invoice', 'created_by'
        ).prefetch_related('items__product').all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)