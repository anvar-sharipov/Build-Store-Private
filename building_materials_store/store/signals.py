from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Product, PriceChangeHistory


@receiver(pre_save, sender=Product)
def create_price_change_history(sender, instance, **kwargs):
    if not instance.pk:
        # Новый продукт — история не нужна
        return

    try:
        old_instance = Product.objects.get(pk=instance.pk)
    except Product.DoesNotExist:
        # Продукт не найден, значит тоже ничего делать не надо
        return

    user = None  # TODO: здесь надо получить текущего пользователя, если есть

    price_fields = [
        ('purchase_price', 'purchase'),
        ('retail_price', 'retail'),
        ('wholesale_price', 'wholesale'),
        ('discount_price', 'discount'),
    ]

    for field_name, price_type in price_fields:
        old_price = getattr(old_instance, field_name)
        new_price = getattr(instance, field_name)

        # discount_price может быть None, сравниваем аккуратно
        if old_price != new_price:
            quantity = instance.total_quantity or 0

            PriceChangeHistory.objects.create(
                product=instance,
                price_type=price_type,
                old_price=old_price if old_price is not None else 0,
                new_price=new_price if new_price is not None else 0,
                quantity_at_change=quantity,
                # changed_by=user
                changed_by = getattr(instance, '_current_user', None)
            )
