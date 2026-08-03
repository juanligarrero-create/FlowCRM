import {
  AlertCircle,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Target,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationCenter.css";

const readStoredArray = (key) => {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);

    return Array.isArray(parsedData) ? parsedData : [];
  } catch {
    return [];
  }
};

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDaysDifference = (dateString) => {
  if (!dateString) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(targetDate.getTime())) {
    return null;
  }

  return Math.round(
    (targetDate.getTime() - today.getTime()) /
      86400000
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function NotificationCenter() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const [readNotificationIds, setReadNotificationIds] =
    useState(() => {
      const savedIds = localStorage.getItem(
        "flowcrm-read-notifications"
      );

      if (!savedIds) {
        return [];
      }

      try {
        const parsedIds = JSON.parse(savedIds);

        return Array.isArray(parsedIds)
          ? parsedIds
          : [];
      } catch {
        return [];
      }
    });

  const contacts = useMemo(
    () => readStoredArray("flowcrm-contacts"),
    []
  );

  const companies = useMemo(
    () => readStoredArray("flowcrm-companies"),
    []
  );

  const deals = useMemo(
    () => readStoredArray("flowcrm-deals"),
    []
  );

  const tasks = useMemo(
    () => readStoredArray("flowcrm-tasks"),
    []
  );

  const todayString = getLocalDateString();

  const notifications = useMemo(() => {
    const generatedNotifications = [];

    tasks.forEach((task) => {
      const daysDifference = getDaysDifference(
        task.dueDate
      );

      if (
        task.status !== "Completed" &&
        daysDifference !== null &&
        daysDifference < 0
      ) {
        generatedNotifications.push({
          id: `task-overdue-${task.id}-${task.dueDate}`,
          category: "Task",
          severity: "danger",
          icon: AlertCircle,
          title: "Task overdue",
          description: task.title,
          detail: `${Math.abs(
            daysDifference
          )} day${
            Math.abs(daysDifference) === 1
              ? ""
              : "s"
          } overdue`,
          route: "/tasks",
          timestamp: task.dueDate,
          sortOrder: 1,
        });

        return;
      }

      if (
        task.status !== "Completed" &&
        task.dueDate === todayString
      ) {
        generatedNotifications.push({
          id: `task-today-${task.id}-${task.dueDate}`,
          category: "Task",
          severity: "warning",
          icon: Clock3,
          title: "Task due today",
          description: task.title,
          detail:
            task.relatedName ||
            task.relatedTo ||
            "CRM task",
          route: "/tasks",
          timestamp: task.dueDate,
          sortOrder: 2,
        });

        return;
      }

      if (
        task.status !== "Completed" &&
        task.priority === "High" &&
        daysDifference !== null &&
        daysDifference > 0 &&
        daysDifference <= 3
      ) {
        generatedNotifications.push({
          id: `task-high-${task.id}-${task.dueDate}`,
          category: "Task",
          severity: "warning",
          icon: Target,
          title: "High-priority task approaching",
          description: task.title,
          detail: `Due in ${daysDifference} day${
            daysDifference === 1 ? "" : "s"
          }`,
          route: "/tasks",
          timestamp: task.dueDate,
          sortOrder: 3,
        });
      }
    });

    deals.forEach((deal) => {
      const daysDifference = getDaysDifference(
        deal.closeDate
      );

      if (
        deal.stage !== "Won" &&
        deal.stage !== "Lost" &&
        deal.closeDate === todayString
      ) {
        generatedNotifications.push({
          id: `deal-today-${deal.id}-${deal.closeDate}`,
          category: "Deal",
          severity: "danger",
          icon: CircleDollarSign,
          title: "Deal closes today",
          description: deal.title,
          detail: formatCurrency(deal.value),
          route: `/deals/${deal.id}`,
          timestamp: deal.closeDate,
          sortOrder: 1,
        });

        return;
      }

      if (
        deal.stage !== "Won" &&
        deal.stage !== "Lost" &&
        daysDifference !== null &&
        daysDifference > 0 &&
        daysDifference <= 3
      ) {
        generatedNotifications.push({
          id: `deal-upcoming-${deal.id}-${deal.closeDate}`,
          category: "Deal",
          severity: "warning",
          icon: CalendarDays,
          title: "Deal closing soon",
          description: deal.title,
          detail: `${formatCurrency(
            deal.value
          )} · ${daysDifference} day${
            daysDifference === 1 ? "" : "s"
          } remaining`,
          route: `/deals/${deal.id}`,
          timestamp: deal.closeDate,
          sortOrder: 2,
        });
      }

      if (deal.stage === "Won") {
        generatedNotifications.push({
          id: `deal-won-${deal.id}`,
          category: "Deal",
          severity: "success",
          icon: Trophy,
          title: "Deal won",
          description: deal.title,
          detail: formatCurrency(deal.value),
          route: `/deals/${deal.id}`,
          timestamp: deal.closeDate || todayString,
          sortOrder: 5,
        });
      }
    });

    companies.forEach((company) => {
      const companyContacts = contacts.filter(
        (contact) =>
          contact.company?.toLowerCase() ===
          company.name?.toLowerCase()
      );

      if (companyContacts.length === 0) {
        generatedNotifications.push({
          id: `company-no-contacts-${company.id}`,
          category: "Company",
          severity: "info",
          icon: Building2,
          title: "Company has no contacts",
          description: company.name,
          detail: "Add a primary contact",
          route: `/companies/${company.id}`,
          timestamp: todayString,
          sortOrder: 4,
        });
      }
    });

    const recentContacts = [...contacts]
      .sort(
        (firstContact, secondContact) =>
          Number(secondContact.id) -
          Number(firstContact.id)
      )
      .slice(0, 2);

    recentContacts.forEach((contact) => {
      generatedNotifications.push({
        id: `contact-added-${contact.id}`,
        category: "Contact",
        severity: "info",
        icon: UserRound,
        title: "Contact available in CRM",
        description: contact.name,
        detail:
          contact.company ||
          contact.email ||
          "CRM contact",
        route: `/contacts/${contact.id}`,
        timestamp: todayString,
        sortOrder: 6,
      });
    });

    return generatedNotifications
      .sort((firstNotification, secondNotification) => {
        if (
          firstNotification.sortOrder !==
          secondNotification.sortOrder
        ) {
          return (
            firstNotification.sortOrder -
            secondNotification.sortOrder
          );
        }

        return String(
          secondNotification.timestamp
        ).localeCompare(
          String(firstNotification.timestamp)
        );
      })
      .slice(0, 20);
  }, [
    contacts,
    companies,
    deals,
    tasks,
    todayString,
  ]);

  const notificationsWithReadState = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        isRead: readNotificationIds.includes(
          notification.id
        ),
      })),
    [notifications, readNotificationIds]
  );

  const unreadCount =
    notificationsWithReadState.filter(
      (notification) => !notification.isRead
    ).length;

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-read-notifications",
      JSON.stringify(readNotificationIds)
    );
  }, [readNotificationIds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const markAsRead = (notificationId) => {
    setReadNotificationIds((currentIds) =>
      currentIds.includes(notificationId)
        ? currentIds
        : [...currentIds, notificationId]
    );
  };

  const markAllAsRead = () => {
    setReadNotificationIds((currentIds) => {
      const allNotificationIds = notifications.map(
        (notification) => notification.id
      );

      return Array.from(
        new Set([
          ...currentIds,
          ...allNotificationIds,
        ])
      );
    });
  };

  const clearReadHistory = () => {
    setReadNotificationIds([]);
  };

  const openNotification = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    navigate(notification.route);
  };
  return (
    <div
      className="notification-center"
      ref={containerRef}
    >
      <button
        type="button"
        className={`notification-center__trigger ${
          isOpen
            ? "notification-center__trigger--open"
            : ""
        }`}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen((currentValue) => !currentValue)
        }
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="notification-center__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
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
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </header>

          {notificationsWithReadState.length === 0 ? (
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
                {notificationsWithReadState.map(
                  (notification) => {
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
                            openNotification(
                              notification
                            )
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
                                {
                                  notification.category
                                }
                              </span>
                            </div>

                            <p>
                              {
                                notification.description
                              }
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
                              markAsRead(
                                notification.id
                              )
                            }
                          >
                            <Check size={15} />
                          </button>
                        )}
                      </article>
                    );
                  }
                )}
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
      )}
    </div>
  );
}

export default NotificationCenter;