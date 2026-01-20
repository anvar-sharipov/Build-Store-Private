// context/AuthContext.js
import { createContext, useEffect, useState } from "react";
import myAxios from "./Components/axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authGroup, setAuthGroup] = useState(null);
  const [authGroups, setAuthGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    myAxios
      .get("userinfo/")
      .then((res) => {
        setAuthUser(res.data.authUser);
        setAuthGroup(res.data.authGroup);
        setAuthGroups(res.data.authGroups);
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

//   useEffect(() => {
// }, [authUser, authGroup]);

  return (
    <AuthContext.Provider value={{ authUser, authGroup, authGroups }}>
      {children}
    </AuthContext.Provider>
  );
};
