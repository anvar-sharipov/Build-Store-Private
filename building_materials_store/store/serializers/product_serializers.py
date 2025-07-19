from rest_framework import serializers
from ..models import *

from .base_serializers import *
# from django.contrib.auth.models import Group
# from django.contrib.auth import get_user_model
# from rest_framework.generics import ListAPIView
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView
# from django.db import transaction
# from datetime import datetime
# from django.db.models import Sum


class ProductUnitSerializer(serializers.ModelSerializer):
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    base_unit_name = serializers.CharField(source='product.base_unit.name', read_only=True)

    class Meta:
        model = ProductUnit
        fields = ['id', 'unit', 'unit_name', 'conversion_factor', 'is_default_for_sale', 'base_unit_name']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'alt_text', 'image' ]


class ProductBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductBatch
        fields = ['id', 'batch_number', 'quantity', 'arrival_date', 'production_date', 'expiration_date']


class FreeProductSerializer(serializers.ModelSerializer):
    gift_product_name = serializers.CharField(source="gift_product.name", read_only=True)
    gift_product_quantity = serializers.CharField(source="gift_product.quantity", read_only=True)
    gift_product_unit_name = serializers.CharField(source="gift_product.base_unit.name", read_only=True)
    # main_product не нужно передавать, задаём вручную в ProductSerializer

    class Meta:
        model = FreeProduct
        fields = ['id', 'gift_product', 'gift_product_name', 'quantity_per_unit', 'gift_product_quantity', 'gift_product_unit_name']

class ProductSerializer(serializers.ModelSerializer):
    category_name_obj = CategorySerializer(read_only=True, source='category')
    base_unit_obj = UnitOfMeasurementSerializer(read_only=True, source='base_unit')
    brand_obj = BrandSerializer(read_only=True, source='brand')
    model_obj = ModelSerializer(read_only=True, source='model')
    tags_obj = TagSerializer(many=True, read_only=True, source='tags')

    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, write_only=True, required=False)
    base_unit = serializers.PrimaryKeyRelatedField(queryset=UnitOfMeasurement.objects.all(), write_only=True)
    brand = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all(), write_only=True, required=False, allow_null=True)
    model = serializers.PrimaryKeyRelatedField(queryset=Model.objects.all(), write_only=True, required=False, allow_null=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True, required=False, allow_null=True)


    # units = ProductUnitSerializer(many=True, read_only=True)
    units = ProductUnitSerializer(many=True)
    free_items = FreeProductSerializer(many=True)
    images = ProductImageSerializer(many=True, read_only=True)
    batches = ProductBatchSerializer(many=True, read_only=True)
    

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'sku', 'qr_code',
            'quantity', 'purchase_price', 'retail_price', 'wholesale_price', 'discount_price', 'firma_price',
            'weight', 'volume', 'length', 'width', 'height',
            
            'base_unit', 'base_unit_obj',
            'category', 'category_name_obj',
            'brand', 'brand_obj',
            'model', 'model_obj',
            
            'tags', 'tags_obj',
            'units', 
            'images', 
            'batches', 'free_items',
            'is_active', 'created_at', 'updated_at'
        ]
        


    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        units_data = validated_data.pop('units', [])
        free_items_data = validated_data.pop('free_items', [])

        user = self.context['request'].user

        product = Product(**validated_data)
        product.save(user=user)  # передаём пользователя в модель

        product.tags.set(tags_data)

        for unit_data in units_data:
            ProductUnit.objects.create(product=product, **unit_data)

        for free_item_data in free_items_data:
            FreeProduct.objects.create(main_product=product, **free_item_data)

        return product

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        units_data = validated_data.pop('units', None)
        free_items_data = validated_data.pop('free_items', None)

        user = self.context['request'].user

        if tags_data is not None:
            instance.tags.set(tags_data)

        # Обновляем поля экземпляра
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save(user=user)  # передаём пользователя

        if units_data is not None:
            instance.units.all().delete()
            for unit_data in units_data:
                ProductUnit.objects.create(product=instance, **unit_data)

        if free_items_data is not None:
            instance.free_items.all().delete()
            for free_item_data in free_items_data:
                FreeProduct.objects.create(main_product=instance, **free_item_data)

        return instance
    

