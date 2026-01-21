# from django.http import JsonResponse, HttpResponse
# from django.views.decorators.http import require_GET, require_POST
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
# from decimal import Decimal, ROUND_HALF_UP
# from django.db.models import Q, Sum
# from datetime import datetime, timedelta
# from django.utils.dateparse import parse_date

# from django.db.models import F
# from django.contrib.postgres.search import TrigramSimilarity
# from ..models import *

# import json
# from collections import defaultdict

# from openpyxl import Workbook
# from openpyxl.utils import get_column_letter
# from django.http import FileResponse
# import os
# from io import BytesIO
# from django.core.files.base import ContentFile
# from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
# from openpyxl.formatting.rule import CellIsRule
# from openpyxl.worksheet.page import PageMargins

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from icecream import ic
import time
from datetime import datetime
from ..models import Warehouse, InvoiceItem
from decimal import Decimal, ROUND_HALF_UP

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def skidka_nasenka(request):
    user = request.user
    
    if not user.groups.filter(name="admin").exists():
        return Response(
            {"message": "onlyAdmin"},
            status=403
        )
    
    date_from_str = request.query_params.get("date_from")
    date_to_str = request.query_params.get("date_to")
    date_from = datetime.strptime(date_from_str, "%Y-%m-%d").date()
    date_to = datetime.strptime(date_to_str, "%Y-%m-%d").date()
    
    partners = request.query_params.get("partners")
    warehouses = request.query_params.get("warehouses")
    agents = request.query_params.get("agents")
    products = request.query_params.get("products")
    users = request.query_params.get("users")
    sortPrice = request.query_params.get("sortPrice")
    
    warehouse_ids = []
    if warehouses:
        warehouse_ids = [
            int(pk) for pk in warehouses.split(",") if pk.isdigit()
        ]
        
    result = []

    for w in Warehouse.objects.filter(id__in=warehouse_ids):
        total_all_price = Decimal('0')
        otkloneniy_wsego = Decimal('0')
        skidki = Decimal('0')
        nasenki = Decimal('0')
        opt_sum = Decimal('0')

        table = []

        turnover_items = (
            InvoiceItem.objects
            .filter(
                invoice__entry_created_at_handle__gte=date_from,
                invoice__entry_created_at_handle__lt=date_to,
                invoice__canceled_at__isnull=True,
                invoice__wozwrat_or_prihod="rashod",
                invoice__warehouse=w,
            )
            .select_related(
                "invoice",
                "invoice__partner",
                "product"
            )
        )

        for t in turnover_items:
            opt_sum += t.wholesale_price * t.selected_quantity
            total_all_price += t.selected_quantity * t.selected_price

            otkloneniye = (
                t.selected_price - t.wholesale_price
            ) * t.selected_quantity

            otkloneniy_wsego += otkloneniye

            if otkloneniye < 0:
                skidki += abs(otkloneniye)
            elif otkloneniye > 0:
                nasenki += otkloneniye

            if t.selected_price != t.product.wholesale_price:
                table.append({
                    "partner_name": t.invoice.partner.name,
                    "invoice_id": t.invoice.id,
                    "invoice_comment": t.invoice.comment,
                    "product_name": t.product.name,
                    "unit": t.unit_name_on_selected_warehouses,
                    "wholesale_price": t.product.wholesale_price,
                    "selected_price": t.selected_price,
                    "selected_quantity": t.selected_quantity,
                    "total_selected_price": t.selected_price * t.selected_quantity,
                    "difference": (
                        t.selected_price * t.selected_quantity
                        - t.product.wholesale_price * t.selected_quantity
                    ),
                })

        percent = Decimal('0')
        if opt_sum > 0:
            percent = (otkloneniy_wsego / opt_sum * 100).quantize(
                Decimal('0.01'),
                rounding=ROUND_HALF_UP
            )

        result.append({
            "id": w.id,
            "name": w.name,
            "table": table,
            "total_all_price": total_all_price,
            "otkloneniy_wsego": otkloneniy_wsego,
            "skidki": skidki,
            "nasenki": nasenki,
            "opt_sum": opt_sum,
            "percent": percent,
        })

    return Response({ "warehouses": result })