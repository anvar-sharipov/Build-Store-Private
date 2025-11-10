from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..models import Transaction
from django.http import JsonResponse
from icecream import ic




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entries_without_faktura(request):
    
    dateFrom = request.GET.get('dateFrom')
    dateTo = request.GET.get('dateTo')
    
    transactions = Transaction.objects.filter(
        date__range=[dateFrom, dateTo], 
        invoice__isnull=True
    ).prefetch_related('entries__account', 'partner').order_by("-pk")
    
    data = []
    
    for transaction in transactions:
        # Ищем первую дебетовую проводку
        debit_entry = None
        # Ищем первую кредитовую проводку
        credit_entry = None
        
        for entry in transaction.entries.all():
            # Пропускаем полностью нулевые проводки
            if entry.debit == 0 and entry.credit == 0:
                continue
                
            if entry.debit != 0 and not debit_entry:
                debit_entry = {
                    "account": entry.account.number,
                    "account_name": entry.account.name,
                    "amount": float(entry.debit)
                }
            elif entry.credit != 0 and not credit_entry:
                credit_entry = {
                    "account": entry.account.number,
                    "account_name": entry.account.name,
                    "amount": float(entry.credit)
                }
            
            # Если нашли обе проводки, можно выйти из цикла
            if debit_entry and credit_entry:
                break
        
        # Если не нашли ни одной проводки, пропускаем транзакцию
        if not debit_entry and not credit_entry:
            continue
            
        partner = {}
        if transaction.partner:
            partner = {
                "id": transaction.partner.id,
                "name": transaction.partner.name
            }
        data.append({
            "id": transaction.id,
            "date": transaction.date.strftime('%Y-%m-%d'),
            "comment": transaction.description,
            "partner": partner,
            "debit": debit_entry,  # Одна дебетовая проводка
            "credit": credit_entry,  # Одна кредитовая проводка
        })
    
    return JsonResponse({
        "data": data,
        "count": len(data),
        "message": f"Найдено {len(data)} операций без фактур"
    })