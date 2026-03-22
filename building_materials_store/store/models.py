from django.db import models, IntegrityError, transaction
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import os


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
        indexes = [
            models.Index(fields=["brand"]),
            models.Index(fields=["category"]),
        ]

    def get_discount_percent(self, quantity):
        rule = (
            self.quantity_discounts
            .filter(min_quantity__lte=quantity)
            .order_by('-min_quantity')
            .first()
        )

        if rule:
            return rule.discount_percent

        return 0
    
    def get_price_with_discount(self, quantity, price):
        discount = self.get_discount_percent(quantity)

        if discount:
            return price * (Decimal("1") - discount / Decimal("100"))

        return price

class Warehouse(models.Model):
    # CURRENCY_CHOICES = [
    #     ('USD', 'USD'),
    #     ('TMT', 'TMT'),
    # ]
    
    name = models.CharField(max_length=100, unique=True, verbose_name="Название склада")
    location = models.CharField(max_length=255, blank=True, verbose_name="Адрес (необязательно)")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    # currency = models.CharField(verbose_name="Валюта", max_length=20, choices=CURRENCY_CHOICES, default="USD", null=True, blank=True)
    currency  = models.ForeignKey('Currency', on_delete=models.PROTECT, verbose_name="Валюта", null=True, blank=True,)
    
   
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
    # SUPPLIER = 'supplier'
    # BOTH = 'both'
    FOUNDER = 'founder'  # учредитель

    PARTNER_TYPE_CHOICES = [
        (BUYER, 'Alyjy (Покупатель)'),
        # (SUPPLIER, 'Üpjünçi (Поставщик)'),
        # (BOTH, 'Alyjy we Üpjünçi (Покупатель и поставщик)'),
        (FOUNDER, 'Uchreditel (Учредитель)'),
    ]

    name = models.CharField(verbose_name='Partneryn ady', max_length=2000, unique=True)
    # СВЯЗЬ С AGENT
    agent = models.ForeignKey('Agent', on_delete=models.PROTECT, null=True, blank=True, verbose_name='Agent'
    )
    type = models.CharField(max_length=20, choices=PARTNER_TYPE_CHOICES, default=BUYER, verbose_name='Partneriň görnüşi')
    # account = models.ForeignKey('Account', on_delete=models.PROTECT, null=True, blank=True, verbose_name='Account')
    balance = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'), verbose_name='Balans (deb/kred)')
    balance_tmt = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'), verbose_name='Balans TMT')
    balance_usd = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'), verbose_name='Balans USD')
    is_active = models.BooleanField(default=True, verbose_name='Активен')

    def __str__(self):
        return f'{self.name} ({self.get_type_display()})'
    
   

    class Meta:
        verbose_name = 'Partner'
        verbose_name_plural = 'Partnerler'



class Employee(models.Model):
    EMPLOYEE_TYPE = [
        ('driver', 'Водитель'),
        ('warehouse_worker', 'Грузчик'),
    ]

    name = models.CharField(verbose_name='Işgär', max_length=2000)
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    type = models.CharField(max_length=50, choices=EMPLOYEE_TYPE, verbose_name='Тип работника', default='driver')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Işgär'
        verbose_name_plural = 'Işgärler'


########################################################################################################################################################################################################################
######################################################################## Расходная накладная (faktura) START
# ERROR ne ispolzuetsya
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
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
######################################################################## Faktura START

