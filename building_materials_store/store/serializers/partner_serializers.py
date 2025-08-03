from rest_framework import serializers
from ..models import *
from django.db.models import Sum, Q
from decimal import Decimal
from django.utils import timezone
# from django.contrib.auth.models import Group
# from django.contrib.auth import get_user_model
# from rest_framework.generics import ListAPIView
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView
# from django.db import transaction
# from datetime import datetime
# from django.db.models import Sum


class PartnerSerializer(serializers.ModelSerializer):
    # current_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    # agent = AgentSerializer(read_only=True)  # для чтения
    agent = serializers.PrimaryKeyRelatedField(read_only=True)
    agent_id = serializers.PrimaryKeyRelatedField(
        queryset=Agent.objects.all(),
        source='agent',
        write_only=True,
        required=False,       # ✅ не обязательно
        allow_null=True       # ✅ разрешает null
    )
    
    # balance_on_date = serializers.SerializerMethodField()
    # today_sales = serializers.SerializerMethodField()
    # final_balance = serializers.SerializerMethodField()
    

    # agent_name = serializers.CharField(source='agent.name', read_only=True)

    # class Meta:
    #     model = Partner
    #     fields = ['id', 'name', 'type', 'type_display', 'agent', 'agent_id', 'agent_name', 'balance', 'balance_on_date', 'today_sales', 'final_balance']
        
    # def get_balance_on_date(self, obj):
    #     today = timezone.now().date()
    #     # Все операции до начала текущего дня
    #     entries = Entry.objects.filter(
    #         transaction__partner=obj,
    #         transaction__date__lt=today
    #     )
    #     debit = entries.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
    #     credit = entries.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    #     return debit - credit  # Дебет минус Кредит — сколько нам должен партнёр

    # def get_today_sales(self, obj):
    #     today = timezone.now().date()
    #     entries = Entry.objects.filter(
    #         transaction__partner=obj,
    #         transaction__date__date=today
    #     )
    #     debit = entries.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
    #     credit = entries.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    #     return debit - credit

    # def get_final_balance(self, obj):
    #     return self.get_balance_on_date(obj) + self.get_today_sales(obj)
    
    
    # #### dlya pokaza i debet i kredet toje
    balance_on_date = serializers.SerializerMethodField()
    today_sales = serializers.SerializerMethodField()
    final_balance = serializers.SerializerMethodField()
    debit_total = serializers.SerializerMethodField()
    credit_total = serializers.SerializerMethodField()
    
    account_62_debit = serializers.SerializerMethodField()
    account_62_credit = serializers.SerializerMethodField()
    

    agent_name = serializers.CharField(source='agent.name', read_only=True)

    class Meta:
        model = Partner
        fields = ['id', 'name', 'type', 'type_display', 'agent', 'agent_id', 'agent_name', 'balance', 'balance_on_date', 'today_sales', 'final_balance', 'debit_total', 'credit_total', 'account_62_debit', 'account_62_credit',]
        
    def get_balance_on_date(self, obj):
        today = timezone.now().date()
        entries = Entry.objects.filter(
            transaction__partner=obj,
            transaction__date__lt=today
        )
        debit = entries.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
        credit = entries.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
        return debit - credit

    #  dlya pokaza saldo START
    def get_today_sales(self, obj):
        today = timezone.now().date()
        entries = Entry.objects.filter(
            transaction__partner=obj,
            transaction__date__date=today,
            account__number=62
        )
        debit = entries.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
        credit = entries.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
        # print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', debit, credit)
        return debit - credit

    def get_final_balance(self, obj):
        return self.get_balance_on_date(obj) + self.get_today_sales(obj)

    def get_debit_total(self, obj):
        entries = Entry.objects.filter(transaction__partner=obj, account__number=62)
        # print('GGGGGGGGGGGGGGGGGGGGGG', entries.aggregate(total=Sum('debit'))['total'] or Decimal('0.00'))
        return entries.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')

    def get_credit_total(self, obj):
        entries = Entry.objects.filter(transaction__partner=obj, account__number=62)
        return entries.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    
    def get_account_62_debit(self, obj):
        entries = Entry.objects.filter(
            transaction__partner=obj,
            account__number='62'
        )
        return entries.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')

    def get_account_62_credit(self, obj):
        entries = Entry.objects.filter(
            transaction__partner=obj,
            account__number='62'
        )
        return entries.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    #  dlya pokaza saldo END
    