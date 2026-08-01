import { Search, Bell, Moon } from "lucide-react";
import "./Topbar.css";

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search contacts, campaigns, or tasks..."
        />
      </div>

      <div className="topbar__actions">
        <button className="topbar__icon-button" aria-label="Toggle theme">
          <Moon size={19} />
        </button>

        <button className="topbar__icon-button" aria-label="Notifications">
          <Bell size={19} />
          <span className="topbar__notification-dot" />
        </button>

        <div className="topbar__user">
          <div className="topbar__avatar">JL</div>

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