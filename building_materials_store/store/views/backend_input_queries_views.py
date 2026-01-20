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
from ..models import Partner




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

