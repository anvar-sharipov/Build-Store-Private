import { Field, FieldArray, ErrorMessage, useFormikContext } from "formik";
import { useState } from "react";

const WarehousesSection = ({ options, t }) => {
  const { values, setFieldValue } = useFormikContext();

  return (
    <div>
      <div>
        <FieldArray name="warehouses">
          {({ push, remove }) => (
            <>
              <div className="flex gap-3 items-center mb-2">
                <label className="text-sm font-medium">{t("warehouses")}</label>
                <button
                  type="button"
                  onClick={() => push({ warehouse: "", quantity: "" })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  + {t("add")}
                </button>
              </div>
              {values.warehouses && values.warehouses.length > 0 ? (
                values.warehouses.map((wh, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <Field
                      as="select"
                      name={`warehouses.${index}.warehouse`}
                      className="border p-1 rounded"
                      required
                    >
                      {/* <option value="">{t("Select warehouse")}</option> */}
                      {options.warehouses.map((w) => (
                        <option key={w.value} value={w.value}>
                          {w.label}
                        </option>
                      ))}
                    </Field>

                    <Field
                      type="number"
                      name={`warehouses.${index}.quantity`}
                      min="0"
                      step="0.01"
                      placeholder={t("quantity")}
                      className="border p-1 rounded w-24"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="mb-2 text-gray-500">
                  {t("No warehouses added")}
                </div>
              )}
            </>
          )}
        </FieldArray>
      </div>
    </div>
  );
};

export default WarehousesSection;
