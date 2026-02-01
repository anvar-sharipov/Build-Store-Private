# from decimal import Decimal, ROUND_HALF_UP
# from datetime import datetime
# from ..models import Product, Zakaz, ZakazItem, Warehouse, Partner
# from rest_framework.response import Response
# from django.views.decorators.csrf import csrf_exempt
# from collections import defaultdict
# from django.db.models import Sum, F, Q, Case, When, Value, IntegerField
# from django.http import JsonResponse
# from django.db import transaction as db_transaction
# import pandas as pd
# from datetime import date
# from django.shortcuts import get_object_or_404
# import time
# from django.db.models import Sum, F

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from icecream import ic
from ..models import Partner, WarehouseProduct
from django.db.models import Q
from ..my_func.get_unit_map import get_unit_map 
from ..my_func.get_unit_and_cf import get_unit_and_cf 

from django.contrib.auth import get_user_model

User = get_user_model()




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_partner_for_backend_input_search(request):
    q = request.GET.get("q", "").strip()
    # ic(q)
    
    query = Partner.objects.filter(name__icontains=q).order_by('name')[:20]
    data = []

    for partner in query:
        data.append({
            "id": partner.id,
            "name": partner.name,
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_product_for_backend_input_search(request):
    q = request.GET.get("q", "").strip()
    w = request.GET.get("w", "").strip()
    
    warehouse_ids = []

    if w:
        warehouse_ids = [
            int(pk) for pk in w.split(",") if pk.isdigit()
        ]
        
    # query = Partner.objects.filter(name__icontains=q).order_by('name')[:20]
    data = []
    
    # ic(q)
    # ic(warehouse_ids)
    
    qs = WarehouseProduct.objects.select_related(
        "product",
        "warehouse",
    )
    
    if warehouse_ids:
        qs = qs.filter(warehouse_id__in=warehouse_ids)
        
    if q:
        qs = qs.filter(
            Q(product__name__icontains=q)
        )[:20]
        
    unit_map = get_unit_map()

    for q in qs:
        product = q.product
        unit, cf = get_unit_and_cf(unit_map, product)
        qty = q.quantity / cf
   
        data.append({
            "id": product.id,
            "name": product.name,
            "unit": unit,
            "qty": qty,
        })

    return Response(data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_user_for_backend_input_search(request):
    q = request.GET.get("q", "").strip()
    
    query = User.objects.filter(username__icontains=q).order_by('username')[:20]
    data = []

    for user in query:
        data.append({
            "id": user.id,
            "name": user.username,
        })

    return Response(data)