class Invoice(models.Model):
    INVOICE_TYPE_CHOICES = [
        ("rashod", "Расход (Продажа)"),
        ("prihod", "Приход (Закупка)"),
        ("wozwrat", "Возврат"),
        ("transfer", "Переход"),
    ]
    
    TYPE_PRICE_CHOICES = [("wholesale_price", "Опт"), ("retail_price", "Розница")]
    
    awto = models.ForeignKey(Employee, on_delete=models.PROTECT, verbose_name="Доставил / Принял", null=True, blank=True)
    awto_send = models.BooleanField(default=False)
    comment = models.TextField(null=True, blank=True, verbose_name="Примечание")
    invoice_date = models.DateTimeField(verbose_name="Дата накладной (фактура)", null=True, blank=True)
    is_entry = models.BooleanField(default=False, verbose_name="Проводка создана")
    partner = models.ForeignKey(Partner, on_delete=models.PROTECT, verbose_name="Партнёр", null=True, blank=True)
    partner_send = models.BooleanField(default=False)
    send = models.BooleanField(default=False)
    type_price = models.CharField(max_length=50, choices=TYPE_PRICE_CHOICES, default="wholesale_price", verbose_name="Тип цены", null=True, blank=True)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, verbose_name="Склад", null=True, blank=True, related_name="invoices_from")
    warehouse2 = models.ForeignKey(Warehouse, on_delete=models.PROTECT, verbose_name="На склад (если переход со склада на склад)", null=True, blank=True, related_name="invoices_to")
    wozwrat_or_prihod = models.CharField(max_length=50, choices=INVOICE_TYPE_CHOICES, verbose_name="Тип накладной", null=True, blank=True)

    # Кто создал накладную (черновик)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="invoices_created", verbose_name="Создал (черновик)")
    
    # Кто сделал проводку
    entry_created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="invoices_posted", null=True, blank=True, verbose_name="Сохранил с проводкой")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания (черновик awto)")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления (awto)")
    entry_created_at = models.DateTimeField(null=True, blank=True,verbose_name="Дата сохранения с проводкой (awto)")
    
    # data wybrannaya userom
    created_at_handle = models.DateTimeField(verbose_name="Дата создания (черновик)", null=True, blank=True)
    updated_at_handle = models.DateTimeField(verbose_name="Дата обновления", null=True, blank=True)
    entry_created_at_handle = models.DateTimeField(null=True, blank=True,verbose_name="Дата сохранения с проводкой")
    
    canceled_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="invoices_calnceled", null=True, blank=True, verbose_name="Отменил проводку")
    canceled_at = models.DateTimeField(verbose_name="Дата Отмены проводки", null=True, blank=True)
    canceled_comment = models.TextField(null=True, blank=True, verbose_name="Причина отмены")
    
    trip = models.ForeignKey("Trip", null=True, blank=True, on_delete=models.SET_NULL, related_name="invoices", verbose_name="Рейс")


    class Meta:
        verbose_name = "Накладная"
        verbose_name_plural = "Накладные"
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["partner", "created_at"]),

            # для аналитики продаж
            models.Index(fields=["invoice_date"]),
            models.Index(fields=["warehouse"]),
            models.Index(fields=["wozwrat_or_prihod"]),
            models.Index(fields=["is_entry"]),
            models.Index(fields=["canceled_at"]),

            # самый важный индекс для анализа
            models.Index(
                fields=[
                    "wozwrat_or_prihod",
                    "is_entry",
                    "invoice_date",
                    "warehouse",
                ]
            ),
        ]

    def __str__(self):
        return f"{self.get_wozwrat_or_prihod_display()} Фактура №{self.id} от {self.created_at.strftime('%Y-%m-%d')}"





class InvoiceItem(models.Model):
    # item_id = models.IntegerField(blank=True, null=True) # 7216
    base_quantity_in_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0) # 134
    base_unit_obj = models.ForeignKey(UnitOfMeasurement, on_delete=models.PROTECT) # {id: 6593, name: 'sany'}
    discount_price = models.DecimalField(max_digits=12, decimal_places=3, blank=True, null=True) # null
    firma_price = models.DecimalField(max_digits=12, decimal_places=3, blank=True, null=True) # 0.000
    is_custom_price = models.BooleanField(default=False)
    is_gift = models.BooleanField(default=False)
    parent_id = models.IntegerField(blank=True, null=True) # esli eto gift nujen id ego osnownogo produkta
    purchase_price = models.DecimalField(max_digits=12, decimal_places=3, default=0) #  "5.000"
    quantity_on_selected_warehouses = models.DecimalField(max_digits=12, decimal_places=2, default=0) # 67
    retail_price = models.DecimalField(max_digits=12, decimal_places=3, default=0) # "7.000"
    selected_price = models.DecimalField(max_digits=12, decimal_places=3, default=0) # "6.000"
    selected_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0) # 1
    total_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0) # 134
    unit_name_on_selected_warehouses = models.CharField(max_length=50, blank=True, null=True) # "metr"
    wholesale_price = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_auto = models.BooleanField(default=True) # Чтобы понимать авто это или кассир изменил. пример: True  → система поставила, False → кассир изменил
    price_after_discount = models.DecimalField(max_digits=12, decimal_places=3, default=0) # Очень полезно для аналитики, Можно хранить цену после скидки за 1 шт
    discount_amount = models.DecimalField(max_digits=12, decimal_places=3, default=0) # ещё очень крутая оптимизация , пример: price = 200  discount = 10%   discount_amount = 10
    

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    
    class Meta:
        indexes = [
            models.Index(fields=["product"]),
            models.Index(fields=["invoice"]),
            models.Index(fields=["product", "invoice"]),
            models.Index(fields=["invoice", "product"]),
        ]
    
    


