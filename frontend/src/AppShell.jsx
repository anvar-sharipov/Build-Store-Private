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
import OSW from "./Components/Page/OSW/OSW";
import ImportProducts from "./Components/Page/Admin/ImportProducts";
import PurchaseInvoice from "./Components/Page/PurchaseInvoice/PurchaseInvoice";
import { DateProvider } from "./Components/UI/DateProvider";
import ImportPartners from "./Components/Page/Admin/ImportPartners";

function AppShell() {
  const location = useLocation();
  const isFullScreenPage =
    location.pathname === "/sale-invoices/new" ||
    location.pathname.includes("/sale-invoices/update") ||
    location.pathname.includes("/sale-invoices/create") ||
    location.pathname.includes("/purchase-invoices/update") ||
    location.pathname.includes("/purchase-invoices/create");

  return (
    <>
      <DateProvider>
        <Header />

        <AuthProvider>
          <SearchProvider>
            <main className={`flex flex-grow gap-4 mt-4 ${isFullScreenPage ? "" : "lg:ml-52 lg:mr-72"} print:w-full print:block print:p-0 print:m-0`}>
              {!isFullScreenPage && <SidebarLeft />}

              <section className={`flex-grow flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm ${isFullScreenPage ? "p-0" : "p-4"}`}>
                <Routes>
                  <Route path={ROUTES.MAIN} element={<ProductList />} />
                  <Route path="/sale-invoices/new" element={<AddSaleInvoicePage />} />
                  <Route path="/sale-invoices/create" element={<MainPage />} />
                  <Route path="/sale-invoices/update/:id" element={<MainPage />} />
                  {/* <Route path="/sale-invoices/update/:id" element={<UpdateSaleInvoice />} /> */}
                  <Route path={ROUTES.REGISTER} element={<Register />} />
                  <Route path={ROUTES.LOGIN} element={<Login />} />
                  <Route path={ROUTES.HARYTLAR} element={<Harytlar />} />
                  <Route path={ROUTES.EMPLOYEERS} element={<Employee />} />
                  <Route path={ROUTES.PARTNERS_new} element={<Partner2 />} />
                  <Route path={ROUTES.AGENTS} element={<Agent />} />
                  {/* <Route path={ROUTES.ENTRIES} element={<Entries />} /> */}
                  {/* <Route path={ROUTES.ACCOUNT} element={<Account />} /> */}

                  <Route path={ROUTES_RAPORT.PRICE_CHANGE_REPORT} element={<PriceChangeReport />} />

                  <Route path={PROCHEE.PARTNER_TRANSACTION_ENTRY} element={<PartnerTransactionEntry />} />
                  <Route path={PROCHEE.OSW} element={<OSW />} />

                  {/* PurchaseInvoice */}
                  <Route path={ROUTES.PURCHASEINVOICE} element={<PurchaseInvoice />} />
                  <Route path={ROUTES.PURCHASE_INVOICE_CREATE} element={<MainPagePurchase />} />
                  <Route path={ROUTES.PURCHASE_INVOICE_UPDATE} element={<MainPagePurchase />} />

                  {/* adminPanel */}
                  <Route path={ADMIN_PANEL.IMPORT_PRODUCTS} element={<ImportProducts />} />
                  <Route path={ADMIN_PANEL.IMPORT_PARTNERS} element={<ImportPartners />} />
                </Routes>
              </section>

              {!isFullScreenPage && <SidebarRight />}
            </main>
          </SearchProvider>
        </AuthProvider>
      </DateProvider>
    </>
  );
}

export default AppShell;
