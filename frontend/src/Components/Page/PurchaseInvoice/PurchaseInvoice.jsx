import { useTranslation } from "react-i18next";
import Head from "./Utils/Head";
import invoiceClasses from "./Utils/classes";
import myAxios from "../../axios";
import { useEffect, useRef, useState, useContext } from "react";
import InvoiceList from "./InvoiceList";
import InvoiceFilter from "../../Sidebar/right/filters/InvoiceFilter/InvoiceFilter";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../../routes";
import { DateContext } from "../../UI/DateProvider";
import { useNotification } from "../../context/NotificationContext";
import { AuthContext } from "../../../AuthContext";

const PurchaseInvoice = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dayIsClosed, setDayIsClosed] = useState(false);
  const [lastDayIsNotClosed, setLastDayIsNotClosed] = useState(false);
  const navigate = useNavigate();
  // const [query, setQuery] = useState("");
  const [query, setQuery] = useState(() => searchParams.get("query") || "");



  const { dateProwodok } = useContext(DateContext);

  const { authUser, authGroup } = useContext(AuthContext);


  useEffect(() => {
    document.title = `${t("faktura")}`; // название вкладки
  }, []);

  useEffect(() => {
    const checkDate = async () => {
      try {
        const res = await myAxios.get("check_day_closed", {
          params: { date: dateProwodok },
        });
        setDayIsClosed(res.data.is_closed);
        setLastDayIsNotClosed(res.data.last_day_not_closed);
      } catch (error) {
        console.error(error);
      }
    };

    if (dateProwodok) {
      checkDate();
    }
  }, [dateProwodok]);

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
        }, 30); // задержку можно подкорректировать
      }
      // console.log("total", res.data.total);
      
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

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      return; // ⛔ ждём, пока фильтры появятся в URL
    }

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

  const sound_open_faktura = new Audio("/sounds/open_faktura.mp3");
  const handleOpenInvoice = (id) => {
    sound_open_faktura.currentTime = 0;
    sound_open_faktura.play();


    if (id) {
      navigate(`/purchase-invoices/update/${id}`);
    } else {
      if (dayIsClosed) {
        showNotification(t("day is closed"), "error");
      } else if (lastDayIsNotClosed) {
        showNotification(t("last day is not is closed"), "error");
      } else if (authGroup !== "admin") {
        showNotification(t("permission denied"), "error");
      } else {
        navigate(ROUTES.PURCHASE_INVOICE_CREATE);
      }
    }
  };

  return (
    <div>
      <Head mainRefs={mainRefs} handleOpenInvoice={handleOpenInvoice} setQuery={setQuery} query={query} invoices={invoices} pagination={pagination} />

      <InvoiceList invoices={invoices} mainRefs={mainRefs} handleOpenInvoice={handleOpenInvoice} pagination={pagination} />

      {loading && <p className="text-center p-4">Загрузка...</p>}
    </div>
  );
};

export default PurchaseInvoice;