class FreeItemForInvoiceItem(models.Model):
    main_product = models.ForeignKey(InvoiceItem, on_delete=models.CASCADE, related_name="free_items")
    gift_product_obj = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="free_product") # для того чтобы брать images, volume и тп
    # gift_product = models.IntegerField() # id 7216 ne nado , est w gift_product_obj.id
    gift_product_name = models.CharField(max_length=500) # "AB-20, AKRENK 1KG POL (12)"
    gift_product_unit_name = models.CharField(max_length=50) # sany
    quantity_per_unit = models.DecimalField(max_digits=12, decimal_places=2, default=0) # "2.00"
    
class UnitForInvoiceItem(models.Model):
    main_product = models.ForeignKey(InvoiceItem, on_delete=models.CASCADE, related_name="units")
    base_unit_name = models.CharField(max_length=50) # "sany"
    conversion_factor = models.CharField(max_length=50) # "2.000"
    unit_id = models.IntegerField() # id: 103
    is_default_for_sale = models.BooleanField(default=True)
    unit_name = models.CharField(max_length=50) # "metr"
    
# class WarehouseForInvoiceItem(models.Model):
#     main_product = models.ForeignKey(InvoiceItem, on_delete=models.CASCADE, related_name="warehouses")
#     quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
#     warehouse_id = models.IntegerField() # id 1
#     warehouse_name = models.CharField(max_length=500) # "Sklad polisem 1"
    
    

    
    
######################################################################## Faktura END
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
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
    # invoice = models.ForeignKey(SalesInvoice, null=True, blank=True, on_delete=models.SET_NULL)
    invoice = models.ForeignKey(Invoice, null=True, blank=True, on_delete=models.SET_NULL)
    partner = models.ForeignKey(Partner, null=True, blank=True, on_delete=models.SET_NULL, verbose_name='Партнер')
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Создал", help_text="Пользователь, создавший эту операцию")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания", null=True, blank=True)


    def __str__(self):
        return f"{self.date.strftime('%Y-%m-%d %H:%M')} — {self.description}"

    class Meta:
        verbose_name = 'Хозяйственная операция'
        verbose_name_plural = 'Хозяйственные операции'
        ordering = ['-date']
        indexes = [
            models.Index(fields=["invoice"]),
            models.Index(fields=["date"]),
        ]
    

