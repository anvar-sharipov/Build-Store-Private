# views.py
import openpyxl
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from icecream import ic
from ...models import Product, UnitOfMeasurement, WarehouseProduct, Warehouse, Category
from decimal import Decimal

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def import_products(request):
    excel = request.FILES.get("file")
    
  

    if not excel:
        return Response({"detail": "Файл не получен."}, status=status.HTTP_400_BAD_REQUEST)

    if not (excel.name.lower().endswith(".xlsx") or excel.name.lower().endswith(".xls")):
        return Response({"detail": "Поддерживаются только .xlsx или .xls."}, status=status.HTTP_400_BAD_REQUEST)
    
    warehouse = Warehouse.objects.first()
    
    units = UnitOfMeasurement.objects.all()
    units_obj_dict = {}
    for u in units:
        if u.name not in units_obj_dict:
            units_obj_dict[u.name] = u
            
    categories = Category.objects.all()
    categories_obj_dict = {}
    for u in categories:
        if u.name not in categories_obj_dict:
            categories_obj_dict[u.name] = u
            
    try:
        # Загружаем Excel
        wb = openpyxl.load_workbook(excel, data_only=True)
        sheet = wb.active

        imported = []
        category = ''
        after_jemi = False
        test_total_price = 0
        test_total_price2 = 0
        
        for row in sheet.iter_rows(min_row=2, values_only=True):  # пропускаем заголовок
            cell = row[0]
            if cell:  # если ячейка не пустая
                if not str(cell).isdigit():  # проверяем, что это не число
                    if "Hemmesi" in str(cell):
                        print("Найдено Hemmesi, выходим из цикла")
                        break
            
            if row[0] == "Truba" or after_jemi:
                category = row[0].strip()
                if category in categories_obj_dict:
                    cat_obj = categories_obj_dict[category]
                else:
                    cat_obj = Category.objects.create(name=category)
                after_jemi = False
                print(category)
                continue
            
            if row[0] != 'Jemi': 
                if category != '':
                    pass
                    name = row[2].strip()
                    unit = row[3].strip()
                    price = Decimal(row[4])
                    quantity = Decimal(row[5])
                    # total_price = row[6]
                    # test_total_price += price
                    # test_total_price2 += total_price
                    
                    if unit in units_obj_dict:
                        unit_obj = units_obj_dict[unit]
                    else:
                        unit_obj = UnitOfMeasurement.objects.create(name=unit)
                         
                    product = Product.objects.create(name=name, base_unit=unit_obj, purchase_price=price, retail_price=price, wholesale_price=price, category=cat_obj)
                    WarehouseProduct.objects.create(product=product, warehouse=warehouse, quantity=quantity)
            else:
                after_jemi = True
                continue
                
            
                
                
                
        
            # name, price, qty = row[0], row[1], row[2]
            # if not name:
            #     continue
            # imported.append({
            #     "name": name,
            #     "price": price or 0,
            #     "qty": qty or 0,
            # })

        
        # Здесь можно сразу сохранить в БД, например:
        # for item in imported:
        #     Product.objects.update_or_create(name=item["name"], defaults={"price": item["price"], "qty": item["qty"]})
        # ic(test_total_price)
        # ic(test_total_price2)
        return Response(
            {
                "detail": f"Импортировано {len(imported)} строк.",
                "rows": imported[:5],  # для примера возвращаем первые 5
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        ic(f"Ошибка обработки файла: {e}")
        return Response({"detail": f"Ошибка обработки файла: {e}"}, status=status.HTTP_400_BAD_REQUEST)
