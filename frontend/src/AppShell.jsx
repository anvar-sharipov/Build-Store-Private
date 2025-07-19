import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./Components/Header/Header";
import SidebarLeft from "./Components/Sidebar/left/SidebarLeft";
import SidebarRight from "./Components/Sidebar/right/SideRight";
import { ROUTES, ROUTES_RAPORT } from "./routes";
import ProductList from "./Components/Page/Faktura/Faktura";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Harytlar from "./Components/Page/Product/Product";
import Employee from "./Components/Page/Employee/Employee";
import Partner from "./Components/Page/Partner/Partner";
import Agent from "./Components/Page/Agent/Agent";
import PriceChangeReport from "./Components/Page/Reports/PriceChangeReport/PriceChangeReport";
import AddSaleInvoicePage from "./Components/Page/Faktura/SaleInvoice/AddSaleInvoicePage";
import Entries from "./Components/Page/Entries/Entries";
import Account from "./Components/Page/Account/Account";
import AccountReports from "./Components/Page/Reports/Accounts/AccountReport/AccountReports";
import UpdateSaleInvoice from "./Components/Page/Faktura/UpdateSaleInvoice/UpdateSaleInvoice";


import { AuthProvider } from "./AuthContext";
import { SearchProvider } from "./Components/context/SearchContext";

function AppShell() {
  const location = useLocation();
  const isFullScreenPage = location.pathname === "/sale-invoices/new" || location.pathname.includes("/sale-invoices/update");

  return (
    <>
      <Header />
      <AuthProvider>
        <SearchProvider>
          <main
            className={`flex flex-grow gap-4 mt-4 ${
              isFullScreenPage ? "" : "lg:ml-52 lg:mr-72"
            } print:w-full print:block print:mr-4 print:ml-4 print:p-0 print:m-0`}
          >
            {!isFullScreenPage && <SidebarLeft />}

            <section className="flex-grow flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ">
              <Routes>
                <Route path={ROUTES.MAIN} element={<ProductList />} />
                <Route path="/sale-invoices/new" element={<AddSaleInvoicePage /> } />
                <Route path="/sale-invoices/update/:id" element={<UpdateSaleInvoice />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.HARYTLAR} element={<Harytlar />} />
                <Route path={ROUTES.EMPLOYEERS} element={<Employee />} />
                <Route path={ROUTES.PARTNERS} element={<Partner />} />
                <Route path={ROUTES.AGENTS} element={<Agent />} />
                <Route path={ROUTES.ENTRIES} element={<Entries />} />
                <Route path={ROUTES.ACCOUNT} element={<Account />} />
                <Route
                  path={ROUTES_RAPORT.PRICE_CHANGE_REPORT}
                  element={<PriceChangeReport />}
                />
                <Route
                  path={ROUTES_RAPORT.ACCOUNT_REPORTS}
                  element={<AccountReports />}
                />
              </Routes>
            </section>

            {!isFullScreenPage && <SidebarRight />}
          </main>
        </SearchProvider>
      </AuthProvider>
    </>
  );
}

export default AppShell;
