#!/bin/bash
set -e

# echo "Waiting for database..."
# ./wait-for-it.sh db -- echo "Postgres is up"
# ./wait-for-it.sh $DATABASE_HOST -- echo "Postgres is up"
echo "Waiting for PostgreSQL..."
# ./wait-for-it.sh ${DATABASE_HOST}:5432 --timeout=30 --strict -- echo "PostgreSQL is up"
./wait-for-it.sh db

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Database structure migrated successfully. Starting server..."

# Можно добавить немного задержки после миграций (иногда база не успевает подняться):
sleep 2

# echo "Creating superuser, groups, warehouses, accounts, employees, agents, partners, categories, brands, models and tags..."
# python manage.py shell << EOF
# import os, random
# from decimal import Decimal
# from django.contrib.auth.models import Group
# from store.models import CustomUser, Warehouse, Account, Employee, Agent, Partner, Category, Brand, Model, Tag, Product, UnitOfMeasurement, ProductUnit, Operation, CustomePostingRule, WarehouseProduct, WarehouseAccount, Currency

# # --- Создание суперюзера ---
# username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
# password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')
# email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')

# if not CustomUser.objects.filter(username=username).exists():
#     superuser = CustomUser.objects.create_superuser(username=username, email=email, password=password)
#     print(f'Superuser {username} created successfully!')
# else:
#     superuser = CustomUser.objects.get(username=username)
#     print(f'Superuser {username} already exists.')

# # --- Создание групп ---
# for group_name in ["admin", "worker"]:
#     group, created = Group.objects.get_or_create(name=group_name)
#     if created:
#         print(f'Group "{group_name}" created successfully!')
#     else:
#         print(f'Group "{group_name}" already exists.')

# # Добавляем суперюзера в группу admin
# admin_group = Group.objects.get(name="admin")
# if not superuser.groups.filter(name="admin").exists():
#     superuser.groups.add(admin_group)
#     print(f'Superuser {username} added to "admin" group')

# # --- Создание валют ---
# cur_usd, _ = Currency.objects.get_or_create(code="USD", defaults={"name": "USD"})
# cur_tmt, _ = Currency.objects.get_or_create(code="TMT", defaults={"name": "TMT"})

# # --- Создание складов ---
# for w in ["Sklad 1 USD", "Sklad 2 USD", "Sklad 1 TMT"]:
#     if "TMT" in w:
#         warehouse, created = Warehouse.objects.get_or_create(name=w, currency=cur_tmt)
#     else:
#         warehouse, created = Warehouse.objects.get_or_create(name=w, currency=cur_usd)
#     print(f'✅ Warehouse "{w}" {"created" if created else "already exists"}')

# # --- Создание счетов ---
# accounts_data = [
#     {"number": "60", "name": "Клиент USD", "type": "both", "description": "Клиент USD", "parent": None},
#     {"number": "62", "name": "Клиент TMT", "type": "both", "description": "Клиент TMT", "parent": None},
#     {"number": "75", "name": "Учредитель USD", "type": "both", "description": "Учредитель USD", "parent": None},
#     {"number": "76", "name": "Учредитель TMT", "type": "both", "description": "Учредитель TMT", "parent": None},
#     {"number": "46", "name": "Доход USD (общий)", "type": "both", "description": "Доход USD (общий), родитель", "parent": None},
#     {"number": "46.1", "name": "Доход USD клиент", "type": "both", "description": "Доход USD клиент, субсчёт для 46", "parent": "46"},
#     {"number": "46.2", "name": "Доход USD учредитель", "type": "both", "description": "Доход USD учредитель, субсчёт для 46", "parent": "46"},
#     {"number": "47", "name": "Доход TMT (общий)", "type": "both", "description": "Доход TMT (общий), родитель", "parent": None},
#     {"number": "47.1", "name": "Доход TMT клиент", "type": "both", "description": "Доход TMT клиент, субсчёт для 47", "parent": "47"},
#     {"number": "47.2", "name": "Доход TMT учредитель", "type": "both", "description": "Доход TMT учредитель, субсчёт для 47", "parent": "47"},
#     {"number": "40", "name": "Склад USD", "type": "both", "description": "Склад USD, родитель", "parent": None},
#     {"number": "40.1", "name": "Sklad 1 USD", "type": "both", "description": "Sklad 1 USD, субсчёт для 40", "parent": "40"},
#     {"number": "40.2", "name": "Sklad 2 USD", "type": "both", "description": "Sklad 2 USD, субсчёт для 40", "parent": "40"},
#     {"number": "42", "name": "Склад TMT", "type": "both", "description": "Sklad TMT, родитель", "parent": None},
#     {"number": "42.1", "name": "Sklad 1 TMT", "type": "both", "description": "Sklad 1 TMT, субсчёт для 42", "parent": "42"},
#     {"number": "50", "name": "Касса USD", "type": "both", "description": "Касса USD", "parent": None},
#     {"number": "80", "name": "Фонд", "type": "both", "description": "Фонд", "parent": None},
#     {"number": "52", "name": "Kassa TMT", "type": "both", "description": "Kassa TMT", "parent": None},
# ]

