import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../UI/formatNumber";

const List = ({
  partners,
  totalPages,
  myClass,
  setPage,
  page,
  partnersListRefs,
  paginationBtnRefs,
  searchInputRef,
  openModal,
  setOpenModal,
  setUpdateMode,
  setPartnerValue,
  focusedPartnerId,
  setFocusedPartnerId,
}) => {
  const { t } = useTranslation();
  const sound_up_down = new Audio("/sounds/up_down.mp3");
  const openPartnerModal = (partner) => {
    // console.log("partner", partner);

    let agent_obj = null;
    if (partner.agent) {
      agent_obj = { id: partner.agent, name: partner.agent_name };
    }
    // let accounts_id = [];
    // if (partner.partner_accounts.length > 0) {
    //   partner.partner_accounts.forEach((p) => {
    //     accounts_id.push({ id: p.account.id, number: p.account.number, type: p.role });
    //   });
    // }
    setPartnerValue({
      name: partner.name,
      balance: partner.balance,
      balance_usd: partner.balance_usd,
      balance_tmt: partner.balance_tmt,
      // accounts_id: accounts_id,
      type: partner.type,
      agent: agent_obj,
      is_active: partner.is_active,
      create: false,
      originalName: partner.name,
      id: partner.id,
    }); // ← объект для редактирования
    setUpdateMode(true); // ← включаем режим обновления
    setOpenModal(true);
  };

  useEffect(() => {
    if (focusedPartnerId !== null) {
      const index = partners.findIndex((p) => p.id === focusedPartnerId);
      if (index !== -1) {
        setTimeout(() => {
          partnersListRefs.current[index]?.focus();
        }, 50); // чуть подождать, чтобы DOM успел отрендериться
      }
      setFocusedPartnerId(null); // сбрасываем
    }
  }, [focusedPartnerId, partners]);

  const [selectedPageNumber, setSelectedPageNumber] = useState(null);
  return (
    <div>
      <h2>{t("partners")}</h2>

      <ul className="divide-y divide-gray-900 dark:divide-gray-600 mt-2 space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-black dark:border-gray-700/50 backdrop-blur-sm p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent transition-all duration-300">
        {partners.map((partner, index) => (
          <li
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                sound_up_down.currentTime = 0;
                sound_up_down.play();
                if (partners.length > index + 1) {
                  partnersListRefs.current[index + 1]?.focus();
                } else {
                  paginationBtnRefs.current[0]?.focus();
                }
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                sound_up_down.currentTime = 0;
                sound_up_down.play();
                if (index !== 0) {
                  partnersListRefs.current[index - 1]?.focus();
                } else {
                  searchInputRef.current?.focus();
                }
              } else if (e.key === "Enter") {
                e.preventDefault();
                openPartnerModal(partner);
              }
            }}
            onDoubleClick={() => {
              openPartnerModal(partner);
            }}
            ref={(el) => (partnersListRefs.current[index] = el)}
            className="flex justify-between px-2 py-0 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:bg-yellow-100 dark:focus:bg-yellow-500/20 transition-colors cursor-pointer gap-2"
            key={partner.id}
            tabIndex={0}
          >
            {/* <div></div> */}
            <div>{partner.name}</div>
            <div>
            <div>USD: {formatNumber(partner.balance_usd)}</div>
            <div>TMT: {formatNumber(partner.balance_tmt)}</div>
            </div>
            
          </li>
        ))}
      </ul>

      {/* Пагинация с номерами страниц */}
      <div className="flex flex-wrap gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p, index) => (
          <button
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                const nextBtn = paginationBtnRefs.current[index + 1];
                setSelectedPageNumber(index + 1);
                if (nextBtn) {
                  nextBtn.focus();
                }
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const prevBtn = paginationBtnRefs.current[index - 1];
                setSelectedPageNumber(index - 1);
                if (prevBtn) {
                  prevBtn.focus();
                } else {
                  partnersListRefs.current[partners.length - 1]?.focus();
                }
              }
            }}
            ref={(el) => (paginationBtnRefs.current[index] = el)}
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded border transition-colors duration-200
        ${
          page === p
            ? "bg-blue-600 text-white dark:bg-blue-400 dark:text-black border-blue-600 dark:border-blue-400"
            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
        }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default List;
