import MyModal2 from "../../../UI/MyModal2";
import TypeBadge from "../../Partner/TypeBadge";
import { CiNoWaitingSign } from "react-icons/ci";
import { RiDeleteBin2Fill } from "react-icons/ri";
import MySmallModal from "../../../UI/MySmallModal";
import MyButton from "../../../UI/MyButton";
import { IoIosAddCircleOutline } from "react-icons/io";
import Fuse from "fuse.js";
import { useMemo, useState, useRef, useEffect } from "react";
import MyInput from "../../../UI/MyInput";
import { CiSearch } from "react-icons/ci";
import myAxios from "../../../axios";
import MyLoading from "../../../UI/MyLoading";
import { myClass } from "../../../tailwindClasses";
import MySearchInput from "../../../UI/MySearchInput";

const AgentsPartnersListModal = ({ setOpenPartnerListModal, openPartnerListModal, t, partnerList, showNotification, fetchAgents }) => {
  const [partners, setPartners] = useState(openPartnerListModal.data.partners);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const listItemRefs = useRef([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletedPartner, setDeletedPartner] = useState(null);
  const [isActiveSmallModal, setIsActiveSmallModal] = useState(false);
  const [currendIndex, setCurrentIndex] = useState(null);
  const cancelBtnRef = useRef(null);
  const OKBtnRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const searchInputRef = useRef(null);
  const searchInputRef2 = useRef(null);
  const addIBtnRef = useRef(null);
  const [openModalSelectPartner, setOpenModalSelectPartner] = useState(false);
  const listItemAddPartnerRefs = useRef([]);
  const checkboxRefs = useRef({});
  const saveBtnRef = useRef(null);

  const [linkedIds, setLinkedIds] = useState(
    partners.map((p) => p.id) // начальное значение — связанные партнёры
  );



  // fuse dlya poiska podklyuchennyh partnerow
  const fuse = useMemo(() => {
    return new Fuse(partners, {
      keys: ["name"],
      threshold: 0.3,
    });
  }, [partners]);
  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse]);

  // fuse dlya poiska iz wseh partnerow
  const fuse2 = useMemo(() => {
    return new Fuse(partnerList, {
      keys: ["name"],
      threshold: 0.3,
    });
  }, [partnerList]);

  // const filteredPartnersList = useMemo(() => {
  //   if (!searchQuery2) return partnerList;
  //   return fuse2.search(searchQuery2).map((result) => result.item);
  // }, [searchQuery2, fuse2]);

  // Исправляем filteredPartnersList
  const filteredPartnersList = useMemo(() => {
    if (!searchQuery2) return Array.isArray(partnerList) ? partnerList : [];

    try {
      const searchResults = fuse2.search(searchQuery2);
      return Array.isArray(searchResults) ? searchResults.map((result) => result.item) : [];
    } catch (error) {
      console.error("Fuse search error:", error);
      return Array.isArray(partnerList) ? partnerList : [];
    }
  }, [searchQuery2, fuse2, partnerList]);

  // pagination
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreButtonRef = useRef(null);
  const prevHasMoreRef = useRef(true);

  // const visibleItems = useMemo(() => {
  //   const start = 0;
  //   const end = currentPage * itemsPerPage;
  //   return filteredPartnersList.slice(start, end);
  // }, [filteredPartnersList, currentPage, itemsPerPage]);

  const visibleItems = useMemo(() => {
    const start = 0;
    const end = currentPage * itemsPerPage;

    // Добавляем проверку на массив
    if (!Array.isArray(filteredPartnersList)) {
      console.warn("filteredPartnersList is not an array:", filteredPartnersList);
      return [];
    }

    return filteredPartnersList.slice(start, end);
  }, [filteredPartnersList, currentPage, itemsPerPage]);


  useEffect(() => {
    setHasMore(visibleItems.length < filteredPartnersList.length);
  }, [visibleItems, filteredPartnersList]);
  useEffect(() => {
    if (prevHasMoreRef.current && !hasMore && !(document.activeElement === searchInputRef.current)) {
      // Кнопка исчезла → фокус на последний li

      const lastIndex = visibleItems.length - 1;
      listItemAddPartnerRefs.current[lastIndex]?.focus();
    }
    prevHasMoreRef.current = hasMore;
  }, [hasMore, visibleItems.length]);

  useEffect(() => {
    if (!openDeleteModal) {
      searchInputRef.current?.focus();
      setIsActiveSmallModal(false);
    } else {
      cancelBtnRef.current?.focus();
    }
  }, [openDeleteModal]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (openModalSelectPartner) {
      searchInputRef2.current.focus();
    } else {
      setSearchQuery2("");
      if (filteredPartners.length > 0) {
        searchInputRef.current?.focus();
      } else {
        addIBtnRef.current?.focus();
      }
    }
  }, [openModalSelectPartner]);

  useEffect(() => {
    setPartners(openPartnerListModal.data.partners);
  }, [openPartnerListModal.data.partners]);

  const handleSavePartners = async () => {
    setLoading(true);
    try {
      await myAxios.post("assign-partners/", {
        partners_id: linkedIds,
        igent_id: openPartnerListModal.data.id,
      });

      let res = null;
      try {
        res = await myAxios.get("partners/", {
          params: { agent_id: openPartnerListModal.data.id },
        });
      } catch (e) {
        console.error("Ошибка при обновлении списка партнёров:", e);
      }

      if (res) {
        setPartners(res.data);

        // обновляем список партнёров в модалке
        setOpenPartnerListModal((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            partners: res.data,
          },
        }));
      }

      showNotification(t("partnerSuccessUpdated"), "success");
    } catch (e) {
      console.error("Произошла ошибка при сохранении партнёров:", e);
    } finally {
      setLoading(false);
      setOpenModalSelectPartner(false);
      fetchAgents();
    }
  };
  return (
    <div>
      <MyModal2 onClose={() => setOpenPartnerListModal({ open: false, data: null, index: null })} isActiveSmallModal={isActiveSmallModal} fullWidth={true}>
        {openModalSelectPartner && (
          <MyModal2 onClose={() => setOpenModalSelectPartner(false)} fullWidth={true}>
            {loading && (
              <div className="fixed inset-0 flex justify-center items-center z-50">
                <div className="border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin w-12 h-12" />
              </div>
            )}
            <div className="text-lg font-semibold mb-4 text-center">{t("selectPartners")}</div>
            <MySearchInput
              ref={searchInputRef2}
              onChange={(e) => setSearchQuery2(e.target.value)}
              disabled={loading}
              placeholder={t("search")}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (filteredPartnersList.length > 0) {
                    listItemAddPartnerRefs.current[0]?.focus();
                  }
                }
              }}
            />

            <ul className={myClass.ul}>
              {[...visibleItems]
                .sort((a, b) => {
                  const aLinked = partners.some((p) => p.id === a.id);
                  const bLinked = partners.some((p) => p.id === b.id);
                  return Number(bLinked) - Number(aLinked); // сначала true (1), потом false (0)
                })
                .map((partner, index) => {
                  const isAlreadyLinked = linkedIds.includes(partner.id);

                  return (
                    <li
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown" && index < visibleItems.length - 1) {
                          e.preventDefault();
                          listItemAddPartnerRefs.current[index + 1]?.focus();
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          if (index === 0) {
                            searchInputRef2.current?.focus();
                          } else {
                            listItemAddPartnerRefs.current[index - 1]?.focus();
                          }
                        } else if (e.key === "ArrowDown" && index === visibleItems.length - 1) {
                          if (hasMore) {
                            e.preventDefault();
                            loadMoreButtonRef.current?.focus();
                          } else {
                            saveBtnRef.current?.focus();
                          }
                        } else if (e.key === " ") {
                          e.preventDefault();
                          setLinkedIds((prev) => {
                            if (prev.includes(partner.id)) {
                              return prev.filter((id) => id !== partner.id);
                            } else {
                              return [...prev, partner.id];
                            }
                          });
                        } else if (e.key === "Enter") {
                          handleSavePartners();
                        }
                      }}
                      onClick={() => {
                        setLinkedIds((prev) => {
                          if (prev.includes(partner.id)) {
                            return prev.filter((id) => id !== partner.id);
                          } else {
                            return [...prev, partner.id];
                          }
                        });
                      }}
                      ref={(el) => (listItemAddPartnerRefs.current[index] = el)}
                      tabIndex={0}
                      key={partner.id}
                      className={myClass.li}
                    >
                      <input
                        disabled={loading}
                        ref={(el) => (checkboxRefs.current[partner.id] = el)}
                        type="checkbox"
                        checked={isAlreadyLinked}
                        onChange={() => {
                          setLinkedIds((prev) => (prev.includes(partner.id) ? prev.filter((id) => id !== partner.id) : [...prev, partner.id]));
                        }}
                      />
                      <div className="flex justify-between w-full">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{partner.name}</span>

                        <TypeBadge typeText={t(partner.type)} text={partner.type_display} type={partner.type} />
                      </div>
                    </li>
                  );
                })}
            </ul>

            {hasMore && (
              <div className="px-4 py-1 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
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
                      e.preventDefault();
                      listItemAddPartnerRefs.current[visibleItems.length - 1].focus();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      saveBtnRef.current?.focus();
                    }
                  }}
                >
                  {t("loadMore")}
                </button>
              </div>
            )}

            <div className="mt-4 text-end">
              <button
                className={myClass.button}
                ref={saveBtnRef}
                onClick={() => {
                  handleSavePartners();
                }}
                variant="blue"
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (hasMore) {
                      loadMoreButtonRef.current?.focus();
                    } else {
                      listItemAddPartnerRefs.current[visibleItems.length - 1]?.focus();
                    }
                  }
                }}
              >
                {t("save")}
              </button>
            </div>
          </MyModal2>
        )}

        {openDeleteModal && (
          <MySmallModal onClose={() => setOpenDeleteModal(false)} loading={loading}>
            <div>
              {t("confirmUnlinkPartner")} {deletedPartner.name}
            </div>
            <MyButton
              variant="blue"
              onClick={() => setOpenDeleteModal(false)}
              ref={cancelBtnRef}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  OKBtnRef.current?.focus();
                }
              }}
            >
              {t("cancel")}
            </MyButton>
            <MyButton
              variant="red"
              ref={OKBtnRef}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  cancelBtnRef.current?.focus();
                }
              }}
            >
              {t("unlink")}
            </MyButton>
          </MySmallModal>
        )}

        <div className="text-xl text-center">{openPartnerListModal.data.name}</div>
        <div className="flex items-center mt-5 gap-3">
          <MySearchInput
            placeholder={t("search")}
            ref={searchInputRef}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                if (filteredPartners.length > 0) {
                  listItemRefs.current[0]?.focus();
                } else {
                  addIBtnRef.current?.focus();
                }
              }
            }}
          />
        </div>

        <ul className={myClass.ul}>
          {filteredPartners.map((p, index) => (
            <li
              key={p.id}
              ref={(el) => (listItemRefs.current[index] = el)}
              tabIndex={0}
              className={myClass.li}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && index < filteredPartners.length - 1) {
                  e.preventDefault();
                  listItemRefs.current[index + 1]?.focus();
                  setCurrentIndex(index);
                } else if (e.key === "ArrowDown" && index === filteredPartners.length - 1) {
                  e.preventDefault();
                  addIBtnRef.current?.focus();
                  setCurrentIndex(index);
                } else if (e.key === "ArrowUp" && index > 0) {
                  e.preventDefault();
                  listItemRefs.current[index - 1]?.focus();
                  setCurrentIndex(index);
                } else if (e.key === "ArrowUp" && index === 0) {
                  e.preventDefault();
                  searchInputRef.current?.focus();
                  setCurrentIndex(null);
                } else if (e.key === "Delete") {
                  e.preventDefault();
                  setOpenDeleteModal(true);
                  setDeletedPartner(p);
                  setIsActiveSmallModal(true);
                  setCurrentIndex(index);
                }
              }}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{index + 1}.</div>
              <div className="truncate font-medium text-gray-800 dark:text-gray-200">{p.name}</div>
              <div className="flex items-center gap-1 justify-end">
                <TypeBadge typeText={t(p.type)} text={p.type_display} type={p.type} />

                <button
                  disabled={loadingDeleteId === p.id}
                  onClick={() => {
                    setOpenDeleteModal(true);
                    setDeletedPartner(p);
                    setIsActiveSmallModal(true);
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-200 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors print:hidden"
                  title={loadingDeleteId === p.id ? t("deletingPartner") : t("deletePartner")}
                  aria-busy={loadingDeleteId === p.id}
                >
                  {loadingDeleteId === p.id ? <CiNoWaitingSign className="animate-spin" size={14} /> : <RiDeleteBin2Fill size={14} />}
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-center mt-5">
          <button
            className={myClass.addButton}
            ref={addIBtnRef}
            title={t("addPartner")}
            onClick={() => {
              setOpenModalSelectPartner(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                if (filteredPartners.length > 0) {
                  listItemRefs.current[filteredPartners.length - 1]?.focus();
                } else {
                  searchInputRef.current?.focus();
                }
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenModalSelectPartner(true);
              }
            }}
          >
            <IoIosAddCircleOutline size={24} />
          </button>
        </div>
      </MyModal2>
    </div>
  );
};

export default AgentsPartnersListModal;
