import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Edit3,
  FileText,
  Globe2,
  ListChecks,
  Mail,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
} from "lucide-react";

import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/ToastProvider.jsx";

import "./DealDetails.css";

const STORAGE_KEY = "flowcrm-deals";
const LANGUAGE_KEY = "flowcrm-language";

const pipelineStages = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const stageProbabilities = {
  Lead: 10,
  Qualified: 25,
  Proposal: 50,
  Negotiation: 75,
  Won: 100,
  Lost: 0,
};

const stageLabels = {
  Lead: { en: "Lead", es: "Prospecto" },
  Qualified: { en: "Qualified", es: "Calificado" },
  Proposal: { en: "Proposal", es: "Propuesta" },
  Negotiation: { en: "Negotiation", es: "Negociación" },
  Won: { en: "Won", es: "Ganado" },
  Lost: { en: "Lost", es: "Perdido" },
};

const priorityLabels = {
  Low: { en: "Low", es: "Baja" },
  Medium: { en: "Medium", es: "Media" },
  High: { en: "High", es: "Alta" },
};

const copy = {
  en: {
    back: "Back to deals",
    moveStage: "Move stage",
    editDeal: "Edit deal",
    deleteDeal: "Delete",
    overview: "Overview",
    activity: "Activity",
    tasks: "Tasks",
    notes: "Notes",
    files: "Files",
    businessCase: "Business case",
    aiSummary: "AI business summary",
    aiSummaryHint: "A concise commercial interpretation based on the deal data.",
    refreshSummary: "Refresh summary",
    dealValue: "Deal value",
    expectedDealValue: "Expected deal value",
    projectedRoi: "Projected ROI",
    roiPeriod: "ROI period",
    payback: "Payback period",
    implementationCost: "Implementation cost",
    customerSavings: "Expected customer savings",
    annualValue: "Expected annual value",
    billingModel: "Billing model",
    revenueType: "Revenue type",
    problemTitle: "Main business problem",
    problemLabel: "Main business problem",
    solutionLabel: "Proposed solution",
    successMetric: "Key success metric",
    notProvided: "Not provided",
    customer: "Customer",
    company: "Company",
    contact: "Contact",
    owner: "Owner",
    expectedCloseDate: "Expected close date",
    decisionDeadline: "Decision deadline",
    taskProgress: "Task progress",
    completed: "completed",
    timeline: "Deal timeline",
    timelineHint: "Current stage progression and probability history.",
    current: "Current",
    probability: "Probability",
    commercialSnapshot: "Commercial snapshot",
    stage: "Stage",
    priority: "Priority",
    currency: "Currency",
    closeProbability: "Close probability",
    activityEmpty: "No activity has been recorded for this deal yet.",
    tasksEmpty: "There are no tasks linked to this deal yet.",
    notesEmpty: "No notes have been added yet.",
    filesEmpty: "No files are attached to this deal yet.",
    emails: "Emails",
    emailHint: "Communication history related to this opportunity.",
    emailEmpty: "No email activity is available yet.",
    deleteTitle: "Delete deal?",
    deleteConfirm: "Delete deal",
    deleteMessage: (title) =>
      `This will permanently delete "${title}". This action cannot be undone.`,
    deleted: "Deal deleted",
    deletedBody: (title) => `${title} was removed from the pipeline.`,
    stageUpdated: "Stage updated",
    stageUpdatedBody: (title, stage) => `${title} moved to ${stage}.`,
    notFound: "Deal not found",
    notFoundText: "This opportunity could not be found in local CRM data.",
    returnToDeals: "Return to deals",
  },
  es: {
    back: "Volver a negocios",
    moveStage: "Mover etapa",
    editDeal: "Editar negocio",
    deleteDeal: "Eliminar",
    overview: "Resumen",
    activity: "Actividad",
    tasks: "Tareas",
    notes: "Notas",
    files: "Archivos",
    businessCase: "Caso de negocio",
    aiSummary: "Resumen comercial con IA",
    aiSummaryHint: "Una interpretación comercial concisa basada en los datos del negocio.",
    refreshSummary: "Actualizar resumen",
    dealValue: "Valor del negocio",
    expectedDealValue: "Valor esperado",
    projectedRoi: "ROI proyectado",
    roiPeriod: "Periodo del ROI",
    payback: "Periodo de recuperación",
    implementationCost: "Costo de implementación",
    customerSavings: "Ahorros esperados del cliente",
    annualValue: "Valor anual esperado",
    billingModel: "Modelo de facturación",
    revenueType: "Tipo de ingreso",
    problemTitle: "Problema principal del negocio",
    problemLabel: "Problema principal del negocio",
    solutionLabel: "Solución propuesta",
    successMetric: "Indicador clave de éxito",
    notProvided: "No disponible",
    customer: "Cliente",
    company: "Empresa",
    contact: "Contacto",
    owner: "Responsable",
    expectedCloseDate: "Fecha estimada de cierre",
    decisionDeadline: "Fecha límite de decisión",
    taskProgress: "Progreso de tareas",
    completed: "completadas",
    timeline: "Cronología del negocio",
    timelineHint: "Progresión actual de etapas e historial de probabilidad.",
    current: "Actual",
    probability: "Probabilidad",
    commercialSnapshot: "Resumen comercial",
    stage: "Etapa",
    priority: "Prioridad",
    currency: "Moneda",
    closeProbability: "Probabilidad de cierre",
    activityEmpty: "Todavía no se ha registrado actividad para este negocio.",
    tasksEmpty: "Todavía no hay tareas vinculadas a este negocio.",
    notesEmpty: "Todavía no se han agregado notas.",
    filesEmpty: "Todavía no hay archivos adjuntos a este negocio.",
    emails: "Correos",
    emailHint: "Historial de comunicaciones relacionadas con esta oportunidad.",
    emailEmpty: "Todavía no hay actividad de correo disponible.",
    deleteTitle: "¿Eliminar negocio?",
    deleteConfirm: "Eliminar negocio",
    deleteMessage: (title) =>
      `Se eliminará permanentemente "${title}". Esta acción no se puede deshacer.`,
    deleted: "Negocio eliminado",
    deletedBody: (title) => `${title} fue eliminado del pipeline.`,
    stageUpdated: "Etapa actualizada",
    stageUpdatedBody: (title, stage) => `${title} se movió a ${stage}.`,
    notFound: "Negocio no encontrado",
    notFoundText: "No se encontró esta oportunidad en los datos locales del CRM.",
    returnToDeals: "Volver a negocios",
  },
};

