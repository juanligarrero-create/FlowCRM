import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardInsights from "../components/DashboardInsights.jsx";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  MessageCircle,
  Plus,
  Users,
} from "lucide-react";
import "./Dashboard.css";

const fallbackContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@brightlabs.com",
    company: "Bright Labs",
    status: "Lead",
  },
  {
    id: 2,
    name: "James Miller",
    email: "james@northstar.io",
    company: "Northstar",
    status: "Customer",
  },
  {
    id: 3,
    name: "Anna Lopez",
    email: "anna@greentech.co",
    company: "GreenTech",
    status: "Prospect",
  },
  {
    id: 4,
    name: "Michael Chen",
    email: "michael@apexsystems.com",
    company: "Apex Systems",
    status: "Customer",
  },
];

const fallbackCompanies = [
  {
    id: 1,
    name: "Bright Labs",
    status: "Active",
    pipelineValue: 12500,
  },
  {
    id: 2,
    name: "Northstar",
    status: "Active",
    pipelineValue: 8200,
  },
  {
    id: 3,
    name: "GreenTech",
    status: "Prospect",
    pipelineValue: 18500,
  },
  {
    id: 4,
    name: "Apex Systems",
    status: "Inactive",
    pipelineValue: 0,
  },
];

const fallbackTasks = [
  {
    id: 1,
    title: "Call Sarah Johnson",
    status: "To Do",
    priority: "High",
    dueDate: "2026-08-03",
    relatedName: "Sarah Johnson",
  },
  {
    id: 2,
    title: "Send proposal to GreenTech",
    status: "In Progress",
    priority: "High",
    dueDate: "2026-08-04",
    relatedName: "GreenTech",
  },
  {
    id: 3,
    title: "Prepare Northstar demo",
    status: "To Do",
    priority: "Medium",
    dueDate: "2026-08-06",
    relatedName: "Northstar",
  },
  {
    id: 4,
    title: "Review campaign performance",
    status: "Completed",
    priority: "Low",
    dueDate: "2026-08-01",
    relatedName: "",
  },
];

