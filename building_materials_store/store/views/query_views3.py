from ..models import *
from django.http import JsonResponse
from icecream import ic
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from django.utils.dateparse import parse_date
from django.db.models import Sum, F, Q
import json
from django.http import HttpResponse
from openpyxl import Workbook, load_workbook
from datetime import datetime
from io import BytesIO
from openpyxl.styles import PatternFill
from django.db import transaction
from datetime import datetime, date
from collections import defaultdict

from decimal import Decimal
from django.db import transaction as db_transaction
import pandas as pd



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoice_list(request):
    

    dateFrom = request.GET.get('dateFrom')
    dateTo = request.GET.get('dateTo')
    
    
    invoices = Invoice.objects.filter(invoice_date__range=[dateFrom, dateTo]).order_by("-pk")
    
    data = []
    
    if invoices.exists:
        for invoice in invoices:
            total_selected_price = (InvoiceItem.objects.filter(invoice=invoice).aggregate(total=Sum(F("selected_price") * F("selected_quantity"))))["total"] or 0
            obj = {
                "id": invoice.id,
                "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
                "comment": invoice.comment,
                "partner": invoice.partner.name,
                "is_entry": invoice.is_entry,
                "total_selected_price": total_selected_price
            }
            
            data.append(obj)

    
    return JsonResponse({
        "status": "ok",
        "data": data
    })


    
  
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_invoices_json(request):
    """Экспорт данных в формате JSON для сохранения через save_invoice"""
    try:
        data = json.loads(request.body)
        invoice_ids = data.get("invoiceIds", [])
        
        if not invoice_ids:
            return JsonResponse({"status": "error", "message": "No invoices selected"}, status=400)

        export_data = {
            "status": "success",
            "exported_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_invoices": len(invoice_ids),
            "invoices": []
        }
        
        for invoice_id in invoice_ids:
            try:
                invoice = Invoice.objects.get(id=invoice_id)
                invoice_data = get_invoice_save_format(invoice)
                export_data["invoices"].append(invoice_data)
                
            except Invoice.DoesNotExist:
                export_data["invoices"].append({
                    "id": invoice_id,
                    "status": "error", 
                    "message": "Invoice not found"
                })
            except Exception as e:
                export_data["invoices"].append({
                    "id": invoice_id,
                    "status": "error",
                    "message": str(e)
                })

        # Создаем HTTP response с JSON файлом
        response = HttpResponse(
            json.dumps(export_data, ensure_ascii=False, indent=2),
            content_type='application/json'
        )
        filename = f"invoices_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response

    except Exception as e:
        return JsonResponse({
            "status": "error", 
            "message": f"Export failed: {str(e)}"
        }, status=500)

