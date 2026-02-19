import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../../LanguageSwitcher";

const AccountDropdown = ({
  user,
  logout,
  darkMode,
  setDarkMode,
  i18n,
  authGroup,
  ROUTES,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // закрытие по клику вне блока
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-3 py-2
        bg-gray-800 border border-gray-700
        rounded-xl hover:bg-gray-700
        transition-all duration-200 shadow-lg"
      >
        {user ? (
          <>
            <img
              src={user.photo}
              alt="avatar"
              className="w-8 h-8 rounded-lg object-cover border border-blue-500"
            />
            <span className="text-sm font-medium text-gray-100">
              {user.username}
            </span>
          </>
        ) : (
          <>
            <User className="w-5 h-5 text-gray-300" />
            <span className="text-sm text-gray-200">Account</span>
          </>
        )}

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-64
            bg-gray-900 border border-gray-700
            rounded-2xl shadow-2xl
            p-3 z-50"
          >
            {/* AUTH */}
            {user ? (
              <>
                {authGroup === "admin" && (
                  <Link
                    to={ROUTES.REGISTER}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg
                    text-sm text-gray-200
                    hover:bg-gray-800 transition"
                  >
                    <UserPlus className="w-4 h-4 text-blue-400" />
                    Register
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                  text-sm text-red-400
                  hover:bg-gray-800 hover:text-red-300
                  transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg
                text-sm text-gray-200
                hover:bg-gray-800 transition"
              >
                <LogIn className="w-4 h-4 text-green-400" />
                Login
              </Link>
            )}

            {/* Divider */}
            <div className="my-3 h-px bg-gray-700" />

            {/* Language */}
            <div className="px-2 pb-2">
              <LanguageSwitcher i18n={i18n} />
            </div>

            {/* Theme */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
              text-sm text-gray-200
              hover:bg-gray-800 transition"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  Dark Mode
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountDropdown;
