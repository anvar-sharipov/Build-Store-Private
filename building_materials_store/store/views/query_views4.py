from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..models import Transaction, Account, Entry, Partner, Agent, Invoice, InvoiceItem, Employee, Trip, TripInvoiceHistory
from django.http import JsonResponse
from icecream import ic
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from datetime import datetime, date, time   
from decimal import Decimal
from collections import defaultdict
from django.db.models import Sum, F, Q
from django.views.decorators.csrf import csrf_exempt
import json
from django.db import transaction as db_transaction






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entries_without_faktura(request):
    
    dateFrom = request.GET.get('dateFrom')
    dateTo = request.GET.get('dateTo')
    
    transactions = Transaction.objects.filter(
        date__range=[dateFrom, dateTo], 
        invoice__isnull=True
    ).prefetch_related(
        'entries__account', 
        'entries__partner'
    ).order_by("-pk")
    
    data = []
    
    for transaction in transactions:
        debit_entry_obj = None
        credit_entry_obj = None
        
        # Ищем дебетовую и кредитовую проводки
        for entry in transaction.entries.all():
            if entry.debit != 0:
                debit_entry_obj = entry
            elif entry.credit != 0:
                credit_entry_obj = entry
        
        # Если не нашли обе проводки, пропускаем
        if not debit_entry_obj or not credit_entry_obj:
            continue
            
        # Формируем данные с партнерами
        debit_data = {
            "account": debit_entry_obj.account.number,
            "account_name": debit_entry_obj.account.name,
            "amount": float(debit_entry_obj.debit),
            "partner": {
                "id": debit_entry_obj.partner.id,
                "name": debit_entry_obj.partner.name,
                "type": debit_entry_obj.partner.type
            } if debit_entry_obj.partner else None
        }
        
        credit_data = {
            "account": credit_entry_obj.account.number,
            "account_name": credit_entry_obj.account.name,
            "amount": float(credit_entry_obj.credit),
            "partner": {
                "id": credit_entry_obj.partner.id,
                "name": credit_entry_obj.partner.name,
                "type": credit_entry_obj.partner.type
            } if credit_entry_obj.partner else None
        }
            
        data.append({
            "id": transaction.id,
            "date": transaction.date.strftime('%Y-%m-%d'),
            "comment": transaction.description,
            "debit": debit_data,
            "credit": credit_data,
            "debitPartner": debit_data["partner"],  # Отдельное поле для удобства
            "creditPartner": credit_data["partner"], # Отдельное поле для удобства
        })
    
    return JsonResponse({
        "data": data,
        "count": len(data),
        "message": f"Найдено {len(data)} операций без фактур"
    })
    
    

# # kod rabotaet no mnogo zaprosow k bd 
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_detail_account_60_62(request):
#     account_number = request.GET.get('account')
#     date_from = request.GET.get('dateFrom')
#     date_to = request.GET.get('dateTo')
#     agent_id = request.GET.get('agent')
#     sortByAgent = request.GET.get('sortByAgent')

#     account = Account.objects.get(number=account_number)

#     if date_from:
#         date_from = parse_date(date_from)
#     if date_to:
#         date_to = parse_date(date_to)
        

#     if sortByAgent == "true" or sortByAgent == True:
#         data = {
#             "data": {},
#             "total_prices": {}
#         }
        
#         # Обработка агентов
#         agents = Agent.objects.all().order_by('-pk')
#         for agent in agents:
#             # СБРАСЫВАЕМ итоги для каждого агента
#             agent_debit_before_total = 0
#             agent_credit_before_total = 0
#             agent_debit_oborot_total = 0
#             agent_credit_oborot_total = 0
#             agent_saldo_end_debit_total = 0
#             agent_saldo_end_credit_total = 0
            
#             data["data"][agent.name] = []
#             partners = Partner.objects.filter(agent=agent).order_by('name')
            
#             for p in partners:
#                 entries_obj_before = Entry.objects.filter(transaction__date__lt=date_from, transaction__partner=p, account__number=account_number)
#                 entries_obj_oborot = Entry.objects.filter(transaction__date__range=[date_from, date_to], transaction__partner=p, account__number=account_number)
                
#                 debit_before = 0
#                 credit_before = 0
#                 debit_oborot = 0
#                 credit_oborot = 0
                
#                 if entries_obj_before.exists():
#                     for e in entries_obj_before:
#                         debit_before += float(e.debit)
#                         credit_before += float(e.credit)
                    
#                 if entries_obj_oborot.exists():
#                     for e in entries_obj_oborot:
#                         debit_oborot += float(e.debit)
#                         credit_oborot += float(e.credit)
                
#                 debit_end = debit_before + debit_oborot
#                 credit_end = credit_before + credit_oborot
                
#                 if (debit_end - credit_end) > 0:
#                     saldo_end_debit = debit_end - credit_end
#                     saldo_end_credit = 0
#                 else:
#                     saldo_end_credit = abs(debit_end - credit_end)
#                     saldo_end_debit = 0
                
#                 # Накопление ИТОГОВ ТОЛЬКО ДЛЯ ЭТОГО АГЕНТА
#                 agent_debit_before_total += debit_before
#                 agent_credit_before_total += credit_before
#                 agent_debit_oborot_total += debit_oborot
#                 agent_credit_oborot_total += credit_oborot
#                 agent_saldo_end_debit_total += saldo_end_debit
#                 agent_saldo_end_credit_total += saldo_end_credit
                
#                 partner = {
#                     "partner_id": p.id,
#                     "account_id": account.id,
#                     "partner_name": p.name,
#                     "debit_before": debit_before,
#                     "credit_before": credit_before,
#                     "debit_oborot": debit_oborot,
#                     "credit_oborot": credit_oborot,
#                     "saldo_end_debit": saldo_end_debit,
#                     "saldo_end_credit": saldo_end_credit,
#                     "agent": {"id": agent.id, "name": agent.name},
#                 }
                
#                 data["data"][agent.name].append(partner)
            
#             # Расчет сальдо для агента
#             if (agent_debit_before_total - agent_credit_before_total) > 0:
#                 saldo_summ_before_debit = abs(agent_debit_before_total - agent_credit_before_total) 
#                 saldo_summ_before_credit = 0
#             else:
#                 saldo_summ_before_debit = 0
#                 saldo_summ_before_credit = abs(agent_debit_before_total - agent_credit_before_total)
                
#             if (agent_debit_oborot_total - agent_credit_oborot_total) > 0:
#                 saldo_summ_oborot_debit = abs(agent_debit_oborot_total - agent_credit_oborot_total) 
#                 saldo_summ_oborot_credit = 0
#             else:
#                 saldo_summ_oborot_debit = 0
#                 saldo_summ_oborot_credit = abs(agent_debit_oborot_total - agent_credit_oborot_total)
                
#             if (agent_saldo_end_debit_total - agent_saldo_end_credit_total) > 0:
#                 saldo_summ_end_debit = abs(agent_saldo_end_debit_total - agent_saldo_end_credit_total) 
#                 saldo_summ_end_credit = 0
#             else:
#                 saldo_summ_end_debit = 0
#                 saldo_summ_end_credit = abs(agent_saldo_end_debit_total - agent_saldo_end_credit_total)
            
#             # Сохраняем итоги для агента
#             data["total_prices"][agent.name] = [{
#                 "debit_before_total": agent_debit_before_total,
#                 "credit_before_total": agent_credit_before_total,
#                 "debit_oborot_total": agent_debit_oborot_total,
#                 "credit_oborot_total": agent_credit_oborot_total,
#                 "saldo_end_debit_total": agent_saldo_end_debit_total,
#                 "saldo_end_credit_total": agent_saldo_end_credit_total,
#                 "saldo_summ_before_debit": saldo_summ_before_debit,
#                 "saldo_summ_before_credit": saldo_summ_before_credit,
#                 "saldo_summ_oborot_debit": saldo_summ_oborot_debit,
#                 "saldo_summ_oborot_credit": saldo_summ_oborot_credit,
#                 "saldo_summ_end_debit": saldo_summ_end_debit,
#                 "saldo_summ_end_credit": saldo_summ_end_credit,
#             }]

