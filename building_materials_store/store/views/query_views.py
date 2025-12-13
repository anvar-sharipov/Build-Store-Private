from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from decimal import Decimal
from django.db.models import Q, Sum
from datetime import datetime, timedelta
from django.utils.dateparse import parse_date

from django.db.models import F
from django.contrib.postgres.search import TrigramSimilarity
from ..models import *
from icecream import ic
import json


# query agent
@require_GET
def search_agents_view(request):
    query = request.GET.get('q', '')
    agents = (
        Agent.objects.annotate(similarity=TrigramSimilarity('name', query))
        .filter(similarity__gt=0.1)
        .order_by('-similarity')
    )
    data = [{'id': a.id, 'name': a.name} for a in agents]
    return JsonResponse(data, safe=False)


# query account 
@require_GET
def search_accounts_view(request):
    query = request.GET.get('q', '')
    accounts = (
        Account.objects.annotate(similarity=TrigramSimilarity('number', query))
        .filter(similarity__gt=0.1, is_active=True)
        .order_by('-similarity')
    )
    data = [{'id': a.id, 'number': a.number, "type":a.type} for a in accounts]
    return JsonResponse(data, safe=False)

# poisk partnera po imeni (get)
@require_GET
def get_partner_by_name_view(request):
    name = request.GET.get('name', '').strip()

    if not name:
        return JsonResponse({'error': 'Empty name'}, status=400)

    try:
        partner = Partner.objects.get(name__iexact=name)
        data = {
            'id': partner.id,
            'name': partner.name,
            'type': partner.type,
            'balance': float(partner.balance),  # если decimal
            # добавь сюда любые поля, которые нужны фронту
        }
        return JsonResponse({'exists': True, 'partner': data})
    except Partner.DoesNotExist:
        return JsonResponse({'exists': False, 'partner': None})
    
    
# query partner 
@require_GET
def search_partners_view(request):
    query = request.GET.get('q', '')
    partners = (
        Partner.objects.annotate(similarity=TrigramSimilarity('name', query))
        .filter(similarity__gt=0.1, is_active=True)
        .order_by('-similarity')
    )
    data = [{'id': a.id, 'name': a.name, "type":a.type, "balance":a.balance, "is_active":a.is_active} for a in partners]
    return JsonResponse(data, safe=False)






