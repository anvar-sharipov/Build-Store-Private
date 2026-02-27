from django.urls import path, include
from rest_framework.routers import DefaultRouter

from store.views.adminPanel_views.import_products import *
from store.views.adminPanel_views.import_partners import *
from . views.base_views import *
from . views.entry_views import *
from . views.partner_views import *
from . views.product_views import *
from . views.register_views import *
from . views.query_views import *
from . views.query_views2 import *
from . views.query_views3 import *
from . views import query_views4
from . views import query_views5
from . views import query_views6 
from . views import excel_downloads_views 
from . views import product_cards_views 
from . views import skidka_nasenka_views 
from . views import backend_input_queries_views
from . views import get_product_turnover_history  
from . views import product_turnover_excel  
from . views import get_analiz_prodaj 
from . views import admin_views 
from . views import download_excel_entries_diapazon 
from . views import universal_faktura_filter 
from . views import download_detail_entry
from . views.sale_invoice_views import *
from . views.report_views import *
from . views.utils import *
from . views.invoice_views import *
from . views import download_faktura_views
from . views import download_products_views 
from . views import download_partners_views
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
router.register(r'sales-invoices', SalesInvoiceViewSet, basename='salesinvoice')
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
    path('close_day/', close_day, name='close_day'),
    path('check_day_closed/', check_day_closed, name='check_day_closed'),
    
    path("check-name-unique/", check_name_unique, name="check_name_unique"),
    path("search-products/", search_products, name="search-products"), # dlya poiska producta for free add

    path('price-change-report/', PriceChangeReportView.as_view(), name='price-change-report'),
    path('price-change-report/excel/', PriceChangeExcelDownloadView.as_view(), name='price-change-excel'),
    path('products-download/export-excel/', ProductExportExcelView.as_view(), name='products_export_excel'),
    path('universal_entries/', universal_entries, name='universal_entries'),
    path('get_all_users/', query_views6.get_all_users, name='get_all_users'),

    # dlya poiska baalansa partnera po schetam
    path('partner/<int:partner_id>/entries/', PartnerEntriesView.as_view()),
    
    
    # search
    path("search-agents/", search_agents_view, name="search-agents"),
    path("search-accounts/", search_accounts_view, name="search-accounts"),
    path('get-partner-by-name/', get_partner_by_name_view, name='get-partner-by-name'),
    path('query-partners/', search_partners_view, name='query-partners'),
    path('partner-transaction/', partner_transaction, name='partner-transaction'),
    path('get-osw/', get_osw, name='get-osw'),
    path('get_saldo_for_partner_for_selected_date/', get_saldo_for_partner_for_selected_date, name='get_saldo_for_partner_for_selected_date'),
    path('get_saldo_for_partner_for_selected_date2/', get_saldo_for_partner_for_selected_date2, name='get_saldo_for_partner_for_selected_date2'),
    
    # поиск продукта по id и складу
    path('get-product/', get_product_by_id_and_warehouse, name='get-product'),
    
    # admin
    path("admin-import-products/", import_products, name="admin-import-products"),
    path("admin-import-partners/", import_partners, name="admin-import-partners"),
    path("delete_data/", delete_data, name="delete_data"),
    path("set_partner_to_entry/", admin_views.set_partner_to_entry, name="set_partner_to_entry"),
    path("admin/universal/", admin_views.admin_universal, name="admin_universal"),
    
    # save universal invoice
    path("save-invoice/", save_invoice, name="save_invoice"),
    path('get-invoices/', get_invoices, name='get-invoices'),
    
    path('get_invoices_for_trip/', query_views4.get_invoices_for_trip, name='get_invoices_for_trip'),
    path('get_driver_list/', query_views4.get_driver_list, name='get_driver_list'),
    path('save_trip/', query_views4.save_trip, name='save_trip'),
    path('get_trips/', query_views4.get_trips, name='get_trips'),
    path('get_trip/', query_views4.get_trip, name='get_trip'),
    
    path("get-invoice-data/<int:id>/", get_invoice_data, name="get_invoice_data"),
    path("delete_invoice/<int:id>/", delete_invoice, name="delete_invoice"),
    
    path("transaction_detail/<int:id>/", transaction_detail, name="transaction_detail"),
    path('get_product_for_print_qr/', get_product_for_print_qr, name='get_product_for_print_qr'),
    path('get_margin_date/', get_margin_date, name='get_margin_date'),
    path('set_date_focus/', set_date_focus, name='set_date_focus'),
    
    path('get_account_for_osw2/', get_account_for_osw2, name='get_account_for_osw2'),
    path('get_account_warehouse/', get_account_warehouse, name='get_account_warehouse'),
    path('get_detail_account/', get_detail_account, name='get_detail_account'),
    path('get_detail_account_60_62/', query_views4.get_detail_account_60_62, name='get_detail_account_60_62'),
    # path('get_account_cards_by_partner/<str:account_number>/<str:partner_name>/', query_views4.get_account_cards_by_partner, name='get_account_cards_by_partner'),
    path('get_cards/', get_cards, name='get_cards'),
    path('get_account_cards/<int:id>/', get_account_cards, name='get_account_cards'),
   

    
    path('create_entry/', create_entry, name='create_entry'),
    path('cancel_entry/', cancel_entry, name='cancel_entry'),
    path("update_entry/<int:id>/", update_entry, name="update_entry"), # cancel faktura entry
    path('delete_entry/<int:entry_id>/', delete_entry, name='delete_entry'),
    path('get-entries-without-faktura/', query_views4.get_entries_without_faktura, name='get-entries-without-faktura'),
    
    path('upload_sales_excel_for_analis/', upload_sales_excel_for_analis, name='upload_sales_excel_for_analis'),
    path('upload_sales_excel_for_analis_with_return/', upload_sales_excel_for_analis_with_return, name='upload_sales_excel_for_analis_with_return'),
    
    path("get_transaction_journal/", get_transaction_journal, name="get_transaction_journal"),
    
    path("get-invoice-list/", get_invoice_list, name="get-invoice-list"),
    path("export-invoices-json/", export_invoices_json, name="export-invoices-json"),
    # path("export-invoices-universal/", export_invoices_universal, name="export-invoices-universal"), (ne nujno)
    
    # Эндпоинты для проводок EXPORT IMPORT
    path('get-entries-list/', get_entries_list, name='get_entries_list'),
    path('export-entries-json/', export_entries_json, name='export_entries_json'),
    path('get-accounts-list/', get_accounts_list, name='get_accounts_list'),
    path('get-partners-list/', get_partners_list, name='get_partners_list'),
    
    
    # query_views5
    path('BuhOborotTowarow/', query_views5.BuhOborotTowarow, name='BuhOborotTowarow'),
    path('BuhOborotTowarowExcel/', query_views5.BuhOborotTowarowExcel, name='BuhOborotTowarowExcel'),
    path('BuhOborotTowarowExcelBrand/', query_views5.BuhOborotTowarowExcelBrand, name='BuhOborotTowarowExcelBrand'),
    path('get_active_warehouses/', query_views5.get_active_warehouses, name='get_active_warehouses'),
    path('upload_initial_stock', query_views5.upload_initial_stock, name='upload_initial_stock'),
    path('get_all_products_id_and_name', query_views5.get_all_products_id_and_name, name='get_all_products_id_and_name'),
    path('product_buh_oborot_detail/<int:product_id>/', query_views5.product_buh_oborot_detail, name='product_buh_oborot_detail'),
    
    # query_views6
    path('search-product-for-zakaz-input-search', query_views6.search_product_for_zakaz_input_search, name='search_product_for_zakaz_input_search'),
    path('save_zakaz/', query_views6.save_zakaz, name='save_zakaz'),
    path('zakaz_list/', query_views6.zakaz_list, name='zakaz_list'),
    path('zakaz/<int:id>', query_views6.get_zakaz_data, name='get_zakaz_data'),
    
    # product_cards_views
    path('product_cards', product_cards_views.product_cards, name='product_cards'),
    
    path('skidka_nasenka/', skidka_nasenka_views.skidka_nasenka, name='skidka_nasenka'),
    
    # query for SearchInputWithBackend.jsx
    path('search-partner-for-backend-input-search', backend_input_queries_views.search_partner_for_backend_input_search, name='search-partner-for-backend-input-search'),
    path('search-product-for-backend-input-search', backend_input_queries_views.search_product_for_backend_input_search, name='search-product-for-backend-input-search'),
    path('search-user-for-backend-input-search', backend_input_queries_views.search_user_for_backend_input_search, name='search-user-for-backend-input-search'),
    
    
    
    path('get_sum_for_header', get_sum_for_header, name='get_sum_for_header'),
    
    
    path('download_osw_excel', excel_downloads_views.download_osw_excel, name='download_osw_excel'),
    
    path('get_warehouse_id_and_currency', get_warehouse_id_and_currency, name='get_warehouse_id_and_currency'),
    
    path('download_excel_fakturs_diapazon', download_faktura_views.download_excel_fakturs_diapazon, name='download_excel_fakturs_diapazon'),
    path('download_excel_fakturs_diapazon2', download_faktura_views.download_excel_fakturs_diapazon2, name='download_excel_fakturs_diapazon2'),
    
    path('download_excel_products_diapazon', download_products_views.download_excel_products_diapazon, name='download_excel_products_diapazon'),
    
    path('download_excel_partners_diapazon', download_partners_views.download_excel_partners_diapazon, name='download_excel_partners_diapazon'),
    
    path('get_product_turnover_history', get_product_turnover_history.get_product_turnover_history, name='get_product_turnover_history'),
    path('download_product_turnover_excel/',get_product_turnover_history.download_product_turnover_excel,name='download_product_turnover_excel'
),
    
    path('product_turnover_excel', product_turnover_excel.product_turnover_excel, name='product_turnover_excel'),
    
    path('get_analiz_prodaj', get_analiz_prodaj.get_analiz_prodaj, name='get_analiz_prodaj'),
    
    path('download_excel_entries_diapazon', download_excel_entries_diapazon.download_excel_entries_diapazon, name='download_excel_entries_diapazon'),
    
    
    path('download_detail_entry', download_detail_entry.download_detail_entry, name='download_detail_entry'), 
    
    path('universal_faktura_filter', universal_faktura_filter.universal_faktura_filter, name='universal_faktura_filter'), 
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
]

