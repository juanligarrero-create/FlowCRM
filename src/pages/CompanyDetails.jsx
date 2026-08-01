import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  Globe2,
  MapPin,
  Users,
} from "lucide-react";
import "./CompanyDetails.css";

const initialCompanies = [
  {
    id: 1,
    name: "Bright Labs",
    industry: "Software",
    website: "https://brightlabs.com",
    employees: 120,
    location: "Miami, United States",
    status: "Active",
  },
  {
    id: 2,
    name: "Northstar",
    industry: "Technology",
    website: "https://northstar.io",
    employees: 85,
    location: "New York, United States",
    status: "Active",
  },
  {
    id: 3,
    name: "GreenTech",
    industry: "Clean Energy",
    website: "https://greentech.co",
    employees: 240,
    location: "Bogotá, Colombia",
    status: "Prospect",
  },
  {
    id: 4,
    name: "Apex Systems",
    industry: "Consulting",
    website: "https://apexsystems.com",
    employees: 430,
    location: "San Francisco, United States",
    status: "Active",
  },
  {
    id: 5,
    name: "Nova Digital",
    industry: "Marketing",
    website: "https://novadigital.com",
    employees: 46,
    location: "Medellín, Colombia",
    status: "Prospect",
  },
];

function CompanyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const companyId = Number(id);

  const companies = useMemo(() => {
    const savedCompanies = localStorage.getItem(
      "flowcrm-companies"
    );

    if (savedCompanies) {
      try {
        return JSON.parse(savedCompanies);
      } catch {
        return initialCompanies;
      }
    }

    return initialCompanies;
  }, []);

  const contacts = useMemo(() => {
    const savedContacts = localStorage.getItem("flowcrm-contacts");

    if (!savedContacts) {
      return [];
    }

    try {
      return JSON.parse(savedContacts);
    } catch {
      return [];
    }
  }, []);

  const deals = useMemo(() => {
    const savedDeals = localStorage.getItem("flowcrm-deals");

    if (!savedDeals) {
      return [];
    }

    try {
      return JSON.parse(savedDeals);
    } catch {
      return [];
    }
  }, []);

  const company = companies.find(
    (item) => Number(item.id) === companyId
  );

  const relatedContacts = company
    ? contacts.filter(
        (contact) =>
          contact.company.toLowerCase() ===
          company.name.toLowerCase()
      )
    : [];

  const relatedDeals = company
    ? deals.filter(
        (deal) =>
          deal.company.toLowerCase() ===
          company.name.toLowerCase()
      )
    : [];

  const totalDealValue = relatedDeals.reduce(
    (total, deal) => total + Number(deal.value || 0),
    0
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (date) => {
    if (!date) {
      return "No close date";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

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

        <a
          href={company.website}
          target="_blank"
          rel="noreferrer"
          className="company-details__website"
        >
          <ExternalLink size={17} />
          Visit website
        </a>
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
          <BriefcaseBusiness size={20} />

          <div>
            <span>Related deals</span>
            <strong>{relatedDeals.length}</strong>
          </div>
        </article>

        <article>
          <Building2 size={20} />

          <div>
            <span>Employees</span>
            <strong>
              {Number(company.employees).toLocaleString()}
            </strong>
          </div>
        </article>

        <article>
          <BriefcaseBusiness size={20} />

          <div>
            <span>Pipeline value</span>
            <strong>{formatCurrency(totalDealValue)}</strong>
          </div>
        </article>
      </section>

      <div className="company-details__layout">
        <main className="company-details__main">
          <section className="company-details__panel">
            <div className="company-details__panel-header">
              <div>
                <h2>Contacts</h2>
                <p>People associated with this organization.</p>
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
                <p>Sales opportunities connected to this company.</p>
              </div>

              <span>{relatedDeals.length}</span>
            </div>

            {relatedDeals.length === 0 ? (
              <div className="company-details__empty">
                <BriefcaseBusiness size={28} />
                <p>No related deals yet.</p>
              </div>
            ) : (
              <div className="company-details__deals">
                {relatedDeals.map((deal) => (
                  <article key={deal.id}>
                    <div>
                      <h3>{deal.title}</h3>
                      <p>{deal.contact}</p>
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
                    {company.website.replace(/^https?:\/\//, "")}
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
                    {Number(company.employees).toLocaleString()}
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
                <h2>Relationship summary</h2>
                <p>Current CRM connection.</p>
              </div>
            </div>

            <div className="company-details__summary">
              <div>
                <span>Contacts</span>
                <strong>{relatedContacts.length}</strong>
              </div>

              <div>
                <span>Deals</span>
                <strong>{relatedDeals.length}</strong>
              </div>

              <div>
                <span>Pipeline</span>
                <strong>
                  {formatCurrency(totalDealValue)}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{company.status}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default CompanyDetails;