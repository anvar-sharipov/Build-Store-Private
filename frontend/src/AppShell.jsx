import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./Components/Header/Header";
import SidebarLeft from "./Components/Sidebar/left/SidebarLeft";
import SidebarRight from "./Components/Sidebar/right/SideRight";
import { ROUTES, ROUTES_RAPORT, PROCHEE, ADMIN_PANEL } from "./routes";
import ProductList from "./Components/Page/Faktura/Faktura";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Harytlar from "./Components/Page/Product/Product";
import Employee from "./Components/Page/Employee/Employee";
import Partner from "./Components/Page/Partner/Partner";
import Agent from "./Components/Page/Agent/Agent";
import PriceChangeReport from "./Components/Page/Reports/PriceChangeReport/PriceChangeReport";
import AddSaleInvoicePage from "./Components/Page/Faktura/SaleInvoice/AddSaleInvoicePage";
import UpdateSaleInvoice from "./Components/Page/Faktura/UpdateSaleInvoice/UpdateSaleInvoice";

import { AuthProvider } from "./AuthContext";
import { SearchProvider } from "./Components/context/SearchContext";
import MainPage from "./Components/Page/Faktura/SaleInvoice2/MainPage";
import MainPagePurchase from "./Components/Page/PurchaseInvoice/MainPage";
import Partner2 from "./Components/Page/Partner2/Partner2";
import PartnerTransactionEntry from "./Components/Page/PartnerTransactionEntry/PartnerTransactionEntry";
import ImportProducts from "./Components/Page/Admin/ImportProducts";
import PurchaseInvoice from "./Components/Page/PurchaseInvoice/PurchaseInvoice";
import { DateProvider } from "./Components/UI/DateProvider";
import ImportPartners from "./Components/Page/Admin/ImportPartners";
import DeleteData from "./Components/Page/Admin/DeleteData";
// import Entries from "./Components/Page/Entries/Entries";
import { NotificationProvider } from "./Components/context/NotificationContext";
import ReportsMain from "./Components/Page/Reports2/ReportsMain";
import ProcheeMain from "./Components/Page/Prochee/ProcheeMain";
import QrListPrint from "./Components/Page/Prochee/QrListPrint/QrListPrint";
import OSW2 from "./Components/Page/OSW2/OSW2";
import DetailReport1 from "./Components/Page/OSW2/DetailReport1";
import Entries2 from "./Components/Page/Entries2/Entries2";
import SalesAnalys from "./Components/Page/Reports2/SalesAnalys/SalesAnalys";
import AnalysSalesWithoutReturn from "./Components/Page/Reports2/SalesAnalys/AnalysSalesWithoutReturn";
import AccountCards from "./Components/Page/Reports2/AccountCards/AccountCards";
import AccountCardDetail from "./Components/Page/Reports2/AccountCards/AccountCardDetail";
import TransactionJournal from "./Components/Page/Prochee/TransactionJournal";
import ExportFaktura from "./Components/Page/ExportsImports/ExportImportFaktura/ExportFaktura";
import ExportImportEntries from "./Components/Page/ExportsImports/ExportImportEntries";
import DetailReport6062 from "./Components/Page/OSW2/DetailReport6062";
import DetailReport6062Partner from "./Components/Page/OSW2/DetailReport6062Partner";
import SetPartnerInEntry from "./Components/Page/Admin/SetPartnerInEntry";
import Trip from "./Components/Page/Trip/Trip";

