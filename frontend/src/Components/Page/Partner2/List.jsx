import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, DollarSign, TrendingUp, Eye, Edit3, MoreHorizontal, Search, User } from "lucide-react";
import { formatNumber } from "../../UI/formatNumber";
import MyModal2 from "../../UI/MyModal2";
import { DateContext } from "../../UI/DateProvider";
import { useNotification } from "../../context/NotificationContext";
import { getSaldoForPartner } from "../../../services/saldoService";
// import Saldo2 from "../PurchaseInvoice/Utils/Saldo2";
import Saldo2 from "../../UI/Saldo2";

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
  setFocusedPartnerIndex,
  focusedPartnerIndex,
}) => {
  const { t } = useTranslation();
  const sound_up_down = new Audio("/sounds/up_down.mp3");
  const [hoveredPartner, setHoveredPartner] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [openPartnerCardModal, setOpenPartnerCardModal] = useState({ partnerId: null, is_open: false, partner_name: "" });
  const { dateFrom, dateTo, dateProwodok } = useContext(DateContext);
  const { showNotification } = useNotification();
  const [saldo, setSaldo] = useState(null);

  const fetchSaldo = async (date, partnerId) => {
    try {
      const saldo = await getSaldoForPartner(date, partnerId);
      console.log("saldo", saldo);
      setSaldo(saldo);
    } catch (err) {
      console.log("Ошибка при получении сальдо", err);
    }
  };

  useEffect(() => {
    if (!openPartnerCardModal.partnerId) return;
    console.log("openPartnerCardModal", openPartnerCardModal);
    fetchSaldo(dateProwodok, openPartnerCardModal.partnerId);
  }, [openPartnerCardModal]);

  const openPartnerModal = (partner) => {
    let agent_obj = null;
    if (partner.agent) {
      agent_obj = { id: partner.agent, name: partner.agent_name };
    }

    setPartnerValue({
      name: partner.name,
      balance: partner.balance,
      balance_usd: partner.balance_usd,
      balance_tmt: partner.balance_tmt,
      type: partner.type,
      agent: agent_obj,
      is_active: partner.is_active,
      create: false,
      originalName: partner.name,
      id: partner.id,
    });
    setUpdateMode(true);
    setOpenModal(true);
  };

  useEffect(() => {
    if (focusedPartnerId !== null) {
      const index = partners.findIndex((p) => p.id === focusedPartnerId);
      if (index !== -1) {
        setTimeout(() => {
          partnersListRefs.current[index]?.focus();
        }, 50);
      }
      setFocusedPartnerId(null);
    }
  }, [focusedPartnerId, partners]);

  const [selectedPageNumber, setSelectedPageNumber] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const balanceVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "backOut",
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("partners")}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {partners.length} {t("partners found")}
          </p>
        </div>
      </motion.div>

      {/* Partners List */}
      <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="grid gap-3 mb-6">
        <AnimatePresence>
          {partners.map((partner, index) => (
            <motion.li
              variants={itemVariants}
              layout
              key={partner.id}
              onMouseEnter={() => setHoveredPartner(partner.id)}
              onMouseLeave={() => setHoveredPartner(null)}
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
                  setFocusedPartnerIndex(index);
                  setSelectedPartner(partner.id);
                  setTimeout(() => setSelectedPartner(null), 300);
                  // openPartnerModal(partner);
                  if (!dateProwodok) {
                    showNotification(t("choose date prowodka"), "error");
                  } else {
                    setOpenPartnerCardModal({ partnerId: partner.id, is_open: true, partner_name: partner.name });
                  }
                }
              }}
              onDoubleClick={() => {
                setFocusedPartnerIndex(index);
                setSelectedPartner(partner.id);
                setTimeout(() => setSelectedPartner(null), 300);
                // openPartnerModal(partner);
                if (!dateProwodok) {
                  showNotification(t("choose date prowodka"), "error");
                } else {
                  setOpenPartnerCardModal({ partnerId: partner.id, is_open: true, partner_name: partner.name });
                }
              }}
              ref={(el) => (partnersListRefs.current[index] = el)}
              className={`
                relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer
                ${
                  selectedPartner === partner.id
                    ? "ring-2 ring-blue-500 scale-[0.98] bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
                ${hoveredPartner === partner.id ? "shadow-lg transform hover:scale-[1.02] hover:shadow-xl" : "shadow-sm"}
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-yellow-50 dark:focus:bg-yellow-500/10
              `}
              tabIndex={0}
            >
              {/* Background Gradient on Hover */}
              <div
                className={`
                absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                opacity-0 transition-opacity duration-300
                ${hoveredPartner === partner.id ? "opacity-100" : ""}
              `}
              />

              <div className="relative z-10 flex items-center justify-between">
                {/* Partner Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center"
                  >
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{partner.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          partner.type === "company" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        }`}
                      >
                        {t(partner.type)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          partner.is_active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {partner.is_active ? t("active") : t("inactive")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Balances */}
                <div className="flex items-center gap-6">
                  <motion.div variants={balanceVariants} className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      USD
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(partner.balance_usd)}</div>
                  </motion.div>

                  <motion.div variants={balanceVariants} className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      TMT
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(partner.balance_tmt)}</div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: hoveredPartner === partner.id ? 1 : 0.7,
                      scale: hoveredPartner === partner.id ? 1 : 0.9,
                    }}
                    className="flex items-center gap-1"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setFocusedPartnerIndex(index);
                        openPartnerModal(partner);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* Pagination */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p, index) => (
          <motion.button
            key={p}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
            onClick={() => setPage(p)}
            className={`
              relative px-4 py-2 rounded-xl font-medium transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
              ${
                page === p
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
              }
            `}
          >
            {page === p && (
              <motion.div layoutId="activePage" className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 -z-10" transition={{ type: "spring", duration: 0.6 }} />
            )}
            {p}
          </motion.button>
        ))}
      </motion.div>

      {/* Empty State */}
      {partners.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No partners found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
        </motion.div>
      )}

      {openPartnerCardModal.partnerId && openPartnerCardModal.is_open && (
        <MyModal2 onClose={() => setOpenPartnerCardModal({ partnerId: null, is_open: false, partner_name: "" })}>
          <Saldo2 saldo2={saldo} partnerName={openPartnerCardModal.partner_name} />
        </MyModal2>
      )}
    </div>
  );
};

