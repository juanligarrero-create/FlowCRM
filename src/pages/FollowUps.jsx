import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MessageCircle,
  Search,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "../components/ToastProvider.jsx";
import "./FollowUps.css";

const STORAGE_KEYS = {
  contacts: "flowcrm-contacts",
  companies: "flowcrm-companies",
  deals: "flowcrm-deals",
  tasks: "flowcrm-tasks",
  aiWriterContext: "flowcrm-ai-writer-context",
};

const readStoredArray = (key) => {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(savedValue);

    return Array.isArray(parsedValue)
      ? parsedValue
      : [];
  } catch {
    return [];
  }
};

const createId = () =>
  typeof crypto !== "undefined" &&
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const getDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}`;
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getDateString(tomorrow);
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

const getFollowUpStatus = (daysDifference) => {
  if (daysDifference === null) {
    return "unscheduled";
  }

  if (daysDifference < 0) {
    return "overdue";
  }

  if (daysDifference === 0) {
    return "today";
  }

  if (daysDifference <= 3) {
    return "upcoming";
  }

  return "scheduled";
};

const getStatusLabel = (status) => {
  const labels = {
    overdue: "Overdue",
    today: "Due today",
    upcoming: "Upcoming",
    scheduled: "Scheduled",
    unscheduled: "Unscheduled",
  };

  return labels[status] || status;
};

const getPriorityScore = ({
  daysDifference,
  dealValue,
  probability,
}) => {
  let score = 0;

  if (daysDifference !== null) {
    if (daysDifference < 0) {
      score += 50;
    } else if (daysDifference === 0) {
      score += 40;
    } else if (daysDifference <= 3) {
      score += 25;
    } else if (daysDifference <= 7) {
      score += 10;
    }
  }

  score += Math.min(
    Number(dealValue || 0) / 1000,
    25
  );

  score += Math.min(
    Number(probability || 0) / 10,
    10
  );

  return Math.min(100, Math.round(score));
};

const getPriorityLevel = (score) => {
  if (score >= 70) {
    return "high";
  }

  if (score >= 40) {
    return "medium";
  }

  return "low";
};

const getRecommendation = (item) => {
  if (item.status === "overdue") {
    return {
      level: "urgent",
      text: "Contact this opportunity today. The follow-up is overdue.",
    };
  }

  if (
    item.dealValue >= 25000 &&
    item.probability >= 60
  ) {
    return {
      level: "high-value",
      text: "High-value opportunity with strong closing probability.",
    };
  }

  if (
    item.status === "today" ||
    item.status === "upcoming"
  ) {
    return {
      level: "soon",
      text: "Prepare the message now and complete the follow-up on time.",
    };
  }

  if (item.probability < 30) {
    return {
      level: "risk",
      text: "Low probability. Re-engage the contact and confirm interest.",
    };
  }

  return {
    level: "normal",
    text: "Keep the opportunity moving toward its next pipeline stage.",
  };
};

function FollowUps() {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchTerm, setSearchTerm] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [taskVersion, setTaskVersion] =
    useState(0);

  const contacts = useMemo(
    () =>
      readStoredArray(STORAGE_KEYS.contacts),
    []
  );

  const companies = useMemo(
    () =>
      readStoredArray(STORAGE_KEYS.companies),
    []
  );

  const deals = useMemo(
    () => readStoredArray(STORAGE_KEYS.deals),
    []
  );

  const tasks = useMemo(
    () => readStoredArray(STORAGE_KEYS.tasks),
    [taskVersion]
  );

  const followUps = useMemo(() => {
    return deals
      .filter(
        (deal) =>
          deal.stage !== "Won" &&
          deal.stage !== "Lost"
      )
      .map((deal) => {
        const relatedContact =
          contacts.find(
            (contact) =>
              String(contact.id) ===
                String(deal.contactId) ||
              contact.name === deal.contact ||
              contact.fullName === deal.contact
          );

        const relatedCompany =
          companies.find(
            (company) =>
              String(company.id) ===
                String(deal.companyId) ||
              company.name === deal.company ||
              company.companyName ===
                deal.company
          );

        const relatedTask = tasks
          .filter(
            (task) =>
              String(task.dealId) ===
                String(deal.id) &&
              task.status !== "Completed"
          )
          .sort((firstTask, secondTask) =>
            String(
              firstTask.dueDate || ""
            ).localeCompare(
              String(secondTask.dueDate || "")
            )
          )[0];

        const followUpDate =
          relatedTask?.dueDate ||
          deal.nextFollowUpDate ||
          deal.closeDate ||
          "";

        const daysDifference =
          getDaysDifference(followUpDate);

        const status =
          getFollowUpStatus(daysDifference);

        const priorityScore =
          getPriorityScore({
            daysDifference,
            dealValue: deal.value,
            probability: deal.probability,
          });

        const item = {
          id: deal.id,
          dealId: deal.id,
          contactId:
            relatedContact?.id ||
            deal.contactId ||
            "",
          companyId:
            relatedCompany?.id ||
            deal.companyId ||
            "",
          dealTitle:
            deal.title ||
            deal.name ||
            "Untitled deal",
          contactName:
            relatedContact?.name ||
            relatedContact?.fullName ||
            deal.contact ||
            "No contact",
          companyName:
            relatedCompany?.name ||
            relatedCompany?.companyName ||
            deal.company ||
            "No company",
          dealValue: Number(deal.value || 0),
          probability: Number(
            deal.probability || 0
          ),
          followUpDate,
          daysDifference,
          status,
          priorityScore,
          priorityLevel:
            getPriorityLevel(priorityScore),
          taskTitle:
            relatedTask?.title || null,
          taskId: relatedTask?.id || null,
        };

        return {
          ...item,
          recommendation:
            getRecommendation(item),
        };
      })
      .sort(
        (firstItem, secondItem) =>
          secondItem.priorityScore -
          firstItem.priorityScore
      );
  }, [
    contacts,
    companies,
    deals,
    tasks,
  ]);

  const filteredFollowUps = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim();

    return followUps.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        item.dealTitle
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.contactName
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.companyName
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [followUps, searchTerm, statusFilter]);

  const overdueCount = followUps.filter(
    (item) => item.status === "overdue"
  ).length;

  const dueTodayCount = followUps.filter(
    (item) => item.status === "today"
  ).length;

  const upcomingCount = followUps.filter(
    (item) => item.status === "upcoming"
  ).length;
  const openContact = (item) => {
    if (!item.contactId) {
      toast.info(
        "Contact unavailable",
        "This deal does not have a linked contact."
      );
      return;
    }

    navigate(`/contacts/${item.contactId}`);
  };

  const openDeal = (item) => {
    navigate(`/deals/${item.dealId}`);
  };

  const openAIWriter = (item) => {
    localStorage.setItem(
      STORAGE_KEYS.aiWriterContext,
      JSON.stringify({
        contactId: item.contactId,
        companyId: item.companyId,
        dealId: item.dealId,
        writerType: "follow-up",
        objective: "Follow up",
        createdAt: new Date().toISOString(),
      })
    );

    navigate("/ai-writer");

    toast.success(
      "AI Writer opened",
      "The follow-up context is ready to use."
    );
  };

  const openWhatsApp = (item) => {
    localStorage.setItem(
      STORAGE_KEYS.aiWriterContext,
      JSON.stringify({
        contactId: item.contactId,
        companyId: item.companyId,
        dealId: item.dealId,
        writerType: "whatsapp",
        objective: "Follow up",
        createdAt: new Date().toISOString(),
      })
    );

    navigate("/whatsapp");

    toast.info(
      "WhatsApp opened",
      `Prepare a message for ${item.contactName}.`
    );
  };

  const createFollowUpTask = (item) => {
    if (item.taskId) {
      toast.info(
        "Task already exists",
        item.taskTitle ||
          "This deal already has an active follow-up task."
      );
      return;
    }

    const currentTasks = readStoredArray(
      STORAGE_KEYS.tasks
    );

    const newTask = {
      id: createId(),
      title: `Follow up: ${item.dealTitle}`,
      description: `Contact ${item.contactName} regarding ${item.dealTitle}.`,
      status: "To Do",
      priority:
        item.priorityLevel === "high"
          ? "High"
          : item.priorityLevel === "medium"
            ? "Medium"
            : "Low",
      dueDate:
        item.status === "overdue" ||
        item.status === "today"
          ? getDateString()
          : getTomorrowDate(),
      dealId: item.dealId,
      contactId: item.contactId,
      companyId: item.companyId,
      relatedType: item.contactId
        ? "Contact"
        : item.companyId
          ? "Company"
          : "None",
      relatedId: item.contactId
        ? String(item.contactId)
        : item.companyId
          ? String(item.companyId)
          : "",
      relatedName: item.contactId
        ? item.contactName
        : item.companyId
          ? item.companyName
          : "",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      STORAGE_KEYS.tasks,
      JSON.stringify([
        newTask,
        ...currentTasks,
      ])
    );

    setTaskVersion(
      (currentVersion) =>
        currentVersion + 1
    );

    toast.success(
      "Follow-up task created",
      `"${newTask.title}" was added to Tasks.`
    );
  };

  return (
    <div className="followups-page">
      <header className="followups-page__header">
        <div>
          <span className="followups-page__eyebrow">
            <Sparkles size={15} />
            Sales intelligence
          </span>

          <h1>Smart Follow-up Center</h1>

          <p>
            Prioritize conversations, overdue
            actions, and active opportunities
            that need attention.
          </p>
        </div>
      </header>

      <section className="followups-summary">
        <article>
          <AlertTriangle size={20} />

          <span>
            <strong>{overdueCount}</strong>
            <small>Overdue</small>
          </span>
        </article>

        <article>
          <CalendarClock size={20} />

          <span>
            <strong>{dueTodayCount}</strong>
            <small>Due today</small>
          </span>
        </article>

        <article>
          <Clock3 size={20} />

          <span>
            <strong>{upcomingCount}</strong>
            <small>Upcoming</small>
          </span>
        </article>

        <article>
          <CheckCircle2 size={20} />

          <span>
            <strong>
              {followUps.length}
            </strong>
            <small>Active follow-ups</small>
          </span>
        </article>
      </section>

      <section className="followups-toolbar">
        <div className="followups-search">
          <Search size={17} />

          <input
            type="text"
            value={searchTerm}
            placeholder="Search deals, contacts, or companies..."
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All follow-ups
          </option>
          <option value="overdue">
            Overdue
          </option>
          <option value="today">
            Due today
          </option>
          <option value="upcoming">
            Upcoming
          </option>
          <option value="scheduled">
            Scheduled
          </option>
          <option value="unscheduled">
            Unscheduled
          </option>
        </select>
      </section>

      <section className="followups-list">
        {filteredFollowUps.length > 0 ? (
          filteredFollowUps.map((item) => (
            <article
              className={`followup-card followup-card--${item.priorityLevel}`}
              key={item.id}
            >
              <div className="followup-card__priority">
                <strong>
                  {item.priorityScore}
                </strong>
                <small>Priority</small>
              </div>

              <div className="followup-card__main">
                <div>
                  <div className="followup-card__heading">
                    <span
                      className={`followup-card__status followup-card__status--${item.status}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>

                    <h2>{item.dealTitle}</h2>

                    <p>
                      {item.contactName} ·{" "}
                      {item.companyName}
                    </p>
                  </div>
                </div>

                <div className="followup-card__recommendation">
                  <WandSparkles size={15} />

                  <span>
                    <strong>
                      Recommended action
                    </strong>

                    <small>
                      {
                        item.recommendation
                          .text
                      }
                    </small>
                  </span>
                </div>

                <div className="followup-card__meta">
                  <span>
                    <small>Value</small>
                    <strong>
                      ${item.dealValue.toLocaleString()}
                    </strong>
                  </span>

                  <span>
                    <small>Probability</small>
                    <strong>{item.probability}%</strong>
                  </span>

                  <span>
                    <small>Follow-up</small>
                    <strong>
                      {item.followUpDate || "Not scheduled"}
                    </strong>
                  </span>

                  {item.taskTitle && (
                    <span className="followup-card__meta-task">
                      <small>Task</small>
                      <strong>{item.taskTitle}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="followup-card__actions">
                <button
                  type="button"
                  onClick={() =>
                    openContact(item)
                  }
                >
                  <UserRound size={16} />
                  Contact
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openDeal(item)
                  }
                >
                  <ExternalLink size={16} />
                  Deal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openAIWriter(item)
                  }
                >
                  <Sparkles size={16} />
                  AI Writer
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openWhatsApp(item)
                  }
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>

                <button
                  type="button"
                  disabled={Boolean(item.taskId)}
                  onClick={() =>
                    createFollowUpTask(item)
                  }
                >
                  <CalendarClock size={16} />
                  {item.taskId
                    ? "Task created"
                    : "Create task"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="followups-empty">
            <CheckCircle2 size={30} />

            <strong>
              No follow-ups found
            </strong>

            <p>
              Try changing the search or
              status filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default FollowUps;