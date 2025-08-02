from rest_framework import serializers

from .product_serializers import *
from .partner_serializers import *
from .base_serializers import *
from ..models import *
from icecream import ic

from django.db import transaction


# dlya sozdaniya prowodok pri rashodnoy naklodnoy
@transaction.atomic
def create_transaction_for_invoice(invoice: SalesInvoice, partner):
    description = f" (Примечание: {invoice.note})"

    print('invoice', invoice)

    transaction = Transaction.objects.create(
        description=description,
        invoice=invoice,
        partner=invoice.buyer,
    )

    account_goods = Account.objects.get(number='41')  # складские товары (актив)
    account_income = Account.objects.get(number='90')  # доход от продаж
    account_cash = Account.objects.get(number='50')  # касса или расчетный счет (актив)
    account_client = Account.objects.get(number='62')

    total = invoice.total_amount
    total_pay_summ = invoice.total_pay_summ

    partner.balance += (total_pay_summ-total)
    partner.save()

    for item in invoice.items.all():
        Entry.objects.create(
            transaction=transaction,
            account=account_income,
            debit=0,
            credit=item.sale_price * item.quantity,
            product=item.product,  # ✅ указываем товар
            warehouse=invoice.warehouse,
        )

    # 2. Списание товара (на 216)
    for item in invoice.items.all():
        Entry.objects.create(
            transaction=transaction,
            account=account_goods,
            debit=0,
            credit=item.sale_price * item.quantity,
            product=item.product,  # ✅
            warehouse=invoice.warehouse,
        )

    # 3. Дебиторка (на 216)
    Entry.objects.create(
        transaction=transaction,
        account=account_client,
        debit=total,
        credit=0
    )

    # 4. Оплата от клиента (300)
    Entry.objects.create(
        transaction=transaction,
        account=account_cash,
        debit=total_pay_summ,
        credit=0
    )

    # 5. Гасим 216 долга
    Entry.objects.create(
        transaction=transaction,
        account=account_client,
        debit=0,
        credit=total_pay_summ
    )

class SalesInvoiceItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True
    )
    invoice = serializers.PrimaryKeyRelatedField(read_only=True)

    line_total = serializers.SerializerMethodField()
    total_purchase = serializers.SerializerMethodField()
    total_retail = serializers.SerializerMethodField()
    total_wholesale = serializers.SerializerMethodField()

    class Meta:
        model = SalesInvoiceItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'sale_price', 'invoice', 'is_gift',
            'line_total', 'total_purchase', 'total_retail', 'total_wholesale', 
            'wholesale_price', 'retail_price', 'purchase_price',
        ]

    def get_line_total(self, obj):
        return obj.get_line_total()

    def get_total_purchase(self, obj):
        return obj.get_total_purchase()

    def get_total_retail(self, obj):
        return obj.get_total_retail()

    def get_total_wholesale(self, obj):
        return obj.get_total_wholesale()

    # def validate_quantity(self, value):
    #     if value <= 0:
    #         raise serializers.ValidationError("Количество должно быть положительным")
    #     return value

    # def validate_sale_price(self, value):
    #     if value < 0:
    #         raise serializers.ValidationError("Цена продажи не может быть отрицательной")
    #     return value


