from django.db import models, IntegrityError, transaction
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class CustomUser(AbstractUser):
    photo = models.ImageField(upload_to='user_photos/', null=True, blank=True, default='images/avatar.png')

User = get_user_model()


class UnitOfMeasurement(models.Model):
    name = models.CharField(max_length=100, verbose_name="Наименование")  # Например: "литр", "банка", "коробка"

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Единица измерения'
        verbose_name_plural = 'Единицы измерения'


class Product(models.Model):
    name = models.CharField(verbose_name='Наименование', max_length=1000, unique=True) # 
    description = models.TextField(verbose_name='Описание', blank=True, null=True)
    base_unit = models.ForeignKey('UnitOfMeasurement', verbose_name='Базовая единица', on_delete=models.PROTECT)
    category = models.ForeignKey('Category', verbose_name='Категория', on_delete=models.PROTECT, blank=True, null=True)
    sku = models.CharField(verbose_name='Артикул (SKU)', max_length=100, unique=True, null=True, blank=True)
    qr_code = models.CharField(verbose_name='QR-код', max_length=1000, blank=True, null=True, unique=True)
    purchase_price = models.DecimalField(verbose_name='Цена закупки', max_digits=10, decimal_places=3, default=0)
    retail_price = models.DecimalField(verbose_name='Розничная цена', max_digits=10, decimal_places=3, default=0)
    wholesale_price = models.DecimalField(verbose_name='Оптовая цена', max_digits=10, decimal_places=3, default=0)
    discount_price = models.DecimalField(verbose_name='Цена со скидкой', max_digits=10, decimal_places=3, blank=True, null=True)
    # Poprosil Makem aga sdelat porogowuyu senu (purchase_price) esho odnu, ne ponyal pochemu no sdelayu raz poprosili
    firma_price = models.DecimalField(verbose_name='Цена Firma', max_digits=10, decimal_places=3, blank=True, null=True)
    brand = models.ForeignKey('Brand', verbose_name='Бренд', on_delete=models.PROTECT, blank=True, null=True)
    model = models.ForeignKey('Model', verbose_name='Модель', on_delete=models.PROTECT, blank=True, null=True)
    weight = models.DecimalField(verbose_name='Вес (кг)', max_digits=10, decimal_places=3, blank=True, null=True)
    volume = models.DecimalField(verbose_name='Объём (м³)', max_digits=10, decimal_places=4, blank=True, null=True)
    length = models.DecimalField(verbose_name='Длина (см)', max_digits=10, decimal_places=2, blank=True, null=True)
    width = models.DecimalField(verbose_name='Ширина (см)', max_digits=10, decimal_places=2, blank=True, null=True)
    height = models.DecimalField(verbose_name='Высота (см)', max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(verbose_name='Активен', default=True)
    created_at = models.DateTimeField(verbose_name='Создан', auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name='Обновлён', auto_now=True)
    tags = models.ManyToManyField('Tag', verbose_name='Теги', blank=True)
    # weight volume length width height
    @property 
    def total_quantity(self):
        return self.warehouse_products.aggregate(
            total=models.Sum('quantity')
        )['total'] or 0

    def get_total_quantity(self):
        # Пытаемся получить аннотированное значение (если есть)
        if hasattr(self, 'total_quantity') and self.total_quantity is not None:
            return self.total_quantity
        # Иначе считаем из базы
        return self.warehouse_products.aggregate(total=Sum('quantity'))['total'] or 0


    # В модели Product добавь __init__, чтобы запомнить старые цены при загрузке:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_purchase_price = self.purchase_price
        self._original_retail_price = self.retail_price
        self._original_wholesale_price = self.wholesale_price
        self._original_discount_price = self.discount_price


    def save(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        if not self.sku:
            for _ in range(10):  # Попытки сгенерировать уникальный sku
                last_id = Product.objects.order_by('-id').first()
                next_id = (last_id.id + 1) if last_id else 1
                self.sku = f"PRD{str(next_id).zfill(4)}"

                if not self.qr_code:
                    self.qr_code = self.sku

                try:
                    with transaction.atomic():
                        # self.full_clean()  # Проверка, что sku и qr_code теперь валидны
                        super().save(*args, **kwargs)
                    return
                except IntegrityError:
                    # Если sku уже существует, пробуем с новым next_id
                    continue
            raise Exception("Не удалось сохранить товар после 10 попыток")
        else:
            if not self.qr_code:
                self.qr_code = self.sku
            # self.full_clean()  # Проверка перед сохранением
            super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'


class Warehouse(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Название склада")
    location = models.CharField(max_length=255, blank=True, verbose_name="Адрес (необязательно)")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
   
    class Meta:
        verbose_name = "Склад"
        verbose_name_plural = "Склады"

    def __str__(self):
        return self.name
    

class WarehouseProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="warehouse_products")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="warehouse_products")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        unique_together = ("product", "warehouse")
        verbose_name = "Остаток на складе"
        verbose_name_plural = "Остатки на складах"

    def __str__(self):
        return f"{self.product.name} на {self.warehouse.name}: {self.quantity}"
    


class FreeProduct(models.Model):
    main_product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='free_items',
        verbose_name='Основной товар'
    )
    gift_product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='used_as_free',
        verbose_name='Бесплатный товар'
    )
    quantity_per_unit = models.DecimalField(
        verbose_name='Количество на единицу основного товара',
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        verbose_name = 'Бесплатный товар'
        verbose_name_plural = 'Бесплатные товары'

    def __str__(self):
        return f"{self.quantity_per_unit} x {self.gift_product.name} к {self.main_product.name}"

    

class PriceChangeHistory(models.Model):
    PRICE_TYPE_CHOICES = [
        ('purchase', 'Цена закупки'),
        ('retail', 'Розничная цена'),
        ('wholesale', 'Оптовая цена'),
        ('discount', 'Цена со скидкой'),
    ]

    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='price_changes')
    price_type = models.CharField(max_length=20, choices=PRICE_TYPE_CHOICES, verbose_name='Тип цены')
    old_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Старая цена')
    new_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Новая цена')
    quantity_at_change = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Количество на складе')
    difference = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Прибыль/Убыток', editable=False)
    changed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, verbose_name='Кто изменил')
    changed_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата изменения')
    notes = models.TextField(blank=True, null=True, verbose_name='Комментарий')
    warehouse = models.ForeignKey('Warehouse', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='Склад')



    class Meta:
        verbose_name = 'История изменения цены'
        verbose_name_plural = 'История изменения цен'
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['product', 'price_type']),
        ]

    def save(self, *args, **kwargs):
        self.difference = (self.new_price - self.old_price) * self.quantity_at_change
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} | {self.get_price_type_display()}: {self.old_price} → {self.new_price} (Δ {self.difference})"


