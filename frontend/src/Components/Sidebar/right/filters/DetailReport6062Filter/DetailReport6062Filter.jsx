import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo, use } from "react";
import MySearchInput from "../../../../UI/MySearchInput";
import { fetchAgents } from "../../../../fetchs/optionsFetchers";
import Fuse from "fuse.js";
import { Filter } from "lucide-react";
import FuseSearchAndXButton from "../../../../UI/FuseSearchAndXButton";
import { useTranslation } from "react-i18next";
import MyButton from "../../../../UI/MyButton";

const DetailReport6062Filter = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Берём текущие значения из URL
  const accountNumber = searchParams.get("accountNumber") || "";
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") || "");

  const [agent, setAgent] = useState(null);
  const [sortByAgentClicked, setSortByAgentClicked] = useState(false);

  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загрузка агентов при монтировании компонента
  useEffect(() => {
    const loadAgents = async () => {
      setLoading(true);
      try {
        const agentsData = await fetchAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error("Ошибка при загрузке агентов:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);




  // Обновляем URL при wybore agenta
  useEffect(() => {
    const params = { accountNumber };
    if (agent?.id) params.agent = agent.id;
    else delete params.agent;

    params.sortByAgent = sortByAgentClicked;

    setSearchParams(params);
  }, [agent, sortByAgentClicked, setSearchParams]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white">{t("filters")}</h3>
      </div>
      <br />

      <FuseSearchAndXButton
        fetchedLists={agents}
        labelName="agents"
        object={agent}
        setObject={setAgent}
        setFilteredList={setFilteredAgents}
        placeHolderText="search agents..."
        filteredList={filteredAgents}
      />

      <br />
      <MyButton variant="blue" onClick={() => setSortByAgentClicked((prev) => !prev)} >{t("Sort po agentam")}</MyButton>

    </div>
  );
};

export default DetailReport6062Filter;
