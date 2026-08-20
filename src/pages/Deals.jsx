import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { fireAutomationTrigger } from "../utils/automationEngine.js";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Globe2,
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

const dealOwners = ["Juan Ligarrero", "Maria Torres", "Daniel Rivera"];
const dealPriorities = ["Low", "Medium", "High"];
const currencies = ["USD", "COP", "EUR", "GBP", "AUD", "CAD"];

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
  currency: "USD",
  projectedRoi: "",
  roiPeriod: "",
  implementationCost: "",
  expectedCustomerSavings: "",
  savingsPeriod: "",
  paybackPeriod: "",
  expectedAnnualValue: "",
  businessProblem: "",
  solutionSummary: "",
  successMetric: "",
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
    currency: "USD",
    projectedRoi: 10,
    roiPeriod: "12 months",
    paybackPeriod: "10 years",
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
    currency: "USD",
    projectedRoi: 25,
    roiPeriod: "12 months",
    paybackPeriod: "24 months",
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
    value: 15000,
    currency: "USD",
    projectedRoi: 25,
    roiPeriod: "12 months",
    expectedCustomerSavings: 17000,
    savingsPeriod: "1 year",
    paybackPeriod: "24 months",
    closeDate: "2026-09-01",
    stage: "Proposal",
    probability: 10,
    owner: "Juan Ligarrero",
    priority: "Medium",
  },
  {
    id: 4,
    title: "Enterprise CRM Setup",
    company: "Apex Systems",
    contact: "Michael Chen",
    value: 24000,
    currency: "USD",
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
    currency: "USD",
    closeDate: "2026-07-28",
    stage: "Won",
    probability: 100,
    owner: "Juan Ligarrero",
    priority: "Medium",
  },
];

