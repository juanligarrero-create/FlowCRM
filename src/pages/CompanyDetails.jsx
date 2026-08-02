import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Edit3,
  ExternalLink,
  Globe2,
  MapPin,
  Plus,
  Save,
  StickyNote,
  Trash2,
  Users,
  X,
} from "lucide-react";
import "./CompanyDetails.css";

const initialCompanies = [
  {
    id: 1,
    name: "Bright Labs",
    industry: "Software",
    location: "Miami, United States",
    employees: 120,
    website: "https://brightlabs.com",
    status: "Active",
    pipelineValue: 12500,
  },
  {
    id: 2,
    name: "Northstar",
    industry: "Technology",
    location: "New York, United States",
    employees: 85,
    website: "https://northstar.io",
    status: "Active",
    pipelineValue: 8200,
  },
  {
    id: 3,
    name: "GreenTech",
    industry: "Clean Energy",
    location: "Bogotá, Colombia",
    employees: 240,
    website: "https://greentech.co",
    status: "Prospect",
    pipelineValue: 18500,
  },
  {
    id: 4,
    name: "Apex Systems",
    industry: "Consulting",
    location: "Chicago, United States",
    employees: 430,
    website: "https://apexsystems.com",
    status: "Inactive",
    pipelineValue: 0,
  },
];

const emptyCompany = {
  name: "",
  industry: "",
  location: "",
  employees: "",
  website: "",
  status: "Active",
};

function CompanyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const companyId = Number(id);

  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem("flowcrm-companies");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCompanies;
      }
    }

    return initialCompanies;
  });

  const company = useMemo(
    () =>
      companies.find(
        (item) => Number(item.id) === companyId
      ),
    [companies, companyId]
  );

  const relatedContacts = useMemo(() => {
    const savedContacts =
      localStorage.getItem("flowcrm-contacts");

    if (!savedContacts || !company) {
      return [];
    }

    try {
      return JSON.parse(savedContacts).filter(
        (contact) =>
          contact.company === company.name
      );
    } catch {
      return [];
    }
  }, [company]);

  const relatedTasks = useMemo(() => {
    const savedTasks =
      localStorage.getItem("flowcrm-tasks");

    if (!savedTasks) {
      return [];
    }

    try {
      return JSON.parse(savedTasks).filter(
        (task) =>
          task.relatedType === "Company" &&
          String(task.relatedId) ===
            String(companyId)
      );
    } catch {
      return [];
    }
  }, [companyId]);

  const openTasks = relatedTasks.filter(
    (task) => task.status !== "Completed"
  );

  const completedTasks = relatedTasks.filter(
    (task) => task.status === "Completed"
  );

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(
      `flowcrm-company-${companyId}-notes`
    );

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }

    return [];
  });

  const [newNote, setNewNote] = useState("");

  const [editingCompany, setEditingCompany] =
    useState(false);

  const [companyForm, setCompanyForm] =
    useState(emptyCompany);

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-companies",
      JSON.stringify(companies)
    );
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(
      `flowcrm-company-${companyId}-notes`,
      JSON.stringify(notes)
    );
  }, [notes, companyId]);

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name,
        industry: company.industry,
        location: company.location,
        employees: company.employees,
        website: company.website,
        status: company.status,
      });
    }
  }, [company]);

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTaskIcon = (status) => {
    if (status === "Completed")
      return <CheckCircle2 size={18} />;

    if (status === "In Progress")
      return <Clock3 size={18} />;

    return <Circle size={18} />;
  };
  const relatedDeals = useMemo(() => {
    const savedDeals = localStorage.getItem("flowcrm-deals");

    if (!savedDeals || !company) {
      return [];
    }

    try {
      return JSON.parse(savedDeals).filter(
        (deal) =>
          deal.company?.toLowerCase() ===
          company.name.toLowerCase()
      );
    } catch {
      return [];
    }
  }, [company]);

  const totalPipelineValue = relatedDeals.reduce(
    (total, deal) => total + Number(deal.value || 0),
    0
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const handleAddNote = (event) => {
    event.preventDefault();

    const trimmedNote = newNote.trim();

    if (!trimmedNote) {
      return;
    }

    const noteToAdd = {
      id: Date.now(),
      content: trimmedNote,
      createdAt: new Date().toLocaleString(),
    };

    setNotes((currentNotes) => [
      noteToAdd,
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

  const openEditModal = () => {
    if (!company) {
      return;
    }

    setCompanyForm({
      name: company.name,
      industry: company.industry,
      location: company.location,
      employees: company.employees,
      website: company.website,
      status: company.status,
    });

    setEditingCompany(true);
  };

  const closeEditModal = () => {
    setEditingCompany(false);
  };

  const handleSaveCompany = (event) => {
    event.preventDefault();

    if (
      !companyForm.name.trim() ||
      !companyForm.industry.trim() ||
      !companyForm.location.trim() ||
      !String(companyForm.employees).trim() ||
      !companyForm.website.trim()
    ) {
      return;
    }

    const normalizedWebsite =
      companyForm.website.startsWith("http")
        ? companyForm.website
        : `https://${companyForm.website}`;

    setCompanies((currentCompanies) =>
      currentCompanies.map((item) =>
        Number(item.id) === companyId
          ? {
              ...item,
              ...companyForm,
              employees: Number(companyForm.employees),
              website: normalizedWebsite,
            }
          : item
      )
    );

    closeEditModal();
  };

  if (!company) {
    return (
      <div className="company-details-page">
        <button
          type="button"
          className="company-details__back"
          onClick={() => navigate("/companies")}
        >
          <ArrowLeft size={18} />
          Back to companies
        </button>

        <section className="company-details__not-found">
          <Building2 size={44} />

          <h1>Company not found</h1>

          <p>
            This company may have been deleted or the address is
            incorrect.
          </p>

          <button
            type="button"
            onClick={() => navigate("/companies")}
          >
            Return to companies
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="company-details-page">
      <button
        type="button"
        className="company-details__back"
        onClick={() => navigate("/companies")}
      >
        <ArrowLeft size={18} />
        Back to companies
      </button>

      <section className="company-details__hero">
        <div className="company-details__identity">
          <div className="company-details__avatar">
            {getInitials(company.name)}
          </div>

          <div>
            <div className="company-details__title-row">
              <h1>{company.name}</h1>

              <span
                className={`company-details__status company-details__status--${company.status.toLowerCase()}`}
              >
                {company.status}
              </span>
            </div>

            <p>
              {company.industry} · {company.location}
            </p>
          </div>
        </div>

        <div className="company-details__hero-actions">
          <button
            type="button"
            className="company-details__edit"
            onClick={openEditModal}
          >
            <Edit3 size={17} />
            Edit company
          </button>

          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="company-details__website"
          >
            <ExternalLink size={17} />
            Visit website
          </a>
        </div>
      </section>

      <section className="company-details__stats">
        <article>
          <Users size={20} />

          <div>
            <span>Related contacts</span>
            <strong>{relatedContacts.length}</strong>
          </div>
        </article>

        <article>
          <CalendarDays size={20} />

          <div>
            <span>Open tasks</span>
            <strong>{openTasks.length}</strong>
          </div>
        </article>

        <article>
          <CheckCircle2 size={20} />

          <div>
            <span>Completed tasks</span>
            <strong>{completedTasks.length}</strong>
          </div>
        </article>

        <article>
          <Building2 size={20} />

          <div>
            <span>Pipeline value</span>
            <strong>
              {formatCurrency(
                totalPipelineValue ||
                  company.pipelineValue
              )}
            </strong>
          </div>
        </article>
      </section>

      <div className="company-details__layout">
        <main className="company-details__main">
          <section className="company-details__panel">
            <div className="company-details__panel-header">
              <div>
                <h2>Related tasks</h2>

                <p>
                  Follow-ups and activities connected to this
                  company.
                </p>
              </div>

              <button
                type="button"
                className="company-details__tasks-button"
                onClick={() => navigate("/tasks")}
              >
                View all tasks
              </button>
            </div>

            {relatedTasks.length === 0 ? (
              <div className="company-details__tasks-empty">
                <CalendarDays size={28} />
                <p>No tasks related to this company.</p>
              </div>
            ) : (
              <div className="company-details__tasks-list">
                {relatedTasks.map((task) => (
                  <article
                    className="company-details__task"
                    key={task.id}
                  >
                    <div
                      className={`company-details__task-icon company-details__task-icon--${task.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {getTaskIcon(task.status)}
                    </div>

                    <div className="company-details__task-content">
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>

                      <div>
                        <span
                          className={`company-details__task-priority company-details__task-priority--${task.priority.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>

                        <span>
                          <CalendarDays size={13} />
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    <span className="company-details__task-status">
                      {task.status}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="company-details__panel">
            <div className="company-details__panel-header">
              <div>
                <h2>Contacts</h2>
                <p>
                  People associated with this organization.
                </p>
              </div>

              <span>{relatedContacts.length}</span>
            </div>

            {relatedContacts.length === 0 ? (
              <div className="company-details__empty">
                <Users size={28} />
                <p>No related contacts yet.</p>
              </div>
            ) : (
              <div className="company-details__contacts">
                {relatedContacts.map((contact) => (
                  <button
                    type="button"
                    key={contact.id}
                    onClick={() =>
                      navigate(`/contacts/${contact.id}`)
                    }
                  >
                    <div className="company-details__contact-avatar">
                      {getInitials(contact.name)}
                    </div>

                    <div>
                      <strong>{contact.name}</strong>
                      <span>{contact.email}</span>
                    </div>

                    <span
                      className={`company-details__contact-status company-details__contact-status--${contact.status.toLowerCase()}`}
                    >
                      {contact.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="company-details__panel">
            <div className="company-details__panel-header">
              <div>
                <h2>Deals</h2>
                <p>
                  Sales opportunities connected to this company.
                </p>
              </div>

              <span>{relatedDeals.length}</span>
            </div>

            {relatedDeals.length === 0 ? (
              <div className="company-details__empty">
                <Building2 size={28} />
                <p>No related deals yet.</p>
              </div>
            ) : (
              <div className="company-details__deals">
                {relatedDeals.map((deal) => (
                  <article key={deal.id}>
                    <div>
                      <h3>{deal.title}</h3>
                      <p>
                        {deal.contact || company.name}
                      </p>
                    </div>

                    <div className="company-details__deal-meta">
                      <strong>
                        {formatCurrency(deal.value)}
                      </strong>

                      <span>{deal.stage}</span>

                      <small>
                        <CalendarDays size={13} />
                        {formatDate(deal.closeDate)}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="company-details__sidebar">
          <section className="company-details__panel">
            <div className="company-details__panel-header">
              <div>
                <h2>Company information</h2>
                <p>Primary organization details.</p>
              </div>
            </div>

            <div className="company-details__information">
              <div>
                <Globe2 size={18} />

                <span>
                  <small>Website</small>

                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {company.website.replace(
                      /^https?:\/\//,
                      ""
                    )}
                  </a>
                </span>
              </div>

              <div>
                <Building2 size={18} />

                <span>
                  <small>Industry</small>
                  <strong>{company.industry}</strong>
                </span>
              </div>

              <div>
                <Users size={18} />

                <span>
                  <small>Employees</small>

                  <strong>
                    {Number(
                      company.employees
                    ).toLocaleString()}
                  </strong>
                </span>
              </div>

              <div>
                <MapPin size={18} />

                <span>
                  <small>Location</small>
                  <strong>{company.location}</strong>
                </span>
              </div>
            </div>
          </section>

          <section className="company-details__panel">
            <div className="company-details__panel-header">
              <div>
                <h2>Notes</h2>

                <p>
                  Important information about this company.
                </p>
              </div>
            </div>

            <form
              className="company-details__note-form"
              onSubmit={handleAddNote}
            >
              <textarea
                placeholder="Write a note about this company..."
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

            <div className="company-details__notes-list">
              {notes.length === 0 ? (
                <div className="company-details__notes-empty">
                  <StickyNote size={25} />
                  <p>No notes yet.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <article
                    className="company-details__note"
                    key={note.id}
                  >
                    <div>
                      <span>{note.createdAt}</span>

                      <button
                        type="button"
                        aria-label="Delete note"
                        onClick={() =>
                          handleDeleteNote(note.id)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p>{note.content}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="company-details__panel">
            <div className="company-details__panel-header">
              <div>
                <h2>CRM summary</h2>
                <p>Current company relationship.</p>
              </div>
            </div>

            <div className="company-details__summary">
              <div>
                <span>Contacts</span>
                <strong>{relatedContacts.length}</strong>
              </div>

              <div>
                <span>Open tasks</span>
                <strong>{openTasks.length}</strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedTasks.length}</strong>
              </div>

              <div>
                <span>Notes</span>
                <strong>{notes.length}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {editingCompany && (
        <div className="company-details-modal">
          <div
            className="company-details-modal__overlay"
            onClick={closeEditModal}
          />

          <div className="company-details-modal__content">
            <div className="company-details-modal__header">
              <div>
                <h2>Edit company</h2>
                <p>Update the organization information.</p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                aria-label="Close edit company modal"
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="company-details-modal__form"
              onSubmit={handleSaveCompany}
            >
              <label>
                Company name
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Industry
                <input
                  type="text"
                  value={companyForm.industry}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      industry: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Location
                <input
                  type="text"
                  value={companyForm.location}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      location: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Employees
                <input
                  type="number"
                  min="0"
                  value={companyForm.employees}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      employees: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Website
                <input
                  type="text"
                  value={companyForm.website}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      website: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={companyForm.status}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </label>

              <div className="company-details-modal__actions">
                <button
                  type="button"
                  className="company-details-modal__cancel"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="company-details-modal__save"
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

export default CompanyDetails;