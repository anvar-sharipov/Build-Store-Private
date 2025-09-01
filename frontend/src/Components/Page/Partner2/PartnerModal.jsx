import myAxios from "../../axios";
import { Formik, Form, Field } from "formik";
import MyModal from "../../UI/MyModal";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import MySearchInput from "../../UI/MySearchInput";
import { div } from "framer-motion/client";
// import { useFormikContext } from "formik";
import Notification from "../../Notification";
import SmartTooltip from "../../SmartTooltip";
import MyLoading from "../../UI/MyLoading";
import { ROUTES } from "../../../routes";
import { myClass } from "../../tailwindClasses";

const PartnerModal = ({ partnerValue, PartnerSchema, setOpenModal, setPartners, setFocusedPartnerId, openModal }) => {
  // const { values, setFieldValue, handleBlur, touched, errors } = useFormikContext();
  const nameRef = useRef(null);
  const balanceRef = useRef(null);
  const agentRef = useRef(null);
  const accountRef = useRef(null);
  const X_btn_agentRef = useRef(null);
  const X_btn_accountRefs = useRef([]);
  const agentRefs = useRef([]);
  const accountRefs = useRef([]);
  const clientRef = useRef(null);
  const supplierRef = useRef(null);
  const client_and_supplierRef = useRef(null);
  const founderRef = useRef(null);
  const submitButtonRef = useRef(null);
  const is_activeRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState([]);

  const [queryAccount, setQueryAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    nameRef.current?.focus();
    nameRef.current?.select();
  }, []);

  const [isCheckingName, setIsCheckingName] = useState(false);

  useEffect(() => {
    if (!openModal) return;

    const handleKey = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        submitButtonRef.current?.click();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openModal]);

  useEffect(() => {
    if (!query) {
      setAgents([]); // если строка пустая, очищаем список
      return;
    }

    const handler = setTimeout(() => {
      const queryAgent = async () => {
        try {
          const res = await myAxios.get(`search-agents?q=${query}`);
          setAgents(res.data);
        } catch {}
      };
      queryAgent();
    }, 500); // задержка 500 мс

    return () => {
      clearTimeout(handler); // очистка таймера при смене query или размонтировании
    };
  }, [query]);

  useEffect(() => {
    if (!queryAccount) {
      setAccounts([]);
      return;
    }

    const handler = setTimeout(() => {
      const fetchAccounts = async () => {
        try {
          const res = await myAxios.get(`search-accounts?q=${queryAccount}`);
          setAccounts(res.data);
        } catch {}
      };
      fetchAccounts();
    }, 500);
  }, [queryAccount]);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);
  return (
    <div>
      <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
      <MyModal onClose={() => setOpenModal(false)}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{t("addPartner2")}</h2>
        </div>

        <Formik
          key={partnerValue?.id || "new"}
          initialValues={partnerValue}
          validationSchema={PartnerSchema}
          onSubmit={(values) => {
            console.log(values);
            if (values.create) {
              setLoading(true);
              const handleCreate = async () => {
                try {
                  const res = await myAxios.post("partners/", values);
                  const newPartner = res.data.partner;

                  // Добавляем нового партнёра в список
                  setPartners((prev) => [newPartner, ...prev]);
                  setFocusedPartnerId(newPartner.id);
                  showNotification(t(res.data.detail), "success");
                } catch (error) {
                  console.log("ne poluchilos create", error);
                  showNotification(t(error.response.data.detail), "error");
                } finally {
                  setLoading(false);
                  setOpenModal(false);
                }
              };
              handleCreate();
            } else {
              setLoading(true);
              const handleUpdate = async () => {
                // console.log('partnerValueggggg', partnerValue.id);
                // console.log("URL for update:", `partners/${partnerValue?.id}/`);
                // console.log("values.create:", values.create);
                // console.log("agent before update:", values.agent);

                try {
                  const res = await myAxios.put(`partners/${partnerValue?.id}/`, values);
                  // console.log("res.data", res.data);
                  const updatedPartner = res.data.partner;
                  setPartners((prev) => prev.map((p) => (p.id === updatedPartner.id ? updatedPartner : p)));
                  setFocusedPartnerId(updatedPartner.id);

                  showNotification(t(res.data.detail), "success");
                } catch (error) {
                  console.log("full error response:", error.response);
                  showNotification(t(error.response.data.detail), "error");
                } finally {
                  setLoading(false);
                  // setOpenModal(false);
                }
              };
              handleUpdate();
            }
          }}
        >
          {({ values, setFieldValue, errors, touched, handleBlur, setFieldError }) => {
            return (
              <Form className="space-y-5">
                {/* radio */}
                <div className={myClass.border}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("selectType")}</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        name="type"
                        value="klient"
                        className="text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                        ref={clientRef}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                            e.preventDefault();
                            founderRef.current?.focus();
                          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                            e.preventDefault();
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          setFieldValue("type", e.target.value);
                        }}
                        checked={values.type === "klient"}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{t("klient")}</span>
                    </label>

                    {/* <label className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        name="type"
                        value="supplier"
                        className="text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                        ref={supplierRef}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                            e.preventDefault();
                            client_and_supplierRef.current?.focus();
                          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                            e.preventDefault();
                            clientRef.current?.focus();
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          setFieldValue("type", e.target.value);
                        }}
                        checked={values.type === "supplier"}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{t("supplier")}</span>
                    </label> */}

                    {/* <label className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        name="type"
                        value="both"
                        className="text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                        ref={client_and_supplierRef}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                            e.preventDefault();
                            founderRef.current?.focus();
                          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                            e.preventDefault();
                            supplierRef.current?.focus();
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          setFieldValue("type", e.target.value);
                        }}
                        checked={values.type === "both"}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{t("both2")}</span>
                    </label> */}

                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        name="type"
                        value="founder"
                        className="text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                        ref={founderRef}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                            e.preventDefault();
                            nameRef.current?.focus();
                            nameRef.current?.select();
                          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                            e.preventDefault();
                            clientRef.current?.focus();
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          setFieldValue("type", e.target.value);
                        }}
                        checked={values.type === "founder"}
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t("founder")} ({t("supplier")})
                      </span>
                    </label>
                  </div>
                  {touched.type && errors.type && <div className="text-sm text-red-500 mt-1">{errors.type}</div>}
                </div>

                {/* Name input */}
                <div className={myClass.border}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("name")}
                  </label>
                  <div className="relative">
                    <Field
                      autoComplete="off"
                      id="name"
                      name="name"
                      type="text"
                      onBlur={handleBlur}
                      ref={nameRef}
                      disabled={isCheckingName}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          // balanceRef.current?.focus();
                          // balanceRef.current?.select();
                          e.preventDefault();
                          if (values.agent) {
                            X_btn_agentRef.current?.focus();
                          } else {
                            agentRef.current?.focus();
                          }
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          founderRef.current?.focus();
                        } else if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                      className={`w-full p-2 rounded border ${
                        touched.name && errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      } bg-gray-100 dark:bg-gray-800 text-black dark:text-white ${isCheckingName ? "opacity-50" : ""}`}
                    />
                    {isCheckingName && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                  {touched.name && errors.name && <div className="text-sm text-red-500 mt-1">{errors.name}</div>}
                </div>

                {/* Name balance */}
                {/* <div className={myClass.border}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("balance")}
                  </label>
                  <span>{values.balance}</span>
                  <Field
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        nameRef.current?.focus();
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (values.agent) {
                          X_btn_agentRef.current?.focus();
                        } else {
                          agentRef.current?.focus();
                        }
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    id="balanceRef"
                    name="balance"
                    type="number"
                    onBlur={handleBlur}
                    ref={balanceRef}
                    className={`w-full p-2 rounded border ${
                      touched.balance && errors.balance ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                    } bg-gray-100 dark:bg-gray-800 text-black dark:text-white`}
                  />
                  {touched.balance && errors.balance && <div className="text-sm text-red-500 mt-1">{errors.balance}</div>}
                </div> */}

                {/* Name agent */}
                <div className={myClass.border}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("agent")}
                  </label>
                  {values.agent ? (
                    <div className="inline-flex items-center px-3 py-1 mt-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm">
                      <span className="mr-2">{values.agent.name}</span>
                      <button
                        type="button"
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            // balanceRef.current?.focus();
                            // balanceRef.current?.select();
                            nameRef.current?.focus();
                            nameRef.current?.select();
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            is_activeRef.current?.focus();
                            // accountRef.current?.focus();
                            // accountRef.current?.select();
                          }
                        }}
                        ref={X_btn_agentRef}
                        onClick={() => {
                          setFieldValue("agent", null);
                          setTimeout(() => {
                            agentRef.current?.focus();
                          }, 0);
                        }}
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
                        aria-label="Очистить выбранного агента"
                      >
                        ✖
                      </button>
                    </div>
                  ) : (
                    <MySearchInput
                      placeholder={t("searchAgent")}
                      ref={agentRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          // balanceRef.current?.focus();
                          // balanceRef.current?.select();
                          nameRef.current?.focus();
                          nameRef.current?.select();
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          if (agents.length > 0) {
                            agentRefs.current[0]?.focus();
                          } else {
                            is_activeRef.current?.focus();
                            // if (values.accounts) {
                            // } else {
                            //   accountRef.current?.focus();
                            //   accountRef.current?.select();
                            // }
                          }
                        } else if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                      className="w-full"
                    />
                  )}

                  {query && agents.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
                      {agents.map((agent, index) => (
                        <li
                          key={agent.id}
                          tabIndex={0}
                          ref={(el) => (agentRefs.current[index] = el)}
                          className="px-4 py-2 cursor-pointer 
                   hover:bg-gray-100 dark:hover:bg-gray-700 
                   focus:bg-gray-100 dark:focus:bg-gray-700 
                   text-gray-900 dark:text-gray-100 
                   outline-none"
                          onClick={() => {
                            setFieldValue("agent", agent);
                            setAgents([]);
                            setQuery("");
                            accountRef.current?.focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              setFieldValue("agent", agent);
                              setAgents([]);
                              setQuery("");
                              is_activeRef.current?.focus();
                              accountRef.current?.focus();
                            } else if (e.key === "ArrowDown") {
                              e.preventDefault();
                              if (agents.length > index + 1) {
                                agentRefs.current[index + 1]?.focus();
                              }
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              if (index !== 0) {
                                agentRefs.current[index - 1]?.focus();
                              } else {
                                agentRef.current?.focus();
                              }
                            }
                          }}
                        >
                          {agent.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Accounts */}
                {/* <div className="relative">
                  <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("account")}
                  </label>
                  <MySearchInput
                    placeholder={t("searchAccount")}
                    ref={accountRef}
                    value={queryAccount}
                    onChange={(e) => setQueryAccount(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (!values.agent) {
                          agentRef.current?.focus();
                          agentRef.current?.select();
                        } else {
                          X_btn_agentRef.current?.focus();
                        }
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (accounts.length > 0) {
                          accountRefs.current[0]?.focus();
                        } else {
                          if (values.accounts_id.length > 0) {
                            X_btn_accountRefs.current[0]?.focus();
                          } else {
                            is_activeRef.current?.focus();
                          }
                        }
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    className="w-full"
                  />
                  {queryAccount && accounts.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
                      {accounts.map((acc, index) => (
                        <li
                          ref={(el) => (accountRefs.current[index] = el)}
                          tabIndex={0}
                          key={acc.id}
                          className="flex justify-between items-center px-4 py-2 mb-1 rounded-md border 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                      cursor-pointer shadow-sm
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      focus:bg-blue-100 dark:focus:bg-blue-900 focus:outline-none 
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          onClick={() => {
                            setAccounts("");
                            setQueryAccount("");
                            accountRef.current?.focus();
                            console.log("acc", acc);
                            const exists = values.accounts_id.some((a) => a.id === acc.id);
                            if (!exists) {
                              setFieldValue("accounts_id", [...values.accounts_id, acc]);
                            } else {
                              showNotification(t("accountAlreadyAdded"), "error");
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              if (accounts.length > index + 1) {
                                accountRefs.current[index + 1]?.focus();
                              }
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              if (index !== 0) {
                                accountRefs.current[index - 1]?.focus();
                              } else {
                                accountRef.current.focus();
                              }
                            } else if (e.key === "Enter") {
                              e.preventDefault();

                              setAccounts("");
                              setQueryAccount("");
                              accountRef.current?.focus();
                              const exists = values.accounts_id.some((a) => a.id === acc.id);
                              if (!exists) {
                                setFieldValue("accounts_id", [...values.accounts_id, acc]);
                              } else {
                                showNotification(t("accountAlreadyAdded"), "error");
                              }
                            }
                          }}
                        >
                          <span>{acc.number}</span> <span>{t(acc.type)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {values.accounts_id.length > 0 &&
                    values.accounts_id.map((acc, index) => (
                      <div key={acc.id} className="inline-flex items-center px-3 py-1 mt-2 mr-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm">
                        <span className="mr-2">{acc.number}</span>
                        <span className="mr-2">{t(acc.type)}</span>
                        <button
                          ref={(el) => (X_btn_accountRefs.current[index] = el)}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              if (index === 0) {
                                accountRef.current?.focus();
                              } else {
                                X_btn_accountRefs.current[index - 1]?.focus();
                              }
                            } else if (e.key === "ArrowDown") {
                              e.preventDefault();
                              if (values.accounts_id.length > index + 1) {
                                X_btn_accountRefs.current[index + 1]?.focus();
                              } else {
                                is_activeRef.current?.focus();
                              }
                            }
                          }}
                          type="button"
                          onClick={() => {
                            setFieldValue(
                              "accounts_id",
                              values.accounts_id.filter((a) => a.id !== acc.id)
                            );
                            accountRef.current?.focus();
                          }}
                          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
                          aria-label="Убрать счёт"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                </div> */}

                {/* Активность партнёра */}
                <div
                  className={`
                    ${myClass.border}
                    focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400
                    dark:focus-within:ring-blue-500 dark:focus-within:border-blue-500
                    rounded-lg transition
                  `}
                >
                  <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("status")}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      ref={is_activeRef}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          if (!values.agent) {
                            agentRef.current?.focus();
                            agentRef.current?.select();
                          } else {
                            X_btn_agentRef.current?.focus();
                          }
                        }
                      }}
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={values.is_active}
                      onChange={(e) => setFieldValue("is_active", e.target.checked)}
                      className="h-5 w-10 rounded-full appearance-none bg-gray-300 checked:bg-blue-600 dark:bg-gray-600 dark:checked:bg-blue-500 transition duration-300 relative cursor-pointer outline-none"
                      style={{
                        backgroundImage: values.is_active ? "linear-gradient(to right, #3b82f6 50%, transparent 50%)" : "linear-gradient(to right, transparent 50%, #d1d5db 50%)",
                        backgroundSize: "200% 100%",
                        backgroundPosition: values.is_active ? "right bottom" : "left bottom",
                      }}
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-100">{values.is_active ? t("active") : t("inactive")}</span>
                  </div>
                </div>

                {/* Name balance */}
                <div className="flex gap-4 items-center">
                  <label htmlFor="name" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("balance")}
                  </label>
                  <span>{values.balance}</span>
                  {/* <Field
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        nameRef.current?.focus();
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (values.agent) {
                          X_btn_agentRef.current?.focus();
                        } else {
                          agentRef.current?.focus();
                        }
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    id="balanceRef"
                    name="balance"
                    type="number"
                    onBlur={handleBlur}
                    ref={balanceRef}
                    className={`w-full p-2 rounded border ${
                      touched.balance && errors.balance ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                    } bg-gray-100 dark:bg-gray-800 text-black dark:text-white`}
                  /> */}
                  {/* {touched.balance && errors.balance && <div className="text-sm text-red-500 mt-1">{errors.balance}</div>} */}
                </div>

                {/* Submit Button */}
                {loading ? (
                  <MyLoading />
                ) : (
                  <div className="text-center w-24 mx-auto">
                    <SmartTooltip tooltip={t("save")} shortcut="CTRL+ENTER">
                      <button
                        ref={submitButtonRef}
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        {t("save")}
                      </button>
                    </SmartTooltip>
                  </div>
                )}
              </Form>
            );
          }}
        </Formik>
      </MyModal>
    </div>
  );
};

export default PartnerModal;