export default List;

// import { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { formatNumber } from "../../UI/formatNumber";

// const List = ({
//   partners,
//   totalPages,
//   myClass,
//   setPage,
//   page,
//   partnersListRefs,
//   paginationBtnRefs,
//   searchInputRef,
//   openModal,
//   setOpenModal,
//   setUpdateMode,
//   setPartnerValue,
//   focusedPartnerId,
//   setFocusedPartnerId,
//   setFocusedPartnerIndex,
//   focusedPartnerIndex,
// }) => {
//   const { t } = useTranslation();
//   const sound_up_down = new Audio("/sounds/up_down.mp3");
//   const openPartnerModal = (partner) => {
//     // console.log("partner", partner);

//     let agent_obj = null;
//     if (partner.agent) {
//       agent_obj = { id: partner.agent, name: partner.agent_name };
//     }
//     // let accounts_id = [];
//     // if (partner.partner_accounts.length > 0) {
//     //   partner.partner_accounts.forEach((p) => {
//     //     accounts_id.push({ id: p.account.id, number: p.account.number, type: p.role });
//     //   });
//     // }
//     setPartnerValue({
//       name: partner.name,
//       balance: partner.balance,
//       balance_usd: partner.balance_usd,
//       balance_tmt: partner.balance_tmt,
//       // accounts_id: accounts_id,
//       type: partner.type,
//       agent: agent_obj,
//       is_active: partner.is_active,
//       create: false,
//       originalName: partner.name,
//       id: partner.id,
//     }); // ← объект для редактирования
//     setUpdateMode(true); // ← включаем режим обновления
//     setOpenModal(true);
//   };

