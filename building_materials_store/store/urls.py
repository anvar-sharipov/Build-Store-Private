from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . views.base_views import *
from . views.entry_views import *
from . views.partner_views import *
from . views.product_views import *
from . views.purchase_invoice_views import *
from . views.register_views import *
from . views.sale_invoice_views import *
from . views.report_views import *
from . views.utils import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView



router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'agents', AgentViewSet)
router.register(r'employeers', EmployeeViewSet)
router.register(r'partners', PartnerViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'units', UnitOfMeasurementViewSet, basename='unit')
router.register(r'categories', CategoryViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'models', ModelViewSet)
router.register(r'tags', TagViewSet)
router.register(r'product-images', ProductImageViewSet)
router.register(r'product-units', ProductUnitViewSet)
# router.register(r'currencys', CurrencyViewSet)

# faktura START
router.register(r'purchase-invoices', PurchaseInvoiceViewSet, basename='purchaseinvoice')
router.register(r'sales-invoices', SalesInvoiceViewSet, basename='salesinvoice')
router.register(r'purchase-return-invoices', PurchaseReturnInvoiceViewSet, basename='purchasereturninvoice')
# router.register(r'sales-return-invoices', SalesReturnInvoiceViewSet, basename='salesreturninvoice')
# faktura END

# Entries START
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'entries', EntryViewSet)
router.register(r'warehouses', WarehouseViewSet)
# router.register(r'currencies', CurrencyViewSet)
# router.register(r'currency-rates', CurrencyRateViewSet)
# Entries START

# path('groups/', GroupViewSet.as_view()),

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    # path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('suppliers/', suppliers_list, name='suppliers_list'),
    path('user/', current_user),
    path('userinfo/', MySecureView.as_view()),
    path('assign-partners/', AssignPartnersToAgentView.as_view(), name='assign_partners'),

    path("check-name-unique/", check_name_unique, name="check_name_unique"),
    path("search-products/", search_products, name="search-products"), # dlya poiska producta for free add

    path('price-change-report/', PriceChangeReportView.as_view(), name='price-change-report'),
    path('price-change-report/excel/', PriceChangeExcelDownloadView.as_view(), name='price-change-excel'),
    path('products-download/export-excel/', ProductExportExcelView.as_view(), name='products_export_excel'),

    # dlya poiska baalansa partnera po schetam
    path('partner/<int:partner_id>/entries/', PartnerEntriesView.as_view()),
]

