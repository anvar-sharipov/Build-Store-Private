import { useFormikContext } from "formik";
import Thead from "./Thead";
import Tbody from "./Tbody";
import TFoot from "./TFoot";
import { AiOutlineClose } from "react-icons/ai";

const PTable = ({ printVisibleColumns, visibleColumns, id, refs }) => {
  const { values, setFieldValue } = useFormikContext();

  return (
    <div className="relative mt-6 ml-6 print:m-0 print:p-0">
      {/* Красивый крестик отмены */}
      <button
        type="button"
        onClick={() => setFieldValue("products", [])}
        className="absolute -top-3 -left-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 print:hidden"
        title="Очистить таблицу"
      >
        <AiOutlineClose className="h-4 w-4" />
      </button>

      <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg">
        <table className="table-auto border-collapse min-w-full">
          <Thead printVisibleColumns={printVisibleColumns} visibleColumns={visibleColumns} />
          <Tbody printVisibleColumns={printVisibleColumns} visibleColumns={visibleColumns} id={id} refs={refs} />
          <TFoot printVisibleColumns={printVisibleColumns} visibleColumns={visibleColumns} />
        </table>
      </div>
    </div>
  );
};

export default PTable;