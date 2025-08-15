import MyModal from "../../../UI/MyModal";
import MyInput from "../../../UI/MyInput";
import MyButton from "../../../UI/MyButton";
import { CiNoWaitingSign } from "react-icons/ci";
import { useState, useEffect, useRef } from "react";
import { FaLeaf, FaUser, FaTruck, FaHandshake } from "react-icons/fa";
import MyLoading from "../../../UI/MyLoading";

const PartnerUpdateModal = ({
  showNotification,
  selectedAgent,
  setSelectedAgent,
  agentList,
  setOpenModal,
  listItemRefs,
  selectedListItemRef,
  t,
  editInputRef,
  editBalanceInputRef,
  editName,
  setEditName,
  editBalance,
  setEditBalance,
  editAgent,
  setEditAgent,
  handleEditKeyDown,
  refUpdateRadioInput,
  editType,
  setEditType,
  refUpdateCancelButton,
  updatePartner,
  refUpdateSaveButton,
  loadingEdit,
  // accounts,
  // selectedAccount,
  // setSelectedAccount,
  // accountUpdateInputRef,
}) => {
  const [filteredAgents, setFilteredAgents] = useState([]);
  const agentItemRefs = useRef([]);
  const agentInputRef = useRef();

  // ckryt li podskazki esli kliknut w drugoe mesto
  const wrapperRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowAgentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);

  useEffect(() => {
    const handleBlur = (e) => {
      // Подождём чуть-чуть, чтобы учесть переход фокуса на элемент списка
      setTimeout(() => {
        const active = document.activeElement;
        if (agentInputRef.current && !agentInputRef.current.contains(active) && !agentItemRefs.current.some((ref) => ref === active)) {
          setShowAgentDropdown(false);
        }
      }, 100); // 100 мс — оптимально
    };

    const inputEl = agentInputRef.current;
    inputEl?.addEventListener("blur", handleBlur);
    return () => inputEl?.removeEventListener("blur", handleBlur);
  }, [filteredAgents]);

  useEffect(() => {
    if (!editAgent?.trim() || !Array.isArray(agentList)) {
      setFilteredAgents([]);
      return;
    }

    if (!showAgentDropdown) {
      setFilteredAgents([]);
      return;
    }
    const matches = agentList.filter((agent) => agent.name.toLowerCase().includes(editAgent.toLowerCase()));
    setFilteredAgents(matches);
  }, [editAgent, agentList]);

  useEffect(() => {
    if (!showAgentDropdown) {
      setFilteredAgents([]);
    }
  }, [showAgentDropdown]);

  useEffect(() => {
    if (filteredAgents.length === 1 && editAgent === filteredAgents[0].name) {
      setSelectedAgent(filteredAgents[0]);
    }
  }, [filteredAgents]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "klient":
        return <FaUser className="w-4 h-4" />;
      case "supplier":
        return <FaTruck className="w-4 h-4" />;
      case "both":
        return <FaHandshake className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <MyModal
      onClose={() => {
        setOpenModal(false);
        listItemRefs.current[selectedListItemRef]?.focus();
        setSelectedAgent(null);
      }}
    >
      <div className="relative bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 rounded-2xl overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

        <div className="relative p-8">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaLeaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  {t("change")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("changeInfoAboutPartner")}</p>
              </div>
            </div>

            {loadingEdit && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-3 shadow-lg">
                <MyLoading containerClass="h-8" spinnerClass="w-6 h-6 text-blue-500" />
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Partner name */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full group-focus-within:scale-150 transition-transform duration-200"></div>
                {t("changePartnerName")}
              </label>
              <div className="relative">
                <MyInput
                  ref={editInputRef}
                  disabled={loadingEdit}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t("enterPartnerName")}
                  className="w-full pl-4 pr-4 py-3 text-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                  onKeyDown={(e) => {
                    if (e.key == "ArrowDown") {
                      e.preventDefault();
                      editBalanceInputRef.current.focus();
                    }
                  }}
                />
                {editName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Partner balance */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full group-focus-within:scale-150 transition-transform duration-200"></div>
                {t("changePartnerBalance")}
              </label>
              <div className="relative">
                <MyInput
                  ref={editBalanceInputRef}
                  disabled={loadingEdit}
                  value={editBalance}
                  type="number"
                  onChange={(e) => setEditBalance(e.target.value)}
                  placeholder={t("enterPartnerBalance")}
                  className="w-full pl-4 pr-4 py-3 text-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                  onKeyDown={(e) => {
                    if (e.key == "ArrowDown") {
                      e.preventDefault();
                      // accountUpdateInputRef.current.focus();\
                      refUpdateRadioInput.current["supplier"]?.focus();
                    } else if (e.key == "ArrowUp") {
                      e.preventDefault();
                      editInputRef.current.focus();
                    }
                  }}
                />
                {editName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* accountList */}
            {/* <div className="mb-4">
              <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-1">
                Выберите счёт:
              </label>
              <select
                id="account-select"
                ref={accountUpdateInputRef}
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.number} - {acc.name}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Partner type */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full group-focus-within:scale-150 transition-transform duration-200"></div>
                {t("changePartnerType")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["klient", "supplier", "both"].map((type) => (
                  <label key={type} className="group/radio relative">
                    <input
                      ref={(el) => (refUpdateRadioInput.current[type] = el)}
                      disabled={loadingEdit}
                      type="radio"
                      value={type}
                      checked={editType === type}
                      onChange={(e) => setEditType(e.target.value)}
                      className="sr-only"
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          agentInputRef.current?.focus();
                        }
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          editInputRef.current?.focus();
                        }
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!selectedAgent && editAgent) {
                            showNotification(t("agentNotFound"), "error");
                          } else {
                            updatePartner();
                          }
                        }
                      }}
                    />
                    <div
                      className={`
                      relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                      ${
                        editType === type
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20"
                          : "border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-500"
                      }
                      group-hover/radio:shadow-md backdrop-blur-sm
                    `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200
                          ${editType === type ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}
                        `}
                        >
                          {getTypeIcon(type)}
                        </div>
                        <span
                          className={`
                          font-medium transition-colors duration-200
                          ${editType === type ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}
                        `}
                        >
                          {t(type)}
                        </span>
                      </div>

                      {editType === type && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Agent search input */}
            <div className="group" ref={wrapperRef}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full group-focus-within:scale-150 transition-transform duration-200"></div>
                {t("agent")}
                {selectedAgent && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Выбран</span>}
              </label>
              <div className="relative">
                <MyInput
                  ref={agentInputRef}
                  type="text"
                  value={editAgent || ""}
                  onChange={(e) => {
                    setEditAgent(e.target.value);
                    setSelectedAgent(null);
                    setShowAgentDropdown(true);
                    setFilteredAgents([]);
                  }}
                  placeholder={t("addAgent")}
                  className="w-full pl-4 pr-4 py-3 text-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/20 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                  disabled={loadingEdit}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      refUpdateRadioInput.current["supplier"]?.focus();
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (filteredAgents.length > 0) {
                        agentItemRefs.current[0]?.focus();
                      } else {
                        refUpdateCancelButton.current?.focus();
                      }
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!selectedAgent && editAgent) {
                        showNotification(t("agentNotFound"), "error");
                      } else {
                        updatePartner();
                      }
                    }
                  }}
                />

                {showAgentDropdown && filteredAgents.length > 0 && (
                  <ul className="absolute z-20 top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/60 dark:border-gray-600/60 rounded-xl shadow-2xl shadow-gray-200/50 dark:shadow-black/50 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {filteredAgents.map((agent, index) => (
                      <li
                        key={agent.id}
                        ref={(el) => (agentItemRefs.current[index] = el)}
                        tabIndex={0}
                        className="group/item px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 focus:outline-none focus:bg-green-100 dark:focus:bg-green-900/30 focus:ring-2 focus:ring-green-500/50 transition-all duration-200 cursor-pointer first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setEditAgent(agent.name);
                          setFilteredAgents([]);
                          agentInputRef.current?.focus();
                          setShowAgentDropdown(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            agentItemRefs.current[index + 1]?.focus();
                          }
                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (index === 0) {
                              agentInputRef.current?.focus();
                            } else {
                              agentItemRefs.current[index - 1]?.focus();
                            }
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setSelectedAgent(agent);
                            setEditAgent(agent.name);
                            setFilteredAgents([]);
                            agentInputRef.current?.focus();
                            setShowAgentDropdown(false);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaUser className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 group-hover/item:text-green-700 dark:group-hover/item:text-green-300 font-medium transition-colors duration-200">
                            {agent.name}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-200/50 dark:border-gray-600/50">
            <MyButton
              ref={refUpdateCancelButton}
              disabled={loadingEdit}
              variant="secondary"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 hover:shadow-md focus:ring-4 focus:ring-gray-500/20"
              onClick={() => {
                setOpenModal(false);
                listItemRefs.current[selectedListItemRef]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                  e.preventDefault();
                  refUpdateSaveButton.current?.focus();
                }
                if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  agentInputRef.current?.focus();
                }
              }}
            >
              {t("cancel")}
            </MyButton>
            <MyButton
              ref={refUpdateSaveButton}
              variant="primary"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 active:scale-95 min-w-[120px]"
              onClick={() => {
                if (!selectedAgent && editAgent) {
                  showNotification(t("agentNotFound"), "error");
                } else {
                  updatePartner();
                }
              }}
              disabled={loadingEdit}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  refUpdateCancelButton.current?.focus();
                }
              }}
            >
              {loadingEdit ? (
                <span className="flex items-center gap-3">
                  <CiNoWaitingSign className="animate-spin w-5 h-5" />
                  {t("saving")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FaLeaf className="w-4 h-4" />
                  {t("save")}
                </span>
              )}
            </MyButton>
          </div>
        </div>
      </div>
    </MyModal>
  );
};

export default PartnerUpdateModal;