# # Проводка (двойная запись: дебет и кредит)
class Entry(models.Model):
    transaction = models.ForeignKey(Transaction, related_name='entries', on_delete=models.CASCADE, verbose_name='Операция')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, verbose_name='Счет')
    partner = models.ForeignKey(Partner, null=True, blank=True, on_delete=models.SET_NULL, verbose_name='Партнер (субконто)', related_name='entry_set')
    product = models.ForeignKey('Product', null=True, blank=True, on_delete=models.SET_NULL)
    warehouse = models.ForeignKey('Warehouse', null=True, blank=True, on_delete=models.SET_NULL)
    debit = models.DecimalField(max_digits=15, decimal_places=5, default=Decimal('0.00000'), verbose_name='Дебет')
    credit = models.DecimalField(max_digits=15, decimal_places=5, default=Decimal('0.00000'), verbose_name='Кредит')

    # class Meta:
    #     indexes = [
    #         models.Index(fields=["account"]),
    #         models.Index(fields=["transaction"]),
    #     ]
    
    class Meta:  # ← ТОЛЬКО ОДИН Meta!
        indexes = [
            models.Index(fields=["account"]),
            models.Index(fields=["transaction"]),
            models.Index(fields=["partner"]),
            models.Index(fields=["product"]),
            models.Index(fields=["warehouse"]),
        ]
        verbose_name = 'Проводка'
        verbose_name_plural = 'Проводки'

    def __str__(self):
        return f"{self.account.number} | Дебет: {self.debit} | Кредит: {self.credit}"

    # class Meta:
    #     verbose_name = 'Проводка'
    #     verbose_name_plural = 'Проводки'




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
    AMOUNT_TYPE_CHOICES = [('revenue', 'Продажа (цена)'), ('cogs', 'Себестоимость'), ('profit', 'Прибыль (доход цена)')] # ('pays', 'Платежи')
    # PAYS_TYPE_CHOICES = [('income', 'Приход'), ('expense', 'Расход')]
    # CURRENCY_CHOICES = [
    #     ('USD', 'USD'),
    #     ('TMT', 'TMT'),
    # ]
    
    operation = models.ForeignKey(Operation, on_delete=models.PROTECT, verbose_name="Операция")
    # warehouse = models.ForeignKey('Warehouse', on_delete=models.PROTECT, null=True, blank=True, verbose_name="Склад")
    directory_type = models.CharField(max_length=1000, choices=CONTENT_TYPE_CHOICES, null=True, blank=True, verbose_name="Вид партнера")
    debit_account = models.ForeignKey('Account', on_delete=models.PROTECT, related_name='postingrule_debit', verbose_name="Дебетовый счёт")
    credit_account = models.ForeignKey('Account', on_delete=models.PROTECT, related_name='postingrule_credit', verbose_name="Кредитовый счёт")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="Описание") 
    amount_type = models.CharField(max_length=20, choices=AMOUNT_TYPE_CHOICES, verbose_name="Тип суммы (использоваит при Фактурах)", blank=True, null=True,)
    # pays_type = models.CharField(max_length=20, choices=PAYS_TYPE_CHOICES, verbose_name="Тип платежа (использоваит при платежах)", blank=True, null=True,)
    # currency = models.CharField(verbose_name="Валюта", max_length=20, choices=CURRENCY_CHOICES, default="USD", null=True, blank=True)
    currency  = models.ForeignKey('Currency', on_delete=models.PROTECT, verbose_name="Валюта", null=True, blank=True,)
    
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
    
    
    

########################################################################################################################################################################################################################
######################################################################## close day START
class DayClosing(models.Model):
    date = models.DateField(verbose_name="Дата", unique=True, null=True, blank=True)
    closed_at = models.DateTimeField(verbose_name="Время закрытия", auto_now_add=True, null=True, blank=True)
    closed_by = models.ForeignKey(
        User, verbose_name="Закрыл", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="closed_days"
    )
    note = models.TextField(verbose_name="Комментарий", blank=True, null=True)

    class Meta:
        verbose_name = "Закрытие дня"
        verbose_name_plural = "Закрытия дней"
        ordering = ["-date"]

    def __str__(self):
        return f"Закрытие {self.date} ({self.closed_by})"


class DayClosingLog(models.Model):
    ACTION_CHOICES = [
        ("close", "Закрытие дня"),
    ]

    day_closing = models.ForeignKey(DayClosing, on_delete=models.CASCADE, related_name="logs", null=True, blank=True)
    action = models.CharField(verbose_name="Действие", max_length=20, choices=ACTION_CHOICES, null=True, blank=True)
    performed_by = models.ForeignKey(User, verbose_name="Пользователь", on_delete=models.SET_NULL, null=True, blank=True)
    performed_at = models.DateTimeField(verbose_name="Время действия", auto_now_add=True, null=True, blank=True)
    reason = models.TextField(verbose_name="Комментарий", blank=True, null=True)

    class Meta:
        verbose_name = "Журнал закрытия дня"
        verbose_name_plural = "Журнал закрытия дней"
        ordering = ["-performed_at"]

    def __str__(self):
        return f"{self.get_action_display()} {self.day_closing.date} ({self.performed_by})"
    
    
    
