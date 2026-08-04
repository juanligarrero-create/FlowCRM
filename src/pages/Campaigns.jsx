import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Mail,
  MessageCircle,
  MoreHorizontal,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Smartphone,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import "./Campaigns.css";

const campaignChannels = [
  "Email",
  "WhatsApp",
  "SMS",
];

const campaignStatuses = [
  "Draft",
  "Scheduled",
  "Active",
  "Paused",
  "Completed",
];

const emptyCampaign = {
  name: "",
  description: "",
  channel: "Email",
  status: "Draft",
  audience: "",
  budget: "",
  scheduledDate: "",
  subject: "",
  message: "",
};

const initialCampaigns = [
  {
    id: 1,
    name: "August CRM Promotion",
    description:
      "Promote the CRM automation package to qualified leads.",
    channel: "Email",
    status: "Active",
    audience: 850,
    budget: 1200,
    scheduledDate: "2026-08-01",
    subject: "Automate your sales workflow",
    message:
      "Discover how FlowCRM can simplify your sales process.",
    sent: 640,
    opened: 372,
    clicked: 118,
    converted: 26,
  },
  {
    id: 2,
    name: "WhatsApp Lead Follow-up",
    description:
      "Follow up with prospects who requested more information.",
    channel: "WhatsApp",
    status: "Scheduled",
    audience: 240,
    budget: 450,
    scheduledDate: "2026-08-05",
    subject: "",
    message:
      "Hi! We wanted to follow up regarding your CRM inquiry.",
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
  },
  {
    id: 3,
    name: "Customer Reactivation",
    description:
      "Reconnect with inactive customers using a special offer.",
    channel: "SMS",
    status: "Paused",
    audience: 410,
    budget: 700,
    scheduledDate: "2026-08-03",
    subject: "",
    message:
      "We have a special CRM upgrade offer available this month.",
    sent: 205,
    opened: 176,
    clicked: 44,
    converted: 9,
  },
  {
    id: 4,
    name: "July Product Newsletter",
    description:
      "Monthly product update sent to active customers.",
    channel: "Email",
    status: "Completed",
    audience: 1100,
    budget: 900,
    scheduledDate: "2026-07-15",
    subject: "What is new in FlowCRM",
    message:
      "Explore the newest CRM features and workflow improvements.",
    sent: 1086,
    opened: 711,
    clicked: 233,
    converted: 48,
  },
];

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

const calculateRate = (value, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
};

