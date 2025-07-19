from rest_framework import serializers
from ..models import *
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
    agent_name = serializers.CharField(source='agent.name', read_only=True)

    class Meta:
        model = Partner
        fields = ['id', 'name', 'type', 'type_display', 'agent', 'agent_id', 'agent_name', 'balance']