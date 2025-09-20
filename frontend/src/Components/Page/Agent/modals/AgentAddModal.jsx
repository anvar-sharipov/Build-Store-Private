import MyModal2 from "../../../UI/MyModal2";
import MyInput from "../../../UI/MyInput";
import { CiNoWaitingSign } from "react-icons/ci";
import { IoIosAddCircleOutline } from "react-icons/io";

const AgentAddModal = ({
  setOpenAddModal,
  loading,
  newAgent,
  setNewAgent,
  t,
  handleAddAgent,
  addInputRef
}) => {
  return (
    <MyModal2 onClose={() => setOpenAddModal(false)} loading={loading}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          {t("addNewAgent")}
        </h2>
        <div className="flex items-end gap-3">
          <button
            onClick={handleAddAgent}
            disabled={loading}
            className="text-4xl text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <CiNoWaitingSign className="animate-spin" />
            ) : (
              <IoIosAddCircleOutline />
            )}
          </button>
          <MyInput
            ref={addInputRef}
            disabled={loading}
            type="text"
            value={newAgent}
            onChange={(e) => setNewAgent(e.target.value)}
            placeholder={`${t("addNewAgent")}...`}
            className="flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-gray-700"
            onKeyDown={(e) => {
                if (e.key == 'Enter') {
                    handleAddAgent()
                }
            }}
            // disabled={loadingAdd}
          />
        </div>
      </div>
    </MyModal2>
  );
};

export default AgentAddModal;
