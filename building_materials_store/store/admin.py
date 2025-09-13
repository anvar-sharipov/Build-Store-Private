from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.db.models import Sum
from .models import *
from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib.contenttypes.models import ContentType
from django import forms

# Фильтры для админки
class ActiveFilter(admin.SimpleListFilter):
    title = 'Активность'
    parameter_name = 'is_active'

    def lookups(self, request, model_admin):
        return (
            ('yes', 'Да'),
            ('no', 'Нет'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(is_active=True)
        if self.value() == 'no':
            return queryset.filter(is_active=False)


# Кастомный UserAdmin
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'photo_tag')
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительно', {'fields': ('photo',)}),
    )

    def photo_tag(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="50" height="50" />', obj.photo.url)
        return "-"
    photo_tag.short_description = 'Фото'

admin.site.register(CustomUser, CustomUserAdmin)


# Единицы измерения
@admin.register(UnitOfMeasurement)
class UnitOfMeasurementAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


# Изображения товара - inline
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Превью'


# Единицы товара - inline
class ProductUnitInline(admin.TabularInline):
    model = ProductUnit
    extra = 1


# Теги товара - inline
class ProductTagsInline(admin.TabularInline):
    model = Product.tags.through
    extra = 1
    verbose_name = "Тег"
    verbose_name_plural = "Теги"


# История цен - inline
class PriceChangeHistoryInline(admin.TabularInline):
    model = PriceChangeHistory
    extra = 0
    readonly_fields = ('changed_at', 'changed_by', 'difference')
    can_delete = False

    def has_add_permission(self, request, obj):
        return False


# Остатки на складах - inline
class WarehouseProductInline(admin.TabularInline):
    model = WarehouseProduct
    extra = 1
    readonly_fields = ('warehouse', 'available_quantity')
    
    def available_quantity(self, obj):
        return obj.quantity
    available_quantity.short_description = 'Доступно'


# Админка товаров
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'sku', 'category', 'retail_price', 'wholesale_price', 'total_quantity', 'is_active')
    list_filter = ('category', 'brand', 'is_active')
    search_fields = ('name', 'sku', 'qr_code')
    readonly_fields = ('created_at', 'updated_at', 'volume_calculated', 'total_quantity')
    inlines = [ProductImageInline, ProductUnitInline, ProductTagsInline, PriceChangeHistoryInline, WarehouseProductInline]
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'sku', 'qr_code', 'category', 'is_active')
        }),
        ('Цены', {
            'fields': ('purchase_price', 'retail_price', 'wholesale_price', 'discount_price', 'firma_price')
        }),
        ('Производитель', {
            'fields': ('brand', 'model')
        }),
        ('Характеристики', {
            'fields': ('base_unit', 'weight', 'length', 'width', 'height', 'volume_calculated')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def volume_calculated(self, obj):
        return obj.volume
    volume_calculated.short_description = 'Объем (м³)'
    
    def total_quantity(self, obj):
        return obj.total_quantity
    total_quantity.short_description = 'Общее количество'
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


# Бренды
@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count')
    search_fields = ('name',)
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Товаров'


# Модели
@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'product_count')
    list_filter = ('brand',)
    search_fields = ('name', 'brand__name')
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Товаров'


# Категории
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    list_filter = ('name',)
    search_fields = ('name',)
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Товаров'


# Теги
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_count')
    search_fields = ('name',)
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Товаров'


# Склады
@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')
    search_fields = ('name', 'location')
    
    # def product_count(self, obj):
    #     return obj.stock_items.count()
    # product_count.short_description = 'Товаров'


# Остатки на складах
@admin.register(WarehouseProduct)
class WarehouseProductAdmin(admin.ModelAdmin):
    list_display = ('warehouse', 'product', 'quantity')
    list_filter = ('warehouse',)
    search_fields = ('product__name', 'warehouse__name')
    

# История цен
@admin.register(PriceChangeHistory)
class PriceChangeHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price_type', 'old_price', 'new_price', 'difference', 'changed_at', 'changed_by')
    list_filter = ('price_type', 'changed_at')
    search_fields = ('product__name',)
    readonly_fields = ('changed_at', 'difference')
    
    def save_model(self, request, obj, form, change):
        if not obj.changed_by:
            obj.changed_by = request.user
        super().save_model(request, obj, form, change)


# Агенты
@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('name', 'partner_count')
    search_fields = ('name',)
    
    def partner_count(self, obj):
        return obj.partner_set.count()
    partner_count.short_description = 'Партнеров'


# Партнеры
@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'balance', 'agent', 'invoice_count')
    list_filter = ('type', 'agent')
    search_fields = ('name',)
    readonly_fields = ('balance',)
    
    def invoice_count(self, obj):
        return obj.salesinvoice_set.count()
    invoice_count.short_description = 'Накладных'

