import { useTranslation } from "react-i18next";

const InvoiceSort = ({ sortInvoice, setSortInvoice }) => {
  const change_type = new Audio("/sounds/change_type.mp3");
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-gray-400 mb-1">
        {t("sort")} № {t("faktura")}
      </label>
      <div className="flex flex-col gap-1 bg-gray-900 border border-gray-700 rounded-lg p-2">
        {[
          { value: "asc", label: t("asc") },
          { value: "desc", label: t("desc") },
        ].map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-gray-200">
            <input
              type="radio"
              name="invoiceSort"
              value={opt.value}
              checked={sortInvoice === opt.value}
              onChange={(e) => {
                change_type.currentTime = 0;
                change_type.play();
                return setSortInvoice(e.target.value);
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

export default InvoiceSort;
