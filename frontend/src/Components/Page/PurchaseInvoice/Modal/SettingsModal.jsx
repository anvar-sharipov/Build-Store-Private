import MyModal2 from "../../../UI/MyModal2";
import SettingsPrintVisible from "./SettingsPrintVisible";
import SettingVisible from "./SettingVisible";
import TypeFaktura from "./TypeFaktura";
import { FiEye, FiPrinter } from "react-icons/fi";

const SettingsModal = ({
  setOpenModal,
  printVisibleColumns,
  setPrintVisibleColumns,
  userPrintVisibleColumns,
  adminPrintVisibleColumns,
  visibleColumns,
  setVisibleColumns,
  adminVisibleColumns,
  userVisibleColumns,
}) => {
  return (
    <MyModal2 onClose={() => setOpenModal(false)}>
      <div className="space-y-4">
        {/* Блок с глазом */}
        <div className="relative mt-2">
          {/* иконка по центру сверху */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-full border bg-white dark:bg-gray-800 shadow-sm">
            <FiEye className="w-5 h-5" />
          </div>

          <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
            <SettingVisible
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
              adminVisibleColumns={adminVisibleColumns}
              userVisibleColumns={userVisibleColumns}
            />
          </div>
        </div>

        {/* Блок с принтером */}
        <div className="relative">
          {/* иконка принтера по центру сверху */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-full border bg-white dark:bg-gray-800 shadow-sm">
            <FiPrinter className="w-5 h-5" />
          </div>

          <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
            <SettingsPrintVisible
              printVisibleColumns={printVisibleColumns}
              setPrintVisibleColumns={setPrintVisibleColumns}
              userPrintVisibleColumns={userPrintVisibleColumns}
              adminPrintVisibleColumns={adminPrintVisibleColumns}
            />
          </div>
        </div>
      </div>
    </MyModal2>
  );
};

export default SettingsModal;