def get_trial_balance(date_from, date_to):
    accounts = Account.objects.all().order_by("number")
    ACCOUNT_FOR_START_NEW_PROJECT = CustomePostingRule.objects.filter(operation__code="ACCOUNT_FOR_START_NEW_PROJECT").first()

    report = []
    detail_report = {}

    for acc in accounts:
        if acc.number == ACCOUNT_FOR_START_NEW_PROJECT.debit_account.number:  
            continue
        # Начальное сальдо (все проводки ДО начала периода)
        opening_debit = (
            Entry.objects.filter(account=acc, transaction__date__lt=date_from)
            .aggregate(total=Sum("debit"))
            .get("total") or Decimal("0.00")
        )
        opening_credit = (
            Entry.objects.filter(account=acc, transaction__date__lt=date_from)
            .aggregate(total=Sum("credit"))
            .get("total") or Decimal("0.00")
        )
        opening_balance = opening_debit - opening_credit

        # Обороты за период
        debit_turnover = (
            Entry.objects.filter(account=acc, transaction__date__range=(date_from, date_to))
            .aggregate(total=Sum("debit"))
            .get("total") or Decimal("0.00")
        )
        credit_turnover = (
            Entry.objects.filter(account=acc, transaction__date__range=(date_from, date_to))
            .aggregate(total=Sum("credit"))
            .get("total") or Decimal("0.00")
        )

        # Конечное сальдо
        closing_balance = opening_balance + debit_turnover - credit_turnover

        report.append({
            "account": acc.number,
            "name": acc.name,
            "opening_balance": opening_balance,
            "debit_turnover": debit_turnover,
            "credit_turnover": credit_turnover,
            "closing_balance": closing_balance,
        })
        
        # get_account_number_klient = rule = CustomePostingRule.objects.filter(operation__code="sale", amount_type="revenue").first()
        # if acc.number == "60":
        # allEntryes = Entry.objects.filter(account=acc)
        # detail_report[acc.number] = {}
        # for e in allEntryes:
        #     if e.transaction.partner.name not in detail_report[acc.number]:
        #         detail_report[acc.number][e.transaction.partner.name] = {
        #             'debit_start':Decimal(0), 
        #             'credit_start':Decimal(0), 
        #             'debit_oborot':Decimal(0), 
        #             'credit_oborot':Decimal(0),
        #             'debit_end':Decimal(0),
        #             'credit_end':Decimal(0),
        #             }
        #     else:
        #         detail_report[acc.number]['subkonto']['debit_start'] = Decimal(0)
               
        
        
        
        detail_report[acc.number] = {}
        entry_start = Entry.objects.filter(account=acc, transaction__date__lt=date_from)
        
        if entry_start:
            for e in entry_start:
                if e.transaction.partner:
                    if e.transaction.partner.name not in detail_report[acc.number]:
                        detail_report[acc.number][e.transaction.partner.name] = {
                            'debit_start': Decimal(e.debit),
                            'credit_start': Decimal(e.credit),
                            'debit_oborot': Decimal(0),
                            'credit_oborot': Decimal(0),
                            'debit_end': Decimal(0),
                            'credit_end': Decimal(0),
                            }
                    else:
                        detail_report[acc.number][e.transaction.partner.name]['debit_start'] += Decimal(e.debit)
                        detail_report[acc.number][e.transaction.partner.name]['credit_start'] += Decimal(e.credit)
                else:
                    if 'prochee' not in detail_report[acc.number]:
                        detail_report[acc.number]['prochee'] = {
                                'debit_start': Decimal(e.debit),
                                'credit_start': Decimal(e.credit),
                                'debit_oborot': Decimal(0),
                                'credit_oborot': Decimal(0),
                                'debit_end': Decimal(0),
                                'credit_end': Decimal(0),
                                }
                    else:
                        detail_report[acc.number]['prochee']['debit_start'] += Decimal(e.debit)
                        detail_report[acc.number]['prochee']['credit_start'] += Decimal(e.credit)
                        
                    
                    
                
                    
            
        entry_oborot = Entry.objects.filter(account=acc, transaction__date__range=(date_from, date_to))
        if entry_oborot:
            for e in entry_oborot:
                if e.transaction.partner:
                    if e.transaction.partner.name not in detail_report[acc.number]:
                        detail_report[acc.number][e.transaction.partner.name] = {
                            'debit_start': Decimal(0),
                            'credit_start': Decimal(0),
                            'debit_oborot': Decimal(e.debit),
                            'credit_oborot': Decimal(e.credit),
                            'debit_end': Decimal(0),
                            'credit_end': Decimal(0),
                            }
                    else:
                        detail_report[acc.number][e.transaction.partner.name]['debit_oborot'] += Decimal(e.debit)
                        detail_report[acc.number][e.transaction.partner.name]['credit_oborot'] += Decimal(e.credit)
            else:
                if 'prochee' not in detail_report[acc.number]:
                    detail_report[acc.number]['prochee'] = {
                        'debit_start': Decimal(0),
                        'credit_start': Decimal(0),
                        'debit_oborot': Decimal(e.debit),
                        'credit_oborot': Decimal(e.credit),
                        'debit_end': Decimal(0),
                        'credit_end': Decimal(0),
                        }
                else:
                    detail_report[acc.number]['prochee']['debit_oborot'] += Decimal(e.debit)
                    detail_report[acc.number]['prochee']['credit_oborot'] += Decimal(e.credit)
            
     
    
    detail_report_total = {}
    saldo_total = {}
    for acc_number, partners in detail_report.items():
        start_summ_debit = Decimal(0)
        start_summ_credit = Decimal(0)
        
        oborot_summ_debit = Decimal(0)
        oborot_summ_credit = Decimal(0)
        
        end_summ_debit = Decimal(0)
        end_summ_credit = Decimal(0)
        
        
        
        

        for partner, data in partners.items():
            debit_end = data['debit_start'] + data['debit_oborot']
            credit_end = data['credit_start'] + data['credit_oborot']
            data['debit_end'] = debit_end
            data['credit_end'] = credit_end
            
            start_summ_debit += data['debit_start']
            start_summ_credit += data['credit_start']
            
            oborot_summ_debit += data['debit_oborot']
            oborot_summ_credit += data['credit_oborot']
            
            end_summ_debit += debit_end
            end_summ_credit += credit_end
         
        detail_report_total[acc_number] = {
            'start_summ_debit': start_summ_debit,
            'start_summ_credit': start_summ_credit,
            'oborot_summ_debit': oborot_summ_debit,
            'oborot_summ_credit': oborot_summ_credit,
            'end_summ_debit': end_summ_debit,
            'end_summ_credit': end_summ_credit,
        }
        
        
        start_saldo = start_summ_debit - start_summ_credit
        start_saldo_debit = start_saldo if start_saldo > 0 else Decimal(0)
        start_saldo_credit = abs(start_saldo) if start_saldo < 0 else Decimal(0)
        
        oborot_saldo = oborot_summ_debit - oborot_summ_credit
        oborot_saldo_debit = oborot_saldo if oborot_saldo > 0 else Decimal(0)
        oborot_saldo_credit = abs(oborot_saldo) if oborot_saldo < 0 else Decimal(0)
        
        end_saldo = end_summ_debit - end_summ_credit
        end_saldo_debit = end_saldo if end_saldo > 0 else Decimal(0)
        end_saldo_credit = abs(end_saldo) if end_saldo < 0 else Decimal(0)
        
        saldo_total[acc_number] = {
            'start_saldo_debit': start_saldo_debit,
            'start_saldo_credit': start_saldo_credit,
            'oborot_saldo_debit': oborot_saldo_debit,
            'oborot_saldo_credit': oborot_saldo_credit,
            'end_saldo_debit': end_saldo_debit,
            'end_saldo_credit': end_saldo_credit,
        }
        
        
    return {"report":report, "detail_report":detail_report, "detail_report_total":detail_report_total, "saldo_total":saldo_total}