const copy = {
  en: {
    title: "Deals Pipeline",
    subtitle: "Track opportunities, expected deal value, ROI, and sales performance.",
    addDeal: "Add deal",
    activePipeline: "Active pipeline",
    expectedValue: "Expected deal value",
    wonRevenue: "Won revenue",
    winRate: "Win rate",
    search: "Search deals, companies, or contacts...",
    allOwners: "All owners",
    activeDeals: "active deals",
    dragHint: "Drag cards between stages to update the pipeline.",
    expected: "Expected",
    noDeals: "No deals here",
    addADeal: "Add a deal",
    probability: "probability",
    owner: "Owner",
    expectedDealValue: "Expected deal value",
    projectedRoi: "Projected ROI",
    roiPeriod: "ROI period",
    payback: "Payback",
    back: "Back",
    next: "Next",
    editDeal: "Edit deal",
    deleteDeal: "Delete deal",
    editTitle: "Edit Deal",
    addTitle: "Add Deal",
    editSubtitle: "Update the opportunity information.",
    addSubtitle: "Create a new opportunity in your sales pipeline.",
    dealTitle: "Deal title",
    company: "Company",
    contact: "Contact",
    dealValue: "Deal value",
    currency: "Currency",
    projectedRoiField: "Projected ROI (%)",
    roiPeriodField: "ROI period",
    implementationCost: "Implementation cost",
    expectedSavings: "Expected customer savings",
    savingsPeriod: "Savings period",
    paybackPeriod: "Payback period",
    annualValue: "Expected annual value",
    businessProblem: "Business problem",
    solutionSummary: "Solution summary",
    successMetric: "Success metric",
    closeDate: "Expected close date",
    stage: "Pipeline stage",
    probabilityField: "Probability",
    ownerField: "Deal owner",
    priority: "Priority",
    cancel: "Cancel",
    updateDeal: "Update Deal",
    saveDeal: "Save Deal",
    selectCompany: "Select a company",
    selectContact: "Select a contact",
    deleteTitle: "Delete deal?",
    deleteConfirm: "Delete deal",
    deleteMessage: (title) => `This will permanently delete "${title}". This action cannot be undone.`,
    completeFields: "Please complete all required deal fields.",
    valuePositive: "Deal value must be greater than zero.",
    probabilityRange: "Probability must be between 0 and 100.",
    roiRange: "Projected ROI must be between 0 and 1000 percent.",
    roiPeriodRequired: "Please add the expected ROI period.",
    created: "Deal created",
    updated: "Deal updated",
    deleted: "Deal deleted",
    createdBody: (title) => `${title} was added to the pipeline.`,
    updatedBody: (title) => `${title} was updated successfully.`,
    deletedBody: (title) => `${title} was removed from the pipeline.`,
    moved: "Deal stage updated",
    movedBody: (title, stage) => `${title} moved to ${stage}.`,
    noCloseDate: "No close date",
    optional: "Optional",
  },
  es: {
    title: "Pipeline de negocios",
    subtitle: "Gestiona oportunidades, valor esperado, ROI y rendimiento comercial.",
    addDeal: "Agregar negocio",
    activePipeline: "Pipeline activo",
    expectedValue: "Valor esperado",
    wonRevenue: "Ingresos ganados",
    winRate: "Tasa de cierre",
    search: "Buscar negocios, empresas o contactos...",
    allOwners: "Todos los responsables",
    activeDeals: "negocios activos",
    dragHint: "Arrastra las tarjetas entre etapas para actualizar el pipeline.",
    expected: "Esperado",
    noDeals: "No hay negocios aquí",
    addADeal: "Agregar negocio",
    probability: "de probabilidad",
    owner: "Responsable",
    expectedDealValue: "Valor esperado del negocio",
    projectedRoi: "ROI proyectado",
    roiPeriod: "Periodo del ROI",
    payback: "Recuperación",
    back: "Atrás",
    next: "Siguiente",
    editDeal: "Editar negocio",
    deleteDeal: "Eliminar negocio",
    editTitle: "Editar negocio",
    addTitle: "Agregar negocio",
    editSubtitle: "Actualiza la información de la oportunidad.",
    addSubtitle: "Crea una nueva oportunidad en tu pipeline comercial.",
    dealTitle: "Nombre del negocio",
    company: "Empresa",
    contact: "Contacto",
    dealValue: "Valor del negocio",
    currency: "Moneda",
    projectedRoiField: "ROI proyectado (%)",
    roiPeriodField: "Periodo del ROI",
    implementationCost: "Costo de implementación",
    expectedSavings: "Ahorros esperados del cliente",
    savingsPeriod: "Periodo de ahorro",
    paybackPeriod: "Periodo de recuperación",
    annualValue: "Valor anual esperado",
    businessProblem: "Problema de negocio",
    solutionSummary: "Resumen de la solución",
    successMetric: "Indicador de éxito",
    closeDate: "Fecha estimada de cierre",
    stage: "Etapa del pipeline",
    probabilityField: "Probabilidad",
    ownerField: "Responsable del negocio",
    priority: "Prioridad",
    cancel: "Cancelar",
    updateDeal: "Actualizar negocio",
    saveDeal: "Guardar negocio",
    selectCompany: "Seleccionar empresa",
    selectContact: "Seleccionar contacto",
    deleteTitle: "¿Eliminar negocio?",
    deleteConfirm: "Eliminar negocio",
    deleteMessage: (title) => `Se eliminará permanentemente "${title}". Esta acción no se puede deshacer.`,
    completeFields: "Completa todos los campos obligatorios del negocio.",
    valuePositive: "El valor del negocio debe ser mayor que cero.",
    probabilityRange: "La probabilidad debe estar entre 0 y 100.",
    roiRange: "El ROI proyectado debe estar entre 0 y 1000 por ciento.",
    roiPeriodRequired: "Agrega el periodo esperado del ROI.",
    created: "Negocio creado",
    updated: "Negocio actualizado",
    deleted: "Negocio eliminado",
    createdBody: (title) => `${title} fue agregado al pipeline.`,
    updatedBody: (title) => `${title} fue actualizado correctamente.`,
    deletedBody: (title) => `${title} fue eliminado del pipeline.`,
    moved: "Etapa actualizada",
    movedBody: (title, stage) => `${title} se movió a ${stage}.`,
    noCloseDate: "Sin fecha de cierre",
    optional: "Opcional",
  },
};

