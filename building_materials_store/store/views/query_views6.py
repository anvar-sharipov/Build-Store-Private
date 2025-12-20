from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from ..models import Partner, Invoice, Transaction, Entry, Account, Warehouse, FreeItemForInvoiceItem, UnitForInvoiceItem, Product, UnitOfMeasurement, Employee, ProductUnit, ProductImage, InvoiceItem
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict
from django.db.models import Sum, F, Q
from django.http import JsonResponse
from icecream import ic
from django.db import transaction as db_transaction
import pandas as pd
from datetime import date



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_product_for_zakaz_input_search(request):
    q = request.GET.get("q", "").strip()  # получаем поисковый запрос
    data = []

    if q:
        # Фильтруем продукты по имени, игнорируя регистр
        products = Product.objects.filter(name__icontains=q)[:20]  # лимит 20 для оптимизации
        data = [{"id": p.id, "name": p.name} for p in products]

    return JsonResponse(data, safe=False)