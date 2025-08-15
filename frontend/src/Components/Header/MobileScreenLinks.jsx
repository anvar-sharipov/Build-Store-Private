import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { IoLogInOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import { LiaRegistered } from "react-icons/lia";
import LanguageSwitcher from "../../LanguageSwitcher";

const MobileScreenLinks = ({
  isMenuOpen,
  ROUTES,
  setIsMenuOpen,
  t,
  logout,
  i18n,
  setDarkMode,
  darkMode,
  user,
  setShowAvatarModal,
}) => {
  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="lg:hidden flex justify-between items-start gap-2 mt-3"
        >
          <div className="flex flex-col gap-2">
            <Link
              to={ROUTES.MAIN}
              className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("main")}
            </Link>
            <Link
              to={ROUTES.HARYTLAR}
              className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("towary")}
            </Link>
            <Link
              to={ROUTES.EMPLOYEERS}
              className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("employeers")}
            </Link>
            <Link
              to={ROUTES.PARTNERS_new}
              className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("partners")}
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to={ROUTES.REGISTER}
              className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <LiaRegistered />
              {t("register")}
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <IoLogInOutline />
              {t("login")}
            </Link>
            <div
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center"
            >
              <TbLogout2 />
              {t("logout")}
            </div>

            <LanguageSwitcher
              i18n={i18n}
              classList="bg-white dark:bg-gray-700 hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600"
            />

            <div
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
              className="hover:underline text-blue-500 hover:text-blue-700 flex gap-1 items-center"
            >
              {darkMode
                ? `🌙 ${t("theme")}: ${t("dark")}`
                : `☀️ ${t("theme")}: ${t("light")}`}
            </div>

            {user && (
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={user.photo}
                  alt="user"
                  className="w-8 h-8 rounded-full object-cover border border-gray-400"
                  onClick={() => setShowAvatarModal(true)}
                />
                <span className="text-gray-400">{user.username}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileScreenLinks;