# accounts = {}
# for acc in accounts_data:
#     parent = accounts.get(acc["parent"]) if acc["parent"] else None
#     account, created = Account.objects.get_or_create(
#         number=acc["number"],
#         defaults={
#             "name": acc["name"],
#             "type": acc["type"],
#             "description": acc["description"],
#             "parent": parent,
#             "is_active": True,
#         }
#     )
#     accounts[acc["number"]] = account
#     if created:
#         print(f'Account {acc["number"]} "{acc["name"]}" created successfully!')
#     else:
#         print(f'Account {acc["number"]} "{acc["name"]}" already exists.')

# # --- Привязать склад к сабсчетам ---
# acc40_1 = Account.objects.get(number="40.1")
# acc40_2 = Account.objects.get(number="40.2")
# acc42_1 = Account.objects.get(number="42.1")
# warehouse_1_USD = Warehouse.objects.get(name="Sklad 1 USD")
# warehouse_2_USD = Warehouse.objects.get(name="Sklad 2 USD")
# warehouse_1_TMT = Warehouse.objects.get(name="Sklad 1 TMT")
# account, created = WarehouseAccount.objects.get_or_create(warehouse = warehouse_1_USD, account = acc40_1)
# account, created = WarehouseAccount.objects.get_or_create(warehouse = warehouse_2_USD, account = acc40_2)
# account, created = WarehouseAccount.objects.get_or_create(warehouse = warehouse_1_TMT, account = acc42_1)

# # --- Создание работника ---
# for e in ["Shohrat, FUSO", "Anvar, KIA"]:
#     employee_name = e
#     employee, created = Employee.objects.get_or_create(name=employee_name)
#     if created:
#         print(f'Employee "{employee_name}" created successfully!')
#     else:
#         print(f'Employee "{employee_name}" already exists.')

# # --- Создание агентов ---
# agent_names = ["Agent Smith", "Agent Ali", "Agent Timur", "Agent Ayna", "Agent Rasul"]
# agents = []
# for name in agent_names:
#     agent, _ = Agent.objects.get_or_create(name=name)
#     agents.append(agent)
# print(f"Total agents in system: {len(agents)}")

# # --- Создание партнёров ---
# partners_data = [
#     {"name": "Merdan, Oktyabrsk, +99361335689", "type": Partner.BUYER},
#     {"name": "Ayna, Ashgabat, +99365011234", "type": Partner.FOUNDER},
#     {"name": "Rasul, Mary, +99361222333", "type": Partner.BUYER},
#     {"name": "Annageldi, Balkan, +99364444555", "type": Partner.FOUNDER},
# ]

# for pdata in partners_data:
#     agent = random.choice(agents) if agents else None
#     partner, created = Partner.objects.get_or_create(
#         name=pdata["name"],
#         defaults={
#             "type": pdata["type"],
#             "agent": agent,
#             "balance": Decimal("0.00"),
#             "is_active": True,
#         }
#     )
#     if created:
#         print(f'Partner "{partner.name}" created with agent "{agent}"')
#     else:
#         print(f'Partner "{partner.name}" already exists.')

# # --- Создание категорий ---
# # categories = ["kraska", "instrumenty", "himija", "materialy", "zapchasti"]
# categories = ["kraska"]
# for cname in categories:
#     category, created = Category.objects.get_or_create(name=cname)
#     if created:
#         print(f'Category "{cname}" created successfully!')
#     else:
#         print(f'Category "{cname}" already exists.')

# # --- Создание брендов и моделей ---
# brand_names = ["Polisem"]
# model_names = ["Poli"]

# brands = []
# for bname in brand_names:
#     brand, created = Brand.objects.get_or_create(name=bname)
#     brands.append(brand)
#     if created:
#         print(f'Brand "{bname}" created successfully!')
#     else:
#         print(f'Brand "{bname}" already exists.')

