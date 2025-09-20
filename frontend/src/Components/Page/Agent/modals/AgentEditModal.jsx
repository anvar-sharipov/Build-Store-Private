import MyModal2 from "../../../UI/MyModal2";
import MyButton from "../../../UI/MyButton";
import MyInput from "../../../UI/MyInput";
import { useEffect, useRef, useState } from "react";
import { CiNoWaitingSign } from "react-icons/ci";

const AgentEditModal = ({
  openEditModal,
  setOpenEditModal,
  t,
  setLoadingEdit,
  loadingEdit,
  handleEditAgent,
}) => {
    const [name, setName] = useState(openEditModal.data.name);
    const OKBtnRef = useRef(null)
    const cancelBtnRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        inputRef.current?.focus()
    })
  return (
    <MyModal2
      onClose={() => {
        setOpenEditModal({ open: false, data: null, index: null });
      }}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          {t("editAgent")}
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("editAgent")}
          </label>
          <MyInput
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("editAgent")}
            className="w-full focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                cancelBtnRef.current?.focus();
              }
              if (e.key === "Enter") {
                e.preventDefault();
                handleEditAgent(openEditModal.data.id, name)
                inputRef.current?.focus();
              }
            }}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <MyButton
            ref={cancelBtnRef}
            variant="blue"
            disabled={loadingEdit}
            onClick={() => {
              setOpenEditModal({open:false, data:null, index:null});
            //   listItemRefs.current[selectedListItemRef]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                OKBtnRef.current?.focus();
              }
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                inputRef.current?.focus();
              }
            }}
          >
            {t("cancel")}
          </MyButton>
          <MyButton
            ref={OKBtnRef}
            variant="blue"
            onClick={() => handleEditAgent(openEditModal.data.id, name)}
            disabled={loadingEdit}
            className="min-w-[100px]"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                cancelBtnRef.current?.focus();
              }
            }}
          >
            {loadingEdit ? (
              <span className="flex items-center gap-2">
                <CiNoWaitingSign className="animate-spin" />
                {t('saving')}
              </span>
            ) : (
              t("edit")
            )}
          </MyButton>
        </div>
      </div>
    </MyModal2>
  );
};

export default AgentEditModal;