#         # Обработка партнеров без агента
#         no_agent_debit_before_total = 0
#         no_agent_credit_before_total = 0
#         no_agent_debit_oborot_total = 0
#         no_agent_credit_oborot_total = 0
#         no_agent_saldo_end_debit_total = 0
#         no_agent_saldo_end_credit_total = 0
        
#         data["data"]["no_agent"] = []
#         no_agent_partners = Partner.objects.filter(agent__isnull=True).order_by('name')
        
#         for p in no_agent_partners:
#             entries_obj_before = Entry.objects.filter(transaction__date__lt=date_from, transaction__partner=p, account__number=account_number)
#             entries_obj_oborot = Entry.objects.filter(transaction__date__range=[date_from, date_to], transaction__partner=p, account__number=account_number)
            
#             debit_before = 0
#             credit_before = 0
#             debit_oborot = 0
#             credit_oborot = 0
            
#             if entries_obj_before.exists():
#                 for e in entries_obj_before:
#                     debit_before += float(e.debit)
#                     credit_before += float(e.credit)
                
#             if entries_obj_oborot.exists():
#                 for e in entries_obj_oborot:
#                     debit_oborot += float(e.debit)
#                     credit_oborot += float(e.credit)
            
#             debit_end = debit_before + debit_oborot
#             credit_end = credit_before + credit_oborot
            
#             if (debit_end - credit_end) > 0:
#                 saldo_end_debit = debit_end - credit_end
#                 saldo_end_credit = 0
#             else:
#                 saldo_end_credit = abs(debit_end - credit_end)
#                 saldo_end_debit = 0
            
#             # Накопление итогов для no_agent
#             no_agent_debit_before_total += debit_before
#             no_agent_credit_before_total += credit_before
#             no_agent_debit_oborot_total += debit_oborot
#             no_agent_credit_oborot_total += credit_oborot
#             no_agent_saldo_end_debit_total += saldo_end_debit
#             no_agent_saldo_end_credit_total += saldo_end_credit
            
#             partner = {
#                 "partner_id": p.id,
#                 "account_id": account.id,
#                 "partner_name": p.name,
#                 "debit_before": debit_before,
#                 "credit_before": credit_before,
#                 "debit_oborot": debit_oborot,
#                 "credit_oborot": credit_oborot,
#                 "saldo_end_debit": saldo_end_debit,
#                 "saldo_end_credit": saldo_end_credit,
#                 "agent": {},
#             }
            
#             data["data"]["no_agent"].append(partner)

#         # Расчет сальдо для no_agent
#         if (no_agent_debit_before_total - no_agent_credit_before_total) > 0:
#             saldo_summ_before_debit = abs(no_agent_debit_before_total - no_agent_credit_before_total) 
#             saldo_summ_before_credit = 0
#         else:
#             saldo_summ_before_debit = 0
#             saldo_summ_before_credit = abs(no_agent_debit_before_total - no_agent_credit_before_total)
            
#         if (no_agent_debit_oborot_total - no_agent_credit_oborot_total) > 0:
#             saldo_summ_oborot_debit = abs(no_agent_debit_oborot_total - no_agent_credit_oborot_total) 
#             saldo_summ_oborot_credit = 0
#         else:
#             saldo_summ_oborot_debit = 0
#             saldo_summ_oborot_credit = abs(no_agent_debit_oborot_total - no_agent_credit_oborot_total)
            
#         if (no_agent_saldo_end_debit_total - no_agent_saldo_end_credit_total) > 0:
#             saldo_summ_end_debit = abs(no_agent_saldo_end_debit_total - no_agent_saldo_end_credit_total) 
#             saldo_summ_end_credit = 0
#         else:
#             saldo_summ_end_debit = 0
#             saldo_summ_end_credit = abs(no_agent_saldo_end_debit_total - no_agent_saldo_end_credit_total)
        
#         data["total_prices"]["no_agent"] = [{
#             "debit_before_total": no_agent_debit_before_total,
#             "credit_before_total": no_agent_credit_before_total,
#             "debit_oborot_total": no_agent_debit_oborot_total,
#             "credit_oborot_total": no_agent_credit_oborot_total,
#             "saldo_end_debit_total": no_agent_saldo_end_debit_total,
#             "saldo_end_credit_total": no_agent_saldo_end_credit_total,
            
#             "saldo_summ_before_debit": saldo_summ_before_debit,
#             "saldo_summ_before_credit": saldo_summ_before_credit,
#             "saldo_summ_oborot_debit": saldo_summ_oborot_debit,
#             "saldo_summ_oborot_credit": saldo_summ_oborot_credit,
#             "saldo_summ_end_debit": saldo_summ_end_debit,
#             "saldo_summ_end_credit": saldo_summ_end_credit,
#         }]

#         return Response({
#             "items": data["data"],
#             "totals": data["total_prices"]
#         })
     
                
#     else:
#         data = {
#             "data": [],  
#         }
        
#         # ИНИЦИАЛИЗИРУЕМ переменные итогов для обычного режима
#         debit_before_total = 0
#         credit_before_total = 0
#         debit_oborot_total = 0
#         credit_oborot_total = 0
#         saldo_end_debit_total = 0
#         saldo_end_credit_total = 0
        
#         partners = Partner.objects.all().order_by('name')

#         for p in partners:
#             if agent_id:
#                 if not p.agent or str(p.agent.id) != str(agent_id):
#                     continue
#             entries_obj_before = Entry.objects.filter(transaction__date__lt=date_from, transaction__partner=p, account__number=account_number)
#             entries_obj_oborot = Entry.objects.filter(transaction__date__range=[date_from, date_to], transaction__partner=p, account__number=account_number)

            
#             debit_before = 0
#             credit_before = 0
            
#             debit_oborot = 0
#             credit_oborot = 0
            
#             debit_end = 0
#             credit_end = 0
            
#             if entries_obj_before.exists():
#                 for e in entries_obj_before:
#                     debit_before += float(e.debit)
#                     credit_before += float(e.credit)
                    
#             if entries_obj_oborot.exists():
#                 for e in entries_obj_oborot:
#                     debit_oborot += float(e.debit)
#                     credit_oborot += float(e.credit)
                    
            
#             debit_end = debit_before + debit_oborot
#             credit_end = credit_before + credit_oborot
            
#             if (debit_end - credit_end) > 0:
#                 saldo_end_debit = debit_end - credit_end
#                 saldo_end_credit = 0
#             else:
#                 saldo_end_credit = abs(debit_end - credit_end)
#                 saldo_end_debit = 0
                
                
#             debit_before_total += debit_before
#             credit_before_total += credit_before
            
#             debit_oborot_total += debit_oborot
#             credit_oborot_total += credit_oborot
            
#             saldo_end_debit_total += saldo_end_debit
#             saldo_end_credit_total += saldo_end_credit
            
            
#             if p.agent:
#                 agent = {
#                     "id": p.agent.id,
#                     "name": p.agent.name
#                 }
#             else:
#                 agent = {}

        
#             partner = {
#                 "partner_id": p.id,
#                 "account_id": account.id,
#                 "partner_name": p.name,
#                 "debit_before": debit_before,
#                 "credit_before": credit_before,
#                 "debit_oborot": debit_oborot,
#                 "credit_oborot": credit_oborot,
#                 "saldo_end_debit": saldo_end_debit,
#                 "saldo_end_credit": saldo_end_credit,
                
#                 "debit_before_total": debit_before_total,
#                 "credit_before_total": credit_before_total,
#                 "debit_oborot_total": debit_oborot_total,
#                 "credit_oborot_total": credit_oborot_total,
#                 "saldo_end_debit_total": saldo_end_debit_total,
#                 "saldo_end_credit_total": saldo_end_credit_total,
#                 "agent": agent,
                
#             }
            
            
#             data["data"].append(partner)
            
            

        
#         if (debit_before_total - credit_before_total) > 0:
#             saldo_summ_before_debit = abs(debit_before_total - credit_before_total) 
#             saldo_summ_before_credit = 0
#         else:
#             saldo_summ_before_debit = 0
#             saldo_summ_before_credit = abs(debit_before_total - credit_before_total)
            
#         if (debit_oborot_total - credit_oborot_total) > 0:
#             saldo_summ_oborot_debit = abs(debit_oborot_total - credit_oborot_total) 
#             saldo_summ_oborot_credit = 0
#         else:
#             saldo_summ_oborot_debit = 0
#             saldo_summ_oborot_credit = abs(debit_oborot_total - credit_oborot_total)
            
