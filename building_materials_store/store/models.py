from django.db import models, IntegrityError, transaction
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.utils import timezone








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
    name = models.CharField(verbose_name='Наименование', max_length=1000)
    description = models.TextField(verbose_name='Описание', blank=True, null=True)

    base_unit = models.ForeignKey('UnitOfMeasurement', verbose_name='Базовая единица', on_delete=models.PROTECT)
    category = models.ForeignKey('Category', verbose_name='Категория', on_delete=models.PROTECT, blank=True, null=True)

    sku = models.CharField(verbose_name='Артикул (SKU)', max_length=100, unique=True, null=True, blank=True)
    qr_code = models.CharField(verbose_name='QR-код', max_length=1000, blank=True, null=True, unique=True)

    quantity = models.DecimalField(verbose_name='Количество', max_digits=10, decimal_places=2, default=0)

    purchase_price = models.DecimalField(verbose_name='Цена закупки', max_digits=10, decimal_places=2, default=0)
    retail_price = models.DecimalField(verbose_name='Розничная цена', max_digits=10, decimal_places=2, default=0)
    wholesale_price = models.DecimalField(verbose_name='Оптовая цена', max_digits=10, decimal_places=2, default=0)
    discount_price = models.DecimalField(verbose_name='Цена со скидкой', max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Poprosil Makem aga sdelat porogowuyu senu (purchase_price) esho odnu, ne ponyal pochemu no sdelayu raz poprosili
    firma_price = models.DecimalField(verbose_name='Цена Firma', max_digits=10, decimal_places=2, blank=True, null=True)

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


    # def clean(self):
    #     super().clean()
    #     if not self.sku:
    #         raise ValidationError({'sku': 'Артикул (SKU) должен быть заполнен.'})
    #     if not self.qr_code:
    #         raise ValidationError({'qr_code': 'QR-код должен быть заполнен.'})


    # В модели Product добавь __init__, чтобы запомнить старые цены при загрузке:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_purchase_price = self.purchase_price
        self._original_retail_price = self.retail_price
        self._original_wholesale_price = self.wholesale_price
        self._original_discount_price = self.discount_price


    def save(self, *args, user=None, **kwargs):
        self._current_user = user
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
   
    class Meta:
        verbose_name = "Склад"
        verbose_name_plural = "Склады"

    def __str__(self):
        return self.name
    

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


# dlya ucheta sroka godnosti towara
class ProductBatch(models.Model):
    product = models.ForeignKey(
        Product, 
        related_name='batches', 
        on_delete=models.CASCADE,
        verbose_name='Товар'
    )

    batch_number = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name='Номер партии'
    )

    quantity = models.PositiveIntegerField(
        verbose_name='Количество в партии'
    )

    arrival_date = models.DateField(
        blank=True, 
        null=True, 
        verbose_name='Дата прихода'
    )

    production_date = models.DateField(
        blank=True, 
        null=True, 
        verbose_name='Дата производства'
    )

    expiration_date = models.DateField(
        blank=True, 
        null=True, 
        verbose_name='Срок годности'
    )

    def __str__(self):
        return f"{self.product.name} — партия {self.batch_number or 'без номера'}"

    class Meta:
        verbose_name = 'Партия товара'
        verbose_name_plural = 'Партии товаров'
 

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
        unique_together = ('product', 'unit')





# class UnitOfMeasurement(models.Model):
#     name = models.CharField(verbose_name='ölçeg birligi', max_length=20, unique=True)

#     def __str__(self):
#         return self.name

#     class Meta:
#         verbose_name = 'ölçeg birligi'
#         verbose_name_plural = 'ölçeg birlikleri'





class Category(models.Model):
    name = models.CharField(verbose_name='kategoriýa', max_length=250, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'kategoriýa'
        verbose_name_plural = 'kategoriýalar'






# class Client(models.Model):
#     name = models.CharField(verbose_name='Müşderiniň ady', max_length=2000)

#     def __str__(self):
#         return self.name

#     class Meta:
#         verbose_name = 'Müşderi'
#         verbose_name_plural = 'Müşderiler'



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

    PARTNER_TYPE_CHOICES = [
        (BUYER, 'Alyjy (Покупатель)'),
        (SUPPLIER, 'Üpjünçi (Поставщик)'),
        (BOTH, 'Alyjy we Üpjünçi (Покупатель и поставщик)'),
    ]

    name = models.CharField(verbose_name='Partneryn ady', max_length=2000)
    # СВЯЗЬ С AGENT
    agent = models.ForeignKey(
        'Agent',
        on_delete=models.PROTECT,  # или CASCADE, если хочешь удалять партнёра при удалении агента
        null=True,
        blank=True,
        verbose_name='Agent'
    )
    type = models.CharField(
        max_length=20,
        choices=PARTNER_TYPE_CHOICES,
        default=SUPPLIER,
        verbose_name='Partneriň görnüşi',
    )

    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Balans (deb/kred)'
    )

    def __str__(self):
        return f'{self.name} ({self.get_type_display()})'

    class Meta:
        verbose_name = 'Partner'
        verbose_name_plural = 'Partnerler'






