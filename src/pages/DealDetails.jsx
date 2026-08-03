import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Edit3,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Save,
  Target,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import "./DealDetails.css";

const pipelineStages = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const dealOwners = [
  "Juan Ligarrero",
  "Maria Torres",
  "Daniel Rivera",
];

const dealPriorities = ["Low", "Medium", "High"];

const stageProbabilities = {
  Lead: 10,
  Qualified: 25,
  Proposal: 50,
  Negotiation: 75,
  Won: 100,
  Lost: 0,
};

const emptyDealForm = {
  title: "",
  company: "",
  contact: "",
  value: "",
  closeDate: "",
  stage: "Lead",
  probability: "10",
  owner: "Juan Ligarrero",
  priority: "Medium",
};

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (date) => {
  if (!date) {
    return "No date";
  }

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function DealDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dealId = String(id);

  const [deals, setDeals] = useState(() =>
    readStoredArray("flowcrm-deals")
  );

  const contacts = useMemo(
    () => readStoredArray("flowcrm-contacts"),
    []
  );

  const companies = useMemo(
    () => readStoredArray("flowcrm-companies"),
    []
  );

  const tasks = useMemo(
    () => readStoredArray("flowcrm-tasks"),
    []
  );

  const deal = useMemo(
    () =>
      deals.find(
        (item) => String(item.id) === dealId
      ),
    [deals, dealId]
  );

  const relatedCompany = useMemo(() => {
    if (!deal) {
      return null;
    }

    return (
      companies.find(
        (company) =>
          company.name?.toLowerCase() ===
          deal.company?.toLowerCase()
      ) || null
    );
  }, [companies, deal]);

  const relatedContact = useMemo(() => {
    if (!deal) {
      return null;
    }

    return (
      contacts.find(
        (contact) =>
          contact.name?.toLowerCase() ===
          deal.contact?.toLowerCase()
      ) || null
    );
  }, [contacts, deal]);

  const relatedTasks = useMemo(() => {
    if (!deal) {
      return [];
    }

    return tasks.filter((task) => {
      const relatedName =
        task.relatedName || task.relatedTo || "";

      return (
        relatedName.toLowerCase() ===
          deal.title.toLowerCase() ||
        relatedName.toLowerCase() ===
          deal.company.toLowerCase() ||
        relatedName.toLowerCase() ===
          deal.contact.toLowerCase()
      );
    });
  }, [tasks, deal]);

  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem(
      `flowcrm-deal-${dealId}-notes`
    );

    if (!savedNotes) {
      return [];
    }

    try {
      const parsedNotes = JSON.parse(savedNotes);

      return Array.isArray(parsedNotes)
        ? parsedNotes
        : [];
    } catch {
      return [];
    }
  });

  const [activities, setActivities] = useState(() => {
    const savedActivities = localStorage.getItem(
      `flowcrm-deal-${dealId}-activities`
    );

    if (!savedActivities) {
      return [];
    }

    try {
      const parsedActivities = JSON.parse(
        savedActivities
      );

      return Array.isArray(parsedActivities)
        ? parsedActivities
        : [];
    } catch {
      return [];
    }
  });

  const [newNote, setNewNote] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [activityType, setActivityType] =
    useState("Call");
  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);
  const [dealForm, setDealForm] = useState({
    ...emptyDealForm,
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-deals",
      JSON.stringify(deals)
    );
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(
      `flowcrm-deal-${dealId}-notes`,
      JSON.stringify(notes)
    );
  }, [notes, dealId]);

  useEffect(() => {
    localStorage.setItem(
      `flowcrm-deal-${dealId}-activities`,
      JSON.stringify(activities)
    );
  }, [activities, dealId]);

  const expectedRevenue = deal
    ? Number(deal.value || 0) *
      (Number(deal.probability || 0) / 100)
    : 0;

  const openTasks = relatedTasks.filter(
    (task) => task.status !== "Completed"
  );

  const completedTasks = relatedTasks.filter(
    (task) => task.status === "Completed"
  );

  const getActivityIcon = (type) => {
    if (type === "Email") {
      return <Mail size={17} />;
    }

    if (type === "Meeting") {
      return <UserRound size={17} />;
    }

    if (type === "Note") {
      return <FileText size={17} />;
    }

    return <Phone size={17} />;
  };

  const openEditModal = () => {
    if (!deal) {
      return;
    }

    setDealForm({
      title: deal.title || "",
      company: deal.company || "",
      contact: deal.contact || "",
      value: String(deal.value || ""),
      closeDate: deal.closeDate || "",
      stage: deal.stage || "Lead",
      probability: String(
        deal.probability ??
          stageProbabilities[deal.stage] ??
          10
      ),
      owner: deal.owner || "Juan Ligarrero",
      priority: deal.priority || "Medium",
    });

    setFormError("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setFormError("");
  };

  const handleStageChange = (stage) => {
    setDealForm({
      ...dealForm,
      stage,
      probability: String(
        stageProbabilities[stage]
      ),
    });
  };
  const handleSaveDeal = (event) => {
    event.preventDefault();

    if (
      !dealForm.title.trim() ||
      !dealForm.company.trim() ||
      !dealForm.contact.trim() ||
      !String(dealForm.value).trim() ||
      !dealForm.closeDate ||
      !dealForm.owner
    ) {
      setFormError(
        "Please complete all required deal fields."
      );
      return;
    }

    const numericValue = Number(dealForm.value);
    const numericProbability = Number(
      dealForm.probability
    );

    if (
      Number.isNaN(numericValue) ||
      numericValue <= 0
    ) {
      setFormError(
        "Deal value must be greater than zero."
      );
      return;
    }

    if (
      Number.isNaN(numericProbability) ||
      numericProbability < 0 ||
      numericProbability > 100
    ) {
      setFormError(
        "Probability must be between 0 and 100."
      );
      return;
    }

    setDeals((currentDeals) =>
      currentDeals.map((item) =>
        String(item.id) === dealId
          ? {
              ...item,
              ...dealForm,
              value: numericValue,
              probability: numericProbability,
            }
          : item
      )
    );

    closeEditModal();
  };

  const handleAddNote = (event) => {
    event.preventDefault();

    const trimmedNote = newNote.trim();

    if (!trimmedNote) {
      return;
    }

    setNotes((currentNotes) => [
      {
        id: Date.now(),
        content: trimmedNote,
        createdAt: new Date().toLocaleString(),
      },
      ...currentNotes,
    ]);

    setNewNote("");
  };

  const handleDeleteNote = (noteId) => {
    setNotes((currentNotes) =>
      currentNotes.filter(
        (note) => note.id !== noteId
      )
    );
  };

  const handleAddActivity = (event) => {
    event.preventDefault();

    const trimmedActivity = newActivity.trim();

    if (!trimmedActivity) {
      return;
    }

    setActivities((currentActivities) => [
      {
        id: Date.now(),
        type: activityType,
        description: trimmedActivity,
        createdAt: new Date().toLocaleString(),
      },
      ...currentActivities,
    ]);

    setNewActivity("");
    setActivityType("Call");
  };

  const handleDeleteActivity = (activityId) => {
    setActivities((currentActivities) =>
      currentActivities.filter(
        (activity) => activity.id !== activityId
      )
    );
  };

  const handleDeleteDeal = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deal?"
    );

    if (!confirmed) {
      return;
    }

    const updatedDeals = deals.filter(
      (item) => String(item.id) !== dealId
    );

    localStorage.setItem(
      "flowcrm-deals",
      JSON.stringify(updatedDeals)
    );

    localStorage.removeItem(
      `flowcrm-deal-${dealId}-notes`
    );

    localStorage.removeItem(
      `flowcrm-deal-${dealId}-activities`
    );

    navigate("/deals");
  };

  if (!deal) {
    return (
      <div className="deal-details-page">
        <button
          type="button"
          className="deal-details__back"
          onClick={() => navigate("/deals")}
        >
          <ArrowLeft size={18} />
          Back to deals
        </button>

        <section className="deal-details__not-found">
          <CircleDollarSign size={45} />

          <h1>Deal not found</h1>

          <p>
            This opportunity may have been deleted or the
            address is incorrect.
          </p>

          <button
            type="button"
            onClick={() => navigate("/deals")}
          >
            Return to deals
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="deal-details-page">
      <button
        type="button"
        className="deal-details__back"
        onClick={() => navigate("/deals")}
      >
        <ArrowLeft size={18} />
        Back to deals
      </button>

      <section className="deal-details__hero">
        <div className="deal-details__hero-main">
          <div className="deal-details__hero-icon">
            <CircleDollarSign size={30} />
          </div>

          <div>
            <div className="deal-details__title-row">
              <h1>{deal.title}</h1>

              <span
                className={`deal-details__stage deal-details__stage--${deal.stage
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                {deal.stage}
              </span>

              <span
                className={`deal-details__priority deal-details__priority--${(
                  deal.priority || "Medium"
                ).toLowerCase()}`}
              >
                {deal.priority || "Medium"}
              </span>
            </div>

            <p>
              {deal.company} · {deal.contact}
            </p>
          </div>
        </div>

        <div className="deal-details__hero-actions">
          <button
            type="button"
            className="deal-details__edit"
            onClick={openEditModal}
          >
            <Edit3 size={17} />
            Edit deal
          </button>

          <button
            type="button"
            className="deal-details__delete"
            onClick={handleDeleteDeal}
          >
            <Trash2 size={17} />
            Delete
          </button>
        </div>
      </section>

      <section className="deal-details__stats">
        <article>
          <CircleDollarSign size={21} />

          <div>
            <span>Deal value</span>
            <strong>
              {formatCurrency(deal.value)}
            </strong>
          </div>
        </article>

        <article>
          <Target size={21} />

          <div>
            <span>Probability</span>
            <strong>
              {deal.probability ?? 0}%
            </strong>
          </div>
        </article>

        <article>
          <CheckCircle2 size={21} />

          <div>
            <span>Expected revenue</span>
            <strong>
              {formatCurrency(expectedRevenue)}
            </strong>
          </div>
        </article>

        <article>
          <CalendarDays size={21} />

          <div>
            <span>Close date</span>
            <strong>
              {formatDate(deal.closeDate)}
            </strong>
          </div>
        </article>
      </section>

      <div className="deal-details__layout">
        <main className="deal-details__main">
          <section className="deal-details__panel">
            <div className="deal-details__panel-header">
              <div>
                <h2>Activity timeline</h2>

                <p>
                  Calls, meetings, emails, and deal updates.
                </p>
              </div>

              <span>{activities.length}</span>
            </div>

            <form
              className="deal-details__activity-form"
              onSubmit={handleAddActivity}
            >
              <select
                value={activityType}
                onChange={(event) =>
                  setActivityType(event.target.value)
                }
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">
                  Meeting
                </option>
                <option value="Note">Note</option>
              </select>

              <input
                type="text"
                placeholder="Describe the activity..."
                value={newActivity}
                onChange={(event) =>
                  setNewActivity(event.target.value)
                }
              />

              <button type="submit">
                <Plus size={17} />
                Add
              </button>
            </form>

            {activities.length === 0 ? (
              <div className="deal-details__empty">
                <Activity size={29} />

                <p>No activity recorded yet.</p>
              </div>
            ) : (
              <div className="deal-details__timeline">
                {activities.map((activity) => (
                  <article
                    className="deal-details__timeline-item"
                    key={activity.id}
                  >
                    <div className="deal-details__timeline-icon">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div>
                      <div className="deal-details__timeline-heading">
                        <strong>{activity.type}</strong>

                        <button
                          type="button"
                          aria-label="Delete activity"
                          onClick={() =>
                            handleDeleteActivity(
                              activity.id
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p>{activity.description}</p>

                      <span>{activity.createdAt}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="deal-details__panel">
            <div className="deal-details__panel-header">
              <div>
                <h2>Related tasks</h2>

                <p>
                  Follow-ups connected to this opportunity.
                </p>
              </div>

              <button
                type="button"
                className="deal-details__view-tasks"
                onClick={() => navigate("/tasks")}
              >
                View all tasks
              </button>
            </div>

            {relatedTasks.length === 0 ? (
              <div className="deal-details__empty">
                <CheckCircle2 size={29} />

                <p>No related tasks found.</p>
              </div>
            ) : (
              <div className="deal-details__tasks">
                {relatedTasks.map((task) => (
                  <article key={task.id}>
                    <div
                      className={`deal-details__task-icon deal-details__task-icon--${task.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {task.status === "Completed" ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Clock3 size={18} />
                      )}
                    </div>

                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>

                      <span>
                        <CalendarDays size={13} />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>

                    <strong>{task.status}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
        <aside className="deal-details__sidebar">
          <section className="deal-details__panel">
            <div className="deal-details__panel-header">
              <div>
                <h2>Deal information</h2>

                <p>
                  Main ownership and relationship details.
                </p>
              </div>
            </div>

            <div className="deal-details__information">
              <div>
                <Building2 size={18} />

                <span>
                  <small>Company</small>

                  {relatedCompany ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/companies/${relatedCompany.id}`
                        )
                      }
                    >
                      {deal.company}
                    </button>
                  ) : (
                    <strong>{deal.company}</strong>
                  )}
                </span>
              </div>

              <div>
                <UserRound size={18} />

                <span>
                  <small>Contact</small>

                  {relatedContact ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/contacts/${relatedContact.id}`
                        )
                      }
                    >
                      {deal.contact}
                    </button>
                  ) : (
                    <strong>{deal.contact}</strong>
                  )}
                </span>
              </div>

              <div>
                <UserRound size={18} />

                <span>
                  <small>Deal owner</small>
                  <strong>
                    {deal.owner || "Juan Ligarrero"}
                  </strong>
                </span>
              </div>

              <div>
                <Target size={18} />

                <span>
                  <small>Pipeline stage</small>
                  <strong>{deal.stage}</strong>
                </span>
              </div>

              <div>
                <CalendarDays size={18} />

                <span>
                  <small>Expected close date</small>
                  <strong>
                    {formatDate(deal.closeDate)}
                  </strong>
                </span>
              </div>
            </div>
          </section>

          <section className="deal-details__panel">
            <div className="deal-details__panel-header">
              <div>
                <h2>Notes</h2>

                <p>
                  Important context about this opportunity.
                </p>
              </div>

              <span>{notes.length}</span>
            </div>

            <form
              className="deal-details__note-form"
              onSubmit={handleAddNote}
            >
              <textarea
                placeholder="Write a note about this deal..."
                value={newNote}
                onChange={(event) =>
                  setNewNote(event.target.value)
                }
              />

              <button type="submit">
                <Plus size={17} />
                Add note
              </button>
            </form>

            {notes.length === 0 ? (
              <div className="deal-details__empty deal-details__empty--small">
                <MessageSquare size={26} />

                <p>No notes yet.</p>
              </div>
            ) : (
              <div className="deal-details__notes">
                {notes.map((note) => (
                  <article key={note.id}>
                    <div>
                      <span>{note.createdAt}</span>

                      <button
                        type="button"
                        aria-label="Delete note"
                        onClick={() =>
                          handleDeleteNote(note.id)
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p>{note.content}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="deal-details__panel">
            <div className="deal-details__panel-header">
              <div>
                <h2>CRM summary</h2>

                <p>
                  Current status of this opportunity.
                </p>
              </div>
            </div>

            <div className="deal-details__summary">
              <div>
                <span>Open tasks</span>
                <strong>{openTasks.length}</strong>
              </div>

              <div>
                <span>Completed tasks</span>
                <strong>{completedTasks.length}</strong>
              </div>

              <div>
                <span>Activities</span>
                <strong>{activities.length}</strong>
              </div>

              <div>
                <span>Notes</span>
                <strong>{notes.length}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {isEditModalOpen && (
        <div className="deal-details-modal">
          <div
            className="deal-details-modal__overlay"
            onClick={closeEditModal}
          />

          <div className="deal-details-modal__content">
            <div className="deal-details-modal__header">
              <div>
                <h2>Edit deal</h2>

                <p>
                  Update this opportunity and its forecast.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close edit deal modal"
                onClick={closeEditModal}
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="deal-details-modal__form"
              onSubmit={handleSaveDeal}
            >
              {formError && (
                <p className="deal-details-modal__error">
                  {formError}
                </p>
              )}

              <label>
                Deal title
                <input
                  type="text"
                  value={dealForm.title}
                  onChange={(event) =>
                    setDealForm({
                      ...dealForm,
                      title: event.target.value,
                    })
                  }
                />
              </label>

              <div className="deal-details-modal__form-grid">
                <label>
                  Company
                  {companies.length > 0 ? (
                    <select
                      value={dealForm.company}
                      onChange={(event) =>
                        setDealForm({
                          ...dealForm,
                          company: event.target.value,
                          contact: "",
                        })
                      }
                    >
                      <option value="">
                        Select a company
                      </option>

                      {companies.map((company) => (
                        <option
                          value={company.name}
                          key={company.id}
                        >
                          {company.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={dealForm.company}
                      onChange={(event) =>
                        setDealForm({
                          ...dealForm,
                          company: event.target.value,
                        })
                      }
                    />
                  )}
                </label>

                <label>
                  Contact
                  {contacts.length > 0 ? (
                    <select
                      value={dealForm.contact}
                      onChange={(event) =>
                        setDealForm({
                          ...dealForm,
                          contact: event.target.value,
                        })
                      }
                    >
                      <option value="">
                        Select a contact
                      </option>

                      {contacts.map((contact) => (
                        <option
                          value={contact.name}
                          key={contact.id}
                        >
                          {contact.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={dealForm.contact}
                      onChange={(event) =>
                        setDealForm({
                          ...dealForm,
                          contact: event.target.value,
                        })
                      }
                    />
                  )}
                </label>
              </div>

              <div className="deal-details-modal__form-grid">
                <label>
                  Deal value
                  <input
                    type="number"
                    min="1"
                    value={dealForm.value}
                    onChange={(event) =>
                      setDealForm({
                        ...dealForm,
                        value: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Probability
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.probability}
                    onChange={(event) =>
                      setDealForm({
                        ...dealForm,
                        probability:
                          event.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="deal-details-modal__form-grid">
                <label>
                  Expected close date
                  <input
                    type="date"
                    value={dealForm.closeDate}
                    onChange={(event) =>
                      setDealForm({
                        ...dealForm,
                        closeDate: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Pipeline stage
                  <select
                    value={dealForm.stage}
                    onChange={(event) =>
                      handleStageChange(
                        event.target.value
                      )
                    }
                  >
                    {pipelineStages.map((stage) => (
                      <option
                        value={stage}
                        key={stage}
                      >
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="deal-details-modal__form-grid">
                <label>
                  Deal owner
                  <select
                    value={dealForm.owner}
                    onChange={(event) =>
                      setDealForm({
                        ...dealForm,
                        owner: event.target.value,
                      })
                    }
                  >
                    {dealOwners.map((owner) => (
                      <option
                        value={owner}
                        key={owner}
                      >
                        {owner}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={dealForm.priority}
                    onChange={(event) =>
                      setDealForm({
                        ...dealForm,
                        priority:
                          event.target.value,
                      })
                    }
                  >
                    {dealPriorities.map(
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

              <div className="deal-details-modal__preview">
                <span>Expected revenue</span>

                <strong>
                  {formatCurrency(
                    Number(dealForm.value || 0) *
                      (Number(
                        dealForm.probability || 0
                      ) /
                        100)
                  )}
                </strong>
              </div>

              <div className="deal-details-modal__actions">
                <button
                  type="button"
                  className="deal-details-modal__cancel"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="deal-details-modal__save"
                >
                  <Save size={17} />
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealDetails;