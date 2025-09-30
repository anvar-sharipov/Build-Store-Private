
const SelectEntryBoolean = ({ selectedEntry, setSelectedEntry }) => {
  return (
    <div>
      <label className="text-xs font-medium text-gray-400 mb-1 block">
        Статус документа
      </label>
      <select
        value={selectedEntry || "all"}  // по умолчанию "all"
        onChange={(e) => setSelectedEntry(e.target.value)}
        className="w-full h-9 pl-3 pr-3 rounded border bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 border-blue-300 focus:border-blue-500"
      >
        <option value="all">Всё</option>
        <option value="entried">Проведённые</option>
        <option value="notEntried">Не проведённые</option>
      </select>
    </div>
  );
};

export default SelectEntryBoolean;
