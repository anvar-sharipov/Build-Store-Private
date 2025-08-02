from rest_framework import serializers
from ..models import *
from .base_serializers import *
from .sale_invoice_serializers import *



# class AccountSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Account
#         fields = ['id', 'number', 'name', 'type']



class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'number', 'name', 'type', 'description', 'parent', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_number(self, value):
        import re
        if not re.match(r'^\d+(\.\d+)*$', value):
            raise serializers.ValidationError("Номер счета должен содержать только цифры и точки, например '50' или '90.2'")
        return value

    def validate_type(self, value):
        valid_types = [choice[0] for choice in Account.ACCOUNT_TYPES] if hasattr(Account, 'ACCOUNT_TYPES') else ['asset', 'liability', 'income', 'expense', 'both']
        if value not in valid_types:
            raise serializers.ValidationError("Недопустимый тип счета.")
        return value



# dlya wywoda date w EntrySerializer
class TransactionSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'invoice']


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
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Entry
        fields = ['id', 'date', 'transaction', 'transaction_obj', 'account', 'account_id', 'debit', 'credit', 'running_balance', 'product_name']

    def get_running_balance(self, obj):
        # будем подставлять позже в view через context
        return self.context.get('running_balances', {}).get(obj.id)


class TransactionSerializer(serializers.ModelSerializer):
    entries = EntrySerializer(many=True, read_only=True)
    invoice_obj = SalesInvoiceSerializer(source='invoice', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'invoice', 'partner', 'entries', 'invoice_obj']


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
    