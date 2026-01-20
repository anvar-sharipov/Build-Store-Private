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

    ic(date_from)
    ic(date_to)
    ic(partners)
    ic(warehouses)
    ic(agents)
    
    # time.sleep(2)
    
    return Response({"success": True})
    