import React from "react";

const InfoAboutInvoice = ({ values }) => {
  return (
    <div>
      <div className="text-gray-700 dark:text-gray-200">
        Создано: <span className="font-medium">{values.created_at || "—"}</span>
      </div>
      <div className="text-gray-700 dark:text-gray-200">
        Обновлено: <span className="font-medium">{values.updated_at || "—"}</span>
      </div>
      <div className="text-gray-700 dark:text-gray-200">
        Создал: <span className="font-medium">{values.created_by || "—"}</span>
      </div>
      <div className="text-gray-700 dark:text-gray-200">
        Проводку сделал: <span className={values.entry_created_by ? "font-medium" : "text-red-500"}>{values.entry_created_by || "Пока не проводили"}</span>
      </div>
      <div className="text-gray-700 dark:text-gray-200">
        Дата проводки: <span className={values.entry_created_at ? "font-medium" : "text-red-500"}>{values.entry_created_at || "Пока не проводили"}</span>
      </div>
    </div>
  );
};

export default InfoAboutInvoice;
