from rest_framework import serializers
from .. models import *
from .partner_serializers import *
from django.contrib.auth.models import Group
# from django.contrib.auth import get_user_model
# from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView
# from django.db import transaction
# from datetime import datetime
# from django.db.models import Sum



class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs['username'] = attrs['username'].lower()
        attrs['password'] = attrs['password'].lower()
        data = super().validate(attrs)
        data['username'] = self.user.username  # можно вернуть имя пользователя, группу и т.д.
        return data
    

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name']


class ModelSerializer(serializers.ModelSerializer):
    brand_obj = BrandSerializer(read_only=True, source='brand')
    brand = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all()) 

    class Meta:
        model = Model
        fields = ['id', 'name', 'brand', 'brand_obj']



class UnitOfMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitOfMeasurement
        fields = ['id', 'name']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'location']


class PriceChangeReportSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_unit = serializers.CharField(source="product.base_unit.name", read_only=True)

    old_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    new_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity_at_change = serializers.DecimalField(max_digits=10, decimal_places=2)
    difference = serializers.DecimalField(max_digits=10, decimal_places=2)
    changed_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = PriceChangeHistory
        fields = [
            "id", "product_name", "product_unit",
            "old_price", "new_price", "quantity_at_change",
            "difference", "changed_at"
        ]


class GroupSerializers(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class AgentSerializer(serializers.ModelSerializer):
    partners = serializers.SerializerMethodField()
    class Meta:
        model = Agent
        fields = ['id', 'name', 'partners']

    def get_partners(self, agent):
        partners = Partner.objects.filter(agent=agent)
        return PartnerSerializer(partners, many=True).data
    

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name']



# class CurrencySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Currency
#         fields = ['id', 'code', 'name', 'symbol']


# class CurrencyRateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CurrencyRate
#         fields = '__all__'