# OSW
@require_GET
def get_osw(request):
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")

    reports = get_trial_balance(date_from, date_to)  # твоя функция
    report = reports['report']
    detail_report = reports['detail_report']
    detail_report_total=reports["detail_report_total"]
    saldo_total=reports["saldo_total"]

    return JsonResponse({"report": report, "detail_report":detail_report, "detail_report_total":detail_report_total, "saldo_total":saldo_total}, safe=False)


########################################################################################################################################################################## START
# get saldo       ishem saldo dlya partnera na wybrannuyu daty, saleInvoice

def get_saldo(partner_obj, getDate):
    # USD
    rule = CustomePostingRule.objects.filter(operation__code="sale", directory_type=partner_obj.type, amount_type="revenue", currency__code="USD").first()
    
    if not rule:
        value = [Decimal('0.00'), Decimal('0.00')]
        return {"start": value, "oborot": value, "final": value, "saldo": value}
    
    account = rule.debit_account
    
    # ⭐ ИЗМЕНЕНИЕ: используем partner из Entry вместо transaction__partner
    entries_start = Entry.objects.filter(partner=partner_obj, transaction__date__lt=getDate).filter(account=account)
    debit_start = entries_start.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
    credit_start = entries_start.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    
    entries_oborot = Entry.objects.filter(partner=partner_obj, transaction__date__date=getDate).filter(account=account)
    today_entries = []
    desc = ''
    already_have_pks = []
    
    if entries_oborot:
        count = 0
        for e in entries_oborot:
            str_date = e.transaction.date.strftime("%d-%m-%Y %H:%M")
            if e.transaction.pk in already_have_pks:
                for c in today_entries:
                    if c[4] == e.transaction.pk:
                        c[2] += e.debit
                        c[3] += e.credit
            else:
                today_entries.append([str_date, e.transaction.description, e.debit, e.credit, e.transaction.pk])
                already_have_pks.append(e.transaction.pk)
            count += 1
            desc += f"{count}) {e.transaction.description}"
            desc += "\n"

    debit_oborot = entries_oborot.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
    credit_oborot = entries_oborot.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    
    debit_end = debit_start + debit_oborot
    credit_end = credit_start + credit_oborot
    
    saldo = debit_end - credit_end
    saldo_debit = abs(saldo) if saldo > 0 else 0
    saldo_credit = abs(saldo) if saldo < 0 else 0
    
    # TMT
    rule = CustomePostingRule.objects.filter(operation__code="sale", directory_type=partner_obj.type, amount_type="revenue", currency__code="TMT").first()
   
    if not rule:
        value = [Decimal('0.00'), Decimal('0.00')]
        return {"start": value, "oborot": value, "final": value, "saldo": value}
    
    account = rule.debit_account
    
    # ⭐ ИЗМЕНЕНИЕ: используем partner из Entry вместо transaction__partner
    entries_start = Entry.objects.filter(partner=partner_obj, transaction__date__lt=getDate).filter(account=account)
    debit_start_tmt = entries_start.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
    credit_start_tmt = entries_start.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    
    entries_oborot = Entry.objects.filter(partner=partner_obj, transaction__date__date=getDate).filter(account=account)
    today_entries_tmt = []
    desc_tmt = ''
    already_have_pks = []
    
    if entries_oborot:
        count = 0
        for e in entries_oborot:
            str_date = e.transaction.date.strftime("%d-%m-%Y %H:%M")
            if e.transaction.pk in already_have_pks:
                for c in today_entries_tmt:
                    if c[4] == e.transaction.pk:
                        c[2] += e.debit
                        c[3] += e.credit
            else:
                today_entries_tmt.append([str_date, e.transaction.description, e.debit, e.credit, e.transaction.pk])
                already_have_pks.append(e.transaction.pk)
            count += 1
            desc_tmt += f"{count}) {e.transaction.description}"
            desc_tmt += "\n"

    debit_oborot_tmt = entries_oborot.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
    credit_oborot_tmt = entries_oborot.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    
    debit_end_tmt = debit_start_tmt + debit_oborot_tmt
    credit_end_tmt = credit_start_tmt + credit_oborot_tmt
    
    saldo = debit_end_tmt - credit_end_tmt
    saldo_debit_tmt = abs(saldo) if saldo > 0 else 0
    saldo_credit_tmt = abs(saldo) if saldo < 0 else 0
    
    return {
        "start": [debit_start, credit_start], "oborot": [debit_oborot, credit_oborot, desc], "final": [debit_end, credit_end], "saldo": [saldo_debit, saldo_credit], "today_entries": today_entries,
        "start_tmt": [debit_start_tmt, credit_start_tmt], "oborot_tmt": [debit_oborot_tmt, credit_oborot_tmt, desc_tmt], "final_tmt": [debit_end_tmt, credit_end_tmt], "saldo_tmt": [saldo_debit_tmt, saldo_credit_tmt], "today_entries_tmt": today_entries_tmt,
    }


