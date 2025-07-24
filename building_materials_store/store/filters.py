from django.db.models import Q, Func, F, Value
from django.contrib.postgres.search import TrigramSimilarity
import django_filters
from .models import *

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

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        return queryset.annotate(
            similarity=TrigramSimilarity('name', Func(Value(value), function='CAST', template='%(function)s(%(expressions)s AS TEXT)'))
        ).filter(similarity__gt=0.1).order_by('-similarity')

    class Meta:
        model = Product
        fields = []



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