def get_invoice_save_format(invoice):
    """Получает данные инвойса в точном формате для save_invoice"""
    
    # Получаем товары инвойса
    items = InvoiceItem.objects.filter(invoice=invoice)
    products_data = []
    
    for item in items:
        # Получаем единицы измерения
        units = []
        try:
            if hasattr(item, 'units') and hasattr(item.units, 'all'):
                unit_objects = item.units.all()
                for u in unit_objects:
                    units.append({
                        "id": u.unit_id,
                        "base_unit_name": u.base_unit_name,
                        "conversion_factor": float(u.conversion_factor),
                        "is_default_for_sale": u.is_default_for_sale,
                        "unit_name": u.unit_name
                    })
        except Exception as e:
            print(f"Error getting units for item {item.id}: {str(e)}")
        
        # Получаем бесплатные товары
        free_items = []
        try:
            if hasattr(item, 'free_items') and hasattr(item.free_items, 'all'):
                for f in item.free_items.all():
                    free_items.append({
                        "gift_product": f.gift_product_obj.id if f.gift_product_obj else None,
                        "gift_product_name": f.gift_product_name,
                        "gift_product_unit_name": f.gift_product_unit_name,
                        "quantity_per_unit": float(f.quantity_per_unit)
                    })
        except Exception as e:
            print(f"Error getting free items for item {item.id}: {str(e)}")
        
        # Базовая единица измерения
        base_unit_obj = None
        if item.base_unit_obj:
            base_unit_obj = {
                "id": item.base_unit_obj.id,
                "name": item.base_unit_obj.name
            }
        
        # ВКЛЮЧАЕМ ID продукта - он нужен для связи с существующим продуктом
        product_data = {
            "id": item.product.id,  # ВОЗВРАЩАЕМ ID продукта - это важно!
            "name": item.product.name,
            "base_quantity_in_stock": float(item.base_quantity_in_stock) if item.base_quantity_in_stock else 0,
            "base_unit_obj": base_unit_obj,
            "discount_price": float(item.discount_price) if item.discount_price else 0,
            "firma_price": float(item.firma_price) if item.firma_price else 0,
            "is_custom_price": item.is_custom_price,
            "is_gift": item.is_gift,
            "parent_id": item.parent_id,
            "purchase_price": float(item.purchase_price) if item.purchase_price else 0,
            "quantity_on_selected_warehouses": float(item.quantity_on_selected_warehouses) if item.quantity_on_selected_warehouses else 0,
            "retail_price": float(item.retail_price) if item.retail_price else 0,
            "selected_price": float(item.selected_price) if item.selected_price else 0,
            "selected_quantity": float(item.selected_quantity) if item.selected_quantity else 0,
            "total_quantity": float(item.total_quantity) if item.total_quantity else 0,
            "unit_name_on_selected_warehouses": item.unit_name_on_selected_warehouses,
            "wholesale_price": float(item.wholesale_price) if item.wholesale_price else 0,
            "free_items": free_items,
            "units": units,
        }
        products_data.append(product_data)
    
    # Данные партнера (оставляем ID партнера - он должен существовать)
    partner_data = None
    if invoice.partner:
        partner_data = {
            "id": invoice.partner.id,  # ОСТАВЛЯЕМ ID партнера
            "name": invoice.partner.name,
            "type": invoice.partner.type,
            "is_active": invoice.partner.is_active,
        }
    
    # Данные склада (оставляем ID склада - он должен существовать)
    warehouse_data = None
    if invoice.warehouse:
        warehouse_data = {
            "id": invoice.warehouse.id,  # ОСТАВЛЯЕМ ID склада
            "name": invoice.warehouse.name,
        }
    
    # Данные второго склада (оставляем ID склада - он должен существовать)
    warehouse2_data = None
    if invoice.warehouse2:
        warehouse2_data = {
            "id": invoice.warehouse2.id,  # ОСТАВЛЯЕМ ID склада
            "name": invoice.warehouse2.name,
        }
    
    # Данные авто (оставляем ID авто - он должен существовать)
    awto_data = None
    if invoice.awto:
        awto_data = {
            "id": invoice.awto.id,  # ОСТАВЛЯЕМ ID авто
            "name": invoice.awto.name
        }
    
    # Формируем данные в точном формате для save_invoice
    comment = f"fleshka {invoice.comment or ''}"
    save_format = {
        "id": None,  # ✅ ДОБАВИТЬ это поле
        "id_test_faktura": invoice.id,
        "is_entry": invoice.is_entry,
        "awto": awto_data,
        "awto_send": invoice.awto_send,
        "partner_send": invoice.partner_send,
        "send": invoice.send,
        "invoice_date": invoice.invoice_date.strftime("%Y-%m-%d") if invoice.invoice_date else "",
        "partner": partner_data,
        "products": products_data,
        "type_price": invoice.type_price,
        "warehouse": warehouse_data,
        "warehouse2": warehouse2_data,
        "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
        "comment": comment,
    }
    
    return save_format


# # Функция для массового экспорта с возможностью выбора формата (ne nujno)
# @csrf_exempt
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def export_invoices_universal(request):
#     """Универсальный экспорт - можно выбрать формат через параметр"""
#     try:
#         data = json.loads(request.body)
#         invoice_ids = data.get("invoiceIds", [])
#         export_format = data.get("format", "json")  # json или individual
        
