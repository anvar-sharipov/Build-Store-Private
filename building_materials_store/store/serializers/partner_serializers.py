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
from icecream import ic



class AccountSerializerForRead(serializers.ModelSerializer):

    class Meta:
        model = Account
        fields = ['id', 'number', 'name', 'type']

# kod rabochiy no usd i tmt balance po polyam sortiruyutsya i pokazuwayut tut , a ne po prowodkam
# class PartnerSerializer(serializers.ModelSerializer):
#     # current_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
#     type_display = serializers.CharField(source='get_type_display', read_only=True)
#     # agent = AgentSerializer(read_only=True)  # для чтения
#     agent = serializers.PrimaryKeyRelatedField(read_only=True)
#     agent_id = serializers.PrimaryKeyRelatedField(
#         queryset=Agent.objects.all(),
#         source='agent',
#         write_only=True,
#         required=False,       # ✅ не обязательно
#         allow_null=True       # ✅ разрешает null
#     )

#     agent_name = serializers.CharField(source='agent.name', read_only=True)

#     class Meta:
#         model = Partner
#         # fields = ['id', 'name', 'type', 'type_display', 'agent', 'agent_id', 'agent_name', 'balance', 'balance_on_date', 'today_sales', 'final_balance', 'debit_total', 'credit_total', 'account_62_debit', 'account_62_credit', 'is_active']
#         fields = ['id', 'name', 'type', 'type_display', 'agent', 'agent_id', 'agent_name', 'balance', 'is_active', 'balance_tmt', 'balance_usd']
   
   

class PartnerSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    agent = serializers.PrimaryKeyRelatedField(read_only=True)
    agent_id = serializers.PrimaryKeyRelatedField(
        queryset=Agent.objects.all(),
        source='agent',
        write_only=True,
        required=False,
        allow_null=True
    )
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    
    # Гибридный подход - используем аннотации когда есть, иначе вычисляем
    balance_usd = serializers.SerializerMethodField()
    balance_tmt = serializers.SerializerMethodField()

    class Meta:
        model = Partner
        fields = ['id', 'name', 'type', 'type_display', 'agent', 'agent_id', 'agent_name', 'balance', 'is_active', 'balance_tmt', 'balance_usd']

    def get_balance_usd(self, obj):
        """Используем аннотированное поле или вычисляем"""
        if hasattr(obj, 'computed_balance_usd'):
            return obj.computed_balance_usd
        return self._calculate_balance(obj, ['60', '75'])

    def get_balance_tmt(self, obj):
        """Используем аннотированное поле или вычисляем"""
        if hasattr(obj, 'computed_balance_tmt'):
            return obj.computed_balance_tmt
        return self._calculate_balance(obj, ['62', '76'])

    def _calculate_balance(self, partner, account_numbers):
        from django.db.models import Sum
        from decimal import Decimal
        
        # Получаем сумму дебета и кредита по указанным счетам
        result = Entry.objects.filter(
            transaction__partner=partner,
            account__number__in=account_numbers
        ).aggregate(
            total_debit=Sum('debit'),
            total_credit=Sum('credit')
        )
        
        debit = result['total_debit'] or Decimal('0.00')
        credit = result['total_credit'] or Decimal('0.00')
        
        return debit - credit