# from django.shortcuts import render
# import time
# from django.http import HttpResponse
# import openpyxl
# from openpyxl.utils import get_column_letter
# from icecream import ic
# from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
# from collections import OrderedDict
# from collections import defaultdict


from rest_framework import viewsets
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
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated, SAFE_METHODS
# from rest_framework.decorators import api_view, action

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import render, get_object_or_404
# from rest_framework.generics import CreateAPIView
from django_filters.rest_framework import DjangoFilterBackend
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



class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer



class EntryViewSet(viewsets.ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'account': ['exact'],
        'transaction__date': ['gte', 'lte'],
    }


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-date')
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        'partner': ['exact'],
        'date': ['gte', 'lte'],
    }

    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionWriteSerializer
        return TransactionSerializer