def get_saldo2(partner_obj, getDate):
    ic("tut saldo2")
    # WarehouseProduct.objects.all().update(quantity=0)
    results = {}
    
    # Для каждого счета отдельно
    accounts_to_check = [
        ('60', 'USD'),  # Клиент USD
        ('62', 'TMT'),  # Клиент TMT  
        ('75', 'USD'),  # Учредитель USD
        ('76', 'TMT')   # Учредитель TMT
    ]
    
    for account_number, currency in accounts_to_check:
        account = Account.objects.get(number=account_number)
        
        # ⭐ ИЗМЕНЕНИЕ: используем partner из Entry вместо transaction__partner
        # Начальное сальдо (до выбранной даты)
        entries_start = Entry.objects.filter(
            partner=partner_obj,  # ← ИЗМЕНИЛИ
            transaction__date__lt=getDate
        ).filter(account=account)
        
        debit_start = entries_start.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
        credit_start = entries_start.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
        
        # Обороты за выбранную дату
        entries_oborot = Entry.objects.filter(
            partner=partner_obj,  # ← ИЗМЕНИЛИ
            transaction__date__date=getDate  
        ).filter(account=account)
        
        debit_oborot = entries_oborot.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
        credit_oborot = entries_oborot.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
        
        # Детали операций за день (аналогично оригинальной функции)
        today_entries = []
        desc = ''
        already_have_pks = []
        
        if entries_oborot:
            count = 0
            for e in entries_oborot:
                str_date = e.transaction.date.strftime("%d-%m-%Y %H:%M")
                if e.transaction.pk in already_have_pks:
                    for c in today_entries:
                        if c[4] == e.transaction.pk:
                            c[2] += e.debit
                            c[3] += e.credit
                else:
                    today_entries.append([str_date, e.transaction.description, e.debit, e.credit, e.transaction.pk])
                    already_have_pks.append(e.transaction.pk)
                count += 1
                desc += f"{count}) {e.transaction.description}"
                desc += "\n"
        
        # Итоговые расчеты
        debit_end = debit_start + debit_oborot
        credit_end = credit_start + credit_oborot
        saldo = debit_end - credit_end
        saldo_debit = abs(saldo) if saldo > 0 else 0
        saldo_credit = abs(saldo) if saldo < 0 else 0
        
        results[f"{account_number}_{currency}"] = {
            "account_name": f"{account.number} {account.name}",
            "start": [debit_start, credit_start],
            "oborot": [debit_oborot, credit_oborot, desc], 
            "final": [debit_end, credit_end],
            "saldo": [saldo_debit, saldo_credit],
            "today_entries": today_entries
        }
    
    return results