#         if (saldo_end_debit_total - saldo_end_credit_total) > 0:
#             saldo_summ_end_debit = abs(saldo_end_debit_total - saldo_end_credit_total) 
#             saldo_summ_end_credit = 0
#         else:
#             saldo_summ_end_debit = 0
#             saldo_summ_end_credit = abs(saldo_end_debit_total - saldo_end_credit_total)
            
            
            
#         data["total_prices"] = {
#             "debit_before_total": debit_before_total,
#             "credit_before_total": credit_before_total,
#             "debit_oborot_total": debit_oborot_total,
#             "credit_oborot_total": credit_oborot_total,
#             "saldo_end_debit_total": saldo_end_debit_total,
#             "saldo_end_credit_total": saldo_end_credit_total,
            
#             "saldo_summ_before_debit": saldo_summ_before_debit,
#             "saldo_summ_before_credit": saldo_summ_before_credit,
#             "saldo_summ_oborot_debit": saldo_summ_oborot_debit,
#             "saldo_summ_oborot_credit": saldo_summ_oborot_credit,
#             "saldo_summ_end_debit": saldo_summ_end_debit,
#             "saldo_summ_end_credit": saldo_summ_end_credit,
            
#         }

#         return Response({
#             "items": data["data"],
#             "totals": data["total_prices"]
#         })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_detail_account_60_62(request):
    account_number = request.GET.get('account')
    date_from = request.GET.get('dateFrom')
    date_to = request.GET.get('dateTo')
    agent_id = request.GET.get('agent')
    sortByAgent = request.GET.get('sortByAgent')
    
    show0 = request.GET.get('show0')
    hyphenOr0 = request.GET.get('hyphenOr0')
    
    ic(show0)
    ic(hyphenOr0)

    account = Account.objects.get(number=account_number)

    # ИСПРАВЛЕНИЕ: Правильное преобразование дат
    from datetime import datetime, date, time
    
    if date_from:
        date_from_parsed = parse_date(date_from)
        # Преобразуем в date для единообразного сравнения
        if isinstance(date_from_parsed, datetime):
            date_from = date_from_parsed.date()
        else:
            date_from = date_from_parsed
    
    if date_to:
        date_to_parsed = parse_date(date_to)
        # Преобразуем в date для единообразного сравнения
        if isinstance(date_to_parsed, datetime):
            date_to = date_to_parsed.date()
        else:
            date_to = date_to_parsed

    # Оптимизация: предзагрузка всех необходимых данных за 2 запроса
    from django.db.models import Prefetch, Q
    
    # 1-й запрос: все партнеры с их транзакциями и записями для данного счета
    partners_prefetch = Partner.objects.prefetch_related(
        Prefetch(
            'entry_set',  # ⭐ ИЗМЕНИЛИ: используем связь Partner → Entry
            queryset=Entry.objects.filter(account__number=account_number),
            to_attr='filtered_entries'
        )
    ).select_related('agent')

    # ИСПРАВЛЕНИЕ: Упрощенные функции сравнения дат
    def get_transaction_date(transaction_date):
        """Возвращает дату транзакции в едином формате (date)"""
        if isinstance(transaction_date, datetime):
            return transaction_date.date()
        return transaction_date

    def compare_dates(transaction_date, target_date):
        """Сравнивает дату транзакции с целевой датой"""
        trans_date = get_transaction_date(transaction_date)
        return trans_date < target_date

    def is_date_in_range(transaction_date, start_date, end_date):
        """Проверяет, находится ли дата транзакции в диапазоне"""
        trans_date = get_transaction_date(transaction_date)
        return start_date <= trans_date <= end_date

    if sortByAgent == "true" or sortByAgent == True:
        data = {"data": {}, "total_prices": {}}
        
        # 2-й запрос: получаем всех партнеров с предзагруженными данными
        all_partners = list(partners_prefetch.all())
        
        # Группировка партнеров по агентам
        agents_data = {}
        no_agent_data = {
            'partners': [],
            'totals': {
                'debit_before': 0, 'credit_before': 0,
                'debit_oborot': 0, 'credit_oborot': 0,
                'saldo_end_debit': 0, 'saldo_end_credit': 0
            }
        }
        
        for partner in all_partners:
            if partner.agent:
                agent_name = partner.agent.name
                if agent_name not in agents_data:
                    agents_data[agent_name] = {
                        'partners': [],
                        'totals': {
                            'debit_before': 0, 'credit_before': 0,
                            'debit_oborot': 0, 'credit_oborot': 0,
                            'saldo_end_debit': 0, 'saldo_end_credit': 0
                        }
                    }
                agents_data[agent_name]['partners'].append(partner)
            else:
                no_agent_data['partners'].append(partner)
        
        # Функция для обработки партнера и расчета показателей
        def process_partner(partner, totals_dict):
            debit_before = 0
            credit_before = 0
            debit_oborot = 0
            credit_oborot = 0
            
            # ⭐ ИЗМЕНЕНИЕ: Используем prefetched entries
            for entry in partner.filtered_entries:
                # ИСПРАВЛЕНИЕ: Получаем нормализованную дату транзакции
                trans_date = get_transaction_date(entry.transaction.date)
                
                # ИСПРАВЛЕНИЕ: Сравниваем нормализованные даты
                if trans_date < date_from:
                    debit_before += float(entry.debit)
                    credit_before += float(entry.credit)
                elif date_from <= trans_date <= date_to:
                    debit_oborot += float(entry.debit)
                    credit_oborot += float(entry.credit)
            
            # Остальной код без изменений...
            debit_end = debit_before + debit_oborot
            credit_end = credit_before + credit_oborot
            
            if (debit_end - credit_end) > 0:
                saldo_end_debit = debit_end - credit_end
                saldo_end_credit = 0
            else:
                saldo_end_credit = abs(debit_end - credit_end)
                saldo_end_debit = 0
            
            # Обновляем итоги
            totals_dict['debit_before'] += debit_before
            totals_dict['credit_before'] += credit_before
            totals_dict['debit_oborot'] += debit_oborot
            totals_dict['credit_oborot'] += credit_oborot
            totals_dict['saldo_end_debit'] += saldo_end_debit
            totals_dict['saldo_end_credit'] += saldo_end_credit
            
            partner_data = {
                "partner_id": partner.id,
                "account_id": account.id,
                "partner_name": partner.name,
                "debit_before": debit_before,
                "credit_before": credit_before,
                "debit_oborot": debit_oborot,
                "credit_oborot": credit_oborot,
                "saldo_end_debit": saldo_end_debit,
                "saldo_end_credit": saldo_end_credit,
                "agent": {"id": partner.agent.id, "name": partner.agent.name} if partner.agent else {},
            }
            
            return partner_data

        # Обработка агентов
        for agent_name, agent_info in agents_data.items():
            data["data"][agent_name] = []
            
            for partner in agent_info['partners']:
                partner_data = process_partner(partner, agent_info['totals'])
                data["data"][agent_name].append(partner_data)
            
            # Расчет сальдо для агента
            totals = agent_info['totals']
            if (totals['debit_before'] - totals['credit_before']) > 0:
                saldo_summ_before_debit = abs(totals['debit_before'] - totals['credit_before'])
                saldo_summ_before_credit = 0
            else:
                saldo_summ_before_debit = 0
                saldo_summ_before_credit = abs(totals['debit_before'] - totals['credit_before'])
                
            if (totals['debit_oborot'] - totals['credit_oborot']) > 0:
                saldo_summ_oborot_debit = abs(totals['debit_oborot'] - totals['credit_oborot'])
                saldo_summ_oborot_credit = 0
            else:
                saldo_summ_oborot_debit = 0
                saldo_summ_oborot_credit = abs(totals['debit_oborot'] - totals['credit_oborot'])
                
            if (totals['saldo_end_debit'] - totals['saldo_end_credit']) > 0:
                saldo_summ_end_debit = abs(totals['saldo_end_debit'] - totals['saldo_end_credit'])
                saldo_summ_end_credit = 0
            else:
                saldo_summ_end_debit = 0
                saldo_summ_end_credit = abs(totals['saldo_end_debit'] - totals['saldo_end_credit'])
            
            data["total_prices"][agent_name] = [{
                "debit_before_total": totals['debit_before'],
                "credit_before_total": totals['credit_before'],
                "debit_oborot_total": totals['debit_oborot'],
                "credit_oborot_total": totals['credit_oborot'],
                "saldo_end_debit_total": totals['saldo_end_debit'],
                "saldo_end_credit_total": totals['saldo_end_credit'],
                "saldo_summ_before_debit": saldo_summ_before_debit,
                "saldo_summ_before_credit": saldo_summ_before_credit,
                "saldo_summ_oborot_debit": saldo_summ_oborot_debit,
                "saldo_summ_oborot_credit": saldo_summ_oborot_credit,
                "saldo_summ_end_debit": saldo_summ_end_debit,
                "saldo_summ_end_credit": saldo_summ_end_credit,
            }]

        # Обработка партнеров без агента
        data["data"]["no_agent"] = []
        for partner in no_agent_data['partners']:
            partner_data = process_partner(partner, no_agent_data['totals'])
            data["data"]["no_agent"].append(partner_data)
        
        # Расчет сальдо для no_agent
        totals = no_agent_data['totals']
        if (totals['debit_before'] - totals['credit_before']) > 0:
            saldo_summ_before_debit = abs(totals['debit_before'] - totals['credit_before'])
            saldo_summ_before_credit = 0
        else:
            saldo_summ_before_debit = 0
            saldo_summ_before_credit = abs(totals['debit_before'] - totals['credit_before'])
            
        if (totals['debit_oborot'] - totals['credit_oborot']) > 0:
            saldo_summ_oborot_debit = abs(totals['debit_oborot'] - totals['credit_oborot'])
            saldo_summ_oborot_credit = 0
        else:
            saldo_summ_oborot_debit = 0
            saldo_summ_oborot_credit = abs(totals['debit_oborot'] - totals['credit_oborot'])
            
        if (totals['saldo_end_debit'] - totals['saldo_end_credit']) > 0:
            saldo_summ_end_debit = abs(totals['saldo_end_debit'] - totals['saldo_end_credit'])
            saldo_summ_end_credit = 0
        else:
            saldo_summ_end_debit = 0
            saldo_summ_end_credit = abs(totals['saldo_end_debit'] - totals['saldo_end_credit'])
        
        data["total_prices"]["no_agent"] = [{
            "debit_before_total": totals['debit_before'],
            "credit_before_total": totals['credit_before'],
            "debit_oborot_total": totals['debit_oborot'],
            "credit_oborot_total": totals['credit_oborot'],
            "saldo_end_debit_total": totals['saldo_end_debit'],
            "saldo_end_credit_total": totals['saldo_end_credit'],
            "saldo_summ_before_debit": saldo_summ_before_debit,
            "saldo_summ_before_credit": saldo_summ_before_credit,
            "saldo_summ_oborot_debit": saldo_summ_oborot_debit,
            "saldo_summ_oborot_credit": saldo_summ_oborot_credit,
            "saldo_summ_end_debit": saldo_summ_end_debit,
            "saldo_summ_end_credit": saldo_summ_end_credit,
        }]
        
        if show0 == "false":
            # Удаляем партнеров с нулевыми значениями
            for agent_name in list(data["data"].keys()):
                # Фильтруем партнеров, у которых не все значения равны 0
                filtered_partners = []
                for partner in data["data"][agent_name]:
                    # Проверяем, что хотя бы одно значение не равно 0
                    if (partner["debit_before"] != 0 or 
                        partner["credit_before"] != 0 or
                        partner["debit_oborot"] != 0 or 
                        partner["credit_oborot"] != 0 or
                        partner["saldo_end_debit"] != 0 or 
                        partner["saldo_end_credit"] != 0):
                        filtered_partners.append(partner)
                
                # Если после фильтрации остались партнеры - обновляем список
                if filtered_partners:
                    data["data"][agent_name] = filtered_partners
                else:
                    # Если все партнеры удалены, удаляем агента полностью
                    del data["data"][agent_name]
                    if agent_name in data["total_prices"]:
                        del data["total_prices"][agent_name]
            
            # После удаления партнеров пересчитываем итоги для оставшихся агентов
            for agent_name, partners in data["data"].items():
                if agent_name in data["total_prices"]:
                    # Сбрасываем итоги
                    totals = {
                        'debit_before': 0, 'credit_before': 0,
                        'debit_oborot': 0, 'credit_oborot': 0,
                        'saldo_end_debit': 0, 'saldo_end_credit': 0
                    }
                    
                    # Пересчитываем итоги из оставшихся партнеров
                    for partner in partners:
                        totals['debit_before'] += partner["debit_before"]
                        totals['credit_before'] += partner["credit_before"]
                        totals['debit_oborot'] += partner["debit_oborot"]
                        totals['credit_oborot'] += partner["credit_oborot"]
                        totals['saldo_end_debit'] += partner["saldo_end_debit"]
                        totals['saldo_end_credit'] += partner["saldo_end_credit"]
                    
                    # Пересчитываем сальдо
                    if (totals['debit_before'] - totals['credit_before']) > 0:
                        saldo_summ_before_debit = abs(totals['debit_before'] - totals['credit_before'])
                        saldo_summ_before_credit = 0
                    else:
                        saldo_summ_before_debit = 0
                        saldo_summ_before_credit = abs(totals['debit_before'] - totals['credit_before'])
                        
                    if (totals['debit_oborot'] - totals['credit_oborot']) > 0:
                        saldo_summ_oborot_debit = abs(totals['debit_oborot'] - totals['credit_oborot'])
                        saldo_summ_oborot_credit = 0
                    else:
                        saldo_summ_oborot_debit = 0
                        saldo_summ_oborot_credit = abs(totals['debit_oborot'] - totals['credit_oborot'])
                        
                    if (totals['saldo_end_debit'] - totals['saldo_end_credit']) > 0:
                        saldo_summ_end_debit = abs(totals['saldo_end_debit'] - totals['saldo_end_credit'])
                        saldo_summ_end_credit = 0
                    else:
                        saldo_summ_end_debit = 0
                        saldo_summ_end_credit = abs(totals['saldo_end_debit'] - totals['saldo_end_credit'])
                    
                    # Обновляем итоги в data["total_prices"]
                    data["total_prices"][agent_name] = [{
                        "debit_before_total": totals['debit_before'],
                        "credit_before_total": totals['credit_before'],
                        "debit_oborot_total": totals['debit_oborot'],
                        "credit_oborot_total": totals['credit_oborot'],
                        "saldo_end_debit_total": totals['saldo_end_debit'],
                        "saldo_end_credit_total": totals['saldo_end_credit'],
                        "saldo_summ_before_debit": saldo_summ_before_debit,
                        "saldo_summ_before_credit": saldo_summ_before_credit,
                        "saldo_summ_oborot_debit": saldo_summ_oborot_debit,
                        "saldo_summ_oborot_credit": saldo_summ_oborot_credit,
                        "saldo_summ_end_debit": saldo_summ_end_debit,
                        "saldo_summ_end_credit": saldo_summ_end_credit,
                    }]

            ic(data)


        return Response({
            "items": data["data"],
            "totals": data["total_prices"]
        })
        
    else:
        # Обычный режим (sortByAgent=false)
        data = {"data": []}
        
        # Инициализация итогов
        debit_before_total = 0
        credit_before_total = 0
        debit_oborot_total = 0
        credit_oborot_total = 0
        saldo_end_debit_total = 0
        saldo_end_credit_total = 0
        
        # 2-й запрос: получаем всех партнеров с предзагруженными данными
        all_partners = list(partners_prefetch.all())
        
        # Временный список для хранения партнеров перед фильтрацией
        all_partners_data = []
        
        for partner in all_partners:
            # Фильтрация по агенту если указан
            if agent_id:
                if not partner.agent or str(partner.agent.id) != str(agent_id):
                    continue
            
            debit_before = 0
            credit_before = 0
            debit_oborot = 0
            credit_oborot = 0
            
            # ⭐ ИЗМЕНЕНИЕ: Используем prefetched entries вместо prefetched_transactions
            for entry in partner.filtered_entries:  # ← ИСПРАВИТЬ ЗДЕСЬ!
                # ИСПРАВЛЕНИЕ: Получаем нормализованную дату транзакции
                trans_date = get_transaction_date(entry.transaction.date)
                
                # ИСПРАВЛЕНИЕ: Сравниваем нормализованные даты
                if trans_date < date_from:
                    debit_before += float(entry.debit)
                    credit_before += float(entry.credit)
                elif date_from <= trans_date <= date_to:
                    debit_oborot += float(entry.debit)
                    credit_oborot += float(entry.credit)
            
            debit_end = debit_before + debit_oborot
            credit_end = credit_before + credit_oborot
            
            if (debit_end - credit_end) > 0:
                saldo_end_debit = debit_end - credit_end
                saldo_end_credit = 0
            else:
                saldo_end_credit = abs(debit_end - credit_end)
                saldo_end_debit = 0
                
            partner_data = {
                "partner_id": partner.id,
                "account_id": account.id,
                "partner_name": partner.name,
                "debit_before": debit_before,
                "credit_before": credit_before,
                "debit_oborot": debit_oborot,
                "credit_oborot": credit_oborot,
                "saldo_end_debit": saldo_end_debit,
                "saldo_end_credit": saldo_end_credit,
                "agent": {"id": partner.agent.id, "name": partner.agent.name} if partner.agent else {},
            }
            
            all_partners_data.append(partner_data)
        
        # Фильтрация нулевых партнеров если show0 = false
        if show0 == "false" or show0 == False or show0 == "False":
            # Фильтруем партнеров, у которых не все значения равны 0
            filtered_partners = []
            for partner in all_partners_data:
                # Проверяем, что хотя бы одно значение не равно 0
                if (partner["debit_before"] != 0 or 
                    partner["credit_before"] != 0 or
                    partner["debit_oborot"] != 0 or 
                    partner["credit_oborot"] != 0 or
                    partner["saldo_end_debit"] != 0 or 
                    partner["saldo_end_credit"] != 0):
                    filtered_partners.append(partner)
            
            data["data"] = filtered_partners
        else:
            data["data"] = all_partners_data
        
        # Пересчитываем итоги на основе отфильтрованных данных
        debit_before_total = 0
        credit_before_total = 0
        debit_oborot_total = 0
        credit_oborot_total = 0
        saldo_end_debit_total = 0
        saldo_end_credit_total = 0
        
        for partner in data["data"]:
            debit_before_total += partner["debit_before"]
            credit_before_total += partner["credit_before"]
            debit_oborot_total += partner["debit_oborot"]
            credit_oborot_total += partner["credit_oborot"]
            saldo_end_debit_total += partner["saldo_end_debit"]
            saldo_end_credit_total += partner["saldo_end_credit"]
        
        # Расчет сальдо для обычного режима
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

        ic(data)

        return Response({
            "items": data["data"],
            "totals": data["total_prices"]
        })
                
    # else:
    #     # Обычный режим (sortByAgent=false)
    #     data = {"data": []}
        
    #     # Инициализация итогов
    #     debit_before_total = 0
    #     credit_before_total = 0
    #     debit_oborot_total = 0
    #     credit_oborot_total = 0
    #     saldo_end_debit_total = 0
    #     saldo_end_credit_total = 0
        
    #     # 2-й запрос: получаем всех партнеров с предзагруженными данными
    #     all_partners = list(partners_prefetch.all())
        
    #     for partner in all_partners:
    #         # Фильтрация по агенту если указан
    #         if agent_id:
    #             if not partner.agent or str(partner.agent.id) != str(agent_id):
    #                 continue
            
    #         debit_before = 0
    #         credit_before = 0
    #         debit_oborot = 0
    #         credit_oborot = 0
            
    #         # ⭐ ИЗМЕНЕНИЕ: Используем prefetched entries вместо prefetched_transactions
    #         for entry in partner.filtered_entries:  # ← ИСПРАВИТЬ ЗДЕСЬ!
    #             # ИСПРАВЛЕНИЕ: Получаем нормализованную дату транзакции
    #             trans_date = get_transaction_date(entry.transaction.date)
                
    #             # ИСПРАВЛЕНИЕ: Сравниваем нормализованные даты
    #             if trans_date < date_from:
    #                 debit_before += float(entry.debit)
    #                 credit_before += float(entry.credit)
    #             elif date_from <= trans_date <= date_to:
    #                 debit_oborot += float(entry.debit)
    #                 credit_oborot += float(entry.credit)
            
    #         debit_end = debit_before + debit_oborot
    #         credit_end = credit_before + credit_oborot
            
    #         if (debit_end - credit_end) > 0:
    #             saldo_end_debit = debit_end - credit_end
    #             saldo_end_credit = 0
    #         else:
    #             saldo_end_credit = abs(debit_end - credit_end)
    #             saldo_end_debit = 0
                
    #         # Обновляем общие итоги
    #         debit_before_total += debit_before
    #         credit_before_total += credit_before
    #         debit_oborot_total += debit_oborot
    #         credit_oborot_total += credit_oborot
    #         saldo_end_debit_total += saldo_end_debit
    #         saldo_end_credit_total += saldo_end_credit
            
    #         partner_data = {
    #             "partner_id": partner.id,
    #             "account_id": account.id,
    #             "partner_name": partner.name,
    #             "debit_before": debit_before,
    #             "credit_before": credit_before,
    #             "debit_oborot": debit_oborot,
    #             "credit_oborot": credit_oborot,
    #             "saldo_end_debit": saldo_end_debit,
    #             "saldo_end_credit": saldo_end_credit,
    #             "agent": {"id": partner.agent.id, "name": partner.agent.name} if partner.agent else {},
    #         }
            
    #         data["data"].append(partner_data)
        
    #     # Расчет сальдо для обычного режима
    #     if (debit_before_total - credit_before_total) > 0:
    #         saldo_summ_before_debit = abs(debit_before_total - credit_before_total) 
    #         saldo_summ_before_credit = 0
    #     else:
    #         saldo_summ_before_debit = 0
    #         saldo_summ_before_credit = abs(debit_before_total - credit_before_total)
            
    #     if (debit_oborot_total - credit_oborot_total) > 0:
    #         saldo_summ_oborot_debit = abs(debit_oborot_total - credit_oborot_total) 
    #         saldo_summ_oborot_credit = 0
    #     else:
    #         saldo_summ_oborot_debit = 0
    #         saldo_summ_oborot_credit = abs(debit_oborot_total - credit_oborot_total)
            
    #     if (saldo_end_debit_total - saldo_end_credit_total) > 0:
    #         saldo_summ_end_debit = abs(saldo_end_debit_total - saldo_end_credit_total) 
    #         saldo_summ_end_credit = 0
    #     else:
    #         saldo_summ_end_debit = 0
    #         saldo_summ_end_credit = abs(saldo_end_debit_total - saldo_end_credit_total)
            
    #     data["total_prices"] = {
    #         "debit_before_total": debit_before_total,
    #         "credit_before_total": credit_before_total,
    #         "debit_oborot_total": debit_oborot_total,
    #         "credit_oborot_total": credit_oborot_total,
    #         "saldo_end_debit_total": saldo_end_debit_total,
    #         "saldo_end_credit_total": saldo_end_credit_total,
    #         "saldo_summ_before_debit": saldo_summ_before_debit,
    #         "saldo_summ_before_credit": saldo_summ_before_credit,
    #         "saldo_summ_oborot_debit": saldo_summ_oborot_debit,
    #         "saldo_summ_oborot_credit": saldo_summ_oborot_credit,
    #         "saldo_summ_end_debit": saldo_summ_end_debit,
    #         "saldo_summ_end_credit": saldo_summ_end_credit,
    #     }

    #     return Response({
    #         "items": data["data"],
    #         "totals": data["total_prices"]
    #     })
        
        
        
        
        
        
        
        
        
        
        
        
        
    