# class PartnerAccountInline(admin.TabularInline):
#     model = PartnerAccount
#     extra = 1
#     autocomplete_fields = ('account',)
#     min_num = 0


# @admin.register(Partner)
# class PartnerAdmin(admin.ModelAdmin):
#     list_display = ('name', 'type', 'balance')
#     search_fields = ('name',)
#     list_filter = ('type',)
#     inlines = [PartnerAccountInline]
#     autocomplete_fields = ('agent',)
    
    
# @admin.register(PartnerAccount)
# class PartnerAccountAdmin(admin.ModelAdmin):
#     list_display = ('partner', 'account', 'role')
#     list_filter = ('role',)
#     search_fields = ('partner__name', 'account__number', 'account__name')
#     autocomplete_fields = ('partner', 'account')  # Удобный выбор при большом количестве данных

#     # Для удобства в форме можно задать порядок полей (необязательно)
#     fields = ('partner', 'account', 'role')


# Сотрудники
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'delivered_invoices')
    search_fields = ('name',)
    
    def delivered_invoices(self, obj):
        return obj.salesinvoice_set.count()
    delivered_invoices.short_description = 'Доставленных накладных'


# Позиции накладных - inline
class SalesInvoiceItemInline(admin.TabularInline):
    model = SalesInvoiceItem
    extra = 1
    readonly_fields = ('line_total',)
    
    def line_total(self, obj):
        return obj.get_line_total()
    line_total.short_description = 'Сумма'


# Накладные продаж
@admin.register(SalesInvoice)
class SalesInvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'created_at', 'warehouse', 'total_amount', 'paid_amount', 'is_paid', 'created_by', 'type_price')
    list_filter = ('created_at', 'warehouse', 'buyer', 'type_price')
    search_fields = ('buyer__name', 'id')
    readonly_fields = ('created_at', 'total_amount', 'paid_amount', 'is_paid')
    inlines = [SalesInvoiceItemInline]
    fieldsets = (
        ('Основная информация', {
            'fields': ('buyer', 'warehouse', 'created_by', 'created_at', 'invoice_date')
        }),
        ('Доставка', {
            'fields': ('delivered_by',)
        }),
        ('Финансы', {
            'fields': ('total_amount', 'paid_amount', 'is_paid')
        }),
        ('Примечания', {
            'fields': ('note',)
        }),
    )
    
    def paid_amount(self, obj):
        return obj.total_pay_summ or 0
    paid_amount.short_description = 'Оплачено'
    
    def is_paid(self, obj):
        return obj.total_pay_summ and obj.total_pay_summ >= obj.total_amount
    is_paid.boolean = True
    is_paid.short_description = 'Оплачено полностью'
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# Счета
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('number', 'name', 'type', 'balance')
    list_filter = ('type',)
    search_fields = ('number', 'name')
    
    def balance(self, obj):
        debit = Entry.objects.filter(account=obj).aggregate(Sum('debit'))['debit__sum'] or 0
        credit = Entry.objects.filter(account=obj).aggregate(Sum('credit'))['credit__sum'] or 0
        return debit - credit
    balance.short_description = 'Сальдо'


# Проводки - inline
class EntryInline(admin.TabularInline):
    model = Entry
    extra = 2
    readonly_fields = ('balance_effect',)
    
    def balance_effect(self, obj):
        return obj.debit - obj.credit
    balance_effect.short_description = 'Влияние на баланс'


# Хозяйственные операции
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'description', 'partner', 'invoice', 'total_amount')
    list_filter = ('date', 'partner')
    search_fields = ('description', 'partner__name')
    inlines = [EntryInline]
    
    def total_amount(self, obj):
        return obj.entries.aggregate(total=Sum('debit'))['total'] or 0
    total_amount.short_description = 'Сумма'


# Дополнительные настройки админки
admin.site.site_header = "Панель управления складом"
admin.site.site_title = "Администрирование"
admin.site.index_title = "Главная"


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'transaction',
        'account',
        'product',
        'warehouse',
        'debit',
        'credit',
    )
    list_filter = ('account', 'warehouse')
    search_fields = (
        'transaction__id',
        'account__name',
        'account__number',
        'product__name',
        'warehouse__name',
    )
    autocomplete_fields = ['transaction', 'account', 'product', 'warehouse']
    
    
    
# @admin.register(Transaction)
# class TransactionAdmin(admin.ModelAdmin):
#     list_display = ('date', 'partner_name', 'short_description', 'invoice_link')
#     list_filter = ('date', 'partner')
#     search_fields = ('description', 'partner__name', 'invoice__number')
#     date_hierarchy = 'date'
#     ordering = ('-date',)

#     def short_description(self, obj):
#         return (obj.description[:75] + '...') if len(obj.description) > 75 else obj.description
#     short_description.short_description = 'Описание'

