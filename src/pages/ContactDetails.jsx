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
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Save,
  StickyNote,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import "./ContactDetails.css";

const initialContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@brightlabs.com",
    company: "Bright Labs",
    phone: "+1 305 555 0148",
    status: "Lead",
  },
  {
    id: 2,
    name: "James Miller",
    email: "james@northstar.io",
    company: "Northstar",
    phone: "+1 212 555 0182",
    status: "Customer",
  },
  {
    id: 3,
    name: "Anna Lopez",
    email: "anna@greentech.co",
    company: "GreenTech",
    phone: "+57 310 555 0194",
    status: "Prospect",
  },
  {
    id: 4,
    name: "Michael Chen",
    email: "michael@apexsystems.com",
    company: "Apex Systems",
    phone: "+1 415 555 0167",
    status: "Customer",
  },
];

const emptyContact = {
  name: "",
  email: "",
  company: "",
  phone: "",
  status: "Lead",
};

const readStoredArray = (key, fallback = []) => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

function ContactDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const contactId = Number(id);

  const [contacts, setContacts] = useState(() =>
    readStoredArray("flowcrm-contacts", initialContacts)
  );
  const [notes, setNotes] = useState(() =>
    readStoredArray(`flowcrm-contact-${contactId}-notes`)
  );
  const [newNote, setNewNote] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ ...emptyContact });
  const [formError, setFormError] = useState("");

  const contact = useMemo(
    () => contacts.find((item) => Number(item.id) === contactId),
    [contacts, contactId]
  );

  const companies = useMemo(
    () => readStoredArray("flowcrm-companies"),
    []
  );

  const relatedCompany = useMemo(
    () =>
      companies.find(
        (company) =>
          company.name?.trim().toLowerCase() ===
          contact?.company?.trim().toLowerCase()
      ),
    [companies, contact]
  );

  const relatedTasks = useMemo(
    () =>
      readStoredArray("flowcrm-tasks").filter(
        (task) =>
          task.relatedType === "Contact" &&
          String(task.relatedId) === String(contactId)
      ),
    [contactId]
  );

  const relatedDeals = useMemo(() => {
    if (!contact) return [];

    return readStoredArray("flowcrm-deals").filter(
      (deal) =>
        deal.contact?.trim().toLowerCase() ===
        contact.name?.trim().toLowerCase()
    );
  }, [contact]);

  const openTasks = relatedTasks.filter(
    (task) => task.status !== "Completed"
  );
  const completedTasks = relatedTasks.filter(
    (task) => task.status === "Completed"
  );
  const openDeals = relatedDeals.filter((deal) => deal.stage !== "Won");
  const wonDeals = relatedDeals.filter((deal) => deal.stage === "Won");

  useEffect(() => {
    localStorage.setItem("flowcrm-contacts", JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(
      `flowcrm-contact-${contactId}-notes`,
      JSON.stringify(notes)
    );
  }, [notes, contactId]);

  useEffect(() => {
    if (!contact) return;

    setContactForm({
      name: contact.name || "",
      email: contact.email || "",
      company: contact.company || "",
      phone: contact.phone || "",
      status: contact.status || "Lead",
    });
  }, [contact]);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (value, currency = "USD") => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    } catch {
      return `$${Number(value || 0).toLocaleString()}`;
    }
  };

  const getTaskIcon = (status) => {
    if (status === "Completed") return <CheckCircle2 size={18} />;
    if (status === "In Progress") return <Clock3 size={18} />;
    return <Circle size={18} />;
  };

  const openEditModal = () => {
    if (!contact) return;
    setContactForm({
      name: contact.name || "",
      email: contact.email || "",
      company: contact.company || "",
      phone: contact.phone || "",
      status: contact.status || "Lead",
    });
    setFormError("");
    setEditingContact(true);
  };

  const closeEditModal = () => {
    setEditingContact(false);
    setFormError("");
  };

  const saveContact = (event) => {
    event.preventDefault();

    if (
      !contactForm.name.trim() ||
      !contactForm.email.trim() ||
      !contactForm.company.trim() ||
      !contactForm.phone.trim()
    ) {
      setFormError("Please complete all contact fields.");
      return;
    }

    setContacts((currentContacts) =>
      currentContacts.map((item) =>
        Number(item.id) === contactId
          ? {
              ...item,
              name: contactForm.name.trim(),
              email: contactForm.email.trim(),
              company: contactForm.company.trim(),
              phone: contactForm.phone.trim(),
              status: contactForm.status,
            }
          : item
      )
    );

    closeEditModal();
  };

  const addNote = (event) => {
    event.preventDefault();
    const text = newNote.trim();
    if (!text) return;

    setNotes((currentNotes) => [
      {
        id: Date.now(),
        text,
        createdAt: new Date().toISOString(),
      },
      ...currentNotes,
    ]);
    setNewNote("");
  };

  const removeNote = (noteId) => {
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== noteId)
    );
  };

  const callContact = () => {
    if (contact?.phone) window.location.href = `tel:${contact.phone}`;
  };

  const emailContact = () => {
    if (contact?.email) window.location.href = `mailto:${contact.email}`;
  };

  const messageContact = () => {
    navigate("/whatsapp");
  };

  if (!contact) {
    return (
      <div className="contact-details-page">
        <button
          type="button"
          className="contact-details__back"
          onClick={() => navigate("/contacts")}
        >
          <ArrowLeft size={18} />
          Back to contacts
        </button>

        <section className="contact-details__not-found">
          <UserRound size={44} />
          <h1>Contact not found</h1>
          <p>
            This contact may have been deleted or the address is incorrect.
          </p>
          <button type="button" onClick={() => navigate("/contacts")}>
            Return to contacts
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="contact-details-page">
      <button
        type="button"
        className="contact-details__back"
        onClick={() => navigate("/contacts")}
      >
        <ArrowLeft size={18} />
        Back to contacts
      </button>

      <section className="contact-details__hero">
        <div className="contact-details__identity">
          <div className="contact-details__avatar">
            {getInitials(contact.name)}
          </div>

          <div>
            <div className="contact-details__name-row">
              <h1>{contact.name}</h1>
              <span
                className={`contact-details__status contact-details__status--${contact.status.toLowerCase()}`}
              >
                {contact.status}
              </span>
            </div>
            <p>{contact.company}</p>
          </div>
        </div>

        <button
          type="button"
          className="contact-details__edit-button"
          onClick={openEditModal}
        >
          <Edit3 size={17} />
          Edit contact
        </button>
      </section>

      <section className="contact-details__quick-actions">
        <button type="button" onClick={emailContact}>
          <Mail size={18} />
          Email
        </button>
        <button type="button" onClick={callContact}>
          <Phone size={18} />
          Call
        </button>
        <button type="button" onClick={messageContact}>
          <MessageCircle size={18} />
          WhatsApp
        </button>
        <button type="button" onClick={() => navigate("/tasks")}>
          <Plus size={18} />
          Add task
        </button>
      </section>

      <div className="contact-details__grid">
        <main className="contact-details__main">
          <section className="contact-details__panel">
            <div className="contact-details__panel-header">
              <div>
                <h2>Contact information</h2>
                <p>Primary details and organization.</p>
              </div>
            </div>

            <div className="contact-details__information-grid">
              <div className="contact-details__information-item">
                <div className="contact-details__information-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <span>Email</span>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              </div>

              <div className="contact-details__information-item">
                <div className="contact-details__information-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <span>Phone</span>
                  <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                </div>
              </div>

              <div className="contact-details__information-item">
                <div className="contact-details__information-icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <span>Company</span>
                  {relatedCompany ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/companies/${relatedCompany.id}`)
                      }
                      style={{
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        color: "inherit",
                        font: "inherit",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {contact.company}
                    </button>
                  ) : (
                    <strong>{contact.company}</strong>
                  )}
                </div>
              </div>

              <div className="contact-details__information-item">
                <div className="contact-details__information-icon">
                  <UserRound size={18} />
                </div>
                <div>
                  <span>Lifecycle</span>
                  <strong>{contact.status}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="contact-details__panel">
            <div className="contact-details__panel-header">
              <div>
                <h2>Related tasks</h2>
                <p>Follow-ups and activities connected to this contact.</p>
              </div>
              <button
                type="button"
                className="contact-details__tasks-button"
                onClick={() => navigate("/tasks")}
              >
                View all tasks
              </button>
            </div>

            {relatedTasks.length === 0 ? (
              <div className="contact-details__tasks-empty">
                <CalendarDays size={28} />
                <p>No tasks related to this contact.</p>
              </div>
            ) : (
              <div className="contact-details__tasks-list">
                {relatedTasks.map((task) => (
                  <article className="contact-details__task" key={task.id}>
                    <div
                      className={`contact-details__task-icon contact-details__task-icon--${task.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {getTaskIcon(task.status)}
                    </div>
                    <div className="contact-details__task-content">
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                      <div>
                        <span
                          className={`contact-details__task-priority contact-details__task-priority--${task.priority.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>
                        <span>
                          <CalendarDays size={13} />
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    <span className="contact-details__task-status">
                      {task.status}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="contact-details__panel">
            <div className="contact-details__panel-header">
              <div>
                <h2>Activity</h2>
                <p>Recent CRM activity for this contact.</p>
              </div>
            </div>

            <div className="contact-details__timeline">
              {relatedDeals.slice(0, 3).map((deal) => (
                <div className="contact-details__timeline-item" key={deal.id}>
                  <div className="contact-details__timeline-marker">
                    <Building2 size={16} />
                  </div>
                  <div className="contact-details__timeline-content">
                    <div>
                      <h3>{deal.title}</h3>
                      <span>{deal.stage}</span>
                    </div>
                    <p>
                      Deal value {formatCurrency(deal.value, deal.currency)} · Expected close {formatDate(deal.closeDate)}
                    </p>
                  </div>
                </div>
              ))}

              {relatedTasks.slice(0, 3).map((task) => (
                <div
                  className="contact-details__timeline-item"
                  key={`task-${task.id}`}
                >
                  <div className="contact-details__timeline-marker">
                    <CalendarDays size={16} />
                  </div>
                  <div className="contact-details__timeline-content">
                    <div>
                      <h3>{task.title}</h3>
                      <span>{task.status}</span>
                    </div>
                    <p>{task.description}</p>
                  </div>
                </div>
              ))}

              {relatedDeals.length === 0 && relatedTasks.length === 0 && (
                <div className="contact-details__tasks-empty">
                  <Clock3 size={28} />
                  <p>No activity recorded yet.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="contact-details__sidebar">
          <section className="contact-details__panel">
            <div className="contact-details__panel-header">
              <div>
                <h2>Notes</h2>
                <p>Keep context close to the contact.</p>
              </div>
            </div>

            <form className="contact-details__note-form" onSubmit={addNote}>
              <textarea
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                placeholder="Add a note about this contact..."
              />
              <button type="submit">
                <Plus size={16} />
                Add note
              </button>
            </form>

            <div className="contact-details__notes-list">
              {notes.length === 0 ? (
                <div className="contact-details__empty-notes">
                  <StickyNote size={26} />
                  <p>No notes yet</p>
                  <span>Add useful context, call notes, or next steps.</span>
                </div>
              ) : (
                notes.map((note) => (
                  <article className="contact-details__note" key={note.id}>
                    <div className="contact-details__note-header">
                      <span>
                        {new Date(note.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        type="button"
                        aria-label="Delete note"
                        onClick={() => removeNote(note.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p>{note.text}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="contact-details__panel">
            <div className="contact-details__panel-header">
              <div>
                <h2>CRM summary</h2>
                <p>Current relationship snapshot.</p>
              </div>
            </div>

            <div className="contact-details__summary">
              <div>
                <span>Open tasks</span>
                <strong>{openTasks.length}</strong>
              </div>
              <div>
                <span>Completed</span>
                <strong>{completedTasks.length}</strong>
              </div>
              <div>
                <span>Open deals</span>
                <strong>{openDeals.length}</strong>
              </div>
              <div>
                <span>Won deals</span>
                <strong>{wonDeals.length}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {editingContact && (
        <div className="contact-details-modal">
          <div
            className="contact-details-modal__overlay"
            onClick={closeEditModal}
          />
          <div className="contact-details-modal__content">
            <div className="contact-details-modal__header">
              <div>
                <h2>Edit contact</h2>
                <p>Update this contact&apos;s CRM information.</p>
              </div>
              <button
                type="button"
                aria-label="Close edit contact"
                onClick={closeEditModal}
              >
                <X size={20} />
              </button>
            </div>

            <form className="contact-details-modal__form" onSubmit={saveContact}>
              {formError && (
                <p className="contact-details-modal__error">{formError}</p>
              )}

              <label>
                Name
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Company
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      company: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Phone
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={contactForm.status}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="Lead">Lead</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Customer">Customer</option>
                </select>
              </label>

              <div className="contact-details-modal__actions">
                <button
                  type="button"
                  className="contact-details-modal__cancel"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="contact-details-modal__save"
                >
                  <Save size={16} />
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

export default ContactDetails;
