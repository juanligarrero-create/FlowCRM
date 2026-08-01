import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  MoreHorizontal,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import "./Deals.css";

const pipelineStages = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const emptyDeal = {
  title: "",
  company: "",
  contact: "",
  value: "",
  closeDate: "",
  stage: "Lead",
};

const initialDeals = [
  {
    id: 1,
    title: "CRM Automation Package",
    company: "Bright Labs",
    contact: "Sarah Johnson",
    value: 12500,
    closeDate: "2026-08-15",
    stage: "Lead",
  },
  {
    id: 2,
    title: "WhatsApp Sales Integration",
    company: "Northstar",
    contact: "James Miller",
    value: 8200,
    closeDate: "2026-08-20",
    stage: "Qualified",
  },
  {
    id: 3,
    title: "Customer Support Automation",
    company: "GreenTech",
    contact: "Anna Lopez",
    value: 15600,
    closeDate: "2026-09-01",
    stage: "Proposal",
  },
  {
    id: 4,
    title: "Enterprise CRM Setup",
    company: "Apex Systems",
    contact: "Michael Chen",
    value: 24000,
    closeDate: "2026-08-28",
    stage: "Negotiation",
  },
  {
    id: 5,
    title: "Lead Management System",
    company: "Nova Digital",
    contact: "Laura Martinez",
    value: 9800,
    closeDate: "2026-07-28",
    stage: "Won",
  },
];

