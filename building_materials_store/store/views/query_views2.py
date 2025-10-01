from ..models import *
from django.http import JsonResponse
from icecream import ic
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status




# поиск продукта по id и складу
def get_product_by_id_and_warehouse(request):
    product_id = request.GET.get('product_id')
    main_product_id = request.GET.get('main_product_id')
    warehouse_id = request.GET.get('warehouse_id')
    warehouse = Warehouse.objects.get(id=warehouse_id)
    
    main_product_obj = Product.objects.get(id=main_product_id)

    if not product_id or not warehouse_id:
        return JsonResponse({'error': 'Missing parameters'}, status=400)

    try:
        # получаем запись на складе
        wp = WarehouseProduct.objects.select_related('product').get(
            product_id=product_id,
            warehouse_id=warehouse_id
        )
        product = wp.product
        
   
        base_unit_obj = {"id":product.base_unit.id, "name":product.base_unit.name}
        
        images = []
        product_images = product.images.all()
        if product_images.exists():
            for i in product_images:
                images.append({
                    "alt_text": i.alt_text,
                    "id": i.id,
                    "image": i.image.url,
                    "product": product.id,
                })
                
        auqntity_for_per_unit_main_product = FreeProduct.objects.get(main_product=main_product_obj, gift_product=product).quantity_per_unit
                
        if warehouse:
            quantity = product.warehouse_products.filter(
                warehouse_id=warehouse
            ).aggregate(total=models.Sum('quantity'))['total'] or 0
            base_quantity_in_stock = quantity
        else:
            quantity = product.get_total_quantity()

        unit_name = product.base_unit.name if product.base_unit else ""
        for unit in product.units.all():
            if unit.is_default_for_sale and unit.conversion_factor:
                # print('quantity', quantity)
                # print('unit.conversion_factor', unit.conversion_factor)
                quantity = float(quantity) / float(unit.conversion_factor)
                unit_name = unit.unit.name
                break
            
            
        units_obj = ProductUnit.objects.filter(product=product, )
        units = []
        if units_obj.exists():
            units.append({
                "base_unit_name": base_unit_obj.name,
                "conversion_factor": units_obj.conversion_factor,
                "is_default_for_sale": units_obj.is_default_for_sale,
                "unit_name": units_obj.unit.name
                
            })
            
        warehouses_data = [{
            "quantity": float(wp.quantity),
            "warehouse_id": warehouse_id,
            "warehouse_name": warehouse.name
        }]
            
 
        data = {
            'base_quantity_in_stock': float(wp.quantity),
            "base_unit_obj": base_unit_obj,
            "discount_price": product.discount_price,
            "firma_price": product.firma_price,
            "height": product.height,
            "id": product.id,
            "images": images,
            "is_active": product.is_active,
            "is_custom_price": True,
            "is_gift": True,
            "length": product.length,
            "name": product.name,
            "purchase_price": product.purchase_price,
            "qr_code": product.qr_code,
            "quantity_on_selected_warehouses": quantity,
            "retail_price": product.retail_price,
            "selected_price": 0,
            "selected_quantity": auqntity_for_per_unit_main_product,
            "sku": product.sku,
            # "total_quantity": product.firma_price,
            'unit_name_on_selected_warehouses': unit_name,
            "units": units,
            "volume": product.volume,
            "warehouses_data": product.firma_price,
            "warehouses_data": warehouses_data,
            "weight": product.weight,
            "wholesale_price": product.wholesale_price,
            "width": product.width,
            # "firma_price": product.firma_price,
            # "firma_price": product.firma_price,
            # "firma_price": product.firma_price,
            
            
            # 'id': product.id,
            # 'name': product.name,
            # 'price': product.retail_price,   # или любая цена
            
            # 'free_items': [
            #     {
            #         'id': f.gift_product.id,
            #         'name': f.gift_product.name,
            #         'quantity_per_unit': float(f.quantity_per_unit)
            #     } for f in product.free_items.all()
            # ]
        }
        return JsonResponse(data)
    except WarehouseProduct.DoesNotExist:
        return JsonResponse({'error': 'Product not found in this warehouse'}, status=404)
    
    
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_detail(request, id):
    transaction_obj = Transaction.objects.get(pk=id)

    data = {
        "transaction_id": transaction_obj.id,
    }

    if transaction_obj.invoice:
        invoice = transaction_obj.invoice
        data["invoice_id"] = invoice.id,
        
        
    ic(transaction_obj)

    return Response(data, status=status.HTTP_200_OK)