function AppShell() {
  const location = useLocation();
  const isFullScreenPage =
    location.pathname === "/sale-invoices/new" ||
    location.pathname.includes("/sale-invoices/update") ||
    location.pathname.includes("/sale-invoices/create") ||
    location.pathname.includes("/purchase-invoices/update") ||
    location.pathname.includes("/purchase-invoices/create");

  const hideRightBar = location.pathname === "/prochee/qr-list-print" || location.pathname === "/prochee" || location.pathname === "/reports" || location.pathname === "/entries2";
  // console.log("hideRightBar", hideRightBar);
  
  return (
    <>
      <NotificationProvider>
        <DateProvider>
          <AuthProvider>
            <Header />
            <SearchProvider>
              <main className={`flex flex-grow gap-4 mt-4 ${isFullScreenPage ? "" : `lg:ml-52 ${hideRightBar ? "" : "lg:mr-72"}`} print:w-full print:block print:p-0 print:m-0 ${hideRightBar && "lg:mr-0"}`}>
                {!isFullScreenPage && <SidebarLeft />}

                <section className={`flex-grow flex flex-col bg-zinc-50 dark:bg-gray-800 rounded-lg shadow-sm ${isFullScreenPage ? "p-0" : "p-4 print:p-0"}`}>
                  <Routes>
                    <Route path={ROUTES.MAIN} element={<ProductList />} />
                    {/* <Route path="/sale-invoices/new" element={<AddSaleInvoicePage />} />
                    <Route path="/sale-invoices/create" element={<MainPage />} />
                    <Route path="/sale-invoices/update/:id" element={<MainPage />} /> */}
                    {/* <Route path="/sale-invoices/update/:id" element={<UpdateSaleInvoice />} /> */}
                    <Route path={ROUTES.REGISTER} element={<Register />} />
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.HARYTLAR} element={<Harytlar />} />
                    <Route path={ROUTES.EMPLOYEERS} element={<Employee />} />
                    <Route path={ROUTES.PARTNERS_new} element={<Partner2 />} />
                    <Route path={ROUTES.AGENTS} element={<Agent />} />
                    {/* <Route path={ROUTES.ENTRIES} element={<Entries />} /> */}
                    
                    <Route path={ROUTES.REPORTS} element={<ReportsMain />} />
                    <Route path={ROUTES.PROCHEE} element={<ProcheeMain />} />
                    {/* <Route path={ROUTES.ACCOUNT} element={<Account />} /> */}

                    <Route path={ROUTES_RAPORT.PRICE_CHANGE_REPORT} element={<PriceChangeReport />} />

                    <Route path={PROCHEE.PARTNER_TRANSACTION_ENTRY} element={<PartnerTransactionEntry />} />
                    <Route path={PROCHEE.ENTRIES2} element={<Entries2 />} />
                    {/* <Route path={PROCHEE.OSW} element={<OSW />} /> */}
                    <Route path={ROUTES_RAPORT.OSW2} element={<OSW2 />} />
                    <Route path={ROUTES_RAPORT.SALES_ANALIS} element={<SalesAnalys />} />
                    <Route path={ROUTES_RAPORT.SALES_ANALIS_WITHOUT_RETURN} element={<AnalysSalesWithoutReturn />} />
                    <Route path={ROUTES_RAPORT.ACOOUNT_CARDS} element={<AccountCards />} />
                    <Route path={ROUTES_RAPORT.ACCOUNT_CARDS_DETAIL} element={<AccountCardDetail />} />

                    <Route path={ROUTES_RAPORT.DETAIL_REPORT_1} element={<DetailReport1 />} />
                    <Route path={ROUTES_RAPORT.DETAIL_ACCOUNT_REPORT_60_62} element={<DetailReport6062 />} />
                    <Route path={ROUTES_RAPORT.DETAIL_ACCOUNT_REPORT_60_62_PARTNER} element={<DetailReport6062Partner />} />
                    <Route path={PROCHEE.QR_LIST_PRINT} element={<QrListPrint />} />
                    <Route path={PROCHEE.TRANSACTION_JOURNAL} element={<TransactionJournal />} />
                    <Route path={PROCHEE.TRIP} element={<Trip />} />
      

                    {/* PurchaseInvoice */}
                    <Route path={ROUTES.PURCHASEINVOICE} element={<PurchaseInvoice />} />
                    <Route path={ROUTES.PURCHASE_INVOICE_CREATE} element={<MainPagePurchase />} />
                    <Route path={ROUTES.PURCHASE_INVOICE_UPDATE} element={<MainPagePurchase />} />

                    {/* Export import */}
                    <Route path={PROCHEE.EXPORT_FAKTURA} element={<ExportFaktura />} />
                    <Route path={PROCHEE.EXPORT_IMPORT_ENTRIES} element={<ExportImportEntries />} />


                    {/* adminPanel */}
                    <Route path={ADMIN_PANEL.IMPORT_PRODUCTS} element={<ImportProducts />} />
                    <Route path={ADMIN_PANEL.IMPORT_PARTNERS} element={<ImportPartners />} />
                    <Route path={ADMIN_PANEL.DELETE_MODELS} element={<DeleteData />} />
                    <Route path={ADMIN_PANEL.SET_PARTNER_TO_ENTRY} element={<SetPartnerInEntry />} />
                  </Routes>
                </section>

                {!isFullScreenPage && <SidebarRight />}
                {/* {!hideRightBar && <SidebarRight />} */}
              </main>
            </SearchProvider>
          </AuthProvider>
        </DateProvider>
      </NotificationProvider>
    </>
  );
}

export default AppShell;