function Campaigns() {
  const toast = useToast();

  const [campaigns, setCampaigns] = useState(() => {
    const savedCampaigns = localStorage.getItem(
      "flowcrm-campaigns"
    );

    if (savedCampaigns) {
      try {
        const parsedCampaigns =
          JSON.parse(savedCampaigns);

        return Array.isArray(parsedCampaigns)
          ? parsedCampaigns
          : initialCampaigns;
      } catch {
        return initialCampaigns;
      }
    }

    return initialCampaigns;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [channelFilter, setChannelFilter] =
    useState("All");
  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [editingCampaignId, setEditingCampaignId] =
    useState(null);
  const [campaignForm, setCampaignForm] = useState({
    ...emptyCampaign,
  });
  const [formError, setFormError] = useState("");
  const [openMenuId, setOpenMenuId] =
    useState(null);
  const [campaignToDelete, setCampaignToDelete] =
    useState(null);

  useEffect(() => {
    localStorage.setItem(
      "flowcrm-campaigns",
      JSON.stringify(campaigns)
    );
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return campaigns.filter((campaign) => {
      const searchableText = [
        campaign.name,
        campaign.description,
        campaign.channel,
        campaign.status,
        campaign.subject,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        campaign.status === statusFilter;

      const matchesChannel =
        channelFilter === "All" ||
        campaign.channel === channelFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesChannel
      );
    });
  }, [
    campaigns,
    searchTerm,
    statusFilter,
    channelFilter,
  ]);

  const totalAudience = campaigns.reduce(
    (total, campaign) =>
      total + Number(campaign.audience || 0),
    0
  );

  const totalSent = campaigns.reduce(
    (total, campaign) =>
      total + Number(campaign.sent || 0),
    0
  );

  const totalConverted = campaigns.reduce(
    (total, campaign) =>
      total + Number(campaign.converted || 0),
    0
  );

  const totalBudget = campaigns.reduce(
    (total, campaign) =>
      total + Number(campaign.budget || 0),
    0
  );

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "Active"
  ).length;

  const conversionRate =
    totalSent === 0
      ? 0
      : Math.round(
          (totalConverted / totalSent) * 100
        );

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaignId(null);
    setCampaignForm({ ...emptyCampaign });
    setFormError("");
  };

  const openAddCampaignModal = () => {
    setEditingCampaignId(null);
    setCampaignForm({ ...emptyCampaign });
    setFormError("");
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const openEditCampaignModal = (campaign) => {
    setEditingCampaignId(campaign.id);

    setCampaignForm({
      name: campaign.name || "",
      description: campaign.description || "",
      channel: campaign.channel || "Email",
      status: campaign.status || "Draft",
      audience: String(campaign.audience || ""),
      budget: String(campaign.budget || ""),
      scheduledDate:
        campaign.scheduledDate || "",
      subject: campaign.subject || "",
      message: campaign.message || "",
    });

    setFormError("");
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleSaveCampaign = (event) => {
    event.preventDefault();

    if (
      !campaignForm.name.trim() ||
      !campaignForm.description.trim() ||
      !campaignForm.audience ||
      !campaignForm.budget ||
      !campaignForm.scheduledDate ||
      !campaignForm.message.trim()
    ) {
      setFormError(
        "Please complete all required campaign fields."
      );
      return;
    }

    if (
      campaignForm.channel === "Email" &&
      !campaignForm.subject.trim()
    ) {
      setFormError(
        "Email campaigns require a subject."
      );
      return;
    }

    const numericAudience = Number(
      campaignForm.audience
    );

    const numericBudget = Number(
      campaignForm.budget
    );

    if (
      Number.isNaN(numericAudience) ||
      numericAudience <= 0
    ) {
      setFormError(
        "Audience size must be greater than zero."
      );
      return;
    }

    if (
      Number.isNaN(numericBudget) ||
      numericBudget < 0
    ) {
      setFormError(
        "Budget cannot be negative."
      );
      return;
    }

    const normalizedCampaign = {
      ...campaignForm,
      audience: numericAudience,
      budget: numericBudget,
    };

    if (editingCampaignId !== null) {
      setCampaigns((currentCampaigns) =>
        currentCampaigns.map((campaign) =>
          campaign.id === editingCampaignId
            ? {
                ...campaign,
                ...normalizedCampaign,
              }
            : campaign
        )
      );

      toast.success(
        "Campaign updated",
        `${campaignForm.name} was updated successfully.`
      );
    } else {
      const newCampaign = {
        id: Date.now(),
        ...normalizedCampaign,
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
      };

      setCampaigns((currentCampaigns) => [
        newCampaign,
        ...currentCampaigns,
      ]);

      toast.success(
        "Campaign created",
        `${campaignForm.name} was added successfully.`
      );
    }

    closeModal();
  };

  const handleStatusChange = (
    campaignId,
    status
  ) => {
    const selectedCampaign = campaigns.find(
      (campaign) => campaign.id === campaignId
    );

    setCampaigns((currentCampaigns) =>
      currentCampaigns.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              status,
            }
          : campaign
      )
    );

    setOpenMenuId(null);

    toast.info(
      "Campaign status updated",
      `${selectedCampaign?.name || "Campaign"} is now ${status.toLowerCase()}.`
    );
  };

  const requestDeleteCampaign = (campaign) => {
    setCampaignToDelete(campaign);
    setOpenMenuId(null);
  };

  const confirmDeleteCampaign = () => {
    if (!campaignToDelete) {
      return;
    }

    setCampaigns((currentCampaigns) =>
      currentCampaigns.filter(
        (campaign) =>
          campaign.id !== campaignToDelete.id
      )
    );

    toast.success(
      "Campaign deleted",
      `${campaignToDelete.name} was removed.`
    );

    setCampaignToDelete(null);
  };

  const getChannelIcon = (channel) => {
    if (channel === "WhatsApp") {
      return <MessageCircle size={18} />;
    }

    if (channel === "SMS") {
      return <Smartphone size={18} />;
    }

    return <Mail size={18} />;
  };
  return (
    <div className="campaigns-page">
      <section className="campaigns-page__header">
        <div>
          <h1>Campaigns</h1>

          <p>
            Create, schedule, and measure multichannel
            marketing campaigns.
          </p>
        </div>

        <button
          type="button"
          className="campaigns-page__add-button"
          onClick={openAddCampaignModal}
        >
          <Plus size={18} />
          Create Campaign
        </button>
      </section>

      <section className="campaigns-page__stats">
        <article>
          <div>
            <Send size={21} />
          </div>

          <span>
            <small>Total sent</small>
            <strong>{totalSent}</strong>
          </span>
        </article>

        <article>
          <div>
            <Users size={21} />
          </div>

          <span>
            <small>Total audience</small>
            <strong>{totalAudience}</strong>
          </span>
        </article>

        <article>
          <div>
            <Target size={21} />
          </div>

          <span>
            <small>Conversion rate</small>
            <strong>{conversionRate}%</strong>
          </span>
        </article>

        <article>
          <div>
            <BarChart3 size={21} />
          </div>

          <span>
            <small>Campaign budget</small>
            <strong>
              {formatCurrency(totalBudget)}
            </strong>
          </span>
        </article>
      </section>

      <section className="campaigns-page__toolbar">
        <div className="campaigns-page__search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">All statuses</option>

          {campaignStatuses.map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={channelFilter}
          onChange={(event) =>
            setChannelFilter(event.target.value)
          }
        >
          <option value="All">All channels</option>

          {campaignChannels.map((channel) => (
            <option value={channel} key={channel}>
              {channel}
            </option>
          ))}
        </select>
      </section>

      <section className="campaigns-page__summary">
        <span>
          <strong>{filteredCampaigns.length}</strong>{" "}
          campaigns shown
        </span>

        <span>
          <strong>{activeCampaigns}</strong> active
          campaigns
        </span>
      </section>

      {filteredCampaigns.length === 0 ? (
        <section className="campaigns-page__empty">
          <Mail size={36} />

          <h2>No campaigns found</h2>

          <p>
            Create a campaign or adjust your filters.
          </p>

          <button
            type="button"
            onClick={openAddCampaignModal}
          >
            <Plus size={17} />
            Create campaign
          </button>
        </section>
      ) : (
        <section className="campaigns-grid">
          {filteredCampaigns.map((campaign) => {
            const openRate = calculateRate(
              campaign.opened,
              campaign.sent
            );

            const clickRate = calculateRate(
              campaign.clicked,
              campaign.sent
            );

            const campaignConversionRate =
              calculateRate(
                campaign.converted,
                campaign.sent
              );

            return (
              <article
                className="campaign-card"
                key={campaign.id}
              >
                <div className="campaign-card__top">
                  <div
                    className={`campaign-card__channel campaign-card__channel--${campaign.channel.toLowerCase()}`}
                  >
                    {getChannelIcon(campaign.channel)}
                  </div>

                  <div className="campaign-card__menu">
                    <button
                      type="button"
                      aria-label={`Actions for ${campaign.name}`}
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === campaign.id
                            ? null
                            : campaign.id
                        )
                      }
                    >
                      <MoreHorizontal size={19} />
                    </button>

                    {openMenuId === campaign.id && (
                      <div className="campaign-card__dropdown">
                        <button
                          type="button"
                          onClick={() =>
                            openEditCampaignModal(
                              campaign
                            )
                          }
                        >
                          <Edit3 size={15} />
                          Edit campaign
                        </button>

                        {campaign.status !== "Active" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                campaign.id,
                                "Active"
                              )
                            }
                          >
                            <Play size={15} />
                            Start campaign
                          </button>
                        )}

                        {campaign.status === "Active" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                campaign.id,
                                "Paused"
                              )
                            }
                          >
                            <Pause size={15} />
                            Pause campaign
                          </button>
                        )}

                        {campaign.status !==
                          "Completed" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                campaign.id,
                                "Completed"
                              )
                            }
                          >
                            <CheckCircle2 size={15} />
                            Mark completed
                          </button>
                        )}

                        <button
                          type="button"
                          className="campaign-card__delete"
                          onClick={() =>
                            requestDeleteCampaign(
                              campaign
                            )
                          }
                        >
                          <Trash2 size={15} />
                          Delete campaign
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="campaign-card__heading">
                  <div>
                    <span
                      className={`campaign-card__status campaign-card__status--${campaign.status.toLowerCase()}`}
                    >
                      {campaign.status}
                    </span>

                    <span className="campaign-card__channel-label">
                      {campaign.channel}
                    </span>
                  </div>

                  <h2>{campaign.name}</h2>

                  <p>{campaign.description}</p>
                </div>

                <div className="campaign-card__details">
                  <div>
                    <CalendarDays size={15} />

                    <span>
                      <small>Scheduled</small>
                      <strong>
                        {formatDate(
                          campaign.scheduledDate
                        )}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <Users size={15} />

                    <span>
                      <small>Audience</small>
                      <strong>
                        {campaign.audience}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <BarChart3 size={15} />

                    <span>
                      <small>Budget</small>
                      <strong>
                        {formatCurrency(
                          campaign.budget
                        )}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="campaign-card__metrics">
                  <div>
                    <Eye size={16} />
                    <span>
                      <small>Open rate</small>
                      <strong>{openRate}%</strong>
                    </span>
                  </div>

                  <div>
                    <MousePointerClick size={16} />
                    <span>
                      <small>Click rate</small>
                      <strong>{clickRate}%</strong>
                    </span>
                  </div>

                  <div>
                    <Target size={16} />
                    <span>
                      <small>Conversion</small>
                      <strong>
                        {campaignConversionRate}%
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="campaign-card__progress">
                  <div>
                    <span>Delivery progress</span>

                    <strong>
                      {campaign.audience === 0
                        ? 0
                        : Math.min(
                            100,
                            Math.round(
                              (campaign.sent /
                                campaign.audience) *
                                100
                            )
                          )}
                      %
                    </strong>
                  </div>

                  <div className="campaign-card__progress-track">
                    <span
                      style={{
                        width: `${
                          campaign.audience === 0
                            ? 0
                            : Math.min(
                                100,
                                Math.round(
                                  (campaign.sent /
                                    campaign.audience) *
                                    100
                                )
                              )
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {isModalOpen && (
        <div className="campaign-modal">
          <div
            className="campaign-modal__overlay"
            onClick={closeModal}
          />

          <section className="campaign-modal__content">
            <header className="campaign-modal__header">
              <div>
                <h2>
                  {editingCampaignId !== null
                    ? "Edit Campaign"
                    : "Create Campaign"}
                </h2>

                <p>
                  Configure the campaign audience,
                  channel, schedule, and message.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close campaign modal"
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </header>

            <form
              className="campaign-modal__form"
              onSubmit={handleSaveCampaign}
            >
              {formError && (
                <p className="campaign-modal__error">
                  {formError}
                </p>
              )}

              <label>
                Campaign name
                <input
                  type="text"
                  placeholder="e.g. August CRM Promotion"
                  value={campaignForm.name}
                  onChange={(event) =>
                    setCampaignForm({
                      ...campaignForm,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  rows="3"
                  placeholder="Describe the campaign objective..."
                  value={campaignForm.description}
                  onChange={(event) =>
                    setCampaignForm({
                      ...campaignForm,
                      description:
                        event.target.value,
                    })
                  }
                />
              </label>

              <div className="campaign-modal__form-grid">
                <label>
                  Channel
                  <select
                    value={campaignForm.channel}
                    onChange={(event) =>
                      setCampaignForm({
                        ...campaignForm,
                        channel: event.target.value,
                        subject:
                          event.target.value ===
                          "Email"
                            ? campaignForm.subject
                            : "",
                      })
                    }
                  >
                    {campaignChannels.map(
                      (channel) => (
                        <option
                          value={channel}
                          key={channel}
                        >
                          {channel}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Status
                  <select
                    value={campaignForm.status}
                    onChange={(event) =>
                      setCampaignForm({
                        ...campaignForm,
                        status: event.target.value,
                      })
                    }
                  >
                    {campaignStatuses.map(
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
              </div>

              <div className="campaign-modal__form-grid">
                <label>
                  Audience size
                  <input
                    type="number"
                    min="1"
                    value={campaignForm.audience}
                    onChange={(event) =>
                      setCampaignForm({
                        ...campaignForm,
                        audience: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Budget
                  <input
                    type="number"
                    min="0"
                    value={campaignForm.budget}
                    onChange={(event) =>
                      setCampaignForm({
                        ...campaignForm,
                        budget: event.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Scheduled date
                <input
                  type="date"
                  value={campaignForm.scheduledDate}
                  onChange={(event) =>
                    setCampaignForm({
                      ...campaignForm,
                      scheduledDate:
                        event.target.value,
                    })
                  }
                />
              </label>

              {campaignForm.channel === "Email" && (
                <label>
                  Email subject
                  <input
                    type="text"
                    placeholder="Campaign email subject"
                    value={campaignForm.subject}
                    onChange={(event) =>
                      setCampaignForm({
                        ...campaignForm,
                        subject: event.target.value,
                      })
                    }
                  />
                </label>
              )}

              <label>
                Campaign message
                <textarea
                  rows="5"
                  placeholder="Write the campaign message..."
                  value={campaignForm.message}
                  onChange={(event) =>
                    setCampaignForm({
                      ...campaignForm,
                      message: event.target.value,
                    })
                  }
                />
              </label>

              <div className="campaign-modal__actions">
                <button
                  type="button"
                  className="campaign-modal__cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="campaign-modal__save"
                >
                  {editingCampaignId !== null
                    ? "Update Campaign"
                    : "Create Campaign"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ConfirmDialog
        isOpen={campaignToDelete !== null}
        title="Delete campaign?"
        message={
          campaignToDelete
            ? `This will permanently delete "${campaignToDelete.name}". This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete campaign"
        variant="danger"
        onCancel={() => setCampaignToDelete(null)}
        onConfirm={confirmDeleteCampaign}
      />
    </div>
  );
}

export default Campaigns;