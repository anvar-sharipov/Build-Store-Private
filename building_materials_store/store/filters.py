from django.db.models import Case, When, Value, IntegerField, Q
from django.contrib.postgres.search import TrigramSimilarity
import django_filters
from .models import *
from icecream import ic
import re


# Для фильтрации по списку значений (например, ?categories=1,2)
class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass

class ProductFilter(django_filters.FilterSet):
    categories = NumberInFilter(field_name='category__id', lookup_expr='in')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    brands = NumberInFilter(field_name='brand__id', lookup_expr='in')
    models = NumberInFilter(field_name='model__id', lookup_expr='in')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    
    tags = NumberInFilter(field_name='tags__id', lookup_expr='in', label='Теги')

    wholesale_price_min = django_filters.NumberFilter(field_name='wholesale_price', lookup_expr='gte')
    wholesale_price_max = django_filters.NumberFilter(field_name='wholesale_price', lookup_expr='lte')

    quantity_min = django_filters.NumberFilter(field_name='total_quantity2', lookup_expr='gte')
    quantity_max = django_filters.NumberFilter(field_name='total_quantity2', lookup_expr='lte')

    retail_price_min = django_filters.NumberFilter(field_name='retail_price', lookup_expr='gte')
    retail_price_max = django_filters.NumberFilter(field_name='retail_price', lookup_expr='lte')

    warehouse = NumberInFilter(field_name='warehouse_products__warehouse_id', lookup_expr='in', label='Склад')

    # def filter_by_warehouse(self, queryset, name, value):
    #     if not value:
    #         return queryset
    #     # Фильтруем продукты, у которых есть остаток на указанном складе
    #     return queryset.filter(warehouse_products__warehouse_id=value)

    ordering = django_filters.OrderingFilter(
        fields=(
            ('wholesale_price', 'wholesale_price'),
            ('retail_price', 'retail_price'),
            ('total_quantity2', 'total_quantity2'),
            ('name', 'name'),
        ),
    )

    # 🔍 Добавляем общий search
    search = django_filters.CharFilter(method='filter_search')


    
    # def filter_search(self, queryset, name, value):
    #     if not value:
    #         return queryset

    #     value = value.strip()

    #     return queryset.annotate(
    #         rank=Case(
    #             When(name__iexact=value, then=Value(1)),      # точное совпадение
    #             When(name__istartswith=value, then=Value(2)), # начинается с value
    #             When(name__icontains=value, then=Value(3)),   # содержит value
    #             default=Value(4),
    #             output_field=IntegerField()
    #         ),
    #         similarity=TrigramSimilarity('name', value)
    #     ).filter(
    #         Q(name__icontains=value) | Q(similarity__gt=0.1)
    #     ).order_by('rank', '-similarity')
    
    # def filter_search(self, queryset, name, value):
    #     ic("reeeee")
    #     if not value:
    #         return queryset

    #     value = value.strip()

    #     return queryset.annotate(
    #         rank=Case(
    #             When(name__iexact=value, then=Value(1)),
    #             When(name__istartswith=value, then=Value(2)),
    #             When(name__icontains=value, then=Value(3)),
    #             default=Value(4),
    #             output_field=IntegerField()
    #         )
    #     ).filter(
    #         name__icontains=value
    #     ).order_by('rank', 'name')

    # class Meta:
    #     model = Product
    #     fields = []
    
    # def filter_search(self, queryset, name, value):
    #     if not value:
    #         return queryset

    #     # нормализация
    #     value = value.lower().strip()
    #     value = value.replace("d.", "")
    #     value = re.sub(r"[^\w\s]", " ", value)
    #     words = value.split()
    #     ic("ewewe")

    #     if not words:
    #         return queryset

    #     # AND поиск по каждому слову
    #     q = Q()
    #     for word in words:
    #         q &= Q(name__icontains=word)

    #     return (
    #         queryset
    #         .annotate(
    #             rank=Case(
    #                 When(name__icontains=value, then=Value(1)),
    #                 When(name__istartswith=value, then=Value(2)),
    #                 When(name__iexact=value, then=Value(3)),
    #                 default=Value(4),
    #                 output_field=IntegerField(),
    #             )
    #         )
    #         .filter(q)
    #         .order_by("rank", "name")
    #     )
    
    def filter_search(self, queryset, name, value):
       
        if not value:
            return queryset

        raw_value = value.strip()
        norm_value = raw_value.lower()
        norm_value = re.sub(r"[^\w\s/-]", "", norm_value)

        words = norm_value.replace("-", " ").split()

        # q = Q()
        # for word in words:
        #     q &= Q(name__icontains=word)
        
        q = Q()
        for word in words:
            q |= Q(name__icontains=word)

        return (
            queryset
            .annotate(
                rank=Case(
                    # 1️⃣ точное совпадение
                    When(name__iexact=raw_value, then=Value(1)),

                    # 2️⃣ начинается с ab-3
                    When(name__istartswith=raw_value, then=Value(2)),

                    # 3️⃣ содержит ab-3
                    When(name__icontains=raw_value, then=Value(3)),

                    # 4️⃣ просто подходит по словам
                    default=Value(4),
                    output_field=IntegerField(),
                )
            )
            .filter(q)
            .order_by("rank", "name")
        )
       



class SalesInvoiceFilter(django_filters.FilterSet):
    isEntry = django_filters.BooleanFilter(field_name='isEntry')

    search = django_filters.CharFilter(method='filter_search')

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        filters = Q()

        # Если значение — число, ищем по id (номер накладной)
        if value.isdigit():
            filters |= Q(id=int(value))

        # Поиск по имени покупателя через триграммы (или можно заменить на icontains)
        queryset = queryset.annotate(
            similarity=TrigramSimilarity('buyer__name', value)
        )
        filters |= Q(similarity__gt=0.1)

        return queryset.filter(filters).order_by('-similarity')

    class Meta:
        model = SalesInvoice
        fields = ['isEntry']

    
class PartnerFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    is_active = django_filters.BooleanFilter()
    type = django_filters.CharFilter(lookup_expr='iexact')
    agent = django_filters.NumberFilter(field_name='agent_id')

    class Meta:
        model = Partner
        fields = ['is_active', 'type', 'agent']
    
    # def filter_search(self, queryset, name, value):
    #     print("fdfdfdfd")
    #     return queryset.annotate(similarity=TrigramSimilarity('name', value)) \
    #         .filter(similarity__gt=0.1)
    
    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        value = value.strip()

        return queryset.filter(name__icontains=value).order_by("name")