#         if not invoice_ids:
#             return JsonResponse({"status": "error", "message": "No invoices selected"}, status=400)

#         if export_format == "individual":
#             # Экспорт каждой фактуры отдельным JSON объектом
#             invoices_data = {}
            
#             for invoice_id in invoice_ids:
#                 try:
#                     invoice = Invoice.objects.get(id=invoice_id)
#                     save_data = get_invoice_save_format(invoice)
#                     invoices_data[str(invoice_id)] = save_data
                    
#                 except Invoice.DoesNotExist:
#                     invoices_data[str(invoice_id)] = {
#                         "status": "error", 
#                         "message": "Invoice not found"
#                     }
            
#             response_data = {
#                 "status": "success",
#                 "format": "individual",
#                 "exported_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
#                 "invoices": invoices_data
#             }
            
#         else:
#             # Экспорт в формате массива (по умолчанию)
#             invoices_list = []
            
#             for invoice_id in invoice_ids:
#                 try:
#                     invoice = Invoice.objects.get(id=invoice_id)
#                     save_data = get_invoice_save_format(invoice)
#                     invoices_list.append(save_data)
                    
#                 except Invoice.DoesNotExist:
#                     invoices_list.append({
#                         "id": invoice_id,
#                         "status": "error",
#                         "message": "Invoice not found"
#                     })
            
#             response_data = {
#                 "status": "success", 
#                 "format": "array",
#                 "exported_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
#                 "total_invoices": len(invoices_list),
#                 "invoices": invoices_list
#             }

#         # Создаем HTTP response с JSON файлом
#         response = HttpResponse(
#             json.dumps(response_data, ensure_ascii=False, indent=2),
#             content_type='application/json'
#         )
#         filename = f"invoices_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
#         response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
#         return response

#     except Exception as e:
#         return JsonResponse({
#             "status": "error",
#             "message": f"Export failed: {str(e)}"
#         }, status=500)




# rabotaet no po slowam deepseek est luchshiy waiant kotoryy budet nije, a etot poka zakamentrituyu
# Добавлен фильтр invoice__isnull=True - это покажет только транзакции, которые НЕ связаны с фактурами
# Такие транзакции создаются только через create_entry эндпоинт
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_entries_list(request):
#     """Получение списка проводок за период (только созданные через create_entry)"""
#     dateFrom = request.GET.get('dateFrom')
#     dateTo = request.GET.get('dateTo')
    
#     # Получаем транзакции за период, которые НЕ связаны с фактурами
#     transactions = Transaction.objects.filter(
#         date__date__range=[dateFrom, dateTo],
#         invoice__isnull=True  # Только транзакции без привязки к фактурам
#     ).order_by("-pk")
    
#     data = []
    
#     for transaction in transactions:
#         # Получаем все записи транзакции
#         entries = Entry.objects.filter(transaction=transaction)
        
#         # Группируем по дебету и кредиту
#         debit_entries = entries.filter(debit__gt=0)
#         credit_entries = entries.filter(credit__gt=0)
        
#         # Для каждой дебетовой записи находим соответствующую кредитовую
#         for debit_entry in debit_entries:
#             # Ищем кредитовую запись с той же суммой
#             credit_entry = credit_entries.filter(
#                 credit=debit_entry.debit
#             ).first()
            
#             if credit_entry:
#                 amount = debit_entry.debit
#                 obj = {
#                     "transaction_id": transaction.id,
#                     "date": transaction.date.strftime("%Y-%m-%d"),
#                     "description": transaction.description,
#                     "debit_account": debit_entry.account.number,
#                     "debit_account_name": debit_entry.account.name,
#                     "credit_account": credit_entry.account.number,
#                     "credit_account_name": credit_entry.account.name,
#                     "amount": float(amount),
#                     "partner": transaction.partner.name if transaction.partner else None,
#                     "partner_id": transaction.partner.id if transaction.partner else None,
#                     "created_by": transaction.created_by.username if transaction.created_by else None,
#                     "product": debit_entry.product.name if debit_entry.product else None,
#                     "product_id": debit_entry.product.id if debit_entry.product else None,
#                     "warehouse": debit_entry.warehouse.name if debit_entry.warehouse else None,
#                     "warehouse_id": debit_entry.warehouse.id if debit_entry.warehouse else None,
#                     # Добавляем признак, что это ручная проводка
#                     "is_manual_entry": True
#                 }
#                 data.append(obj)
    