# @api_view(['GET'])
# def get_account_cards_by_partner(request, accountnumber, partner_name):
#     date_from_str = request.GET.get('dateFrom')
#     date_to_str = request.GET.get('dateTo')
#     date_from = datetime.strptime(date_from_str, "%Y-%m-%d").date() if date_from_str else None
#     date_to = datetime.strptime(date_to_str, "%Y-%m-%d").date() if date_to_str else None

#     account = Account.objects.get(id=id)
    
    
    
#     # my_transactions = Transaction.objects.filter(date__range=[date_from, date_to],)
    
    
    
    
    

#     # Собираем все дочерние счета рекурсивно
#     def get_all_children(acc):
#         children = list(acc.children.all())
#         all_accs = [acc]
#         for c in children:
#             all_accs.extend(get_all_children(c))
#         return all_accs
    


#     all_accounts = get_all_children(account)
#     account_ids = [a.id for a in all_accounts]
    

#     # выбираем все транзакции за период, где есть проводки по account_ids
#     transactions = (
#         Transaction.objects.filter(
#             date__range=[date_from, date_to],
#             entries__account__in=account_ids
#         )
#         .distinct()
#         .select_related('partner')
#         .prefetch_related('entries')
#         .order_by('date', 'id')
#     )
    

#     # группируем по партнёрам
#     partner_groups = defaultdict(list)
#     for tr in transactions:
#         partner_id = tr.partner_id or 0
#         partner_groups[partner_id].append(tr)
        


