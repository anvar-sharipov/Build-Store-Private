from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.db import transaction as db_transaction
from icecream import ic
import json
from ..models import Entry

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