class SalesInvoiceSerializer(serializers.ModelSerializer):
    buyer = PartnerSerializer(read_only=True)
    buyer_id = serializers.PrimaryKeyRelatedField(queryset=Partner.objects.all(), write_only=True, source='buyer')
    
    delivered_by = EmployeeSerializer(read_only=True)
    delivered_by_id = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), write_only=True, required=False, allow_null=True)
    
    created_by = serializers.StringRelatedField(read_only=True)

    warehouse = WarehouseSerializer(read_only=True)
    warehouse_id = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all(), write_only=True, source='warehouse', required=False, allow_null=True)
    
    items = SalesInvoiceItemSerializer(many=True, read_only=True)  # Только для чтения (чтобы не обрабатывать вложенные валидации создания)

    class Meta:
        model = SalesInvoice
        fields = [
            'id',
            'buyer', 'buyer_id', 'delivered_by', 'delivered_by_id',
            'created_by', 'created_at', 'invoice_date', 'total_amount',
            'note', 'items',
            'warehouse', 'warehouse_id',
            'total_pay_summ', 'isEntry',
            'type_price',
        ]
    # buyer = PartnerSerializer(read_only=True)
    # buyer_id = serializers.PrimaryKeyRelatedField(queryset=Partner.objects.all(), write_only=True, source='buyer')
    
    # delivered_by = EmployeeSerializer(read_only=True)
    # delivered_by_id = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), write_only=True, required=False, allow_null=True)
    
    # created_by = serializers.StringRelatedField(read_only=True) 
    # # entry_type = serializers.ChoiceField(choices=SalesInvoice.ENTRY_TYPE_CHOICES, required=False, allow_null=True)
    
    # # currency = serializers.StringRelatedField(read_only=True)
    # # currency_id = serializers.PrimaryKeyRelatedField(queryset=Currency.objects.all(), write_only=True, source='currency')

    # warehouse = WarehouseSerializer(read_only=True)
    # warehouse_id = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all(), write_only=True, source='warehouse', required=False, allow_null=True)
    
    # items = SalesInvoiceItemSerializer(many=True)

    # # total_pay_summ = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, write_only=True)


    
    # class Meta:
    #     model = SalesInvoice
    #     fields = [
    #         'id',
    #         'buyer', 'buyer_id', 'delivered_by', 'delivered_by_id',
    #         'created_by', 'created_at', 'invoice_date', 'total_amount',
    #         'note', 'items',
    #         'warehouse', 'warehouse_id',
    #         'total_pay_summ', 'isEntry',
    #         'type_price',
    #     ]
    
    
    # @transaction.atomic
    # def create(self, validated_data):
    #     items_data = validated_data.pop('items', [])
    #     buyer = validated_data.pop('buyer', None)
    #     delivered_by = validated_data.pop('delivered_by_id', None)
    #     # currency = validated_data.pop('currency', None)
    #     print('validated_data === ', validated_data)
    #     total_pay_summ = validated_data.pop('total_pay_summ', 0)
    #     user = self.context['request'].user

    #     invoice = SalesInvoice.objects.create(
    #         buyer=buyer,
    #         delivered_by=delivered_by,
    #         # currency=currency,
    #         created_by=user,
    #         total_amount=0,
    #         total_pay_summ=total_pay_summ,
    #         **validated_data
    #     )

    #     for item in items_data:
    #         product = item.pop('product_id')
    #         SalesInvoiceItem.objects.create(
    #             invoice=invoice,
    #             product=product,
    #             **item
    #         )

    #     invoice.total_amount = invoice.calculate_total()
    #     invoice.save(update_fields=['total_amount'])
    #     # print('invoice 2 ===', invoice)
    #     # print('invoice type === ', type(invoice))
    #     # print('invoice 3 === ', invoice.note)

    #     # Здесь вызываем функцию для создания проводок
    #     # print('invoice', invoice.isEntry)
    #     if invoice.isEntry:
    #         create_transaction_for_invoice(invoice, buyer)

    #     return invoice
    
    # @transaction.atomic
    # def update(self, instance, validated_data):
    #     items_data = validated_data.pop('items', [])
    #     buyer = validated_data.pop('buyer', None)
    #     delivered_by = validated_data.pop('delivered_by_id', None)
    #     # currency = validated_data.pop('currency', None)
    #     total_pay_summ = validated_data.pop('total_pay_summ', 0)
    #     user = self.context['request'].user

    #     instance.buyer = buyer if buyer else instance.buyer
    #     instance.delivered_by = delivered_by if delivered_by else instance.delivered_by
    #     # instance.currency = currency if currency else instance.currency
    #     instance.total_pay_summ = total_pay_summ
    #     instance.created_by = user

    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #     instance.save()

    #     # Обновляем позиции
    #     instance.items.all().delete()
    #     for item in items_data:
    #         product = item.pop('product_id')
    #         SalesInvoiceItem.objects.create(
    #             invoice=instance,
    #             product=product,
    #             **item
    #         )

    #     instance.total_amount = instance.calculate_total()
    #     instance.save(update_fields=['total_amount'])

    #     if instance.isEntry:
    #         create_transaction_for_invoice(instance, buyer)

    #     return instance