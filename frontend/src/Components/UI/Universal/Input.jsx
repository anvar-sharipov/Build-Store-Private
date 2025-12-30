import { motion } from "framer-motion";
import React, { useState, useRef, useEffect, useId, forwardRef } from "react";
import { useTranslation } from "react-i18next";

const Input = ({
  label="label", // новое свойство для label
  onlyDarkModeInputStyle = false,
  diasbledInput = false,
  type = "text",
  value,
  onChange,
  placeholder="placeholder"
}) => {
  const { t } = useTranslation();
  const inputId = useId(); // уникальный id для связывания label с input

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={inputId} className={`mb-1 text-sm font-medium ${onlyDarkModeInputStyle ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}`}>
          {t(label)}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`h-9 w-full pl-3 pr-3 text-sm rounded-lg border transition placeholder-gray-400
                    ${
                      diasbledInput
                        ? `${
                            onlyDarkModeInputStyle ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-300 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700"
                          } cursor-not-allowed`
                        : `${
                            onlyDarkModeInputStyle
                              ? "bg-gray-900 text-gray-100 border-gray-700 hover:border-gray-600"
                              : "bg-white text-gray-900 border-gray-300 hover:border-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:border-gray-600"
                          } focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500`
                    }`}
      />
    </div>
  );
};

export default Input;
