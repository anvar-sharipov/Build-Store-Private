import MyModal2 from "../../../UI/MyModal2";
import SettingsPrintVisible from "./SettingsPrintVisible";
import SettingVisible from "./SettingVisible";
import TypeFaktura from "./TypeFaktura";

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
        {/* <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <TypeFaktura />
        </div> */}

        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <SettingVisible visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} adminVisibleColumns={adminVisibleColumns} userVisibleColumns={userVisibleColumns} />
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
    </MyModal2>
  );
};

export default SettingsModal;
