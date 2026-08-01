import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    CalendarPlus,
    CheckCircle2,
    Clock3,
    DollarSign,
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

const defaultTimeline = [
    {
        id: 1,
        title: "Contact created",
        description: "The contact was added to FlowCRM.",
        time: "Today, 9:30 AM",
        type: "created",
    },
    {
        id: 2,
        title: "Follow-up scheduled",
        description: "A follow-up reminder was created.",
        time: "Today, 10:15 AM",
        type: "task",
    },
    {
        id: 3,
        title: "WhatsApp conversation",
        description: "A new message was received from this contact.",
        time: "Yesterday, 4:40 PM",
        type: "message",
    },
];

function ContactDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const contactId = Number(id);

    const [contacts, setContacts] = useState(() => {
        const savedContacts = localStorage.getItem("flowcrm-contacts");

        if (savedContacts) {
            try {
                return JSON.parse(savedContacts);
            } catch {
                return initialContacts;
            }
        }

        return initialContacts;
    });

    const contact = useMemo(
        () => contacts.find((item) => Number(item.id) === contactId),
        [contacts, contactId]
    );

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedContact, setEditedContact] = useState(emptyContact);
    const [formError, setFormError] = useState("");

    const notesStorageKey = `flowcrm-contact-${contactId}-notes`;
    const timelineStorageKey = `flowcrm-contact-${contactId}-timeline`;

    const [notes, setNotes] = useState(() => {
        const savedNotes = localStorage.getItem(notesStorageKey);

        if (savedNotes) {
            try {
                return JSON.parse(savedNotes);
            } catch {
                return [];
            }
        }

        return [];
    });

    const [newNote, setNewNote] = useState("");

    const [timeline, setTimeline] = useState(() => {
        const savedTimeline = localStorage.getItem(timelineStorageKey);

        if (savedTimeline) {
            try {
                return JSON.parse(savedTimeline);
            } catch {
                return defaultTimeline;
            }
        }

        return defaultTimeline;
    });

    useEffect(() => {
        localStorage.setItem("flowcrm-contacts", JSON.stringify(contacts));
    }, [contacts]);

    useEffect(() => {
        localStorage.setItem(notesStorageKey, JSON.stringify(notes));
    }, [notes, notesStorageKey]);

    useEffect(() => {
        localStorage.setItem(timelineStorageKey, JSON.stringify(timeline));
    }, [timeline, timelineStorageKey]);

    useEffect(() => {
        if (contact) {
            setEditedContact({
                name: contact.name,
                email: contact.email,
                company: contact.company,
                phone: contact.phone,
                status: contact.status,
            });
        }
    }, [contact]);

    const getInitials = (name) => {
        if (!name) {
            return "NA";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase();
    };

    const addTimelineItem = (title, description, type) => {
        const newTimelineItem = {
            id: Date.now(),
            title,
            description,
            time: new Date().toLocaleString(),
            type,
        };

        setTimeline((currentTimeline) => [
            newTimelineItem,
            ...currentTimeline,
        ]);
    };

    const openEditModal = () => {
        if (!contact) {
            return;
        }

        setEditedContact({
            name: contact.name,
            email: contact.email,
            company: contact.company,
            phone: contact.phone,
            status: contact.status,
        });

        setFormError("");
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setFormError("");
        setIsEditModalOpen(false);
    };

    const handleSaveContact = (event) => {
        event.preventDefault();

        if (
            !editedContact.name.trim() ||
            !editedContact.email.trim() ||
            !editedContact.company.trim() ||
            !editedContact.phone.trim()
        ) {
            setFormError("Please complete all contact fields.");
            return;
        }

        setContacts((currentContacts) =>
            currentContacts.map((item) =>
                Number(item.id) === contactId
                    ? {
                        ...item,
                        ...editedContact,
                    }
                    : item
            )
        );

        addTimelineItem(
            "Contact updated",
            "The contact information was edited.",
            "updated"
        );

        closeEditModal();
    };

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

        setNotes((currentNotes) => [noteToAdd, ...currentNotes]);
        setNewNote("");

        addTimelineItem(
            "Note added",
            "A new note was added to this contact.",
            "note"
        );
    };

    const handleDeleteNote = (noteId) => {
        setNotes((currentNotes) =>
            currentNotes.filter((note) => note.id !== noteId)
        );
    };

    const handleWhatsApp = () => {
        if (!contact) {
            return;
        }

        const cleanPhone = contact.phone.replace(/[^\d]/g, "");

        window.open(`https://wa.me/${cleanPhone}`, "_blank");

        addTimelineItem(
            "WhatsApp opened",
            "A WhatsApp conversation was started.",
            "message"
        );
    };

    const handleCreateDeal = () => {
        addTimelineItem(
            "Deal action selected",
            "The Create Deal action was opened.",
            "deal"
        );

        window.alert("The Deals module will be connected in the next sprint.");
    };

    const handleAddTask = () => {
        addTimelineItem(
            "Task action selected",
            "The Add Task action was opened.",
            "task"
        );

        window.alert("The Tasks module will be connected in a future sprint.");
    };

    const getTimelineIcon = (type) => {
        switch (type) {
            case "message":
                return <MessageCircle size={17} />;
            case "deal":
                return <DollarSign size={17} />;
            case "task":
                return <Clock3 size={17} />;
            case "note":
                return <StickyNote size={17} />;
            case "updated":
                return <Edit3 size={17} />;
            default:
                return <CheckCircle2 size={17} />;
        }
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
                    <UserRound size={42} />

                    <h1>Contact not found</h1>

                    <p>
                        This contact may have been deleted or the address is incorrect.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/contacts")}
                    >
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

                        <p>
                            {contact.company} · Added to FlowCRM
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="contact-details__edit-button"
                    onClick={openEditModal}
                >
                    <Edit3 size={18} />
                    Edit contact
                </button>
            </section>

            <section className="contact-details__quick-actions">
                <button type="button" onClick={openEditModal}>
                    <Edit3 size={19} />
                    <span>Edit</span>
                </button>

                <button type="button" onClick={handleWhatsApp}>
                    <MessageCircle size={19} />
                    <span>WhatsApp</span>
                </button>

                <button type="button" onClick={handleCreateDeal}>
                    <DollarSign size={19} />
                    <span>Create deal</span>
                </button>

                <button type="button" onClick={handleAddTask}>
                    <CalendarPlus size={19} />
                    <span>Add task</span>
                </button>
            </section>

            <div className="contact-details__grid">
                <div className="contact-details__main">
                    <section className="contact-details__panel">
                        <div className="contact-details__panel-header">
                            <div>
                                <h2>Contact information</h2>
                                <p>Primary details for this contact.</p>
                            </div>
                        </div>

                        <div className="contact-details__information-grid">
                            <article className="contact-details__information-item">
                                <div className="contact-details__information-icon">
                                    <Mail size={19} />
                                </div>

                                <div>
                                    <span>Email address</span>
                                    <a href={`mailto:${contact.email}`}>
                                        {contact.email}
                                    </a>
                                </div>
                            </article>

                            <article className="contact-details__information-item">
                                <div className="contact-details__information-icon">
                                    <Phone size={19} />
                                </div>

                                <div>
                                    <span>Phone number</span>
                                    <a href={`tel:${contact.phone}`}>
                                        {contact.phone}
                                    </a>
                                </div>
                            </article>

                            <article className="contact-details__information-item">
                                <div className="contact-details__information-icon">
                                    <Building2 size={19} />
                                </div>

                                <div>
                                    <span>Company</span>
                                    <strong>{contact.company}</strong>
                                </div>
                            </article>

                            <article className="contact-details__information-item">
                                <div className="contact-details__information-icon">
                                    <UserRound size={19} />
                                </div>

                                <div>
                                    <span>Lifecycle stage</span>
                                    <strong>{contact.status}</strong>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="contact-details__panel">
                        <div className="contact-details__panel-header">
                            <div>
                                <h2>Activity timeline</h2>
                                <p>Recent actions and updates for this contact.</p>
                            </div>
                        </div>

                        <div className="contact-details__timeline">
                            {timeline.map((item) => (
                                <article
                                    className="contact-details__timeline-item"
                                    key={item.id}
                                >
                                    <div className="contact-details__timeline-marker">
                                        {getTimelineIcon(item.type)}
                                    </div>

                                    <div className="contact-details__timeline-content">
                                        <div>
                                            <h3>{item.title}</h3>
                                            <span>{item.time}</span>
                                        </div>

                                        <p>{item.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="contact-details__sidebar">
                    <section className="contact-details__panel">
                        <div className="contact-details__panel-header">
                            <div>
                                <h2>Notes</h2>
                                <p>Important context and follow-up information.</p>
                            </div>
                        </div>

                        <form
                            className="contact-details__note-form"
                            onSubmit={handleAddNote}
                        >
                            <textarea
                                placeholder="Write a note about this contact..."
                                value={newNote}
                                onChange={(event) => setNewNote(event.target.value)}
                            />

                            <button type="submit">
                                <Plus size={17} />
                                Add note
                            </button>
                        </form>

                        <div className="contact-details__notes-list">
                            {notes.length === 0 ? (
                                <div className="contact-details__empty-notes">
                                    <StickyNote size={25} />

                                    <p>No notes yet.</p>

                                    <span>
                                        Add the first note to keep important context here.
                                    </span>
                                </div>
                            ) : (
                                notes.map((note) => (
                                    <article
                                        className="contact-details__note"
                                        key={note.id}
                                    >
                                        <div className="contact-details__note-header">
                                            <span>{note.createdAt}</span>

                                            <button
                                                type="button"
                                                aria-label="Delete note"
                                                onClick={() => handleDeleteNote(note.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <p>{note.content}</p>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="contact-details__panel">
                        <div className="contact-details__panel-header">
                            <div>
                                <h2>CRM summary</h2>
                                <p>Current relationship overview.</p>
                            </div>
                        </div>

                        <div className="contact-details__summary">
                            <div>
                                <span>Open deals</span>
                                <strong>0</strong>
                            </div>

                            <div>
                                <span>Tasks due</span>
                                <strong>0</strong>
                            </div>

                            <div>
                                <span>Notes</span>
                                <strong>{notes.length}</strong>
                            </div>

                            <div>
                                <span>Activities</span>
                                <strong>{timeline.length}</strong>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>

            {isEditModalOpen && (
                <div className="contact-details-modal">
                    <div
                        className="contact-details-modal__overlay"
                        onClick={closeEditModal}
                    />

                    <div className="contact-details-modal__content">
                        <div className="contact-details-modal__header">
                            <div>
                                <h2>Edit contact</h2>
                                <p>Update the contact’s information.</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditModal}
                                aria-label="Close edit modal"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form
                            className="contact-details-modal__form"
                            onSubmit={handleSaveContact}
                        >
                            {formError && (
                                <p className="contact-details-modal__error">
                                    {formError}
                                </p>
                            )}

                            <label>
                                Full name
                                <input
                                    type="text"
                                    value={editedContact.name}
                                    onChange={(event) =>
                                        setEditedContact({
                                            ...editedContact,
                                            name: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Email
                                <input
                                    type="email"
                                    value={editedContact.email}
                                    onChange={(event) =>
                                        setEditedContact({
                                            ...editedContact,
                                            email: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Company
                                <input
                                    type="text"
                                    value={editedContact.company}
                                    onChange={(event) =>
                                        setEditedContact({
                                            ...editedContact,
                                            company: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Phone
                                <input
                                    type="tel"
                                    value={editedContact.phone}
                                    onChange={(event) =>
                                        setEditedContact({
                                            ...editedContact,
                                            phone: event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Status
                                <select
                                    value={editedContact.status}
                                    onChange={(event) =>
                                        setEditedContact({
                                            ...editedContact,
                                            status: event.target.value,
                                        })
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

export default ContactDetails;