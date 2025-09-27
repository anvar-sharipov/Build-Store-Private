from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from icecream import ic
from .. models import *
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status


#####################################################################################################################################################################
#####################################################################################################################################################################
#####################################################################################################################################################################
#####################################################################################################################################################################
# create and update invoice START
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_invoice(request):
    if request.method == "POST":
        ic('save_invoice', request.user)
        try:
            
            data = json.loads(request.body)
            ic(data['id'])
            is_entry = data['is_entry']  
            awto = data['awto']
            awto_send = data['awto_send']
            partner_send = data['partner_send']
            send = data['send']
            invoice_date = data['invoice_date']
            partner = data['partner']
            products = data['products']
            type_price = data['type_price']
            warehouse = data['warehouse']
            wozwrat_or_prihod = data['wozwrat_or_prihod']
            comment=data["comment"]
            invoice_id = data['id']
            
            
            #####################################################################################################################################################################
            #####################################################################################################################################################################
            # Все валидации START
            if not send:
                return JsonResponse({"status": "error", "message": "fill in all the fields"}, status=400)
            
            if not wozwrat_or_prihod or wozwrat_or_prihod not in ["wozwrat", "prihod", "rashod"]:
                return JsonResponse({"status": "error", "message": "choose rashod, prihod or wozwrat"}, status=400)
            
            if not invoice_date:
                return JsonResponse({"status": "error", "message": "choose date prowodok"}, status=400)
            
            if not products:
                return JsonResponse({"status": "error", "message": "choose products"}, status=400)
                
            if not type_price:
                return JsonResponse({"status": "error", "message": "choose whosale price or retail price"}, status=400)
            
            if not warehouse:
                return JsonResponse({"status": "error", "message": "selectWarehouse"}, status=400)
            
            try:
                warehouse_obj = Warehouse.objects.get(id=warehouse["id"])
            except:
                return JsonResponse({"status": "error", "message": "cant find warehouse in database"}, status=400)
            
            
            if is_entry:
                if not comment:
                    return JsonResponse({"status": "error", "message": "writeComment"}, status=400)
                
                if not awto_send:
                    return JsonResponse({"status": "error", "message": "choose awto"}, status=400)
                
                if not partner_send:
                    return JsonResponse({"status": "error", "message": "choose partner"}, status=400)
            
                if not awto:
                    return JsonResponse({"status": "error", "message": "choose awto"}, status=400)
                
                try:
                    awto_obj = Employee.objects.get(id=awto["id"])
                except:
                    return JsonResponse({"status": "error", "message": "cant find awto in database"}, status=400)
                
                if not partner:
                    return JsonResponse({"status": "error", "message": "choose partner"}, status=400)
                
                try:
                    partner_obj = Partner.objects.get(id=partner["id"])
                except:
                    return JsonResponse({"status": "error", "message": "cant find parnter in database"}, status=400)
            else:
                if awto:
                    try:
                        awto_obj = Employee.objects.get(id=awto["id"])
                    except:
                        return JsonResponse({"status": "error", "message": "cant find awto in database"}, status=400)
                else:
                    awto_obj = None
                    
                if partner:
                    try:
                        partner_obj = Partner.objects.get(id=partner["id"])
                    except:
                        return JsonResponse({"status": "error", "message": "cant find parnter in database"}, status=400)
                    
                    if not partner_obj.is_active:
                        return JsonResponse({"status": "error", "message": "partner is not active"}, status=400)
                else:
                    partner_obj = None         
            # Все валидации END
            #####################################################################################################################################################################
            #####################################################################################################################################################################
            
                
                
            #####################################################################################################################################################################
            # create
            if not invoice_id:
                # create s prowodkoy
                if is_entry:
                    
                    if wozwrat_or_prihod == "wozwrat":
                        return JsonResponse({"status": "ok", "message": f"wozwrat invoice saved with entry"})
                    elif wozwrat_or_prihod == "prihod":
                        return JsonResponse({"status": "ok", "message": f"prihod invoice saved with entry"})
                    elif wozwrat_or_prihod == "rashod":
                        # operation = Operation.objects.filter(code="sale")
                        
                        # if not operation.exists():
                        #     return JsonResponse({"status": "error", "message": "net prawilo prowodok dlya faktura rashod"}, status=400)
                        
                        # if len(operation) != 1:
                        #     return JsonResponse({"status": "error", "message": "u was bolshe 1 prawilo prowodok dlya faktura rashod"}, status=400)
                        
                        # rules = CustomePostingRule.objects.filter(operation=operation, directory_type=partner.type)
                    
                        return JsonResponse({"status": "ok", "message": f"rashod invoice saved with entry"})
                # create bez prowodki 
                else:
                    
                    # # Invoice.objects.all().delete()
                    # test = Invoice.objects.all()
                    # ic(test)
                    # test2 = InvoiceItem.objects.all()
                    # ic(test2)
                    
                    # ic(type_price)
                    
                    try:
                        with transaction.atomic():
                        
                        
                            invoice = Invoice.objects.create(
                                awto=awto_obj,
                                awto_send=awto_send,
                                comment=comment,
                                invoice_date=invoice_date,
                                is_entry=is_entry,
                                partner=partner_obj,
                                partner_send=partner_send,
                                send=send,
                                type_price=type_price,
                                warehouse=warehouse_obj,
                                wozwrat_or_prihod=wozwrat_or_prihod,
                                created_by=request.user,
                                created_at_handle=invoice_date,
                                updated_at_handle=invoice_date,
                                
                                )
                            
                            for product in products:
                                try:
                                    product_obj = Product.objects.get(id=product['id'])
                                except Product.DoesNotExist:
                                    return JsonResponse({"status": "error", "message": "product is not fined", "not_fined_product_name": product['name']}, status=400)
                                
                                base_unit_obj = product["base_unit_obj"]
                                # ic(base_unit_obj)
                                try:
                                    base_unit_obj_obj = UnitOfMeasurement.objects.get(id=base_unit_obj["id"])
                                except UnitOfMeasurement.DoesNotExist:
                                    return JsonResponse({"status": "error", "message": "unit is not fined", "not_fined_unit_name": base_unit_obj['name']}, status=400)
                                
                
                                invoiceItem = InvoiceItem.objects.create(
                                    # item_id=product["id"],
                                    base_quantity_in_stock=product["base_quantity_in_stock"],
                                    base_unit_obj=base_unit_obj_obj,
                                    discount_price=product["discount_price"],
                                    firma_price=product["firma_price"],
                                    is_custom_price=product["is_custom_price"],
                                    is_gift=product["is_gift"],
                                    parent_id=product.get("parent_id"),
                                    purchase_price=product["purchase_price"],
                                    quantity_on_selected_warehouses=product["quantity_on_selected_warehouses"],
                                    retail_price=product["retail_price"],
                                    selected_price=product["selected_price"],
                                    selected_quantity=product["selected_quantity"],
                                    total_quantity=product["base_quantity_in_stock"],
                                    unit_name_on_selected_warehouses=product["unit_name_on_selected_warehouses"],
                                    wholesale_price=product["wholesale_price"],   
                                    invoice=invoice,
                                    product=product_obj                         
                                    )
                                
                                
                                if product.get('free_items') and len(product.get('free_items')) > 0:
                                    for free_items in product['free_items']: 
                                        try:
                                            gift_product_obj = Product.objects.get(id=free_items['gift_product'])
                                        except Product.DoesNotExist:
                                            return JsonResponse({"status": "error", "message": "product is not fined", "not_fined_product_name": free_items['gift_product_name']}, status=400)
                                        
                                        FreeItemForInvoiceItem.objects.create(
                                            main_product = invoiceItem,
                                            gift_product_obj = gift_product_obj,
                                            gift_product_name=free_items['gift_product_name'],
                                            gift_product_unit_name=free_items['gift_product_unit_name'],
                                            quantity_per_unit=free_items['quantity_per_unit']
                                        )
                                
                                if product.get('units') and len(product.get('units')) > 0:
                                    for unit in product.get('units'):
                                        if unit['is_default_for_sale']:
                                            UnitForInvoiceItem.objects.create(
                                                main_product=invoiceItem,
                                                base_unit_name=unit['base_unit_name'],
                                                conversion_factor=unit['conversion_factor'],
                                                unit_id=unit['id'],
                                                is_default_for_sale=unit['is_default_for_sale'],
                                                unit_name=unit['unit_name'],
                                            )
                            
                            return JsonResponse({"status": "ok", "message": f"{wozwrat_or_prihod} invoice saved without entry", "id": invoice.id})
                    except Exception as e:
                        ic(e)
                        return JsonResponse({"status": "error", "message": "transactionChange", "reason_for_the_error": e}, status=400)
                        
                        
                    # if wozwrat_or_prihod == "wozwrat":
                    #     return JsonResponse({"status": "ok", "message": f"wozwrat invoice saved without entry"})
                    # elif wozwrat_or_prihod == "prihod":
                    #     return JsonResponse({"status": "ok", "message": f"prihod invoice saved without entry"})
                    # elif wozwrat_or_prihod == "rashod":
                    #     return JsonResponse({"status": "ok", "message": f"rashod invoice saved without entry", "id": invoice.id})
                        
                        
                                    
            
            #####################################################################################################################################################################        
            # update invoice    
            else:
                ic('FFFFFFFFFFFF TUT UPDATE INVOICE')
                # update s prowodkoy
                if is_entry:
                    pass
                
                # update bez prowodki
                else:
                    try:
                        with transaction.atomic():
                            # 1. Получаем накладную
                            invoice = Invoice.objects.get(id=invoice_id)

                            # 2. Обновляем основные поля (без движения по складу)
                            invoice.awto = awto_obj
                            invoice.awto_send = awto_send
                            invoice.comment = comment
                            invoice.invoice_date = invoice_date
                            invoice.is_entry = is_entry
                            invoice.partner = partner_obj
                            invoice.partner_send = partner_send
                            invoice.send = send
                            invoice.type_price = type_price
                            invoice.warehouse = warehouse_obj
                            invoice.wozwrat_or_prihod = wozwrat_or_prihod
                            invoice.updated_at = timezone.now()
                            invoice.updated_at_handle = invoice_date
                            invoice.save()

                            # 3. Удаляем старые связанные записи
                            InvoiceItem.objects.filter(invoice=invoice).delete()

                            # 4. Создаём новые items
                            for product in products:
                                product_obj = Product.objects.get(id=product['id'])
                                base_unit_obj = UnitOfMeasurement.objects.get(id=product["base_unit_obj"]["id"])

                                invoiceItem = InvoiceItem.objects.create(
                                    base_quantity_in_stock=product["base_quantity_in_stock"],
                                    base_unit_obj=base_unit_obj,
                                    discount_price=product["discount_price"],
                                    firma_price=product["firma_price"],
                                    is_custom_price=product["is_custom_price"],
                                    is_gift=product["is_gift"],
                                    parent_id=product.get("parent_id"),
                                    purchase_price=product["purchase_price"],
                                    quantity_on_selected_warehouses=product["quantity_on_selected_warehouses"],
                                    retail_price=product["retail_price"],
                                    selected_price=product["selected_price"],
                                    selected_quantity=product["selected_quantity"],
                                    total_quantity=product["base_quantity_in_stock"],
                                    unit_name_on_selected_warehouses=product["unit_name_on_selected_warehouses"],
                                    wholesale_price=product["wholesale_price"],   
                                    invoice=invoice,
                                    product=product_obj
                                )

                                # FreeItems
                                if product.get('free_items'):
                                    for free_item in product['free_items']:
                                        gift_product_obj = Product.objects.get(id=free_item['gift_product'])
                                        FreeItemForInvoiceItem.objects.create(
                                            main_product=invoiceItem,
                                            gift_product_obj=gift_product_obj,
                                            gift_product_name=free_item['gift_product_name'],
                                            gift_product_unit_name=free_item['gift_product_unit_name'],
                                            quantity_per_unit=free_item['quantity_per_unit']
                                        )

                                # Units
                                if product.get('units'):
                                    for unit in product['units']:
                                        UnitForInvoiceItem.objects.create(
                                            main_product=invoiceItem,
                                            base_unit_name=unit['base_unit_name'],
                                            conversion_factor=unit['conversion_factor'],
                                            unit_id=unit['id'],
                                            is_default_for_sale=unit['is_default_for_sale'],
                                            unit_name=unit['unit_name'],
                                        )

                            return JsonResponse({"status": "ok", "message": f"{wozwrat_or_prihod} invoice updated without entry", "id": invoice.id})
                    except Invoice.DoesNotExist:
                        return JsonResponse({"status": "error", "message": "Invoice not found"}, status=404)
                    
                    # if wozwrat_or_prihod == "wozwrat":
                    #     return JsonResponse({"status": "ok", "message": f"wozwrat invoice saved without entry"})
                    # elif wozwrat_or_prihod == "prihod":
                    #     return JsonResponse({"status": "ok", "message": f"prihod invoice saved without entry"})
                    # elif wozwrat_or_prihod == "rashod":
                        
                                        
                                            

            return JsonResponse({"status": "ok", "message": "Invoice saved"})
        except Exception as e:
            ic(e)
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