class Brand(models.Model):
    name = models.CharField(verbose_name='Бренд', max_length=255, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Бренд'
        verbose_name_plural = 'Бренды'


class Model(models.Model):
    brand = models.ForeignKey(Brand, verbose_name='Бренд', on_delete=models.CASCADE)
    name = models.CharField(verbose_name='Модель', max_length=255)

    def __str__(self):
        return f"{self.brand.name} - {self.name}"

    class Meta:
        verbose_name = 'Модель'
        verbose_name_plural = 'Модели'
        unique_together = ('brand', 'name')


def product_image_path(instance, filename):
    return f'products/{instance.product.id}/{filename}'


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE, verbose_name='Товар')
    image = models.ImageField(upload_to=product_image_path, verbose_name='Изображение')
    alt_text = models.CharField(max_length=255, blank=True, null=True, verbose_name='Альтернативный текст')

    class Meta:
        verbose_name = 'Изображение товара'
        verbose_name_plural = 'Изображения товаров'
        constraints = [
            models.UniqueConstraint(fields=['product', 'image'], name='unique_product_image')
        ]


#  Пример «4K», «LED», «Скидка» «Новинка», «Эко», «Популярное».
class Tag(models.Model):
    name = models.CharField(verbose_name='Тег', max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Тег'
        verbose_name_plural = 'Теги'


class ProductUnit(models.Model):
    product = models.ForeignKey(Product, related_name='units', on_delete=models.CASCADE)
    unit = models.ForeignKey(UnitOfMeasurement, on_delete=models.PROTECT)
    conversion_factor = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        help_text="Сколько базовых единиц в 1 этой единице (напр: 1 банка = 18 литров → 18)"
    )
    is_default_for_sale = models.BooleanField(default=False, help_text="Основная единица для продажи")

    def __str__(self):
        return f"{self.product.name} - {self.unit.name} ({self.conversion_factor} {self.product.base_unit.name})"

    class Meta:
        verbose_name = 'ölçeg görnüşi'
        verbose_name_plural = 'ölçeg görnüşleri'
        constraints = [
            models.UniqueConstraint(fields=['product', 'unit'], name='unique_product_unit')
        ]


