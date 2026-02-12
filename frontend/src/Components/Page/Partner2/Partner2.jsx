import myAxios from "../../axios";
import { Formik, Form, Field } from "formik";
import MyModal from "../../UI/MyModal";
import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import MyButton from "../../UI/MyButton";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Notification from "../../Notification";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import Head from "./Head";
import PartnerModal from "./PartnerModal";
import MyLoading from "../../UI/MyLoading";
import { myClass } from "../../tailwindClasses";
import List from "./List";

const Partner2 = () => {
  const [openModal, setOpenModal] = useState(false);
  const searchInputRef = useRef(null);
  const createButtonRef = useRef(null);
  const { t } = useTranslation();
  const { id } = useParams();
  const [partners, setPartners] = useState([]);
  const partnersListRefs = useRef([]);
  const paginationBtnRefs = useRef([]);

  // paginations i query
  const [searchParams] = useSearchParams();

  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");



  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 100;
  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    document.title = t("partners");
  }, []);

  

  // dlya focus posle update i create na partenra
  const [focusedPartnerId, setFocusedPartnerId] = useState(null);
  const [focusedPartnerIndex, setFocusedPartnerIndex] = useState(null);

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    const queryFromUrl = searchParams.get("search") || "";
    setPage(pageFromUrl);
    setQuery(queryFromUrl);
  }, [searchParams]);

  // useEffect(() => {
  //   if (!openModal && !focusedPartnerId) {
  //     searchInputRef.current?.focus();
  //   }
  //   setPartnerValue;
  // }, [openModal]);

  // dlya pokaza search i page w url
  const navigate = useNavigate();
  const location = useLocation();
  // Обновляем URL при изменении page или query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
 

    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", page);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [page, query, navigate, location.pathname]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, [page]);

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Обновленная функция fetchPartners с поддержкой фильтров
  // Замените функцию fetchPartners в Partner2.jsx:

  const fetchPartners = async (page = 1, search = "") => {
    setLoading(true);
    try {
      // Собираем все параметры из URL
      const params = new URLSearchParams();

      // Основные параметры
      params.set("page", page);
      params.set("page_size", pageSize);
      if (search) {
        params.set("search", search);
      }

      // Фильтры из URL
      const type = searchParams.get("type");
      const isActive = searchParams.get("is_active");
      const agent = searchParams.get("agent");
      const sort = searchParams.get("sort");


      if (type && type !== "all") {
        params.set("type", type);
      }

      if (isActive && isActive !== "all") {
        params.set("is_active", isActive);
      }

      if (agent && agent !== "all") {
        params.set("agent", agent);
      }

      // ✅ ИСПРАВЛЕНИЕ: передаём параметр sort как есть
      if (sort) {
        params.set("sort", sort);
     
      }

  

      const res = await myAxios.get(`partners/?${params.toString()}`);
   

      setPartners(res.data.results);
      setCount(res.data.count);
      setNext(res.data.next);
      setPrevious(res.data.previous);
    } catch (error) {
      console.error("❌ Ошибка при получении партнёров", error);
      showNotification("Ошибка при получении партнёров", "error");
    } finally {
      setLoading(false);
    }
  };

  // Обновляем данные при изменении любых параметров URL
  useEffect(() => {
    fetchPartners(page, query);
  }, [page, query, searchParams.get("type"), searchParams.get("is_active"), searchParams.get("agent"), searchParams.get("sort")]);

  // Функция для проверки уникальности имени (можно вынести в отдельный utils файл)
  const checkNameExists = async (name) => {
    if (!name || !name.trim()) return false;

    try {
      const res = await myAxios.get(`/get-partner-by-name?name=${encodeURIComponent(name.trim())}`);
      return res.data.exists;
    } catch (err) {
      console.error("Ошибка при проверке уникальности имени", err);
      // В случае ошибки API, считаем что имя уникально (или можно вернуть true для безопасности)
      return false;
    }
  };

  const PartnerSchema = Yup.object().shape({
    name: Yup.string()
      .required("Введите имя партнёра")
      .min(1, "Имя не может быть пустым")
      .max(255, "Имя слишком длинное")
      .trim("Имя не может содержать пробелы в начале или конце")
      .test("unique-name", "Такой партнёр уже существует", async function (value) {
        // Пропускаем проверку если значение пустое (это обработает required)
        if (!value || !value.trim()) {
          return true;
        }

        // Если это редактирование существующего партнера, пропускаем проверку
        // если имя не изменилось
        if (this.parent.originalName && this.parent.originalName === value.trim()) {
          return true;
        }

        const exists = await checkNameExists(value);
        return !exists;
      }),

    // balance: Yup.number().typeError("Баланс должен быть числом").required("Введите начальный баланс").min(0, "Баланс не может быть отрицательным"),

    // accounts_id: Yup.array()
    //   .of(Yup.number().typeError("ID счета должен быть числом"))
    //   .min(1, "Выберите хотя бы один счет"),

    // type: Yup.string()
    //   .required("Выберите тип партнёра")
    //   .oneOf(["buyer", "founder", "other"], "Недопустимый тип"),
  });

  // for update
  const [updateMode, setUpdateMode] = useState(false);
  const [partnerValue, setPartnerValue] = useState(null);

  useEffect(() => {
    if (!updateMode) {
      setPartnerValue({
        name: "",
        balance: 0,
        balance_usd: 0,
        balance_tmt: 0,
        accounts_id: [],
        type: "klient",
        agent: null,
        is_active: true,
        create: true,
      });
    }
  }, [updateMode]);

  return (
    <div>
      <Head
        setOpenModal={setOpenModal}
        openModal={openModal}
        searchInputRef={searchInputRef}
        setQuery={setQuery}
        query={query}
        createButtonRef={createButtonRef}
        page={page}
        fetchPartners={fetchPartners}
        setPage={setPage}
        partnersListRefs={partnersListRefs}
        partners={partners}
        setUpdateMode={setUpdateMode}
        count={count}

        inputValue={inputValue}
        setInputValue={setInputValue}
      />
      {openModal && (
        <PartnerModal
          PartnerSchema={PartnerSchema}
          partnerValue={partnerValue}
          setOpenModal={setOpenModal}
          setPartners={setPartners}
          setFocusedPartnerId={setFocusedPartnerId}
          openModal={openModal}
          focusedPartnerId={focusedPartnerId}
          setFocusedPartnerIndex={setFocusedPartnerIndex}
          focusedPartnerIndex={focusedPartnerIndex}
          partnersListRefs={partnersListRefs}
        ></PartnerModal>
      )}
      {loading ? (
        <MyLoading />
      ) : (
        <List
          partners={partners}
          totalPages={totalPages}
          myClass={myClass}
          setPage={setPage}
          page={page}
          partnersListRefs={partnersListRefs}
          paginationBtnRefs={paginationBtnRefs}
          searchInputRef={searchInputRef}
          openModal={openModal}
          setOpenModal={setOpenModal}
          setUpdateMode={setUpdateMode}
          setPartnerValue={setPartnerValue}
          focusedPartnerId={focusedPartnerId}
          setFocusedPartnerId={setFocusedPartnerId}
          setFocusedPartnerIndex={setFocusedPartnerIndex}
          focusedPartnerIndex={focusedPartnerIndex}
        />
      )}

      <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
    </div>
  );
};

export default Partner2;
