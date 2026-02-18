
from django.http import JsonResponse, HttpResponse
# from django.views.decorators.http import require_GET, require_POST
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
from decimal import Decimal, ROUND_HALF_UP
from django.db.models import Q, Sum, Count, F, DecimalField, ExpressionWrapper, Prefetch
from datetime import datetime, timedelta
# from django.utils.dateparse import parse_date

# from django.db.models import F
# from django.contrib.postgres.search import TrigramSimilarity
from ..models import Account, Entry, DayClosing, PartnerBalanceSnapshot, Partner, WarehouseAccount, Product, InvoiceItem
from icecream import ic
# import json
# from collections import defaultdict

from openpyxl import Workbook
# from openpyxl.utils import get_column_letter
# from django.http import FileResponse
# import os
# from io import BytesIO
# from django.core.files.base import ContentFile
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
# from openpyxl.formatting.rule import CellIsRule
# from openpyxl.worksheet.page import PageMargins

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from io import BytesIO




from ..my_func.get_unit_map import get_unit_map 
from ..my_func.get_unit_and_cf import get_unit_and_cf 
from ..my_func.str_to_int_list import str_to_int_list
from ..my_func.date_convert_for_excel import format_date_ru 






@api_view(["GET"])
@permission_classes([IsAuthenticated])
def product_turnover_excel(request):
    
    #  product_id: detailOborot.product_id,
    #       dateFrom,
    #       dateTo,
    #       warheousesId,
    
    
    
    date_from = request.GET.get("dateFrom")
    date_to = request.GET.get("dateTo")
    
    warehouse = request.GET.get("warheousesId", "")
    product_id = request.GET.get("product_id", "")

    try:
        warehouse_list = str_to_int_list(warehouse)
    except:
        warehouse_list = []
    
    
    # ic(date_from)
    # ic(date_to)
    # ic(warehouse)
    # ic(warehouse_list)
    # ic(product_id)
  
    if not date_from or not date_to:
        return Response(
            {"error": "choose diapazon date"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        day_start = datetime.strptime(date_from, "%Y-%m-%d").date()
        day_end = datetime.strptime(date_to, "%Y-%m-%d").date()
    except ValueError:
        return Response(
            {"error": "invalid diapazon date format"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if day_start > day_end:
        return Response(
            {"error": "date start must be <= date end"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    day_start_str = day_start.strftime("%d.%m.%Y")
    day_end_str = day_end.strftime("%d.%m.%Y")
    
    if not product_id:
        return JsonResponse(
            {"status": "error", "message": "choose correct product"},
            status=400
        )
        
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse(
            {"status": "error", "message": "product not found"},
            status=404
        )
    

    
    data = []

    
    return Response(data)
  