class Employee(models.Model):
    name = models.CharField(verbose_name='Işgär', max_length=2000)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Işgär'
        verbose_name_plural = 'Işgärler'



############################################################################################################## Fakturalar START
######################################################################## Приходная накладная (faktura) START
class PurchaseInvoice(models.Model):
    supplier = models.ForeignKey(
        'Partner',
        on_delete=models.PROTECT,
        limit_choices_to={'type__in': ['supplier', 'both']},
        verbose_name="Поставщик"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        verbose_name="Создал"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Общая сумма"
    )

    is_canceled = models.BooleanField(default=False, verbose_name="Отменена?")
    canceled_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата отмены")
    canceled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='canceled_purchase_invoices',
        verbose_name="Кем отменена"
    )
    cancel_reason = models.TextField(null=True, blank=True, verbose_name="Причина отмены")

    class Meta:
        verbose_name = "Приходная накладная"
        verbose_name_plural = "Приходные накладные"

    def __str__(self):
        return f"Приход №{self.id} от {self.created_at.strftime('%Y-%m-%d')}"

    def calculate_total(self):
        return sum(item.get_line_total() for item in self.items.all())

    def save(self, *args, **kwargs):
        if self.is_canceled and not self.cancel_reason:
            raise ValidationError("Необходимо указать причину отмены.")
        self.total_amount = self.calculate_total()
        super().save(*args, **kwargs)


class PurchaseInvoiceItem(models.Model):
    invoice = models.ForeignKey(
        'PurchaseInvoice',
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey('Product', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)

    def get_line_total(self):
        quantity = self.quantity or 0
        purchase_price = self.purchase_price or 0
        return quantity * purchase_price
    

    def save(self, *args, **kwargs):
        created = self.pk is None
        super().save(*args, **kwargs)
        if created and not self.invoice.is_canceled:
            self.product.quantity += self.quantity
            self.product.save()
######################################################################## Приходная накладная (faktura) END


########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
######################################################################## Расходная накладная (faktura) START

class SalesInvoice(models.Model):  # накладная по продаже

    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('confirmed', 'Подтверждена'),
        ('canceled', 'Отменена'),
    ]

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft', verbose_name='Статус')
    currency = models.ForeignKey('Currency', on_delete=models.PROTECT, verbose_name='Валюта')
    buyer = models.ForeignKey('Partner', on_delete=models.PROTECT, limit_choices_to={'type__in': ['klient', 'both']}, verbose_name='Покупатель')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='Создал')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    warehouse = models.ForeignKey('Warehouse', on_delete=models.PROTECT, verbose_name='Склад', null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name='Общая сумма')
    delivered_by = models.ForeignKey('Employee', on_delete=models.PROTECT, verbose_name='Доставил', null=True, blank=True)
    note = models.TextField(null=True, blank=True, verbose_name='Примечание')
    is_canceled = models.BooleanField(default=False, verbose_name='Отменена?')
    canceled_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата отмены')
    canceled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='canceled_sales_invoices', verbose_name='Кем отменена')
    cancel_reason = models.TextField(null=True, blank=True, verbose_name='Причина отмены')

    class Meta:
        verbose_name = 'Расходная накладная'
        verbose_name_plural = 'Расходные накладные'

    def __str__(self):
        return f"Продажа №{self.id} от {self.created_at.strftime('%Y-%m-%d')}"

    def calculate_total(self):
        return sum(item.get_line_total() for item in self.items.all())

    def save(self, *args, **kwargs):
        if self.pk is not None:  # Объект уже сохранён
            self.total_amount = self.calculate_total()
        else:
            # Для нового объекта пока поставим total_amount 0, потом обновим после создания items
            if not self.total_amount:
                self.total_amount = 0
        super().save(*args, **kwargs)

    def cancel(self, user, reason):
        if self.is_canceled:
            raise ValidationError("Накладная уже отменена.")
        self.is_canceled = True
        self.canceled_at = timezone.now()
        self.canceled_by = user
        self.cancel_reason = reason
        self.save()
        # Вернуть товар на склад
        for item in self.items.all():
            item.product.quantity += item.quantity
            item.product.save()