const getStoredData = (key, fallbackValue = []) => {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return fallbackValue;
  }

  try {
    const parsedData = JSON.parse(savedData);

    return Array.isArray(parsedData)
      ? parsedData
      : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const getLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function Dashboard() {
  const navigate = useNavigate();

  const contacts = useMemo(
    () =>
      getStoredData(
        "flowcrm-contacts",
        fallbackContacts
      ),
    []
  );

  const companies = useMemo(
    () =>
      getStoredData(
        "flowcrm-companies",
        fallbackCompanies
      ),
    []
  );

  const tasks = useMemo(
    () =>
      getStoredData("flowcrm-tasks", fallbackTasks),
    []
  );

  const deals = useMemo(
    () => getStoredData("flowcrm-deals", []),
    []
  );

  const todayString = getLocalDateString();

  const activeTasks = tasks.filter(
    (task) => task.status !== "Completed"
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  );

  const dueTodayTasks = activeTasks.filter(
    (task) => task.dueDate === todayString
  );

  const overdueTasks = activeTasks.filter(
    (task) =>
      task.dueDate && task.dueDate < todayString
  );

  const pipelineValue = deals.length
    ? deals.reduce(
        (total, deal) =>
          total + Number(deal.value || 0),
        0
      )
    : companies.reduce(
        (total, company) =>
          total +
          Number(company.pipelineValue || 0),
        0
      );

  const activeCompanies = companies.filter(
    (company) =>
      company.status?.toLowerCase() === "active"
  ).length;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatTaskDate = (date) => {
    if (!date) {
      return "No due date";
    }

    if (date === todayString) {
      return "Today";
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowString = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(
        2,
        "0"
      ),
      String(tomorrow.getDate()).padStart(2, "0"),
    ].join("-");

    if (date === tomorrowString) {
      return "Tomorrow";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const upcomingTasks = [...activeTasks]
    .sort((firstTask, secondTask) => {
      if (!firstTask.dueDate) {
        return 1;
      }

      if (!secondTask.dueDate) {
        return -1;
      }

      return firstTask.dueDate.localeCompare(
        secondTask.dueDate
      );
    })
    .slice(0, 5);

  const recentContacts = [...contacts]
    .sort(
      (firstContact, secondContact) =>
        Number(secondContact.id) -
        Number(firstContact.id)
    )
    .slice(0, 2);

  const recentCompanies = [...companies]
    .sort(
      (firstCompany, secondCompany) =>
        Number(secondCompany.id) -
        Number(firstCompany.id)
    )
    .slice(0, 1);

  const recentCompletedTask = [...completedTasks]
    .sort(
      (firstTask, secondTask) =>
        Number(secondTask.id) -
        Number(firstTask.id)
    )
    .slice(0, 1);

  const recentActivity = [
    ...recentContacts.map((contact) => ({
      id: `contact-${contact.id}`,
      type: "contact",
      title: contact.name,
      description: `was added as a ${contact.status?.toLowerCase() || "contact"}`,
      initials: contact.name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
      route: `/contacts/${contact.id}`,
    })),

    ...recentCompanies.map((company) => ({
      id: `company-${company.id}`,
      type: "company",
      title: company.name,
      description: "was added to the companies workspace",
      initials: company.name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
      route: `/companies/${company.id}`,
    })),

    ...recentCompletedTask.map((task) => ({
      id: `task-${task.id}`,
      type: "task",
      title: task.title,
      description: "was marked as completed",
      initials: "✓",
      route: "/tasks",
    })),
  ].slice(0, 4);

  const stats = [
    {
      title: "Total Contacts",
      value: contacts.length,
      change: `${contacts.filter(
        (contact) => contact.status === "Lead"
      ).length} active leads`,
      icon: Users,
      route: "/contacts",
    },
    {
      title: "Companies",
      value: companies.length,
      change: `${activeCompanies} active companies`,
      icon: Building2,
      route: "/companies",
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      change: `${deals.length} total deals`,
      icon: DollarSign,
      route: "/deals",
    },
    {
      title: "Open Tasks",
      value: activeTasks.length,
      change:
        overdueTasks.length > 0
          ? `${overdueTasks.length} overdue`
          : "No overdue tasks",
      icon: CheckCircle2,
      route: "/tasks",
    },
  ];
  return (
    <div className="dashboard">
      <section className="dashboard__header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome back, Juan. Here is what is
            happening in your CRM today.
          </p>
        </div>

        <button
          type="button"
          className="dashboard__button"
          onClick={() => navigate("/contacts")}
        >
          <Plus size={18} />
          New Contact
        </button>
      </section>

      <section className="dashboard__stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              type="button"
              className="dashboard__card"
              key={stat.title}
              onClick={() => navigate(stat.route)}
            >
              <div className="dashboard__card-icon">
                <Icon size={22} />
              </div>

              <p className="dashboard__card-title">
                {stat.title}
              </p>

              <h2>{stat.value}</h2>

              <p className="dashboard__card-change">
                {stat.change}
              </p>
            </button>
          );
        })}
      </section>

      <section className="dashboard__overview">
        <article className="dashboard__overview-card">
          <div className="dashboard__overview-icon dashboard__overview-icon--today">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Due today</span>
            <strong>{dueTodayTasks.length}</strong>
          </div>
        </article>

        <article className="dashboard__overview-card">
          <div className="dashboard__overview-icon dashboard__overview-icon--overdue">
            <AlertCircle size={21} />
          </div>

          <div>
            <span>Overdue tasks</span>
            <strong>{overdueTasks.length}</strong>
          </div>
        </article>

        <article className="dashboard__overview-card">
          <div className="dashboard__overview-icon dashboard__overview-icon--completed">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedTasks.length}</strong>
          </div>
        </article>

        <article className="dashboard__overview-card">
          <div className="dashboard__overview-icon dashboard__overview-icon--deals">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <span>Deals</span>
            <strong>{deals.length}</strong>
          </div>
        </article>
      </section>

      <section className="dashboard__content">
        <article className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div>
              <h2>Recent Activity</h2>

              <p>
                Latest updates from your CRM records.
              </p>
            </div>

            <button
              type="button"
              className="dashboard__text-button"
              onClick={() => navigate("/contacts")}
            >
              View contacts
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="dashboard__activity-list">
            {recentActivity.length === 0 ? (
              <div className="dashboard__empty">
                <MessageCircle size={27} />

                <p>No recent activity yet.</p>

                <span>
                  New contacts, companies, and completed
                  tasks will appear here.
                </span>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <button
                  type="button"
                  className="dashboard__activity"
                  key={activity.id}
                  onClick={() =>
                    navigate(activity.route)
                  }
                >
                  <div className="dashboard__activity-icon">
                    {activity.initials || "CRM"}
                  </div>

                  <div>
                    <p>
                      <strong>{activity.title}</strong>{" "}
                      {activity.description}
                    </p>

                    <span>Recent CRM activity</span>
                  </div>

                  <ArrowRight size={16} />
                </button>
              ))
            )}
          </div>
        </article>

        <article className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div>
              <h2>Upcoming Tasks</h2>

              <p>
                Your next priorities and deadlines.
              </p>
            </div>

            <button
              type="button"
              className="dashboard__text-button"
              onClick={() => navigate("/tasks")}
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="dashboard__task-list">
            {upcomingTasks.length === 0 ? (
              <div className="dashboard__empty">
                <CheckCircle2 size={27} />

                <p>No open tasks.</p>

                <span>
                  You have completed everything currently
                  assigned.
                </span>
              </div>
            ) : (
              upcomingTasks.map((task) => {
                const isTaskOverdue =
                  task.dueDate &&
                  task.dueDate < todayString;

                return (
                  <button
                    type="button"
                    className="dashboard__task"
                    key={task.id}
                    onClick={() => navigate("/tasks")}
                  >
                    <span
                      className={`dashboard__task-status dashboard__task-status--${task.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {task.status === "In Progress" ? (
                        <Clock3 size={17} />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}
                    </span>

                    <span className="dashboard__task-content">
                      <strong>{task.title}</strong>

                      <small>
                        {task.relatedName ||
                          task.relatedTo ||
                          "General task"}
                      </small>
                    </span>

                    <span
                      className={`dashboard__task-date ${
                        isTaskOverdue
                          ? "dashboard__task-date--overdue"
                          : ""
                      }`}
                    >
                      {isTaskOverdue
                        ? "Overdue"
                        : formatTaskDate(task.dueDate)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="dashboard__bottom-grid">
        <article className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div>
              <h2>CRM Health</h2>

              <p>
                Quick overview of your current workspace.
              </p>
            </div>
          </div>

          <div className="dashboard__health-list">
            <div>
              <span>
                <Users size={17} />
                Contacts with customer status
              </span>

              <strong>
                {
                  contacts.filter(
                    (contact) =>
                      contact.status === "Customer"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>
                <Building2 size={17} />
                Active companies
              </span>

              <strong>{activeCompanies}</strong>
            </div>

            <div>
              <span>
                <AlertCircle size={17} />
                Tasks requiring attention
              </span>

              <strong>{overdueTasks.length}</strong>
            </div>

            <div>
              <span>
                <DollarSign size={17} />
                Pipeline value
              </span>

              <strong>
                {formatCurrency(pipelineValue)}
              </strong>
            </div>
          </div>
        </article>

        <article className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Jump directly into your most common work.
              </p>
            </div>
          </div>

          <div className="dashboard__quick-actions">
            <button
              type="button"
              onClick={() => navigate("/contacts")}
            >
              <Users size={19} />
              Manage contacts
            </button>

            <button
              type="button"
              onClick={() => navigate("/companies")}
            >
              <Building2 size={19} />
              View companies
            </button>

            <button
              type="button"
              onClick={() => navigate("/tasks")}
            >
              <CalendarDays size={19} />
              Manage tasks
            </button>

            <button
              type="button"
              onClick={() => navigate("/automations")}
            >
              <Bot size={19} />
              Automations
            </button>
          </div>
        </article>
      </section>

      <DashboardInsights />
    </div>
  );
}

export default Dashboard;