class Category(models.Model):
    name = models.CharField(verbose_name='kategoriýa', max_length=250, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'kategoriýa'
        verbose_name_plural = 'kategoriýalar'


class Agent(models.Model):
    name = models.CharField(verbose_name='Agent', max_length=2000)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Agent'
        verbose_name_plural = 'Agentler'


class Partner(models.Model):
    BUYER = 'klient'
    SUPPLIER = 'supplier'
    BOTH = 'both'
    FOUNDER = 'founder'  # учредитель

    PARTNER_TYPE_CHOICES = [
        (BUYER, 'Alyjy (Покупатель)'),
        (SUPPLIER, 'Üpjünçi (Поставщик)'),
        (BOTH, 'Alyjy we Üpjünçi (Покупатель и поставщик)'),
        (FOUNDER, 'Uchreditel (Учредитель)'),
    ]

    name = models.CharField(verbose_name='Partneryn ady', max_length=2000, unique=True)
    # СВЯЗЬ С AGENT
    agent = models.ForeignKey('Agent', on_delete=models.PROTECT, null=True, blank=True, verbose_name='Agent'
    )
    type = models.CharField(max_length=20, choices=PARTNER_TYPE_CHOICES, default=SUPPLIER, verbose_name='Partneriň görnüşi')
    # account = models.ForeignKey('Account', on_delete=models.PROTECT, null=True, blank=True, verbose_name='Account')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name='Balans (deb/kred)')
    is_active = models.BooleanField(default=True, verbose_name='Активен')

    def __str__(self):
        return f'{self.name} ({self.get_type_display()})'
    
   
    # @property
    # def current_balance(self):
    #     # Считаем обороты по дебету и кредиту партнёра до даты накладной (включительно)
    #     entries = Entry.objects.filter(transaction__partner=self, transaction__date__lte=timezone.now())

    #     debit_sum = entries.aggregate(total_debit=Sum('debit'))['total_debit'] or Decimal('0')
    #     credit_sum = entries.aggregate(total_credit=Sum('credit'))['total_credit'] or Decimal('0')

    #     balance = debit_sum - credit_sum
    #     return balance


    class Meta:
        verbose_name = 'Partner'
        verbose_name_plural = 'Partnerler'


# class PartnerAccount(models.Model):
#     partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name='partner_accounts')
#     account = models.ForeignKey('Account', on_delete=models.PROTECT)
    
#     ROLE_CHOICES = [
#         ('klient', 'Покупатель'),
#         ('supplier', 'Поставщик'),
#         ('both', 'Покупатель и поставщик'),
#         ('founder', 'Учредитель'),
#     ]
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES, null=False, blank=False)

#     class Meta:
#         unique_together = ('partner', 'account', 'role')

#     def __str__(self):
#         return f"{self.partner.name} - {self.account.number} ({self.get_role_display()})"

class Employee(models.Model):
    name = models.CharField(verbose_name='Işgär', max_length=2000)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Işgär'
        verbose_name_plural = 'Işgärler'


########################################################################################################################################################################################################################
######################################################################## Расходная накладная (faktura) START
class SalesInvoice(models.Model):  # накладная по продаже
    TYPE_PRICE_CHOICES = [
        ('wholesale', 'Опт'),
        ('retail', 'Розница'),
    ]

    # currency = models.ForeignKey('Currency', on_delete=models.PROTECT, verbose_name='Валюта', null=True, blank=True)
    buyer = models.ForeignKey('Partner', on_delete=models.PROTECT, limit_choices_to={'type__in': ['klient', 'both']}, verbose_name='Покупатель', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Создал')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания (автоматически)')
    invoice_date = models.DateTimeField(verbose_name='Дата создания (фактура)')
    warehouse = models.ForeignKey('Warehouse', on_delete=models.PROTECT, verbose_name='Склад', null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name='Общая сумма')
    delivered_by = models.ForeignKey('Employee', on_delete=models.PROTECT, verbose_name='Доставил', null=True, blank=True)
    note = models.TextField(null=True, blank=True, verbose_name='Примечание')
    total_pay_summ = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="Сумма оплаты", null=True, blank=True)
    isEntry = models.BooleanField(default=False, verbose_name="Проводка создана")
    type_price = models.CharField(max_length=10, choices=TYPE_PRICE_CHOICES, default='wholesale', verbose_name="Тип продажи")

    class Meta:
        verbose_name = 'Расходная накладная'
        verbose_name_plural = 'Расходные накладные'
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['buyer', 'created_at']),
        ]

    def __str__(self):
        return f"Продажа №{self.id} от {self.created_at.strftime('%Y-%m-%d')}"

    def calculate_total(self):
        return sum(item.get_line_total() for item in self.items.all())

    # def save(self, *args, **kwargs):
    #     if self.pk is not None:  # Объект уже сохранён
    #         self.total_amount = self.calculate_total()
    #     else:
    #         # Для нового объекта пока поставим total_amount 0, потом обновим после создания items
    #         if not self.total_amount:
    #             self.total_amount = 0
    #     super().save(*args, **kwargs)


