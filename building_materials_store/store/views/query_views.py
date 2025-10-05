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
    # ic(query)
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
    # ic('tut')
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
    # ic(query)
    partners = (
        Partner.objects.annotate(similarity=TrigramSimilarity('name', query))
        .filter(similarity__gt=0.1, is_active=True)
        .order_by('-similarity')
    )
    data = [{'id': a.id, 'name': a.name, "type":a.type, "balance":a.balance, "is_active":a.is_active} for a in partners]
    return JsonResponse(data, safe=False)






def get_trial_balance(date_from, date_to):
    accounts = Account.objects.all().order_by("number")
    # ic("this is get_trial_balance")
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
        
        
    ic(saldo_total)
    return {"report":report, "detail_report":detail_report, "detail_report_total":detail_report_total, "saldo_total":saldo_total}
# OSW
@require_GET
def get_osw(request):
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")
    # ic(date_from, date_to)

    reports = get_trial_balance(date_from, date_to)  # твоя функция
    report = reports['report']
    detail_report = reports['detail_report']
    detail_report_total=reports["detail_report_total"]
    saldo_total=reports["saldo_total"]

    return JsonResponse({"report": report, "detail_report":detail_report, "detail_report_total":detail_report_total, "saldo_total":saldo_total}, safe=False)


########################################################################################################################################################################## START
# get saldo       ishem saldo dlya partnera na wybrannuyu daty, saleInvoice

def get_saldo(partner_obj, getDate):
    rule = CustomePostingRule.objects.filter(operation__code="sale", directory_type=partner_obj.type, amount_type="revenue").first()
    
    # rule_pays = CustomePostingRule.objects.filter(operation__code="pays", directory_type=partner_obj.type, pays_type="expense").first()
    
    
    
    # # less, debit
    # transactions = Transaction.objects.filter(partner=partner_obj, date__lt=getDate)
    # transactions_less_debit_dict = {}
    # for t in transactions:
    #     entries = Entry.objects.filter(transaction=t)
    #     transactions_less_debit_dict[t.id] = {"invoice": t}
    #     total_debit = 0
    #     for e in entries:
    #         # ic(e)
    #         if e.account.number == rule.debit_account.number:
    #             total_debit += e.debit
    #         elif e.account.number == rule_pays.debit_account.number:
    #             total_debit += e.debit     
    #     transactions_less_debit_dict[t.id]["total_debit"] = total_debit
    # # ic(transactions_less_dict)
    # # less, kredit
    # transactions = Transaction.objects.filter(partner=partner_obj, date__lt=getDate)
    # transactions_less_credit_dict = {}
    # for t in transactions:
    #     entries = Entry.objects.filter(transaction=t)
    #     transactions_less_credit_dict[t.id] = {"invoice": t}
    #     total_debit = 0
    #     for e in entries:
            
    #         if e.account.number == rule.credit_account.number:
    #             ic(e)
    #             total_debit += e.credit
    #         elif e.account.number == rule_pays.credit_account.number:
    #             ic(e)
    #             total_debit += e.credit     
    #     transactions_less_credit_dict[t.id]["total_debit"] = total_debit



    # # current, sale
    # transactions = Transaction.objects.filter(partner=partner_obj, date=getDate)
    # transactions_current_dict = {}
    # for t in transactions:
    #     entries = Entry.objects.filter(transaction=t)
    #     transactions_current_dict[t.id] = {"invoice": t}
    #     total_debit = 0
    #     for e in entries:
    #         if e.account.number == rule.debit_account.number:
    #             total_debit += e.debit
    #             # ic(e)
    #         else:
    #             total_debit += e.debit
    #     transactions_current_dict[t.id]["total_debit"] = total_debit
    # # ic(transactions_current_dict)
            
    
    # # less pays debit
    # # transactions = Transaction.objects.filter(partner=partner_obj, date__lt=getDate)
    
    
    
    
    
    
    
    
    if not rule:
        value = [Decimal('0.00'), Decimal('0.00')]
        return {"start": value, "oborot": value, "final": value, "saldo": value}
    account = rule.debit_account
    entries_start = Entry.objects.filter(transaction__partner=partner_obj, transaction__date__lt=getDate).filter(account=account)
    debit_start = entries_start.aggregate(total=Sum('debit'))['total'] or Decimal('0.00')
    credit_start = entries_start.aggregate(total=Sum('credit'))['total'] or Decimal('0.00')
    
    entries_oborot = Entry.objects.filter(transaction__partner=partner_obj, transaction__date__date=getDate).filter(account=account)
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
    # ic(today_entries)
  
    
    debit_end = debit_start + debit_oborot
    credit_end = credit_start + credit_oborot
    
    saldo = debit_end - credit_end
    saldo_debit = abs(saldo) if saldo > 0 else 0
    saldo_credit = abs(saldo) if saldo < 0 else 0

    return {"start": [debit_start, credit_start], "oborot": [debit_oborot, credit_oborot, desc], "final": [debit_end, credit_end], "saldo": [saldo_debit, saldo_credit], "today_entries":today_entries}  
