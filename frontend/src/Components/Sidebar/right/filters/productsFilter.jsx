import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function ProductsFilter({ searchParams, setSearchParams, categories, brands, models, tags, warehouses, selectedTags, t, setSearchQuery }) {
  // начальные значения берем из searchParams
  const initialValues = {
    categories: searchParams.get("categories")?.split(",") || [],
    brands: searchParams.get("brands")?.split(",") || [],
    models: searchParams.get("models")?.split(",") || [],
    tags: searchParams.get("tags")?.split(",") || [],
    wholesale_price_min: searchParams.get("wholesale_price_min") || "",
    wholesale_price_max: searchParams.get("wholesale_price_max") || "",
    quantity_min: searchParams.get("quantity_min") || "",
    quantity_max: searchParams.get("quantity_max") || "",
    retail_price_min: searchParams.get("retail_price_min") || "",
    retail_price_max: searchParams.get("retail_price_max") || "",
    ordering: searchParams.get("ordering") || "",
    is_active: searchParams.get("is_active") || "",
    warehouse: searchParams.get("warehouse") ? searchParams.get("warehouse").split(",") : [],
  };

  // Функция для обработки выбора тегов
  // const handleTagsChange = (event) => {
  //   const options = event.target.options;
  //   const selected = [];
  //   for (let i = 0; i < options.length; i++) {
  //     if (options[i].selected) {
  //       selected.push(options[i].value);
  //     }
  //   }
  //   if (selected.length === 0) {
  //     searchParams.delete("tags");
  //   } else {
  //     searchParams.set("tags", selected.join(","));
  //   }
  //   setSearchParams(searchParams);
  // };

  // при сабмите обновляем параметры URL
  const onSubmit = (values) => {
    // создаём копию текущих параметров
    const params = new URLSearchParams(searchParams);

    // console.log("values", values);

    if (values.warehouse.length > 0) {
      params.set("warehouse", values.warehouse.join(","));
    } else {
      params.delete("warehouse");
    }

    // категории — массив в строку
    if (values.categories.length > 0) {
      params.set("categories", values.categories.join(","));
    } else {
      params.delete("categories");
    }

    if (values.is_active !== "") {
      params.set("is_active", values.is_active);
    } else {
      params.delete("is_active");
    }

    if (values.brands.length > 0) {
      params.set("brands", values.brands.join(","));
    } else {
      params.delete("brands");
    }

    if (values.tags.length > 0) {
      params.set("tags", values.tags.join(","));
    } else {
      params.delete("tags");
    }

    if (values.models.length > 0) {
      params.set("models", values.models.join(","));
    } else {
      params.delete("models");
    }

    // цены
    if (values.wholesale_price_min) {
      params.set("wholesale_price_min", values.wholesale_price_min);
    } else {
      params.delete("wholesale_price_min");
    }

    if (values.wholesale_price_max) {
      params.set("wholesale_price_max", values.wholesale_price_max);
    } else {
      params.delete("wholesale_price_max");
    }

    if (values.quantity_min) {
      params.set("quantity_min", values.quantity_min);
    } else {
      params.delete("quantity_min");
    }

    if (values.quantity_max) {
      params.set("quantity_max", values.quantity_max);
    } else {
      params.delete("quantity_max");
    }

    if (values.retail_price_min) {
      params.set("retail_price_min", values.retail_price_min);
    } else {
      params.delete("retail_price_min");
    }

    if (values.retail_price_max) {
      params.set("retail_price_max", values.retail_price_max);
    } else {
      params.delete("retail_price_max");
    }

    // сортировка
    if (values.ordering) {
      params.set("ordering", values.ordering);
    } else {
      params.delete("ordering");
    }

    // Не трогаем параметр 'search', он останется, если был

    setSearchParams(params);
  };

  // Formik передаёт в Yup пустую строку "", если поле пустое. А Yup.number() по умолчанию считает "" невалидным значением. Чтобы "" превратилось в null (и пропустилось как "ничего не введено") — мы добавляем transform.
  const validationSchema = Yup.object({
    wholesale_price_min: Yup.number()
      .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
      .typeError("Должно быть числом")
      .min(0, "Минимум 0")
      .nullable(true),

    wholesale_price_max: Yup.number()
      .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
      .typeError("Должно быть числом")
      .min(0, "Минимум 0")
      .nullable(true)
      .when("wholesale_price_min", (min, schema) => (min ? schema.min(min, "Не может быть меньше минимальной") : schema)),

    quantity_min: Yup.number()
      .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
      .typeError("Должно быть числом")
      .min(0, "Минимум 0")
      .nullable(true),

    quantity_max: Yup.number()
      .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
      .typeError("Должно быть числом")
      .min(0, "Минимум 0")
      .nullable(true)
      .when("quantity_min", (min, schema) => (min ? schema.min(min, "Не может быть меньше минимальной") : schema)),

    retail_price_min: Yup.number()
      .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
      .typeError("Должно быть числом")
      .min(0, "Минимум 0")
      .nullable(true),

    retail_price_max: Yup.number()
      .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
      .typeError("Должно быть числом")
      .min(0, "Минимум 0")
      .nullable(true)
      .when("retail_price_min", (min, schema) => (min ? schema.min(min, "Не может быть меньше минимальной") : schema)),
  });

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({ values, setFieldValue, resetForm }) => (
        <Form className="text-gray-400 text-sm">
          {categories.length > 0 && (
            <div className="border p-2 border-gray-600 rounded">
              <h3 className="font-semibold text-base text-center text-gray-600">{t("categories")}</h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center cursor-pointer select-none whitespace-nowrap px-2 py-1 rounded border border-gray-700  hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={values.categories.includes(String(cat.id))}
                      onChange={() => {
                        if (values.categories.includes(String(cat.id))) {
                          setFieldValue(
                            "categories",
                            values.categories.filter((c) => c !== String(cat.id)),
                          );
                        } else {
                          setFieldValue("categories", [...values.categories, String(cat.id)]);
                        }
                      }}
                      className="mr-1 accent-blue-600 w-4 h-4 "
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div className="border p-2 border-gray-600 rounded mt-4">
              <h3 className="font-semibold text-base text-center text-gray-600">{t("brands")}</h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
                {brands.map((cat) => (
                  <label key={cat.id} className="flex items-center cursor-pointer select-none whitespace-nowrap px-2 py-1 rounded border border-gray-700  hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={values.brands.includes(String(cat.id))}
                      onChange={() => {
                        if (values.brands.includes(String(cat.id))) {
                          setFieldValue(
                            "brands",
                            values.brands.filter((c) => c !== String(cat.id)),
                          );
                        } else {
                          setFieldValue("brands", [...values.brands, String(cat.id)]);
                        }
                      }}
                      className="mr-1 accent-blue-600 w-4 h-4 "
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {models.length > 0 && (
            <div className="border p-2 border-gray-600 rounded mt-4">
              <h3 className="font-semibold text-base text-center text-gray-600">{t("models")}</h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
                {models.map((cat) => (
                  <label key={cat.id} className="flex items-center cursor-pointer select-none whitespace-nowrap px-2 py-1 rounded border border-gray-700  hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={values.models.includes(String(cat.id))}
                      onChange={() => {
                        if (values.models.includes(String(cat.id))) {
                          setFieldValue(
                            "models",
                            values.models.filter((c) => c !== String(cat.id)),
                          );
                        } else {
                          setFieldValue("models", [...values.models, String(cat.id)]);
                        }
                      }}
                      className="mr-1 accent-blue-600 w-4 h-4 "
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="border p-2 border-gray-600 rounded mt-4">
              <h3 className="font-semibold text-base text-center text-gray-600">{t("tags")}</h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center cursor-pointer select-none whitespace-nowrap px-2 py-1 rounded border border-gray-700 hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={values.tags.includes(String(tag.id))}
                      onChange={() => {
                        if (values.tags.includes(String(tag.id))) {
                          setFieldValue(
                            "tags",
                            values.tags.filter((t) => t !== String(tag.id)),
                          );
                        } else {
                          setFieldValue("tags", [...values.tags, String(tag.id)]);
                        }
                      }}
                      className="mr-1 accent-blue-600 w-4 h-4"
                    />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {warehouses.length > 0 && (
            <div className="border p-2 border-gray-600 rounded mt-4">
              <h3 className="font-semibold text-base text-center text-gray-600">{t("warehouse")}</h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
                {warehouses.map((w) => (
                  <label key={w.id} className="flex items-center cursor-pointer select-none whitespace-nowrap px-2 py-1 rounded border border-gray-700 hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={values.warehouse.includes(String(w.id))}
                      onChange={() => {
                        if (values.warehouse.includes(String(w.id))) {
                          setFieldValue(
                            "warehouse",
                            values.warehouse.filter((t) => t !== String(w.id)),
                          );
                        } else {
                          setFieldValue("warehouse", [...values.warehouse, String(w.id)]);
                        }
                      }}
                      className="mr-1 accent-blue-600 w-4 h-4"
                    />
                    <span className="text-sm">{w.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border p-2 border-gray-600 rounded mt-4">
            <h3 className="font-semibold text-base text-center text-gray-600">{t("article")}</h3>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                // onClick={() => setFieldValue("ordering", "id")}
                onClick={() => {
                  setFieldValue("ordering", "id");

                  const params = new URLSearchParams(searchParams);
                  params.set("ordering", "id");
                  setSearchParams(params);
                }}
                className={`flex-1 px-2 py-1 rounded ${values.ordering === "id" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
              >
                {t("oldest first")}
              </button>

              <button
                type="button"
                // onClick={() => setFieldValue("ordering", "-id")}
                onClick={() => {
                  setFieldValue("ordering", "-id");

                  const params = new URLSearchParams(searchParams);
                  params.set("ordering", "-id");
                  setSearchParams(params);
                }}
                className={`flex-1 px-2 py-1 rounded ${values.ordering === "-id" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
              >
                {t("newest first")}
              </button>
            </div>
          </div>

          <div className="border p-2 border-gray-600 rounded mt-4">
            <h3 className="font-semibold text-base text-center text-gray-600">{t("wholesale_price")}</h3>
            <div className="flex">
              <label className="flex flex-col flex-1">
                <span className="mb-1">{t("min")}</span>
                <Field
                  type="number"
                  name="wholesale_price_min"
                  placeholder={t("priceFrom")}
                  className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600 w-20"
                />
                <ErrorMessage name="wholesale_price_min" component="div" className="text-red-500 text-xs mt-0.5" />
              </label>
              <label className="flex flex-col flex-1">
                <span className="mb-1">{t("max")}</span>
                <Field
                  type="number"
                  name="wholesale_price_max"
                  placeholder={t("priceTo")}
                  className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600 w-20"
                />
                <ErrorMessage name="wholesale_price_max" component="div" className="text-red-500 text-xs mt-0.5" />
              </label>
            </div>
          </div>

          <div className="border p-2 border-gray-600 rounded mt-4">
            <h3 className="font-semibold text-base text-center text-gray-600">{t("retail_price")}</h3>
            <div className="flex">
              <label className="flex flex-col flex-1">
                <span className="mb-1">{t("min")}</span>
                <Field
                  type="number"
                  name="retail_price_min"
                  placeholder={t("priceFrom")}
                  className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600 w-20"
                />
                <ErrorMessage name="retail_price_min" component="div" className="text-red-500 text-xs mt-0.5" />
              </label>
              <label className="flex flex-col flex-1">
                <span className="mb-1">{t("max")}</span>
                <Field
                  type="number"
                  name="retail_price_max"
                  placeholder={t("priceTo")}
                  className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600 w-20"
                />
                <ErrorMessage name="retail_price_max" component="div" className="text-red-500 text-xs mt-0.5" />
              </label>
            </div>
          </div>

          <div className="border p-2 border-gray-600 rounded mt-4">
            <h3 className="font-semibold text-base text-center text-gray-600">{t("quantityInStock")}</h3>
            <div className="flex">
              <label className="flex flex-col flex-1">
                <span className="mb-1">{t("min")}</span>
                <Field
                  type="number"
                  name="quantity_min"
                  placeholder={t("priceFrom")}
                  className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600 w-20"
                />
                <ErrorMessage name="quantity_min" component="div" className="text-red-500 text-xs mt-0.5" />
              </label>
              <label className="flex flex-col flex-1">
                <span className="mb-1">{t("max")}</span>
                <Field
                  type="number"
                  name="quantity_max"
                  placeholder={t("priceTo")}
                  className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600 w-20"
                />
                <ErrorMessage name="quantity_max" component="div" className="text-red-500 text-xs mt-0.5" />
              </label>
            </div>
          </div>

          <div className="border p-2 border-gray-600 rounded mt-4">
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-300">{t("status")}</span>
              <Field as="select" name="is_active" className="border rounded px-2 py-1 bg-gray-800 border-gray-600">
                <option value="">{t("all")}</option>
                <option value="true">{t("onlyActive")}</option>
                <option value="false">{t("onlyInactive")}</option>
              </Field>
            </label>
          </div>

          <div className="border p-2 border-gray-600 rounded mt-4">
            <h3 className="font-semibold text-base text-center text-gray-600">{t("sort")}</h3>
            <Field as="select" name="ordering" className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600">
              <option value="">{t("noneSort")}</option>
              {/* <option value="wholesale_price">{t("wholesale_price")} ↑</option> */}
              {/* 👇 ДОБАВЬ ЭТО */}
              {/* <option value="id">ID ↑</option>
              <option value="-id">ID ↓</option> */}
              <option value="-wholesale_price">{t("wholesale_price")} ↓</option>
              <option value="total_quantity2">{t("quantity")} ↑</option>
              <option value="-total_quantity2">{t("quantity")} ↓</option>
              <option value="retail_price">{t("retail_price")} ↑</option>
              <option value="-retail_price">{t("retail_price")} ↓</option>
              <option value="name">{t("name_asc")} ↑</option>
              <option value="-name">{t("name_asc")} ↓</option>
            </Field>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button type="submit" className="flex-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
              {t("acceptFilter")}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                const params = new URLSearchParams(searchParams);
                params.delete("categories");
                params.delete("tags");
                params.delete("warehouse");
                params.delete("brands");
                params.delete("models");
                params.delete("is_active");
                params.delete("wholesale_price_min");
                params.delete("wholesale_price_max");
                params.delete("quantity_min");
                params.delete("quantity_max");
                params.delete("retail_price_min");
                params.delete("retail_price_max");
                params.delete("ordering");
                // search оставить как есть, если нужно можно удалить params.delete("search");
                setSearchParams(params);
                setSearchQuery("");
              }}
              className="flex-1 px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500 transition"
            >
              {t("cancelFilter")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ProductsFilter;
