from django.contrib import admin
from . models import *
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _



@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = ("username", "email", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "groups")

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("email", "first_name", "last_name", "photo")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "password1", "password2", "is_staff", "is_active"),
        }),
    )

    search_fields = ("username", "email")
    ordering = ("username",)




class ModelInline(admin.TabularInline):
    model = Model
    extra = 1
    show_change_link = True


# @admin.register(Brand)
# class BrandAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name')
#     search_fields = ('name',)
#     inlines = [ModelInline]


# @admin.register(Model)
# class ModelAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name', 'brand')
#     list_filter = ('brand',)
#     search_fields = ('name', 'brand__name')


# class ProductImageInline(admin.TabularInline):
#     model = ProductImage
#     extra = 1
#     readonly_fields = ['image_preview']

#     def image_preview(self, obj):
#         if obj.image:
#             return f'<img src="{obj.image.url}" width="100" />'
#         return "-"
#     image_preview.allow_tags = True
#     image_preview.short_description = "Превью"


class ProductBatchInline(admin.TabularInline):
    model = ProductBatch
    extra = 1


# @admin.register(ProductImage)
# class ProductImageAdmin(admin.ModelAdmin):
#     list_display = ('id', 'product', 'alt_text', 'image_preview')
#     search_fields = ('product__name', 'alt_text')

#     def image_preview(self, obj):
#         if obj.image:
#             return f'<img src="{obj.image.url}" width="100" />'
#         return "-"
#     image_preview.allow_tags = True
#     image_preview.short_description = "Превью"


# @admin.register(ProductBatch)
# class ProductBatchAdmin(admin.ModelAdmin):
#     list_display = (
#         'id', 'product', 'batch_number', 'quantity',
#         'arrival_date', 'production_date', 'expiration_date'
#     )
#     list_filter = ('arrival_date', 'expiration_date', 'product')
#     search_fields = ('product__name', 'batch_number')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


    
@admin.register(UnitOfMeasurement)
class UnitOfMeasurementAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


class ProductUnitInline(admin.TabularInline):
    model = ProductUnit
    extra = 1
    autocomplete_fields = ('unit',)
    fields = ('unit', 'conversion_factor', 'is_default_for_sale')
    verbose_name = "Alternatiw ölçeg"
    verbose_name_plural = "Alternatiw ölçegler"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'base_unit', 'wholesale_price', 'retail_price', 'quantity')
    search_fields = ('name',)
    autocomplete_fields = ('base_unit',)
    inlines = [ProductUnitInline]



@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "location")         # отображаемые поля в списке
    list_display_links = ("id", "name")               # по каким полям можно кликать
    search_fields = ("name", "location")              # поля для поиска
    list_filter = ("location",)                       # боковая фильтрация
    ordering = ("name",)                              # сортировка по умолчанию
    list_per_page = 25                                # пагинация

    fieldsets = (
        (None, {
            "fields": ("name", "location")
        }),
    )



@admin.register(PriceChangeHistory)
class PriceChangeHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'product', 
        'price_type', 
        'old_price', 
        'new_price', 
        'difference', 
        'quantity_at_change', 
        'changed_by', 
        'changed_at'
    )
    list_filter = ('price_type', 'changed_by', 'changed_at')
    search_fields = ('product__name', 'changed_by__username')
    readonly_fields = ('difference', 'changed_at')
    ordering = ('-changed_at',)
    fieldsets = (
        (None, {
            'fields': (
                'product', 'price_type', 'old_price', 'new_price', 
                'quantity_at_change', 'difference', 'changed_by', 
                'changed_at', 'notes'
            )
        }),
    )




class CategoryAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    list_display = ('name',)
admin.site.register(Category, CategoryAdmin)



class AgentAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    list_display = ('name',)

admin.site.register(Agent, AgentAdmin)


class EmployeeAdmin(admin.ModelAdmin):
    search_fields = ('name',)
    list_display = ('name',)

admin.site.register(Employee, EmployeeAdmin)



@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type', 'agent')  # Показываем имя, тип и агента
    list_filter = ('type', 'agent')                # Фильтрация по типу и агенту
    search_fields = ('name', 'agent__name')        # Поиск по имени партнера и имени агента
    autocomplete_fields = ['agent']                # Автозаполнение для ForeignKey





############################################################################################################## Fakturalar START

######################### Inline классы для позиций накладных ##############################

class PurchaseInvoiceItemInline(admin.TabularInline):
    model = PurchaseInvoiceItem
    extra = 1
    autocomplete_fields = ['product']
    readonly_fields = ['line_total']

    def line_total(self, obj):
        return obj.get_line_total()
    line_total.short_description = 'Сумма'


class SalesInvoiceItemInline(admin.TabularInline):
    model = SalesInvoiceItem
    extra = 1
    autocomplete_fields = ['product']
    readonly_fields = ['line_total']

    def line_total(self, obj):
        return obj.get_line_total()
    line_total.short_description = 'Сумма'


