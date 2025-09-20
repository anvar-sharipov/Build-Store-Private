import { CiNoWaitingSign } from "react-icons/ci";
import { IoIosAddCircleOutline } from "react-icons/io";
import MyInput from "../../../UI/MyInput";
import MyModal2 from "../../../UI/MyModal2";
import { useTranslation } from "react-i18next";


const EmployeeAddModal = ({
  setOpenModalAdd,
  addEmployee,
  loadingAdd,
  addInputRef,
  newEmployee,
  setNewEmployee,
  handleAddKeyDown,
}) => {
  const { t } = useTranslation();
  return (
    <MyModal2
      onClose={() => {
        setOpenModalAdd(false);
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          {t("addNewEmployee")}
        </h2>
        <div className="flex items-end gap-3">
          <button
            onClick={addEmployee}
            disabled={loadingAdd}
            className="text-4xl text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t("addEmployee")}
          >
            {loadingAdd ? (
              <CiNoWaitingSign className="animate-spin" />
            ) : (
              <IoIosAddCircleOutline />
            )}
          </button>
          <MyInput
            ref={addInputRef}
            name="new_employee"
            type="text"
            value={newEmployee}
            onChange={(e) => setNewEmployee(e.target.value)}
            placeholder={`${t("addNewEmployee")}...`}
            className="flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-gray-700"
            onKeyDown={handleAddKeyDown}
            disabled={loadingAdd}
          />
        </div>
      </div>
    </MyModal2>
  );
};

export default EmployeeAddModal;
