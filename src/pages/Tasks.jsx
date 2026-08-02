import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Edit3,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import "./Tasks.css";

const taskStatuses = ["To Do", "In Progress", "Completed"];
const taskPriorities = ["Low", "Medium", "High"];
const relatedTypes = ["None", "Contact", "Company"];

const emptyTask = {
  title: "",
  description: "",
  status: "To Do",
  priority: "Medium",
  dueDate: "",
  relatedType: "None",
  relatedId: "",
  relatedName: "",
};

const initialTasks = [
  {
    id: 1,
    title: "Call Sarah Johnson",
    description:
      "Discuss the CRM automation package and confirm next steps.",
    status: "To Do",
    priority: "High",
    dueDate: "2026-08-01",
    relatedType: "Contact",
    relatedId: "1",
    relatedName: "Sarah Johnson",
  },
  {
    id: 2,
    title: "Send proposal to GreenTech",
    description:
      "Send the updated customer-support automation proposal.",
    status: "In Progress",
    priority: "High",
    dueDate: "2026-08-02",
    relatedType: "Company",
    relatedId: "3",
    relatedName: "GreenTech",
  },
  {
    id: 3,
    title: "Prepare Northstar demo",
    description:
      "Configure the WhatsApp sales integration demo.",
    status: "To Do",
    priority: "Medium",
    dueDate: "2026-08-04",
    relatedType: "Company",
    relatedId: "2",
    relatedName: "Northstar",
  },
  {
    id: 4,
    title: "Review campaign performance",
    description:
      "Check the latest conversion and response metrics.",
    status: "Completed",
    priority: "Low",
    dueDate: "2026-07-31",
    relatedType: "None",
    relatedId: "",
    relatedName: "",
  },
  {
    id: 5,
    title: "Follow up with Apex Systems",
    description:
      "Confirm whether the enterprise CRM proposal was reviewed.",
    status: "To Do",
    priority: "Medium",
    dueDate: "2026-07-30",
    relatedType: "Company",
    relatedId: "4",
    relatedName: "Apex Systems",
  },
];

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("flowcrm-tasks");

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);

        return parsedTasks.map((task) => ({
          ...task,
          relatedType:
            task.relatedType ||
            (task.relatedTo ? "Company" : "None"),
          relatedId: String(task.relatedId || ""),
          relatedName:
            task.relatedName || task.relatedTo || "",
        }));
      } catch {
        return initialTasks;
      }
    }

    return initialTasks;
  });

  const contacts = useMemo(() => {
    const savedContacts = localStorage.getItem(
      "flowcrm-contacts"
    );

    if (!savedContacts) {
      return [];
    }

    try {
      return JSON.parse(savedContacts);
    } catch {
      return [];
    }
  }, []);

  const companies = useMemo(() => {
    const savedCompanies = localStorage.getItem(
      "flowcrm-companies"
    );

    if (!savedCompanies) {
      return [];
    }

    try {
      return JSON.parse(savedCompanies);
    } catch {
      return [];
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] =
    useState(null);
  const [taskForm, setTaskForm] = useState({
    ...emptyTask,
  });
  const [formError, setFormError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-tasks",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  const todayString = new Date()
    .toISOString()
    .split("T")[0];

  const isOverdue = (task) =>
    task.status !== "Completed" &&
    task.dueDate &&
    task.dueDate < todayString;

  const dueTodayCount = tasks.filter(
    (task) =>
      task.status !== "Completed" &&
      task.dueDate === todayString
  ).length;

  const overdueCount = tasks.filter(isOverdue).length;

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return tasks.filter((task) => {
      const relatedName =
        task.relatedName || task.relatedTo || "";

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        task.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        relatedName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  const availableRelatedRecords = useMemo(() => {
    if (taskForm.relatedType === "Contact") {
      return contacts.map((contact) => ({
        id: String(contact.id),
        name: contact.name,
        subtitle: contact.company,
      }));
    }

    if (taskForm.relatedType === "Company") {
      return companies.map((company) => ({
        id: String(company.id),
        name: company.name,
        subtitle: company.industry,
      }));
    }

    return [];
  }, [
    taskForm.relatedType,
    contacts,
    companies,
  ]);

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setTaskForm({ ...emptyTask });
    setFormError("");
  };

  const openAddTaskModal = () => {
    setEditingTaskId(null);
    setTaskForm({ ...emptyTask });
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTaskId(task.id);

    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      relatedType: task.relatedType || "None",
      relatedId: String(task.relatedId || ""),
      relatedName:
        task.relatedName || task.relatedTo || "",
    });

    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleRelatedTypeChange = (event) => {
    const newRelatedType = event.target.value;

    setTaskForm({
      ...taskForm,
      relatedType: newRelatedType,
      relatedId: "",
      relatedName: "",
    });
  };

  const handleRelatedRecordChange = (event) => {
    const selectedId = event.target.value;

    const selectedRecord =
      availableRelatedRecords.find(
        (record) => record.id === selectedId
      );

    setTaskForm({
      ...taskForm,
      relatedId: selectedId,
      relatedName: selectedRecord?.name || "",
    });
  };

  const handleSaveTask = (event) => {
    event.preventDefault();

    if (
      !taskForm.title.trim() ||
      !taskForm.description.trim() ||
      !taskForm.dueDate
    ) {
      setFormError(
        "Please complete the title, description, and due date."
      );
      return;
    }

    if (
      taskForm.relatedType !== "None" &&
      !taskForm.relatedId
    ) {
      setFormError(
        `Please select a related ${taskForm.relatedType.toLowerCase()}.`
      );
      return;
    }

    const normalizedTask = {
      ...taskForm,
      relatedId:
        taskForm.relatedType === "None"
          ? ""
          : String(taskForm.relatedId),
      relatedName:
        taskForm.relatedType === "None"
          ? ""
          : taskForm.relatedName,
    };

    if (editingTaskId !== null) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...normalizedTask,
              }
            : task
        )
      );
    } else {
      const newTask = {
        id: Date.now(),
        ...normalizedTask,
      };

      setTasks((currentTasks) => [
        newTask,
        ...currentTasks,
      ]);
    }

    closeModal();
  };

  const handleDeleteTask = (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.id !== taskId
      )
    );

    setOpenMenuId(null);
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
            }
          : task
      )
    );

    setOpenMenuId(null);
  };

