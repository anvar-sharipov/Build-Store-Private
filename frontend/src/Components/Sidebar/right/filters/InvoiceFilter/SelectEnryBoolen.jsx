
const SelectEntryBoolean = ({ selectedEntry, setSelectedEntry }) => {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-gray-400 mb-1">Статус документа</label>
      <div className="flex flex-col gap-1 bg-gray-900 border border-gray-700 rounded-lg p-2">
        {[
          { value: "all", label: "Всё" },
          { value: "entried", label: "Проведённые" },
          { value: "notEntried", label: "Не проведённые" },
        ].map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer text-gray-200"
          >
            <input
              type="radio"
              name="entryStatus"
              value={opt.value}
              checked={selectedEntry === opt.value || (!selectedEntry && opt.value === "all")}
              onChange={(e) => setSelectedEntry(e.target.value)}
              className="accent-blue-500"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SelectEntryBoolean;
