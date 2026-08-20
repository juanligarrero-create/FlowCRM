import {
  AlertCircle,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const NotificationsContext = createContext(null);

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

export function NotificationsProvider({ children }) {
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
          timestamp:
            deal.closeDate || todayString,
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
      .sort(
        (
          firstNotification,
          secondNotification
        ) => {
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
        }
      )
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

  const markAsRead = (notificationId) => {
    setReadNotificationIds((currentIds) =>
      currentIds.includes(notificationId)
        ? currentIds
        : [...currentIds, notificationId]
    );
  };

  const markAllAsRead = () => {
    setReadNotificationIds((currentIds) => {
      const allNotificationIds =
        notifications.map(
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

  const value = {
    notifications: notificationsWithReadState,
    unreadCount,
    readNotificationIds,
    markAsRead,
    markAllAsRead,
    clearReadHistory,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(
    NotificationsContext
  );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside a NotificationsProvider"
    );
  }

  return context;
}