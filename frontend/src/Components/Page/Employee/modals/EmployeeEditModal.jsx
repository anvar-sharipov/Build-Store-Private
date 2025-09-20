import { useTranslation } from "react-i18next";
import MyModal2 from "../../../UI/MyModal2";
import MyInput from "../../../UI/MyInput";
import MyButton from "../../../UI/MyButton";
import { CiNoWaitingSign } from "react-icons/ci";

const EmployeeEditModal = ({
  openModal,
  selectedEmployee,
  setOpenModal,
  listItemRefs,
  editInputRef,
  editName,
  setEditName,
  handleEditKeyDown,
  refCancelUpdateButton,
  refUpdateButton,
  updateEmployee,
  loadingEdit,
}) => {
  const { t } = useTranslation();
  return (
    <MyModal2
      onClose={() => {
        setOpenModal(false);
        listItemRefs.current[selectedListItemRef]?.focus();
      }}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          {t("editEmployee")}
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("editEmployee")}
          </label>
          <MyInput
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={t("addNewEmployee")}
            className="w-full focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleEditKeyDown}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <MyButton
            ref={refCancelUpdateButton}
            variant="blue"
            onClick={() => {
              setOpenModal(false);
              listItemRefs.current[selectedListItemRef]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                refUpdateButton.current?.focus();
              }
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                editInputRef.current?.focus();
              }
            }}
          >
            {t("cancel")}
          </MyButton>
          <MyButton
            ref={refUpdateButton}
            variant="blue"
            onClick={updateEmployee}
            disabled={loadingEdit}
            className="min-w-[100px]"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                refCancelUpdateButton.current?.focus();
              }
            }}
          >
            {loadingEdit ? (
              <span className="flex items-center gap-2">
                <CiNoWaitingSign className="animate-spin" />
                {t("saving")}
              </span>
            ) : (
              t("change")
            )}
          </MyButton>
        </div>
      </div>
    </MyModal2>
  );
};

export default EmployeeEditModal;
