import { useEffect, useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Contacts.css";

const emptyContact = {
  name: "",
  email: "",
  company: "",
  phone: "",
  status: "Lead",
};

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

function Contacts() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ ...emptyContact });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingContactId, setEditingContactId] = useState(null);
  const [formError, setFormError] = useState("");

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

  useEffect(() => {
    localStorage.setItem("flowcrm-contacts", JSON.stringify(contacts));
  }, [contacts]);

  const filteredContacts = contacts.filter((contact) => {
    const searchValue = searchTerm.toLowerCase();

    const matchesSearch =
      contact.name.toLowerCase().includes(searchValue) ||
      contact.email.toLowerCase().includes(searchValue) ||
      contact.company.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContactId(null);
    setNewContact({ ...emptyContact });
    setFormError("");
  };

  const handleOpenAddModal = () => {
    setEditingContactId(null);
    setNewContact({ ...emptyContact });
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleEditContact = (contact) => {
    setNewContact({
      name: contact.name,
      email: contact.email,
      company: contact.company,
      phone: contact.phone,
      status: contact.status,
    });

    setEditingContactId(contact.id);
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDeleteContact = (contactId) => {
    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== contactId)
    );

    setOpenMenuId(null);
  };

  const handleSaveContact = (event) => {
    event.preventDefault();

    if (
      !newContact.name.trim() ||
      !newContact.email.trim() ||
      !newContact.company.trim() ||
      !newContact.phone.trim()
    ) {
      setFormError("Please complete all contact fields.");
      return;
    }

    setFormError("");

    if (editingContactId !== null) {
      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          contact.id === editingContactId
            ? {
                ...contact,
                ...newContact,
              }
            : contact
        )
      );
    } else {
      const contactToAdd = {
        id: Date.now(),
        ...newContact,
      };

      setContacts((currentContacts) => [
        ...currentContacts,
        contactToAdd,
      ]);
    }

    closeModal();
  };

  return (
    <div className="contacts-page">
      <section className="contacts-page__header">
        <div>
          <h1>Contacts</h1>
          <p>Manage your leads, prospects, and customers.</p>
        </div>

        <button
          type="button"
          className="contacts-page__add-button"
          onClick={handleOpenAddModal}
        >
          <Plus size={18} />
          Add Contact
        </button>
      </section>

      <section className="contacts-page__toolbar">
        <div className="contacts-page__search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="contacts-page__filters">
          {["All", "Lead", "Prospect", "Customer"].map((status) => (
            <button
              key={status}
              type="button"
              className={
                statusFilter === status
                  ? "contacts-page__filter contacts-page__filter--active"
                  : "contacts-page__filter"
              }
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      <section className="contacts-table">
        <div className="contacts-table__header">
          <span>Contact</span>
          <span>Company</span>
          <span>Phone</span>
          <span>Status</span>
          <span />
        </div>

        {filteredContacts.map((contact) => (
          <div className="contacts-table__row" key={contact.id}>
            <div
              className="contacts-table__contact"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/contacts/${contact.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate(`/contacts/${contact.id}`);
                }
              }}
            >
              <div className="contacts-table__avatar">...</div>

              <div>
                <strong>{contact.name}</strong>
                <span>{contact.email}</span>
              </div>
            </div>

            <span>{contact.company}</span>
            <span>{contact.phone}</span>

            <span
              className={`contacts-table__status contacts-table__status--${contact.status.toLowerCase()}`}
            >
              {contact.status}
            </span>

            <div className="contacts-table__menu">
              <button
                type="button"
                className="contacts-table__menu-button"
                aria-label={`Actions for ${contact.name}`}
                onClick={() =>
                  setOpenMenuId(
                    openMenuId === contact.id ? null : contact.id
                  )
                }
              >
                <MoreHorizontal size={20} />
              </button>

              {openMenuId === contact.id && (
                <div className="contacts-table__dropdown">
                  <button
                    type="button"
                    onClick={() => handleEditContact(contact)}
                  >
                    Edit contact
                  </button>

                  <button
                    type="button"
                    className="contacts-table__delete-option"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    Delete contact
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {isModalOpen && (
        <div className="contact-modal">
          <div
            className="contact-modal__overlay"
            onClick={closeModal}
          />

          <div className="contact-modal__content">
            <div className="contact-modal__header">
              <div>
                <h2>
                  {editingContactId !== null
                    ? "Edit Contact"
                    : "Add Contact"}
                </h2>

                <p>
                  {editingContactId !== null
                    ? "Update this contact's information."
                    : "Create a new contact in your CRM."}
                </p>
              </div>

              <button
                type="button"
                className="contact-modal__close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form
              className="contact-modal__form"
              onSubmit={handleSaveContact}
            >
              {formError && (
                <p className="contact-modal__error">
                  {formError}
                </p>
              )}

              <input
                type="text"
                placeholder="e.g. Laura Martinez"
                value={newContact.name}
                onChange={(event) =>
                  setNewContact({
                    ...newContact,
                    name: event.target.value,
                  })
                }
              />

              <input
                type="email"
                placeholder="laura@company.com"
                value={newContact.email}
                onChange={(event) =>
                  setNewContact({
                    ...newContact,
                    email: event.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Company name"
                value={newContact.company}
                onChange={(event) =>
                  setNewContact({
                    ...newContact,
                    company: event.target.value,
                  })
                }
              />

              <input
                type="tel"
                placeholder="+57 300 000 0000"
                value={newContact.phone}
                onChange={(event) =>
                  setNewContact({
                    ...newContact,
                    phone: event.target.value,
                  })
                }
              />

              <select
                value={newContact.status}
                onChange={(event) =>
                  setNewContact({
                    ...newContact,
                    status: event.target.value,
                  })
                }
              >
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
                <option value="Customer">Customer</option>
              </select>

              <div className="contact-modal__actions">
                <button
                  type="button"
                  className="contact-modal__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="contact-modal__save"
                >
                  {editingContactId !== null
                    ? "Update Contact"
                    : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;