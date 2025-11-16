import myAxios from "../../axios";
import MyModal2 from "../../UI/MyModal2";
import { useState, useEffect } from "react";
import MyInput from "../../UI/MyInput";
import MyButton from "../../UI/MyButton";
import { useNotification } from "../../context/NotificationContext";
import { useTranslation } from "react-i18next";

const SetPartnerInEntry = () => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
  const [password, setPassword] = useState("");
  const { showNotification } = useNotification();
  const handleClickButton = async () => {
    console.log("clicked");
    try {
      const res = await myAxios.post("/set_partner_to_entry/", { password });
      console.log("res", res);
      showNotification(t(res.data.message), "success");
    } catch (err) {
      console.log("cant get ", err.response.data.message);
      showNotification(t(err.response.data.message), "error");
    }
  };

  useEffect(() => {
    console.log("password", password);
  }, [password]);

  return (
    <div>
      <button onClick={() => setOpenModal(true)}>Yes</button>

      {openModal && (
        <MyModal2 onClose={() => setOpenModal(false)}>
          <MyInput placeholder="wwedite kod" onChange={(e) => setPassword(e.target.value)} />
          <MyButton onClick={() => handleClickButton()}>Da</MyButton>
        </MyModal2>
      )}
    </div>
  );
};

export default SetPartnerInEntry;
