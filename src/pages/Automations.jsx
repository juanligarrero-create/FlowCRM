import {
  Activity,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  GitBranch,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import "./Automations.css";

const automationStatuses = [
  "Active",
  "Paused",
  "Draft",
];

const triggerOptions = [
  "Contact created",
  "Deal stage changed",
  "Task completed",
  "Campaign completed",
  "Form submitted",
];

const conditionOptions = [
  "No condition",
  "Contact status is Lead",
  "Deal value is above $10,000",
  "Task priority is High",
  "Campaign conversion is above 5%",
];

const actionOptions = [
  "Send WhatsApp message",
  "Send email",
  "Create task",
  "Update contact status",
  "Assign deal owner",
];

const contactStatusOptions = [
  "Lead",
  "Prospect",
  "Customer",
];

const dealOwnerOptions = [
  "Juan Ligarrero",
  "Maria Torres",
  "Daniel Rivera",
];

const emptyAutomation = {
  name: "",
  description: "",
  status: "Draft",
  trigger: "Contact created",
  condition: "No condition",
  action: "Send WhatsApp message",
  targetContactStatus: "Customer",
  targetDealOwner: "Juan Ligarrero",
};

const initialAutomations = [
  {
    id: 1,
    name: "New Lead Welcome",
    description:
      "Send an automatic welcome message when a new lead is added.",
    status: "Active",
    trigger: "Contact created",
    condition: "Contact status is Lead",
    action: "Send WhatsApp message",
    executions: 184,
    successfulExecutions: 176,
    lastRun: "2026-08-03T14:20:00",
  },
  {
    id: 2,
    name: "High Value Deal Follow-up",
    description:
      "Create a follow-up task when a valuable deal moves forward.",
    status: "Active",
    trigger: "Deal stage changed",
    condition: "Deal value is above $10,000",
    action: "Create task",
    executions: 72,
    successfulExecutions: 69,
    lastRun: "2026-08-03T11:45:00",
  },
  {
    id: 3,
    name: "Completed Task Notification",
    description:
      "Notify the assigned sales representative after task completion.",
    status: "Paused",
    trigger: "Task completed",
    condition: "Task priority is High",
    action: "Send email",
    executions: 41,
    successfulExecutions: 38,
    lastRun: "2026-08-01T16:30:00",
  },
  {
    id: 4,
    name: "Campaign Conversion Update",
    description:
      "Update CRM contacts after a successful marketing campaign.",
    status: "Draft",
    trigger: "Campaign completed",
    condition: "Campaign conversion is above 5%",
    action: "Update contact status",
    executions: 0,
    successfulExecutions: 0,
    lastRun: "",
  },
];

const formatDateTime = (date) => {
  if (!date) {
    return "Never";
  }

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const calculateSuccessRate = (
  successfulExecutions,
  executions
) => {
  if (!executions) {
    return 0;
  }

  return Math.round(
    (successfulExecutions / executions) * 100
  );
};

function Automations() {
  const toast = useToast();

  const [automations, setAutomations] = useState(
    () => {
      const savedAutomations =
        localStorage.getItem(
          "flowcrm-automations"
        );

      if (savedAutomations) {
        try {
          const parsedAutomations =
            JSON.parse(savedAutomations);

          return Array.isArray(parsedAutomations)
            ? parsedAutomations
            : initialAutomations;
        } catch {
          return initialAutomations;
        }
      }

      return initialAutomations;
    }
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [
    editingAutomationId,
    setEditingAutomationId,
  ] = useState(null);
  const [automationForm, setAutomationForm] =
    useState({
      ...emptyAutomation,
    });
  const [formError, setFormError] = useState("");
  const [openMenuId, setOpenMenuId] =
    useState(null);
  const [
    automationToDelete,
    setAutomationToDelete,
  ] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-automations",
      JSON.stringify(automations)
    );
  }, [automations]);

  const filteredAutomations = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return automations.filter((automation) => {
      const searchableText = [
        automation.name,
        automation.description,
        automation.status,
        automation.trigger,
        automation.condition,
        automation.action,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        automation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    automations,
    searchTerm,
    statusFilter,
  ]);

  const activeAutomations = automations.filter(
    (automation) =>
      automation.status === "Active"
  ).length;

  const totalExecutions = automations.reduce(
    (total, automation) =>
      total +
      Number(automation.executions || 0),
    0
  );

  const totalSuccessfulExecutions =
    automations.reduce(
      (total, automation) =>
        total +
        Number(
          automation.successfulExecutions || 0
        ),
      0
    );

  const overallSuccessRate =
    calculateSuccessRate(
      totalSuccessfulExecutions,
      totalExecutions
    );

  const pausedAutomations = automations.filter(
    (automation) =>
      automation.status === "Paused"
  ).length;

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAutomationId(null);
    setAutomationForm({
      ...emptyAutomation,
    });
    setFormError("");
  };

  const openAddAutomationModal = () => {
    setEditingAutomationId(null);
    setAutomationForm({
      ...emptyAutomation,
    });
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditAutomationModal = (
    automation
  ) => {
    setEditingAutomationId(automation.id);

    setAutomationForm({
      name: automation.name || "",
      description:
        automation.description || "",
      status: automation.status || "Draft",
      trigger:
        automation.trigger ||
        "Contact created",
      condition:
        automation.condition ||
        "No condition",
      action:
        automation.action ||
        "Send WhatsApp message",
      targetContactStatus:
        automation.targetContactStatus ||
        "Customer",
      targetDealOwner:
        automation.targetDealOwner ||
        "Juan Ligarrero",
    });

    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveAutomation = (event) => {
    event.preventDefault();

    if (
      !automationForm.name.trim() ||
      !automationForm.description.trim() ||
      !automationForm.trigger ||
      !automationForm.condition ||
      !automationForm.action ||
      (automationForm.action ===
        "Update contact status" &&
        !automationForm.targetContactStatus) ||
      (automationForm.action ===
        "Assign deal owner" &&
        !automationForm.targetDealOwner)
    ) {
      setFormError(
        "Please complete all automation fields."
      );
      return;
    }

    if (editingAutomationId !== null) {
      setAutomations((currentAutomations) =>
        currentAutomations.map(
          (automation) =>
            automation.id ===
            editingAutomationId
              ? {
                  ...automation,
                  ...automationForm,
                }
              : automation
        )
      );

      toast.success(
        "Automation updated",
        `${automationForm.name} was updated successfully.`
      );
    } else {
      const newAutomation = {
        id: Date.now(),
        ...automationForm,
        executions: 0,
        successfulExecutions: 0,
        lastRun: "",
      };

      setAutomations(
        (currentAutomations) => [
          newAutomation,
          ...currentAutomations,
        ]
      );

      toast.success(
        "Automation created",
        `${automationForm.name} was added successfully.`
      );
    }

    closeModal();
  };

  const updateAutomationStatus = (
    automationId,
    status
  ) => {
    const selectedAutomation =
      automations.find(
        (automation) =>
          automation.id === automationId
      );

    setAutomations((currentAutomations) =>
      currentAutomations.map(
        (automation) =>
          automation.id === automationId
            ? {
                ...automation,
                status,
              }
            : automation
      )
    );

    setOpenMenuId(null);

    toast.info(
      "Automation status updated",
      `${selectedAutomation?.name || "Automation"} is now ${status.toLowerCase()}.`
    );
  };

  const simulateAutomationRun = (
    automationId
  ) => {
    const selectedAutomation =
      automations.find(
        (automation) =>
          automation.id === automationId
      );

    if (!selectedAutomation) {
      return;
    }

    let executionCount = 1;
    let resultMessage =
      `${selectedAutomation.name} completed successfully.`;

    if (
      selectedAutomation.action === "Create task"
    ) {
      let deals = [];
      let tasks = [];

      try {
        deals = JSON.parse(
          localStorage.getItem("flowcrm-deals") ||
            "[]"
        );
      } catch {
        deals = [];
      }

      try {
        tasks = JSON.parse(
          localStorage.getItem("flowcrm-tasks") ||
            "[]"
        );
      } catch {
        tasks = [];
      }

      const qualifyingDeals = deals.filter(
        (deal) =>
          Number(deal.value || 0) > 10000 &&
          !["Won", "Lost"].includes(deal.stage)
      );

      const existingAutomationDealIds = new Set(
        tasks
          .filter(
            (task) =>
              task.automationSource ===
              selectedAutomation.id
          )
          .map((task) =>
            String(task.dealId || "")
          )
      );

      const newTasks = qualifyingDeals
        .filter(
          (deal) =>
            !existingAutomationDealIds.has(
              String(deal.id)
            )
        )
        .map((deal, index) => ({
          id: Date.now() + index,
          title: `Follow up: ${deal.title}`,
          description:
            `Automated follow-up for the high-value deal "${deal.title}".`,
          status: "To Do",
          priority:
            deal.priority || "High",
          dueDate:
            deal.closeDate ||
            new Date().toISOString().slice(0, 10),
          relatedType: deal.company
            ? "Company"
            : "None",
          relatedId: "",
          relatedName: deal.company || "",
          dealId: deal.id,
          dealTitle: deal.title,
          contactName: deal.contact || "",
          companyName: deal.company || "",
          automationSource:
            selectedAutomation.id,
          createdAt: new Date().toISOString(),
        }));

      if (newTasks.length > 0) {
        localStorage.setItem(
          "flowcrm-tasks",
          JSON.stringify([...tasks, ...newTasks])
        );

        executionCount = newTasks.length;
        resultMessage =
          `${newTasks.length} task${newTasks.length === 1 ? "" : "s"} created successfully.`;
      } else {
        executionCount = 0;
        resultMessage =
          "No new qualifying high-value deals needed a follow-up task.";
      }
    }

    if (executionCount > 0) {
      setAutomations((currentAutomations) =>
        currentAutomations.map(
          (automation) =>
            automation.id === automationId
              ? {
                  ...automation,
                  executions:
                    Number(
                      automation.executions || 0
                    ) + executionCount,
                  successfulExecutions:
                    Number(
                      automation.successfulExecutions ||
                        0
                    ) + executionCount,
                  lastRun:
                    new Date().toISOString(),
                }
              : automation
        )
      );
    }

    setOpenMenuId(null);

    toast.success(
      "Automation executed",
      resultMessage
    );
  };

  const requestDeleteAutomation = (
    automation
  ) => {
    setAutomationToDelete(automation);
    setOpenMenuId(null);
  };

  const confirmDeleteAutomation = () => {
    if (!automationToDelete) {
      return;
    }

    setAutomations((currentAutomations) =>
      currentAutomations.filter(
        (automation) =>
          automation.id !==
          automationToDelete.id
      )
    );

    toast.success(
      "Automation deleted",
      `${automationToDelete.name} was removed.`
    );

    setAutomationToDelete(null);
  };
  return (
    <div className="automations-page">
      <section className="automations-page__header">
        <div>
          <h1>Automations</h1>

          <p>
            Build workflows that automatically respond
            to CRM activity.
          </p>
        </div>

        <button
          type="button"
          className="automations-page__add-button"
          onClick={openAddAutomationModal}
        >
          <Plus size={18} />
          Create Automation
        </button>
      </section>

      <section className="automations-page__stats">
        <article>
          <div>
            <Zap size={21} />
          </div>

          <span>
            <small>Active automations</small>
            <strong>{activeAutomations}</strong>
          </span>
        </article>

        <article>
          <div>
            <Activity size={21} />
          </div>

          <span>
            <small>Total executions</small>
            <strong>{totalExecutions}</strong>
          </span>
        </article>

        <article>
          <div>
            <CheckCircle2 size={21} />
          </div>

          <span>
            <small>Success rate</small>
            <strong>
              {overallSuccessRate}%
            </strong>
          </span>
        </article>

        <article>
          <div>
            <Pause size={21} />
          </div>

          <span>
            <small>Paused workflows</small>
            <strong>{pausedAutomations}</strong>
          </span>
        </article>
      </section>

      <section className="automations-page__toolbar">
        <div className="automations-page__search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search automations..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="automations-page__filter">
          <Filter size={17} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All statuses
            </option>

            {automationStatuses.map(
              (status) => (
                <option
                  value={status}
                  key={status}
                >
                  {status}
                </option>
              )
            )}
          </select>
        </div>
      </section>

      <section className="automations-page__summary">
        <span>
          <strong>
            {filteredAutomations.length}
          </strong>{" "}
          workflows shown
        </span>

        <span>
          Automations are simulated and stored locally
          for this portfolio project.
        </span>
      </section>

      {filteredAutomations.length === 0 ? (
        <section className="automations-page__empty">
          <Workflow size={38} />

          <h2>No automations found</h2>

          <p>
            Create a workflow or adjust your filters.
          </p>

          <button
            type="button"
            onClick={openAddAutomationModal}
          >
            <Plus size={17} />
            Create automation
          </button>
        </section>
      ) : (
        <section className="automations-grid">
          {filteredAutomations.map(
            (automation) => {
              const successRate =
                calculateSuccessRate(
                  automation.successfulExecutions,
                  automation.executions
                );

              return (
                <article
                  className="automation-card"
                  key={automation.id}
                >
                  <div className="automation-card__top">
                    <div className="automation-card__icon">
                      <Workflow size={21} />
                    </div>

                    <div className="automation-card__menu">
                      <button
                        type="button"
                        aria-label={`Actions for ${automation.name}`}
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId ===
                              automation.id
                              ? null
                              : automation.id
                          )
                        }
                      >
                        <MoreHorizontal
                          size={19}
                        />
                      </button>

                      {openMenuId ===
                        automation.id && (
                        <div className="automation-card__dropdown">
                          <button
                            type="button"
                            onClick={() =>
                              openEditAutomationModal(
                                automation
                              )
                            }
                          >
                            <Edit3 size={15} />
                            Edit automation
                          </button>

                          {automation.status !==
                            "Active" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateAutomationStatus(
                                  automation.id,
                                  "Active"
                                )
                              }
                            >
                              <Play size={15} />
                              Activate
                            </button>
                          )}

                          {automation.status ===
                            "Active" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateAutomationStatus(
                                  automation.id,
                                  "Paused"
                                )
                              }
                            >
                              <Pause size={15} />
                              Pause
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              simulateAutomationRun(
                                automation.id
                              )
                            }
                          >
                            <Sparkles size={15} />
                            Run now
                          </button>

                          <button
                            type="button"
                            className="automation-card__delete"
                            onClick={() =>
                              requestDeleteAutomation(
                                automation
                              )
                            }
                          >
                            <Trash2 size={15} />
                            Delete automation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="automation-card__heading">
                    <div>
                      <span
                        className={`automation-card__status automation-card__status--${automation.status.toLowerCase()}`}
                      >
                        {automation.status}
                      </span>

                      <span>
                        {automation.executions} runs
                      </span>
                    </div>

                    <h2>{automation.name}</h2>

                    <p>
                      {automation.description}
                    </p>
                  </div>

                  <div className="automation-card__workflow">
                    <article>
                      <div>
                        <Zap size={16} />
                      </div>

                      <span>
                        <small>Trigger</small>
                        <strong>
                          {automation.trigger}
                        </strong>
                      </span>
                    </article>

                    <div className="automation-card__connector" />

                    <article>
                      <div>
                        <GitBranch size={16} />
                      </div>

                      <span>
                        <small>Condition</small>
                        <strong>
                          {automation.condition}
                        </strong>
                      </span>
                    </article>

                    <div className="automation-card__connector" />

                    <article>
                      <div>
                        <Target size={16} />
                      </div>

                      <span>
                        <small>Action</small>
                        <strong>
                          {automation.action}
                        </strong>
                      </span>
                    </article>
                  </div>

                  <div className="automation-card__metrics">
                    <div>
                      <Activity size={16} />

                      <span>
                        <small>Executions</small>
                        <strong>
                          {automation.executions}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <CheckCircle2 size={16} />

                      <span>
                        <small>Success rate</small>
                        <strong>
                          {successRate}%
                        </strong>
                      </span>
                    </div>

                    <div>
                      <Clock3 size={16} />

                      <span>
                        <small>Last run</small>
                        <strong>
                          {formatDateTime(
                            automation.lastRun
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="automation-card__footer">
                    <button
                      type="button"
                      onClick={() =>
                        simulateAutomationRun(
                          automation.id
                        )
                      }
                    >
                      <Play size={15} />
                      Run now
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditAutomationModal(
                          automation
                        )
                      }
                    >
                      <Settings2 size={15} />
                      Configure
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}

      {isModalOpen && (
        <div className="automation-modal">
          <div
            className="automation-modal__overlay"
            onClick={closeModal}
          />

          <section className="automation-modal__content">
            <header className="automation-modal__header">
              <div>
                <h2>
                  {editingAutomationId !== null
                    ? "Edit Automation"
                    : "Create Automation"}
                </h2>

                <p>
                  Configure the trigger, optional
                  condition, and resulting action.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close automation modal"
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </header>

            <form
              className="automation-modal__form"
              onSubmit={handleSaveAutomation}
            >
              {formError && (
                <p className="automation-modal__error">
                  {formError}
                </p>
              )}

              <label>
                Automation name

                <input
                  type="text"
                  placeholder="e.g. New Lead Welcome"
                  value={automationForm.name}
                  onChange={(event) =>
                    setAutomationForm({
                      ...automationForm,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description

                <textarea
                  rows="3"
                  placeholder="Describe what this automation does..."
                  value={
                    automationForm.description
                  }
                  onChange={(event) =>
                    setAutomationForm({
                      ...automationForm,
                      description:
                        event.target.value,
                    })
                  }
                />
              </label>

              <div className="automation-modal__form-grid">
                <label>
                  Status

                  <select
                    value={automationForm.status}
                    onChange={(event) =>
                      setAutomationForm({
                        ...automationForm,
                        status: event.target.value,
                      })
                    }
                  >
                    {automationStatuses.map(
                      (status) => (
                        <option
                          value={status}
                          key={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Trigger

                  <select
                    value={
                      automationForm.trigger
                    }
                    onChange={(event) =>
                      setAutomationForm({
                        ...automationForm,
                        trigger:
                          event.target.value,
                      })
                    }
                  >
                    {triggerOptions.map(
                      (trigger) => (
                        <option
                          value={trigger}
                          key={trigger}
                        >
                          {trigger}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              <label>
                Condition

                <select
                  value={
                    automationForm.condition
                  }
                  onChange={(event) =>
                    setAutomationForm({
                      ...automationForm,
                      condition:
                        event.target.value,
                    })
                  }
                >
                  {conditionOptions.map(
                    (condition) => (
                      <option
                        value={condition}
                        key={condition}
                      >
                        {condition}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Action

                <select
                  value={automationForm.action}
                  onChange={(event) =>
                    setAutomationForm({
                      ...automationForm,
                      action:
                        event.target.value,
                    })
                  }
                >
                  {actionOptions.map((action) => (
                    <option
                      value={action}
                      key={action}
                    >
                      {action}
                    </option>
                  ))}
                </select>
              </label>

              {automationForm.action ===
                "Update contact status" && (
                <label>
                  New contact status

                  <select
                    value={
                      automationForm.targetContactStatus
                    }
                    onChange={(event) =>
                      setAutomationForm({
                        ...automationForm,
                        targetContactStatus:
                          event.target.value,
                      })
                    }
                  >
                    {contactStatusOptions.map(
                      (status) => (
                        <option
                          value={status}
                          key={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}

              {automationForm.action ===
                "Assign deal owner" && (
                <label>
                  New deal owner

                  <select
                    value={
                      automationForm.targetDealOwner
                    }
                    onChange={(event) =>
                      setAutomationForm({
                        ...automationForm,
                        targetDealOwner:
                          event.target.value,
                      })
                    }
                  >
                    {dealOwnerOptions.map(
                      (owner) => (
                        <option
                          value={owner}
                          key={owner}
                        >
                          {owner}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}

              <div className="automation-modal__preview">
                <div>
                  <Zap size={17} />
                  <span>
                    {automationForm.trigger}
                  </span>
                </div>

                <GitBranch size={17} />

                <div>
                  <Target size={17} />
                  <span>
                    {automationForm.action}
                    {automationForm.action ===
                      "Update contact status"
                      ? ` → ${automationForm.targetContactStatus}`
                      : automationForm.action ===
                          "Assign deal owner"
                        ? ` → ${automationForm.targetDealOwner}`
                        : ""}
                  </span>
                </div>
              </div>

              <div className="automation-modal__actions">
                <button
                  type="button"
                  className="automation-modal__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="automation-modal__save"
                >
                  {editingAutomationId !== null
                    ? "Update Automation"
                    : "Create Automation"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ConfirmDialog
        isOpen={automationToDelete !== null}
        title="Delete automation?"
        message={
          automationToDelete
            ? `This will permanently delete "${automationToDelete.name}". This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete automation"
        variant="danger"
        onCancel={() =>
          setAutomationToDelete(null)
        }
        onConfirm={confirmDeleteAutomation}
      />
    </div>
  );
}

export default Automations;