import { Field, FieldArray, ErrorMessage, useFormikContext } from "formik";
import { useState } from "react";
import MyButton from "../../../../../../UI/MyButton";
import { myClass } from "../../../../../../tailwindClasses";

const WarehousesSection = ({ options, t, warehouses }) => {
  const { values, setFieldValue } = useFormikContext();
  // console.log("options", options);

  return (
    <div>
      <div>
        <FieldArray name="warehouses">
          {({ push, remove }) => (
            <>
              <div className="flex gap-3 items-center mb-2">
                <label className="text-sm font-medium">{t("warehouses")}</label>
                <MyButton
                  type="button"
                  onClick={() => {
                    const existingIds = values.warehouses.map(
                      (w) => w.warehouse
                    );

                    for (const option of options.warehouses) {
                      if (!existingIds.includes(option.value)) {
                        push({ warehouse: option.value, quantity: 0 });
                        break; // остановиться после первого добавленного склада
                      }
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  // sdelaem luchshe diabled true dlya zashity
                  // disabled={
                  //   options.warehouses.length <= values.warehouses.length
                  // }
                  disabled={true}
                >
                  + 1 {t("warehouse")}
                  {/* {t("add")} */}
                </MyButton>
                <MyButton
                  // sdelaem luchshe diabled true dlya zashity
                  // disabled={
                  //   options.warehouses.length <= values.warehouses.length
                  // }
                  disabled={true}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  type="button"
                  onClick={() => {
                    const existingIds = values.warehouses.map(
                      (w) => w.warehouse
                    ); // массив уже выбранных складов

                    options.warehouses.forEach((option) => {
                      if (!existingIds.includes(option.value)) {
                        push({ warehouse: option.value, quantity: 0 });
                      }
                    });
                  }}
                >
                  + Все {t("warehouses")}
                </MyButton>
              </div>
              {values.warehouses && values.warehouses.length > 0 ? (
                values.warehouses.map((wh, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <Field
                      as="select"
                      // disabled={true}
                      name={`warehouses.${index}.warehouse`}
                      className={myClass.input2}
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
                      disabled={true}
                      type="number"
                      name={`warehouses.${index}.quantity`}
                      min="0"
                      step="0.01"
                      placeholder={t("quantity")}
                      className={`${myClass.input2}`}
                      required
                    />

                    <button
                      disabled={true}
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
