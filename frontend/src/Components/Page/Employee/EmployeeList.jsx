import { GrEdit } from "react-icons/gr";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { CiNoWaitingSign } from "react-icons/ci";
import { myClass } from "../../tailwindClasses";

const EmployeeList = ({
  employees,
  loading,
  filteredLength,
  loadMore,
  hasMore,
  t,
  search,
  clearSearch,
  listItemRefs,
  handleListKeyDown,
  selectedEmployeeState,
  setEditName,
  setEditId,
  setSelectedListItemRef,
  setOpenModal,
  loadingDeleteId,
  setOpenDeleteModal,
  loadMoreButtonRef,
}) => {
  const [selectedEmployee, setSelectedEmployee] = selectedEmployeeState;

  

  if (!loading && employees.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          {search ? t("noSearchResults") : t("empty")}
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          {search ? t("tryDifferentSearch") : t("addFirstEmployee")}
        </p>
        {search && (
          <button
            onClick={clearSearch}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {t("clearSearch")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="border border-gray-300 dark:border-gray-600 rounded-sm overflow-hidden">
        <ul className={myClass.ul}>
          {employees.map((s, index) => (
            <li
              key={s.id}
              tabIndex={0}
              ref={(el) => (listItemRefs.current[index] = el)}
              onKeyDown={(e) => handleListKeyDown(e, index, s)}
              className={myClass.li}
              onDoubleClick={() => {
                setSelectedEmployee(s);
                setEditName(s.name);
                setEditId(s.id);
                setSelectedListItemRef(index);
                setOpenModal(true);
              }}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {index + 1}.
              </div>
              <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                {s.name}
              </div>
              <div className="flex gap-1 justify-end">
                <button
                  className={`p-1 text-gray-800 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-700 rounded transition-colors dark:text-green-500 print:hidden ${
                    loadingDeleteId === s.id && "opacity-0"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployee(s);
                    setEditName(s.name);
                    setEditId(s.id);
                    setSelectedListItemRef(index);
                    setOpenModal(true);
                  }}
                  title={t("editEmployee")}
                >
                  <GrEdit size={14} />
                </button>
                <button
                  disabled={loadingDeleteId === s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDeleteModal({
                      open: true,
                      data: s,
                      index,
                    });
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors print:hidden"
                  title={
                    loadingDeleteId === s.id
                      ? t("deletingEmployee")
                      : t("deleteEmployee")
                  }
                  aria-busy={loadingDeleteId === s.id}
                >
                  {loadingDeleteId === s.id ? (
                    <CiNoWaitingSign className="animate-spin" size={14} />
                  ) : (
                    <RiDeleteBin2Fill size={14} />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {hasMore && (
        <div className="px-4 py-1 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
          <button
            className={myClass.showMore}
            ref={loadMoreButtonRef}
            tabIndex={0}
            onClick={loadMore}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                listItemRefs.current[employees.length - 1]?.focus();
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                loadMore();
              }
            }}
          >
            {t("loadMore")} ({filteredLength - employees.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