#     cards = []
#     for partner_id, trans in partner_groups.items():
#         partner_name = trans[0].partner.name if partner_id else ""
#         saldo_start = Decimal(0)
#         debit_turnover = Decimal(0)
#         credit_turnover = Decimal(0)
#         current_saldo = Decimal(saldo_start)
        
#         saldo_start_data = Entry.objects.filter(
#             account__in=account_ids,
#             transaction__partner_id=partner_id,
#             transaction__date__lt=date_from
#         ).aggregate(
#             debit_sum=Sum('debit', default=Decimal(0)),
#             credit_sum=Sum('credit', default=Decimal(0))
#         )
#         saldo_start = saldo_start_data['debit_sum'] - saldo_start_data['credit_sum']
#         current_saldo = saldo_start
        



#         movements = []
#         seen = set()
#         for tr in trans:
#             if tr.id in seen:
#                 continue
#             seen.add(tr.id)

#             # суммируем дебет/кредит по всем выбранным счетам
#             sums = tr.entries.filter(account__in=account_ids).aggregate(
#                 debit_sum=Sum('debit', default=Decimal(0)),
#                 credit_sum=Sum('credit', default=Decimal(0))
#             )
#             debit = sums['debit_sum'] or Decimal(0)
#             credit = sums['credit_sum'] or Decimal(0)

