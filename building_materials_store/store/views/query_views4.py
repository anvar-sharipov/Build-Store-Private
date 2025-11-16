from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..models import Transaction, Account, Entry, Partner, Agent
from django.http import JsonResponse
from icecream import ic
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from datetime import datetime, date, time   
from decimal import Decimal
from collections import defaultdict
from django.db.models import Sum, F, Q




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
            'transaction_set',
            queryset=Transaction.objects.prefetch_related(
                Prefetch(
                    'entries',
                    queryset=Entry.objects.filter(account__number=account_number),
                    to_attr='filtered_entries'
                )
            ),
            to_attr='prefetched_transactions'
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
            
            # Обрабатываем все транзакции партнера
            for transaction in partner.prefetched_transactions:
                # ИСПРАВЛЕНИЕ: Получаем нормализованную дату транзакции
                trans_date = get_transaction_date(transaction.date)
                
                for entry in transaction.filtered_entries:
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
        
        for partner in all_partners:
            # Фильтрация по агенту если указан
            if agent_id:
                if not partner.agent or str(partner.agent.id) != str(agent_id):
                    continue
            
            debit_before = 0
            credit_before = 0
            debit_oborot = 0
            credit_oborot = 0
            
            # Обрабатываем все транзакции партнера
            for transaction in partner.prefetched_transactions:
                # ИСПРАВЛЕНИЕ: Получаем нормализованную дату транзакции
                trans_date = get_transaction_date(transaction.date)
                
                for entry in transaction.filtered_entries:
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
                
            # Обновляем общие итоги
            debit_before_total += debit_before
            credit_before_total += credit_before
            debit_oborot_total += debit_oborot
            credit_oborot_total += credit_oborot
            saldo_end_debit_total += saldo_end_debit
            saldo_end_credit_total += saldo_end_credit
            
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
            
            data["data"].append(partner_data)
        
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

        return Response({
            "items": data["data"],
            "totals": data["total_prices"]
        })
        
        
        
        
        
        
        
        
        
        
        
        
        
    
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