# # Для каждого бренда создаём 2–4 случайные модели
# for brand in brands:
#     if len(model_names) >= 2:
#         chosen_models = random.sample(model_names, k=random.randint(2, min(4, len(model_names))))
#     else:
#         chosen_models = model_names.copy()
#     for mname in chosen_models:
#         model, created = Model.objects.get_or_create(brand=brand, name=mname)
#         if created:
#             print(f'Model "{mname}" for brand "{brand.name}" created successfully!')
#         else:
#             print(f'Model "{mname}" for brand "{brand.name}" already exists.')

# # --- Создание тегов ---
# tag_names = ["4K", "LED", "Скидка", "Новинка", "Эко", "Популярное", "Бестселлер", "Limited", "Премиум", "Топ"]

# for name in tag_names:
#     tag, created = Tag.objects.get_or_create(name=name)
#     if created:
#         print(f'Tag "{name}" created successfully!')
#     else:
#         print(f'Tag "{name}" already exists.')

# # --- Создание единиц измерения ---
# units = {
#     "litr": UnitOfMeasurement.objects.get_or_create(name="литр")[0],
#     "banka": UnitOfMeasurement.objects.get_or_create(name="банка")[0],
#     "korobka": UnitOfMeasurement.objects.get_or_create(name="коробка")[0],
# }

# # --- Категории для продуктов ---
# categories = list(Category.objects.all())

# # --- Теги для продуктов ---
# tags = list(Tag.objects.all())

# # --- Создание продукта kraska Polisem 18 литров ---
# base_unit = units["litr"]
# product_kraska = Product.objects.get_or_create(
#     name="Polisem 18 литров",
#     defaults={
#         "base_unit": base_unit,
#         "category": Category.objects.get(name="kraska"),
#         "purchase_price": Decimal("25.00"),
#         "retail_price": Decimal("35.00"),
#         "wholesale_price": Decimal("30.00"),
#         "brand": Brand.objects.get(name="Polisem"),
#         "model": Model.objects.filter(brand__name="Polisem").first(),
#     }
# )[0]

# # Добавляем количеста по складам продукта Polisem 18 litrow
# w1 = Warehouse.objects.get(name="Sklad 1 USD")
# w2 = Warehouse.objects.get(name="Sklad 2 USD")
# w3 = Warehouse.objects.get(name="Sklad 1 TMT")
# WarehouseProduct.objects.update_or_create(
#     warehouse=w1,
#     product=product_kraska,
#     defaults={"quantity": 7200}
# )
# WarehouseProduct.objects.update_or_create(
#     warehouse=w2,
#     product=product_kraska,
#     defaults={"quantity": 14400}
# )

# # --- Добавление единиц для продукта ---
# ProductUnit.objects.get_or_create(
#     product=product_kraska,
#     unit=units["litr"],
#     defaults={"conversion_factor": Decimal("1.0"), "is_default_for_sale": False}
# )

# ProductUnit.objects.get_or_create(
#     product=product_kraska,
#     unit=units["banka"],
#     defaults={"conversion_factor": Decimal("18.0"), "is_default_for_sale": True}
# )

# ProductUnit.objects.get_or_create(
#     product=product_kraska,
#     unit=units["korobka"],
#     defaults={"conversion_factor": Decimal("72.0"), "is_default_for_sale": False}
# )

# print(f'Product "{product_kraska.name}" with units created successfully!')

# # --- Создание правил проводок ---
# operation_data = [
#     {"code": "sale", "name": "Продажа фактура"},
#     {"code": "purchase", "name": "Приход фактура"},
#     {"code": "return", "name": "Возврат фактура"},
# ]

# for o in operation_data:
#     operation, created = Operation.objects.get_or_create(
#         code=o["code"],
#         defaults={"name": o["name"]}
#     )

# sale = Operation.objects.get(code="sale")
# purchase = Operation.objects.get(code="purchase")
# return_obj = Operation.objects.get(code="return")

# # #########################################################################################################################################################################################################
# # #########################################################################################################################################################################################################
# # Sale faktura START

# # # USD START
# debit_account = Account.objects.get(number="60")
# credit_account = Account.objects.get(number="40")
# CustomePostingRule.objects.get_or_create(
#     operation=sale, 
#     directory_type="klient", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_usd,
#     defaults={"description": "Sale faktura, klient, Продажа, USD"}
# )

# debit_account = Account.objects.get(number="46.1")
# credit_account = Account.objects.get(number="80")
# CustomePostingRule.objects.get_or_create(
#     operation=sale, 
#     directory_type="klient", 
#     amount_type="profit",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_usd,
#     defaults={"description": "Sale faktura, klient, Прибыль, USD"}
# )

# debit_account = Account.objects.get(number="75")
# credit_account = Account.objects.get(number="40")
# CustomePostingRule.objects.get_or_create(
#     operation=sale, 
#     directory_type="founder", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_usd,
#     defaults={"description": "Sale faktura, founder, Продажа, USD"}
# )