#     return JsonResponse({
#         "status": "ok",
#         "data": data
#     })

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_entries_json(request):
    """Экспорт проводок в формате JSON для сохранения через create_entry"""
    try:
        data = json.loads(request.body)
        entry_ids = data.get("entryIds", [])
        
        if not entry_ids:
            return JsonResponse({"status": "error", "message": "No entries selected"}, status=400)

        export_data = {
            "status": "success",
            "exported_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_entries": len(entry_ids),
            "entries": []
        }
        
        for transaction_id in entry_ids:
            try:
                transaction = Transaction.objects.get(id=transaction_id)
                entry_data = get_entry_save_format(transaction)
                export_data["entries"].append(entry_data)
                
            except Transaction.DoesNotExist:
                export_data["entries"].append({
                    "transaction_id": transaction_id,
                    "status": "error", 
                    "message": "Transaction not found"
                })
            except Exception as e:
                export_data["entries"].append({
                    "transaction_id": transaction_id,
                    "status": "error",
                    "message": str(e)
                })

        # Создаем HTTP response с JSON файлом
        response = HttpResponse(
            json.dumps(export_data, ensure_ascii=False, indent=2),
            content_type='application/json'
        )
        filename = f"entries_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response

    except Exception as e:
        return JsonResponse({
            "status": "error", 
            "message": f"Export failed: {str(e)}"
        }, status=500)
        
        
# Альтернативный вариант - если хочешь быть абсолютно уверенным, что показываются только проводки созданные через create_entry:
# Преимущества этого подхода:
# ✅ Не показывает проводки от фактур
# ✅ Показывает только ручные проводки через create_entry
# ✅ Исключает возможные автоматические проводки от других операций
# ✅ Гарантирует, что экспортируются только те проводки, которые можно будет корректно импортировать
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entries_list(request):
    """Получение списка проводок за период (только созданные через create_entry)"""
    dateFrom = request.GET.get('dateFrom')
    dateTo = request.GET.get('dateTo')
    
    # Получаем транзакции за период, которые НЕ связаны с фактурами И имеют определенный паттерн описания
    transactions = Transaction.objects.filter(
        date__date__range=[dateFrom, dateTo],
        invoice__isnull=True,  # Только транзакции без привязки к фактурам
        description__isnull=False  # И с описанием (обычно у ручных проводок есть описание)
    ).exclude(
        description__startswith="Faktura"  # Исключаем проводки от фактур (на всякий случай)
    ).order_by("-pk")
    
    data = []
    
    for transaction in transactions:
        # Получаем все записи транзакции
        entries = Entry.objects.filter(transaction=transaction)
        
        # Проверяем, что это простая проводка (2 записи: дебет и кредит)
        if entries.count() == 2:
            debit_entries = entries.filter(debit__gt=0)
            credit_entries = entries.filter(credit__gt=0)
            
            # Для каждой дебетовой записи находим соответствующую кредитовую
            for debit_entry in debit_entries:
                credit_entry = credit_entries.filter(credit=debit_entry.debit).first()
                
                if credit_entry:
                    amount = debit_entry.debit
                    obj = {
                        "transaction_id": transaction.id,
                        "date": transaction.date.strftime("%Y-%m-%d"),
                        "description": transaction.description,
                        "debit_account": debit_entry.account.number,
                        "debit_account_name": debit_entry.account.name,
                        "credit_account": credit_entry.account.number,
                        "credit_account_name": credit_entry.account.name,
                        "amount": float(amount),
                        "partner": transaction.partner.name if transaction.partner else None,
                        "partner_id": transaction.partner.id if transaction.partner else None,
                        "created_by": transaction.created_by.username if transaction.created_by else None,
                        "product": debit_entry.product.name if debit_entry.product else None,
                        "product_id": debit_entry.product.id if debit_entry.product else None,
                        "warehouse": debit_entry.warehouse.name if debit_entry.warehouse else None,
                        "warehouse_id": debit_entry.warehouse.id if debit_entry.warehouse else None,
                        "is_manual_entry": True
                    }
                    data.append(obj)
    
    return JsonResponse({
        "status": "ok",
        "data": data
    })
    
    
    

