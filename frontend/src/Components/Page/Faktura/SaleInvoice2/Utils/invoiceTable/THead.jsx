const THead = () => {
  return (
    <thead className="bg-gray-100 dark:bg-gray-700">
      <tr>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          №
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
          Наименование
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Количество
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Единица
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Цена за шт.
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right border border-gray-300 dark:border-gray-600">
          Общая цена
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Цена приход за шт.
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right border border-gray-300 dark:border-gray-600">
          Общая цена приход
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Доход за шт.
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right border border-gray-300 dark:border-gray-600">
          Общая цена Доход
        </th>

        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Скидка за шт.
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right border border-gray-300 dark:border-gray-600">
          Общая цена Скидка
        </th>

        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Объём (м³)
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Вес (кг)
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Длина (см)
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Ширина (см)
        </th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center border border-gray-300 dark:border-gray-600">
          Высота (см)
        </th>

        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right border border-gray-300 dark:border-gray-600">
          X
        </th>
      </tr>
    </thead>
  );
};

export default THead;