const readStoredArray = (key) => {
  const value = localStorage.getItem(key);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const localizePeriod = (value, language) => {
  if (!value) {
    return "";
  }

  const text = String(value).trim();

  if (language === "en") {
    return text
      .replace(/\bmes\b/gi, "month")
      .replace(/\bmeses\b/gi, "months")
      .replace(/\baño\b/gi, "year")
      .replace(/\baños\b/gi, "years");
  }

  return text
    .replace(/\b1\s+months?\b/gi, "1 mes")
    .replace(/\b(\d+(?:[.,]\d+)?)\s+months?\b/gi, "$1 meses")
    .replace(/\b1\s+years?\b/gi, "1 año")
    .replace(/\b(\d+(?:[.,]\d+)?)\s+years?\b/gi, "$1 años")
    .replace(/\bmonth\b/gi, "mes")
    .replace(/\bmonths\b/gi, "meses")
    .replace(/\byear\b/gi, "año")
    .replace(/\byears\b/gi, "años");
};

function DealDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [language, setLanguage] = useState(
    () => localStorage.getItem(LANGUAGE_KEY) || "en"
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [summaryVersion, setSummaryVersion] = useState(0);

  const t = copy[language];

  const [deals, setDeals] = useState(() =>
    readStoredArray(STORAGE_KEY)
  );

  const deal = useMemo(
    () =>
      deals.find(
        (item) => String(item.id) === String(id)
      ),
    [deals, id]
  );

  const formatCurrency = (value, currency = "USD") => {
    const locale =
      language === "es"
        ? "es-CO"
        : currency === "AUD"
          ? "en-AU"
          : currency === "GBP"
            ? "en-GB"
            : currency === "CAD"
              ? "en-CA"
              : "en-US";

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    } catch {
      return `${currency} ${Number(value || 0).toLocaleString(locale)}`;
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return t.notProvided;
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      language === "es" ? "es-CO" : "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const toggleLanguage = () => {
    const nextLanguage = language === "en" ? "es" : "en";
    setLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);
  };

  if (!deal) {
    return (
      <div className="deal-details-page">
        <div className="deal-details-not-found">
          <BriefcaseBusiness size={34} />
          <h1>{t.notFound}</h1>
          <p>{t.notFoundText}</p>
          <button
            type="button"
            onClick={() => navigate("/deals")}
          >
            <ArrowLeft size={17} />
            {t.returnToDeals}
          </button>
        </div>
      </div>
    );
  }

  const currency = deal.currency || "USD";
  const expectedDealValue =
    Number(deal.value || 0) *
    (Number(deal.probability || 0) / 100);

  const tasks = Array.isArray(deal.tasks)
    ? deal.tasks
    : [];

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const taskCompletion =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / tasks.length) * 100
        );

  const stageIndex = pipelineStages.indexOf(
    deal.stage
  );

  const aiSummary = useMemo(() => {
    const problem =
      deal.businessProblem ||
      (language === "es"
        ? "un reto comercial u operativo que todavía necesita mayor definición"
        : "a commercial or operational challenge that still needs clearer definition");

    const solution =
      deal.solutionSummary ||
      (language === "es"
        ? "una solución orientada a mejorar la visibilidad, el seguimiento y la ejecución comercial"
        : "a solution focused on improving visibility, follow-up, and commercial execution");

    const roiSentence =
      deal.projectedRoi !== undefined &&
      deal.projectedRoi !== null &&
      String(deal.projectedRoi).trim() !== ""
        ? language === "es"
          ? `Se proyecta un ROI aproximado del ${deal.projectedRoi}%${
              deal.roiPeriod
                ? ` durante ${localizePeriod(
                    deal.roiPeriod,
                    "es"
                  )}`
                : ""
            }.`
          : `The projected ROI is approximately ${deal.projectedRoi}%${
              deal.roiPeriod
                ? ` over ${localizePeriod(
                    deal.roiPeriod,
                    "en"
                  )}`
                : ""
            }.`
        : "";

    const paybackSentence = deal.paybackPeriod
      ? language === "es"
        ? `El periodo estimado de recuperación es ${localizePeriod(
            deal.paybackPeriod,
            "es"
          )}.`
        : `The estimated payback period is ${localizePeriod(
            deal.paybackPeriod,
            "en"
          )}.`
      : "";

    if (language === "es") {
      return `${deal.company} está evaluando ${deal.title}, actualmente en la etapa ${stageLabels[deal.stage]?.es || deal.stage} con una probabilidad de cierre del ${deal.probability || 0}%. La oportunidad representa un valor de ${formatCurrency(
        deal.value,
        currency
      )} y un valor esperado de ${formatCurrency(
        expectedDealValue,
        currency
      )}. El problema principal identificado es ${problem}. La solución propuesta busca ${solution}. ${roiSentence} ${paybackSentence}`.trim();
    }

    return `${deal.company} is evaluating ${deal.title}, currently in the ${stageLabels[deal.stage]?.en || deal.stage} stage with a ${deal.probability || 0}% probability of closing. The opportunity represents a deal value of ${formatCurrency(
      deal.value,
      currency
    )} and an expected deal value of ${formatCurrency(
      expectedDealValue,
      currency
    )}. The primary business problem is ${problem}. The proposed solution is designed around ${solution}. ${roiSentence} ${paybackSentence}`.trim();
  }, [
    deal,
    language,
    currency,
    expectedDealValue,
    summaryVersion,
  ]);

  const handleMoveStage = (stage) => {
    const updatedDeals = deals.map((item) =>
      item.id === deal.id
        ? {
            ...item,
            stage,
            probability: stageProbabilities[stage],
          }
        : item
    );

    setDeals(updatedDeals);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedDeals)
    );

    toast.info(
      t.stageUpdated,
      t.stageUpdatedBody(
        deal.title,
        stageLabels[stage][language]
      )
    );
  };

  const confirmDelete = () => {
    const updatedDeals = deals.filter(
      (item) => item.id !== deal.id
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedDeals)
    );

    toast.success(
      t.deleted,
      t.deletedBody(deal.title)
    );

    navigate("/deals");
  };

  const renderEmptyState = (text, Icon) => (
    <div className="deal-details-empty-state">
      <Icon size={26} />
      <p>{text}</p>
    </div>
  );

  return (
    <div className="deal-details-page">
      <section className="deal-details-toolbar">
        <button
          type="button"
          className="deal-details-back"
          onClick={() => navigate("/deals")}
        >
          <ArrowLeft size={17} />
          {t.back}
        </button>

        <div className="deal-details-toolbar__actions">
          <button
            type="button"
            className="deal-details-language"
            onClick={toggleLanguage}
          >
            <Globe2 size={17} />
            <span>
              {language === "en" ? "EN" : "ES"}
            </span>
            <small>
              {language === "en"
                ? "English"
                : "Español"}
            </small>
          </button>

          <div className="deal-details-stage-select">
            <select
              value={deal.stage}
              onChange={(event) =>
                handleMoveStage(event.target.value)
              }
            >
              {pipelineStages.map((stage) => (
                <option
                  value={stage}
                  key={stage}
                >
                  {
                    stageLabels[stage][
                      language
                    ]
                  }
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>

          <button
            type="button"
            className="deal-details-action"
            onClick={() =>
              navigate(`/deals?edit=${deal.id}`)
            }
          >
            <Edit3 size={16} />
            {t.editDeal}
          </button>

          <button
            type="button"
            className="deal-details-action deal-details-action--danger"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={16} />
            {t.deleteDeal}
          </button>
        </div>
      </section>

      <section className="deal-details-hero">
        <div className="deal-details-hero__main">
          <span className="deal-details-hero__eyebrow">
            <BriefcaseBusiness size={15} />
            FlowCRM
          </span>

          <h1>{deal.title}</h1>

          <div className="deal-details-hero__meta">
            <span>
              <Building2 size={15} />
              {deal.company}
            </span>

            <span>
              <UserRound size={15} />
              {deal.contact}
            </span>

            <span>
              <CalendarDays size={15} />
              {formatDate(deal.closeDate)}
            </span>
          </div>

          <div className="deal-details-hero__badges">
            <span className="deal-details-stage-badge">
              {
                stageLabels[deal.stage][
                  language
                ]
              }
            </span>

            <span className="deal-details-probability-badge">
              {deal.probability}%{" "}
              {t.probability.toLowerCase()}
            </span>

            <span className="deal-details-priority-badge">
              {priorityLabels[
                deal.priority || "Medium"
              ]?.[language] ||
                deal.priority ||
                "Medium"}
            </span>
          </div>
        </div>

        <div className="deal-details-hero__snapshot">
          <span>{t.commercialSnapshot}</span>

          <div>
            <small>{t.stage}</small>
            <strong>
              {
                stageLabels[deal.stage][
                  language
                ]
              }
            </strong>
          </div>

          <div>
            <small>
              {t.closeProbability}
            </small>
            <strong>{deal.probability}%</strong>
          </div>

          <div>
            <small>{t.currency}</small>
            <strong>{currency}</strong>
          </div>
        </div>
      </section>

      <nav className="deal-details-tabs">
        {[
          ["overview", t.overview],
          ["activity", t.activity],
          ["tasks", `${t.tasks} (${tasks.length})`],
          ["notes", t.notes],
          ["files", t.files],
          ["emails", t.emails],
        ].map(([tabId, label]) => (
          <button
            type="button"
            key={tabId}
            className={
              activeTab === tabId
                ? "deal-details-tab deal-details-tab--active"
                : "deal-details-tab"
            }
            onClick={() =>
              setActiveTab(tabId)
            }
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <div className="deal-details-layout">
          <main className="deal-details-main">
            <section className="deal-details-card">
              <div className="deal-details-section-heading">
                <div>
                  <CircleDollarSign size={18} />
                  <span>
                    <strong>{t.businessCase}</strong>
                    <small>
                      {language === "es"
                        ? "Métricas financieras principales de la oportunidad."
                        : "Core financial metrics for the opportunity."}
                    </small>
                  </span>
                </div>
              </div>

              <div className="deal-details-metric-grid">
                <article className="deal-details-metric">
                  <span>{t.dealValue}</span>
                  <strong>
                    {formatCurrency(
                      deal.value,
                      currency
                    )}
                  </strong>
                </article>

                <article className="deal-details-metric">
                  <span>
                    {t.expectedDealValue}
                  </span>
                  <strong>
                    {formatCurrency(
                      expectedDealValue,
                      currency
                    )}
                  </strong>
                </article>

                <article className="deal-details-metric deal-details-metric--kpi">
                  <span>{t.projectedRoi}</span>
                  <strong>
                    {deal.projectedRoi !==
                      undefined &&
                    deal.projectedRoi !==
                      null &&
                    String(
                      deal.projectedRoi
                    ).trim() !== ""
                      ? `${deal.projectedRoi}%`
                      : t.notProvided}
                  </strong>
                </article>

                <article className="deal-details-metric deal-details-metric--kpi">
                  <span>{t.roiPeriod}</span>
                  <strong>
                    {deal.roiPeriod
                      ? localizePeriod(
                          deal.roiPeriod,
                          language
                        )
                      : t.notProvided}
                  </strong>
                </article>

                <article className="deal-details-metric deal-details-metric--kpi deal-details-metric--kpi-wide">
                  <span>{t.payback}</span>
                  <strong>
                    {deal.paybackPeriod
                      ? localizePeriod(
                          deal.paybackPeriod,
                          language
                        )
                      : t.notProvided}
                  </strong>
                </article>

                <article className="deal-details-metric">
                  <span>
                    {t.implementationCost}
                  </span>
                  <strong>
                    {deal.implementationCost !==
                      undefined &&
                    deal.implementationCost !==
                      null &&
                    String(
                      deal.implementationCost
                    ).trim() !== ""
                      ? formatCurrency(
                          deal.implementationCost,
                          currency
                        )
                      : t.notProvided}
                  </strong>
                </article>

                <article className="deal-details-metric">
                  <span>
                    {t.customerSavings}
                  </span>
                  <strong>
                    {deal.expectedCustomerSavings !==
                      undefined &&
                    deal.expectedCustomerSavings !==
                      null &&
                    String(
                      deal.expectedCustomerSavings
                    ).trim() !== ""
                      ? formatCurrency(
                          deal.expectedCustomerSavings,
                          currency
                        )
                      : t.notProvided}
                  </strong>
                </article>

                <article className="deal-details-metric">
                  <span>{t.annualValue}</span>
                  <strong>
                    {deal.expectedAnnualValue !==
                      undefined &&
                    deal.expectedAnnualValue !==
                      null &&
                    String(
                      deal.expectedAnnualValue
                    ).trim() !== ""
                      ? formatCurrency(
                          deal.expectedAnnualValue,
                          currency
                        )
                      : t.notProvided}
                  </strong>
                </article>

                <article className="deal-details-metric">
                  <span>{t.billingModel}</span>
                  <strong>
                    {deal.billingModel ||
                      t.notProvided}
                  </strong>
                </article>

                <article className="deal-details-metric">
                  <span>{t.revenueType}</span>
                  <strong>
                    {deal.revenueType ||
                      t.notProvided}
                  </strong>
                </article>
              </div>
            </section>

            <section className="deal-details-card">
              <div className="deal-details-section-heading">
                <div>
                  <Target size={18} />
                  <span>
                    <strong>
                      {t.problemTitle}
                    </strong>
                    <small>
                      {language === "es"
                        ? "Contexto comercial, solución propuesta y criterio de éxito."
                        : "Commercial context, proposed solution, and success criteria."}
                    </small>
                  </span>
                </div>
              </div>

              <div className="deal-details-business-grid">
                <article>
                  <span>{t.problemLabel}</span>
                  <p>
                    {deal.businessProblem ||
                      t.notProvided}
                  </p>
                </article>

                <article>
                  <span>{t.solutionLabel}</span>
                  <p>
                    {deal.solutionSummary ||
                      t.notProvided}
                  </p>
                </article>

                <article>
                  <span>{t.successMetric}</span>
                  <p>
                    {deal.successMetric ||
                      t.notProvided}
                  </p>
                </article>
              </div>
            </section>

            <section className="deal-details-card">
              <div className="deal-details-section-heading">
                <div>
                  <TrendingUp size={18} />
                  <span>
                    <strong>{t.timeline}</strong>
                    <small>{t.timelineHint}</small>
                  </span>
                </div>
              </div>

              <div className="deal-details-timeline">
                {pipelineStages.map(
                  (stage, index) => {
                    const isCurrent =
                      stage === deal.stage;
                    const isCompleted =
                      stageIndex >= 0 &&
                      index < stageIndex &&
                      deal.stage !== "Lost";

                    return (
                      <div
                        className={`deal-details-timeline__item ${
                          isCurrent
                            ? "deal-details-timeline__item--current"
                            : ""
                        } ${
                          isCompleted
                            ? "deal-details-timeline__item--completed"
                            : ""
                        }`}
                        key={stage}
                      >
                        <div className="deal-details-timeline__marker">
                          {isCompleted ? (
                            <CheckCircle2
                              size={15}
                            />
                          ) : (
                            <span />
                          )}
                        </div>

                        <div>
                          <div className="deal-details-timeline__title">
                            <strong>
                              {
                                stageLabels[
                                  stage
                                ][language]
                              }
                            </strong>

                            {isCurrent && (
                              <span>
                                {t.current}
                              </span>
                            )}
                          </div>

                          <small>
                            {
                              stageProbabilities[
                                stage
                              ]
                            }
                            % {t.probability}
                          </small>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          </main>

          <aside className="deal-details-sidebar">
            <section className="deal-details-card deal-details-ai-card">
              <div className="deal-details-section-heading">
                <div>
                  <Sparkles size={18} />
                  <span>
                    <strong>{t.aiSummary}</strong>
                    <small>{t.aiSummaryHint}</small>
                  </span>
                </div>
              </div>

              <p>{aiSummary}</p>

              <button
                type="button"
                onClick={() =>
                  setSummaryVersion(
                    (current) =>
                      current + 1
                  )
                }
              >
                <RefreshCw size={15} />
                {t.refreshSummary}
              </button>
            </section>

            <section className="deal-details-card">
              <div className="deal-details-section-heading">
                <div>
                  <UserRound size={18} />
                  <span>
                    <strong>{t.customer}</strong>
                    <small>
                      {language === "es"
                        ? "Personas y fechas clave de la oportunidad."
                        : "Key people and dates for the opportunity."}
                    </small>
                  </span>
                </div>
              </div>

              <div className="deal-details-info-list">
                <div>
                  <Building2 size={15} />
                  <span>{t.company}</span>
                  <strong>{deal.company}</strong>
                </div>

                <div>
                  <UserRound size={15} />
                  <span>{t.contact}</span>
                  <strong>{deal.contact}</strong>
                </div>

                <div>
                  <BriefcaseBusiness size={15} />
                  <span>{t.owner}</span>
                  <strong>
                    {deal.owner ||
                      t.notProvided}
                  </strong>
                </div>

                <div>
                  <CalendarDays size={15} />
                  <span>
                    {t.expectedCloseDate}
                  </span>
                  <strong>
                    {formatDate(
                      deal.closeDate
                    )}
                  </strong>
                </div>

                <div>
                  <Clock3 size={15} />
                  <span>
                    {t.decisionDeadline}
                  </span>
                  <strong>
                    {formatDate(
                      deal.decisionDeadline
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="deal-details-card">
              <div className="deal-details-section-heading">
                <div>
                  <ListChecks size={18} />
                  <span>
                    <strong>
                      {t.taskProgress}
                    </strong>
                    <small>
                      {completedTasks}/
                      {tasks.length}{" "}
                      {t.completed}
                    </small>
                  </span>
                </div>
              </div>

              <div className="deal-details-progress">
                <div>
                  <span
                    style={{
                      width: `${taskCompletion}%`,
                    }}
                  />
                </div>
                <strong>
                  {taskCompletion}%
                </strong>
              </div>
            </section>
          </aside>
        </div>
      )}

      {activeTab === "activity" &&
        renderEmptyState(
          t.activityEmpty,
          BarChart3
        )}

      {activeTab === "tasks" &&
        renderEmptyState(
          t.tasksEmpty,
          ListChecks
        )}

      {activeTab === "notes" &&
        renderEmptyState(
          t.notesEmpty,
          MessageSquareText
        )}

      {activeTab === "files" &&
        renderEmptyState(
          t.filesEmpty,
          FileText
        )}

      {activeTab === "emails" && (
        <div className="deal-details-card deal-details-tab-panel">
          <div className="deal-details-section-heading">
            <div>
              <Mail size={18} />
              <span>
                <strong>{t.emails}</strong>
                <small>{t.emailHint}</small>
              </span>
            </div>
          </div>

          {renderEmptyState(
            t.emailEmpty,
            Mail
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        title={t.deleteTitle}
        message={t.deleteMessage(deal.title)}
        confirmLabel={t.deleteConfirm}
        variant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default DealDetails;
