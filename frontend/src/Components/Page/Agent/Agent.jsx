import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import myAxios from "../../axios";
import { useTranslation } from "react-i18next";
import MyModal from "../../UI/MyModal";
import GenericList from "../../common/GenericList";
import AgentAddModal from "./modals/AgentAddModal";
import Notification from "../../Notification";
import { IoIosAddCircleOutline } from "react-icons/io";
import Tooltip from "../../ToolTip";
import MyInput from "../../UI/MyInput";
import { RiFileExcel2Fill } from "react-icons/ri";
import AgentDeleteModal from "./modals/AgentDeleteModal";
import AgentEditModal from "./modals/AgentEditModal";
import { GrEdit } from "react-icons/gr";
import { RiDeleteBin2Fill } from "react-icons/ri";
import MyLoading from "../../UI/MyLoading";
import { AgentDownloadExcel } from "./AgentDownloadExcel";
import { FaClipboardList } from "react-icons/fa";
import Fuse from "fuse.js";
import AgentsPartnersListModal from "./modals/AgentsPartnersListModal";
import { MdOutlineFilterListOff } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import PartnerList from "../Partner/PartnerList";
import MySearchInput from "../../UI/MySearchInput";
import { myClass } from "../../tailwindClasses";

const Agent = () => {
  const { t } = useTranslation();
  const [agentList, setAgentList] = useState([]);
  const [partnerList, setPartnerList] = useState([]);
  // const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const sound_up_down = new Audio("/sounds/up_down.mp3");

  // loading
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // iconsref for tooltip
  // const editIconRef = useRef(null);
  // const [editIconHovered, setEditIconHovered] = useState(false);
  // const deleteIconRef = useRef(null);
  // const [deleteIconHovered, setDeleteIconHovered] = useState(false);
  const partnerListIconRefs = useRef([]);
  const [hoveredPartnerIndex, setHoveredPartnerIndex] = useState(null);
  const partnerAddIconRefs = useRef([]);
  const [hoveredAddPartnerIndex, setHoveredAddPartnerIndex] = useState(null);
  const editIconRefs = useRef([]);
  const [hoveredEditIndex, setHoveredEditIndex] = useState(null);
  const deleteIconRefs = useRef([]);
  const [hoveredDeleteIndex, setHoveredDeleteIndex] = useState(null);

  const [notification, setNotification] = useState({ message: "", type: "" });

  const hoverTimeoutRef = useRef(null);

  // focus na search input posle smeny dark, light
  useEffect(() => {
    const onThemeToggled = () => {
      searchInputRef.current?.focus();
    };
    window.addEventListener("theme-toggled", onThemeToggled);
    return () => window.removeEventListener("theme-toggled", onThemeToggled);
  }, []);

  // modals
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({
    open: false,
    data: null,
    index: null,
  });
  const [openEditModal, setOpenEditModal] = useState({
    open: false,
    data: null,
    index: null,
  });
  const [openPartnerListModal, setOpenPartnerListModal] = useState({
    open: false,
    data: null,
    index: null,
  });
  const [openAddPartnersModal, setOpenAddPartnersModal] = useState({
    open: false,
    data: null,
    index: null,
  });

  // add
  const [newAgent, setNewAgent] = useState("");
  const addInputRef = useRef(null);

  // add and search section
  // add icon
  const addIconRef = useRef(null);
  const [addIconHovered, setAddIconHovered] = useState(false);

  // // filter for sidebar right
  const [searchParams] = useSearchParams();

  // search i filter

  const filteredList = useMemo(() => {
    // Получаем значение фильтра из URL
    const sortOrder = searchParams.get("sort") || "desc";
    let list = agentList;

    // применяем поиск
    if (searchQuery) {
      const localFuse = new Fuse(list, {
        keys: ["name"],
        threshold: 0.3,
      });
      list = localFuse.search(searchQuery).map((result) => result.item);
    }

    list = [...list].sort((a, b) => {
      const countA = a.partners?.length || 0;
      const countB = b.partners?.length || 0;

      if (sortOrder === "asc") {
        return countA - countB;
      } else {
        return countB - countA;
      }
    });
    return list;
  }, [searchQuery, agentList, searchParams]);
  useEffect(() => {
    // focus w input search posle klika na filter w side right
    searchInputRef.current?.focus();
  }, [searchParams.get("sort")]);

  // excel
  const excelIconRef = useRef(null);
  const [excelIconHovered, setExcelIconHovered] = useState(false);
  const [excelIconIsAnimating, setExcelIconIsAnimating] = useState(false);

  // search
  const searchInputRef = useRef(null);

  // ##############################################################################################################################################
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadMoreButtonRef = useRef(null);

  // Фокусируемые элементы списка
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listItemRefs = useRef([]);

  // // Для дебаунса клавиш
  // const debounceRef = useRef(null);

  // const listEndRef = useRef(null);

  const visibleItems = useMemo(() => {
    const start = 0;
    const end = currentPage * itemsPerPage;
    return filteredList.slice(start, end);
  }, [filteredList, currentPage, itemsPerPage]);

  useEffect(() => {
    setHasMore(visibleItems.length < filteredList.length);
  }, [visibleItems, filteredList]);

  // // Навешиваем обработчик только если нет модалей
  useEffect(() => {
    if (!openEditModal?.open && !openDeleteModal?.open && !openAddModal && !openPartnerListModal.open && !openAddPartnersModal.open) {
      searchInputRef.current.focus();
    }
  }, [openEditModal?.open, openDeleteModal?.open, openAddModal, openPartnerListModal.open, openAddPartnersModal.open]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await myAxios.get("partners/");
      setPartnerList(res.data);
    } catch (e) {
      console.error("Ошибка при загрузке:", e);
      showNotification("partnerLoadError", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = t("agents");
  }, []);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, [t]);

  // excel
  const handleDownloadExcel = () => {
    setExcelIconIsAnimating(true);
    AgentDownloadExcel(filteredList, t);
  };
  useEffect(() => {
    if (excelIconIsAnimating) {
      const timer = setTimeout(() => setExcelIconIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [excelIconIsAnimating]);

  // notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // window events
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Insert") {
        e.preventDefault();
        setOpenAddModal(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        handleDownloadExcel();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (openAddModal) {
      // маленькая задержка, чтобы DOM успел обновиться
      setTimeout(() => {
        addInputRef.current?.focus();
      }, 0);
    }
  }, [openAddModal]);

  // get
  useEffect(() => {
    setTimeout(() => {
      fetchAgents();
      fetchPartners();
    }, 0);
  }, []);

  // get
  const fetchAgents = async () => {
    setLoading(true);
    // await new Promise((r) => setTimeout(r, 100));
    try {
      const res = await myAxios.get("agents/");
      setAgentList(res.data);
    } catch (e) {
      console.error("Ошибка при загрузке agents:", e);
      showNotification(t("errorAgentList"), "error");
    } finally {
      setLoading(false);
    }
  };

  // add
  const handleAddAgent = async () => {
    if (!newAgent.trim()) {
      showNotification(t("agentCantBeEmpty"), "error");
      return;
    }
    setLoading(true);
    try {
      const res = await myAxios.post("agents/", { name: newAgent });
      setAgentList((prev) => [res.data.data, ...prev]);
      showNotification(t("newAgentAdded"), "success");
    } catch (error) {
      console.log("eeerrrrooorrr", error);

      if (error.response && error.response.status === 403) {
        // Показываем уведомление пользователю
        showNotification(t(error.response.data.detail), "error");
      } else {
        console.error("Произошла ошибка", error);
      }
    } finally {
      setLoading(false);
      setOpenAddModal(false);
      setNewAgent("");
      searchInputRef.current?.focus();
    }
  };

  // delete
  const handleDeleteAgent = async (id) => {
    setLoadingDelete(true);
    try {
      await myAxios.delete(`agents/${id}/`);
      setAgentList((prev) => {
        return prev.filter((agent) => agent.id !== id);
      });
      showNotification(t("agentDeleted"), "success");
    } catch (e) {
    } finally {
      setLoadingDelete(false);
      setOpenDeleteModal({ open: false, data: null, index: null });
      searchInputRef.current?.focus();
    }
  };

  // edit
  const handleEditAgent = async (id, newName) => {
    setLoadingEdit(true);
    if (!newName.trim()) {
      showNotification("ne mogu", "error");
    }
    try {
      const res = await myAxios.put(`agents/${id}/`, { name: newName });
      showNotification(t("agentEdited"), "success");
      setAgentList((prev) => {
        return prev.map((p) => (p.id === id ? res.data : p));
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Показываем уведомление пользователю
        showNotification(t(error.response.data.detail), "error");
      } else {
        console.error("Произошла ошибка", error);
      }
    } finally {
      setLoadingEdit(false);
      setOpenEditModal({ open: false, data: null, index: null });
    }
  };

  const prevHasMoreRef = useRef(true);

  useEffect(() => {
    if (prevHasMoreRef.current && !hasMore && !(document.activeElement === searchInputRef.current)) {
      // Кнопка исчезла → фокус на последний li

      const lastIndex = visibleItems.length - 1;
      listItemRefs.current[lastIndex]?.focus();
    }
    prevHasMoreRef.current = hasMore;
  }, [hasMore, visibleItems.length]);

  return (
    <div className="p-2">
      <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />

      <div className="lg:hidden text-center">
        <div className="flex justify-between items-center">
          <span className="print:block">{t("agents")}</span>
          <div className="text-gray-600 dark:text-gray-400 flex items-center gap-3 print:hidden">
            {filteredList.length > 0 && (
              <div className="flex gap-3 items-center">
                <span>{searchQuery ? `${t("found")}: ${filteredList.length}` : `${t("total")}: ${filteredList.length}`}</span>

                <RiFileExcel2Fill
                  size={30}
                  className={`cursor-pointer rounded transition-transform duration-300 text-green-700 hover:text-green-600 ${excelIconIsAnimating ? "scale-125" : "scale-100"}`}
                  onClick={() => {
                    AgentDownloadExcel(filteredList, t);
                    setExcelIconIsAnimating(true);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Download Excel"
                />
              </div>
            )}
            {/* <FaPrint className="text-blue-500 text-lg hover:text-xl hover:text-red-500 transition-all duration-100" /> */}
          </div>
        </div>

        <hr className="m-1" />
      </div>

      {/* add modal */}
      {openPartnerListModal.open && (
        <AgentsPartnersListModal
          setOpenPartnerListModal={setOpenPartnerListModal}
          openPartnerListModal={openPartnerListModal}
          t={t}
          partnerList={partnerList}
          setPartnerList={setPartnerList}
          showNotification={showNotification}
          fetchAgents={fetchAgents}
        />
      )}

      {openAddModal && (
        <AgentAddModal
          addInputRef={addInputRef}
          handleAddAgent={handleAddAgent}
          loading={loading}
          setLoading={setLoading}
          setOpenAddModal={setOpenAddModal}
          openAddModal={openAddModal}
          newAgent={newAgent}
          setNewAgent={setNewAgent}
          t={t}
        />
      )}

      {/* delete modal */}
      {openDeleteModal.open && (
        <AgentDeleteModal
          handleDeleteAgent={handleDeleteAgent}
          setLoadingDelete={setLoadingDelete}
          loadingDelete={loadingDelete}
          openDeleteModal={openDeleteModal}
          setOpenDeleteModal={setOpenDeleteModal}
          t={t}
        />
      )}

      {/* edit modal */}
      {openEditModal.open && (
        <AgentEditModal openEditModal={openEditModal} setOpenEditModal={setOpenEditModal} loadingEdit={loadingEdit} setLoadingEdit={setLoadingEdit} handleEditAgent={handleEditAgent} t={t} />
      )}

      {/* add and search section */}
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md p-1 mb-2 flex items-center justify-between px-2 print:hidden">
        <div>
          <button
            ref={addIconRef}
            onMouseEnter={() => {
              hoverTimeoutRef.current = setTimeout(() => {
                setAddIconHovered(true);
              }, 500);
            }}
            onMouseLeave={() => {
              clearTimeout(hoverTimeoutRef.current);
              setAddIconHovered(false);
            }}
            className={myClass.addButton}
            onClick={() => setOpenAddModal(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                sound_up_down.currentTime = 0;
                sound_up_down.play();
                searchInputRef.current.focus();
              }
            }}
          >
            <IoIosAddCircleOutline size={20} />
          </button>
          <Tooltip visible={addIconHovered} targetRef={addIconRef}>
            {t("addAgent")} (INSERT)
          </Tooltip>
        </div>

        <div className="text-gray-600 dark:text-gray-400 hidden lg:flex items-center gap-3">
          <div>
            {filteredList.length > 0 && (
              <div className="flex gap-3 items-center">
                <span>
                  {t("total")}: {filteredList.length}
                </span>
                <RiFileExcel2Fill
                  size={30}
                  className={`cursor-pointer rounded transition-transform duration-300 text-green-700 hover:text-green-600 ${excelIconIsAnimating ? "scale-125" : "scale-100"}`}
                  ref={excelIconRef}
                  onClick={handleDownloadExcel}
                  onMouseEnter={() => {
                    hoverTimeoutRef.current = setTimeout(() => {
                      setExcelIconHovered(true);
                    }, 500);
                  }}
                  onMouseLeave={() => {
                    clearTimeout(hoverTimeoutRef.current);
                    setExcelIconHovered(false);
                  }}
                />
              </div>
            )}
            <Tooltip visible={excelIconHovered} targetRef={excelIconRef}>
              {t("downloadExcel")} (CTRL+E)
            </Tooltip>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <MySearchInput
            ref={searchInputRef}
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                sound_up_down.currentTime = 0;
                sound_up_down.play();
                addIconRef.current?.focus();
              }
              if (e.key === "ArrowDown" && filteredList.length > 0) {
                e.preventDefault();
                sound_up_down.currentTime = 0;
                sound_up_down.play();
                listItemRefs.current[0]?.focus();
              }
            }}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <MyLoading />
      ) : visibleItems.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="border border-gray-300 dark:border-gray-600 rounded-sm overflow-hidden">
            <ul className={myClass.ul}>
              {visibleItems.map((item, index) => (
                <li
                  key={item.id}
                  ref={(el) => (listItemRefs.current[index] = el)}
                  tabIndex={0}
                  onClick={() => setFocusedIndex(index)}
                  onDoubleClick={() => {
                    setOpenEditModal({ open: true, data: item, index });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Delete") {
                      e.preventDefault();
                      setOpenDeleteModal({ open: true, data: item, index });
                    } else if (e.ctrlKey && e.key === "Enter") {
                      e.preventDefault();
                      setOpenPartnerListModal({
                        open: true,
                        data: item,
                        index,
                      });
                    } else if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenEditModal({ open: true, data: item, index });
                    } else if (e.key === "ArrowDown" && index + 1 < visibleItems.length) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      listItemRefs.current[index + 1]?.focus();
                    } else if (e.key === "ArrowUp" && index !== 0) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      listItemRefs.current[index - 1]?.focus();
                    } else if (e.key === "ArrowUp" && index === 0) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      searchInputRef.current?.focus();
                    } else if (e.key === "ArrowDown" && index + 1 === visibleItems.length) {
                      e.preventDefault();
                      sound_up_down.currentTime = 0;
                      sound_up_down.play();
                      loadMoreButtonRef.current?.focus();
                    }
                  }}
                  className={myClass.li}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">id {item.id}.</div>
                  <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</div>
                  <div className="flex gap-1 justify-end">
                    <button
                      ref={(el) => (partnerListIconRefs.current[index] = el)}
                      onMouseEnter={() => {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoveredPartnerIndex(index);
                        }, 500);
                      }}
                      onMouseLeave={() => {
                        clearTimeout(hoverTimeoutRef.current);
                        setHoveredPartnerIndex(null);
                      }}
                      className={`p-1 text-gray-500 hover:text-green-700 hover:bg-green-200 dark:hover:bg-green-700 rounded transition-colors dark:text-gray-200 print:hidden ${
                        item.partners.length === 0 && "text-red-300 dark:text-red-200"
                      }`}
                      onClick={() =>
                        setOpenPartnerListModal({
                          open: true,
                          data: item,
                          index,
                        })
                      }
                    >
                      <div className="flex items-center">
                        <FaClipboardList size={14} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{item.partners.length}</span>
                      </div>
                    </button>

                    <button
                      ref={(el) => (editIconRefs.current[index] = el)}
                      onMouseEnter={() => {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoveredEditIndex(index);
                        }, 500);
                      }}
                      onMouseLeave={() => {
                        clearTimeout(hoverTimeoutRef.current);
                        setHoveredEditIndex(null);
                      }}
                      className="p-1 text-gray-800 hover:text-green-700 hover:bg-green-200 dark:hover:bg-green-700 rounded transition-colors dark:text-green-500 print:hidden"
                      onClick={() => setOpenEditModal({ open: true, data: item, index })}
                    >
                      <GrEdit size={14} />
                    </button>
                    <button
                      ref={(el) => (deleteIconRefs.current[index] = el)}
                      onMouseEnter={() => {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoveredDeleteIndex(index);
                        }, 500);
                      }}
                      onMouseLeave={() => {
                        clearTimeout(hoverTimeoutRef.current);
                        setHoveredDeleteIndex(null);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-200 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors print:hidden"
                      onClick={() => setOpenDeleteModal({ open: true, data: item, index })}
                    >
                      <RiDeleteBin2Fill size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {hasMore && (
            <div className="px-4 py-1 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
              <button
                ref={loadMoreButtonRef}
                className={myClass.showMore}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCurrentPage((prev) => prev + 1);
                    // Опционально: можно установить фокус на первый новый элемент
                    // listItemRefs.focus(visibleItems.length);
                  } else if (e.key === "ArrowUp") {
                    listItemRefs.current[visibleItems.length - 1].focus();
                  }
                }}
              >
                {t("loadMore")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">{searchQuery ? t("noSearchResults") : t("empty")}</h3>
          <p className="text-gray-500 dark:text-gray-500">{searchQuery ? t("tryDifferentSearch") : t("addFirstAgent")}</p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {t("clearSearch")}
            </button>
          )}
        </div>
      )}
      <Tooltip
        visible={hoveredPartnerIndex !== null}
        targetRef={{
          current: partnerListIconRefs.current[hoveredPartnerIndex],
        }}
      >
        {t("agentsPartnersList")} (CTRL+ENTER)
      </Tooltip>
      <Tooltip
        visible={hoveredAddPartnerIndex !== null}
        targetRef={{
          current: partnerAddIconRefs.current[hoveredAddPartnerIndex],
        }}
      >
        {t("addNewPartner")} (CTRL+ENTER)
      </Tooltip>
      <Tooltip
        visible={hoveredEditIndex !== null}
        targetRef={{
          current: editIconRefs.current[hoveredEditIndex],
        }}
      >
        {t("edit")} (ENTER)
      </Tooltip>
      <Tooltip
        visible={hoveredDeleteIndex !== null}
        targetRef={{
          current: deleteIconRefs.current[hoveredDeleteIndex],
        }}
      >
        {t("delete")} (DELETE)
      </Tooltip>
    </div>
  );
};

export default Agent;
