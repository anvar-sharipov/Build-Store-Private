from rest_framework import serializers
from .models import *
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import transaction
from datetime import datetime
from django.db.models import Sum

User = get_user_model()


# dlya sozdaniya prowodok pri rashodnoy naklodnoy
def create_transaction_for_invoice(invoice: SalesInvoice, total_pay_summ):
    if not invoice.entry_type:
        return  # Накладная не требует проводки
    
    # partner_id = 25  # ID партнёра
    # currency_code = 'USD'
    # start_date = datetime(2025, 1, 1)
    # end_date = datetime(2025, 7, 17)

    # entries = Entry.objects.filter(
    #     transaction__partner_id=partner_id,
    #     transaction__date__range=(start_date, end_date),
    #     account__currency__code=currency_code,
    # )

    # total_debit = entries.aggregate(Sum('debit'))['debit__sum'] or 0
    # total_credit = entries.aggregate(Sum('credit'))['credit__sum'] or 0

    # print(f"Оборот по дебету: {total_debit}")
    # print(f"Оборот по кредиту: {total_credit}")

    # return

    description_map = {
        'shipment': f"Отгрузка товара по накладной №{invoice.id}",
        'payment': f"Оплата по накладной №{invoice.id}",
        'both': f"Отгрузка и оплата по накладной №{invoice.id}"
    }
    
    # # description = description_map[invoice.entry_type]
    # description = description_map.get(invoice.entry_type)
    if invoice.entry_type not in ['shipment', 'payment', 'both']:
        return
    
    description = description_map[invoice.entry_type]

    # Если есть примечание — добавим его в скобках
    if invoice.note:
        description += f" (Примечание: {invoice.note})"

    currency = Currency.objects.get(pk=invoice.currency_id)
    # print('invoice.currency', invoice.currency)
    # print('invoice.entry_type', invoice.entry_type, type(invoice.entry_type))
    # print('description', description)
    # print('invoice.entry_type', invoice.entry_type)


    transaction = Transaction.objects.create(
        description=description,
        invoice=invoice,
        partner=invoice.buyer,
    )

    
    
    # Счета для операций — должны быть настроены в системе заранее
    # Пример (нужно адаптировать под твои реальные счета)
    if currency.code == "USD":
        account_goods = Account.objects.get(number='41.1')  # складские товары (актив)
        account_income = Account.objects.get(number='90.1')  # доход от продаж
        account_cash = Account.objects.get(number='50.1')  # касса или расчетный счет (актив)
        account_client = Account.objects.get(number='62.1')
    else:
        account_goods = Account.objects.get(number='41.2')  # складские товары (актив)
        account_income = Account.objects.get(number='90.2')  # доход от продаж
        account_cash = Account.objects.get(number='50.2')  # касса или расчетный счет (актив)
        account_client = Account.objects.get(number='62.2')
    
    total = invoice.total_amount
    print('total_pay_summ', total_pay_summ)

    if invoice.entry_type == 'shipment':
        # Отгрузка товара: списание со склада (кредит) и уменьшение активов
        Entry.objects.create(transaction=transaction, account=account_goods, debit=0, credit=total)
        # Пример: можно тут ещё делать проводку по себестоимости и доходу, если есть учет
        # Списание товаров со склада (кредит 41)
        Entry.objects.create(transaction=transaction, account=account_client, debit=total_pay_summ, credit=0)

    elif invoice.entry_type == 'payment':
        # Оплата: поступление денег (дебет), увеличение денег в кассе/банке
        Entry.objects.create(transaction=transaction, account=account_cash, debit=total_pay_summ, credit=0)  # деньги пришли
        Entry.objects.create(transaction=transaction, account=account_client, debit=0, credit=total_pay_summ)  # гасим долг клиента

    if invoice.entry_type == 'both':
        # 1. Признание дохода
        Entry.objects.create(transaction=transaction, account=account_income, debit=0, credit=total)

        # 2. Списание товара
        Entry.objects.create(transaction=transaction, account=account_goods, debit=0, credit=total)

        # 3. Клиент должен нам (дебиторская задолженность)
        Entry.objects.create(transaction=transaction, account=account_client, debit=total, credit=0)

        # 4. Оплата клиента (деньги пришли)
        Entry.objects.create(transaction=transaction, account=account_cash, debit=total_pay_summ, credit=0)

        # 5. Погашение задолженности клиента
        Entry.objects.create(transaction=transaction, account=account_client, debit=0, credit=total)



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