function Deals() {
  const [deals, setDeals] = useState(() => {
    const savedDeals = localStorage.getItem("flowcrm-deals");

    if (savedDeals) {
      try {
        return JSON.parse(savedDeals);
      } catch {
        return initialDeals;
      }
    }

    return initialDeals;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealId, setEditingDealId] = useState(null);
  const [dealForm, setDealForm] = useState({ ...emptyDeal });
  const [formError, setFormError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    localStorage.setItem("flowcrm-deals", JSON.stringify(deals));
  }, [deals]);

  const pipelineValue = useMemo(
    () =>
      deals
        .filter((deal) => deal.stage !== "Lost")
        .reduce((total, deal) => total + Number(deal.value || 0), 0),
    [deals]
  );

  const wonValue = useMemo(
    () =>
      deals
        .filter((deal) => deal.stage === "Won")
        .reduce((total, deal) => total + Number(deal.value || 0), 0),
    [deals]
  );

  const activeDeals = deals.filter(
    (deal) => deal.stage !== "Won" && deal.stage !== "Lost"
  ).length;

  const wonDeals = deals.filter((deal) => deal.stage === "Won").length;

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

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDealId(null);
    setDealForm({ ...emptyDeal });
    setFormError("");
  };

  const openAddDealModal = (stage = "Lead") => {
    setEditingDealId(null);
    setDealForm({
      ...emptyDeal,
      stage,
    });
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditDealModal = (deal) => {
    setEditingDealId(deal.id);
    setDealForm({
      title: deal.title,
      company: deal.company,
      contact: deal.contact,
      value: String(deal.value),
      closeDate: deal.closeDate,
      stage: deal.stage,
    });
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveDeal = (event) => {
    event.preventDefault();

    if (
      !dealForm.title.trim() ||
      !dealForm.company.trim() ||
      !dealForm.contact.trim() ||
      !String(dealForm.value).trim() ||
      !dealForm.closeDate
    ) {
      setFormError("Please complete all deal fields.");
      return;
    }

    const numericValue = Number(dealForm.value);

    if (Number.isNaN(numericValue) || numericValue <= 0) {
      setFormError("Deal value must be greater than zero.");
      return;
    }

    if (editingDealId !== null) {
      setDeals((currentDeals) =>
        currentDeals.map((deal) =>
          deal.id === editingDealId
            ? {
                ...deal,
                ...dealForm,
                value: numericValue,
              }
            : deal
        )
      );
    } else {
      const newDeal = {
        id: Date.now(),
        ...dealForm,
        value: numericValue,
      };

      setDeals((currentDeals) => [...currentDeals, newDeal]);
    }

    closeModal();
  };

  const handleDeleteDeal = (dealId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deal?"
    );

    if (!confirmed) {
      return;
    }

    setDeals((currentDeals) =>
      currentDeals.filter((deal) => deal.id !== dealId)
    );

    setOpenMenuId(null);
  };

  const moveDeal = (dealId, direction) => {
    setDeals((currentDeals) =>
      currentDeals.map((deal) => {
        if (deal.id !== dealId) {
          return deal;
        }

        const currentIndex = pipelineStages.indexOf(deal.stage);
        const nextIndex = currentIndex + direction;

        if (nextIndex < 0 || nextIndex >= pipelineStages.length) {
          return deal;
        }

        return {
          ...deal,
          stage: pipelineStages[nextIndex],
        };
      })
    );

    setOpenMenuId(null);
  };

  return (
    <div className="deals-page">
      <section className="deals-page__header">
        <div>
          <h1>Deals Pipeline</h1>
          <p>Track opportunities through every stage of the sales process.</p>
        </div>

        <button
          type="button"
          className="deals-page__add-button"
          onClick={() => openAddDealModal()}
        >
          <Plus size={18} />
          Add Deal
        </button>
      </section>

      <section className="deals-page__stats">
        <article className="deals-stat">
          <div className="deals-stat__icon">
            <CircleDollarSign size={21} />
          </div>

          <div>
            <span>Pipeline value</span>
            <strong>{formatCurrency(pipelineValue)}</strong>
          </div>
        </article>

        <article className="deals-stat">
          <div className="deals-stat__icon">
            <Building2 size={21} />
          </div>

          <div>
            <span>Active deals</span>
            <strong>{activeDeals}</strong>
          </div>
        </article>

        <article className="deals-stat">
          <div className="deals-stat__icon">
            <CircleDollarSign size={21} />
          </div>

          <div>
            <span>Won revenue</span>
            <strong>{formatCurrency(wonValue)}</strong>
          </div>
        </article>

        <article className="deals-stat">
          <div className="deals-stat__icon">
            <UserRound size={21} />
          </div>

          <div>
            <span>Won deals</span>
            <strong>{wonDeals}</strong>
          </div>
        </article>
      </section>

      <section className="deals-board">
        {pipelineStages.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage);

          const stageValue = stageDeals.reduce(
            (total, deal) => total + Number(deal.value || 0),
            0
          );

          return (
            <article className="deals-column" key={stage}>
              <div className="deals-column__header">
                <div>
                  <div className="deals-column__title-row">
                    <span
                      className={`deals-column__indicator deals-column__indicator--${stage.toLowerCase()}`}
                    />

                    <h2>{stage}</h2>

                    <span className="deals-column__count">
                      {stageDeals.length}
                    </span>
                  </div>

                  <p>{formatCurrency(stageValue)}</p>
                </div>

                <button
                  type="button"
                  className="deals-column__add"
                  aria-label={`Add deal to ${stage}`}
                  onClick={() => openAddDealModal(stage)}
                >
                  <Plus size={17} />
                </button>
              </div>

              <div className="deals-column__cards">
                {stageDeals.length === 0 ? (
                  <div className="deals-column__empty">
                    <p>No deals here</p>
                    <button
                      type="button"
                      onClick={() => openAddDealModal(stage)}
                    >
                      Add a deal
                    </button>
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const stageIndex = pipelineStages.indexOf(deal.stage);

                    return (
                      <article className="deal-card" key={deal.id}>
                        <div className="deal-card__top">
                          <span className="deal-card__value">
                            {formatCurrency(deal.value)}
                          </span>

                          <div className="deal-card__menu">
                            <button
                              type="button"
                              className="deal-card__menu-button"
                              aria-label={`Actions for ${deal.title}`}
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === deal.id ? null : deal.id
                                )
                              }
                            >
                              <MoreHorizontal size={19} />
                            </button>

                            {openMenuId === deal.id && (
                              <div className="deal-card__dropdown">
                                <button
                                  type="button"
                                  onClick={() => openEditDealModal(deal)}
                                >
                                  <Edit3 size={15} />
                                  Edit deal
                                </button>

                                <button
                                  type="button"
                                  className="deal-card__delete"
                                  onClick={() => handleDeleteDeal(deal.id)}
                                >
                                  <Trash2 size={15} />
                                  Delete deal
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3>{deal.title}</h3>

                        <div className="deal-card__detail">
                          <Building2 size={15} />
                          <span>{deal.company}</span>
                        </div>

                        <div className="deal-card__detail">
                          <UserRound size={15} />
                          <span>{deal.contact}</span>
                        </div>

                        <div className="deal-card__detail">
                          <CalendarDays size={15} />
                          <span>{formatDate(deal.closeDate)}</span>
                        </div>

                        <div className="deal-card__move-actions">
                          <button
                            type="button"
                            disabled={stageIndex === 0}
                            onClick={() => moveDeal(deal.id, -1)}
                          >
                            <ChevronLeft size={16} />
                            Back
                          </button>

                          <button
                            type="button"
                            disabled={
                              stageIndex === pipelineStages.length - 1
                            }
                            onClick={() => moveDeal(deal.id, 1)}
                          >
                            Next
                            <ChevronRight size={16} />
                          </button>
                        </div>
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
        <div className="deal-modal">
          <div className="deal-modal__overlay" onClick={closeModal} />

          <div className="deal-modal__content">
            <div className="deal-modal__header">
              <div>
                <h2>
                  {editingDealId !== null ? "Edit Deal" : "Add Deal"}
                </h2>

                <p>
                  {editingDealId !== null
                    ? "Update the opportunity information."
                    : "Create a new opportunity in your sales pipeline."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close deal modal"
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </div>

            <form className="deal-modal__form" onSubmit={handleSaveDeal}>
              {formError && (
                <p className="deal-modal__error">{formError}</p>
              )}

              <label>
                Deal title
                <input
                  type="text"
                  placeholder="e.g. CRM Automation Package"
                  value={dealForm.title}
                  onChange={(event) =>
                    setDealForm({
                      ...dealForm,
                      title: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Company
                <input
                  type="text"
                  placeholder="Company name"
                  value={dealForm.company}
                  onChange={(event) =>
                    setDealForm({
                      ...dealForm,
                      company: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Contact
                <input
                  type="text"
                  placeholder="Contact name"
                  value={dealForm.contact}
                  onChange={(event) =>
                    setDealForm({
                      ...dealForm,
                      contact: event.target.value,
                    })
                  }
                />
              </label>

              <div className="deal-modal__form-grid">
                <label>
                  Deal value
                  <input
                    type="number"
                    min="1"
                    placeholder="10000"
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
              </div>

              <label>
                Pipeline stage
                <select
                  value={dealForm.stage}
                  onChange={(event) =>
                    setDealForm({
                      ...dealForm,
                      stage: event.target.value,
                    })
                  }
                >
                  {pipelineStages.map((stage) => (
                    <option value={stage} key={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>

              <div className="deal-modal__actions">
                <button
                  type="button"
                  className="deal-modal__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="deal-modal__save">
                  {editingDealId !== null ? "Update Deal" : "Save Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deals;