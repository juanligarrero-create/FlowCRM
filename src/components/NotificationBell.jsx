import { Bell } from "lucide-react";
import { useNotifications } from "../context/Notificationscontext.jsx";

function NotificationBell({ isOpen, onClick }) {
  const { unreadCount } = useNotifications();

  return (
    <button
      type="button"
      className={`notification-center__trigger ${
        isOpen
          ? "notification-center__trigger--open"
          : ""
      }`}
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
      aria-expanded={isOpen}
      onClick={onClick}
    >
      <Bell size={19} />

      {unreadCount > 0 && (
        <span className="notification-center__badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

export default NotificationBell;