# create and update invoice END
#####################################################################################################################################################################
#####################################################################################################################################################################
#####################################################################################################################################################################
#####################################################################################################################################################################




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoices(request):
    # query params будут в request.GET, например ?partner=1&wozwrat_or_prihod=prihod
    invoices = Invoice.objects.all()

    partner_id = request.GET.get('partner')
    wozwrat_or_prihod = request.GET.get('wozwrat_or_prihod')

    if partner_id:
        invoices = invoices.filter(partner_id=partner_id)
    if wozwrat_or_prihod:
        invoices = invoices.filter(wozwrat_or_prihod=wozwrat_or_prihod)

    data = []
    for invoice in invoices:
        data.append({
            "id": invoice.id,
            "invoice_date": invoice.invoice_date,
            "partner": invoice.partner.name if invoice.partner else None,
            "type_price": invoice.type_price,
            "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
            "send": invoice.send,
            # можно добавить больше полей по необходимости
        })

    return JsonResponse({"status": "ok", "invoices": data})




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoice_data(request, id):
    # ic(id)
    try:
        invoice = Invoice.objects.get(pk=id)
        # ic(invoice.awto)
    except Invoice.DoesNotExist:
        return Response(
            {"status": "error", "message": "Invoice not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    
    if invoice.awto:
        awto_json = {"id":invoice.awto.id, "name":invoice.awto.name}
    else:
        awto_json = None
        
    if invoice.partner:
        p = invoice.partner
        agent_id = None
        agent_name = None
        if p.agent:
            agent_id = p.agent.id
            agent_name = p.agent.name
        partner_json = {"agent":agent_id, "agent_name":agent_name, "balance":p.balance, "id":p.id, "is_active":p.is_active, "name":p.name, "type": p.type, "type_display":p.get_type_display()}
    else:
        partner_json = None
        
    if invoice.warehouse:
        w = invoice.warehouse
        warehouse_json = {"id":w.id, "is_active":w.is_active, "location":w.location, "name":w.name}
    else:
        warehouse_json = None
        
    # ic(invoice.created_by.username)
    
    if invoice.created_by:
        created_by_json_name = invoice.created_by.username
    else:
        created_by_json_name = None
        
        
        
    items = InvoiceItem.objects.filter(invoice=invoice)
    products = []
    
    for item in items:
       
       
        images = [
            {
                "id": img.id,
                "product": img.product.id,
                "image": img.image.url,  # обязательно url
                "alt_text": img.alt_text or "",
            }
            for img in item.product.images.all()
        ]
                
            
        
        
        base_unit_obj = None
        if item.base_unit_obj:
            u = item.base_unit_obj
            base_unit_obj = {"id": u.id, "name": u.name}
            
        units = UnitForInvoiceItem.objects.filter(main_product=item)
        units_json = None
        if units:
            for u in units:
                units_json = [{"base_unit_name": u.base_unit_name, 
                               "conversion_factor": u.conversion_factor,
                               "is_default_for_sale": u.is_default_for_sale,
                               "id": u.unit_id,
                               "unit_name":u.unit_name
                               }]
                
            
            
        if invoice.warehouse:
            quantity = item.product.warehouse_products.filter(
                warehouse_id=invoice.warehouse
            ).aggregate(total=models.Sum('quantity'))['total'] or 0
            base_quantity_in_stock = quantity
        else:
            quantity = item.product.get_total_quantity()
        if units_json:
            quantity = float(quantity) / float(units_json[0]["conversion_factor"])
            
        ic(quantity)
        
        products.append({
            "base_quantity_in_stock": quantity, # item.base_quantity_in_stock
            "base_unit_obj": base_unit_obj,
            "discount_price": item.discount_price,
            "firma_price": item.firma_price,
            "is_custom_price": item.is_custom_price,
            "is_gift": item.is_gift,
            "parent_id": item.parent_id,
            "purchase_price": item.purchase_price,
            "quantity_on_selected_warehouses": quantity,
            "retail_price": item.retail_price,
            "selected_price": item.selected_price,
            "selected_quantity": item.selected_quantity,
            "total_quantity": item.total_quantity,
            "unit_name_on_selected_warehouses": item.unit_name_on_selected_warehouses,
            "wholesale_price": item.wholesale_price,
            "id": item.product.id,
            "name": item.product.name,
            "units": units_json,
            "height": item.product.height,
            "length": item.product.length,
            "volume": item.product.volume,
            "weight": item.product.weight,
            "width": item.product.width,
            "free_items": [
                {
                    "gift_product": f.gift_product_obj.id, # f.id
                    "gift_product_name": f.gift_product_name,
                    "gift_product_unit_name": f.gift_product_unit_name,
                    "quantity_per_unit": float(f.quantity_per_unit),
                    "gift_product_id": f.gift_product_obj.id
                }
                for f in item.free_items.all()
            ],
            "images": images
            # добавь любые другие поля, которые нужны
        })
        
    
        
    # ic(awto_json)
    # ic(partner_json)
    
        
    data = {
        "awto":awto_json,
        "awto_send": invoice.awto_send,
        "comment": invoice.comment,
        "invoice_date":invoice.invoice_date,
        "is_entry": invoice.is_entry,
        "partner": partner_json,
        "partner_send":invoice.partner_send,
        "send": invoice.send,
        "type_price": invoice.type_price,
        "warehouse": warehouse_json,
        "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
        "created_by": created_by_json_name,
        "entry_created_by": invoice.entry_created_by,
        "created_at": invoice.created_at,
        "updated_at": invoice.updated_at,
        "entry_created_at": invoice.entry_created_at,
        "products": products,
        "created_at_handle": invoice.created_at_handle,
        "updated_at_handle": invoice.updated_at_handle,
        "entry_created_at_handle": invoice.entry_created_at_handle,
        
        "id": invoice.id,
        "type": invoice.wozwrat_or_prihod,
        # "date": invoice.invoice_date,
        "date": invoice.invoice_date.strftime("%Y.%m.%d") if invoice.invoice_date else None,
        # добавь что нужно ещё
    }
    # ic(data)
    return Response(data, status=status.HTTP_200_OK)