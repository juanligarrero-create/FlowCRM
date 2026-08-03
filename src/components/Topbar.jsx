import {
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import GlobalSearch from "./GlobalSearch.jsx";
import "./Topbar.css";

function Topbar({ theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <GlobalSearch />

      <div className="topbar__actions">
        <button
          type="button"
          className="topbar__icon-button"
          aria-label="Toggle theme"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        <button
          type="button"
          className="topbar__icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="topbar__notification-dot" />
        </button>

        <div className="topbar__user">
          <div className="topbar__avatar">
            JL
          </div>

          <div>
            <p>Juan Ligarrero</p>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;