const readStoredArray = (key) => {
  const savedData = localStorage.getItem(key);
  if (!savedData) return [];
  try {
    const parsedData = JSON.parse(savedData);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch {
    return [];
  }
};

const normalizeDeal = (deal) => ({
  ...deal,
  currency: deal.currency || "USD",
  projectedRoi: deal.projectedRoi ?? "",
  roiPeriod: deal.roiPeriod || "",
  implementationCost: deal.implementationCost ?? "",
  expectedCustomerSavings: deal.expectedCustomerSavings ?? "",
  savingsPeriod: deal.savingsPeriod || "",
  paybackPeriod: deal.paybackPeriod || "",
  expectedAnnualValue: deal.expectedAnnualValue ?? "",
  businessProblem: deal.businessProblem || "",
  solutionSummary: deal.solutionSummary || "",
  successMetric: deal.successMetric || "",
  probability: deal.probability ?? stageProbabilities[deal.stage] ?? 10,
  owner: deal.owner || "Juan Ligarrero",
  priority: deal.priority || "Medium",
});

const localizePeriod = (value, language) => {
  if (!value) return "";
  const text = String(value).trim();
  if (language === "en") {
    return text
      .replace(/\b1\s+mes\b/gi, "1 month")
      .replace(/\b(\d+(?:[.,]\d+)?)\s+meses\b/gi, "$1 months")
      .replace(/\b1\s+año\b/gi, "1 year")
      .replace(/\b(\d+(?:[.,]\d+)?)\s+años\b/gi, "$1 years");
  }
  return text
    .replace(/\b1\s+months?\b/gi, "1 mes")
    .replace(/\b(\d+(?:[.,]\d+)?)\s+months?\b/gi, "$1 meses")
    .replace(/\b1\s+years?\b/gi, "1 año")
    .replace(/\b(\d+(?:[.,]\d+)?)\s+years?\b/gi, "$1 años");
};

function Deals() {
  const navigate = useNavigate();
  const toast = useToast();

  const [language, setLanguage] = useState(
    () => localStorage.getItem(LANGUAGE_KEY) || "en"
  );
  const t = copy[language];

  const [deals, setDeals] = useState(() => {
    const savedDeals = localStorage.getItem(STORAGE_KEY);
    if (savedDeals) {
      try {
        const parsedDeals = JSON.parse(savedDeals);
        if (Array.isArray(parsedDeals)) return parsedDeals.map(normalizeDeal);
      } catch {
        return initialDeals.map(normalizeDeal);
      }
    }
    return initialDeals.map(normalizeDeal);
  });

  const companies = useMemo(() => readStoredArray("flowcrm-companies"), []);
  const contacts = useMemo(() => readStoredArray("flowcrm-contacts"), []);

  const [dealToDelete, setDealToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealId, setEditingDealId] = useState(null);
  const [dealForm, setDealForm] = useState({ ...emptyDeal });
  const [formError, setFormError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  }, [deals]);

  const toggleLanguage = () => {
    const nextLanguage = language === "en" ? "es" : "en";
    setLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);
  };

  const formatCurrency = (value, currency = "USD") => {
    try {
      return new Intl.NumberFormat(language === "es" ? "es-CO" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    } catch {
      return `${currency} ${Number(value || 0).toLocaleString()}`;
    }
  };

  const formatDate = (date) => {
    if (!date) return t.noCloseDate;
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      language === "es" ? "es-CO" : "en-US",
      { month: "short", day: "numeric", year: "numeric" }
    );
  };

  const filteredDeals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return deals.filter((deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(normalizedSearch) ||
        deal.company.toLowerCase().includes(normalizedSearch) ||
        deal.contact.toLowerCase().includes(normalizedSearch);
      const matchesOwner = ownerFilter === "All" || deal.owner === ownerFilter;
      return matchesSearch && matchesOwner;
    });
  }, [deals, searchTerm, ownerFilter]);

  const pipelineValue = useMemo(
    () =>
      deals
        .filter((deal) => deal.stage !== "Lost" && deal.stage !== "Won")
        .reduce((total, deal) => total + Number(deal.value || 0), 0),
    [deals]
  );

  const weightedPipelineValue = useMemo(
    () =>
      deals
        .filter((deal) => deal.stage !== "Lost" && deal.stage !== "Won")
        .reduce(
          (total, deal) =>
            total +
            Number(deal.value || 0) * (Number(deal.probability || 0) / 100),
          0
        ),
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
  const winRate = deals.length === 0 ? 0 : Math.round((wonDeals / deals.length) * 100);

  const availableContacts = useMemo(() => {
    if (!dealForm.company) return contacts;
    const matchingContacts = contacts.filter(
      (contact) =>
        contact.company?.toLowerCase() === dealForm.company.toLowerCase()
    );
    return matchingContacts.length > 0 ? matchingContacts : contacts;
  }, [contacts, dealForm.company]);

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
      probability: String(stageProbabilities[stage]),
    });
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditDealModal = (deal) => {
    setEditingDealId(deal.id);
    setDealForm({
      ...emptyDeal,
      ...deal,
      value: String(deal.value ?? ""),
      projectedRoi: String(deal.projectedRoi ?? ""),
      implementationCost: String(deal.implementationCost ?? ""),
      expectedCustomerSavings: String(deal.expectedCustomerSavings ?? ""),
      expectedAnnualValue: String(deal.expectedAnnualValue ?? ""),
      probability: String(deal.probability ?? 0),
    });
    setOpenMenuId(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleStageChange = (stage) => {
    setDealForm({
      ...dealForm,
      stage,
      probability: String(stageProbabilities[stage]),
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
      setFormError(t.completeFields);
      return;
    }

    const numericValue = Number(dealForm.value);
    const numericProbability = Number(dealForm.probability);
    const hasProjectedRoi = String(dealForm.projectedRoi).trim() !== "";
    const numericProjectedRoi = hasProjectedRoi
      ? Number(dealForm.projectedRoi)
      : null;

    if (Number.isNaN(numericValue) || numericValue <= 0) {
      setFormError(t.valuePositive);
      return;
    }

    if (
      Number.isNaN(numericProbability) ||
      numericProbability < 0 ||
      numericProbability > 100
    ) {
      setFormError(t.probabilityRange);
      return;
    }

    if (
      hasProjectedRoi &&
      (Number.isNaN(numericProjectedRoi) ||
        numericProjectedRoi < 0 ||
        numericProjectedRoi > 1000)
    ) {
      setFormError(t.roiRange);
      return;
    }

    if (hasProjectedRoi && !dealForm.roiPeriod.trim()) {
      setFormError(t.roiPeriodRequired);
      return;
    }

    const optionalNumber = (value) =>
      String(value).trim() === "" ? "" : Number(value);

    const normalizedDeal = {
      ...dealForm,
      value: numericValue,
      probability: numericProbability,
      projectedRoi: hasProjectedRoi ? numericProjectedRoi : "",
      roiPeriod: hasProjectedRoi ? dealForm.roiPeriod.trim() : "",
      implementationCost: optionalNumber(dealForm.implementationCost),
      expectedCustomerSavings: optionalNumber(dealForm.expectedCustomerSavings),
      expectedAnnualValue: optionalNumber(dealForm.expectedAnnualValue),
      savingsPeriod: dealForm.savingsPeriod.trim(),
      paybackPeriod: dealForm.paybackPeriod.trim(),
      businessProblem: dealForm.businessProblem.trim(),
      solutionSummary: dealForm.solutionSummary.trim(),
      successMetric: dealForm.successMetric.trim(),
    };

    if (editingDealId !== null) {
      const previousDeal = deals.find(
        (deal) => deal.id === editingDealId
      );
      const updatedDeal = {
        ...previousDeal,
        ...normalizedDeal,
        id: editingDealId,
      };

      const updatedDeals = deals.map((deal) =>
        deal.id === editingDealId ? updatedDeal : deal
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedDeals)
      );
      setDeals(updatedDeals);

      if (
        previousDeal &&
        previousDeal.stage !== updatedDeal.stage
      ) {
        fireAutomationTrigger("Deal stage changed", {
          deal: updatedDeal,
          previousStage: previousDeal.stage,
          newStage: updatedDeal.stage,
        });

        try {
          const automatedDeals = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
          );

          if (Array.isArray(automatedDeals)) {
            setDeals(automatedDeals);
          }
        } catch {
          // Keep the manually updated deals if stored data is invalid.
        }
      }
    } else {
      setDeals((currentDeals) => [
        ...currentDeals,
        { id: Date.now(), ...normalizedDeal },
      ]);
    }

    toast.success(
      editingDealId !== null ? t.updated : t.created,
      editingDealId !== null
        ? t.updatedBody(dealForm.title)
        : t.createdBody(dealForm.title)
    );
    closeModal();
  };

  const handleDeleteDeal = (dealId) => {
    const selectedDeal = deals.find((deal) => deal.id === dealId);
    if (!selectedDeal) return;
    setDealToDelete(selectedDeal);
    setOpenMenuId(null);
  };

  const confirmDeleteDeal = () => {
    if (!dealToDelete) return;
    setDeals((currentDeals) =>
      currentDeals.filter((deal) => deal.id !== dealToDelete.id)
    );
    toast.success(t.deleted, t.deletedBody(dealToDelete.title));
    setDealToDelete(null);
  };

  const moveDealToStage = (dealId, stage) => {
    const movedDeal = deals.find((deal) => deal.id === dealId);
    if (!movedDeal || movedDeal.stage === stage) {
      setOpenMenuId(null);
      return;
    }

    const updatedDeal = {
      ...movedDeal,
      stage,
      probability: stageProbabilities[stage],
    };

    const updatedDeals = deals.map((deal) =>
      deal.id === dealId ? updatedDeal : deal
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedDeals)
    );
    setDeals(updatedDeals);

    fireAutomationTrigger("Deal stage changed", {
      deal: updatedDeal,
      previousStage: movedDeal.stage,
      newStage: stage,
    });

    try {
      const automatedDeals = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      if (Array.isArray(automatedDeals)) {
        setDeals(automatedDeals);
      }
    } catch {
      // Keep the moved deal if stored data is invalid.
    }

    toast.info(
      t.moved,
      t.movedBody(movedDeal.title || "Deal", stageLabels[stage][language])
    );
    setOpenMenuId(null);
  };

  const moveDeal = (dealId, direction) => {
    const selectedDeal = deals.find((deal) => deal.id === dealId);
    if (!selectedDeal) return;
    const currentIndex = pipelineStages.indexOf(selectedDeal.stage);
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= pipelineStages.length) return;
    moveDealToStage(dealId, pipelineStages[nextIndex]);
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
    if (draggedDealId !== null) moveDealToStage(draggedDealId, stage);
    handleDragEnd();
  };

  return (
    <div className="deals-page">
      <section className="deals-page__header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="deals-page__header-actions">
          <button
            type="button"
            className="deals-language-toggle"
            onClick={toggleLanguage}
          >
            <Globe2 size={17} />
            <span>{language === "en" ? "EN" : "ES"}</span>
            <small>{language === "en" ? "English" : "Español"}</small>
          </button>

          <button
            type="button"
            className="deals-page__add-button"
            onClick={() => openAddDealModal()}
          >
            <Plus size={18} />
            {t.addDeal}
          </button>
        </div>
      </section>

      <section className="deals-page__stats">
        <article className="deals-stat">
          <div className="deals-stat__icon"><CircleDollarSign size={21} /></div>
          <div><span>{t.activePipeline}</span><strong>{formatCurrency(pipelineValue)}</strong></div>
        </article>
        <article className="deals-stat">
          <div className="deals-stat__icon"><TrendingUp size={21} /></div>
          <div><span>{t.expectedValue}</span><strong>{formatCurrency(weightedPipelineValue)}</strong></div>
        </article>
        <article className="deals-stat">
          <div className="deals-stat__icon"><CheckCircle2 size={21} /></div>
          <div><span>{t.wonRevenue}</span><strong>{formatCurrency(wonValue)}</strong></div>
        </article>
        <article className="deals-stat">
          <div className="deals-stat__icon"><Target size={21} /></div>
          <div><span>{t.winRate}</span><strong>{winRate}%</strong></div>
        </article>
      </section>

      <section className="deals-page__toolbar">
        <div className="deals-page__search">
          <Search size={18} />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
          <option value="All">{t.allOwners}</option>
          {dealOwners.map((owner) => <option value={owner} key={owner}>{owner}</option>)}
        </select>
      </section>

      <section className="deals-page__summary">
        <span><strong>{activeDeals}</strong> {t.activeDeals}</span>
        <span>{t.dragHint}</span>
      </section>

      <section className="deals-board">
        {pipelineStages.map((stage) => {
          const stageDeals = filteredDeals.filter((deal) => deal.stage === stage);
          const stageValue = stageDeals.reduce((total, deal) => total + Number(deal.value || 0), 0);
          const stageExpectedValue = stageDeals.reduce(
            (total, deal) => total + Number(deal.value || 0) * (Number(deal.probability || 0) / 100),
            0
          );

          return (
            <article
              className={`deals-column ${dragOverStage === stage ? "deals-column--drag-over" : ""}`}
              key={stage}
              onDragOver={(event) => handleDragOver(event, stage)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(event) => handleDrop(event, stage)}
            >
              <div className="deals-column__header">
                <div>
                  <div className="deals-column__title-row">
                    <span className={`deals-column__indicator deals-column__indicator--${stage.toLowerCase()}`} />
                    <h2>{stageLabels[stage][language]}</h2>
                    <span className="deals-column__count">{stageDeals.length}</span>
                  </div>
                  <p>{formatCurrency(stageValue)}</p>
                  <small>{t.expected} {formatCurrency(stageExpectedValue)}</small>
                </div>
                <button type="button" className="deals-column__add" onClick={() => openAddDealModal(stage)}>
                  <Plus size={17} />
                </button>
              </div>

              <div className="deals-column__cards">
                {stageDeals.length === 0 ? (
                  <div className="deals-column__empty">
                    <p>{t.noDeals}</p>
                    <button type="button" onClick={() => openAddDealModal(stage)}>{t.addADeal}</button>
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const stageIndex = pipelineStages.indexOf(deal.stage);
                    const expectedDealValue = Number(deal.value || 0) * (Number(deal.probability || 0) / 100);
                    const hasRoi = String(deal.projectedRoi ?? "").trim() !== "";

                    return (
                      <article
                        className={`deal-card ${draggedDealId === deal.id ? "deal-card--dragging" : ""}`}
                        key={deal.id}
                        draggable
                        role="button"
                        tabIndex={0}
                        onDragStart={() => handleDragStart(deal.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => navigate(`/deals/${deal.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") navigate(`/deals/${deal.id}`);
                        }}
                      >
                        <div className="deal-card__top">
                          <div className="deal-card__drag">
                            <GripVertical size={16} />
                            <span className="deal-card__value">{formatCurrency(deal.value, deal.currency)}</span>
                          </div>

                          <div className="deal-card__menu">
                            <button
                              type="button"
                              className="deal-card__menu-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuId(openMenuId === deal.id ? null : deal.id);
                              }}
                            >
                              <MoreHorizontal size={19} />
                            </button>

                            {openMenuId === deal.id && (
                              <div className="deal-card__dropdown" onClick={(event) => event.stopPropagation()}>
                                <button type="button" onClick={() => openEditDealModal(deal)}>
                                  <Edit3 size={15} /> {t.editDeal}
                                </button>
                                <button type="button" className="deal-card__delete" onClick={() => handleDeleteDeal(deal.id)}>
                                  <Trash2 size={15} /> {t.deleteDeal}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3>{deal.title}</h3>

                        <div className="deal-card__badges">
                          <span className={`deal-card__priority deal-card__priority--${deal.priority.toLowerCase()}`}>
                            {priorityLabels[deal.priority][language]}
                          </span>
                          <span className="deal-card__probability">{deal.probability}% {t.probability}</span>
                        </div>

                        <div className="deal-card__detail"><Building2 size={15} /><span>{deal.company}</span></div>
                        <div className="deal-card__detail"><UserRound size={15} /><span>{deal.contact}</span></div>
                        <div className="deal-card__detail"><CalendarDays size={15} /><span>{formatDate(deal.closeDate)}</span></div>

                        <div className="deal-card__owner"><span>{t.owner}</span><strong>{deal.owner}</strong></div>
                        <div className="deal-card__expected">
                          <span>{t.expectedDealValue}</span>
                          <strong>{formatCurrency(expectedDealValue, deal.currency)}</strong>
                        </div>

                        {hasRoi && (
                          <div className="deal-card__finance-metrics">
                            <div className="deal-card__finance-metric">
                              <span>{t.projectedRoi}</span>
                              <strong>{deal.projectedRoi}%</strong>
                            </div>
                            <div className="deal-card__finance-metric">
                              <span>{t.roiPeriod}</span>
                              <strong>{localizePeriod(deal.roiPeriod, language)}</strong>
                            </div>
                            {deal.paybackPeriod && (
                              <div className="deal-card__finance-metric deal-card__finance-metric--full">
                                <span>{t.payback}</span>
                                <strong>{localizePeriod(deal.paybackPeriod, language)}</strong>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="deal-card__move-actions">
                          <button type="button" disabled={stageIndex === 0} onClick={(event) => { event.stopPropagation(); moveDeal(deal.id, -1); }}>
                            <ChevronLeft size={16} /> {t.back}
                          </button>
                          <button type="button" disabled={stageIndex === pipelineStages.length - 1} onClick={(event) => { event.stopPropagation(); moveDeal(deal.id, 1); }}>
                            {t.next} <ChevronRight size={16} />
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
                <h2>{editingDealId !== null ? t.editTitle : t.addTitle}</h2>
                <p>{editingDealId !== null ? t.editSubtitle : t.addSubtitle}</p>
              </div>
              <button type="button" onClick={closeModal}><X size={21} /></button>
            </div>

            <form className="deal-modal__form" onSubmit={handleSaveDeal}>
              {formError && <p className="deal-modal__error">{formError}</p>}

              <label>
                {t.dealTitle}
                <input type="text" value={dealForm.title} onChange={(event) => setDealForm({ ...dealForm, title: event.target.value })} />
              </label>

              <div className="deal-modal__form-grid">
                <label>
                  {t.company}
                  {companies.length > 0 ? (
                    <select value={dealForm.company} onChange={(event) => setDealForm({ ...dealForm, company: event.target.value, contact: "" })}>
                      <option value="">{t.selectCompany}</option>
                      {companies.map((company) => <option value={company.name} key={company.id}>{company.name}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={dealForm.company} onChange={(event) => setDealForm({ ...dealForm, company: event.target.value })} />
                  )}
                </label>

                <label>
                  {t.contact}
                  {contacts.length > 0 ? (
                    <select value={dealForm.contact} onChange={(event) => setDealForm({ ...dealForm, contact: event.target.value })}>
                      <option value="">{t.selectContact}</option>
                      {availableContacts.map((contact) => <option value={contact.name} key={contact.id}>{contact.name}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={dealForm.contact} onChange={(event) => setDealForm({ ...dealForm, contact: event.target.value })} />
                  )}
                </label>
              </div>

              <div className="deal-modal__form-grid">
                <label>
                  {t.dealValue}
                  <input type="number" min="1" value={dealForm.value} onChange={(event) => setDealForm({ ...dealForm, value: event.target.value })} />
                </label>
                <label>
                  {t.currency}
                  <select value={dealForm.currency} onChange={(event) => setDealForm({ ...dealForm, currency: event.target.value })}>
                    {currencies.map((currency) => <option value={currency} key={currency}>{currency}</option>)}
                  </select>
                </label>
              </div>

              <div className="deal-modal__form-grid">
                <label>
                  {t.projectedRoiField}
                  <input type="number" min="0" max="1000" step="0.1" value={dealForm.projectedRoi} onChange={(event) => setDealForm({ ...dealForm, projectedRoi: event.target.value })} />
                  <small>{t.optional}</small>
                </label>
                <label>
                  {t.roiPeriodField}
                  <input type="text" disabled={!String(dealForm.projectedRoi).trim()} value={dealForm.roiPeriod} onChange={(event) => setDealForm({ ...dealForm, roiPeriod: event.target.value })} />
                </label>
              </div>

              <div className="deal-modal__form-grid">
                <label>{t.implementationCost}<input type="number" min="0" value={dealForm.implementationCost} onChange={(event) => setDealForm({ ...dealForm, implementationCost: event.target.value })} /></label>
                <label>{t.expectedSavings}<input type="number" min="0" value={dealForm.expectedCustomerSavings} onChange={(event) => setDealForm({ ...dealForm, expectedCustomerSavings: event.target.value })} /></label>
              </div>

              <div className="deal-modal__form-grid">
                <label>{t.savingsPeriod}<input type="text" value={dealForm.savingsPeriod} onChange={(event) => setDealForm({ ...dealForm, savingsPeriod: event.target.value })} /></label>
                <label>{t.paybackPeriod}<input type="text" value={dealForm.paybackPeriod} onChange={(event) => setDealForm({ ...dealForm, paybackPeriod: event.target.value })} /></label>
              </div>

              <div className="deal-modal__form-grid">
                <label>{t.annualValue}<input type="number" min="0" value={dealForm.expectedAnnualValue} onChange={(event) => setDealForm({ ...dealForm, expectedAnnualValue: event.target.value })} /></label>
                <label>{t.successMetric}<input type="text" value={dealForm.successMetric} onChange={(event) => setDealForm({ ...dealForm, successMetric: event.target.value })} /></label>
              </div>

              <label>{t.businessProblem}<textarea rows="3" value={dealForm.businessProblem} onChange={(event) => setDealForm({ ...dealForm, businessProblem: event.target.value })} /></label>
              <label>{t.solutionSummary}<textarea rows="3" value={dealForm.solutionSummary} onChange={(event) => setDealForm({ ...dealForm, solutionSummary: event.target.value })} /></label>

              <div className="deal-modal__form-grid">
                <label>{t.closeDate}<input type="date" value={dealForm.closeDate} onChange={(event) => setDealForm({ ...dealForm, closeDate: event.target.value })} /></label>
                <label>
                  {t.stage}
                  <select value={dealForm.stage} onChange={(event) => handleStageChange(event.target.value)}>
                    {pipelineStages.map((stage) => <option value={stage} key={stage}>{stageLabels[stage][language]}</option>)}
                  </select>
                </label>
              </div>

              <div className="deal-modal__form-grid">
                <label>{t.probabilityField}<input type="number" min="0" max="100" value={dealForm.probability} onChange={(event) => setDealForm({ ...dealForm, probability: event.target.value })} /></label>
                <label>
                  {t.ownerField}
                  <select value={dealForm.owner} onChange={(event) => setDealForm({ ...dealForm, owner: event.target.value })}>
                    {dealOwners.map((owner) => <option value={owner} key={owner}>{owner}</option>)}
                  </select>
                </label>
              </div>

              <label>
                {t.priority}
                <select value={dealForm.priority} onChange={(event) => setDealForm({ ...dealForm, priority: event.target.value })}>
                  {dealPriorities.map((priority) => <option value={priority} key={priority}>{priorityLabels[priority][language]}</option>)}
                </select>
              </label>

              <div className="deal-modal__preview">
                <div>
                  <span>{t.expectedDealValue}</span>
                  <strong>{formatCurrency(Number(dealForm.value || 0) * (Number(dealForm.probability || 0) / 100), dealForm.currency)}</strong>
                </div>
                {String(dealForm.projectedRoi).trim() && (
                  <div className="deal-modal__preview-metrics">
                    <span>{t.projectedRoi}<strong>{dealForm.projectedRoi}%</strong></span>
                    <span>{t.roiPeriod}<strong>{localizePeriod(dealForm.roiPeriod, language)}</strong></span>
                    {dealForm.paybackPeriod && <span>{t.payback}<strong>{localizePeriod(dealForm.paybackPeriod, language)}</strong></span>}
                  </div>
                )}
              </div>

              <div className="deal-modal__actions">
                <button type="button" className="deal-modal__cancel" onClick={closeModal}>{t.cancel}</button>
                <button type="submit" className="deal-modal__save">{editingDealId !== null ? t.updateDeal : t.saveDeal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={dealToDelete !== null}
        title={t.deleteTitle}
        message={dealToDelete ? t.deleteMessage(dealToDelete.title) : ""}
        confirmLabel={t.deleteConfirm}
        variant="danger"
        onCancel={() => setDealToDelete(null)}
        onConfirm={confirmDeleteDeal}
      />
    </div>
  );
}

export default Deals;
