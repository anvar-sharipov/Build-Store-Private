from rest_framework import serializers
from ..models import *
from .product_serializers import *
from .partner_serializers import *

# from django.contrib.auth.models import Group
# from django.contrib.auth import get_user_model
# from rest_framework.generics import ListAPIView
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import transaction
# from datetime import datetime
# from django.db.models import Sum


class PurchaseInvoiceItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True
    )
    invoice = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PurchaseInvoiceItem
        fields = ['id', 'product', 'product_id', 'quantity', 'purchase_price', 'invoice']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Количество должно быть положительным")
        return value

    def validate_purchase_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Цена не может быть отрицательной")
        return value

    def validate(self, data):
        # Например, можно проверить остатки товара здесь, если нужно
        return data


class PurchaseInvoiceSerializer(serializers.ModelSerializer):
    supplier = PartnerSerializer(read_only=True)
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Partner.objects.all(), write_only=True
    )

    created_by = serializers.StringRelatedField(read_only=True)
    canceled_by = serializers.StringRelatedField(read_only=True)

    items = PurchaseInvoiceItemSerializer(many=True)

    class Meta:
        model = PurchaseInvoice
        fields = [
            'id', 'supplier', 'supplier_id', 'created_by', 'created_at',
            'total_amount', 'is_canceled', 'canceled_at',
            'canceled_by', 'cancel_reason', 'items'
        ]

    def validate(self, data):
        # Если накладная помечена как отмененная, обязательно указать причину
        if data.get('is_canceled') and not data.get('cancel_reason'):
            raise serializers.ValidationError("При отмене накладной нужно указать причину отмены")
        return data

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        supplier = validated_data.pop('supplier_id')
        user = self.context['request'].user

        invoice = PurchaseInvoice.objects.create(
            supplier=supplier,
            created_by=user,
            **validated_data
        )

        for item in items_data:
            product = item.pop('product_id')
            PurchaseInvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                **item
            )
        return invoice

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        supplier = validated_data.pop('supplier_id', None)

        if supplier:
            instance.supplier = supplier

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                product = item.pop('product_id')
                PurchaseInvoiceItem.objects.create(
                    invoice=instance,
                    product=product,
                    **item
                )
        return instance
    

class PurchaseReturnItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True
    )
    invoice = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PurchaseReturnItem
        fields = ['id', 'product', 'product_id', 'quantity', 'purchase_price', 'invoice']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Количество должно быть положительным")
        return value




class PurchaseReturnInvoiceSerializer(serializers.ModelSerializer):
    original_invoice = PurchaseInvoiceSerializer(read_only=True)
    original_invoice_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseInvoice.objects.all(), write_only=True, source='original_invoice'
    )

    created_by = serializers.StringRelatedField(read_only=True)
    items = PurchaseReturnItemSerializer(many=True)

    class Meta:
        model = PurchaseReturnInvoice
        fields = [
            'id', 'original_invoice', 'original_invoice_id',
            'created_by', 'created_at', 'reason', 'total_amount',
            'items'
        ]

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        original_invoice = validated_data.pop('original_invoice')
        user = self.context['request'].user

        return_invoice = PurchaseReturnInvoice.objects.create(
            original_invoice=original_invoice,
            created_by=user,
            **validated_data
        )

        for item in items_data:
            product = item.pop('product_id')
            PurchaseReturnItem.objects.create(
                invoice=return_invoice,
                product=product,
                **item
            )
        return return_invoice

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        original_invoice = validated_data.pop('original_invoice', None)

        if original_invoice:
            instance.original_invoice = original_invoice

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                product = item.pop('product_id')
                PurchaseReturnItem.objects.create(
                    invoice=instance,
                    product=product,
                    **item
                )
        return instance