class ProductUnitSerializer(serializers.ModelSerializer):
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    base_unit_name = serializers.CharField(source='product.base_unit.name', read_only=True)

    class Meta:
        model = ProductUnit
        fields = ['id', 'unit', 'unit_name', 'conversion_factor', 'is_default_for_sale', 'base_unit_name']


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










class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    group = serializers.CharField(write_only=True)
    photo = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'group', 'photo']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("USERNAME_EXISTS")
        return value
    
    def validate_group(self, value):
        if not value:
            raise serializers.ValidationError("EMPTY_GROUP_NAME")
        if not Group.objects.filter(name=value).exists():
            raise serializers.ValidationError("GROUP_NOT_FOUND")
        return value
    
    def validate(self, attrs):
        # Проверка на совпадение паролей
        if attrs['password'].lower() != attrs['password2'].lower():
            raise serializers.ValidationError({"password2": "PASSWORDS_DO_NOT_MATCH"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        group_name = validated_data.pop('group', None)
        username = validated_data.get('username').lower()
        password = validated_data.get('password').lower()

        photo = validated_data.pop('photo', None)
        # user = User.objects.create_user(**validated_data)
        user = User.objects.create_user(username=username, password=password)
        if photo:
            user.photo = photo
            user.save()

        try:
            group = Group.objects.get(name=group_name)
            user.groups.add(group)
        except Group.DoesNotExist:
            raise serializers.ValidationError({'group': 'GROUP_NOT_FOUND'})
        return user
    


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





######################################################################################################################### Faktura START
### ========== PurchaseInvoice & Items ==========

####################################################################
# PurchaseInvoice и Items
####################################################################

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

############################################################################################################################################################################################################
############################################################################################################################################################################################################
############################################################################################################################################################################################################
############################################################################################################################################################################################################
####################################################################
# SalesInvoice и Items START
####################################################################

class SalesInvoiceItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True
    )
    invoice = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = SalesInvoiceItem
        fields = ['id', 'product', 'product_id', 'quantity', 'sale_price', 'invoice']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Количество должно быть положительным")
        return value

    def validate_sale_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Цена продажи не может быть отрицательной")
        return value


class SalesInvoiceSerializer(serializers.ModelSerializer):
    buyer = PartnerSerializer(read_only=True)
    buyer_id = serializers.PrimaryKeyRelatedField(queryset=Partner.objects.all(), write_only=True, source='buyer')
    
    delivered_by = EmployeeSerializer(read_only=True)
    delivered_by_id = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), write_only=True, required=False, allow_null=True)
    
    created_by = serializers.StringRelatedField(read_only=True) 
    entry_type = serializers.ChoiceField(choices=SalesInvoice.ENTRY_TYPE_CHOICES, required=False, allow_null=True)
    
    currency = serializers.StringRelatedField(read_only=True)
    currency_id = serializers.PrimaryKeyRelatedField(queryset=Currency.objects.all(), write_only=True, source='currency')

    warehouse = WarehouseSerializer(read_only=True)
    warehouse_id = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all(), write_only=True, source='warehouse', required=False, allow_null=True)
    
    items = SalesInvoiceItemSerializer(many=True)

    total_pay_summ = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, write_only=True)


    
    class Meta:
        model = SalesInvoice
        fields = [
            'id', 'status', 'currency', 'currency_id', 'entry_type',
            'buyer', 'buyer_id', 'delivered_by', 'delivered_by_id',
            'created_by', 'created_at', 'total_amount',
            'note', 'items',
            'warehouse', 'warehouse_id',
            'total_pay_summ',
        ]
    
    
    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        buyer = validated_data.pop('buyer', None)
        delivered_by = validated_data.pop('delivered_by_id', None)
        currency = validated_data.pop('currency', None)
        print('validated_data === ', validated_data)
        total_pay_summ = validated_data.pop('total_pay_summ', 0)
        user = self.context['request'].user

        invoice = SalesInvoice.objects.create(
            buyer=buyer,
            delivered_by=delivered_by,
            currency=currency,
            created_by=user,
            total_amount=0,
            **validated_data
        )

        for item in items_data:
            product = item.pop('product_id')
            SalesInvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                **item
            )

        invoice.total_amount = invoice.calculate_total()
        invoice.save(update_fields=['total_amount'])
        # print('invoice 2 ===', invoice)
        # print('invoice type === ', type(invoice))
        # print('invoice 3 === ', invoice.note)

        # Здесь вызываем функцию для создания проводок
        create_transaction_for_invoice(invoice, total_pay_summ)

        return invoice
    
    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        buyer = validated_data.pop('buyer', None)
        delivered_by = validated_data.pop('delivered_by', None)
        currency = validated_data.pop('currency', None)
        
        if buyer:
            instance.buyer = buyer
        if delivered_by is not None:
            instance.delivered_by = delivered_by
        if currency:
            instance.currency = currency
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                product = item.pop('product_id')
                SalesInvoiceItem.objects.create(
                    invoice=instance,
                    product=product,
                    **item
                )
        return instance

