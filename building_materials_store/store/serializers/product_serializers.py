from rest_framework import serializers
from ..models import *
import os

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


# class ProductImageSerializer(serializers.ModelSerializer):
#     image = serializers.SerializerMethodField()

#     class Meta:
#         model = ProductImage
#         fields = ['id', 'product', 'alt_text', 'image']
    
#     # daet polnuy put s htttp//:localhost:8000
#     # def get_image(self, obj):
#     #     request = self.context.get('request')
#     #     if request:
#     #         return request.build_absolute_uri(obj.image.url)
#     #     return obj.image.url
    
#     # bez polnogo puti, bez # daet polnuy put s htttp//:localhost:8000
#     # def get_image(self, obj):
#     #     return obj.image.url
    
#     def get_image_url(self, obj):
#         if obj.image and hasattr(obj.image, 'url'):
#             return obj.image.url
#         return None
    
#     def get_image(self, obj):
#         if obj.image and hasattr(obj.image, 'url'):
#             return obj.image.url
#         return None  # или "" если не хочешь null


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'alt_text', 'image']
    
    def create(self, validated_data):
        # print("=== SERIALIZER CREATE DEBUG ===")
        # print("Validated data:", validated_data)
        # print("Image in validated_data:", validated_data.get('image'))
        if 'image' in validated_data:
            image_file = validated_data['image']
            # print("Image file name:", image_file.name)
            # print("Image file size:", image_file.size)
            # print("Image file type:", image_file.content_type)
        
        instance = super().create(validated_data)
        
        # print("Created instance ID:", instance.id)
        # print("Instance image field:", instance.image)
        # if instance.image:
        #     print("Instance image name:", instance.image.name)
        #     print("Instance image path:", instance.image.path)
        #     print("Instance image URL:", instance.image.url)
        #     print("File exists on disk:", os.path.exists(instance.image.path) if instance.image else False)
        # print("=== END SERIALIZER DEBUG ===")
        
        return instance
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # print(f"=== TO_REPRESENTATION DEBUG ===")
        # print(f"Instance image: {instance.image}")
        if instance.image:
            request = self.context.get('request')
            if request:
                data['image'] = request.build_absolute_uri(instance.image.url)
            else:
                data['image'] = instance.image.url
            # print(f"Returning image URL: {data['image']}")
        # else:
        #     print("No image found in instance")
        # print("=== END TO_REPRESENTATION DEBUG ===")
        return data


class WarehouseProductSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    warehouse = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all())

    class Meta:
        model = WarehouseProduct
        fields = ['id', 'warehouse', 'warehouse_name', 'quantity']


class WarehouseProductReadSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    warehouse_id = serializers.IntegerField(source='warehouse.id', read_only=True)
    warehouse_currency = serializers.CharField(source='warehouse.currency.code',read_only=True)

    class Meta:
        model = WarehouseProduct
        fields = ['warehouse_id', 'warehouse_name', 'quantity', "warehouse_currency"]



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

    units = ProductUnitSerializer(many=True, required=False)
    images = ProductImageSerializer(many=True, read_only=True)
    
    warehouses = WarehouseProductSerializer(many=True, write_only=True, required=False)  # Для передачи количества по складам
    warehouses_data = WarehouseProductReadSerializer(many=True, source='warehouse_products', read_only=True)

    free_items = FreeProductSerializer(many=True)

    # total_quantity = serializers.DecimalField(source='total_quantity', max_digits=10, decimal_places=2, read_only=True)
    # total_quantity = serializers.ReadOnlyField()
    total_quantity = serializers.SerializerMethodField()

    quantity_on_selected_warehouses = serializers.SerializerMethodField()
    turnover_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'sku', 'qr_code',
            'purchase_price', 'retail_price', 'wholesale_price', 'discount_price', 'firma_price',
            'weight', 'volume', 'length', 'width', 'height',
            'base_unit', 'base_unit_obj',
            'category', 'category_name_obj',
            'brand', 'brand_obj',
            'model', 'model_obj',
            'tags', 'tags_obj',
            'units',
            'images',
            'free_items',
            'warehouses', 'warehouses_data',    # для записи остатков
            'total_quantity', # для отображения суммы
            'is_active', 'created_at', 'updated_at',
            'quantity_on_selected_warehouses',  
            "turnover_data",
        ]
    
    def get_turnover_data(self, obj):
        turnover_data = self.context.get("turnover_data", {})
        return turnover_data.get(obj.id, {"qty": 0, "sum": 0})
        # t = turnover_data.get(obj.id, {"qty": 0, "sum": 0})
        # if id == 606:
        #     ic(t)

        # # print(obj.id)
        # return {
        #     "qty": obj.name,
        #     "sum": 0,
        # }
        # turnover_map = self.context.get("turnover_map", {})
        # print("ID:", obj.id, "IN MAP:", obj.id in turnover_map)
        # return turnover_map.get(obj.id, {
        #     "qty": obj.name,
        #     "sum": 0,
        # })

    def get_quantity_on_selected_warehouses(self, obj):
        
        # warehouse_ids = self.context.get('warehouse_ids', [])
        if self.context:

            request = self.context.get('request')
            warehouse_ids_str = request.query_params.get('warehouse', '')  # например '3,2'

            warehouse_ids = []
            if warehouse_ids_str:
                warehouse_ids = warehouse_ids_str.split(',')
            if warehouse_ids:
                return obj.warehouse_products.filter(
                    warehouse_id__in=warehouse_ids
                ).aggregate(total=Sum('quantity'))['total'] or 0
            else:
                return obj.get_total_quantity()

    # ❌ Как сейчас (медленно) no rabotaet poprobuem sowet chata gpt on goworit budet bystree
    # def get_total_quantity(self, obj):
    #     # Если queryset аннотирован, возвращаем аннотированное значение
    #     if hasattr(obj, 'total_quantity') and obj.total_quantity is not None:
    #         return obj.total_quantity
    #     # Если аннотация отсутствует (например, отдельный объект), считаем на лету
    #     return obj.warehouse_products.aggregate(total=Sum('quantity'))['total'] or 0
    
    # ✅ Как изменить (НИЧЕГО НЕ ЛОМАЯ)
    def get_total_quantity(self, obj):
        if hasattr(obj, 'total_quantity2') and obj.total_quantity2 is not None:
            return obj.total_quantity2

        return obj.warehouse_products.aggregate(
            total=Sum('quantity')
        )['total'] or 0

    

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        units_data = validated_data.pop('units', [])
        warehouses_data = validated_data.pop('warehouses', [])
        free_items_data = validated_data.pop('free_items', [])

        user = self.context['request'].user

        product = Product(**validated_data)
        product.save(user=user)

        if tags_data:
            product.tags.set(tags_data)

        for unit_data in units_data:
            ProductUnit.objects.create(product=product, **unit_data)
        print('warehouses_data', warehouses_data)
        for wh_data in warehouses_data:
            WarehouseProduct.objects.create(product=product, **wh_data)

        for free_item_data in free_items_data:
            FreeProduct.objects.create(main_product=product, **free_item_data)

        return product

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        units_data = validated_data.pop('units', None)
        warehouses_data = validated_data.pop('warehouses', None)
        free_items_data = validated_data.pop('free_items', None)

        user = self.context['request'].user

        if tags_data is not None:
            instance.tags.set(tags_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save(user=user)

        if units_data is not None:
            instance.units.all().delete()
            for unit_data in units_data:
                ProductUnit.objects.create(product=instance, **unit_data)

        if warehouses_data is not None:
            instance.warehouse_products.all().delete()
            for wh_data in warehouses_data:
                WarehouseProduct.objects.create(product=instance, **wh_data)

        if free_items_data is not None:
            instance.free_items.all().delete()
            for free_item_data in free_items_data:
                FreeProduct.objects.create(main_product=instance, **free_item_data)

        return instance
    

