// hooks/useAutoLogout.js
import { useEffect, useRef, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const SESSION_TIMEOUT = 1 * 60 * 1000; 

const useAutoLogout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleLogout = () => {
      logout();
      navigate("/sessionexpired");
    };

    const resetTimer = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(handleLogout, SESSION_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Start on mount

    return () => {
      clearTimeout(timeoutRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [logout, navigate]);
};

export default useAutoLogout;
