import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Topbar({ onChangePassword }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="topbar">
      <div className="topbar-actions">
        <button
          className={`icon-btn theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zM1 13h3v-2H1v2zm10 8h2v-3h-2v3zm7.04-2.46l1.79 1.8 1.79-1.8-1.8-1.79-1.78 1.79zM17 13a5 5 0 11-10 0 5 5 0 0110 0z" fill="currentColor" />
            </svg>
          )}
        </button>
        <button
          className="icon-btn change-password-btn"
          onClick={onChangePassword}
          aria-label="Change Password"
          title="Change Password"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-3a4 4 0 118 0v3H6V7z" fill="currentColor" />
          </svg>
        </button>
        <button
          className="icon-btn logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          aria-label="Logout"
          title="Logout"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 002-2V5a2 2 0 00-2-2z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
