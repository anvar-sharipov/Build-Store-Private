from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.db import transaction as db_transaction
from icecream import ic
import json
from ..models import Entry, Invoice, Transaction
from decimal import Decimal

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_partner_to_entry(request):
    data = json.loads(request.body)
            
    password = data.get("password")
    if password != "543569145637383":
        return JsonResponse({"status": "error", "message": "error password"}, status=400)
    
    try:
        with db_transaction.atomic():    
            for entry in Entry.objects.filter(partner__isnull=True):
                if (entry.transaction and entry.transaction.partner and entry.account.number in ["60", "62", "75", "76"]):
                    
                    entry.partner = entry.transaction.partner
                    entry.save()
                    print(f"Заполнена проводка {entry.id} - счет {entry.account.number}")
    except Exception as e:
        ic(e)
        return JsonResponse({"status": "error", "message": "transactionChange", "reason_for_the_error": str(e)}, status=400)

    return JsonResponse({
            "message": "success set partner from Transaction to Entry",
        })
    
    
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_universal(request):   
    # smena chrtowo 1 kopeyki izza neprawilnogo okrugleniya staroy programmy, nado podstroitsya pod nego (((
    data = json.loads(request.body)
    ic(data)
    password = data.get("password")
    type_action = data.get("type")
    
    if password != "543569145637383":
        return JsonResponse({"status": "error", "message": "error password"}, status=400)
    
    if type_action == "change_one_coin_1":
        test_transaction = Transaction.objects.get(invoice__id=3478)
        test_entries = Entry.objects.filter(transaction__id=test_transaction.id) # 6253
        for t in test_entries:
            if t.transaction.id == 6253 and t.product and t.product.id == 465 and t.debit > 0:
                t.debit = Decimal('7.79')
                t.save()   
        return JsonResponse({"message": "success update 1 coin"})
    
    if type_action == "change_one_coin_1_for_account_75":
        test_transaction = Transaction.objects.get(invoice__id=3478)
        test_entries = Entry.objects.filter(transaction__id=test_transaction.id) # 6253
        for t in test_entries:
            if t.transaction.id == 6253 and t.product and t.product.id == 465 and t.credit > 0:
                # ic(t.credit)
                t.credit = Decimal('7.79')
                t.save()
        return JsonResponse({"message": "success change_one_coin_1_for_account_75"})


    return JsonResponse({"message": "nothing to do"})