#             current_saldo += debit - credit
#             debit_turnover += debit
#             credit_turnover += credit

#             movements.append({
#                 "date": tr.date.strftime("%d.%m.%Y"),
#                 "description": tr.description or "",
#                 "debit": f"{debit:.2f}" if debit else "",
#                 "credit": f"{credit:.2f}" if credit else "",
#                 "saldo": f"{current_saldo:.2f}",
#             })

#         card = {
#             "account": account.name,
#             "partner": partner_name,
#             "date_from": date_from.strftime("%d.%m.%Y"),
#             "date_to": date_to.strftime("%d.%m.%Y"),
#             "saldo_start": f"{saldo_start:.2f}",
#             "saldo_end": f"{current_saldo:.2f}",
#             "debit_turnover": f"{debit_turnover:.2f}",
#             "credit_turnover": f"{credit_turnover:.2f}",
#             "movements": movements,
#         }
#         cards.append(card)

#     return Response(cards)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoices_for_trip(request):
    date_from = request.GET.get('dateFrom')
    date_to = request.GET.get('dateTo')
    driverId = request.GET.get('driverId')
    
    ic(driverId)

    if not date_from or not date_to:
        return JsonResponse({"status": "error", "message": "dateFrom и dateTo обязательны"}, status=400)

    invoices = Invoice.objects.filter(invoice_date__range=[date_from, date_to], trip__isnull=True, awto__id=driverId).order_by("-pk")

    data = []
    total_volume = 0
    total_weight = 0
    total_length = 0
    total_width = 0
    total_height = 0
    total_price = 0
    
    for invoice in invoices:
        total_selected_price = (InvoiceItem.objects.filter(invoice=invoice)
                                .aggregate(total=Sum(F("selected_price") * F("selected_quantity")))["total"] or 0)
        total_purchase_price = (InvoiceItem.objects.filter(invoice=invoice)
                                .aggregate(total=Sum(F("purchase_price") * F("selected_quantity")))["total"] or 0)
        total_wholesale_price = (InvoiceItem.objects.filter(invoice=invoice)
                                 .aggregate(total=Sum(F("wholesale_price") * F("selected_quantity")))["total"] or 0)
        total_income_price = total_selected_price - total_purchase_price
        total_discount_price = total_selected_price - total_wholesale_price
        
        volume = (InvoiceItem.objects.filter(invoice=invoice)
                                 .aggregate(total=Sum(F("product__volume") * F("selected_quantity")))["total"] or 0)
        weight = (InvoiceItem.objects.filter(invoice=invoice)
                                 .aggregate(total=Sum(F("product__weight") * F("selected_quantity")))["total"] or 0)
        length = (InvoiceItem.objects.filter(invoice=invoice)
                                 .aggregate(total=Sum(F("product__length") * F("selected_quantity")))["total"] or 0)
        width = (InvoiceItem.objects.filter(invoice=invoice)
                                 .aggregate(total=Sum(F("product__width") * F("selected_quantity")))["total"] or 0)
        height = (InvoiceItem.objects.filter(invoice=invoice)
                                 .aggregate(total=Sum(F("product__height") * F("selected_quantity")))["total"] or 0)
        

        
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
            "total_discount_price": str(total_discount_price),
            "canceled_at": invoice.canceled_at,
            "volume": volume,
            "weight": weight,
            "length": length,
            "width": width,
            "height": height
            
        })

    return JsonResponse({ "invoices": data })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_driver_list(request):
    query = request.GET.get('query')
    drivers = Employee.objects.filter(name__icontains=query, type="driver", is_active=True)
    
    data = []
    
    for driver in drivers:
        d = {
            "id": driver.id,
            "name": driver.name
        }
        data.append(d)
    
    
        
    

    return JsonResponse({
        "data": data
    })
    
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trips(request):
    ic("get_trips")
    date_from = request.GET.get('dateFrom')
    date_to = request.GET.get('dateTo')
    trips = Trip.objects.filter(created_handle__range=[date_from, date_to]).order_by('pk')
    
    data = []
    
    for trip in trips:
        invoices = trip.invoices.all()
        
        total_volume = 0
        total_weight = 0
        total_length = 0
        total_width = 0
        total_height = 0
        total_price = 0
        invoices_json = []
        for invoice in invoices:
            total_selected_price = (InvoiceItem.objects.filter(invoice=invoice)
                                    .aggregate(total=Sum(F("selected_price") * F("selected_quantity")))["total"] or 0)
            total_purchase_price = (InvoiceItem.objects.filter(invoice=invoice)
                                    .aggregate(total=Sum(F("purchase_price") * F("selected_quantity")))["total"] or 0)
            total_wholesale_price = (InvoiceItem.objects.filter(invoice=invoice)
                                    .aggregate(total=Sum(F("wholesale_price") * F("selected_quantity")))["total"] or 0)
            total_income_price = total_selected_price - total_purchase_price
            total_discount_price = total_selected_price - total_wholesale_price
            
            volume = (InvoiceItem.objects.filter(invoice=invoice)
                                    .aggregate(total=Sum(F("product__volume") * F("selected_quantity")))["total"] or 0)
            weight = (InvoiceItem.objects.filter(invoice=invoice)
                                    .aggregate(total=Sum(F("product__weight") * F("selected_quantity")))["total"] or 0)
            length = (InvoiceItem.objects.filter(invoice=invoice)
                                    .aggregate(total=Sum(F("product__length") * F("selected_quantity")))["total"] or 0)
            width = (InvoiceItem.objects.filter(invoice=invoice)
                                    .aggregate(total=Sum(F("product__width") * F("selected_quantity")))["total"] or 0)
            height = (InvoiceItem.objects.filter(invoice=invoice)
                                    .aggregate(total=Sum(F("product__height") * F("selected_quantity")))["total"] or 0)
            
            total_volume += volume
            total_weight += weight
            total_length += length
            total_width += width
            total_height += height
            total_price += total_selected_price
            invoices_json.append({
                "id": invoice.id,
                "invoice_date": invoice.invoice_date,
                "partner": invoice.partner.name if invoice.partner else None,
                "type_price": invoice.type_price,
                "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
                "send": invoice.send,
                "is_entry": invoice.is_entry,
                "total_selected_price": str(total_selected_price),
                "total_income_price": str(total_income_price),
                "total_discount_price": str(total_discount_price),
                "canceled_at": invoice.canceled_at,
                "volume": volume,
                "weight": weight,
                "length": length,
                "width": width,
                "height": height
                
            })
        
        d = {
            "id": trip.id,
            "comment": trip.comment,
            "created_at": trip.created_at,
            "created_handle": trip.created_handle,
            "updated_at": trip.updated_at,
            "driver_id": trip.driver.id,
            "driver_name": trip.driver.name,
            "invoices_json": invoices_json,
            
            "total_volume": total_volume,
            "total_weight": total_weight,
            "total_length": total_length,
            "total_width": total_width,
            "total_height": total_height,
            "total_price": total_price,
        }
        data.append(d)
    
    
        
    

    return JsonResponse({
        "data": data
    })
    
    
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_trip(request):
#     # ic("get_trip")
#     id = request.GET.get('id')
    