class SalesInvoiceItem(models.Model):
    invoice = models.ForeignKey(
        'SalesInvoice',
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey('Product', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_gift = models.BooleanField(default=False, verbose_name="Бесплатный товар")

    purchase_price = models.DecimalField(verbose_name='Цена закупки', max_digits=10, decimal_places=2, default=0)
    retail_price = models.DecimalField(verbose_name='Розничная цена', max_digits=10, decimal_places=2, default=0)
    wholesale_price = models.DecimalField(verbose_name='Оптовая цена', max_digits=10, decimal_places=2, default=0)

    def get_line_total(self):
        quantity = self.quantity or 0
        sale_price = self.sale_price or 0
        return quantity * sale_price
    
    def get_total_purchase(self):
        quantity = self.quantity or 0
        purchase_price = self.purchase_price or 0
        return quantity * purchase_price
    
    def get_total_retail(self):
        quantity = self.quantity or 0
        retail_price = self.retail_price or 0
        return quantity * retail_price
    
    def get_total_wholesale(self):
        quantity = self.quantity or 0
        wholesale_price = self.wholesale_price or 0
        return quantity * wholesale_price
######################################################################## Расходная накладная (faktura) END
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
######################################################################## Приход накладная (faktura) START

class PurchaseInvoice(models.Model):
    TRANSACTION_TYPE_CHOICES = [('purchase', 'Покупка'), ('return', 'Возврат'),]
    
    supplier = models.ForeignKey('Partner', on_delete=models.PROTECT, verbose_name='Поставщик', null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES, default='purchase', verbose_name='Тип операции')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Создал')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания (автоматически)')
    invoice_date = models.DateTimeField(verbose_name='Дата накладной (фактура)')
    warehouse = models.ForeignKey('Warehouse', on_delete=models.PROTECT, verbose_name='Склад', null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name='Общая сумма')
    received_by = models.ForeignKey('Employee', on_delete=models.PROTECT, verbose_name='Принял', null=True, blank=True)
    note = models.TextField(null=True, blank=True, verbose_name='Примечание')
    total_pay_summ = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="Сумма оплаты", null=True, blank=True)
    isEntry = models.BooleanField(default=False, verbose_name="Проводка создана")

    class Meta:
        verbose_name = 'Приходная накладная'
        verbose_name_plural = 'Приходные накладные'
        indexes = [models.Index(fields=['created_at']), models.Index(fields=['supplier', 'created_at'])]

    def __str__(self):
        return f"Закупка №{self.id} от {self.created_at.strftime('%Y-%m-%d')}"

    def calculate_total(self):
        return sum(item.get_line_total() for item in self.items.all())


