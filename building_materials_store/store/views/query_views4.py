from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..models import Transaction, Account, Entry, Partner
from django.http import JsonResponse
from icecream import ic
from django.utils.dateparse import parse_date
from rest_framework.response import Response




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
    
    
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_detail_account_60_62(request):
    account_number = request.GET.get('account')
    date_from = request.GET.get('dateFrom')
    date_to = request.GET.get('dateTo')

    if date_from:
        date_from = parse_date(date_from)
    if date_to:
        date_to = parse_date(date_to)
        
        
        
    partners = Partner.objects.all()
    
    data = {
        "data": [],
    }
    
    debit_before_total = 0
    credit_before_total = 0
    
    debit_oborot_total = 0
    credit_oborot_total = 0
    
    saldo_end_debit_total = 0
    saldo_end_credit_total = 0
    
    for p in partners:
        entries_obj_before = Entry.objects.filter(transaction__date__lt=date_from, transaction__partner=p, account__number=account_number)
        entries_obj_oborot = Entry.objects.filter(transaction__date__range=[date_from, date_to], transaction__partner=p, account__number=account_number)

        
        debit_before = 0
        credit_before = 0
        
        debit_oborot = 0
        credit_oborot = 0
        
        debit_end = 0
        credit_end = 0
        
        if entries_obj_before.exists():
            for e in entries_obj_before:
                debit_before += float(e.debit)
                credit_before += float(e.credit)
                
        if entries_obj_oborot.exists():
            for e in entries_obj_oborot:
                debit_oborot += float(e.debit)
                credit_oborot += float(e.credit)
                
        
        debit_end = debit_before + debit_oborot
        credit_end = credit_before + credit_oborot
        
        if (debit_end - credit_end) > 0:
            saldo_end_debit = debit_end - credit_end
            saldo_end_credit = 0
        else:
            saldo_end_credit = abs(debit_end - credit_end)
            saldo_end_debit = 0
            
            
        debit_before_total += debit_before
        credit_before_total += credit_before
        
        debit_oborot_total += debit_oborot
        credit_oborot_total += credit_oborot
        
        saldo_end_debit_total += saldo_end_debit
        saldo_end_credit_total += saldo_end_credit
        
        
        if p.agent:
            agent = {
                "id": p.agent.id,
                "name": p.agent.name
            }
        else:
            agent = {}
            
        ic(agent)
                
        partner = {
            "partner_name": p.name,
            "debit_before": debit_before,
            "credit_before": credit_before,
            "debit_oborot": debit_oborot,
            "credit_oborot": credit_oborot,
            "saldo_end_debit": saldo_end_debit,
            "saldo_end_credit": saldo_end_credit,
            
            "debit_before_total": debit_before_total,
            "credit_before_total": credit_before_total,
            "debit_oborot_total": debit_oborot_total,
            "credit_oborot_total": credit_oborot_total,
            "saldo_end_debit_total": saldo_end_debit_total,
            "saldo_end_credit_total": saldo_end_credit_total,
            "agent": agent,
            
        }
        
        
        data["data"].append(partner)
        
        
        # ic(p.name)
        # ic(debit_before)
        # ic(credit_before)
        # print()
    
    if (debit_before_total - credit_before_total) > 0:
        saldo_summ_before_debit = abs(debit_before_total - credit_before_total) 
        saldo_summ_before_credit = 0
    else:
        saldo_summ_before_debit = 0
        saldo_summ_before_credit = abs(debit_before_total - credit_before_total)
        
    if (debit_oborot_total - credit_oborot_total) > 0:
        saldo_summ_oborot_debit = abs(debit_oborot_total - credit_oborot_total) 
        saldo_summ_oborot_credit = 0
    else:
        saldo_summ_oborot_debit = 0
        saldo_summ_oborot_credit = abs(debit_oborot_total - credit_oborot_total)
        
    if (saldo_end_debit_total - saldo_end_credit_total) > 0:
        saldo_summ_end_debit = abs(saldo_end_debit_total - saldo_end_credit_total) 
        saldo_summ_end_credit = 0
    else:
        saldo_summ_end_debit = 0
        saldo_summ_end_credit = abs(saldo_end_debit_total - saldo_end_credit_total)
        
        
        
    data["total_prices"] = {
        "debit_before_total": debit_before_total,
        "credit_before_total": credit_before_total,
        "debit_oborot_total": debit_oborot_total,
        "credit_oborot_total": credit_oborot_total,
        "saldo_end_debit_total": saldo_end_debit_total,
        "saldo_end_credit_total": saldo_end_credit_total,
        
        "saldo_summ_before_debit": saldo_summ_before_debit,
        "saldo_summ_before_credit": saldo_summ_before_credit,
        "saldo_summ_oborot_debit": saldo_summ_oborot_debit,
        "saldo_summ_oborot_credit": saldo_summ_oborot_credit,
        "saldo_summ_end_debit": saldo_summ_end_debit,
        "saldo_summ_end_credit": saldo_summ_end_credit,
        
    }
 
    return Response({
        "items": data["data"],
        "totals": data["total_prices"]
    })