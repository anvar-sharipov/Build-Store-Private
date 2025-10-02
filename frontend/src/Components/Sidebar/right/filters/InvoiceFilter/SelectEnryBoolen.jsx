import { useTranslation } from "react-i18next";

const SelectEntryBoolean = ({ selectedEntry, setSelectedEntry }) => {
  const change_type = new Audio("/sounds/change_type.mp3");
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-gray-400 mb-1">{t("Document status")}</label>
      <div className="flex flex-col gap-1 bg-gray-900 border border-gray-700 rounded-lg p-2">
        {[
          { value: "all", label: `${t("all")}` },
          { value: "entried", label: `${t("Posted2")}` },
          { value: "notEntried", label: `${t("Not posted2")}` },
        ].map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-gray-200">
            <input
              type="radio"
              name="entryStatus"
              value={opt.value}
              checked={selectedEntry === opt.value || (!selectedEntry && opt.value === "all")}
              onChange={(e) => {
                change_type.currentTime = 0;
                change_type.play();
                return setSelectedEntry(e.target.value);
              }}
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