@require_GET
def get_saldo_for_partner_for_selected_date(request):
    getDate = request.GET.get('date')
    partnerId = request.GET.get('partnerId')
    partner_obj = Partner.objects.get(pk=partnerId)
    # ic(get_balance_on_date(partner_obj, getDate))
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
        ic("agents_deleted")
        return JsonResponse({"success": True, "models_name": models_name, "date_focus": True})
        
    return JsonResponse({"success": True, "models_name": models_name})



########################################################################################################################################################################## START
# close day



# @require_GET
# def check_day_closed(request):
#     date_str = request.GET.get("date")  # формат YYYY-MM-DD
#     if not date_str:
#         return JsonResponse({"success": False, "error": "Дата не указана"})
    
#     ic(date_str)


#     try:
#         chosen_date = datetime.strptime(date_str, "%Y-%m-%d").date()
#     except ValueError:
#         return JsonResponse({"success": False, "error": "Неверный формат даты. Используйте YYYY-MM-DD"})

#     day = DayClosing.objects.filter(date=chosen_date).first()
#     return JsonResponse({
#         "success": True,
#         "is_closed": bool(day and getattr(day, "is_closed", True))
#     })
    
    
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
    # ic(prev_closed)
    
    # если предыдущий день не закрыт → сразу вернуть False
    
    if DayClosing.objects.all().exists():
        ic("tutEEEEEEEE")
        return JsonResponse({"success": True, "is_closed": is_closed, "last_day_not_closed": not prev_closed})
    else:
        ic("tutGGGGGGGGG")
        return JsonResponse({"success": True, "is_closed": False, "last_day_not_closed": False})

    

   
    

    
    
    
    

@csrf_exempt
def close_day(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Только POST запросы разрешены"})

    # try:
    #     # data = json.loads(request.body)
    #     # close_date = data.get("date")  # формат YYYY-MM-DD
    #     # reason = data.get("reason", "")
    #     # user_id = data.get("user_id")

    #     # user = User.objects.get(id=user_id)
        
    # except Exception as e:
    #     return JsonResponse({"success": False, "error": f"Неверные данные: {str(e)}"})
    
    
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
    
    # invoices = Invoice.objects.filter(invoice_date=close_date)
    # ic(invoices)
    
    # # if invoices.exists():
    # #     for invoice in invoices:
    # #         if not invoice.is_entry:
    # #             invoice.
    
        

    try:
        with transaction.atomic():
            # 1/0
   

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

            # снимки балансов партнёров
            for partner in Partner.objects.all():
                PartnerBalanceSnapshot.objects.create(
                    closing=day_closing,
                    partner=partner,
                    balance=partner.balance
                )

            # снимки складов
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
                    description=description
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