class PartnerBalanceSnapshot(models.Model):
    """
    Баланс каждого партнёра на момент закрытия дня.
    """
    closing = models.ForeignKey(DayClosing, on_delete=models.CASCADE, related_name="partner_balances", null=True, blank=True)
    partner = models.ForeignKey("Partner", on_delete=models.CASCADE, null=True, blank=True)
    
    # Старые поля (для обратной совместимости)
    balance = models.DecimalField(max_digits=20, decimal_places=3, null=True, blank=True, default=Decimal('0.000'), verbose_name='Баланс old')
    balance_tmt = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'), verbose_name='Balans TMT')
    balance_usd = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'), verbose_name='Balans USD')
    
    # НОВЫЕ ПОЛЯ - отдельно по каждому счету
    balance_60_usd = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'), verbose_name='60 Клиент USD')
    balance_62_tmt = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'), verbose_name='62 Клиент TMT')
    balance_75_usd = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'), verbose_name='75 Учредитель USD')
    balance_76_tmt = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'), verbose_name='76 Учредитель TMT')
    
    balance_60_usd_credit = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'))
    balance_60_usd_debit = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'))
    balance_62_tmt_credit = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'))
    balance_62_tmt_debit = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'))
    balance_75_usd_credit = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'))
    balance_75_usd_debit = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'))
    balance_76_tmt_credit = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'))
    balance_76_tmt_debit = models.DecimalField(max_digits=20, decimal_places=3, default=Decimal('0.000'))

    class Meta:
        unique_together = ("closing", "partner")

    def __str__(self):
        return f"{self.partner.name if self.partner else '—'} — 60:{self.balance_60_usd} 62:{self.balance_62_tmt} 75:{self.balance_75_usd} 76:{self.balance_76_tmt} ({self.closing.date})"
    
    
class StockSnapshot(models.Model):
    """
    Остатки товаров по складам на момент закрытия дня.
    """
    closing = models.ForeignKey(DayClosing, on_delete=models.CASCADE, related_name="stock_snapshots")
    warehouse = models.ForeignKey("Warehouse", on_delete=models.CASCADE)
    product = models.ForeignKey("Product", on_delete=models.CASCADE)
    purchase_price = models.DecimalField(verbose_name='Цена закупки', max_digits=10, decimal_places=3, default=0)
    retail_price = models.DecimalField(verbose_name='Розничная цена', max_digits=10, decimal_places=3, default=0)
    wholesale_price = models.DecimalField(verbose_name='Оптовая цена', max_digits=10, decimal_places=3, default=0)
    discount_price = models.DecimalField(verbose_name='Цена со скидкой', max_digits=10, decimal_places=3, blank=True, null=True)
    firma_price = models.DecimalField(verbose_name='Цена Firma', max_digits=10, decimal_places=3, blank=True, null=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ("closing", "warehouse", "product")

    def __str__(self):
        return f"{self.product.name} ({self.warehouse.name}) — {self.quantity} шт. ({self.closing.date})"





######################################################################## close day END
########################################################################################################################################################################################################################


class DateFocus(models.Model):
    dateFocus = models.DateField(verbose_name="Дата фокус", null=True, blank=True)

    def __str__(self):
        return str(self.dateFocus)
    
    
    

class Currency(models.Model):
    code = models.CharField(max_length=10, unique=True, verbose_name="Код валюты")
    name = models.CharField(max_length=50, verbose_name="Название")

    def __str__(self):
        return self.code
    
    


# Trip START ###############################################################################################################################################################################
class Trip(models.Model):
    driver = models.ForeignKey(Employee, on_delete=models.PROTECT, verbose_name="Водитель")
    comment = models.TextField(null=True, blank=True, verbose_name="Комментарий")
    created_at = models.DateTimeField(auto_now_add=True)
    created_handle = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def invoices_list(self):
        return self.invoices.all()
    
    class Meta:
        verbose_name = "Рейс"
        verbose_name_plural = "Рейсы"

    def __str__(self):
        return f"Рейс #{self.id} — {self.driver.name}"
    
    
class TripInvoiceHistory(models.Model):
    ACTION_CHOICES = [
        ("added", "Добавил в рейс"),
        ("removed", "Удалил из рейса"),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="history")
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="trip_history")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Кто сделал действие")
    performed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "История накладной в рейсе"
        verbose_name_plural = "История накладных в рейсе"
        ordering = ["-performed_at"]

    def __str__(self):
        return f"{self.invoice} — {self.get_action_display()} ({self.performed_by})"
    
