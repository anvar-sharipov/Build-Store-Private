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
from django.core.paginator import Paginator
from django.db.models import Q, Sum, F
from datetime import datetime
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from decimal import Decimal



def normalize_date(date_str: str) -> str:
    """
    Принимает дату строкой (например '05.09.2025' или '2025-09-05')
    и возвращает её в формате 'YYYY-MM-DD'.
    """
    # Возможные форматы
    formats = ["%d.%m.%Y", "%Y-%m-%d"]

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    
    raise ValueError(f"Неизвестный формат даты: {date_str}")





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
        # ic('save_invoice', request.user)
        if not request.user.groups.filter(name="admin").exists():
            return JsonResponse({"status": "error", "message": "permission denied"}, status=403)
                
                
        
        
        # def create_entries(transaction_obj, rule, product_obj, warehouse_obj, amount):
        #     Entry.objects.create(
        #         transaction=transaction_obj,
        #         account=rule.debit_account,
        #         product=product_obj,
        #         warehouse=warehouse_obj,
        #         debit=amount,
        #     )
            
        #     Entry.objects.create(
        #         transaction=transaction_obj,
        #         account=rule.credit_account,
        #         product=product_obj,
        #         warehouse=warehouse_obj,
        #         credit=amount
        #     )
        
        def create_entries(transaction_obj, rule, product_obj, warehouse_obj, amount, warehouse_parent_account, warehouse_account_obj):
            debit_acc = warehouse_account_obj if rule.debit_account == warehouse_parent_account else rule.debit_account
            credit_acc = warehouse_account_obj if rule.credit_account == warehouse_parent_account else rule.credit_account
            ic(debit_acc)
            ic(credit_acc)
            Entry.objects.create(
                transaction=transaction_obj,
                account=debit_acc,
                product=product_obj,
                warehouse=warehouse_obj,
                debit=amount,
            )
            
            Entry.objects.create(
                transaction=transaction_obj,
                account=credit_acc,
                product=product_obj,
                warehouse=warehouse_obj,
                credit=amount
            )
                                    
    
        try:
            data = json.loads(request.body)
            # ic(data['id'])
            is_entry = data['is_entry']  
            awto = data['awto']
            awto_send = data['awto_send']
            partner_send = data['partner_send']
            send = data['send']
            invoice_date = data['invoice_date']
            invoice_date2 = data.get('invoice_date2')
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
            
            if wozwrat_or_prihod not in ["wozwrat", "prihod", "rashod"]:
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
                    print("PARTNER:", partner, type(partner))
                    # partner_obj = Partner.objects.select_for_update(id=partner["id"])
                    # partner_obj = Partner.objects.select_for_update().get(id=partner["id"])
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
                         
                         
                        product_map = {} # {product_id: product_obj}   
                        for product in products:
                            try:
                                product_obj = Product.objects.get(id=product['id'])
                                product_map[product['id']] = product_obj
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
                        
                        if is_entry:
                            partner_obj = Partner.objects.select_for_update().get(id=partner["id"])
                            if wozwrat_or_prihod == "rashod":
                                operation = Operation.objects.filter(code="sale")
                            elif wozwrat_or_prihod == "prihod":
                                operation = Operation.objects.filter(code="purchase")
                            elif wozwrat_or_prihod == "wozwrat":
                                operation = Operation.objects.filter(code="wozwrat")
                            if not operation.exists():
                                transaction.set_rollback(True)
                                return JsonResponse({"status": "error", "message": f"u dont have a rule for {wozwrat_or_prihod}"}, status=400)
                            if len(operation) != 1:
                                    transaction.set_rollback(True)
                                    return JsonResponse({"status": "error", "message": f"u have more rule than 1 for {wozwrat_or_prihod} faktura"}, status=400)
                            if not partner_obj.type:
                                    transaction.set_rollback(True)
                                    return JsonResponse({"status": "error", "message": "partner dont have a type"}, status=400)  
                            rules = CustomePostingRule.objects.filter(operation=operation[0], directory_type=partner_obj.type)
                            
                            if not rules.exists():
                                    transaction.set_rollback(True)
                                    return JsonResponse({"status": "error", "message": f"u dont have a rule for {wozwrat_or_prihod}"}, status=400)
                            transaction_obj = Transaction.objects.create(
                                description=f"Faktura № {str(invoice.pk)}\n{comment}", 
                                date=invoice_date, invoice=invoice, 
                                partner=partner_obj
                            )
                                
                            # ###########################################################################################################################################################
                            # wozwrat              
                            if wozwrat_or_prihod == "wozwrat":
                                return JsonResponse({"status": "ok", "message": f"wozwrat invoice saved with entry"})
                            
                            # ###########################################################################################################################################################
                            # prihod
                            elif wozwrat_or_prihod == "prihod":                                 
                                for product in products:
                                    product_obj = product_map[product['id']]
                                    
                                    quantity = Decimal(product['selected_quantity'])
                                    sale_price = Decimal(product['selected_price'])
                                    purchase_price = Decimal(product['purchase_price'])
                                    # retail_price = Decimal(product['retail_price'])
                                    # wholesale_price = Decimal(product['wholesale_price'])
                                    
                                    conversion_factor = 1
                                    units = product['units']
                                    if units:
                                        for u in units:
                                            if u['is_default_for_sale']:
                                                conversion_factor = Decimal(u['conversion_factor'])
                                    plus_to_stock = conversion_factor * Decimal(quantity)
                                    wp = WarehouseProduct.objects.select_for_update().get(warehouse=warehouse_obj, product=product_obj)  
                                    wp.quantity += Decimal(plus_to_stock)
                                    wp.save()
                                    
                                    warehouse_account = WarehouseAccount.objects.filter(warehouse=warehouse_obj)
                                    if not warehouse_account.exists():
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "The warehouse is not tied to an account"}, status=400)  
                                    if len(warehouse_account) != 1:
                                        return JsonResponse({"status": "error", "message": "To many linked account on this warehouse"}, status=400)
                                    
                                    warehouse_account_obj = warehouse_account[0].account
                                    
                                    if warehouse_account_obj.parent:
                                        warehouse_parent_account = warehouse_account_obj.parent
                                    else:
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "The warehouse account dont have a parent account"}, status=400)
                                    
                                    # partner_obj.balance -= Decimal(sale_price * quantity)
                                    for rule in rules:
                                        if not rule.amount_type in ['revenue']:
                                            transaction.set_rollback(True)
                                            return JsonResponse({"status": "error", "message": "rule must have revenue"}, status=400)
                                        if rule.amount_type == 'revenue': # продажа
                                            revenue_price = Decimal(sale_price * quantity)
                                            create_entries(transaction_obj, rule, product_obj, warehouse_obj, revenue_price, warehouse_parent_account, warehouse_account_obj)                                              
                                invoice.entry_created_at = invoice_date
                                invoice.entry_created_at_handle = invoice_date
                                invoice.entry_created_by = request.user
                                partner_obj.save()
                                invoice.save()
                                
                                # return JsonResponse({"status": "ok", "message": f"prihod invoice saved with entry"})
                            # ###########################################################################################################################################################
                            # rashod
                            elif wozwrat_or_prihod == "rashod":
                                
                                for product in products:
                                    product_obj = product_map[product['id']]
                                    
                                    quantity = Decimal(product['selected_quantity'])
                                    sale_price = Decimal(product['selected_price'])
                                    purchase_price = Decimal(product['purchase_price'])
                                    # retail_price = Decimal(product['retail_price'])
                                    # wholesale_price = Decimal(product['wholesale_price'])
                                    
                                    conversion_factor = 1
                                    units = product['units']
                                    if units:
                                        for u in units:
                                            if u['is_default_for_sale']:
                                                conversion_factor = Decimal(u['conversion_factor'])
                                    minus_to_stock = conversion_factor * Decimal(quantity)
                                    wp = WarehouseProduct.objects.select_for_update().get(warehouse=warehouse_obj, product=product_obj)
                                    if wp.quantity < minus_to_stock:
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "Not enough product in stock"}, status=400)    
                                    wp.quantity -= Decimal(minus_to_stock)
                                    wp.save()
                                    
                                    warehouse_account = WarehouseAccount.objects.filter(warehouse=warehouse_obj)
                                    if not warehouse_account.exists():
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "The warehouse is not tied to an account"}, status=400)  
                                    if len(warehouse_account) != 1:
                                        return JsonResponse({"status": "error", "message": "To many linked account on this warehouse"}, status=400)
                                    
                                    warehouse_account_obj = warehouse_account[0].account
                                    
                                    if warehouse_account_obj.parent:
                                        warehouse_parent_account = warehouse_account_obj.parent
                                    else:
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "The warehouse account dont have a parent account"}, status=400)
                                    
                                    
                          
                                    partner_obj.balance -= Decimal(sale_price * quantity)
                                    for rule in rules:
                                        if not rule.amount_type in ['revenue', 'profit']:
                                            transaction.set_rollback(True)
                                            return JsonResponse({"status": "error", "message": "rule must have revenue or profit"}, status=400)
                                        if rule.amount_type == 'revenue': # продажа
                                            revenue_price = Decimal(sale_price * quantity)
                                            create_entries(transaction_obj, rule, product_obj, warehouse_obj, revenue_price, warehouse_parent_account, warehouse_account_obj)
                                            
                                        elif rule.amount_type == 'profit':
                                            profit_price = Decimal((sale_price - purchase_price) * quantity)
                                            create_entries(transaction_obj, rule, product_obj, warehouse_obj, profit_price, warehouse_parent_account, warehouse_account_obj)
                                            
                                invoice.entry_created_at = invoice_date
                                invoice.entry_created_at_handle = invoice_date
                                invoice.entry_created_by = request.user
                                partner_obj.save()
                                invoice.save()
                                        
                        # 1/0 
                        # create success 
                        return JsonResponse({"status": "ok", "message": f"invoice saved", "id": invoice.id})
                                    
                                        
                except Exception as e:
                    ic(e)
                    # create error
                    return JsonResponse({"status": "error", "message": "transactionChange", "reason_for_the_error": str(e)}, status=400)
                
            #####################################################################################################################################################################        
            # update invoice    
            else:
                if not invoice_date2:
                    return JsonResponse({"status": "error", "message": "choose date prowodok"}, status=400)
                try:
                    with transaction.atomic():
                        invoice = Invoice.objects.get(id=invoice_id)
                        invoice_date = normalize_date(invoice_date2)
                        invoice.awto = awto_obj
                        invoice.awto_send = awto_send
                        invoice.comment = comment
                        invoice.invoice_date = invoice_date2
                        invoice.is_entry = is_entry
                        invoice.partner = partner_obj
                        invoice.partner_send = partner_send
                        invoice.send = send
                        invoice.type_price = type_price
                        invoice.warehouse = warehouse_obj
                        invoice.wozwrat_or_prihod = wozwrat_or_prihod
                        invoice.updated_at = timezone.now()
                        invoice.updated_at_handle = invoice_date2
                        # invoice.save()
                        
                        InvoiceItem.objects.filter(invoice=invoice).delete()
                        product_map = {}
                        
                        for product in products:
                            product_obj = Product.objects.get(id=product['id'])
                            product_map[product['id']] = product_obj
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

                        # return JsonResponse({"status": "ok", "message": f"{wozwrat_or_prihod} invoice updated without entry", "id": invoice.id})
                    
                        if is_entry:
                            partner_obj = Partner.objects.select_for_update().get(id=partner["id"])
                            if invoice.entry_created_at:
                                return JsonResponse({"status": "error", "message": "Invoice already posted"}, status=400)
                            
                            if wozwrat_or_prihod == "rashod":
                                operation = Operation.objects.filter(code="sale")
                            elif wozwrat_or_prihod == "prihod":
                                operation = Operation.objects.filter(code="purchase")
                            elif wozwrat_or_prihod == "wozwrat":
                                operation = Operation.objects.filter(code="wozwrat")
                                
                            if not operation.exists():
                                transaction.set_rollback(True)
                                return JsonResponse({"status": "error", "message": f"u dont have a rule for {wozwrat_or_prihod}"}, status=400)
                            
                            if len(operation) != 1:
                                transaction.set_rollback(True)
                                return JsonResponse({"status": "error", "message": f"u have more rule than 1 for {wozwrat_or_prihod} faktura"}, status=400)
                            
                            if not partner_obj.type:
                                transaction.set_rollback(True)
                                return JsonResponse({"status": "error", "message": "partner dont have a type"}, status=400)
                            
                            rules = CustomePostingRule.objects.filter(operation=operation[0], directory_type=partner_obj.type)
                            
                            if not rules.exists():
                                transaction.set_rollback(True)
                                return JsonResponse({"status": "error", "message": f"u dont have a rule for {wozwrat_or_prihod}"}, status=400)
                            
                            transaction_obj = Transaction.objects.create(
                                description=f"Faktura № {str(invoice.pk)}\n{comment}", 
                                date=invoice_date2, invoice=invoice, 
                                partner=partner_obj
                            )

                            # #######################################################################################################################################
                            # wozwrat
                            if wozwrat_or_prihod == "wozwrat":
                                return JsonResponse({"status": "ok", "message": f"wozwrat invoice saved without entry"})
                            # #######################################################################################################################################
                            # prihod
                            elif wozwrat_or_prihod == "prihod":
                                for product in products:
                                    
                                    product_obj = product_map[product['id']]
                                    
                                    quantity = Decimal(product['selected_quantity'])
                                    sale_price = Decimal(product['selected_price'])
                                    purchase_price = Decimal(product['purchase_price'])
 
                                    conversion_factor = 1
                                    units = product['units']
                                    if units:
                                        for u in units:
                                            if u['is_default_for_sale']:
                                                conversion_factor = Decimal(u['conversion_factor'])
                                    plus_to_stock = conversion_factor * Decimal(quantity)
                                    wp = WarehouseProduct.objects.select_for_update().get(warehouse=warehouse_obj, product=product_obj)
                                    wp.quantity += Decimal(plus_to_stock)
                                    wp.save()
                                     
                                    warehouse_account = WarehouseAccount.objects.filter(warehouse=warehouse_obj)
                                    if not warehouse_account.exists():
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "The warehouse is not tied to an account"}, status=400)  
                                    if len(warehouse_account) != 1:
                                        return JsonResponse({"status": "error", "message": "To many linked account on this warehouse"}, status=400)
                                    
                                    warehouse_account_obj = warehouse_account[0].account
                                    
                                    if warehouse_account_obj.parent:
                                        warehouse_parent_account = warehouse_account_obj.parent
                                    else:
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "The warehouse account dont have a parent account"}, status=400) 
   
                                    # partner_obj.balance -= Decimal(sale_price * quantity)
                                    ic(rules, len(rules))
                                    for rule in rules:
                                        if not rule.amount_type in ['revenue']:
                                            transaction.set_rollback(True)
                                            return JsonResponse({"status": "error", "message": "rule must have revenue"}, status=400)
                                        if rule.amount_type == 'revenue': # продажа
                                            revenue_price = Decimal(sale_price * quantity)
                                            create_entries(transaction_obj, rule, product_obj, warehouse_obj, revenue_price, warehouse_parent_account, warehouse_account_obj)
                                            
                                        
                                invoice.entry_created_at = invoice_date2
                                invoice.entry_created_at_handle = invoice_date2
                                invoice.entry_created_by = request.user
                                partner_obj.save()
                             
                            # #######################################################################################################################################
                            # rashod   
                            elif wozwrat_or_prihod == "rashod":
                                for product in products:
                                    
                                    product_obj = product_map[product['id']]
                                    
                                    quantity = Decimal(product['selected_quantity'])
                                    sale_price = Decimal(product['selected_price'])
                                    purchase_price = Decimal(product['purchase_price'])
                                    # retail_price = Decimal(product['retail_price'])
                                    # wholesale_price = Decimal(product['wholesale_price'])
                                    
                                    conversion_factor = 1
                                    units = product['units']
                                    if units:
                                        for u in units:
                                            if u['is_default_for_sale']:
                                                conversion_factor = Decimal(u['conversion_factor'])
                                    minus_to_stock = conversion_factor * Decimal(quantity)
                                    wp = WarehouseProduct.objects.select_for_update().get(warehouse=warehouse_obj, product=product_obj)
                                    if wp.quantity < minus_to_stock:
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "Not enough product in stock"}, status=400)  
                                    wp.quantity -= Decimal(minus_to_stock)
                                    wp.save()
                                     
                                    warehouse_account = WarehouseAccount.objects.filter(warehouse=warehouse_obj)
                                    if not warehouse_account.exists():
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "The warehouse is not tied to an account"}, status=400)  
                                    if len(warehouse_account) != 1:
                                        return JsonResponse({"status": "error", "message": "To many linked account on this warehouse"}, status=400)
                                    
                                    warehouse_account_obj = warehouse_account[0].account
                                    
                                    if warehouse_account_obj.parent:
                                        warehouse_parent_account = warehouse_account_obj.parent
                                    else:
                                        transaction.set_rollback(True)
                                        return JsonResponse({"status": "error", "message": "The warehouse account dont have a parent account"}, status=400) 
   
                                    partner_obj.balance -= Decimal(sale_price * quantity)
                                    ic(rules, len(rules))
                                    for rule in rules:
                                        if not rule.amount_type in ['revenue', 'profit']:
                                            transaction.set_rollback(True)
                                            return JsonResponse({"status": "error", "message": "rule must have revenue or profit"}, status=400)
                                        if rule.amount_type == 'revenue': # продажа
                                            revenue_price = Decimal(sale_price * quantity)
                                            create_entries(transaction_obj, rule, product_obj, warehouse_obj, revenue_price, warehouse_parent_account, warehouse_account_obj)
                                            
                                        elif rule.amount_type == 'profit':
                                            profit_price = Decimal((sale_price - purchase_price) * quantity)
                                            create_entries(transaction_obj, rule, product_obj, warehouse_obj, profit_price, warehouse_parent_account, warehouse_account_obj)
                                        
                                invoice.entry_created_at = invoice_date2
                                invoice.entry_created_at_handle = invoice_date2
                                invoice.entry_created_by = request.user
                                partner_obj.save()
                        invoice.save()
                                
                                
                                
                        # 1/0
                        return JsonResponse({"status": "ok", "message": "invoice saved", "id": invoice.id, "is_updated": True, "already_entry": is_entry})
                    
                        
                except Exception as e:
                    ic("EEEEE", e)
                    # update error
                    return JsonResponse({"status": "error", "message": "transactionChange", "reason_for_the_error": str(e)}, status=400)
                                            

            return JsonResponse({"status": "ok", "message": "Invoice saved"})
        except Exception as e:
            ic("GGGG", e)
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
    invoices = Invoice.objects.all().order_by("-pk")
    ic("tut get_invoices +++++", request)
    
    # DayClosing.objects.all().delete()
    # DayClosingLog.objects.all().delete()
    # PartnerBalanceSnapshot.objects.all().delete()
    # StockSnapshot.objects.all().delete()

    partner_id = request.GET.get('partner_id')
    wozwrat_or_prihod = request.GET.get('wozwrat_or_prihod')
    query = request.GET.get('query')
    selectedEntry = request.GET.get('selectedEntry')
    sortInvoice = request.GET.get('sortInvoice')
    
    
    ic(partner_id)

    if partner_id:
        invoices = invoices.filter(partner__id=partner_id)
    if wozwrat_or_prihod:
        invoices = invoices.filter(wozwrat_or_prihod=wozwrat_or_prihod)
    if query:
        if query.isdigit():  # если ввели цифры
            invoices = invoices.filter(
                Q(comment__icontains=query) | Q(pk=int(query))
            )
        else:
            invoices = invoices.filter(comment__icontains=query)
     
    
    if sortInvoice:
        if sortInvoice == 'asc':
            invoices = invoices.order_by("pk")
        elif sortInvoice == 'desc':
            invoices = invoices.order_by("-pk")
                        
        
    ic(sortInvoice)
    
    if selectedEntry:
        if selectedEntry == "entried":
            invoices = invoices.filter(is_entry=True)
        elif selectedEntry == "notEntried":
            invoices = invoices.filter(is_entry=False)
            

    
    # total_invoices = invoices.count()
        
        
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 10))
    
    
    
    paginator = Paginator(invoices, page_size)
    page_obj = paginator.get_page(page)
    ic(page_obj)

    data = []
    for invoice in page_obj:
        
        # total_selected_price = InvoiceItem.objects.filter(invoice=invoice).aggregate(total=Sum("selected_price"))["total"] or 0
        
        # total_selected_quantity = (InvoiceItem.objects.filter(invoice=invoice).aggregate(total=Sum("selected_quantity")))["total"] or 0
        
        # total_selected_price = 0
        # items = InvoiceItem.objects.filter(invoice=invoice)
        # for item in items:
        #     total_selected_price += item.selected_price * item.selected_quantity
            
        total_selected_price = (InvoiceItem.objects.filter(invoice=invoice).aggregate(total=Sum(F("selected_price") * F("selected_quantity"))))["total"] or 0
        total_purchase_price = (InvoiceItem.objects.filter(invoice=invoice).aggregate(total=Sum(F("purchase_price") * F("selected_quantity"))))["total"] or 0
        
        total_wholesale_price = (InvoiceItem.objects.filter(invoice=invoice).aggregate(total=Sum(F("wholesale_price") * F("selected_quantity"))))["total"] or 0
        
        total_income_price = total_selected_price - total_purchase_price
        total_dicount_price = total_selected_price - total_wholesale_price
        
        
        
        # total_selected_price = selected_price * selected_quantity
        
        # purchase_price = InvoiceItem.objects.filter(invoice=invoice).aggregate(
        #     total=Sum("purchase_price")
        # )["total"] or 0
        
        # total_purchase_price = purchase_price * selected_quantity
        
        # total_income_price = total_selected_price - total_purchase_price
        
        # ic(total_selected_price)
        data.append({
            "id": invoice.id,
            "invoice_date": invoice.invoice_date,
            "partner": invoice.partner.name if invoice.partner else None,
            "type_price": invoice.type_price,
            "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
            "send": invoice.send,
            "is_entry": invoice.is_entry,
            "total_selected_price": str(total_selected_price),
            "total_income_price": str(total_income_price),
            "total_dicount_price": str(total_dicount_price),
            # можно добавить больше полей по необходимости
        })

    return JsonResponse({
        "status": "ok",
        "total": paginator.count,
        "page": page,
        "page_size": page_size,
        "total_pages": paginator.num_pages,
        "invoices": data,
        # "total_invoices": total_invoices,
    })




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
        
    if invoice.entry_created_by:
        entry_created_by_json_name = invoice.entry_created_by.username
    else:
        entry_created_by_json_name = None
        
        
        
        
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
        "already_entry":invoice.is_entry,
        "partner": partner_json,
        "partner_send":invoice.partner_send,
        "send": invoice.send,
        "type_price": invoice.type_price,
        "warehouse": warehouse_json,
        "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
        "created_by": created_by_json_name,
        "entry_created_by": entry_created_by_json_name,
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



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_invoice(request, id):
    try:
        invoice = Invoice.objects.get(id=id)
        ic(invoice)
        if invoice.is_entry:
            return JsonResponse({"status": "error", "message": "cant delete is entried invoice"}, status=404)
        invoice.delete()
        return Response({"status": "ok", "message": f"Invoice deleted", "invoice_id": id}, status=status.HTTP_200_OK)
    except Invoice.DoesNotExist:
        return JsonResponse({"status": "error", "message": "cant find invoice"}, status=404)