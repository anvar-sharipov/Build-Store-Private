
const InvoiceSort = ({ sortInvoice, setSortInvoice }) => {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-gray-400 mb-1">Сортировка</label>
      <div className="flex flex-col gap-1 bg-gray-900 border border-gray-700 rounded-lg p-2">
        {[
          { value: "asc", label: "По возрастанию" },
          { value: "desc", label: "По убыванию" },
        ].map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer text-gray-200"
          >
            <input
              type="radio"
              name="invoiceSort"
              value={opt.value}
              checked={sortInvoice === opt.value}
              onChange={(e) => setSortInvoice(e.target.value)}
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
