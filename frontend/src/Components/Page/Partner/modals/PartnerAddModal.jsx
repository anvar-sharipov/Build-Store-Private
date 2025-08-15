import MyModal from "../../../UI/MyModal";
import MyInput from "../../../UI/MyInput";
import { CiNoWaitingSign } from "react-icons/ci";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useState, useEffect, useRef } from "react";

const PartnerAddModal = ({
  showNotification,
  selectedAgent,
  setSelectedAgent,
  agentList,
  openModalAdd,
  setOpenModalAdd,
  t,
  radioRefs,
  partnerType,
  setPartnerType,
  addInputRef,
  balanceInputRef,
  addAgentInputRef,
  addPartner,
  loadingAdd,
  newPartner,
  setNewPartner,
  handleAddKeyDown,
  setNewBalance,
  newBalance,
  // accounts,
  // selectedAccount,
  // setSelectedAccount,
  // accountAddInputRef,
}) => {
  const [agentQuery, setAgentQuery] = useState("");
  const [filteredAgents, setFilteredAgents] = useState([]);
  const agentItemRefs = useRef([]);
  const [choosedAgent, setChoosedAgent] = useState(false);
  const wrapperRef = useRef(null);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const handleFocusOut = () => {
      setTimeout(() => {
        if (!wrapperRef.current?.contains(document.activeElement)) {
          setShowAgentDropdown(false);
        }
      }, 100);
    };
    document.addEventListener("focusin", handleFocusOut);
    return () => document.removeEventListener("focusin", handleFocusOut);
  }, []);

  useEffect(() => {
    if (!agentQuery.trim()) {
      setFilteredAgents([]);
      return;
    }
    const filtered = agentList.filter((agent) => agent.name.toLowerCase().includes(agentQuery.toLowerCase()));
    if (choosedAgent) {
      setChoosedAgent(false);
    } else {
      setFilteredAgents(filtered);
    }
  }, [agentQuery, agentList]);

  return (
    <MyModal onClose={() => setOpenModalAdd(false)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl px-6 py-8 sm:p-10 space-y-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t("addNewPartner")}</h2>
          <button
            onClick={addPartner}
            disabled={loadingAdd}
            className="flex items-center gap-2 text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-4 py-2 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("addPartner")}
          >
            {loadingAdd ? (
              <CiNoWaitingSign className="animate-spin text-xl" />
            ) : (
              <>
                <IoIosAddCircleOutline size={20} />
                <span>{t("addPartner")}</span>
              </>
            )}
          </button>
        </div>

        {/* Radio Buttons */}
        <div className="flex flex-wrap gap-4">
          {["klient", "supplier", "both"].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                ref={(el) => (radioRefs.current[type] = el)}
                type="radio"
                value={type}
                checked={partnerType === type}
                onChange={(e) => setPartnerType(e.target.value)}
                className="text-blue-600 focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    addInputRef.current?.focus();
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPartner();
                  }
                }}
              />
              <span className="text-gray-800 dark:text-gray-200">{t(type)}</span>
            </label>
          ))}
        </div>

        {/* Partner name input */}
        <div className="flex items-center gap-3">
          <label className="w-24 text-gray-700 dark:text-gray-300 font-medium">{t("partner")}</label>
          <MyInput
            ref={addInputRef}
            name="new_partner"
            type="text"
            value={newPartner}
            onChange={(e) => setNewPartner(e.target.value)}
            placeholder={`${t("addNewPartner")}...`}
            className="flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            onKeyDown={(e) => {
              if (e.key == "ArrowDown"){
                e.preventDefault()
                balanceInputRef.current.focus()
              }
            }}
            disabled={loadingAdd}
          />
        </div>

        {/* Partner balance input */}
        <div className="flex items-center gap-3">
          <label className="w-24 text-gray-700 dark:text-gray-300 font-medium">{t("balance")}</label>
          <MyInput
            ref={balanceInputRef}
            name="new_balance"
            type="number"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            placeholder={`${t("addNewBalance")}...`}
            className="flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            // onKeyDown={(e) => {
            //   if (e.key == "ArrowDown"){
            //     e.preventDefault()
            //     refUpdateRadioInput.current["supplier"]?.focus();
            //   }
            // }}
            disabled={loadingAdd}
          />
        </div>

        {/* accountList */}
        {/* <div className="mb-4">
          <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-1">
            Выберите счёт:
          </label>
          <select
            id="account-select"
            ref={accountAddInputRef}
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

        {/* Agent search input */}
        <div className="relative" ref={wrapperRef}>
          <div className="flex items-center gap-3">
            <label className="w-24 text-gray-700 dark:text-gray-300 font-medium">{t("agent")}</label>
            <MyInput
              ref={addAgentInputRef}
              type="text"
              value={agentQuery}
              onChange={(e) => {
                setAgentQuery(e.target.value);
                setSelectedAgent(null);
                setShowAgentDropdown(true);
              }}
              placeholder={`${t("addAgent")}...`}
              className="w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={loadingAdd}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  addInputRef.current?.focus();
                }
                if (e.key === "ArrowDown" && filteredAgents.length > 0) {
                  e.preventDefault();
                  agentItemRefs.current[0]?.focus();
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (agentQuery !== "" && selectedAgent?.id) {
                    addPartner();
                  } else {
                    showNotification(t("agentNotFound"), "error");
                  }
                }
              }}
            />
          </div>

          {/* Dropdown list */}
          {showAgentDropdown && filteredAgents.length > 0 && (
            <ul className="absolute mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg w-full max-h-52 overflow-y-auto focus:outline-none">
              {filteredAgents.map((agent, index) => (
                <li
                  key={agent.id}
                  ref={(el) => (agentItemRefs.current[index] = el)}
                  tabIndex={0}
                  className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setAgentQuery(agent.name);
                    setFilteredAgents([]);
                    addAgentInputRef.current?.focus();
                    setChoosedAgent(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      agentItemRefs.current[index + 1]?.focus();
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (index === 0) {
                        addAgentInputRef.current?.focus();
                      } else {
                        agentItemRefs.current[index - 1]?.focus();
                      }
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setSelectedAgent(agent);
                      setAgentQuery(agent.name);
                      setFilteredAgents([]);
                      addAgentInputRef.current?.focus();
                      setChoosedAgent(true);
                    }
                  }}
                >
                  {agent.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </MyModal>
  );
};

export default PartnerAddModal;
