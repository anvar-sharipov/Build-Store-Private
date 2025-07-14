from django.core.management.base import BaseCommand
from store.models import Currency, Account

class Command(BaseCommand):
    help = "Создаёт валюты и счета"

    def handle(self, *args, **kwargs):
        usd, _ = Currency.objects.get_or_create(code='USD', defaults={'name': 'Доллар США', 'symbol': '$'})
        man, _ = Currency.objects.get_or_create(code='TMT', defaults={'name': 'Манат', 'symbol': 'man'})

        accounts = [
            ('50.1', 'Касса в USD', 'asset', usd),
            ('50.2', 'Касса в MAN', 'asset', man),
            ('41.1', 'Склад в USD', 'asset', usd),
            ('41.2', 'Склад в MAN', 'asset', man),
            ('90.1', 'Доход от продаж USD', 'income', usd),
            ('90.2', 'Доход от продаж MAN', 'income', man),
            ('91.1', 'Закупки USD', 'expense', usd),
            ('91.2', 'Закупки MAN', 'expense', man),
            ('60.1', 'Поставщики USD', 'liability', usd),
            ('60.2', 'Поставщики MAN', 'liability', man),
        ]

        for number, name, acc_type, currency in accounts:
            Account.objects.get_or_create(
                number=number,
                defaults={'name': name, 'type': acc_type, 'currency': currency}
            )

        self.stdout.write(self.style.SUCCESS("✅ Валюты и счета успешно созданы"))
