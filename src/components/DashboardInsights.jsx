import { useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Users,
  X,
} from "lucide-react";
import "./DashboardInsights.css";

const pipelineStages = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const getStoredData = (key) => {
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

function DashboardInsights() {
  const [calendarDate, setCalendarDate] = useState(
    new Date()
  );

  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);

  const tasks = useMemo(
    () => getStoredData("flowcrm-tasks"),
    []
  );

  const deals = useMemo(
    () => getStoredData("flowcrm-deals"),
    []
  );

  const contacts = useMemo(
    () => getStoredData("flowcrm-contacts"),
    []
  );

  const companies = useMemo(
    () => getStoredData("flowcrm-companies"),
    []
  );

  const todayString = getLocalDateString();

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  );

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  );

  const todoTasks = tasks.filter(
    (task) => task.status === "To Do"
  );

  const overdueTasks = tasks.filter(
    (task) =>
      task.status !== "Completed" &&
      task.dueDate &&
      task.dueDate < todayString
  );

  const dueTodayTasks = tasks.filter(
    (task) =>
      task.status !== "Completed" &&
      task.dueDate === todayString
  );

  const totalTasks = tasks.length;

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks.length / totalTasks) * 100
        );

  const taskBreakdown = [
    {
      label: "To Do",
      value: todoTasks.length,
      className: "todo",
    },
    {
      label: "In Progress",
      value: inProgressTasks.length,
      className: "progress",
    },
    {
      label: "Completed",
      value: completedTasks.length,
      className: "completed",
    },
  ];

  const pipelineData = pipelineStages.map((stage) => {
    const stageDeals = deals.filter(
      (deal) => deal.stage === stage
    );

    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce(
        (total, deal) =>
          total + Number(deal.value || 0),
        0
      ),
    };
  });

  const largestPipelineValue = Math.max(
    ...pipelineData.map((item) => item.value),
    1
  );

  const totalPipelineValue = pipelineData.reduce(
    (total, item) => total + item.value,
    0
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const monthName = calendarDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();

  const firstDayOfMonth = new Date(
    calendarYear,
    calendarMonth,
    1
  );

  const lastDayOfMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  );

  const calendarDays = [];

  for (
    let index = 0;
    index < firstDayOfMonth.getDay();
    index += 1
  ) {
    calendarDays.push(null);
  }

  for (
    let day = 1;
    day <= lastDayOfMonth.getDate();
    day += 1
  ) {
    calendarDays.push(
      new Date(calendarYear, calendarMonth, day)
    );
  }

  const getTasksForDate = (date) => {
    if (!date) {
      return [];
    }

    const dateString = getLocalDateString(date);

    return tasks.filter(
      (task) => task.dueDate === dateString
    );
  };

  const previousMonth = () => {
    setCalendarDate(
      new Date(calendarYear, calendarMonth - 1, 1)
    );
  };

  const nextMonth = () => {
    setCalendarDate(
      new Date(calendarYear, calendarMonth + 1, 1)
    );
  };

  const notifications = [
    ...overdueTasks.map((task) => ({
      id: `overdue-${task.id}`,
      type: "danger",
      icon: AlertCircle,
      title: "Task overdue",
      description: task.title,
    })),

    ...dueTodayTasks.map((task) => ({
      id: `today-${task.id}`,
      type: "warning",
      icon: Clock3,
      title: "Task due today",
      description: task.title,
    })),

    ...deals
      .filter((deal) => deal.stage === "Negotiation")
      .map((deal) => ({
        id: `deal-${deal.id}`,
        type: "info",
        icon: BriefcaseBusiness,
        title: "Deal in negotiation",
        description: deal.title,
      })),

    ...contacts.slice(-2).map((contact) => ({
      id: `contact-${contact.id}`,
      type: "success",
      icon: Users,
      title: "Contact in CRM",
      description: contact.name,
    })),
  ].slice(0, 8);

  const notificationCount =
    overdueTasks.length + dueTodayTasks.length;

  const trends = [
    {
      label: "Contacts",
      value: contacts.length,
      detail: `${contacts.filter(
        (contact) => contact.status === "Lead"
      ).length} leads`,
      icon: Users,
    },
    {
      label: "Companies",
      value: companies.length,
      detail: `${companies.filter(
        (company) => company.status === "Active"
      ).length} active`,
      icon: BriefcaseBusiness,
    },
    {
      label: "Completion",
      value: `${completionRate}%`,
      detail: `${completedTasks.length} completed`,
      icon: CheckCircle2,
    },
    {
      label: "Pipeline",
      value: formatCurrency(totalPipelineValue),
      detail: `${deals.length} deals`,
      icon: DollarSign,
    },
  ];
  return (
    <section className="dashboard-insights">
      <div className="dashboard-insights__header">
        <div>
          <h2>Dashboard Insights</h2>

          <p>
            Pipeline performance, productivity, deadlines,
            and CRM alerts.
          </p>
        </div>

        <div className="dashboard-insights__notification-wrapper">
          <button
            type="button"
            className="dashboard-insights__notification-button"
            onClick={() =>
              setIsNotificationsOpen(
                (currentValue) => !currentValue
              )
            }
          >
            <Bell size={19} />
            Notifications

            {notificationCount > 0 && (
              <span>{notificationCount}</span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="dashboard-insights__notifications">
              <div className="dashboard-insights__notifications-header">
                <div>
                  <h3>Notifications</h3>

                  <p>
                    Tasks, deals, and recent CRM records.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() =>
                    setIsNotificationsOpen(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="dashboard-insights__notifications-list">
                {notifications.length === 0 ? (
                  <div className="dashboard-insights__notifications-empty">
                    <CheckCircle2 size={28} />

                    <p>You are all caught up.</p>

                    <span>
                      There are no important notifications.
                    </span>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notification.icon;

                    return (
                      <article
                        className={`dashboard-insights__notification dashboard-insights__notification--${notification.type}`}
                        key={notification.id}
                      >
                        <div>
                          <Icon size={17} />
                        </div>

                        <span>
                          <strong>
                            {notification.title}
                          </strong>

                          <small>
                            {notification.description}
                          </small>
                        </span>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-insights__trends">
        {trends.map((trend) => {
          const Icon = trend.icon;

          return (
            <article key={trend.label}>
              <div>
                <Icon size={19} />
              </div>

              <span>
                <small>{trend.label}</small>
                <strong>{trend.value}</strong>
                <p>{trend.detail}</p>
              </span>
            </article>
          );
        })}
      </div>

      <div className="dashboard-insights__grid">
        <article className="dashboard-insights__panel">
          <div className="dashboard-insights__panel-header">
            <div>
              <h3>Sales Pipeline</h3>

              <p>
                Deal value distributed by pipeline stage.
              </p>
            </div>

            <strong>
              {formatCurrency(totalPipelineValue)}
            </strong>
          </div>

          <div className="dashboard-insights__pipeline">
            {pipelineData.map((item) => {
              const barHeight =
                item.value === 0
                  ? 4
                  : Math.max(
                      (item.value /
                        largestPipelineValue) *
                        100,
                      12
                    );

              return (
                <div
                  className="dashboard-insights__pipeline-item"
                  key={item.stage}
                >
                  <div className="dashboard-insights__pipeline-chart">
                    <span
                      className={`dashboard-insights__pipeline-bar dashboard-insights__pipeline-bar--${item.stage.toLowerCase()}`}
                      style={{
                        height: `${barHeight}%`,
                      }}
                    />

                    <strong>{item.count}</strong>
                  </div>

                  <div>
                    <span>{item.stage}</span>

                    <small>
                      {formatCurrency(item.value)}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="dashboard-insights__panel">
          <div className="dashboard-insights__panel-header">
            <div>
              <h3>Task Completion</h3>

              <p>
                Current distribution of your CRM tasks.
              </p>
            </div>

            <strong>{completionRate}%</strong>
          </div>

          <div className="dashboard-insights__completion">
            <div className="dashboard-insights__completion-ring">
              <svg viewBox="0 0 120 120">
                <circle
                  className="dashboard-insights__ring-background"
                  cx="60"
                  cy="60"
                  r="49"
                />

                <circle
                  className="dashboard-insights__ring-progress"
                  cx="60"
                  cy="60"
                  r="49"
                  strokeDasharray={`${completionRate * 3.08} 308`}
                />
              </svg>

              <div>
                <strong>{completionRate}%</strong>
                <span>completed</span>
              </div>
            </div>

            <div className="dashboard-insights__completion-list">
              {taskBreakdown.map((item) => (
                <div key={item.label}>
                  <span>
                    <i
                      className={`dashboard-insights__completion-dot dashboard-insights__completion-dot--${item.className}`}
                    />

                    {item.label}
                  </span>

                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="dashboard-insights__panel dashboard-insights__calendar-panel">
          <div className="dashboard-insights__panel-header">
            <div>
              <h3>Task Calendar</h3>

              <p>
                Deadlines and scheduled activities.
              </p>
            </div>

            <CalendarDays size={21} />
          </div>

          <div className="dashboard-insights__calendar-header">
            <button
              type="button"
              aria-label="Previous month"
              onClick={previousMonth}
            >
              <ChevronLeft size={18} />
            </button>

            <strong>{monthName}</strong>

            <button
              type="button"
              aria-label="Next month"
              onClick={nextMonth}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="dashboard-insights__calendar-weekdays">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="dashboard-insights__calendar-grid">
            {calendarDays.map((date, index) => {
              const dateTasks = getTasksForDate(date);

              const isToday =
                date &&
                getLocalDateString(date) === todayString;

              return (
                <div
                  className={`dashboard-insights__calendar-day ${
                    isToday
                      ? "dashboard-insights__calendar-day--today"
                      : ""
                  }`}
                  key={
                    date
                      ? getLocalDateString(date)
                      : `empty-${index}`
                  }
                >
                  {date && (
                    <>
                      <span>{date.getDate()}</span>

                      {dateTasks.length > 0 && (
                        <div>
                          {dateTasks
                            .slice(0, 3)
                            .map((task) => (
                              <i
                                className={`dashboard-insights__calendar-dot dashboard-insights__calendar-dot--${task.priority.toLowerCase()}`}
                                key={task.id}
                                title={task.title}
                              />
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="dashboard-insights__calendar-legend">
            <span>
              <i className="dashboard-insights__calendar-dot dashboard-insights__calendar-dot--high" />
              High
            </span>

            <span>
              <i className="dashboard-insights__calendar-dot dashboard-insights__calendar-dot--medium" />
              Medium
            </span>

            <span>
              <i className="dashboard-insights__calendar-dot dashboard-insights__calendar-dot--low" />
              Low
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

export default DashboardInsights;