@require_GET
def get_saldo_for_partner_for_selected_date2(request):
    getDate = request.GET.get('date')
    partnerId = request.GET.get('partnerId')
    partner_obj = Partner.objects.get(pk=partnerId)
    saldo = get_saldo2(partner_obj, getDate)
    return JsonResponse({"saldo": saldo}, safe=False)


@require_GET
def get_saldo_for_partner_for_selected_date(request):
    getDate = request.GET.get('date')
    partnerId = request.GET.get('partnerId')
    partner_obj = Partner.objects.get(pk=partnerId)
    saldo = get_saldo(partner_obj, getDate)
    return JsonResponse({"saldo": saldo}, safe=False)
# get saldo
########################################################################################################################################################################## END


@require_GET
def delete_data(request):
    models_name = request.GET.get('models_name')
    password = request.GET.get('password')

    if password != "373839145654356":
        return JsonResponse({"success": False, "error": "Неверный пароль"})
    
    
    if models_name == "delete_products":
        SalesInvoiceItem.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Tag.objects.all().delete()
        UnitOfMeasurement.objects.all().delete()
        Brand.objects.all().delete()
        WarehouseProduct.objects.all().delete()
        Model.objects.all().delete()
        PriceChangeHistory.objects.all().delete()
    # Логика удаления
    
    if models_name == "delete_agents":
        return JsonResponse({"success": True, "models_name": models_name, "date_focus": True})
        
    return JsonResponse({"success": True, "models_name": models_name})




    
    
@require_GET
def check_day_closed(request):
    date_str = request.GET.get("date")  # формат YYYY-MM-DD
    if not date_str:
        return JsonResponse({"success": False, "error": "Дата не указана"})
    
    try:
        chosen_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return JsonResponse({"success": False, "error": "Неверный формат даты. Используйте YYYY-MM-DD"})

    # выбранный день
    day = DayClosing.objects.filter(date=chosen_date).first()
    is_closed = bool(day and getattr(day, "is_closed", True))

    # предыдущий день
    prev_date = chosen_date - timedelta(days=1)
    prev_day = DayClosing.objects.filter(date=prev_date).first()
    prev_closed = bool(prev_day and getattr(prev_day, "is_closed", True))
    
    # если предыдущий день не закрыт → сразу вернуть False
    
    if DayClosing.objects.all().exists():
        return JsonResponse({"success": True, "is_closed": is_closed, "last_day_not_closed": not prev_closed})
    else:
        return JsonResponse({"success": True, "is_closed": False, "last_day_not_closed": False})

    

   
    

    
    
    
    
@csrf_exempt
def close_day(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Только POST запросы разрешены"})

    data = json.loads(request.body)
    close_date = data.get("date")
    reason = data.get("reason", "")
    user_id = data.get("user_id")

    if not close_date:
        return JsonResponse({"success": False, "error": "choose close date"})
    
    if not user_id:
        return JsonResponse({"success": False, "error": "youDidntAuthenticated"})
    
    if not User.objects.filter(id=user_id).exists():
        return JsonResponse({"success": False, "error": "youDidntAuthenticated"})
    
    user = User.objects.get(id=user_id)

    try:
        with transaction.atomic():
            # если уже закрыт
            if DayClosing.objects.filter(date=close_date).exists():
                transaction.set_rollback(True)
                return JsonResponse({"success": False, "error": "День уже закрыт"})
            
            day_closing = DayClosing.objects.create(date=close_date)

            # обновляем статус
            day_closing.closed_at = timezone.now()
            day_closing.closed_by = user
            day_closing.note = reason
            day_closing.save()

            # логируем
            DayClosingLog.objects.create(
                day_closing=day_closing,
                action="close",
                performed_by=user,
                reason=reason
            )

            # ФУНКЦИИ ДЛЯ ВЫЧИСЛЕНИЯ БАЛАНСОВ ПО КАЖДОМУ СЧЕТУ
            def calculate_balance_by_account(partner, target_date, account_number):
                """Вычисляет баланс по конкретному счету"""
                entries = Entry.objects.filter(
                    transaction__partner=partner,
                    transaction__date__lte=target_date,
                    account__number=account_number
                )
                debit = entries.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
                credit = entries.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
                return debit - credit

            # снимки балансов партнёров ОТДЕЛЬНО ПО КАЖДОМУ СЧЕТУ
            for partner in Partner.objects.all():
                balance_60_usd = calculate_balance_by_account(partner, close_date, '60')
                balance_62_tmt = calculate_balance_by_account(partner, close_date, '62')
                balance_75_usd = calculate_balance_by_account(partner, close_date, '75')
                balance_76_tmt = calculate_balance_by_account(partner, close_date, '76')
                
                # Итоговые балансы по валютам (для обратной совместимости)
                total_usd = balance_60_usd + balance_75_usd
                total_tmt = balance_62_tmt + balance_76_tmt
                
                PartnerBalanceSnapshot.objects.create(
                    closing=day_closing,
                    partner=partner,
                    balance_60_usd=balance_60_usd,
                    balance_62_tmt=balance_62_tmt,
                    balance_75_usd=balance_75_usd,
                    balance_76_tmt=balance_76_tmt,
                    balance_usd=total_usd,  # для обратной совместимости
                    balance_tmt=total_tmt,  # для обратной совместимости
                    balance=Decimal('0.000')  # старое поле
                )

            # снимки складов (остается без изменений)
            for wp in WarehouseProduct.objects.all():
                StockSnapshot.objects.create(
                    closing=day_closing,
                    warehouse=wp.warehouse,
                    product=wp.product,
                    purchase_price=wp.product.purchase_price,
                    retail_price=wp.product.retail_price,
                    wholesale_price=wp.product.wholesale_price,
                    discount_price=wp.product.discount_price,
                    firma_price=wp.product.firma_price,
                    quantity=wp.quantity
                )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})
    
    return JsonResponse({"success": True, "message": "day success is closed", "date": close_date})


