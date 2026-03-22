from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.db import transaction as db_transaction
from icecream import ic
import json
from ..models import Entry, Invoice, Transaction, PartnerBalanceSnapshot, Partner, DayClosing, WarehouseProduct, InvoiceItem
from decimal import Decimal
from collections import defaultdict
from datetime import datetime
from django.db.models import Sum, Q



def check_warehouse_integrity(warehouse_ids, fix=False):

    turnover_data = {}

    items = InvoiceItem.objects.filter(
        invoice__canceled_at__isnull=True,
        invoice__is_entry=True
    ).filter(
        Q(invoice__warehouse_id__in=warehouse_ids) |
        Q(invoice__warehouse2_id__in=warehouse_ids)
    ).select_related(
        "product", "invoice"
    )

    for item in items:

        p = item.product
        inv = item.invoice
        qty = Decimal(item.selected_quantity)

        if p.id not in turnover_data:
            turnover_data[p.id] = {
                "product": p,
                "qty_from_docs": Decimal("0")
            }

        if inv.wozwrat_or_prihod == "prihod":
            if inv.warehouse_id in warehouse_ids:
                turnover_data[p.id]["qty_from_docs"] += qty

        elif inv.wozwrat_or_prihod == "rashod":
            if inv.warehouse_id in warehouse_ids:
                turnover_data[p.id]["qty_from_docs"] -= qty

        elif inv.wozwrat_or_prihod == "wozwrat":
            if inv.warehouse_id in warehouse_ids:
                turnover_data[p.id]["qty_from_docs"] += qty

        elif inv.wozwrat_or_prihod == "transfer":

            if inv.warehouse_id in warehouse_ids:
                turnover_data[p.id]["qty_from_docs"] -= qty

            elif inv.warehouse2_id in warehouse_ids:
                turnover_data[p.id]["qty_from_docs"] += qty


    print("========== CHECK WAREHOUSE ==========")

    problems = []

    for product_id, data in turnover_data.items():

        p = data["product"]
        qty_from_docs = data["qty_from_docs"]

        wp = WarehouseProduct.objects.filter(
            warehouse_id__in=warehouse_ids,
            product_id=product_id
        ).first()

        if not wp:
            continue

        warehouse_qty = Decimal(wp.quantity)

        if qty_from_docs != warehouse_qty:

            diff = warehouse_qty - qty_from_docs

            print("❌ MISMATCH")
            print("PRODUCT:", p.id, p.name)
            print("FROM DOCS:", qty_from_docs)
            print("WAREHOUSE:", warehouse_qty)
            print("DIFF:", diff)

            if fix:
                print("⚙ FIXING STOCK...")
                wp.quantity = qty_from_docs
                wp.save(update_fields=["quantity"])
                print("✅ FIXED")

            print("-------------------")

            problems.append({
                "product_id": p.id,
                "product_name": p.name,
                "qty_from_docs": qty_from_docs,
                "warehouse_qty": warehouse_qty,
                "diff": diff
            })

    print("========== RESULT ==========")
    print("PROBLEMS:", len(problems))

    return problems

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
    # ic(data)
    password = data.get("password")
    type_action = data.get("type")
    
    # test = Entry.objects.filter(partner__name="Koneurgench Nazar Dane Bazar +99364509001", transaction__date__date = "2026-02-16")
    # # ic(len(test))
    # test_count = 0
    # t = {}
    # for i in test:
    #     if i.transaction.invoice:
    #         if i.transaction.invoice.id == 4737:
    #             test_count += i.debit
    #             if i.product.name not in t:
    #                 t[i.product.name] = 1
    #             else:
    #                 t[i.product.name] += 1
    #             ic(i.account.number, i.partner.name, i.debit, i.transaction.date, i.product.name)
                
    # ic(t)
                
    
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
    
    if type_action == "recalc_all_partner_balance_snapshoots":
        @db_transaction.atomic
        def recalc_all_partner_snapshots():
            print("🔄 Start recalculating partner balance snapshots")
            PartnerBalanceSnapshot.objects.all().delete()

            partners = list(Partner.objects.all())
            closings = list(DayClosing.objects.order_by('date'))

            if not closings:
                print("❗ No DayClosing records found")
                return

            # 1️⃣ Забираем ВСЕ обороты одним SQL
            turnovers = list(
                Entry.objects
                .filter(account__number__in=["60", "62", "75", "76"])
                .values(
                    'partner_id',
                    'account__number',
                    'transaction__date'
                )
                .annotate(
                    debit=Sum('debit'),
                    credit=Sum('credit')
                )
                .order_by('transaction__date')
            )

            # 2️⃣ Группируем обороты по партнёрам
            turn_by_partner = defaultdict(list)

            for row in turnovers:
                date = row['transaction__date']
                if isinstance(date, datetime):
                    date = date.date()

                turn_by_partner[row['partner_id']].append({
                    "date": date,
                    "account": row['account__number'],
                    "debit": row['debit'] or Decimal("0.000"),
                    "credit": row['credit'] or Decimal("0.000"),
                })

            # 3️⃣ Текущие накопленные значения
            balances = defaultdict(lambda: defaultdict(lambda: {
                "debit": Decimal("0.000"),
                "credit": Decimal("0.000"),
            }))

            partner_turn_idx = defaultdict(int)
            snapshots = []

            # 4️⃣ Идём по закрытиям дней
            for closing in closings:
                closing_date = closing.date
                print(f"📅 Closing {closing_date}")

                for partner in partners:
                    pid = partner.id
                    turns = turn_by_partner.get(pid, [])
                    idx = partner_turn_idx[pid]

                    # Добавляем все обороты до closing_date
                    while idx < len(turns) and turns[idx]["date"] <= closing_date:
                        t = turns[idx]
                        acc = t["account"]

                        balances[pid][acc]["debit"] += t["debit"]
                        balances[pid][acc]["credit"] += t["credit"]
                        idx += 1

                    partner_turn_idx[pid] = idx

                    # Сальдо = debit - credit
                    b60 = balances[pid]["60"]
                    b62 = balances[pid]["62"]
                    b75 = balances[pid]["75"]
                    b76 = balances[pid]["76"]

                    snapshots.append(
                        PartnerBalanceSnapshot(
                            closing=closing,
                            partner=partner,

                            # Сальдо
                            balance_60_usd=b60["debit"] - b60["credit"],
                            balance_62_tmt=b62["debit"] - b62["credit"],
                            balance_75_usd=b75["debit"] - b75["credit"],
                            balance_76_tmt=b76["debit"] - b76["credit"],

                            # Накопленные дебет / кредит
                            balance_60_usd_debit=b60["debit"],
                            balance_60_usd_credit=b60["credit"],
                            balance_62_tmt_debit=b62["debit"],
                            balance_62_tmt_credit=b62["credit"],
                            balance_75_usd_debit=b75["debit"],
                            balance_75_usd_credit=b75["credit"],
                            balance_76_tmt_debit=b76["debit"],
                            balance_76_tmt_credit=b76["credit"],

                            # Итоги
                            balance_usd=(b60["debit"] - b60["credit"]) + (b75["debit"] - b75["credit"]),
                            balance_tmt=(b62["debit"] - b62["credit"]) + (b76["debit"] - b76["credit"]),
                            balance=Decimal("0.000"),
                        )
                    )

            # 5️⃣ Массовая вставка
            PartnerBalanceSnapshot.objects.bulk_create(snapshots, batch_size=1000)
            print(f"✅ Done. Created {len(snapshots)} snapshots")
        
        recalc_all_partner_snapshots()
        return JsonResponse({"message": "success recalc_all_partner_balance_snapshoots"})
    
    if type_action == "check stock qty and entry qty":
        # faktura prihod 5400
        # AB-60, BOLOR-646 RASTWORITEL 0.5L (20)     + 190 (bylo 331 prishlo 200 stalo 131 adoljno byt 531)
        # AB-62, BOLOR-646 RASTWORITEL 3L (6)        + 120 (bylo 96 prishlo 60 stalo 36 a doljno byt 156)
        # AB-27, AKRENK 1KG WHITE/AK (12)            + 300 (bylo 177 prishlo 300 stalo 177 a doljno byt 477)
        # AB-20, AKRENK 1KG POL (12)                 + 300 (bylo 162 prishlo 300 stalo 162 a doljno byt 462)
        # AB-102, AKRENK 1KG ANTHRACITE (12)         + 120 (bylo 60 prishlo 120 stalo 60 a doljno byt 180)
        # AB-94, AKRENK 1KG GREY/SERY (12)           + 120 (bylo 78 prishlo 120 stalo 78 a doljno byt 198)
        # AB-28, AKRENK 1KG LAK (12)                 + 360 (bylo 0 prishlo 360 stalo 0 a doljno byt 360)
        # AB-48, AKRENK 1KG GOLDEN (12)              + 180 (bylo 0 prishlo 180 stalo 0 a doljno byt 180)
        # AB-51, AKRENK AK-600 20KG PLASTIK EMULSIYA + 0 (prawilno) + 100 (bylo 0 prishlo 100 rashod 100 stalo 0 i doljno byt 0)
        # AB-101, AKBOYA 15KG WHITE/AK               + 0 (prawilno) (bylo 29 prishlo 50 ushlo 50 stalo 29 i doljno byt 29)
        # AB-29, AKRENK 3KG LAK (4)                  + 0 (prawilno) (bylo 0 prishlo 80 stalo 80 i doljno byt 80)
        # AB-85, AKRENK 1KG SUPER TOPAS/POL (12)     + 0 (prawilno) (bylo 0 prishlo 120 stalo 120 i doljno byt 120)
        # AB-72, AKRENK 3KG SUPER TOPAS/POL (4)      + 0 (prawilno) (bylo 0 prishlo 80 rashod 80 stalo 0 i doljno byt 0)
        # AB-71, AKRENK 3KG SUPER WHITE/AK (4)       + 0 (prawilno) (bylo 0 prishlo 80 rashod 80 stalo 0 i doljno byt 0)
        # AB-61, BOLOR-646 RASTWORITEL 1L (20)       + 0 (prawilno) (bylo 319 prishlo 300 stalo 619 i doljno byt 619)
        
        # faktura prihod 5411
        # AB-100, AKBOYA 15KG TOPAS/POL              + 0 (prawilno) (bylo 7 prishlo 50 stalo 57 i doljno byt 57)
        
        # faktura prihod 5416 (poka bez prowodki)    posle prowodki wse prawilnye
        # PS-1099, Emulsiya POLISEM-109, 9 kg        + 0 (prawilno)
        # PS-10945, Emulsiya POLISEM-109, 4.5 kg     + 0 (prawilno)
        # PS-4109, Emulsiya POLISEM-410, 9 kg        + 0 (prawilno)
        # PS-41045, Emulsiya POLISEM-410, 4.5 kg     + 0 (prawilno)
        # PS-11018, Emulsiya POLISEM-110, 18 kg      + 0 (prawilno)
        
        # faktura prihod 5427
        # AB-104, AKRENK 1KG LAK (12)                 + 0 (prawilno)
        check = check_warehouse_integrity([1])
        return JsonResponse({"message": f"check stock qty and entry qty, mismatch count {len(check)}"})
    
    if type_action == "fix stock qty and entry qty":
        with db_transaction.atomic():
            fixed = check_warehouse_integrity([1], fix=True)
        return JsonResponse({"message": f"success fix stock qty and entry qty, fixed count {len(fixed)}"})


    return JsonResponse({"message": "nothing to do"})