const openRelatedRecord = (task) => {
  const relatedName =
    task.relatedName || task.relatedTo || "";

  if (task.relatedType === "Contact") {
    let contactId = task.relatedId;

    if (!contactId && relatedName) {
      const matchingContact = contacts.find(
        (contact) =>
          contact.name.toLowerCase() ===
          relatedName.toLowerCase()
      );

      contactId = matchingContact?.id;
    }

    if (contactId) {
      navigate(`/contacts/${contactId}`);
    }

    return;
  }

  if (task.relatedType === "Company") {
    let companyId = task.relatedId;

    if (!companyId && relatedName) {
      const matchingCompany = companies.find(
        (company) =>
          company.name.toLowerCase() ===
          relatedName.toLowerCase()
      );

      companyId = matchingCompany?.id;
    }

    if (companyId) {
      navigate(`/companies/${companyId}`);
    }
  }
};

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return <CheckCircle2 size={20} />;
    }

    if (status === "In Progress") {
      return <Clock3 size={20} />;
    }

    return <Circle size={20} />;
  };

  const getRelatedIcon = (relatedType) => {
    if (relatedType === "Company") {
      return <Building2 size={14} />;
    }

    return <UserRound size={14} />;
  };
  return (
    <div className="tasks-page">
      <section className="tasks-page__header">
        <div>
          <h1>Tasks</h1>
          <p>
            Track activities, follow-ups, and deadlines.
          </p>
        </div>

        <button
          type="button"
          className="tasks-page__add-button"
          onClick={openAddTaskModal}
        >
          <Plus size={18} />
          Add Task
        </button>
      </section>

      <section className="tasks-page__stats">
        <article className="tasks-stat">
          <div className="tasks-stat__icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Total tasks</span>
            <strong>{tasks.length}</strong>
          </div>
        </article>

        <article className="tasks-stat">
          <div className="tasks-stat__icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Due today</span>
            <strong>{dueTodayCount}</strong>
          </div>
        </article>

        <article className="tasks-stat tasks-stat--danger">
          <div className="tasks-stat__icon">
            <AlertCircle size={21} />
          </div>

          <div>
            <span>Overdue</span>
            <strong>{overdueCount}</strong>
          </div>
        </article>

        <article className="tasks-stat tasks-stat--success">
          <div className="tasks-stat__icon">
            <Check size={21} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </article>
      </section>

      <section className="tasks-page__toolbar">
        <div className="tasks-page__search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search tasks or related records..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">All statuses</option>

          {taskStatuses.map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value)
          }
        >
          <option value="All">All priorities</option>

          {taskPriorities.map((priority) => (
            <option value={priority} key={priority}>
              {priority}
            </option>
          ))}
        </select>
      </section>

      <section className="tasks-board">
        {taskStatuses.map((status) => {
          const statusTasks = filteredTasks.filter(
            (task) => task.status === status
          );

          return (
            <article className="tasks-column" key={status}>
              <div className="tasks-column__header">
                <div>
                  <span
                    className={`tasks-column__indicator tasks-column__indicator--${status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  />

                  <h2>{status}</h2>

                  <span className="tasks-column__count">
                    {statusTasks.length}
                  </span>
                </div>
              </div>

              <div className="tasks-column__list">
                {statusTasks.length === 0 ? (
                  <div className="tasks-column__empty">
                    <CheckCircle2 size={27} />
                    <p>No tasks here.</p>

                    <button
                      type="button"
                      onClick={openAddTaskModal}
                    >
                      Add task
                    </button>
                  </div>
                ) : (
                  statusTasks.map((task) => {
                    const relatedName =
                      task.relatedName ||
                      task.relatedTo ||
                      "";

                    return (
                      <article
                        className={`task-card ${
                          task.status === "Completed"
                            ? "task-card--completed"
                            : ""
                        }`}
                        key={task.id}
                      >
                        <div className="task-card__top">
                          <button
                            type="button"
                            className={`task-card__status-icon task-card__status-icon--${task.status
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                            aria-label={`Change ${task.title} status`}
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                task.status === "Completed"
                                  ? "To Do"
                                  : "Completed"
                              )
                            }
                          >
                            {getStatusIcon(task.status)}
                          </button>

                          <div className="task-card__content">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                          </div>

                          <div className="task-card__menu">
                            <button
                              type="button"
                              aria-label={`Actions for ${task.title}`}
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === task.id
                                    ? null
                                    : task.id
                                )
                              }
                            >
                              <MoreHorizontal size={19} />
                            </button>

                            {openMenuId === task.id && (
                              <div className="task-card__dropdown">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditTaskModal(task)
                                  }
                                >
                                  <Edit3 size={15} />
                                  Edit task
                                </button>

                                {task.status !==
                                  "In Progress" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateTaskStatus(
                                        task.id,
                                        "In Progress"
                                      )
                                    }
                                  >
                                    <Clock3 size={15} />
                                    Mark in progress
                                  </button>
                                )}

                                {task.status !== "Completed" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateTaskStatus(
                                        task.id,
                                        "Completed"
                                      )
                                    }
                                  >
                                    <Check size={15} />
                                    Mark completed
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateTaskStatus(
                                        task.id,
                                        "To Do"
                                      )
                                    }
                                  >
                                    <RotateCcw size={15} />
                                    Reopen task
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="task-card__delete"
                                  onClick={() =>
                                    handleDeleteTask(task.id)
                                  }
                                >
                                  <Trash2 size={15} />
                                  Delete task
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="task-card__metadata">
                          <span
                            className={`task-card__priority task-card__priority--${task.priority.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>

                          <span
                            className={`task-card__due-date ${
                              isOverdue(task)
                                ? "task-card__due-date--overdue"
                                : ""
                            }`}
                          >
                            <CalendarDays size={14} />

                            {isOverdue(task)
                              ? `Overdue · ${formatDate(
                                  task.dueDate
                                )}`
                              : formatDate(task.dueDate)}
                          </span>
                        </div>

                        {relatedName && (
                          <div
                            className="task-card__related"
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              openRelatedRecord(task)
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                openRelatedRecord(task);
                              }
                            }}
                          >
                            {getRelatedIcon(
                              task.relatedType
                            )}

                            <span>
                              {task.relatedType}:{" "}
                              {relatedName}
                            </span>
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            </article>
          );
        })}
      </section>

      {isModalOpen && (
        <div className="task-modal">
          <div
            className="task-modal__overlay"
            onClick={closeModal}
          />

          <div className="task-modal__content">
            <div className="task-modal__header">
              <div>
                <h2>
                  {editingTaskId !== null
                    ? "Edit Task"
                    : "Add Task"}
                </h2>

                <p>
                  {editingTaskId !== null
                    ? "Update this task and its relationship."
                    : "Create a task connected to a CRM record."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close task modal"
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="task-modal__form"
              onSubmit={handleSaveTask}
            >
              {formError && (
                <p className="task-modal__error">
                  {formError}
                </p>
              )}

              <label>
                Task title
                <input
                  type="text"
                  placeholder="e.g. Call Sarah Johnson"
                  value={taskForm.title}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      title: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  placeholder="Add more context about this task..."
                  value={taskForm.description}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      description:
                        event.target.value,
                    })
                  }
                />
              </label>

              <div className="task-modal__form-grid">
                <label>
                  Status
                  <select
                    value={taskForm.status}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        status: event.target.value,
                      })
                    }
                  >
                    {taskStatuses.map((status) => (
                      <option
                        value={status}
                        key={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={taskForm.priority}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        priority:
                          event.target.value,
                      })
                    }
                  >
                    {taskPriorities.map(
                      (priority) => (
                        <option
                          value={priority}
                          key={priority}
                        >
                          {priority}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              <label>
                Due date
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) =>
                    setTaskForm({
                      ...taskForm,
                      dueDate: event.target.value,
                    })
                  }
                />
              </label>

              <div className="task-modal__form-grid">
                <label>
                  Related record type
                  <select
                    value={taskForm.relatedType}
                    onChange={
                      handleRelatedTypeChange
                    }
                  >
                    {relatedTypes.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Related record
                  <select
                    value={taskForm.relatedId}
                    disabled={
                      taskForm.relatedType === "None"
                    }
                    onChange={
                      handleRelatedRecordChange
                    }
                  >
                    <option value="">
                      {taskForm.relatedType === "None"
                        ? "No related record"
                        : `Select a ${taskForm.relatedType.toLowerCase()}`}
                    </option>

                    {availableRelatedRecords.map(
                      (record) => (
                        <option
                          value={record.id}
                          key={record.id}
                        >
                          {record.name}
                          {record.subtitle
                            ? ` — ${record.subtitle}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              <div className="task-modal__actions">
                <button
                  type="button"
                  className="task-modal__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="task-modal__save"
                >
                  {editingTaskId !== null
                    ? "Update Task"
                    : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;