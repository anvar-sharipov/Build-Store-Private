# views.py
import openpyxl
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from icecream import ic
from ...models import Partner
from decimal import Decimal, InvalidOperation
from django.db import transaction

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def import_partners(request):
    excel = request.FILES.get("file")

    if not excel:
        return Response({"detail": "Файл не получен."}, status=status.HTTP_400_BAD_REQUEST)

    if not (excel.name.lower().endswith(".xlsx") or excel.name.lower().endswith(".xls")):
        return Response({"detail": "Поддерживаются только .xlsx или .xls."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        wb = openpyxl.load_workbook(excel, data_only=True)
        sheet = wb.active

        imported = []

        try:
            with transaction.atomic():
                for idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
                    # id = row[0]
                    name = row[1]
                    type_ = row[3]
                    is_active = row[4]
                    balance = row[5]

                    # --- ВАЛИДАЦИЯ ---
                    if not name or str(name).strip() == "":
                        raise ValueError("name_cant_be_empty")

                    if type_ not in ["founder", "klient"]:
                        raise ValueError("type_invalid")

                    if not isinstance(is_active, bool):
                        raise ValueError("is_active_invalid")

                    if balance is None:
                        raise ValueError("balance_cant_be_empty")

                    try:
                        balance = Decimal(balance)
                    except (InvalidOperation, TypeError):
                        raise ValueError("balance_not_digit")
                
                    # --- СОХРАНЕНИЕ ---
                    try:
                        partner = Partner.objects.get(name=name)
                        # partner.name = name
                        partner.type = type_
                        partner.is_active = is_active
                        partner.balance = balance
                        partner.save()
                    except Partner.DoesNotExist:
                        partner = Partner.objects.create(
                            name=name,
                            type=type_,
                            is_active=is_active,
                            balance=balance,
                        )

                    imported.append({
                        "id": partner.id,
                        "name": partner.name,
                        "type": partner.type,
                        "is_active": partner.is_active,
                        "balance": str(partner.balance),
                    })

            return Response(
                {"detail": f"Импортировано {len(imported)} партнёров", "rows": imported[:5]},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            # Любая ошибка → откат всей транзакции
            return Response({'detail': f'{e}'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        ic(f"Ошибка обработки файла: {e}")
        return Response({"detail": f"Ошибка обработки файла: {e}"}, status=status.HTTP_400_BAD_REQUEST)
