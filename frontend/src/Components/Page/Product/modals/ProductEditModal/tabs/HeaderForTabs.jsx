import { useFormikContext, Field, ErrorMessage } from "formik";

const HeaderForTabs = ({ tabs, activeTab, setActiveTab }) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldError,
    initialValues,
    // validateForm ,
  } = useFormikContext();
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-indigo-200 dark:bg-gray-900 rounded">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const hasError =
            (tab.id === "categories" && errors.category) ||
            (tab.id === "basic" && (errors.name || errors.quantity || errors.units || errors.free_items || errors.base_unit)) ||
            (tab.id === "prices" && (errors.purchase_price || errors.retail_price || errors.wholesale_price)) ||
            (tab.id === "discounts" && errors.quantity_discounts);
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
        ${isActive ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}
        ${hasError ? "bg-red-300 dark:bg-red-500" : ""}
      `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HeaderForTabs;