def get_entry_save_format(transaction):
    """Получает данные проводки в формате для create_entry"""
    
    # Получаем все записи транзакции
    entries = Entry.objects.filter(transaction=transaction)
    debit_entries = entries.filter(debit__gt=0)
    credit_entries = entries.filter(credit__gt=0)
    
    # Берем первую пару дебет/кредит
    debit_entry = debit_entries.first()
    credit_entry = credit_entries.filter(credit=debit_entry.debit).first() if debit_entry else None
    
    if not debit_entry or not credit_entry:
        return {
            "transaction_id": transaction.id,
            "status": "error",
            "message": "Invalid transaction structure"
        }
    
    # Данные партнера
    partner_data = None
    if transaction.partner:
        partner_data = {
            "id": transaction.partner.id,
            "name": transaction.partner.name,
            "type": transaction.partner.type,
            "is_active": transaction.partner.is_active,
        }
    
    # Данные дебетового счета
    debit_account_data = None
    if debit_entry.account:
        debit_account_data = {
            "number": debit_entry.account.number,
            "name": debit_entry.account.name,
            "account_type": debit_entry.account.type,  # Исправлено с type на account_type
        }
    
    # Данные кредитового счета
    credit_account_data = None
    if credit_entry.account:
        credit_account_data = {
            "number": credit_entry.account.number,
            "name": credit_entry.account.name,
            "account_type": credit_entry.account.type,  # Исправлено с type на account_type
        }
    
    # Данные продукта
    product_data = None
    if debit_entry.product:
        product_data = {
            "id": debit_entry.product.id,
            "name": debit_entry.product.name,
        }
    
    # Данные склада
    warehouse_data = None
    if debit_entry.warehouse:
        warehouse_data = {
            "id": debit_entry.warehouse.id,
            "name": debit_entry.warehouse.name,
        }
    
    # Формируем данные в формате для create_entry
    save_format = {
        "transaction_id": transaction.id,
        "date": transaction.date.strftime("%Y-%m-%d") if transaction.date else "",
        "description": transaction.description,
        "debit_account": debit_account_data,
        "debit_account_number": debit_entry.account.number,
        "credit_account": credit_account_data,
        "credit_account_number": credit_entry.account.number,
        "amount": float(debit_entry.debit),
        "partner": partner_data,
        "partner_id": transaction.partner.id if transaction.partner else None,
        "product": product_data,
        "product_id": debit_entry.product.id if debit_entry.product else None,
        "warehouse": warehouse_data,
        "warehouse_id": debit_entry.warehouse.id if debit_entry.warehouse else None,
        "comment": transaction.description,
        "created_by": transaction.created_by.username if transaction.created_by else None,
        "created_at": transaction.created_at.strftime("%Y-%m-%d %H:%M:%S") if transaction.created_at else "",
    }
    
    return save_format

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_accounts_list(request):
    """Получение списка счетов для валидации при импорте"""
    accounts = Account.objects.filter(is_active=True).values('id', 'number', 'name', 'type')
    return JsonResponse({
        "status": "ok",
        "data": list(accounts)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_partners_list(request):
    """Получение списка партнеров для валидации при импорте"""
    partners = Partner.objects.filter(is_active=True).values('id', 'name', 'type')
    return JsonResponse({
        "status": "ok", 
        "data": list(partners)
    })