# close day
########################################################################################################################################################################## END

@csrf_exempt
def universal_entries(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)
    
    try:
        data = json.loads(request.body)
        date = parse_date(data.get("date"))
        debit_number = data.get("debit")
        credit_number = data.get("credit")
        amount = Decimal(data.get("amount"))
        description = data.get("description", "")
        
        # Найти счета
        debit_account = Account.objects.get(number=debit_number)
        credit_account = Account.objects.get(number=credit_number)
        
        try:
            with transaction.atomic():
        
                # Создать транзакцию
                transaction_obj = Transaction.objects.create(
                    date=date,
                    description=description,
                    created_by=request.user
                )
                
                # Создать проводки
                Entry.objects.create(
                    transaction=transaction_obj,
                    account=debit_account,
                    debit=amount,
                    credit=Decimal('0.00')
                )
                Entry.objects.create(
                    transaction=transaction_obj,
                    account=credit_account,
                    debit=Decimal('0.00'),
                    credit=amount
                )
                
                return JsonResponse({"success": True, "transaction_id": transaction_obj.id})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    
    except Account.DoesNotExist:
        return JsonResponse({"error": "Дебет или кредит счет не найден"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    
    
@require_GET
def get_transaction_journal(request):
    date_from = request.GET.get("dateFrom")
    date_to = request.GET.get("dateTo")

    if not date_from or not date_to:
        return JsonResponse({"error": "Не указаны даты"}, status=400)

    allowed_accounts = ['50', '52', '60', '62', '75', '76']

    transactions = Transaction.objects.filter(
        date__range=[date_from, date_to],
        partner__isnull=False
    ).prefetch_related('entries', 'partner')

    journal = []

    for tr in transactions:
        entries = tr.entries.all()
        account_numbers = [e.account.number for e in entries]

        # Проверяем, что хотя бы один счет в списке allowed_accounts
        if not any(acc in allowed_accounts for acc in account_numbers):
            continue

        # Проверяем, что все счета транзакции входят в allowed_accounts
        if not all(acc in allowed_accounts for acc in account_numbers):
            continue

        # Фильтруем проводки только по нужным счетам (для дебета/кредита)
        filtered_entries = [e for e in entries if e.account.number in allowed_accounts]

        debit_accounts = ', '.join(str(e.account.number) for e in filtered_entries if e.debit > 0)
        credit_accounts = ', '.join(str(e.account.number) for e in filtered_entries if e.credit > 0)
        amount = sum(e.debit for e in filtered_entries)

        journal.append({
            "date": tr.date.strftime("%d.%m.%Y"),
            "operation": f"{tr.description}, {tr.partner.name if tr.partner else ''}",
            "debit": debit_accounts,
            "credit": credit_accounts,
            "amount": float(amount)
        })

    total_amount = sum(item['amount'] for item in journal)
    period_str = f"Period from {date_from} to {date_to}"

    return JsonResponse({
        "journal": journal,
        "period": period_str,
        "totalAmount": total_amount
    }, safe=False)