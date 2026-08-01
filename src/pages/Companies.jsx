import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ExternalLink,
  Globe2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import "./Companies.css";

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

const emptyCompany = {
  name: "",
  industry: "",
  website: "",
  employees: "",
  location: "",
  status: "Prospect",
};

function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState(() => {
    const savedCompanies = localStorage.getItem("flowcrm-companies");

    if (savedCompanies) {
      try {
        return JSON.parse(savedCompanies);
      } catch {
        return initialCompanies;
      }
    }

    return initialCompanies;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [companyForm, setCompanyForm] = useState({ ...emptyCompany });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-companies",
      JSON.stringify(companies)
    );
  }, [companies]);

  const industries = useMemo(() => {
    const uniqueIndustries = [
      ...new Set(companies.map((company) => company.industry)),
    ];

    return ["All", ...uniqueIndustries.sort()];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(normalizedSearch) ||
        company.industry.toLowerCase().includes(normalizedSearch) ||
        company.location.toLowerCase().includes(normalizedSearch);

      const matchesIndustry =
        industryFilter === "All" ||
        company.industry === industryFilter;

      return matchesSearch && matchesIndustry;
    });
  }, [companies, industryFilter, searchTerm]);

  const totalEmployees = companies.reduce(
    (total, company) => total + Number(company.employees || 0),
    0
  );

  const activeCompanies = companies.filter(
    (company) => company.status === "Active"
  ).length;

  const prospectCompanies = companies.filter(
    (company) => company.status === "Prospect"
  ).length;

  const getInitials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompanyId(null);
    setCompanyForm({ ...emptyCompany });
    setFormError("");
  };

  const openAddModal = () => {
    setEditingCompanyId(null);
    setCompanyForm({ ...emptyCompany });
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (company) => {
    setEditingCompanyId(company.id);

    setCompanyForm({
      name: company.name,
      industry: company.industry,
      website: company.website,
      employees: String(company.employees),
      location: company.location,
      status: company.status,
    });

    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveCompany = (event) => {
    event.preventDefault();

    if (
      !companyForm.name.trim() ||
      !companyForm.industry.trim() ||
      !companyForm.website.trim() ||
      !String(companyForm.employees).trim() ||
      !companyForm.location.trim()
    ) {
      setFormError("Please complete all company fields.");
      return;
    }

    const employeeCount = Number(companyForm.employees);

    if (
      Number.isNaN(employeeCount) ||
      employeeCount < 0
    ) {
      setFormError("Employees must be a valid number.");
      return;
    }

    const normalizedCompany = {
      ...companyForm,
      website: companyForm.website.startsWith("http")
        ? companyForm.website
        : `https://${companyForm.website}`,
      employees: employeeCount,
    };

    if (editingCompanyId !== null) {
      setCompanies((currentCompanies) =>
        currentCompanies.map((company) =>
          company.id === editingCompanyId
            ? {
                ...company,
                ...normalizedCompany,
              }
            : company
        )
      );
    } else {
      setCompanies((currentCompanies) => [
        ...currentCompanies,
        {
          id: Date.now(),
          ...normalizedCompany,
        },
      ]);
    }

    closeModal();
  };

  const handleDeleteCompany = (companyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company?"
    );

    if (!confirmed) {
      return;
    }

    setCompanies((currentCompanies) =>
      currentCompanies.filter(
        (company) => company.id !== companyId
      )
    );

    setOpenMenuId(null);
  };

  return (
    <div className="companies-page">
      <section className="companies-page__header">
        <div>
          <h1>Companies</h1>
          <p>
            Manage organizations, relationships, contacts, and
            opportunities.
          </p>
        </div>

        <button
          type="button"
          className="companies-page__add-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Company
        </button>
      </section>

      <section className="companies-page__stats">
        <article className="companies-stat">
          <div className="companies-stat__icon">
            <Building2 size={21} />
          </div>

          <div>
            <span>Total companies</span>
            <strong>{companies.length}</strong>
          </div>
        </article>

        <article className="companies-stat">
          <div className="companies-stat__icon">
            <Globe2 size={21} />
          </div>

          <div>
            <span>Active companies</span>
            <strong>{activeCompanies}</strong>
          </div>
        </article>

        <article className="companies-stat">
          <div className="companies-stat__icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total employees</span>
            <strong>{totalEmployees.toLocaleString()}</strong>
          </div>
        </article>

        <article className="companies-stat">
          <div className="companies-stat__icon">
            <Building2 size={21} />
          </div>

          <div>
            <span>Prospects</span>
            <strong>{prospectCompanies}</strong>
          </div>
        </article>
      </section>

      <section className="companies-page__toolbar">
        <div className="companies-page__search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search companies, industries, or locations..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <select
          value={industryFilter}
          onChange={(event) =>
            setIndustryFilter(event.target.value)
          }
        >
          {industries.map((industry) => (
            <option value={industry} key={industry}>
              {industry === "All"
                ? "All industries"
                : industry}
            </option>
          ))}
        </select>
      </section>

      {filteredCompanies.length === 0 ? (
        <section className="companies-page__empty">
          <Building2 size={42} />

          <h2>No companies found</h2>

          <p>
            Try a different search or create a new company.
          </p>

          <button type="button" onClick={openAddModal}>
            <Plus size={17} />
            Add Company
          </button>
        </section>
      ) : (
        <section className="companies-grid">
          {filteredCompanies.map((company) => (
            <article
              className="company-card"
              key={company.id}
            >
              <div className="company-card__top">
                <div
                  className="company-card__identity"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/companies/${company.id}`)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      navigate(`/companies/${company.id}`);
                    }
                  }}
                >
                  <div className="company-card__avatar">
                    {getInitials(company.name)}
                  </div>

                  <div>
                    <h2>{company.name}</h2>
                    <p>{company.industry}</p>
                  </div>
                </div>

                <div className="company-card__menu">
                  <button
                    type="button"
                    aria-label={`Actions for ${company.name}`}
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === company.id
                          ? null
                          : company.id
                      )
                    }
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {openMenuId === company.id && (
                    <div className="company-card__dropdown">
                      <button
                        type="button"
                        onClick={() => openEditModal(company)}
                      >
                        <Pencil size={15} />
                        Edit company
                      </button>

                      <button
                        type="button"
                        className="company-card__delete"
                        onClick={() =>
                          handleDeleteCompany(company.id)
                        }
                      >
                        <Trash2 size={15} />
                        Delete company
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="company-card__details">
                <div>
                  <span>Location</span>
                  <strong>{company.location}</strong>
                </div>

                <div>
                  <span>Employees</span>
                  <strong>
                    {Number(company.employees).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="company-card__footer">
                <span
                  className={`company-card__status company-card__status--${company.status.toLowerCase()}`}
                >
                  {company.status}
                </span>

                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit website
                  <ExternalLink size={14} />
                </a>
              </div>

              <button
                type="button"
                className="company-card__open"
                onClick={() =>
                  navigate(`/companies/${company.id}`)
                }
              >
                View company profile
              </button>
            </article>
          ))}
        </section>
      )}

      {isModalOpen && (
        <div className="company-modal">
          <div
            className="company-modal__overlay"
            onClick={closeModal}
          />

          <div className="company-modal__content">
            <div className="company-modal__header">
              <div>
                <h2>
                  {editingCompanyId !== null
                    ? "Edit Company"
                    : "Add Company"}
                </h2>

                <p>
                  {editingCompanyId !== null
                    ? "Update the organization information."
                    : "Create a new company in FlowCRM."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close company modal"
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="company-modal__form"
              onSubmit={handleSaveCompany}
            >
              {formError && (
                <p className="company-modal__error">
                  {formError}
                </p>
              )}

              <label>
                Company name
                <input
                  type="text"
                  placeholder="e.g. Bright Labs"
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
                  placeholder="e.g. Software"
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
                Website
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={companyForm.website}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      website: event.target.value,
                    })
                  }
                />
              </label>

              <div className="company-modal__form-grid">
                <label>
                  Employees
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
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
                    <option value="Prospect">Prospect</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <label>
                Location
                <input
                  type="text"
                  placeholder="City, Country"
                  value={companyForm.location}
                  onChange={(event) =>
                    setCompanyForm({
                      ...companyForm,
                      location: event.target.value,
                    })
                  }
                />
              </label>

              <div className="company-modal__actions">
                <button
                  type="button"
                  className="company-modal__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="company-modal__save"
                >
                  {editingCompanyId !== null
                    ? "Update Company"
                    : "Save Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Companies;