#     try:
#         trip = Trip.objects.get(pk=id)
#     except Trip.DoesNotExist:
#         return JsonResponse({"status": "error", "message": "Cant find trip"}, status=400)
#     invoices = trip.invoices.all()
#     invoices_json = []
#     total_volume = 0
#     total_weight = 0
#     total_length = 0
#     total_width = 0
#     total_height = 0
#     total_price = 0
#     for invoice in invoices:
#         total_selected_price = (InvoiceItem.objects.filter(invoice=invoice)
#                                 .aggregate(total=Sum(F("selected_price") * F("selected_quantity")))["total"] or 0)
#         total_purchase_price = (InvoiceItem.objects.filter(invoice=invoice)
#                                 .aggregate(total=Sum(F("purchase_price") * F("selected_quantity")))["total"] or 0)
#         total_wholesale_price = (InvoiceItem.objects.filter(invoice=invoice)
#                                 .aggregate(total=Sum(F("wholesale_price") * F("selected_quantity")))["total"] or 0)
#         total_income_price = total_selected_price - total_purchase_price
#         total_discount_price = total_selected_price - total_wholesale_price
        
#         volume = (InvoiceItem.objects.filter(invoice=invoice)
#                                 .aggregate(total=Sum(F("product__volume") * F("selected_quantity")))["total"] or 0)
#         weight = (InvoiceItem.objects.filter(invoice=invoice)
#                                 .aggregate(total=Sum(F("product__weight") * F("selected_quantity")))["total"] or 0)
#         length = (InvoiceItem.objects.filter(invoice=invoice)
#                                 .aggregate(total=Sum(F("product__length") * F("selected_quantity")))["total"] or 0)
#         width = (InvoiceItem.objects.filter(invoice=invoice)
#                                 .aggregate(total=Sum(F("product__width") * F("selected_quantity")))["total"] or 0)
#         height = (InvoiceItem.objects.filter(invoice=invoice)
#                                 .aggregate(total=Sum(F("product__height") * F("selected_quantity")))["total"] or 0)
        
        
#         items = InvoiceItem.objects.filter(invoice=invoice)
#         products = []
#         products_dict = {}
#         for item in items:
#             product = item.product
#             images = []
#             # if product.images.exists():
#             #     for image in product.images.all():
#             #         images.append({
#             #             "image": image.image.url,
#             #         })
                    
            
   
#             # ic(item.base_unit_obj)       
#             if product.name not in products_dict:
#                 products_dict[product.name] = {
#                     "images": images,
#                     "unit": item.unit_name_on_selected_warehouses,
#                     "selected_quantity": item.selected_quantity,
#                     "total_price": total_price,
#                     "volume": (item.product.volume or 0) * item.selected_quantity,
#                     "weight": (item.product.weight or 0) * item.selected_quantity,
#                     "length": (item.product.length or 0) * item.selected_quantity,
#                     "width":  (item.product.width  or 0) * item.selected_quantity,
#                     "height": (item.product.height or 0) * item.selected_quantity,
#                 }
#             else:
#                 products_dict[product.name]['selected_quantity'] += item.selected_quantity
#                 products_dict[product.name]['total_price'] += item.total_price
#                 products_dict[product.name]['volume'] += (item.product.volume or 0) * item.selected_quantity
#                 products_dict[product.name]['weight'] += (item.product.weight or 0) * item.selected_quantity
#                 products_dict[product.name]['length'] += (item.product.length or 0) * item.selected_quantity
#                 products_dict[product.name]['width']  += (item.product.width  or 0) * item.selected_quantity
#                 products_dict[product.name]['height'] += (item.product.height or 0) * item.selected_quantity
                
#             total_price = item.selected_quantity * item.selected_price
#             ic(item.product.volume) 
#             products.append({
#                 "name": product.name,
#                 "images": images,
#                 "unit": item.unit_name_on_selected_warehouses,
#                 "selected_price": item.selected_price,
#                 "selected_quantity": item.selected_quantity,
#                 "total_price": total_price,
#                 "volume": item.product.volume,
#                 "weight": item.product.weight,
#                 "length": item.product.length,
#                 "width": item.product.width,
#                 "height": item.product.height,
#                 "is_gift": item.is_gift
#             })
            
            
        
#         total_volume += volume
#         total_weight += weight
#         total_length += length
#         total_width += width
#         total_height += height
#         total_price += total_selected_price
#         invoices_json.append({
#             "id": invoice.id,
#             "invoice_date": invoice.invoice_date,
#             "partner": invoice.partner.name if invoice.partner else None,
#             "type_price": invoice.type_price,
#             "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
#             "send": invoice.send,
#             "is_entry": invoice.is_entry,
#             "total_selected_price": str(total_selected_price),
#             "total_income_price": str(total_income_price),
#             "total_discount_price": str(total_discount_price),
#             "canceled_at": invoice.canceled_at,
#             "volume": volume,
#             "weight": weight,
#             "length": length,
#             "width": width,
#             "height": height,
#             "products": products
            
#         })

#     data = {
#         "id": trip.id,
#         "comment": trip.comment,
#         "created_at": trip.created_at,
#         "created_handle": trip.created_handle,
#         "updated_at": trip.updated_at,
#         "driver_id": trip.driver.id,
#         "driver_name": trip.driver.name,
#         "invoices_json": invoices_json,
        
#         "total_volume": total_volume,
#         "total_weight": total_weight,
#         "total_length": total_length,
#         "total_width": total_width,
#         "total_height": total_height,
#         "total_price": total_price,
#     }

    

