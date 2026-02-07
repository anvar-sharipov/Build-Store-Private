# from django.shortcuts import render
# import time
# from django.http import HttpResponse
# import openpyxl
# from openpyxl.utils import get_column_letter
# from icecream import ic
# from rest_framework.decorators import action
# from rest_framework.filters import OrderingFilter
# from collections import OrderedDict
# from collections import defaultdict


# from rest_framework import viewsets, status, filters
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
# from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated, SAFE_METHODS
# from rest_framework.decorators import api_view, action

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import render, get_object_or_404
# from rest_framework.generics import CreateAPIView
# from django_filters.rest_framework import DjangoFilterBackend
# from .. filters import ProductFilter
from django.views.decorators.http import require_GET
from django.http import JsonResponse
# from django.contrib.postgres.search import TrigramSimilarity
# from django.db.models import Q
# from django.utils.dateparse import parse_datetime, parse_date
# from django.db.models import Sum, F, Count
# from openpyxl.styles import Font
# from rest_framework.exceptions import PermissionDenied
# from django.db import transaction
from datetime import datetime

# from rest_framework.pagination import PageNumberPagination

# from . base_views import IsInAdminOrWarehouseGroup, CustomPageNumberPagination


@require_GET
def check_name_unique(request):
    name = request.GET.get('name', '').strip()
    exists = Product.objects.filter(name__iexact=name).exists()
    return JsonResponse({'exists': exists})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sum_for_header(request):
    dateFrom = request.GET.get("dateFrom", "")
    dateTo = request.GET.get("dateTo", "")

    day_start = datetime.strptime(dateFrom, "%Y-%m-%d").date()
    day_end = datetime.strptime(dateTo, "%Y-%m-%d").date()
    
    # ===== КРЕДИТ 40.* =====
    credit_40 = (
        Entry.objects
        .filter(
            account__number__startswith="40",
            transaction__date__gte=day_start,
            transaction__date__lte=day_end,
        )
        .aggregate(total=Sum("credit"))["total"] or Decimal("0.00")
    )

    # ===== КРЕДИТ 42.* =====
    credit_42 = (
        Entry.objects
        .filter(
            account__number__startswith="42",
            transaction__date__gte=day_start,
            transaction__date__lte=day_end,
        )
        .aggregate(total=Sum("credit"))["total"] or Decimal("0.00")
    )

    # ===== ДЕБЕТ 50 =====
    debit_50 = (
        Entry.objects
        .filter(
            account__number="50",
            transaction__date__gte=day_start,
            transaction__date__lte=day_end,
        )
        .aggregate(total=Sum("debit"))["total"] or Decimal("0.00")
    )

    # ===== ДЕБЕТ 52 =====
    debit_52 = (
        Entry.objects
        .filter(
            account__number="52",
            transaction__date__gte=day_start,
            transaction__date__lte=day_end,
        )
        .aggregate(total=Sum("debit"))["total"] or Decimal("0.00")
    )

    data = {
        "credit_40": credit_40,
        "credit_42": credit_42,
        "debit_50": debit_50,
        "debit_52": debit_52,
    }
    
    

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_warehouse_id_and_currency(request):
    
    warehouses = Warehouse.objects.all()
    data = []
    
    for w in warehouses:
        d = {
            "warehouse_id": w.id,
            "currency_code": w.currency.code if w.currency else "",
            "currency_name": w.currency.name if w.currency else "",
        }
        data.append(d)
    
    
    
    return Response(data)
    