class SalesInvoiceItem(models.Model): # spisok productow w prodaja nakladnoy
    invoice = models.ForeignKey( # kakaya nakladnaya
        'SalesInvoice',
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey('Product', on_delete=models.PROTECT) # kakoy product
    quantity = models.DecimalField(max_digits=10, decimal_places=2) # kolichestvo producta
    sale_price = models.DecimalField(max_digits=10, decimal_places=2) # cena prodaja producta

    def get_line_total(self): # obschaya summa producta v nakladnoy
        quantity = self.quantity or 0
        sale_price = self.sale_price or 0
        return quantity * sale_price

    def save(self, *args, **kwargs): # sohranit product i proverit kolichestvo na sklade
        created = self.pk is None
        if created and self.quantity > self.product.quantity:
            raise ValidationError(f"Недостаточно товара на складе: {self.product.name}")
        super().save(*args, **kwargs)
        if created and not self.invoice.is_canceled:
            self.product.quantity -= self.quantity
            self.product.save()


######################################################################## Возврат по продаже START
class SalesReturnInvoice(models.Model):
    original_invoice = models.ForeignKey(SalesInvoice, on_delete=models.PROTECT, related_name='returns')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    def calculate_total(self):
        return sum(item.get_line_total() for item in self.items.all())

    def save(self, *args, **kwargs):
        self.total_amount = self.calculate_total()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Возврат к продаже №{self.original_invoice.id}"


class SalesReturnItem(models.Model):
    invoice = models.ForeignKey(SalesReturnInvoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('Product', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)

    def get_line_total(self):
        quantity = self.quantity or 0
        sale_price = self.sale_price or 0
        return quantity * sale_price


    def save(self, *args, **kwargs):
        created = self.pk is None
        super().save(*args, **kwargs)
        if created:
            self.product.quantity += self.quantity
            self.product.save()
######################################################################## Возврат по продаже END
######################################################################## Расходная накладная (faktura) END
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
########################################################################################################################################################################################################################


######################################################################## Возврат по приходу START
class PurchaseReturnInvoice(models.Model):
    original_invoice = models.ForeignKey(
        PurchaseInvoice,
        on_delete=models.PROTECT,
        related_name='returns',
        verbose_name="Исходная приходная накладная"
    )
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Создал")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата возврата")
    reason = models.TextField(null=True, blank=True, verbose_name="Причина возврата")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        verbose_name = "Возврат по приходу"
        verbose_name_plural = "Возвраты по приходу"

    def __str__(self):
        return f"Возврат к приходу №{self.original_invoice.id}"

    def calculate_total(self):
        return sum(item.get_line_total() for item in self.items.all())

    def save(self, *args, **kwargs):
        self.total_amount = self.calculate_total()
        super().save(*args, **kwargs)


class PurchaseReturnItem(models.Model):
    invoice = models.ForeignKey(
        PurchaseReturnInvoice,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Возврат по приходу"
    )
    product = models.ForeignKey('Product', on_delete=models.PROTECT, verbose_name="Продукт")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Количество")
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Закупочная цена")

    class Meta:
        verbose_name = "Позиция возврата по приходу"
        verbose_name_plural = "Позиции возврата по приходу"

    def get_line_total(self):
        quantity = self.quantity or 0
        purchase_price = self.purchase_price or 0
        return quantity * purchase_price
    

    def save(self, *args, **kwargs):
        created = self.pk is None
        if created:
            # Проверка, достаточно ли товара на складе для возврата
            if self.quantity > self.product.quantity:
                raise ValidationError(f"Недостаточно остатков для возврата: {self.product.name}")
        super().save(*args, **kwargs)
        if created:
            self.product.quantity -= self.quantity
            self.product.save()
######################################################################## Возврат по приходу END








############################################################################################################## Fakturalar END




############################################################################################################## Accounts START

# # Валюта
class Currency(models.Model):
    code = models.CharField(max_length=3, unique=True, verbose_name='Код валюты')  # USD, TMT и т.п.
    name = models.CharField(max_length=50, verbose_name='Название валюты')
    symbol = models.CharField(max_length=5, verbose_name='Символ')

    def __str__(self):
        return f"{self.symbol} ({self.code})"

    class Meta:
        verbose_name = 'Валюта'
        verbose_name_plural = 'Валюты'

# Курс валюты
class CurrencyRate(models.Model):
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, verbose_name="Валюта")
    rate = models.DecimalField(max_digits=12, decimal_places=4, default=1, verbose_name="Курс валюты")
    date = models.DateField(auto_now_add=True, verbose_name="Дата курса")

    class Meta:
        verbose_name = "Курс валюты"
        verbose_name_plural = "Курсы валют"
        unique_together = ('currency', 'date')

    def __str__(self):
        return f"{self.currency.code}: {self.rate} на {self.date}"




# Типы счетов
ACCOUNT_TYPES = [
    ('asset', 'Актив'),
    ('liability', 'Пассив'),
    ('income', 'Доход'),
    ('expense', 'Расход'),
]


# Счёт
class Account(models.Model):
    number = models.CharField(max_length=20, unique=True)       # Пример: '50.1', '90.2'
    name = models.CharField(max_length=255)                     # Название: 'Касса в USD'
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.number} {self.name} ({self.currency.code})"
    

# # Хозяйственная операция
class Transaction(models.Model):
    description = models.TextField(verbose_name='Описание операции')
    date = models.DateTimeField(auto_now_add=True, verbose_name='Дата операции')
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
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name='Дебет')
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name='Кредит')

    def __str__(self):
        return f"{self.account.number} | Дебет: {self.debit} | Кредит: {self.credit}"

    class Meta:
        verbose_name = 'Проводка'
        verbose_name_plural = 'Проводки'


############################################################################################################## Accounts END