#     return JsonResponse({
#         "data": data
#     })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trip(request):
    id = request.GET.get('id')
    
    try:
        trip = Trip.objects.get(pk=id)
    except Trip.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Cant find trip"}, status=400)
    
    # Оптимизированный запрос
    items = InvoiceItem.objects.filter(invoice__trip=trip).select_related(
        'product', 'invoice', 'invoice__partner'
    )
    
    invoices_json = {}
    grouped_products = {}  # Группировка продуктов по всему рейсу
    total_volume = Decimal('0')
    total_weight = Decimal('0')
    total_length = Decimal('0')
    total_width = Decimal('0')
    total_height = Decimal('0')
    total_price = Decimal('0')
    
    for item in items:
        invoice = item.invoice
        
        # Сохраняем информацию о накладных
        if invoice.id not in invoices_json:
            invoices_json[invoice.id] = {
                "id": invoice.id,
                "invoice_date": invoice.invoice_date,
                "partner": invoice.partner.name if invoice.partner else None,
                "type_price": invoice.type_price,
                "wozwrat_or_prihod": invoice.wozwrat_or_prihod,
                "send": invoice.send,
                "is_entry": invoice.is_entry,
                "canceled_at": invoice.canceled_at,
                "total_selected_price": Decimal('0'),
                "volume": Decimal('0'),
                "weight": Decimal('0'),
                "length": Decimal('0'),
                "width": Decimal('0'),
                "height": Decimal('0'),
            }
        
        # Расчеты для продукта
        product_volume = (item.product.volume or Decimal('0')) * item.selected_quantity
        product_weight = (item.product.weight or Decimal('0')) * item.selected_quantity
        product_length = (item.product.length or Decimal('0')) * item.selected_quantity
        product_width = (item.product.width or Decimal('0')) * item.selected_quantity
        product_height = (item.product.height or Decimal('0')) * item.selected_quantity
        product_total_price = item.selected_price * item.selected_quantity
        
        # Обновление тоталов накладной
        invoices_json[invoice.id]['total_selected_price'] += product_total_price
        invoices_json[invoice.id]['volume'] += product_volume
        invoices_json[invoice.id]['weight'] += product_weight
        invoices_json[invoice.id]['length'] += product_length
        invoices_json[invoice.id]['width'] += product_width
        invoices_json[invoice.id]['height'] += product_height
        
        # Обновление общих тоталов
        total_volume += product_volume
        total_weight += product_weight
        total_length += product_length
        total_width += product_width
        total_height += product_height
        total_price += product_total_price
        
        # Группировка продуктов по всему рейсу
        # Ключ для группировки: product_id + цена + единица измерения + подарок
        product_key = f"{item.product.id}_{item.selected_price}_{item.unit_name_on_selected_warehouses}_{item.is_gift}"
        
        if product_key not in grouped_products:
            images = []
            # if item.product.images.exists():
            #     images = [{"image": img.image.url} for img in item.product.images.all()]
            
            grouped_products[product_key] = {
                "name": item.product.name,
                "images": images,
                "unit": item.unit_name_on_selected_warehouses,
                "selected_price": item.selected_price,
                "selected_quantity": item.selected_quantity,
                "total_price": product_total_price,
                "unit_volume": item.product.volume or Decimal('0'),
                "unit_weight": item.product.weight or Decimal('0'),
                "unit_length": item.product.length or Decimal('0'),
                "unit_width": item.product.width or Decimal('0'),
                "unit_height": item.product.height or Decimal('0'),
                "is_gift": item.is_gift,
                # Накопительные значения
                "cumulative_volume": product_volume,
                "cumulative_weight": product_weight,
                "cumulative_length": product_length,
                "cumulative_width": product_width,
                "cumulative_height": product_height,
                # Список накладных, в которых встречается этот продукт
                "invoices": [invoice.id]
            }
        else:
            # Объединяем одинаковые продукты
            grouped_products[product_key]['selected_quantity'] += item.selected_quantity
            grouped_products[product_key]['total_price'] += product_total_price
            grouped_products[product_key]['cumulative_volume'] += product_volume
            grouped_products[product_key]['cumulative_weight'] += product_weight
            grouped_products[product_key]['cumulative_length'] += product_length
            grouped_products[product_key]['cumulative_width'] += product_width
            grouped_products[product_key]['cumulative_height'] += product_height
            
            # Добавляем накладную в список, если еще не добавлена
            if invoice.id not in grouped_products[product_key]['invoices']:
                grouped_products[product_key]['invoices'].append(invoice.id)
    
    # Преобразуем grouped_products в список для фронтенда
    aggregated_products = []
    for product_key, product_data in grouped_products.items():
        aggregated_products.append({
            "name": product_data["name"],
            "images": product_data["images"],
            "unit": product_data["unit"],
            "selected_price": product_data["selected_price"],
            "selected_quantity": product_data["selected_quantity"],
            "total_price": product_data["total_price"],
            "is_gift": product_data["is_gift"],
            # Используем накопительные значения для отображения
            "volume": product_data["cumulative_volume"],
            "weight": product_data["cumulative_weight"],
            "length": product_data["cumulative_length"],
            "width": product_data["cumulative_width"],
            "height": product_data["cumulative_height"],
            # Можно также добавить единичные значения для информации
            "unit_volume": product_data["unit_volume"],
            "unit_weight": product_data["unit_weight"],
            "unit_length": product_data["unit_length"],
            "unit_width": product_data["unit_width"],
            "unit_height": product_data["unit_height"],
            # Информация о накладных
            "invoice_count": len(product_data["invoices"])
        })
    
    data = {
        "id": trip.id,
        "comment": trip.comment,
        "created_at": trip.created_at,
        "created_handle": trip.created_handle,
        "updated_at": trip.updated_at,
        "driver_id": trip.driver.id,
        "driver_name": trip.driver.name,
        "invoices_json": list(invoices_json.values()),  # Информация о накладных
        "aggregated_products": aggregated_products,     # Группированные продукты по рейсу
        "total_volume": total_volume,
        "total_weight": total_weight,
        "total_length": total_length,
        "total_width": total_width,
        "total_height": total_height,
        "total_price": total_price,
    }
    
    return JsonResponse({"data": data})   

# @csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_trip(request):
    ic("tut save_trip")
    data = request.data
    
    comment = data.get("comment")
    driver = data.get("driver")
    invoice_ids = data.get("invoice_ids")
    created_handle = data.get("dateProwodok")
    

    
    update_id = data.get("update_id")
    

    
    
    if not driver:
        return JsonResponse({"status": "error", "message": "driver required"}, status=400)
    
    if not isinstance(invoice_ids, list):
        return JsonResponse({"status": "error", "message": "invoice_ids must be a list"}, status=400)
    
    if not invoice_ids:
        return JsonResponse({"status": "error", "message": "invoices required"}, status=400)
    
    try:
        driver_obj = Employee.objects.get(pk=driver)
    except Employee.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Cant find driver in database"}, status=400)
    
    
    # invoices = Invoice.objects.filter(pk__in=invoice_ids)
    invoices = list(Invoice.objects.filter(pk__in=invoice_ids).order_by('id'))
    if len(invoices) != len(invoice_ids):
        missing = set(invoice_ids) - set(inv.id for inv in invoices)
        return JsonResponse({"status": "error", "message": "Cant find invoice", "missing": list(missing)}, status=400)
            
    
    try:
        with db_transaction.atomic():

            if update_id:
                ic("update")
                try:
                    trip = Trip.objects.get(pk=update_id)
                except Trip.DoesNotExist:
                    return JsonResponse({"status": "error", "message": "Trip not found"}, status=400)
                
                # 1. Старые накладные, которые нужно удалить из рейса
                old_invoices = list(Invoice.objects.filter(trip=trip))
                
                # 2. Создаём истории для удалённых накладных
                history_remove = [
                    TripInvoiceHistory(
                        trip=trip,
                        invoice=inv,
                        action="removed",
                        performed_by=request.user
                    ) for inv in old_invoices
                ]
                TripInvoiceHistory.objects.bulk_create(history_remove)
                
                # 3. Обнуляем trip у старых инвойсов
                Invoice.objects.filter(trip=trip).update(trip=None)
                
                # 4. Назначаем новые накладные и создаём истории added
                for inv in invoices:
                    inv.trip = trip
                Invoice.objects.bulk_update(invoices, ['trip'])
                
                history_add = [
                    TripInvoiceHistory(
                        trip=trip,
                        invoice=inv,
                        action="added",
                        performed_by=request.user
                    ) for inv in invoices
                ]
                TripInvoiceHistory.objects.bulk_create(history_add)
                
                # 5. Обновляем поля Trip
                trip.driver = driver_obj
                trip.comment = comment
                trip.created_handle = created_handle
                trip.save()
                
                return JsonResponse({
                    "status": "success",
                    "message": "trip updated",
                    "trip_id": trip.id,
                    "invoices_count": len(invoices)
                })
                
            else:     
                trip = Trip.objects.create(driver=driver_obj, comment=comment, created_handle=created_handle)
                
                for inv in invoices:
                    inv.trip = trip
                Invoice.objects.bulk_update(invoices, ['trip'])
                
                history_objs = [
                    TripInvoiceHistory(
                        trip=trip,
                        invoice=inv,
                        action="added",
                        performed_by=request.user
                    ) for inv in invoices
                ]
                TripInvoiceHistory.objects.bulk_create(history_objs)
                
                
                return JsonResponse({
                    "status": "success",
                    "message": "trip saved",
                    "trip_id": trip.id,
                    "invoices_count": len(invoices)
                })
        
        
            
    except Exception as e:
        ic(e)
        # create error
        return JsonResponse({"status": "error", "message": "transactionChange", "reason_for_the_error": str(e)}, status=400)

    
    # return JsonResponse({"message": f"trip saved"})