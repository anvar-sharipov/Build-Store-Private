from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.utils.decorators import method_decorator

from django.db.models import F
from django.contrib.postgres.search import TrigramSimilarity
from ..models import Agent, Account, Partner
from icecream import ic


# query agent
@require_GET
def search_agents_view(request):
    query = request.GET.get('q', '')
    ic(query)
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
    ic(query)
    partners = (
        Partner.objects.annotate(similarity=TrigramSimilarity('name', query))
        .filter(similarity__gt=0.1, is_active=True)
        .order_by('-similarity')
    )
    data = [{'id': a.id, 'name': a.name, "type":a.type, "balance":a.balance, "is_active":a.is_active} for a in partners]
    return JsonResponse(data, safe=False)