#     def partner_name(self, obj):
#         return obj.partner.name if obj.partner else '—'
#     partner_name.short_description = 'Партнер'

#     def invoice_link(self, obj):
#         if obj.invoice:
#             return f"Счет №{obj.invoice.number}"
#         return '—'
#     invoice_link.short_description = 'Счет'












 
############################################################################################################################### Форма для PostingRule с фильтром content_object START
# class PostingRuleForm(forms.ModelForm):
#     class Meta:
#         model = PostingRule
#         fields = '__all__'

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)

#         # Ограничиваем content_type только для нужных моделей
#         self.fields['content_type'].queryset = ContentType.objects.filter(
#             model__in=['partner', 'salesinvoiceitem', 'product', 'warehouse']
#         )

#         # object_id можно оставить пустым для общих правил
#         self.fields['object_id'].help_text = "Оставьте пустым для общих правил или правил по типу партнёра"

# @admin.register(Operation)
# class OperationAdmin(admin.ModelAdmin):
#     list_display = ('name', 'code')
#     search_fields = ('name', 'code')

# @admin.register(PostingRule)
# class PostingRuleAdmin(admin.ModelAdmin):
#     form = PostingRuleForm
#     list_display = ('operation', 'display_object', 'partner_type', 'debit_account', 'credit_account', 'description')
#     list_filter = ('operation', 'partner_type', 'content_type')
#     search_fields = ('description',)

#     def display_object(self, obj):
#         if obj.content_object:
#             return f"{obj.content_object}"
#         return "Общее правило"
#     display_object.short_description = "Объект"

# # Опционально: добавить inline в Partner, чтобы сразу создавать правила для конкретного партнёра
# from django.contrib.contenttypes.admin import GenericTabularInline

# class PostingRuleInline(GenericTabularInline):
#     model = PostingRule
#     ct_field = "content_type"
#     ct_fk_field = "object_id"
#     extra = 0
############################################################################################################################### Форма для PostingRule с фильтром content_object END



@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('code', 'name')
    search_fields = ('code', 'name')
    ordering = ('code',)


@admin.register(CustomePostingRule)
class CustomePostingRuleAdmin(admin.ModelAdmin):
    list_display = ('operation', 'directory_type', 'debit_account', 'credit_account', 'amount_type', 'description')
    list_filter = ('operation', 'directory_type', 'amount_type')
    search_fields = ('operation__name', 'directory_type', 'debit_account__code', 'credit_account__code', 'description')
    ordering = ('operation', 'directory_type')
    


@admin.register(WarehouseAccount)
class WarehouseAccountAdmin(admin.ModelAdmin):
    list_display = ('warehouse', 'account', 'description')
    list_filter = ('warehouse',)
    search_fields = ('warehouse__name', 'account__code')
    
    
    
    
########################################################################################################################################################################################################################
######################################################################## Приход накладная (faktura) START

# Inline для элементов накладной
class PurchaseInvoiceItemInline(admin.TabularInline):
    model = PurchaseInvoiceItem
    extra = 1
    fields = ('product', 'quantity', 'purchase_price', 'get_line_total')
    readonly_fields = ('get_line_total',)
    autocomplete_fields = ('product',)

    def get_line_total(self, obj):
        return obj.get_line_total()
    get_line_total.short_description = "Сумма по позиции"


# Основная накладная
@admin.register(PurchaseInvoice)
class PurchaseInvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice_date', 'supplier', 'transaction_type', 'total_amount', 'total_pay_summ', 'isEntry', 'created_by', 'created_at')
    list_filter = ('transaction_type', 'supplier', 'warehouse', 'isEntry', 'created_at')
    search_fields = ('supplier__name', 'note', 'created_by__username')
    readonly_fields = ('created_at',)
    inlines = [PurchaseInvoiceItemInline]
    autocomplete_fields = ('supplier', 'warehouse', 'received_by', 'created_by')
    fieldsets = (
        (None, {
            'fields': ('supplier', 'transaction_type', 'invoice_date', 'warehouse', 'received_by', 'created_by', 'note')
        }),
        ('Финансовые данные', {
            'fields': ('total_amount', 'total_pay_summ', 'isEntry')
        }),
    )

    # Автоподсчёт total_amount при сохранении
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        obj.total_amount = obj.calculate_total()
        obj.save()


# Если хочешь, можно отдельно зарегистрировать Product, Partner и т.д.
@admin.register(PurchaseInvoiceItem)
class PurchaseInvoiceItemAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'product', 'quantity', 'purchase_price', 'get_line_total')
    list_filter = ('product',)
    search_fields = ('product__name', 'invoice__supplier__name')
    readonly_fields = ('get_line_total',)

    def get_line_total(self, obj):
        return obj.get_line_total()
    get_line_total.short_description = "Сумма по позиции"

######################################################################## Приход накладная (faktura) END
########################################################################################################################################################################################################################