class PurchaseInvoiceItem(models.Model):
    invoice = models.ForeignKey('PurchaseInvoice', on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('Product', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)

    def get_line_total(self):
        return (self.quantity or 0) * (self.purchase_price or 0)

######################################################################## Приход накладная (faktura) END
########################################################################################################################################################################################################################

# Типы счетов
ACCOUNT_TYPES = [
    ('asset', 'Актив'),
    ('liability', 'Пассив'),
    ('income', 'Доход'),
    ('expense', 'Расход'),
    ('both', 'Актив и Пассив'),
]

# Счёт
# class Account(models.Model):
#     number = models.CharField(max_length=20, unique=True)       # Пример: '50.1', '90.2'
#     name = models.CharField(max_length=255)                     # Название: 'Касса в USD'
#     type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)

#     def __str__(self):
#         return f"{self.number} {self.name}"

class Account(models.Model):
    number = models.CharField(max_length=20, unique=True, help_text="Номер счета, например: '50', '90.2', '60.1'")
    name = models.CharField(max_length=255, help_text="Название счета, например: 'Касса в USD'")
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, help_text="Тип счета: актив, пассив, доход, расход")
    description = models.TextField(blank=True, null=True, help_text="Дополнительное описание счета (необязательно)")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children', help_text="Если счет вложенный, укажите родительский счет")
    is_active = models.BooleanField(default=True, help_text="Активен ли счет (можно отключить старые счета)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['number']
        verbose_name = 'Счёт'
        verbose_name_plural = 'Счета'

    def __str__(self):
        return f"{self.number} {self.name}"
    

# # Хозяйственная операция
class Transaction(models.Model):
    description = models.TextField(verbose_name='Описание операции')
    date = models.DateTimeField(verbose_name='Дата операции')
    invoice = models.ForeignKey(SalesInvoice, null=True, blank=True, on_delete=models.SET_NULL)
    partner = models.ForeignKey(Partner, null=True, blank=True, on_delete=models.SET_NULL, verbose_name='Партнер')

    def __str__(self):
        return f"{self.date.strftime('%Y-%m-%d %H:%M')} — {self.description}"

    class Meta:
        verbose_name = 'Хозяйственная операция'
        verbose_name_plural = 'Хозяйственные операции'
        ordering = ['-date']
    

# # Проводка (двойная запись: дебет и кредит)
class Entry(models.Model):
    transaction = models.ForeignKey(Transaction, related_name='entries', on_delete=models.CASCADE, verbose_name='Операция')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, verbose_name='Счет')
    # partner = models.ForeignKey(Partner, null=True, blank=True, on_delete=models.SET_NULL, verbose_name='Партнер (субконто)')
    product = models.ForeignKey('Product', null=True, blank=True, on_delete=models.SET_NULL)
    warehouse = models.ForeignKey('Warehouse', null=True, blank=True, on_delete=models.SET_NULL)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name='Дебет')
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name='Кредит')
    
    class Meta:
        indexes = [
            models.Index(fields=["account"]),
            models.Index(fields=["transaction"]),
        ]

    def __str__(self):
        return f"{self.account.number} | Дебет: {self.debit} | Кредит: {self.credit}"

    class Meta:
        verbose_name = 'Проводка'
        verbose_name_plural = 'Проводки'




# prawila prowodok ################################################################################################################################################################################################
class Operation(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name="Код операции")
    name = models.CharField(max_length=255, verbose_name="Наименование")

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        verbose_name = "Операция"
        verbose_name_plural = "Операции"
        

class CustomePostingRule(models.Model):
    CONTENT_TYPE_CHOICES = [('klient', 'Покупатель'), ('founder', 'Учредитель')] # ('supplier', 'Поставщик'),
    AMOUNT_TYPE_CHOICES = [('revenue', 'Продажа'), ('cogs', 'Себестоимость'), ('profit', 'Прибыль')] # ('pays', 'Платежи')
    PAYS_TYPE_CHOICES = [('income', 'Приход'), ('expense', 'Расход')]
    
    operation = models.ForeignKey(Operation, on_delete=models.PROTECT, verbose_name="Операция")
    # warehouse = models.ForeignKey('Warehouse', on_delete=models.PROTECT, null=True, blank=True, verbose_name="Склад")
    directory_type = models.CharField(max_length=1000, choices=CONTENT_TYPE_CHOICES, null=True, blank=True, verbose_name="Вид справочника")
    debit_account = models.ForeignKey('Account', on_delete=models.PROTECT, related_name='postingrule_debit', verbose_name="Дебетовый счёт")
    credit_account = models.ForeignKey('Account', on_delete=models.PROTECT, related_name='postingrule_credit', verbose_name="Кредитовый счёт")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="Описание") 
    amount_type = models.CharField(max_length=20, choices=AMOUNT_TYPE_CHOICES, verbose_name="Тип суммы (использоваит при Фактурах)", blank=True, null=True,)
    pays_type = models.CharField(max_length=20, choices=PAYS_TYPE_CHOICES, verbose_name="Тип платежа (использоваит при платежах)", blank=True, null=True,)
    
    class Meta:
        verbose_name = "Правило проводки"
        verbose_name_plural = "Правила проводок"

    
