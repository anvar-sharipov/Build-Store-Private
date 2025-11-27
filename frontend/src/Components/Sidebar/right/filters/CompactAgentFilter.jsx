import { useState } from "react";

// Компонент для компактного фильтра агентов
const CompactAgentFilter = ({ agents, selectedAgent, handleChange, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgents = agents.filter(agent => {
    const name = agent.name || agent.first_name || `Agent ${agent.id}`;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedAgentName = selectedAgent === "all" 
    ? t("all") 
    : agents.find(agent => agent.id.toString() === selectedAgent)?.name || 
      agents.find(agent => agent.id.toString() === selectedAgent)?.first_name || 
      `Agent ${selectedAgent}`;

  return (
    <div className="relative">
      <h3 className="font-semibold mb-2 mt-4 text-gray-400">{t("agent")}</h3>
      
      {/* Dropdown toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-left text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center"
      >
        <span className="truncate">{selectedAgentName}</span>
        <svg className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          {agents.length > 5 && (
            <div className="p-2 border-b border-gray-700">
              <input
                type="text"
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-1 text-sm border border-gray-600 rounded bg-gray-700 text-gray-300"
              />
            </div>
          )}
          
          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            <div
              onClick={() => {
                handleChange("agent", "all");
                setIsOpen(false);
                setSearchTerm("");
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedAgent === "all" ? "bg-blue-900 text-blue-300" : "text-gray-300"
              }`}
            >
              {t("all")}
            </div>
            
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => {
                  handleChange("agent", agent.id.toString());
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-700 ${
                  selectedAgent === agent.id.toString() 
                    ? "bg-blue-900 text-blue-300" 
                    : "text-gray-300"
                }`}
              >
                {agent.name || agent.first_name || `Agent ${agent.id}`}
              </div>
            ))}
            
            {filteredAgents.length === 0 && searchTerm && (
              <div className="px-3 py-2 text-gray-400">
                {t("no_results")}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsOpen(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
};

export default CompactAgentFilter;