# debit_account = Account.objects.get(number="46.2")
# credit_account = Account.objects.get(number="80")
# CustomePostingRule.objects.get_or_create(
#     operation=sale, 
#     directory_type="founder", 
#     amount_type="profit",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_usd,
#     defaults={"description": "Sale faktura, founder, Прибыль, USD"}
# )
# # # USD END

# # # TMT START
# debit_account = Account.objects.get(number="62")
# credit_account = Account.objects.get(number="42")
# CustomePostingRule.objects.get_or_create(
#     operation=sale, 
#     directory_type="klient", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_tmt,
#     defaults={"description": "Sale faktura, klient, Продажа, TMT"}
# )

# debit_account = Account.objects.get(number="47.1")
# credit_account = Account.objects.get(number="80")
# CustomePostingRule.objects.get_or_create(
#     operation=sale, 
#     directory_type="klient", 
#     amount_type="profit",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_tmt,
#     defaults={"description": "Sale faktura, klient, Прибыль, TMT"}
# )

# debit_account = Account.objects.get(number="47.2")
# credit_account = Account.objects.get(number="80")
# CustomePostingRule.objects.get_or_create(
#     operation=sale, 
#     directory_type="founder", 
#     amount_type="profit",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_tmt,
#     defaults={"description": "Sale faktura, founder, Прибыль, TMT"}
# )

# debit_account = Account.objects.get(number="76")
# credit_account = Account.objects.get(number="42")
# CustomePostingRule.objects.get_or_create(
#     operation=sale, 
#     directory_type="founder", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_tmt,
#     defaults={"description": "Sale faktura, founder, Продажа, TMT"}
# )
# # # TMT END
# # Sale faktura END
# # #########################################################################################################################################################################################################

# # #########################################################################################################################################################################################################
# # Purchase faktura START
# debit_account = Account.objects.get(number="40")
# credit_account = Account.objects.get(number="60")
# CustomePostingRule.objects.get_or_create(
#     operation=purchase, 
#     directory_type="klient", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_usd,
#     defaults={"description": "purchase faktura, klient, USD"}
# )

# debit_account = Account.objects.get(number="40")
# credit_account = Account.objects.get(number="75")
# CustomePostingRule.objects.get_or_create(
#     operation=purchase, 
#     directory_type="founder", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_usd,
#     defaults={"description": "purchase faktura, founder, USD"}
# )

# debit_account = Account.objects.get(number="42")
# credit_account = Account.objects.get(number="76")
# CustomePostingRule.objects.get_or_create(
#     operation=purchase, 
#     directory_type="founder", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_tmt,
#     defaults={"description": "Purchase faktura, founder, продажа, TMT"}
# )

# debit_account = Account.objects.get(number="42")
# credit_account = Account.objects.get(number="62")
# CustomePostingRule.objects.get_or_create(
#     operation=purchase, 
#     directory_type="founder", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_tmt,
#     defaults={"description": "purchase faktura, klient, продажа, TMT"}
# )
# # Purchase faktura END
# # #########################################################################################################################################################################################################

# # #########################################################################################################################################################################################################
# # Return faktura START
# debit_account = Account.objects.get(number="60")
# credit_account = Account.objects.get(number="40")
# CustomePostingRule.objects.get_or_create(
#     operation=return_obj, 
#     directory_type="klient", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_usd,
#     defaults={"description": "Возврат, klient USD"}
# )

# debit_account = Account.objects.get(number="75")
# credit_account = Account.objects.get(number="40")
# CustomePostingRule.objects.get_or_create(
#     operation=return_obj, 
#     directory_type="founder", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_usd,
#     defaults={"description": "Возврат, founder USD"}
# )

# debit_account = Account.objects.get(number="62")
# credit_account = Account.objects.get(number="42")
# CustomePostingRule.objects.get_or_create(
#     operation=return_obj, 
#     directory_type="klient", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_tmt,
#     defaults={"description": "Возврат, klient TMT"}
# )

# debit_account = Account.objects.get(number="76")
# credit_account = Account.objects.get(number="42")
# CustomePostingRule.objects.get_or_create(
#     operation=return_obj, 
#     directory_type="founder", 
#     amount_type="revenue",
#     debit_account=debit_account,
#     credit_account=credit_account,
#     currency=cur_tmt,
#     defaults={"description": "Возврат, founder TMT"}
# )
# # Return faktura END
# # #########################################################################################################################################################################################################
# EOF

echo "Starting Django server..."
exec "$@"
