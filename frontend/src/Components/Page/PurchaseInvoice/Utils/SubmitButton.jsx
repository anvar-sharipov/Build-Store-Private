import { useFormikContext } from "formik";
import { Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyModal2 from "../../../UI/MyModal2";
import { useState } from "react";
import { FaCheck, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const SubmitButton = ({ dateProwodok, fakturaType, fakturaBgDynamic }) => {
  const { values, setFieldValue } = useFormikContext();
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="flex items-center sm:flex-row gap-4 mt-6 sm:mr-6 ml-5 print:hidden">
      {/* Checkbox с проводкой */}
      <div className="flex items-center gap-3 group">
        <div className="relative">
          <input
            type="checkbox"
            id="prowodka-checkbox"
            className="sr-only peer"
            checked={values.is_entry}
            onChange={(e) => setFieldValue("is_entry", e.target.checked)}
            // добавьте здесь ваш onChange handler
          />
          <label
            htmlFor="prowodka-checkbox"
            className="
          relative flex items-center justify-center
          w-5 h-5 sm:w-6 sm:h-6
          border-2 rounded-lg
          cursor-pointer transition-all duration-300
          border-gray-300 hover:border-blue-500
          dark:border-gray-600 dark:hover:border-blue-400
          peer-checked:bg-gradient-to-br peer-checked:from-blue-500 peer-checked:to-indigo-600
          peer-checked:border-blue-500 peer-checked:shadow-lg peer-checked:shadow-blue-500/25
          dark:peer-checked:from-blue-400 dark:peer-checked:to-indigo-500
          dark:peer-checked:border-blue-400 dark:peer-checked:shadow-blue-400/20
          hover:scale-105 active:scale-95
          focus-within:ring-4 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-400/30
        "
          >
            {/* Галочка */}
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-white opacity-0 peer-checked:opacity-100 
                     transition-all duration-300 transform scale-0 peer-checked:scale-100"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </label>
        </div>

        <label
          htmlFor="prowodka-checkbox"
          className="
        text-sm sm:text-base font-medium cursor-pointer
        text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400
        transition-colors duration-200 select-none
        group-hover:scale-105 transition-transform
      "
        >
          С проводкой
        </label>
      </div>

      {/* Оригинальная кнопка */}
      <button
        type="button"
        onClick={() => setOpenModal(true)}
        title="CTRL + ENTER"
        disabled={
          !values.send || !values.awto_send || !values.partner_send || !(values.products.length > 0) || dateProwodok === "" || (values.is_entry && values.comment.trim().length === 0) // проверка комментария
        }
        className={`
    relative overflow-hidden group
    px-4 sm:px-6 py-2.5 sm:py-3 
    rounded-xl sm:rounded-2xl 
    font-semibold text-sm sm:text-base
    transition-all duration-300 ease-in-out
    transform hover:scale-105 active:scale-95
    shadow-lg hover:shadow-xl
    backdrop-blur-sm
    border border-transparent
    ${
      values.send && values.awto_send && values.partner_send && values.products.length > 0 && dateProwodok !== "" && (!values.is_entry || values.comment.trim().length > 0)
        ? values.is_entry
          ? `
            bg-gradient-to-r from-red-600 via-red-700 to-red-600 
            hover:from-red-700 hover:via-red-800 hover:to-red-700
            text-white shadow-red-500/25 hover:shadow-red-500/40
            dark:from-red-500 dark:via-red-600 dark:to-red-500
            dark:hover:from-red-600 dark:hover:via-red-700 dark:hover:to-red-600
            dark:shadow-red-400/20 dark:hover:shadow-red-400/30
            border-red-500/20 dark:border-red-400/20
            `
          : `
            bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 
            hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700
            text-white shadow-blue-500/25 hover:shadow-blue-500/40
            dark:from-blue-500 dark:via-blue-600 dark:to-indigo-500
            dark:hover:from-blue-600 dark:hover:via-blue-700 dark:hover:to-indigo-600
            dark:shadow-blue-400/20 dark:hover:shadow-blue-400/30
            border-blue-500/20 dark:border-blue-400/20
            `
        : `
          bg-gray-200/80 hover:bg-gray-300/80 
          text-gray-500 cursor-not-allowed 
          shadow-gray-300/20
          dark:bg-gray-800/60 dark:hover:bg-gray-700/60 
          dark:text-gray-400 dark:shadow-gray-900/20
          border-gray-300/30 dark:border-gray-600/30
          backdrop-blur-sm
        `
    }
    print:hidden
    focus:outline-none focus:ring-4 
    ${values.is_entry ? "focus:ring-red-500/30 dark:focus:ring-red-400/30" : "focus:ring-blue-500/30 dark:focus:ring-blue-400/30"}
    disabled:transform-none disabled:shadow-lg
  `}
      >
        {/* Анимированный фон для активной кнопки */}
        {values.send && values.awto_send && values.partner_send && values.products.length > 0 && dateProwodok !== "" && (!values.is_entry || values.comment.trim().length > 0) && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                   transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                   transition-transform duration-1000 ease-in-out"
          />
        )}

        {/* Контент кнопки */}
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
          {dateProwodok === "" ? (
            <>
              <Ban
                className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400 
                         transition-transform duration-200 group-hover:scale-110"
              />
              <span className="truncate max-w-32 sm:max-w-none">{t("choose date prowodok")}</span>
            </>
          ) : (
            <>
              <span className="text-base sm:text-lg filter drop-shadow-sm">💾</span>
              <span className="font-bold tracking-wide">{t("save")}</span>
            </>
          )}
        </div>

        {/* Дополнительный эффект свечения для активной кнопки */}
        {values.send && values.awto_send && values.partner_send && values.products.length > 0 && dateProwodok !== "" && (!values.is_entry || values.comment.trim().length > 0) && (
          <div
            className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r 
              from-blue-600/20 to-indigo-600/20 blur-xl opacity-0 
              group-hover:opacity-100 transition-opacity duration-300 -z-10"
          />
        )}
      </button>
      {openModal && (
        <MyModal2 onClose={() => setOpenModal(false)} myClass={`${fakturaBgDynamic}`}>
          <div className="flex flex-col items-center gap-6 p-8">
            {/* Header with icon */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t("save")} {t(fakturaType)} {t("faktura")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("confirm_save_document")}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 w-full max-w-xs">
              {/* Cancel button */}
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t("cancel")}
                </div>
              </button>

              {/* Save button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    // вызываем submit формы
                    await document.querySelector("form").requestSubmit();
                    // после успешного submit закрываем модалку
                    setOpenModal(false);
                  } catch (err) {
                    console.error(err);
                    // если ошибка, модалку можно не закрывать
                  }
                }}
                className="flex-1 relative group px-4 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 dark:hover:from-blue-700 dark:hover:via-blue-800 dark:hover:to-blue-900 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 shadow-lg hover:shadow-xl"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl" />

                {/* Button content */}
                <div className="relative flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("yes")}
                </div>
              </button>
            </div>

          </div>
        </MyModal2>
      )}
    </div>
  );
};

export default SubmitButton;
