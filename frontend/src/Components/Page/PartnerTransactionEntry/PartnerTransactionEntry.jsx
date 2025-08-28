import myAxios from "../../axios";
import { useTranslation } from "react-i18next";
import Notification from "../../Notification";
import MyModal from "../../UI/MyModal";
import MyLoading from "../../UI/MyLoading";
import { Formik, Form, Field } from "formik";
import { useEffect, useState, useRef, useMemo } from "react";
import MySearchInput from "../../UI/MySearchInput";
import PartnerSearch from "./PartnerSearch";
import DebitAccountSearch from "./DebitAccountSearch";
import KreditAccountSearch from "./KreditAccountSearch";
import Comment from "./Comment";
import Amount from "./Amount";
import SmartTooltip from "../../SmartTooltip";
import MyLoading2 from "../../UI/MyLoading2";

const PartnerTransactionEntry = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const price_inputRef = useRef(null);
  const comment_Ref = useRef(null);

  const [notification, setNotification] = useState({ message: "", type: "" });
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // partner
  const partnerInputRef = useRef(null);
  const pertnerRefs = useRef([]);
  const X_partner_ref = useRef(null);

  // debet
  const debetRefs = useRef([]);
  const debitInputRef = useRef(null);
  const X_debet_ref = useRef(null);

  // kredet
  const kreditRefs = useRef([]);
  const kreditInputRef = useRef(null);
  const X_kredit_ref = useRef(null);

  useEffect(() => {
    document.title = t("entrys");
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 p-6">
      {loading && <MyLoading2 />}
      <h1 className="text-2xl font-semibold mb-6 text-center">{t("Posting of partner payments")}</h1>

      <Formik
        initialValues={{
          partner: null,
          debet: null,
          kredit: null,
          amount: 0,
          comment: "",
        }}
        onSubmit={(values, actions) => {
          if (loading) return;
          const sendTransactions = async () => {
            setLoading(true);
            try {
              const res = await myAxios.post("partner-transaction/", values);
              console.log("res.data.partner.balance:", res.data.partner.balance);
              actions.setFieldValue("partner.balance", parseFloat(res.data.partner.balance));
              showNotification(t(res.data.detail), "success");
            } catch (error) {
              console.log("ne udalos sdelat prowodku ".error);
              showNotification(t(error.response.data.detail), "error");
            } finally {
              setLoading(false);
            }
          };
          sendTransactions();
          console.log("Submit values:", values);
          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting, submitForm }) => {
          useEffect(() => {
            const handleKeyDown = (event) => {
              if (event.ctrlKey && event.key === "Enter") {
                event.preventDefault();
                submitForm(); // Используем напрямую из context
              }
            };

            window.addEventListener("keydown", handleKeyDown);
            return () => {
              window.removeEventListener("keydown", handleKeyDown);
            };
          }, [submitForm]);

          return (
            <Form className="max-w-2xl w-full mx-auto space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-md shadow-md">
              <PartnerSearch
                partnerInputRef={partnerInputRef}
                pertnerRefs={pertnerRefs}
                debitInputRef={debitInputRef}
                X_partner_ref={X_partner_ref}
                X_debet_ref={X_debet_ref}
                kreditInputRef={kreditInputRef}
                X_kredit_ref={X_kredit_ref}
                price_inputRef={price_inputRef}
              />

              {/* <DebitAccountSearch
                debitInputRef={debitInputRef}
                partnerInputRef={partnerInputRef}
                debetRefs={debetRefs}
                X_partner_ref={X_partner_ref}
                X_debet_ref={X_debet_ref}
                kreditInputRef={kreditInputRef}
                X_kredit_ref={X_kredit_ref}
                price_inputRef={price_inputRef}
              /> */}
              {/* <KreditAccountSearch
                kreditRefs={kreditRefs}
                debitInputRef={debitInputRef}
                partnerInputRef={partnerInputRef}
                debetRefs={debetRefs}
                X_partner_ref={X_partner_ref}
                X_debet_ref={X_debet_ref}
                kreditInputRef={kreditInputRef}
                X_kredit_ref={X_kredit_ref}
                price_inputRef={price_inputRef}
              /> */}
              <Amount price_inputRef={price_inputRef} X_kredit_ref={X_kredit_ref} kreditInputRef={kreditInputRef} comment_Ref={comment_Ref} X_partner_ref={X_partner_ref} partnerInputRef={partnerInputRef} />
              <Comment comment_Ref={comment_Ref} price_inputRef={price_inputRef} />

              <SmartTooltip tooltip={t("Провести") || "Провести"} shortcut="Ctrl+Enter">
                <button
                  type="submit"
                  // disabled={isSubmitting}
                  disabled={isSubmitting || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded transition-colors duration-200"
                >
                  {t("toPay")}
                </button>
              </SmartTooltip>
            </Form>
          );
        }}
      </Formik>
      <Notification message={t(notification.message)} type={notification.type} onClose={() => setNotification({ message: "", type: "" })} />
    </div>
  );
};

export default PartnerTransactionEntry;
