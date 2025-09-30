import { useTranslation } from "react-i18next";
import Head from "./Utils/Head";
import invoiceClasses from "./Utils/classes";
import myAxios from "../../axios";
import { useEffect, useRef, useState } from "react";
import InvoiceList from "./InvoiceList";
import InvoiceFilter from "../../Sidebar/right/filters/InvoiceFilter/InvoiceFilter";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../../routes";

const PurchaseInvoice = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // const [query, setQuery] = useState("");
  const [query, setQuery] = useState(() => searchParams.get("query") || "");

  // useEffect(() => {
  //   if (!searchParams.get("page")) {
  //     setSearchParams({ page: 1 }); // 👉 добавит page=1 в URL
  //   }
  // }, [searchParams, setSearchParams]);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    total: 0,
  });

  // const [filters, setFilters] = useState({});

  const mainRefs = {
    searchInputRef: useRef(null),
    listRefs: useRef({}),
  };

  const fetchInvoices = async (append = false, page = pagination.page) => {
    if (loading) return; // защита от двойных запросов
    setLoading(true);
    try {
      const params = Object.fromEntries([...searchParams]);
      params.page = page;
      params.page_size = pagination.pageSize;

      const query = new URLSearchParams(params).toString();

      const res = await myAxios.get(`get-invoices/?${query}`);

      if (append) {
        setInvoices((prev) => [...prev, ...res.data.invoices]);
      } else {
        // очистить список для плавной анимации
        setInvoices([]);
        setTimeout(() => {
          setInvoices(res.data.invoices);
        }, 50); // задержку можно подкорректировать
      }

      setPagination({
        page: res.data.page,
        totalPages: res.data.total_pages,
        total: res.data.total,
        pageSize: res.data.page_size,
      });
    } catch (err) {
      console.error("searchparams error ====", err);
    } finally {
      setLoading(false);
      if (!append) {
        mainRefs.searchInputRef?.current.focus();
      }
    }
  };

  useEffect(() => {
    // Каждый раз при изменении фильтров из URL — перезагружаем список
    fetchInvoices(false);
  }, [searchParams]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams); // клонируем

    if (query) {
      newParams.set("query", query);
    } else {
      newParams.delete("query");
    }
    setSearchParams(newParams); // именно это триггерит обновление
  }, [query, setSearchParams]);

  // // подгрузка при скролле вниз
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

      if (scrollHeight - scrollTop <= clientHeight + 50 && !loading) {
        if (pagination.page < pagination.totalPages) {
          fetchInvoices(true, pagination.page + 1); // подгружаем следующую страницу
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pagination, loading, searchParams]);

  const handleOpenInvoice = (id) => {
    if (id) {
      navigate(`/purchase-invoices/update/${id}`);
    } else {
      navigate(ROUTES.PURCHASE_INVOICE_CREATE);
    }
  };

  return (
    <div>
      <Head mainRefs={mainRefs} handleOpenInvoice={handleOpenInvoice} setQuery={setQuery} query={query} invoices={invoices} />

      <InvoiceList invoices={invoices} mainRefs={mainRefs} handleOpenInvoice={handleOpenInvoice} pagination={pagination} />

      {loading && <p className="text-center p-4">Загрузка...</p>}
    </div>
  );
};

export default PurchaseInvoice;
