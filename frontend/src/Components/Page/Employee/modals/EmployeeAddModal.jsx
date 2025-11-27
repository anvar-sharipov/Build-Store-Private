import { CiNoWaitingSign } from "react-icons/ci";
import { IoIosAddCircleOutline } from "react-icons/io";
import MyInput from "../../../UI/MyInput";
import MyModal2 from "../../../UI/MyModal2";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const EmployeeAddModal = ({
  setOpenModalAdd,
  addEmployee,
  loadingAdd,
  addInputRef,
  newEmployee,
  setNewEmployee,
  handleAddKeyDown,
  newEmployeeType,
  setNewEmployeeType,
  newEmployeeIsActive,
  setNewEmployeeIsActive,
}) => {
  const { t } = useTranslation();
  
  return (
    <MyModal2
      onClose={() => {
        setOpenModalAdd(false);
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          {t("addNewEmployee")}
        </h2>
        
        <div className="space-y-4 mb-4">
          <div>
            <MyInput
              ref={addInputRef}
              name="new_employee"
              type="text"
              value={newEmployee}
              onChange={(e) => setNewEmployee(e.target.value)}
              placeholder={`${t("employeeName")}...`}
              className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-gray-700"
              onKeyDown={handleAddKeyDown}
              disabled={loadingAdd}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("employeeType")}
            </label>
            <select
              value={newEmployeeType}
              onChange={(e) => setNewEmployeeType(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="driver">{t('driver')}</option>
              <option value="warehouse_worker">{t('warehouseWorker')}</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="new_is_active"
              checked={newEmployeeIsActive}
              onChange={(e) => setNewEmployeeIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="new_is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {t("activeEmployee")}
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={addEmployee}
            disabled={loadingAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t("addEmployee")}
          >
            {loadingAdd ? (
              <CiNoWaitingSign className="animate-spin" />
            ) : (
              <IoIosAddCircleOutline />
            )}
            <span>{t("add")}</span>
          </button>
          
          <button
            onClick={() => setOpenModalAdd(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </MyModal2>
  );
};

export default EmployeeAddModal;

// import { CiNoWaitingSign } from "react-icons/ci";
// import { IoIosAddCircleOutline } from "react-icons/io";
// import MyInput from "../../../UI/MyInput";
// import MyModal2 from "../../../UI/MyModal2";
// import { useTranslation } from "react-i18next";


// const EmployeeAddModal = ({
//   setOpenModalAdd,
//   addEmployee,
//   loadingAdd,
//   addInputRef,
//   newEmployee,
//   setNewEmployee,
//   handleAddKeyDown,
// }) => {
//   const { t } = useTranslation();
//   return (
//     <MyModal2
//       onClose={() => {
//         setOpenModalAdd(false);
//       }}
//     >
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
//         <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
//           {t("addNewEmployee")}
//         </h2>
//         <div className="flex items-end gap-3">
//           <button
//             onClick={addEmployee}
//             disabled={loadingAdd}
//             className="text-4xl text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             title={t("addEmployee")}
//           >
//             {loadingAdd ? (
//               <CiNoWaitingSign className="animate-spin" />
//             ) : (
//               <IoIosAddCircleOutline />
//             )}
//           </button>
//           <MyInput
//             ref={addInputRef}
//             name="new_employee"
//             type="text"
//             value={newEmployee}
//             onChange={(e) => setNewEmployee(e.target.value)}
//             placeholder={`${t("addNewEmployee")}...`}
//             className="flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-gray-700"
//             onKeyDown={handleAddKeyDown}
//             disabled={loadingAdd}
//           />
//         </div>
//       </div>
//     </MyModal2>
//   );
// };

// export default EmployeeAddModal;