class PurchaseReturnItemInline(admin.TabularInline):
    model = PurchaseReturnItem
    extra = 1
    autocomplete_fields = ['product']
    readonly_fields = ['line_total']

    def line_total(self, obj):
        return obj.get_line_total()
    line_total.short_description = 'Сумма'


# class SalesReturnItemInline(admin.TabularInline):
#     model = SalesReturnItem
#     extra = 1
#     autocomplete_fields = ['product']
#     readonly_fields = ['line_total']

#     def line_total(self, obj):
#         return obj.get_line_total()
#     line_total.short_description = 'Сумма'


######################### Admin для приходной накладной ##############################

@admin.register(PurchaseInvoice)
class PurchaseInvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'supplier', 'created_by', 'created_at', 'total_amount',
        'is_canceled', 'canceled_at', 'canceled_by', 'cancel_reason'
    ]
    list_filter = ['is_canceled', 'supplier', 'created_at']
    search_fields = ['id', 'supplier__name', 'created_by__username', 'cancel_reason']
    autocomplete_fields = ['supplier', 'created_by', 'canceled_by']
    readonly_fields = ['total_amount', 'created_at', 'canceled_at']
    inlines = [PurchaseInvoiceItemInline]

    actions = ['cancel_selected_invoices']

    @admin.action(description="Отменить выбранные накладные")
    def cancel_selected_invoices(self, request, queryset):
        canceled_count = 0
        for invoice in queryset:
            if not invoice.is_canceled:
                invoice.is_canceled = True
                invoice.canceled_at = now()
                invoice.canceled_by = request.user
                invoice.cancel_reason = "Отменено через админку"
                try:
                    invoice.full_clean()
                    invoice.save()
                    canceled_count += 1
                except ValidationError as e:
                    self.message_user(request, f"Ошибка отмены накладной {invoice.id}: {e}", level='error')
        self.message_user(request, f"Отменено накладных: {canceled_count}")

######################### Admin для расходной накладной ##############################

@admin.register(SalesInvoice)
class SalesInvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'buyer', 'delivered_by', 'created_by', 'created_at', 'total_amount'
    ]
    list_filter = ['buyer', 'delivered_by', 'created_at', 'isEntry']
    search_fields = ['id', 'buyer__name', 'created_by__username']
    autocomplete_fields = ['buyer', 'delivered_by', 'created_by']
    readonly_fields = ['total_amount', 'created_at']
    inlines = [SalesInvoiceItemInline]
######################### Admin для возврата по приходу ##############################

@admin.register(PurchaseReturnInvoice)
class PurchaseReturnInvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'original_invoice', 'created_by', 'created_at', 'total_amount', 'reason'
    ]
    list_filter = ['created_at', 'original_invoice__supplier']
    search_fields = ['id', 'original_invoice__id', 'created_by__username', 'reason']
    autocomplete_fields = ['original_invoice', 'created_by']
    readonly_fields = ['total_amount', 'created_at']
    inlines = [PurchaseReturnItemInline]

######################### Admin для возврата по продаже ##############################

# @admin.register(SalesReturnInvoice)
# class SalesReturnInvoiceAdmin(admin.ModelAdmin):
#     list_display = [
#         'id', 'original_invoice', 'created_by', 'created_at', 'total_amount', 'reason'
#     ]
#     list_filter = ['created_at', 'original_invoice__buyer']
#     search_fields = ['id', 'original_invoice__id', 'created_by__username', 'reason']
#     autocomplete_fields = ['original_invoice', 'created_by']
#     readonly_fields = ['total_amount', 'created_at']
#     inlines = [SalesReturnItemInline]


############################################################################################################## Fakturalar END


############################################################################################################## Accounts START
@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'symbol')
    search_fields = ('code', 'name')
    ordering = ('code',)


@admin.register(CurrencyRate)
class CurrencyRateAdmin(admin.ModelAdmin):
    list_display = ('currency', 'rate', 'date')            # Отображаемые колонки
    list_filter = ('currency', 'date')                     # Фильтры справа
    search_fields = ('currency__code',)                    # Поиск по коду валюты
    ordering = ('-date',)                                  # Сортировка по дате (сначала новые)
    date_hierarchy = 'date'                                # Навигация по датам
    list_per_page = 25                                     # Пагинация


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('number', 'name', 'type', 'currency')
    list_filter = ('type', 'currency')
    search_fields = ('number', 'name')
    ordering = ('number',)


class EntryInline(admin.TabularInline):
    model = Entry
    extra = 0
    readonly_fields = ('account', 'debit', 'credit')
    can_delete = False


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('date', 'description', 'partner')
    list_filter = ('partner',)
    search_fields = ('description', 'partner__name')
    date_hierarchy = 'date'
    ordering = ('-date',)
    inlines = [EntryInline]
    readonly_fields = ('date',)


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'account', 'debit', 'credit')
    list_filter = ('account__type', 'account__currency')
    search_fields = ('transaction__description', 'account__name', 'account__number')
    ordering = ('-transaction__date',)
############################################################################################################## Accounts END
