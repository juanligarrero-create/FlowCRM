import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
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

const emptyDeal = {
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

const initialDeals = [
  {
    id: 1,
    title: "CRM Automation Package",
    company: "Bright Labs",
    contact: "Sarah Johnson",
    value: 12500,
    closeDate: "2026-08-15",
    stage: "Lead",
    probability: 10,
    owner: "Juan Ligarrero",
    priority: "High",
  },
  {
    id: 2,
    title: "WhatsApp Sales Integration",
    company: "Northstar",
    contact: "James Miller",
    value: 8200,
    closeDate: "2026-08-20",
    stage: "Qualified",
    probability: 25,
    owner: "Maria Torres",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Customer Support Automation",
    company: "GreenTech",
    contact: "Anna Lopez",
    value: 15600,
    closeDate: "2026-09-01",
    stage: "Proposal",
    probability: 50,
    owner: "Juan Ligarrero",
    priority: "High",
  },
  {
    id: 4,
    title: "Enterprise CRM Setup",
    company: "Apex Systems",
    contact: "Michael Chen",
    value: 24000,
    closeDate: "2026-08-28",
    stage: "Negotiation",
    probability: 75,
    owner: "Daniel Rivera",
    priority: "High",
  },
  {
    id: 5,
    title: "Lead Management System",
    company: "Nova Digital",
    contact: "Laura Martinez",
    value: 9800,
    closeDate: "2026-07-28",
    stage: "Won",
    probability: 100,
    owner: "Juan Ligarrero",
    priority: "Medium",
  },
];

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

const normalizeDeal = (deal) => ({
  ...deal,
  probability:
    deal.probability ??
    stageProbabilities[deal.stage] ??
    10,
  owner: deal.owner || "Juan Ligarrero",
  priority: deal.priority || "Medium",
});

function Deals() {
  const navigate = useNavigate();

  const [deals, setDeals] = useState(() => {
    const savedDeals = localStorage.getItem("flowcrm-deals");

    if (savedDeals) {
      try {
        const parsedDeals = JSON.parse(savedDeals);

        if (Array.isArray(parsedDeals)) {
          return parsedDeals.map(normalizeDeal);
        }
      } catch {
        return initialDeals;
      }
    }

    return initialDeals;
  });

  const companies = useMemo(
    () => readStoredArray("flowcrm-companies"),
    []
  );

  const contacts = useMemo(
    () => readStoredArray("flowcrm-contacts"),
    []
  );

  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [editingDealId, setEditingDealId] =
    useState(null);
  const [dealForm, setDealForm] = useState({
    ...emptyDeal,
  });
  const [formError, setFormError] = useState("");
  const [openMenuId, setOpenMenuId] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerFilter, setOwnerFilter] =
    useState("All");
  const [draggedDealId, setDraggedDealId] =
    useState(null);
  const [dragOverStage, setDragOverStage] =
    useState(null);

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-deals",
      JSON.stringify(deals)
    );
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return deals.filter((deal) => {
      const matchesSearch =
        deal.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        deal.company
          .toLowerCase()
          .includes(normalizedSearch) ||
        deal.contact
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesOwner =
        ownerFilter === "All" ||
        deal.owner === ownerFilter;

      return matchesSearch && matchesOwner;
    });
  }, [deals, searchTerm, ownerFilter]);

  const pipelineValue = useMemo(
    () =>
      deals
        .filter(
          (deal) =>
            deal.stage !== "Lost" &&
            deal.stage !== "Won"
        )
        .reduce(
          (total, deal) =>
            total + Number(deal.value || 0),
          0
        ),
    [deals]
  );

  const weightedPipelineValue = useMemo(
    () =>
      deals
        .filter(
          (deal) =>
            deal.stage !== "Lost" &&
            deal.stage !== "Won"
        )
        .reduce(
          (total, deal) =>
            total +
            Number(deal.value || 0) *
              (Number(deal.probability || 0) / 100),
          0
        ),
    [deals]
  );

  const wonValue = useMemo(
    () =>
      deals
        .filter((deal) => deal.stage === "Won")
        .reduce(
          (total, deal) =>
            total + Number(deal.value || 0),
          0
        ),
    [deals]
  );

  const activeDeals = deals.filter(
    (deal) =>
      deal.stage !== "Won" &&
      deal.stage !== "Lost"
  ).length;

  const wonDeals = deals.filter(
    (deal) => deal.stage === "Won"
  ).length;

  const winRate =
    deals.length === 0
      ? 0
      : Math.round((wonDeals / deals.length) * 100);

  const availableContacts = useMemo(() => {
    if (!dealForm.company) {
      return contacts;
    }

    const matchingContacts = contacts.filter(
      (contact) =>
        contact.company?.toLowerCase() ===
        dealForm.company.toLowerCase()
    );

    return matchingContacts.length > 0
      ? matchingContacts
      : contacts;
  }, [contacts, dealForm.company]);

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
    setEditingDealId(null);
    setDealForm({ ...emptyDeal });
    setFormError("");
  };

  const openAddDealModal = (stage = "Lead") => {
    setEditingDealId(null);

    setDealForm({
      ...emptyDeal,
      stage,
      probability: String(
        stageProbabilities[stage]
      ),
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
      probability: String(deal.probability),
      owner: deal.owner,
      priority: deal.priority,
    });

    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
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

    const normalizedDeal = {
      ...dealForm,
      value: numericValue,
      probability: numericProbability,
    };

    if (editingDealId !== null) {
      setDeals((currentDeals) =>
        currentDeals.map((deal) =>
          deal.id === editingDealId
            ? {
                ...deal,
                ...normalizedDeal,
              }
            : deal
        )
      );
    } else {
      setDeals((currentDeals) => [
        ...currentDeals,
        {
          id: Date.now(),
          ...normalizedDeal,
        },
      ]);
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
      currentDeals.filter(
        (deal) => deal.id !== dealId
      )
    );

    setOpenMenuId(null);
  };

  const moveDealToStage = (dealId, stage) => {
    setDeals((currentDeals) =>
      currentDeals.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              stage,
              probability:
                stageProbabilities[stage],
            }
          : deal
      )
    );

    setOpenMenuId(null);
  };

  const moveDeal = (dealId, direction) => {
    const selectedDeal = deals.find(
      (deal) => deal.id === dealId
    );

    if (!selectedDeal) {
      return;
    }

    const currentIndex = pipelineStages.indexOf(
      selectedDeal.stage
    );

    const nextIndex = currentIndex + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= pipelineStages.length
    ) {
      return;
    }

    moveDealToStage(
      dealId,
      pipelineStages[nextIndex]
    );
  };

  const handleDragStart = (dealId) => {
    setDraggedDealId(dealId);
    setOpenMenuId(null);
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (event, stage) => {
    event.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (event, stage) => {
    event.preventDefault();

    if (draggedDealId !== null) {
      moveDealToStage(draggedDealId, stage);
    }

    handleDragEnd();
  };

  return (
    <div className="deals-page">
      <section className="deals-page__header">
        <div>
          <h1>Deals Pipeline</h1>

          <p>
            Track opportunities, expected revenue, and
            sales performance.
          </p>
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
            <span>Active pipeline</span>

            <strong>
              {formatCurrency(pipelineValue)}
            </strong>
          </div>
        </article>

        <article className="deals-stat">
          <div className="deals-stat__icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Expected revenue</span>

            <strong>
              {formatCurrency(
                weightedPipelineValue
              )}
            </strong>
          </div>
        </article>

        <article className="deals-stat">
          <div className="deals-stat__icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Won revenue</span>

            <strong>
              {formatCurrency(wonValue)}
            </strong>
          </div>
        </article>

        <article className="deals-stat">
          <div className="deals-stat__icon">
            <Target size={21} />
          </div>

          <div>
            <span>Win rate</span>
            <strong>{winRate}%</strong>
          </div>
        </article>
      </section>

      <section className="deals-page__toolbar">
        <div className="deals-page__search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search deals, companies, or contacts..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <select
          value={ownerFilter}
          onChange={(event) =>
            setOwnerFilter(event.target.value)
          }
        >
          <option value="All">All owners</option>

          {dealOwners.map((owner) => (
            <option value={owner} key={owner}>
              {owner}
            </option>
          ))}
        </select>
      </section>

      <section className="deals-page__summary">
        <span>
          <strong>{activeDeals}</strong> active deals
        </span>

        <span>
          Drag cards between stages to update the
          pipeline.
        </span>
      </section>

      <section className="deals-board">
        {pipelineStages.map((stage) => {
          const stageDeals = filteredDeals.filter(
            (deal) => deal.stage === stage
          );

          const stageValue = stageDeals.reduce(
            (total, deal) =>
              total + Number(deal.value || 0),
            0
          );

          const stageExpectedRevenue =
            stageDeals.reduce(
              (total, deal) =>
                total +
                Number(deal.value || 0) *
                  (Number(
                    deal.probability || 0
                  ) /
                    100),
              0
            );

          return (
            <article
              className={`deals-column ${
                dragOverStage === stage
                  ? "deals-column--drag-over"
                  : ""
              }`}
              key={stage}
              onDragOver={(event) =>
                handleDragOver(event, stage)
              }
              onDragLeave={() =>
                setDragOverStage(null)
              }
              onDrop={(event) =>
                handleDrop(event, stage)
              }
            >
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

                  <small>
                    Expected{" "}
                    {formatCurrency(
                      stageExpectedRevenue
                    )}
                  </small>
                </div>

                <button
                  type="button"
                  className="deals-column__add"
                  aria-label={`Add deal to ${stage}`}
                  onClick={() =>
                    openAddDealModal(stage)
                  }
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
                      onClick={() =>
                        openAddDealModal(stage)
                      }
                    >
                      Add a deal
                    </button>
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const stageIndex =
                      pipelineStages.indexOf(
                        deal.stage
                      );

                    const expectedRevenue =
                      Number(deal.value || 0) *
                      (Number(
                        deal.probability || 0
                      ) /
                        100);

                    return (
                      <article
                        className={`deal-card ${
                          draggedDealId === deal.id
                            ? "deal-card--dragging"
                            : ""
                        }`}
                        key={deal.id}
                        draggable
                        role="button"
                        tabIndex={0}
                        onDragStart={() =>
                          handleDragStart(deal.id)
                        }
                        onDragEnd={handleDragEnd}
                        onClick={() =>
                          navigate(`/deals/${deal.id}`)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            navigate(
                              `/deals/${deal.id}`
                            );
                          }
                        }}
                      >
                        <div className="deal-card__top">
                          <div className="deal-card__drag">
                            <GripVertical size={16} />

                            <span className="deal-card__value">
                              {formatCurrency(
                                deal.value
                              )}
                            </span>
                          </div>

                          <div className="deal-card__menu">
                            <button
                              type="button"
                              className="deal-card__menu-button"
                              aria-label={`Actions for ${deal.title}`}
                              onClick={(event) => {
                                event.stopPropagation();

                                setOpenMenuId(
                                  openMenuId ===
                                    deal.id
                                    ? null
                                    : deal.id
                                );
                              }}
                            >
                              <MoreHorizontal
                                size={19}
                              />
                            </button>

                            {openMenuId === deal.id && (
                              <div
                                className="deal-card__dropdown"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                              >
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openEditDealModal(
                                      deal
                                    );
                                  }}
                                >
                                  <Edit3 size={15} />
                                  Edit deal
                                </button>

                                <button
                                  type="button"
                                  className="deal-card__delete"
                                  onClick={(event) => {
                                    event.stopPropagation();

                                    handleDeleteDeal(
                                      deal.id
                                    );
                                  }}
                                >
                                  <Trash2 size={15} />
                                  Delete deal
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3>{deal.title}</h3>

                        <div className="deal-card__badges">
                          <span
                            className={`deal-card__priority deal-card__priority--${deal.priority.toLowerCase()}`}
                          >
                            {deal.priority}
                          </span>

                          <span className="deal-card__probability">
                            {deal.probability}% probability
                          </span>
                        </div>

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

                          <span>
                            {formatDate(
                              deal.closeDate
                            )}
                          </span>
                        </div>
                        <div className="deal-card__owner">
                          <span>Owner</span>
                          <strong>{deal.owner}</strong>
                        </div>

                        <div className="deal-card__expected">
                          <span>Expected revenue</span>

                          <strong>
                            {formatCurrency(
                              expectedRevenue
                            )}
                          </strong>
                        </div>

                        <div className="deal-card__move-actions">
                          <button
                            type="button"
                            disabled={stageIndex === 0}
                            onClick={(event) => {
                              event.stopPropagation();
                              moveDeal(deal.id, -1);
                            }}
                          >
                            <ChevronLeft size={16} />
                            Back
                          </button>

                          <button
                            type="button"
                            disabled={
                              stageIndex ===
                              pipelineStages.length -
                                1
                            }
                            onClick={(event) => {
                              event.stopPropagation();
                              moveDeal(deal.id, 1);
                            }}
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
          <div
            className="deal-modal__overlay"
            onClick={closeModal}
          />

          <div className="deal-modal__content">
            <div className="deal-modal__header">
              <div>
                <h2>
                  {editingDealId !== null
                    ? "Edit Deal"
                    : "Add Deal"}
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

            <form
              className="deal-modal__form"
              onSubmit={handleSaveDeal}
            >
              {formError && (
                <p className="deal-modal__error">
                  {formError}
                </p>
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

              <div className="deal-modal__form-grid">
                <label>
                  Company

                  {companies.length > 0 ? (
                    <select
                      value={dealForm.company}
                      onChange={(event) =>
                        setDealForm({
                          ...dealForm,
                          company:
                            event.target.value,
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
                      placeholder="Company name"
                      value={dealForm.company}
                      onChange={(event) =>
                        setDealForm({
                          ...dealForm,
                          company:
                            event.target.value,
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
                          contact:
                            event.target.value,
                        })
                      }
                    >
                      <option value="">
                        Select a contact
                      </option>

                      {availableContacts.map(
                        (contact) => (
                          <option
                            value={contact.name}
                            key={contact.id}
                          >
                            {contact.name}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Contact name"
                      value={dealForm.contact}
                      onChange={(event) =>
                        setDealForm({
                          ...dealForm,
                          contact:
                            event.target.value,
                        })
                      }
                    />
                  )}
                </label>
              </div>

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

              <div className="deal-modal__form-grid">
                <label>
                  Expected close date

                  <input
                    type="date"
                    value={dealForm.closeDate}
                    onChange={(event) =>
                      setDealForm({
                        ...dealForm,
                        closeDate:
                          event.target.value,
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

              <div className="deal-modal__form-grid">
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

              <div className="deal-modal__preview">
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

              <div className="deal-modal__actions">
                <button
                  type="button"
                  className="deal-modal__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="deal-modal__save"
                >
                  {editingDealId !== null
                    ? "Update Deal"
                    : "Save Deal"}
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