class WarehouseAccount(models.Model):
    warehouse = models.ForeignKey('Warehouse', on_delete=models.PROTECT, verbose_name="Склад")
    account = models.ForeignKey('Account', on_delete=models.PROTECT, verbose_name="Счёт")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="Описание")

    def __str__(self):
        return f"{self.warehouse} → {self.account}"

    class Meta:
        verbose_name = "Склад → Счёт"
        verbose_name_plural = "Склады → Счета"
    
    
    
    
# class PostingRule(models.Model):
#     operation = models.ForeignKey(Operation, on_delete=models.PROTECT)
    
#     partner_type = models.CharField(
#         max_length=20,
#         choices=Partner.PARTNER_TYPE_CHOICES,
#         blank=True,
#         null=True,
#         verbose_name="Тип партнёра"
#     )
    
#     content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.PROTECT)
#     object_id = models.PositiveIntegerField(null=True, blank=True)
#     content_object = GenericForeignKey('content_type', 'object_id')

#     debit_account = models.ForeignKey('Account', on_delete=models.PROTECT, related_name='postingrule_debit')
#     credit_account = models.ForeignKey('Account', on_delete=models.PROTECT, related_name='postingrule_credit')
#     description = models.CharField(max_length=255, blank=True, null=True)
    
#     AMOUNT_TYPE_CHOICES = [
#         ('revenue', 'Выручка'),
#         ('cogs', 'Себестоимость'),
#         ('profit', 'Прибыль'),
#     ]
#     amount_type = models.CharField(max_length=20, choices=AMOUNT_TYPE_CHOICES, default='revenue')
        
        
    



########################################################################################################################################################################################################################
######################################################################## close day START
class DayClosing(models.Model):
    date = models.DateField(verbose_name="Дата", unique=True)
    is_closed = models.BooleanField(verbose_name="Закрыт", default=False)
    closed_at = models.DateTimeField(verbose_name="Время закрытия", null=True, blank=True)
    closed_by = models.ForeignKey(User, verbose_name="Закрыл", on_delete=models.SET_NULL, null=True, blank=True, related_name="closed_days")

    class Meta:
        verbose_name = "Закрытие дня"
        verbose_name_plural = "Закрытия дней"
        ordering = ["-date"]

    def __str__(self):
        return f"Закрытие {self.date} - {'Закрыт' if self.is_closed else 'Открыт'}"


class DayClosingLog(models.Model):
    ACTION_CHOICES = [
        ("close", "Закрытие дня"),
        ("reopen", "Отмена закрытия"),
    ]

    day_closing = models.ForeignKey(DayClosing, verbose_name="Закрытый день", on_delete=models.CASCADE, related_name="logs")
    action = models.CharField(verbose_name="Действие", max_length=20, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(User, verbose_name="Пользователь", on_delete=models.SET_NULL, null=True, blank=True)
    performed_at = models.DateTimeField(verbose_name="Время действия", auto_now_add=True)
    reason = models.TextField(verbose_name="Причина", blank=True, null=True)

    class Meta:
        verbose_name = "Журнал закрытия дня"
        verbose_name_plural = "Журнал закрытия дней"
        ordering = ["-performed_at"]

    def __str__(self):
        return f"{self.get_action_display()} {self.day_closing.date} пользователем {self.performed_by}"
    
    
    
class PartnerBalanceSnapshot(models.Model):
    """
    Баланс каждого партнёра на момент закрытия дня.
    """
    closing = models.ForeignKey(DayClosing, on_delete=models.CASCADE, related_name="partner_balances")
    partner = models.ForeignKey("Partner", on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ("closing", "partner")

    def __str__(self):
        return f"{self.partner.name} — {self.balance} ({self.closing.date})"
    
    
    
class StockSnapshot(models.Model):
    """
    Остатки товаров по складам на момент закрытия дня.
    """
    closing = models.ForeignKey(DayClosing, on_delete=models.CASCADE, related_name="stock_snapshots")
    warehouse = models.ForeignKey("Warehouse", on_delete=models.CASCADE)
    product = models.ForeignKey("Product", on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ("closing", "warehouse", "product")

    def __str__(self):
        return f"{self.product.name} ({self.warehouse.name}) — {self.quantity} шт. ({self.closing.date})"





######################################################################## close day END
########################################################################################################################################################################################################################