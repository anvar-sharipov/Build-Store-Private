from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from ..models import Partner, Invoice, Transaction, Entry, Account, Warehouse, FreeItemForInvoiceItem, UnitForInvoiceItem, Product, UnitOfMeasurement, Employee, ProductUnit, ProductImage, InvoiceItem
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict
from django.db.models import Sum, F, Q, Case, When, Value, IntegerField
from django.http import JsonResponse
from icecream import ic
from django.db import transaction as db_transaction
import pandas as pd
from datetime import date




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_product_for_zakaz_input_search(request):
    q = request.GET.get("q", "").strip()  # получаем поисковый запрос
    w = request.GET.get("w", "").strip()  # получаем поисковый запрос
    data = []

    if q and w:
        # Фильтруем продукты по имени, игнорируя регистр
        products = (
            Product.objects
            .filter(name__icontains=q, warehouse_products__warehouse_id=w)
            .annotate(
                exact_match=Case(
                    When(name__iexact=q, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                ),
                warehouse_quantity=Sum(
                    "warehouse_products__quantity",
                    filter=Q(warehouse_products__warehouse_id=w),
                ),
            )
            .select_related("base_unit")                     # FK
            .prefetch_related(
                "images",
                "units__unit",                               # ProductUnit → Unit
            )
            .order_by("exact_match", "name").distinct()[:20]
        )

        
        for p in products:
            image_obj = p.images.first()

            conversion_factor = 1
            unit_name = p.base_unit.name if p.base_unit else None

            default_unit = p.units.filter(is_default_for_sale=True).first()

            if default_unit:
                
                conversion_factor = int(default_unit.conversion_factor)
                ic(conversion_factor)
                unit_name = default_unit.unit.name
            if p.warehouse_quantity != 0:
                quantity = p.warehouse_quantity / conversion_factor 
            else:
                quantity = 0
            data.append({
                "id": p.id,
                "name": p.name,
                "image": image_obj.image.url if image_obj else None,
                "unit": unit_name,
                "conversion_factor": conversion_factor,
                "quantity_in_warehouse": quantity,
                "purchase_price": p.purchase_price,
                "selected_price": p.purchase_price,
                "weight": p.weight,
                "volume": p.volume
            })
            

    return JsonResponse(data, safe=False)