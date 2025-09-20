import MyModal2 from "../../../UI/MyModal2";
import { CiNoWaitingSign } from "react-icons/ci";
import { RiDeleteBin2Fill } from "react-icons/ri";
import MyButton from "../../../UI/MyButton";
import { useState, useRef, useEffect } from "react";

const AgentDeleteModal = ({
  openDeleteModal,
  setOpenDeleteModal,
  t,
  loadingDelete,
  setLoadingDelete,
  handleDeleteAgent,
}) => {
  const cancelBtnRef = useRef(null);
  const OkBtnRef = useRef(null);

  useEffect(() => {
    cancelBtnRef.current?.focus();
  }, []);

  return (
    <MyModal2
      onClose={() =>
        setOpenDeleteModal({ open: false, data: null, index: null })
      }
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex gap-2 items-center">
          <button
            disabled={loadingDelete}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            {loadingDelete ? (
              <CiNoWaitingSign className="animate-spin" size={28} />
            ) : (
              <RiDeleteBin2Fill size={28} />
            )}
          </button>
          <span>{t("deleteAgent")}</span>
        </h2>
        <div className="mb-4">{openDeleteModal?.data?.name}</div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <MyButton
            disabled={loadingDelete}
            ref={cancelBtnRef}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                OkBtnRef.current?.focus();
              }
            }}
            variant="blue"
            onClick={() => {
              setOpenDeleteModal({ open: false, data: null, index: null });
            }}
          >
            {t("cancel")}
          </MyButton>
          <MyButton
            ref={OkBtnRef}
            variant="blue"
            onClick={() => handleDeleteAgent(openDeleteModal.data.id)}
            disabled={loadingDelete}
            className="min-w-[100px]"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                cancelBtnRef.current?.focus();
              }
            }}
          >
            {t("delete")}
          </MyButton>
        </div>
      </div>
    </MyModal2>
  );
};

export default AgentDeleteModal;
