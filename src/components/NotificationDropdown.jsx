import {
  Check,
  CheckCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/Notificationscontext.jsx";

function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    readNotificationIds,
    markAsRead,
    markAllAsRead,
    clearReadHistory,
  } = useNotifications();

  const openNotification = (notification) => {
    markAsRead(notification.id);
    onClose();
    navigate(notification.route);
  };

  return (
    <section className="notification-center__dropdown">
      <header className="notification-center__header">
        <div>
          <h2>Notifications</h2>

          <p>
            {unreadCount === 0
              ? "You are all caught up."
              : `${unreadCount} unread ${
                  unreadCount === 1
                    ? "notification"
                    : "notifications"
                }`}
          </p>
        </div>

        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>

      {notifications.length === 0 ? (
        <div className="notification-center__empty">
          <CheckCircle2 size={31} />

          <h3>No notifications</h3>

          <p>
            Important CRM alerts will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="notification-center__toolbar">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={15} />
              Mark all as read
            </button>

            <button
              type="button"
              onClick={clearReadHistory}
              disabled={
                readNotificationIds.length === 0
              }
            >
              Reset read status
            </button>
          </div>

          <div className="notification-center__list">
            {notifications.map((notification) => {
              const Icon = notification.icon;

              return (
                <article
                  className={`notification-center__item notification-center__item--${notification.severity} ${
                    notification.isRead
                      ? "notification-center__item--read"
                      : ""
                  }`}
                  key={notification.id}
                >
                  <button
                    type="button"
                    className="notification-center__content"
                    onClick={() =>
                      openNotification(notification)
                    }
                  >
                    <div className="notification-center__icon">
                      <Icon size={18} />
                    </div>

                    <div className="notification-center__text">
                      <div>
                        <strong>
                          {notification.title}
                        </strong>

                        <span>
                          {notification.category}
                        </span>
                      </div>

                      <p>
                        {notification.description}
                      </p>

                      <small>
                        {notification.detail}
                      </small>
                    </div>
                  </button>

                  {!notification.isRead && (
                    <button
                      type="button"
                      className="notification-center__read-button"
                      aria-label={`Mark ${notification.title} as read`}
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                    >
                      <Check size={15} />
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          <footer className="notification-center__footer">
            <span>
              Notifications are generated from your
              current CRM data.
            </span>
          </footer>
        </>
      )}
    </section>
  );
}

export default NotificationDropdown;