//   useEffect(() => {
//     if (focusedPartnerId !== null) {
//       const index = partners.findIndex((p) => p.id === focusedPartnerId);
//       if (index !== -1) {
//         setTimeout(() => {
//           partnersListRefs.current[index]?.focus();
//         }, 50); // чуть подождать, чтобы DOM успел отрендериться
//       }
//       setFocusedPartnerId(null); // сбрасываем
//     }
//   }, [focusedPartnerId, partners]);

//   const [selectedPageNumber, setSelectedPageNumber] = useState(null);
//   return (
//     <div>
//       <h2>{t("partners")}</h2>

//       <ul className="divide-y divide-gray-900 dark:divide-gray-600 mt-2 space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-black dark:border-gray-700/50 backdrop-blur-sm p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent transition-all duration-300">
//         {partners.map((partner, index) => (
//           <li
//             onKeyDown={(e) => {
//               if (e.key === "ArrowDown") {
//                 e.preventDefault();
//                 sound_up_down.currentTime = 0;
//                 sound_up_down.play();
//                 if (partners.length > index + 1) {
//                   partnersListRefs.current[index + 1]?.focus();
//                 } else {
//                   paginationBtnRefs.current[0]?.focus();
//                 }
//               } else if (e.key === "ArrowUp") {
//                 e.preventDefault();
//                 sound_up_down.currentTime = 0;
//                 sound_up_down.play();
//                 if (index !== 0) {
//                   partnersListRefs.current[index - 1]?.focus();
//                 } else {
//                   searchInputRef.current?.focus();
//                 }
//               } else if (e.key === "Enter") {
//                 e.preventDefault();
//                 // setFocusedPartnerId
//                 setFocusedPartnerIndex(index)
//                 openPartnerModal(partner);
//               }
//             }}
//             onDoubleClick={() => {
//               setFocusedPartnerIndex(index)
//               openPartnerModal(partner);
//             }}
//             ref={(el) => (partnersListRefs.current[index] = el)}
//             className="flex justify-between px-2 py-0 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:bg-yellow-100 dark:focus:bg-yellow-500/20 transition-colors cursor-pointer gap-2"
//             key={partner.id}
//             tabIndex={0}
//           >
//             {/* <div></div> */}
//             <div>{partner.name}</div>
//             <div>
//               <div>USD: {formatNumber(partner.balance_usd)}</div>
//               <div>TMT: {formatNumber(partner.balance_tmt)}</div>
//             </div>
//           </li>
//         ))}
//       </ul>

//       {/* Пагинация с номерами страниц */}
//       <div className="flex flex-wrap gap-2 mt-4">
//         {Array.from({ length: totalPages }, (_, i) => i + 1).map((p, index) => (
//           <button
//             onKeyDown={(e) => {
//               if (e.key === "ArrowRight" || e.key === "ArrowDown") {
//                 e.preventDefault();
//                 const nextBtn = paginationBtnRefs.current[index + 1];
//                 setSelectedPageNumber(index + 1);
//                 if (nextBtn) {
//                   nextBtn.focus();
//                 }
//               }
//               if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
//                 e.preventDefault();
//                 const prevBtn = paginationBtnRefs.current[index - 1];
//                 setSelectedPageNumber(index - 1);
//                 if (prevBtn) {
//                   prevBtn.focus();
//                 } else {
//                   partnersListRefs.current[partners.length - 1]?.focus();
//                 }
//               }
//             }}
//             ref={(el) => (paginationBtnRefs.current[index] = el)}
//             key={p}
//             onClick={() => setPage(p)}
//             className={`px-3 py-1 rounded border transition-colors duration-200
//         ${
//           page === p
//             ? "bg-blue-600 text-white dark:bg-blue-400 dark:text-black border-blue-600 dark:border-blue-400"
//             : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
//         }`}
//           >
//             {p}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default List;
