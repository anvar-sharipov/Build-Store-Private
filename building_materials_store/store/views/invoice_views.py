from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from icecream import ic
from .. models import *

@csrf_exempt
def save_invoice(request):
    if request.method == "POST":
        ic('save_invoice')
        try:
            data = json.loads(request.body)
            # ic(data)
            
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
            invoice_id = data['id']
            
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
                warehouse_obj = Employee.objects.get(id=warehouse["id"])
            except:
                return JsonResponse({"status": "error", "message": "cant find warehouse in database"}, status=400)
            
            
            if is_entry:
                
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
                
                
                if wozwrat_or_prihod == "wozwrat":
                    return JsonResponse({"status": "ok", "message": f"wozwrat invoice saved with entry"})
                elif wozwrat_or_prihod == "prihod":
                    return JsonResponse({"status": "ok", "message": f"prihod invoice saved with entry"})
                elif wozwrat_or_prihod == "rashod":
                    return JsonResponse({"status": "ok", "message": f"rashod invoice saved with entry"})
                
            else:
                if awto:
                    try:
                        awto_obj = Employee.objects.get(id=awto["id"])
                    except:
                        return JsonResponse({"status": "error", "message": "cant find awto in database"}, status=400)
                    
                if partner:
                    try:
                        partner_obj = Partner.objects.get(id=partner["id"])
                    except:
                        return JsonResponse({"status": "error", "message": "cant find parnter in database"}, status=400)
                    
                    if not partner_obj.is_active:
                        return JsonResponse({"status": "error", "message": "partner is not active"}, status=400)
                        
                    
                    
                    
                if wozwrat_or_prihod == "wozwrat":
                    return JsonResponse({"status": "ok", "message": f"wozwrat invoice saved without entry"})
                elif wozwrat_or_prihod == "prihod":
                    return JsonResponse({"status": "ok", "message": f"prihod invoice saved without entry"})
                elif wozwrat_or_prihod == "rashod":
                    return JsonResponse({"status": "ok", "message": f"rashod invoice saved without entry"})
                
                
                
                
                    
                
                
                
            
            
                    
                
                
                
            
            
            
            
            
            
            
            
            

            
            
            # ic(awto)
            # ic(awto_send)
            # ic(invoice_date)
            # ic(is_entry)
            # ic(invoice_id)
            # ic(partner)
            # ic(partner_send)
            # ic(products)
            # ic(send)
            # ic(type_price)
            ic(warehouse)
            # ic(wozwrat_or_prihod)
            
            # здесь ты сам напишешь сохранение
            # например:
            # invoice = Invoice.objects.create(
            #     date=data.get("invoice_date"),
            #     partner_id=data["partner"]["id"],
            #     warehouse_id=data["warehouse"]["id"],
            #     ...
            # )
            # for product in data["products"]:
            #     InvoiceProduct.objects.create(
            #         invoice=invoice,
            #         product_id=product["id"],
            #         quantity=product["quantity"],
            #         ...
            #     )

            return JsonResponse({"status": "ok", "message": "Invoice saved"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)
