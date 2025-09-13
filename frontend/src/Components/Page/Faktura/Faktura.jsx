import { useTranslation } from "react-i18next";
import FakturaAddAndSearchSection from "./sections/FakturaAddAndSearchSection";
import { useState, useEffect, useRef } from "react";
import SearchInputLikeRezka from "../../UI/SearchInputLikeRezka";
import myAxios from "../../axios";
import MyLoading from "../../UI/MyLoading";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { myClass } from "../../tailwindClasses";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Notification from "../../Notification";

const Faktura = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  const addSalesIconRef = useRef(null);
  const searchInputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const searchQueryFromURL = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchQueryFromURL);

  const listItemRefs = useRef([]);

  const isEntry = searchParams.get("isEntry");

  const [invoices, setInvoices] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [page, setPage] = useState(1); // текущая страница

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };
  const location = useLocation();
  useEffect(() => {
    if (location.state?.notification) {
      showNotification(location.state.notification, "success");
    }
  }, [location.state]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Insert") {
        e.preventDefault();
        navigate("/sale-invoices/create");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const params = {
          page: page,
        };

        if (isEntry !== null && isEntry !== "") {
          params.isEntry = isEntry;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim(); // или другое имя, если у тебя на бэке не `search`
        }
        // console.log("params", params);

        const res = await myAxios.get("sales-invoices/", { params });

        setInvoices(res.data.results);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
      } catch (error) {
        console.error("Ошибка при загрузке накладных", error);
      } finally {
        setLoading(false);

        // console.log('invoices', invoices);
      }
    };

    fetchInvoices();
  }, [page, searchQuery, isEntry]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1); // Сброс на первую страницу

    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  useEffect(() => {
    document.title = t("sales_invoice");
    searchInputRef.current?.focus();
  }, [t]);

  return (
    <div>
      <FakturaAddAndSearchSection
        t={t}
        addSalesIconRef={addSalesIconRef}
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchChange={handleSearchChange}
        listItemRefs={listItemRefs}
        invoices={invoices}
      />
      {loading ? (
        <MyLoading />
      ) : (
        <div>
          <div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-sm overflow-hidden">
              <ul className="divide-y divide-gray-900 dark:divide-gray-600 mt-2 space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-black dark:border-gray-700/50 backdrop-blur-sm p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent transition-all duration-300">
                {invoices.map((invoice, index) => (
                  <li
                    key={invoice.id}
                    className="flex justify-between px-2 py-0 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:bg-yellow-100 dark:focus:bg-yellow-500/20 transition-colors cursor-pointer gap-2"
                    ref={(el) => (listItemRefs.current[index] = el)}
                    tabIndex={0}
                    // onClick={() => setFocusedIndex(index)}
                    onDoubleClick={() => {
                      navigate(`/sale-invoices/update/${invoice.id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        e.preventDefault();
                        // setOpenDeleteModal({ open: true, data: item, index });
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        // navigate(`/sale-invoices/update/${invoice.id}`);
                        navigate(`/sale-invoices/update/${invoice.id}`);
                        // setOpenPartnerListModal({
                        //   open: true,
                        //   data: item,
                        //   index,
                        // });
                      } else if (e.key === " ") {
                        e.preventDefault();
                        // setOpenEditModal({ open: true, data: item, index });
                      } else if (e.key === "ArrowDown" && index + 1 < invoices.length) {
                        e.preventDefault();
                        listItemRefs.current[index + 1]?.focus();
                      } else if (e.key === "ArrowUp" && index !== 0) {
                        e.preventDefault();
                        listItemRefs.current[index - 1]?.focus();
                      } else if (e.key === "ArrowUp" && index === 0) {
                        e.preventDefault();
                        searchInputRef.current?.focus();
                      }
                      //  else if (
                      //   e.key === "ArrowDown" &&
                      //   index + 1 === invoices.length
                      // ) {
                      //   e.preventDefault();
                      //   loadMoreButtonRef.current?.focus();
                      // }
                    }}
                  >
                    {/* <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{index + 1}.</div> */}
                    <div className="flex items-center gap-3 font-medium text-gray-800 dark:text-gray-200 truncate">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{index + 1}.</div>
                      {invoice.buyer?.name}
                    </div>
                    <div className="flex gap-1 justify-end">
                      {invoice.isEntry ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <FaCheckCircle className="text-green-600" /> проведена
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1">
                          <FaTimesCircle className="text-red-500" /> не проведена
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 mt-4">
              <button onClick={() => setPage((prev) => prev - 1)} disabled={!prevPage} className="bg-gray-200 dark:bg-gray-700 dark:text-white px-3 py-1 rounded">
                ⬅ Назад
              </button>
              <button onClick={() => setPage((prev) => prev + 1)} disabled={!nextPage} className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded">
                Вперёд ➡
              </button>
            </div>
          </div>
        </div>
      )}
      <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
    </div>
  );
};

export default Faktura;