####################################################################
# SalesInvoice и Items END
####################################################################
############################################################################################################################################################################################################
############################################################################################################################################################################################################
############################################################################################################################################################################################################
############################################################################################################################################################################################################
############################################################################################################################################################################################################



####################################################################
# PurchaseReturnInvoice и Items
####################################################################

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


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol']
    

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



######################################################################################################################### Faktura END




##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
####################################################################################################################### Entries START

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'


class CurrencyRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrencyRate
        fields = '__all__'


class AccountSerializer(serializers.ModelSerializer):
    currency = CurrencySerializer(read_only=True)
    currency_id = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(),
        source='currency',
        write_only=True
    )

    class Meta:
        model = Account
        fields = ['id', 'number', 'name', 'type', 'currency', 'currency_id']

# dlya wywoda date w EntrySerializer
class TransactionSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description']


# class EntrySerializer(serializers.ModelSerializer):
#     account = AccountSerializer(read_only=True)
#     account_id = serializers.PrimaryKeyRelatedField(
#         queryset = Account.objects.all(), source='account', write_only=True
#     )

#     transaction_obj = TransactionSimpleSerializer(source='transaction', read_only=True)

#     class Meta:
#         model = Entry
#         fields = ['id', 'transaction', 'transaction_obj', 'account', 'account_id', 'debit', 'credit']

class EntrySerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=True)
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source='account', write_only=True
    )
    transaction_obj = TransactionSimpleSerializer(source='transaction', read_only=True)
    date = serializers.DateTimeField(source='transaction.date', read_only=True)
    debit = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    credit = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    running_balance = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = ['id', 'date', 'transaction', 'transaction_obj', 'account', 'account_id', 'debit', 'credit', 'running_balance']

    def get_running_balance(self, obj):
        # будем подставлять позже в view через context
        return self.context.get('running_balances', {}).get(obj.id)


class TransactionSerializer(serializers.ModelSerializer):
    entries = EntrySerializer(many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'partner', 'entries']


class EntryWriteSerializer(serializers.ModelSerializer):
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(), source='account'
    )

    class Meta:
        model = Entry
        fields = ['account_id', 'debit', 'credit']


class TransactionWriteSerializer(serializers.ModelSerializer):
    entries = EntryWriteSerializer(many=True)

    class Meta:
        model = Transaction
        fields = ['description', 'partner', 'entries']

    def create(self, validated_data):
        entries_data = validated_data.pop('entries')
        transaction = Transaction.objects.create(**validated_data)
        for entry_data in entries_data:
            Entry.objects.create(transaction=transaction, **entry_data)
        return transaction
    
####################################################################################################################### Entries END
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################
##################################################################################################################################################################################################################################################