# Trip END ###############################################################################################################################################################################


class Zakaz(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, null=True, blank=True)
    partner = models.ForeignKey(Partner, on_delete=models.PROTECT, related_name="partner_orders", null=True, blank=True)
    buyer = models.ForeignKey(Partner, on_delete=models.PROTECT, related_name="buyer_orders", null=True, blank=True)
    
    created_at_handle = models.DateTimeField(null=True, blank=True)
    updated_at_handle = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_zakaz", verbose_name="Кто создал")
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_zakaz", verbose_name="Кто обновил")

    def total_sum(self):
        return sum(item.total_price for item in self.items.all())

    def total_qty(self):
        return sum(item.quantity for item in self.items.all())

    def __str__(self):
        return f"Zakaz #{self.id}"
    
    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"


class ZakazItem(models.Model):
    zakaz = models.ForeignKey(Zakaz, related_name="items", on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    selected_quantity = models.DecimalField(max_digits=10, decimal_places=3, default=Decimal(0))
    selected_price = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal(0))
    unit = models.CharField(max_length=32, null=True, blank=True)

    @property
    def total_price(self):
        return self.selected_quantity * self.selected_price
    
    def __str__(self):
        if self.product:
            return f"{self.product} x {self.selected_quantity}"
        return f"Item #{self.id}"
    
    class Meta:
        verbose_name = "Позиция заказа"
        verbose_name_plural = "Позиции заказа"
        
        
        

# def day_report_upload_path(instance, filename):
#     """
#     media/day_reports/<year>/<month>/<day>/<report_type>.xlsx
#     """
#     date = instance.date

#     return (
#         f"day_reports/"
#         f"{date.year}/"
#         f"{date.month:02d}/"
#         f"{date.day:02d}/"
#         f"{instance.report_type}.xlsx"
#     )
    
def day_report_upload_path(instance, filename):
    date = instance.date
    return (
        f"day_reports/"
        f"{date.year}/"
        f"{date.month:02d}/"
        f"{date.day:02d}/"
        f"{filename}"
    )
    
class DayReport(models.Model):
    REPORT_TYPES = (
        ("OBOROT_TOWAR", "OBOROT_TOWAR"),
        ("OBOROT_TOWAR_DETAIL", "OBOROT_TOWAR_DETAIL"),
        ("SKIDKA", "SKIDKA"),
        ("OSW", "OSW"),
    )

    date = models.DateField()
    report_type = models.CharField(
        max_length=50,
        choices=REPORT_TYPES,
        db_index=True
    )

    file = models.FileField(
        upload_to=day_report_upload_path,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="day_reports"
    )

    comment = models.TextField(blank=True)

    class Meta:
        unique_together = ("date", "report_type")
        ordering = ("-date",)

    def __str__(self):
        return f"{self.get_report_type_display()} | {self.date}"
    
    
    

class GiftRule(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="gift_rules"
    )

    gift_product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="gift_products"
    )

    buy_quantity = models.PositiveIntegerField()
    gift_quantity = models.PositiveIntegerField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("product", "gift_product")
        ordering = ["buy_quantity"]

    def __str__(self):
        return f"{self.product.name}: {self.buy_quantity} → {self.gift_quantity}"
    
    

class ProductQuantityDiscount(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="quantity_discounts"
    )

    min_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    class Meta:
        ordering = ["min_quantity"]
        unique_together = ("product", "min_quantity")

    def __str__(self):
        return f"{self.product.name} | qty ≥ {self.min_quantity} → {self.discount_percent}%"