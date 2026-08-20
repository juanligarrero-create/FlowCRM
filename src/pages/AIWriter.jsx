import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clipboard,
  FileText,
  Languages,
  Mail,
  MessageCircle,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  UserRound,
  WandSparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useToast } from "../components/ToastProvider.jsx";

import {
  builtInTemplates,
  getTemplateCategory,
  templateCategories,
} from "../data/aiWriterTemplates.js";

import {
  availableTemplateVariables,
  buildTemplateVariables,
  resolveTemplate,
  resolveTemplateVariables,
} from "../utils/templateEngine.js";

import "./AIWriter.css";

const STORAGE_KEYS = {
  contacts: "flowcrm-contacts",
  companies: "flowcrm-companies",
  deals: "flowcrm-deals",
  settings: "flowcrm-settings",
  templates: "flowcrm-ai-writer-templates",
  favorites:
    "flowcrm-ai-writer-favorite-templates",
  language: "flowcrm-language",
  context: "flowcrm-ai-writer-context",
};

const writerTypes = [
  {
    id: "sales-email",
    label: "Sales email",
    labelEs: "Correo de ventas",
    description:
      "Introduce your solution and start a commercial conversation.",
    descriptionEs:
      "Presenta tu solución e inicia una conversación comercial.",
    icon: Mail,
  },
  {
    id: "follow-up",
    label: "Follow-up",
    labelEs: "Seguimiento",
    description:
      "Reconnect after a proposal, call, or previous conversation.",
    descriptionEs:
      "Retoma el contacto después de una propuesta, llamada o conversación.",
    icon: RefreshCw,
  },
  {
    id: "whatsapp",
    label: "WhatsApp message",
    labelEs: "Mensaje de WhatsApp",
    description:
      "Create a concise and natural WhatsApp message.",
    descriptionEs:
      "Crea un mensaje de WhatsApp breve y natural.",
    icon: MessageCircle,
  },
  {
    id: "meeting",
    label: "Meeting invitation",
    labelEs: "Invitación a reunión",
    description:
      "Invite a prospect or customer to a focused meeting.",
    descriptionEs:
      "Invita a un prospecto o cliente a una reunión concreta.",
    icon: CalendarDays,
  },
  {
    id: "proposal",
    label: "Commercial proposal",
    labelEs: "Propuesta comercial",
    description:
      "Generate a structured proposal with business value and next steps.",
    descriptionEs:
      "Genera una propuesta estructurada con valor comercial y próximos pasos.",
    icon: FileText,
  },
  {
    id: "executive-summary",
    label: "Executive summary",
    labelEs: "Resumen ejecutivo",
    description:
      "Summarize the opportunity, investment case, and decision factors.",
    descriptionEs:
      "Resume la oportunidad, la inversión y los factores de decisión.",
    icon: BriefcaseBusiness,
  },
  {
    id: "re-engagement",
    label: "Re-engagement",
    labelEs: "Reactivación",
    description:
      "Reconnect with a cold or inactive opportunity.",
    descriptionEs:
      "Retoma el contacto con una oportunidad fría o inactiva.",
    icon: UserRound,
  },
];

const toneOptions = [
  {
    value: "professional",
    label: "Professional",
    labelEs: "Profesional",
  },
  {
    value: "friendly",
    label: "Friendly",
    labelEs: "Amigable",
  },
  {
    value: "persuasive",
    label: "Persuasive",
    labelEs: "Persuasivo",
  },
  {
    value: "concise",
    label: "Concise",
    labelEs: "Conciso",
  },
  {
    value: "consultative",
    label: "Consultative",
    labelEs: "Consultivo",
  },
];

const quickObjectives = [
  {
    id: "meeting",
    en: "Book a meeting",
    es: "Agendar una reunión",
  },
  {
    id: "followup",
    en: "Follow up",
    es: "Hacer seguimiento",
  },
  {
    id: "close",
    en: "Advance the deal",
    es: "Avanzar el negocio",
  },
  {
    id: "proposal",
    en: "Send a proposal",
    es: "Enviar una propuesta",
  },
  {
    id: "recover",
    en: "Recover an inactive opportunity",
    es: "Recuperar una oportunidad inactiva",
  },
  {
    id: "intro",
    en: "Introduce our company",
    es: "Presentar nuestra empresa",
  },
  {
    id: "documents",
    en: "Request documents",
    es: "Solicitar documentos",
  },
  {
    id: "thanks",
    en: "Thank the customer",
    es: "Agradecer al cliente",
  },
];

const variableGroupDefinitions = [
  {
    id: "contact",
    label: "Contact",
    labelEs: "Contacto",
    prefixes: ["contact_"],
  },
  {
    id: "company",
    label: "Company",
    labelEs: "Empresa",
    prefixes: ["company_"],
  },
  {
    id: "deal",
    label: "Deal",
    labelEs: "Negocio",
    prefixes: [
      "deal_",
      "expected_deal_value",
      "projected_roi",
      "roi_period",
      "implementation_cost",
      "expected_customer_savings",
      "savings_period",
      "payback_period",
      "contract_duration",
      "billing_model",
      "revenue_type",
      "expected_annual_value",
      "decision_deadline",
      "business_problem",
      "solution_summary",
      "success_metric",
    ],
  },
];

const readStoredArray = (key) => {
  const value = localStorage.getItem(key);

  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);

    return Array.isArray(parsedValue)
      ? parsedValue
      : [];
  } catch {
    return [];
  }
};

const readStoredObject = (key) => {
  const value = localStorage.getItem(key);

  if (!value) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(value);

    return parsedValue &&
      typeof parsedValue === "object" &&
      !Array.isArray(parsedValue)
      ? parsedValue
      : {};
  } catch {
    return {};
  }
};

const createId = () =>
  typeof crypto !== "undefined" &&
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const normalizeText = (value = "") =>
  String(value).trim();

const normalizeSearchText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const cleanSentence = (value = "") => {
  const normalized = String(value)
    .trim()
    .replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  const sentence =
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1);

  return /[.!?]$/.test(sentence)
    ? sentence
    : `${sentence}.`;
};

const getInsertedDetailVariableKeys = (
  rawDetails,
  variables,
  language
) => {
  const raw = normalizeText(rawDetails);

  if (!raw) {
    return [];
  }

  return availableTemplateVariables
    .filter((variable) => {
      const label =
        language === "es"
          ? variable.labelEs
          : variable.label;

      const value = variables?.[variable.key];
      const cleanValue =
        value === undefined || value === null
          ? ""
          : String(value).trim();

      const insertedText = cleanValue
        ? `${label}: ${cleanValue}`
        : label;

      return raw.includes(insertedText);
    })
    .map((variable) => variable.key);
};

const removeConsumedDetailVariables = (
  rawDetails,
  variables,
  language,
  consumedKeys
) => {
  let cleaned = String(rawDetails || "");

  availableTemplateVariables.forEach(
    (variable) => {
      if (!consumedKeys.has(variable.key)) {
        return;
      }

      const label =
        language === "es"
          ? variable.labelEs
          : variable.label;

      const value = variables?.[variable.key];
      const cleanValue =
        value === undefined || value === null
          ? ""
          : String(value).trim();

      const insertedText = cleanValue
        ? `${label}: ${cleanValue}`
        : label;

      cleaned = cleaned.replaceAll(
        insertedText,
        " "
      );
    }
  );

  return cleaned
    .replace(/\s+/g, " ")
    .replace(/^[,;|.\s]+|[,;|\s]+$/g, "")
    .trim();
};

const sanitizeAdditionalDetails = (
  rawDetails,
  resolvedDetails,
  variables,
  language,
  consumedVariableKeys = []
) => {
  const raw = normalizeText(rawDetails);
  const resolved = normalizeText(
    resolvedDetails
  );

  if (!raw || !resolved) {
    return "";
  }

  const consumedKeys = new Set(
    consumedVariableKeys
  );

  const cleanedRaw =
    removeConsumedDetailVariables(
      raw,
      variables,
      language,
      consumedKeys
    );

  if (!cleanedRaw) {
    return "";
  }

  const cleanedResolved =
    resolveTemplateVariables(
      cleanedRaw,
      variables,
      { keepUnknownVariables: true }
    );

  const tokenMatches =
    cleanedRaw.match(/{{[^}]+}}/g) || [];

  const proseWithoutTokens = cleanedRaw
    .replace(/{{[^}]+}}/g, " ")
    .replace(/[|,;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    tokenMatches.length >= 2 &&
    proseWithoutTokens.length < 18
  ) {
    return buildStructuredVariableDetails(
      cleanedRaw,
      variables,
      language
    );
  }

  return cleanSentence(cleanedResolved);
};

const getContactName = (contact) =>
  contact?.name ||
  contact?.fullName ||
  contact?.contactName ||
  "Customer";

const getCompanyName = (company) =>
  company?.name ||
  company?.companyName ||
  "Company";

const getDealName = (deal) =>
  deal?.title ||
  deal?.name ||
  "Opportunity";

const getFirstName = (value = "") =>
  value.trim().split(/\s+/)[0] || "there";

const formatCurrency = (
  value,
  currency = "USD",
  language = "en"
) => {
  try {
    return new Intl.NumberFormat(
      language === "es"
        ? "es-CO"
        : "en-US",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(Number(value || 0));
  } catch {
    return `${currency} ${String(value || 0)}`;
  }
};

const getToneInstruction = (
  tone,
  language
) => {
  const toneMap = {
    professional: {
      en: "clear, professional, and credible",
      es: "claro, profesional y confiable",
    },
    friendly: {
      en: "warm, natural, and approachable",
      es: "cálido, natural y cercano",
    },
    persuasive: {
      en: "persuasive, benefit-focused, and action-oriented",
      es: "persuasivo, orientado a beneficios y a la acción",
    },
    concise: {
      en: "brief, direct, and easy to scan",
      es: "breve, directo y fácil de leer",
    },
    consultative: {
      en: "consultative, thoughtful, and focused on the customer's needs",
      es: "consultivo, reflexivo y centrado en las necesidades del cliente",
    },
  };

  return (
    toneMap[tone]?.[language] ||
    toneMap.professional[language]
  );
};

const getToneOpening = (tone, language) => {
  const openings = {
    en: {
      professional: "I hope you're doing well.",
      friendly: "I hope you're having a great week.",
      persuasive:
        "I wanted to share a practical next step that could create measurable value for your team.",
      concise:
        "I wanted to follow up briefly.",
      consultative:
        "I've been reviewing the opportunity and wanted to share a few practical observations.",
    },
    es: {
      professional:
        "Espero que estés muy bien.",
      friendly:
        "Espero que estés teniendo una excelente semana.",
      persuasive:
        "Quería compartirte un siguiente paso práctico que podría generar valor medible para tu equipo.",
      concise:
        "Quería hacer un seguimiento breve.",
      consultative:
        "He estado revisando la oportunidad y quería compartirte algunas observaciones prácticas.",
    },
  };

  return (
    openings[language][tone] ||
    openings[language].professional
  );
};

const getToneClosing = (
  tone,
  language,
  type
) => {
  if (language === "es") {
    const closings = {
      professional:
        "Quedo atento a tus comentarios y con gusto coordinamos el siguiente paso.",
      friendly:
        "Cuéntame qué te parece y lo revisamos juntos.",
      persuasive:
        "Si estás de acuerdo, podemos definir el siguiente paso esta semana y mantener el proyecto en movimiento.",
      concise:
        "¿Te parece si confirmamos el siguiente paso?",
      consultative:
        "Me gustaría conocer tu perspectiva y ajustar la propuesta a sus prioridades reales.",
    };

    if (type === "whatsapp") {
      return tone === "concise"
        ? "¿Lo revisamos?"
        : "Quedo atento y con gusto lo revisamos juntos.";
    }

    return closings[tone] ||
      closings.professional;
  }

  const closings = {
    professional:
      "Please let me know what you think. I would be happy to coordinate the next step.",
    friendly:
      "Let me know what you think, and we can review it together.",
    persuasive:
      "If this direction makes sense, we can confirm the next step this week and keep the project moving.",
    concise:
      "Would you like to confirm the next step?",
    consultative:
      "I would value your perspective and can adjust the proposal around your actual priorities.",
  };

  if (type === "whatsapp") {
    return tone === "concise"
      ? "Should we review it?"
      : "Happy to review it with you.";
  }

  return closings[tone] ||
    closings.professional;
};

const localizeDuration = (
  value,
  language = "en"
) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "";
  }

  const raw = String(value).trim();

  const durationMatch = raw.match(
    /^(\d+(?:[.,]\d+)?)\s*(months?|mes(?:es)?|years?|años?|yrs?|mos?)$/i
  );

  if (!durationMatch) {
    return raw;
  }

  const amount = durationMatch[1];
  const numericAmount = Number(
    amount.replace(",", ".")
  );
  const unit = durationMatch[2].toLowerCase();

  const isMonth =
    unit.startsWith("month") ||
    unit.startsWith("mes") ||
    unit.startsWith("mo");

  if (language === "es") {
    if (isMonth) {
      return `${amount} ${
        numericAmount === 1 ? "mes" : "meses"
      }`;
    }

    return `${amount} ${
      numericAmount === 1 ? "año" : "años"
    }`;
  }

  if (isMonth) {
    return `${amount} ${
      numericAmount === 1 ? "month" : "months"
    }`;
  }

  return `${amount} ${
    numericAmount === 1 ? "year" : "years"
  }`;
};


const formatDurationAsModifier = (
  value,
  language = "en"
) => {
  const localized = localizeDuration(
    value,
    language
  );

  if (!localized || language === "es") {
    return localized;
  }

  const match = localized.match(
    /^(\d+(?:[.,]\d+)?)\s+(months?|years?)$/i
  );

  if (!match) {
    return localized;
  }

  const unit = match[2]
    .toLowerCase()
    .startsWith("month")
    ? "month"
    : "year";

  return `${match[1]}-${unit}`;
};

const formatBusinessDate = (
  value,
  language = "en"
) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "";
  }

  const raw = String(value).trim();
  const isoMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/
  );

  if (!isoMatch) {
    return raw;
  }

  const year = Number(isoMatch[1]);
  const month = Number(isoMatch[2]);
  const day = Number(isoMatch[3]);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return raw;
  }

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return new Intl.DateTimeFormat(
    language === "es"
      ? "es-CO"
      : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
};

const buildStructuredVariableDetails = (
  rawDetails,
  variables,
  language
) => {
  const tokens =
    String(rawDetails).match(
      /{{\s*([^}]+?)\s*}}/g
    ) || [];

  if (tokens.length === 0) {
    return "";
  }

  const labels = {
    contact_name: {
      en: "Contact",
      es: "Contacto",
    },
    contact_first_name: {
      en: "First name",
      es: "Nombre",
    },
    contact_email: {
      en: "Email",
      es: "Correo",
    },
    contact_phone: {
      en: "Phone",
      es: "Teléfono",
    },
    company_name: {
      en: "Company",
      es: "Empresa",
    },
    deal_name: {
      en: "Deal",
      es: "Negocio",
    },
    deal_value: {
      en: "Deal value",
      es: "Valor del negocio",
    },
    projected_roi: {
      en: "Projected ROI",
      es: "ROI proyectado",
    },
    roi_period: {
      en: "ROI period",
      es: "Periodo del ROI",
    },
    payback_period: {
      en: "Payback period",
      es: "Periodo de recuperación",
    },
  };

  const selectedKeys = tokens
    .map((token) =>
      token
        .replace(/{{|}}/g, "")
        .trim()
    )
    .filter(Boolean);

  const getValue = (key) => {
    let value = variables?.[key];

    if (
      key === "roi_period" ||
      key === "payback_period"
    ) {
      value = localizeDuration(
        value,
        language
      );
    }

    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return "";
    }

    return String(value).trim();
  };

  const selected = new Set(selectedKeys);
  const consumed = new Set();
  const sentences = [];

  const projectedRoi = getValue(
    "projected_roi"
  );
  const roiPeriod = getValue("roi_period");
  const paybackPeriod = getValue(
    "payback_period"
  );

  /*
   * Financial variables need to read like business language,
   * not like a raw list of CRM fields. When payback and ROI
   * are selected together, combine both timelines into one
   * sentence so 24 months and 12 months are clearly describing
   * different metrics rather than conflicting dates.
   */
  if (
    selected.has("payback_period") &&
    paybackPeriod &&
    selected.has("projected_roi") &&
    projectedRoi
  ) {
    if (
      selected.has("roi_period") &&
      roiPeriod
    ) {
      sentences.push(
        language === "es"
          ? `Si se realiza la inversión, el periodo estimado de recuperación sería de ${paybackPeriod}, con un ROI proyectado del ${projectedRoi}% durante los primeros ${roiPeriod}.`
          : `If the investment is made, the estimated payback period would be ${paybackPeriod}, with a projected ROI of ${projectedRoi}% over the first ${roiPeriod}.`
      );
      consumed.add("roi_period");
    } else {
      sentences.push(
        language === "es"
          ? `Si se realiza la inversión, el periodo estimado de recuperación sería de ${paybackPeriod}, con un ROI proyectado del ${projectedRoi}%.`
          : `If the investment is made, the estimated payback period would be ${paybackPeriod}, with a projected ROI of ${projectedRoi}%.`
      );
    }

    consumed.add("payback_period");
    consumed.add("projected_roi");
  } else {
    if (
      selected.has("projected_roi") &&
      projectedRoi
    ) {
      if (
        selected.has("roi_period") &&
        roiPeriod
      ) {
        sentences.push(
          language === "es"
            ? `Se proyecta un ROI del ${projectedRoi}% durante los primeros ${roiPeriod}.`
            : `The projected ROI is ${projectedRoi}% over the first ${roiPeriod}.`
        );
        consumed.add("roi_period");
      } else {
        sentences.push(
          language === "es"
            ? `Se proyecta un ROI del ${projectedRoi}%.`
            : `The projected ROI is ${projectedRoi}%.`
        );
      }

      consumed.add("projected_roi");
    }

    if (
      selected.has("payback_period") &&
      paybackPeriod
    ) {
      sentences.push(
        language === "es"
          ? `El periodo estimado de recuperación de la inversión sería de ${paybackPeriod}.`
          : `The estimated payback period would be ${paybackPeriod}.`
      );
      consumed.add("payback_period");
    }
  }

  /*
   * A period without its ROI percentage is ambiguous, so keep
   * it readable while making clear what the period refers to.
   */
  if (
    selected.has("roi_period") &&
    roiPeriod &&
    !consumed.has("roi_period")
  ) {
    sentences.push(
      language === "es"
        ? `El periodo utilizado para medir el ROI es de ${roiPeriod}.`
        : `The ROI measurement period is ${roiPeriod}.`
    );
    consumed.add("roi_period");
  }

  const remainingParts = selectedKeys
    .filter((key) => !consumed.has(key))
    .map((key) => {
      const value = getValue(key);

      if (!value) {
        return null;
      }

      const label =
        labels[key]?.[language] ||
        key
          .replaceAll("_", " ")
          .replace(/\b\w/g, (character) =>
            character.toUpperCase()
          );

      return `${label}: ${value}`;
    })
    .filter(Boolean);

  if (remainingParts.length > 0) {
    sentences.push(
      `${remainingParts.join(". ")}.`
    );
  }

  return sentences.join(" ");
};

const buildContext = ({
  contact,
  company,
  deal,
  currency,
  language,
}) => {
  const dealCurrency =
    deal?.currency ||
    currency ||
    "USD";

  const formatDealCurrency = (value) =>
    formatCurrency(
      value,
      dealCurrency,
      language
    );

  const hasNumericValue = (value) =>
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "";

  return {
    contactName: contact
      ? getContactName(contact)
      : language === "es"
        ? "cliente"
        : "customer",

    contactFirstName: contact
      ? getFirstName(getContactName(contact))
      : language === "es"
        ? "Carlos"
        : "Alex",

    companyName: company
      ? getCompanyName(company)
      : deal?.company ||
        deal?.companyName ||
        (language === "es"
          ? "la empresa"
          : "the company"),

    dealName: deal
      ? getDealName(deal)
      : language === "es"
        ? "la oportunidad"
        : "the opportunity",

    dealCurrency,

    dealValue: hasNumericValue(deal?.value)
      ? formatDealCurrency(deal.value)
      : "",

    probability: hasNumericValue(
      deal?.probability
    )
      ? Number(deal.probability)
      : null,

    expectedDealValue:
      hasNumericValue(deal?.value) &&
      hasNumericValue(deal?.probability)
        ? formatDealCurrency(
            Number(deal.value || 0) *
              (Number(
                deal.probability || 0
              ) /
                100)
          )
        : "",

    projectedRoi: hasNumericValue(
      deal?.projectedRoi
    )
      ? Number(deal.projectedRoi)
      : null,

    roiPeriod: localizeDuration(
      deal?.roiPeriod,
      language
    ),

    implementationCost: hasNumericValue(
      deal?.implementationCost
    )
      ? formatDealCurrency(
          deal.implementationCost
        )
      : "",

    customerSavings: hasNumericValue(
      deal?.expectedCustomerSavings
    )
      ? formatDealCurrency(
          deal.expectedCustomerSavings
        )
      : "",

    savingsPeriod:
      localizeDuration(
        deal?.savingsPeriod,
        language
      ),

    paybackPeriod:
      localizeDuration(
        deal?.paybackPeriod,
        language
      ),

    contractDuration:
      localizeDuration(
        deal?.contractDuration,
        language
      ),

    billingModel:
      deal?.billingModel || "",

    revenueType:
      deal?.revenueType || "",

    annualValue: hasNumericValue(
      deal?.expectedAnnualValue
    )
      ? formatDealCurrency(
          deal.expectedAnnualValue
        )
      : "",

    decisionDeadline:
      deal?.decisionDeadline || "",

    closeDate: deal?.closeDate || "",

    businessProblem:
      deal?.businessProblem || "",

    solutionSummary:
      deal?.solutionSummary || "",

    successMetric:
      deal?.successMetric || "",

    dealStage:
      deal?.stage ||
      (language === "es"
        ? "en proceso"
        : "in progress"),
  };
};

const getTemplateDisplayName = (
  template,
  language
) =>
  language === "es"
    ? template.nameEs || template.name
    : template.name;

const getTemplateDescription = (
  template,
  language
) =>
  language === "es"
    ? template.descriptionEs ||
      template.description
    : template.description;

const getTemplateSubject = (
  template,
  language
) =>
  language === "es"
    ? template.subjectEs ||
      template.subject
    : template.subject;

const getTemplateContent = (
  template,
  language
) =>
  language === "es"
    ? template.contentEs ||
      template.content
    : template.content;

const buildSuccessMetricSentence = (metric, language) => {
  const raw = cleanSentence(metric).replace(/\.$/, "").trim();

  if (!raw) {
    return "";
  }

  const normalizeEnglishMetricNoun = (noun) => {
    const cleaned = String(noun || "").trim();
    const lower = cleaned.toLowerCase();

    if (lower === "cost") return "costs";
    if (lower === "expense") return "expenses";
    if (lower === "response time") return "response time";

    return cleaned;
  };

  if (language === "es") {
    const reductionMatch = raw.match(/^(?:reducir|reduce)\s+(.+?)\s+(?:en|por)\s+(\d+(?:[.,]\d+)?)%$/i);
    const increaseMatch = raw.match(/^(?:aumentar|incrementar|increase)\s+(.+?)\s+(?:en|por)\s+(\d+(?:[.,]\d+)?)%$/i);

    if (reductionMatch) {
      return `El éxito de la iniciativa se mediría por una reducción del ${reductionMatch[2]}% en ${reductionMatch[1]}.`;
    }

    if (increaseMatch) {
      return `El éxito de la iniciativa se mediría por un aumento del ${increaseMatch[2]}% en ${increaseMatch[1]}.`;
    }

    return `El principal indicador de éxito sería ${raw.charAt(0).toLowerCase()}${raw.slice(1)}.`;
  }

  const reductionMatch = raw.match(/^(?:reduce|reducing|decrease|decreasing|lower|lowering)\s+(.+?)\s+by\s+(\d+(?:\.\d+)?)%$/i);
  const increaseMatch = raw.match(/^(?:increase|increasing|improve|improving|raise|raising)\s+(.+?)\s+by\s+(\d+(?:\.\d+)?)%$/i);

  if (reductionMatch) {
    return `Success would be measured by a ${reductionMatch[2]}% reduction in ${normalizeEnglishMetricNoun(reductionMatch[1])}.`;
  }

  if (increaseMatch) {
    return `Success would be measured by a ${increaseMatch[2]}% increase in ${normalizeEnglishMetricNoun(increaseMatch[1])}.`;
  }

  return `The primary success metric would be ${raw.charAt(0).toLowerCase()}${raw.slice(1)}.`;
};

const buildBusinessValueParagraph = (
  context,
  language,
  tone,
  detailVariableKeys = [],
  variables = {},
  type = "follow-up"
) => {
  const selected = new Set(detailVariableKeys);
  const paragraphs = [];
  const financial = [];
  const commercial = [];
  const strategic = [];
  const internal = [];

  const has = (key) => selected.has(key);
  const value = (key) => {
    const raw = variables?.[key];
    return raw === undefined || raw === null ? "" : String(raw).trim();
  };

  const lowerFirst = (text) => {
    const clean = String(text || "").trim().replace(/\.$/, "");
    return clean ? clean.charAt(0).toLowerCase() + clean.slice(1) : "";
  };

  const localizeRevenueType = (raw) => {
    const normalized = normalizeSearchText(raw);
    if (language === "es") {
      if (normalized.includes("recurr")) return "recurrente";
      if (normalized.includes("one-time") || normalized.includes("unico") || normalized.includes("único")) return "único";
      return raw;
    }
    if (normalized.includes("recurr")) return "recurring";
    if (normalized.includes("one-time") || normalized.includes("unico") || normalized.includes("único")) return "one-time";
    return raw;
  };

  const localizeBillingModel = (raw) => {
    const normalized = normalizeSearchText(raw);
    if (language === "es") {
      if (normalized.includes("one-time") || normalized.includes("unico") || normalized.includes("único")) return "un pago único";
      if (normalized.includes("monthly") || normalized.includes("mensual")) return "facturación mensual";
      if (normalized.includes("annual") || normalized.includes("anual")) return "facturación anual";
      return raw;
    }
    if (normalized.includes("one-time") || normalized.includes("unico") || normalized.includes("único")) return "a one-time payment";
    if (normalized.includes("monthly") || normalized.includes("mensual")) return "monthly billing";
    if (normalized.includes("annual") || normalized.includes("anual")) return "annual billing";
    return raw;
  };

  // Strategic context: business problem and proposed solution belong in prose,
  // while identity/contact fields are already used elsewhere in the message.
  if (has("business_problem") && context.businessProblem) {
    strategic.push(
      language === "es"
        ? `La iniciativa busca resolver ${lowerFirst(context.businessProblem)}.`
        : `The initiative is intended to address ${lowerFirst(context.businessProblem)}.`
    );
  }

  if (has("solution_summary") && context.solutionSummary) {
    strategic.push(
      language === "es"
        ? `La solución propuesta se centra en ${lowerFirst(context.solutionSummary)}.`
        : `The proposed solution focuses on ${lowerFirst(context.solutionSummary)}.`
    );
  }

  // Financial case.
  if (has("deal_value") && context.dealValue) {
    financial.push(
      language === "es"
        ? tone === "concise"
          ? `La inversión estimada es de ${context.dealValue}.`
          : `La inversión estimada para esta iniciativa es de ${context.dealValue}.`
        : tone === "concise"
          ? `The estimated investment is ${context.dealValue}.`
          : `The estimated investment for this initiative is ${context.dealValue}.`
    );
  }

  if (has("implementation_cost") && context.implementationCost) {
    financial.push(
      language === "es"
        ? `El costo estimado de implementación es de ${context.implementationCost}.`
        : `Estimated implementation costs are ${context.implementationCost}.`
    );
  }

  if (
    has("payback_period") && context.paybackPeriod &&
    has("projected_roi") && context.projectedRoi !== null
  ) {
    financial.push(
      language === "es"
        ? has("roi_period") && context.roiPeriod
          ? `Si se realiza la inversión, el periodo estimado de recuperación sería de ${context.paybackPeriod}, con un ROI proyectado del ${context.projectedRoi}% durante los primeros ${context.roiPeriod}.`
          : `Si se realiza la inversión, el periodo estimado de recuperación sería de ${context.paybackPeriod}, con un ROI proyectado del ${context.projectedRoi}%.`
        : has("roi_period") && context.roiPeriod
          ? `If the investment is made, the estimated payback period would be ${context.paybackPeriod}, with a projected ROI of ${context.projectedRoi}% over the first ${context.roiPeriod}.`
          : `If the investment is made, the estimated payback period would be ${context.paybackPeriod}, with a projected ROI of ${context.projectedRoi}%.`
    );
  } else {
    if (has("projected_roi") && context.projectedRoi !== null) {
      financial.push(
        language === "es"
          ? has("roi_period") && context.roiPeriod
            ? `Se proyecta un ROI aproximado del ${context.projectedRoi}% durante ${context.roiPeriod}.`
            : `Se proyecta un ROI aproximado del ${context.projectedRoi}%.`
          : has("roi_period") && context.roiPeriod
            ? `The projected ROI is approximately ${context.projectedRoi}% over ${context.roiPeriod}.`
            : `The projected ROI is approximately ${context.projectedRoi}%.`
      );
    } else if (has("roi_period") && context.roiPeriod) {
      financial.push(
        language === "es"
          ? `El periodo utilizado para medir el ROI es de ${context.roiPeriod}.`
          : `The ROI measurement period is ${context.roiPeriod}.`
      );
    }

    if (has("payback_period") && context.paybackPeriod) {
      financial.push(
        language === "es"
          ? `El periodo estimado de recuperación de la inversión sería de ${context.paybackPeriod}.`
          : `The estimated payback period would be ${context.paybackPeriod}.`
      );
    }
  }

  if (has("expected_customer_savings") && context.customerSavings) {
    financial.push(
      language === "es"
        ? `Además, los ahorros estimados podrían alcanzar ${context.customerSavings}${has("savings_period") && context.savingsPeriod ? ` durante ${context.savingsPeriod}` : ""}.`
        : `In addition, estimated savings could reach ${context.customerSavings}${has("savings_period") && context.savingsPeriod ? ` over ${context.savingsPeriod}` : ""}.`
    );
  } else if (has("savings_period") && context.savingsPeriod) {
    financial.push(
      language === "es"
        ? `Los ahorros se evaluarían durante un periodo de ${context.savingsPeriod}.`
        : `Savings would be measured over a ${context.savingsPeriod} period.`
    );
  }

  const revenueType = has("revenue_type") ? localizeRevenueType(context.revenueType || value("revenue_type")) : "";
  if (has("expected_annual_value") && context.annualValue) {
    if (revenueType && normalizeSearchText(revenueType).includes(language === "es" ? "recurrent" : "recurr")) {
      financial.push(
        language === "es"
          ? `La oportunidad tendría un valor anual recurrente estimado de ${context.annualValue}.`
          : `The opportunity is expected to generate ${context.annualValue} in annual recurring value.`
      );
    } else {
      financial.push(
        language === "es"
          ? `El valor anual esperado de la oportunidad sería de ${context.annualValue}.`
          : `The expected annual value of the opportunity would be ${context.annualValue}.`
      );
    }
  } else if (revenueType) {
    financial.push(
      language === "es"
        ? `La oportunidad está estructurada como un ingreso ${revenueType}.`
        : `The opportunity is structured as ${revenueType} revenue.`
    );
  }

  if (has("success_metric") && context.successMetric) {
    financial.push(buildSuccessMetricSentence(context.successMetric, language));
  }

  // Commercial terms are grouped rather than dumped as labels.
  const billingModel = has("billing_model") ? localizeBillingModel(context.billingModel || value("billing_model")) : "";
  const contractDuration = has("contract_duration") ? context.contractDuration : "";

  if (billingModel || contractDuration) {
    if (language === "es") {
      if (billingModel && contractDuration) {
        commercial.push(`La estructura comercial propuesta contempla un contrato de ${contractDuration} con ${billingModel}.`);
      } else if (billingModel) {
        commercial.push(`El modelo de facturación propuesto es ${billingModel}.`);
      } else {
        commercial.push(`La duración propuesta del contrato es de ${contractDuration}.`);
      }
    } else {
      if (billingModel && contractDuration) {
        commercial.push(`The proposed commercial structure is a ${formatDurationAsModifier(contractDuration, "en")} contract with ${billingModel}.`);
      } else if (billingModel) {
        commercial.push(`The proposed billing model uses ${billingModel}.`);
      } else {
        commercial.push(`The proposed contract term is ${contractDuration}.`);
      }
    }
  }

  if (has("decision_deadline") && context.decisionDeadline) {
    commercial.push(
      language === "es"
        ? `Para mantener el impulso, la fecha objetivo para la decisión es ${formatBusinessDate(context.decisionDeadline, "es")}.`
        : `To keep the process moving, the target decision date is ${formatBusinessDate(context.decisionDeadline, "en")}.`
    );
  } else if (has("deal_close_date") && context.closeDate) {
    commercial.push(
      language === "es"
        ? `La fecha estimada de cierre es ${formatBusinessDate(context.closeDate, "es")}.`
        : `The current target close date is ${formatBusinessDate(context.closeDate, "en")}.`
    );
  }

  // Company descriptors can add context without exposing raw CRM labels.
  const industry = has("company_industry") ? value("company_industry") : "";
  const location = has("company_location") ? value("company_location") : "";
  if (industry || location) {
    if (language === "es") {
      if (industry && location) {
        strategic.unshift(`${context.companyName} opera en el sector de ${industry} en ${location}.`);
      } else if (industry) {
        strategic.unshift(`${context.companyName} opera en el sector de ${industry}.`);
      } else {
        strategic.unshift(`${context.companyName} tiene operaciones en ${location}.`);
      }
    } else {
      if (industry && location) {
        strategic.unshift(`${context.companyName} operates in the ${industry} sector in ${location}.`);
      } else if (industry) {
        strategic.unshift(`${context.companyName} operates in the ${industry} sector.`);
      } else {
        strategic.unshift(`${context.companyName} operates in ${location}.`);
      }
    }
  }

  // Pipeline-only fields are appropriate in an internal executive summary,
  // but should not be exposed automatically in customer-facing messages.
  if (type === "executive-summary") {
    const stage = has("deal_stage") ? context.dealStage : "";
    const probability = has("deal_probability") && context.probability !== null ? context.probability : null;
    const weightedValue = has("expected_deal_value") ? context.expectedDealValue : "";

    if (stage || probability !== null || weightedValue) {
      if (language === "es") {
        const parts = [];
        if (stage) parts.push(`etapa ${stage}`);
        if (probability !== null) parts.push(`probabilidad estimada del ${probability}%`);
        if (weightedValue) parts.push(`valor ponderado de ${weightedValue}`);
        internal.push(`Internamente, la oportunidad se encuentra en ${parts.join(", con ")}.`);
      } else {
        const parts = [];
        if (stage) parts.push(`${stage} stage`);
        if (probability !== null) parts.push(`${probability}% estimated probability`);
        if (weightedValue) parts.push(`${weightedValue} weighted value`);
        internal.push(`Internally, the opportunity is currently at the ${parts.join(", with ")}.`);
      }
    }
  }

  if (strategic.length) paragraphs.push(strategic.join(" "));
  if (financial.length) paragraphs.push(financial.join(" "));
  if (commercial.length) paragraphs.push(commercial.join(" "));
  if (internal.length) paragraphs.push(internal.join(" "));

  return paragraphs.join("\n\n");
};

const buildObjectiveSentence = ({
  objective,
  language,
  type,
}) => {
  const cleaned = normalizeText(objective);

  if (!cleaned) {
    const defaults = {
      en: {
        "sales-email":
          "I would like to understand your current priorities and explore whether this solution is a good fit.",
        "follow-up":
          "I wanted to confirm whether you had a chance to review the information we shared.",
        whatsapp:
          "Have you had a chance to review the proposal?",
        meeting:
          "The goal is to review current needs, clarify open questions, and agree on the next steps.",
        proposal:
          "The objective is to implement a practical solution that improves visibility, execution, and commercial performance.",
        "executive-summary":
          "The opportunity should be evaluated based on business impact, implementation effort, and expected return.",
        "re-engagement":
          "I wanted to see whether this initiative is still relevant and whether priorities have changed.",
      },
      es: {
        "sales-email":
          "Me gustaría conocer mejor tus prioridades actuales y evaluar si esta solución encaja con lo que necesitan.",
        "follow-up":
          "Quería confirmar si tuviste la oportunidad de revisar la información que compartimos.",
        whatsapp:
          "¿Tuviste la oportunidad de revisar la propuesta?",
        meeting:
          "El objetivo es revisar las necesidades actuales, resolver preguntas pendientes y acordar los próximos pasos.",
        proposal:
          "El objetivo es implementar una solución práctica que mejore la visibilidad, la ejecución y el rendimiento comercial.",
        "executive-summary":
          "La oportunidad debe evaluarse considerando el impacto comercial, el esfuerzo de implementación y el retorno esperado.",
        "re-engagement":
          "Quería saber si esta iniciativa sigue siendo relevante y si las prioridades han cambiado.",
      },
    };

    return defaults[language][type] || "";
  }

  const normalized =
    normalizeSearchText(cleaned);

  if (language === "es") {
    if (
      normalized.includes("enviar una propuesta")
    ) {
      return "Me gustaría compartirte la propuesta actualizada, explicar el valor esperado y resolver cualquier pregunta antes de avanzar.";
    }

    if (
      normalized.includes("agendar una reunion")
    ) {
      return "Me gustaría coordinar una conversación breve para revisar los puntos clave y definir los próximos pasos.";
    }

    if (
      normalized.includes("hacer seguimiento")
    ) {
      return "Quería confirmar si existe algún punto pendiente antes de avanzar.";
    }

    if (
      normalized.includes("avanzar el negocio")
    ) {
      return "Me gustaría alinear los próximos pasos y confirmar qué necesitamos para mantener la oportunidad en movimiento.";
    }

    if (
      normalized.includes(
        "recuperar una oportunidad inactiva"
      )
    ) {
      return "Quería saber si esta iniciativa sigue siendo una prioridad y si tendría sentido retomarla con un enfoque actualizado.";
    }

    if (
      normalized.includes(
        "presentar nuestra empresa"
      )
    ) {
      return "Me gustaría presentarte brevemente cómo trabajamos y explorar si podemos aportar valor a sus prioridades actuales.";
    }

    if (
      normalized.includes(
        "solicitar documentos"
      )
    ) {
      return "Para continuar con la evaluación, agradecería que nos compartieras la documentación pendiente.";
    }

    if (
      normalized.includes(
        "agradecer al cliente"
      )
    ) {
      return "Quería agradecerte por el tiempo, la confianza y la información que has compartido con nosotros.";
    }

    return cleanSentence(cleaned);
  }

  if (
    normalized.includes("send a proposal")
  ) {
    return "I would like to share the updated proposal, explain the expected value, and address any questions before moving forward.";
  }

  if (
    normalized.includes("book a meeting")
  ) {
    return "I would like to schedule a short conversation to review the key points and agree on the next steps.";
  }

  if (
    normalized.includes("follow up")
  ) {
    return "I wanted to confirm whether there are any open questions before we move forward.";
  }

  if (
    normalized.includes("advance the deal")
  ) {
    return "I would like to align on the next steps and confirm what is needed to keep the opportunity moving.";
  }

  if (
    normalized.includes(
      "recover an inactive opportunity"
    )
  ) {
    return "I wanted to see whether this initiative is still a priority and whether it would make sense to revisit it with an updated approach.";
  }

  if (
    normalized.includes(
      "introduce our company"
    )
  ) {
    return "I would like to briefly introduce how we work and explore whether we can support your current priorities.";
  }

  if (
    normalized.includes(
      "request documents"
    )
  ) {
    return "To continue the evaluation, I would appreciate it if you could share the remaining documentation.";
  }

  if (
    normalized.includes(
      "thank the customer"
    )
  ) {
    return "I wanted to thank you for your time, trust, and the information you have shared with us.";
  }

  return cleanSentence(cleaned);
};

const calculateContentScore = ({
  content,
  context,
  language,
}) => {
  const text = normalizeText(content);
  const lowerText =
    normalizeSearchText(text);

  if (!text) {
    return {
      score: 0,
      suggestions: [],
    };
  }

  let score = 35;
  const suggestions = [];

  if (
    context.contactFirstName &&
    lowerText.includes(
      normalizeSearchText(
        context.contactFirstName
      )
    )
  ) {
    score += 12;
  } else {
    suggestions.push(
      language === "es"
        ? "Personaliza el saludo con el nombre del contacto."
        : "Personalize the greeting with the contact's name."
    );
  }

  if (
    context.companyName &&
    lowerText.includes(
      normalizeSearchText(
        context.companyName
      )
    )
  ) {
    score += 10;
  } else {
    suggestions.push(
      language === "es"
        ? "Menciona la empresa para mejorar la personalización."
        : "Mention the company to improve personalization."
    );
  }

  const hasCallToAction =
    /meeting|call|next step|schedule|reunión|llamada|siguiente paso|coordinar/i.test(
      text
    );

  if (hasCallToAction) {
    score += 15;
  } else {
    suggestions.push(
      language === "es"
        ? "Agrega una llamada a la acción clara."
        : "Add a clear call to action."
    );
  }

  if (
    context.projectedRoi !== null &&
    text.includes(
      String(context.projectedRoi)
    )
  ) {
    score += 10;
  } else if (
    context.projectedRoi !== null
  ) {
    suggestions.push(
      language === "es"
        ? "Considera mencionar el ROI proyectado."
        : "Consider mentioning the projected ROI."
    );
  }

  if (
    context.dealValue &&
    text.includes(context.dealValue)
  ) {
    score += 8;
  }

  const wordCount =
    text.split(/\s+/).filter(Boolean).length;

  if (wordCount >= 55 && wordCount <= 220) {
    score += 10;
  } else if (wordCount > 220) {
    suggestions.push(
      language === "es"
        ? "El contenido podría ser más breve."
        : "The content could be more concise."
    );
  } else {
    suggestions.push(
      language === "es"
        ? "Agrega un poco más de contexto comercial."
        : "Add a little more commercial context."
    );
  }

  return {
    score: Math.min(score, 100),
    suggestions: suggestions.slice(0, 4),
  };
};

const generateContent = ({
  type,
  language,
  tone,
  objective,
  details,
  context,
  detailVariableKeys = [],
  variables = {},
}) => {
  const opening = getToneOpening(
    tone,
    language
  );

  const objectiveSentence =
    buildObjectiveSentence({
      objective,
      language,
      type,
    });

  const additionalDetails =
    cleanSentence(details);

  const businessValue =
    buildBusinessValueParagraph(
      context,
      language,
      tone,
      detailVariableKeys,
      variables,
      type
    );

  const closing = getToneClosing(
    tone,
    language,
    type
  );

  if (language === "es") {
    switch (type) {
      case "sales-email":
        return {
          subject: `Una propuesta para ${context.companyName}`,
          content: `Hola ${context.contactFirstName},

${opening}

Te contacto porque creo que podemos ayudar a ${context.companyName} a resolver ${context.businessProblem || "algunos de sus retos comerciales y operativos actuales"}.

${
  context.solutionSummary
    ? `La solución propuesta busca ${cleanSentence(
        context.solutionSummary
      )
        .replace(/\.$/, "")
        .replace(/^./, (character) =>
          character.toLowerCase()
        )}.`
    : "Nuestra propuesta centraliza la gestión de contactos, oportunidades, tareas y seguimientos, reduciendo trabajo manual y mejorando la visibilidad del equipo."
}

${businessValue}

${objectiveSentence}

${additionalDetails}

${closing}

Saludos,`,
        };

      case "follow-up":
        return {
          subject: `Seguimiento sobre ${context.dealName}`,
          content: `Hola ${context.contactFirstName},

${opening}

Quería retomar nuestra conversación sobre la iniciativa de ${context.dealName} para ${context.companyName}.

${objectiveSentence}

${businessValue}

${additionalDetails}

${closing}

Saludos,`,
        };

      case "whatsapp":
        return {
          subject: "Mensaje de WhatsApp",
          content: `Hola ${context.contactFirstName}, ¿cómo estás?

Quería hacer seguimiento a ${context.dealName}. ${objectiveSentence}

${businessValue}

${additionalDetails}

${closing}`,
        };

      case "meeting":
        return {
          subject: `Reunión sobre ${context.dealName}`,
          content: `Hola ${context.contactFirstName},

${opening}

Me gustaría invitarte a una reunión breve para revisar ${context.dealName} y alinear los próximos pasos.

La agenda propuesta sería:
• Revisar prioridades y necesidades actuales
• Aclarar preguntas sobre la propuesta
• Confirmar alcance, tiempos y responsables
• Acordar el siguiente paso comercial

${businessValue}

${additionalDetails}

Duración sugerida: 30 minutos.

¿Qué día y hora te resulta más conveniente?

Saludos,`,
        };

      case "proposal":
        return {
          subject: `Propuesta comercial — ${context.companyName}`,
          content: `PROPUESTA COMERCIAL

Cliente
${context.companyName}

Contacto principal
${context.contactName}

Oportunidad
${context.dealName}

1. Resumen ejecutivo

${
  context.solutionSummary
    ? cleanSentence(
        context.solutionSummary
      )
    : "Esta propuesta presenta una solución diseñada para mejorar la gestión comercial, centralizar la información y fortalecer el seguimiento de oportunidades."
}

2. Situación actual

${
  context.businessProblem
    ? cleanSentence(
        context.businessProblem
      )
    : "Actualmente existen oportunidades de mejora en visibilidad comercial, seguimiento, coordinación del equipo y automatización de tareas."
}

3. Objetivo

${objectiveSentence}

4. Alcance propuesto

• Gestión centralizada de contactos, empresas y oportunidades
• Seguimiento de tareas, actividades y comunicaciones
• Automatizaciones y recordatorios
• Inteligencia comercial y recomendaciones
• Generación asistida de mensajes, resúmenes y propuestas

5. Caso de negocio

${
  businessValue ||
  "El caso financiero se definirá con base en el alcance final, los procesos actuales y los resultados esperados."
}

${
  context.implementationCost
    ? `Costo estimado de implementación: ${context.implementationCost}.`
    : ""
}

${
  context.annualValue
    ? `Valor anual estimado: ${context.annualValue}.`
    : ""
}

${
  context.contractDuration
    ? `Duración estimada del contrato: ${context.contractDuration}.`
    : ""
}

6. Indicador de éxito

${
  context.successMetric
    ? cleanSentence(
        context.successMetric
      )
    : "Definir un indicador medible que permita evaluar el impacto comercial y operativo de la solución."
}

7. Próximos pasos

• Validar el alcance
• Confirmar responsables
• Resolver preguntas pendientes
• Aprobar la propuesta
• Programar la implementación

${additionalDetails}`,
        };

      case "executive-summary":
        return {
          subject: `Resumen ejecutivo — ${context.dealName}`,
          content: `RESUMEN EJECUTIVO

${context.companyName} está evaluando ${context.dealName}.

La oportunidad se encuentra actualmente en la etapa ${context.dealStage}${
  context.probability !== null
    ? `, con una probabilidad de cierre del ${context.probability}%`
    : ""
}.

${
  context.businessProblem
    ? `Problema principal: ${cleanSentence(
        context.businessProblem
      )}`
    : ""
}

${
  context.solutionSummary
    ? `Solución propuesta: ${cleanSentence(
        context.solutionSummary
      )}`
    : ""
}

${businessValue}

${
  context.expectedDealValue
    ? `Valor esperado del negocio: ${context.expectedDealValue}.`
    : ""
}

${
  context.successMetric
    ? `Indicador clave de éxito: ${cleanSentence(
        context.successMetric
      )}`
    : ""
}

${objectiveSentence}

${additionalDetails}`,
        };

      case "re-engagement":
        return {
          subject: `¿Retomamos ${context.dealName}?`,
          content: `Hola ${context.contactFirstName},

${opening}

Hace un tiempo conversamos sobre ${context.dealName} y quería saber si esta iniciativa sigue siendo relevante para ${context.companyName}.

${objectiveSentence}

${businessValue}

${additionalDetails}

${closing}

Saludos,`,
        };

      default:
        return {
          subject: "Contenido generado",
          content:
            "Selecciona un tipo de contenido para generar una respuesta.",
        };
    }
  }

  switch (type) {
    case "sales-email":
      return {
        subject: `A practical idea for ${context.companyName}`,
        content: `Hi ${context.contactFirstName},

${opening}

I'm reaching out because I believe we could help ${context.companyName} address ${context.businessProblem || "some of its current commercial and operational challenges"}.

${
  context.solutionSummary
    ? `The proposed solution is designed to ${cleanSentence(
        context.solutionSummary
      )
        .replace(/\.$/, "")
        .replace(/^./, (character) =>
          character.toLowerCase()
        )}.`
    : "Our solution centralizes contacts, opportunities, tasks, and follow-ups, reducing manual work and improving visibility across the team."
}

${businessValue}

${objectiveSentence}

${additionalDetails}

${closing}

Best regards,`,
      };

    case "follow-up":
      return {
        subject: `Following up on ${context.dealName}`,
        content: `Hi ${context.contactFirstName},

${opening}

I wanted to reconnect regarding the ${context.dealName} initiative for ${context.companyName}.

${objectiveSentence}

${businessValue}

${additionalDetails}

${closing}

Best regards,`,
      };

    case "whatsapp":
      return {
        subject: "WhatsApp message",
        content: `Hi ${context.contactFirstName}, how are you?

I wanted to follow up regarding ${context.dealName}. ${objectiveSentence}

${businessValue}

${additionalDetails}

${closing}`,
      };

    case "meeting":
      return {
        subject: `Meeting about ${context.dealName}`,
        content: `Hi ${context.contactFirstName},

${opening}

I would like to invite you to a brief meeting to review ${context.dealName} and align on the next steps.

Suggested agenda:
• Review current priorities and requirements
• Clarify questions about the proposal
• Confirm scope, timing, and stakeholders
• Agree on the next commercial step

${businessValue}

${additionalDetails}

Suggested duration: 30 minutes.

What day and time would work best for you?

Best regards,`,
      };

    case "proposal":
      return {
        subject: `Commercial proposal — ${context.companyName}`,
        content: `COMMERCIAL PROPOSAL

Client
${context.companyName}

Primary contact
${context.contactName}

Opportunity
${context.dealName}

1. Executive summary

${
  context.solutionSummary
    ? cleanSentence(
        context.solutionSummary
      )
    : "This proposal presents a solution designed to improve commercial management, centralize information, and strengthen opportunity follow-up."
}

2. Current situation

${
  context.businessProblem
    ? cleanSentence(
        context.businessProblem
      )
    : "There are opportunities to improve commercial visibility, follow-up consistency, team coordination, and task automation."
}

3. Objective

${objectiveSentence}

4. Proposed scope

• Centralized contact, company, and opportunity management
• Tasks, activities, and communication tracking
• Automations and reminders
• Commercial intelligence and recommendations
• Assisted generation of messages, summaries, and proposals

5. Business case

${
  businessValue ||
  "The financial case will be finalized based on scope, current processes, and expected outcomes."
}

${
  context.implementationCost
    ? `Estimated implementation cost: ${context.implementationCost}.`
    : ""
}

${
  context.annualValue
    ? `Estimated annual value: ${context.annualValue}.`
    : ""
}

${
  context.contractDuration
    ? `Estimated contract duration: ${context.contractDuration}.`
    : ""
}

6. Success metric

${
  context.successMetric
    ? cleanSentence(
        context.successMetric
      )
    : "Define a measurable success indicator to evaluate the commercial and operational impact of the solution."
}

7. Next steps

• Validate scope
• Confirm stakeholders
• Resolve open questions
• Approve the proposal
• Schedule implementation

${additionalDetails}`,
      };

    case "executive-summary":
      return {
        subject: `Executive summary — ${context.dealName}`,
        content: `EXECUTIVE SUMMARY

${context.companyName} is evaluating ${context.dealName}.

The opportunity is currently in the ${context.dealStage} stage${
  context.probability !== null
    ? ` with a ${context.probability}% probability of closing`
    : ""
}.

${
  context.businessProblem
    ? `Primary business problem: ${cleanSentence(
        context.businessProblem
      )}`
    : ""
}

${
  context.solutionSummary
    ? `Proposed solution: ${cleanSentence(
        context.solutionSummary
      )}`
    : ""
}

${businessValue}

${
  context.expectedDealValue
    ? `Expected deal value: ${context.expectedDealValue}.`
    : ""
}

${
  context.successMetric
    ? `Key success metric: ${cleanSentence(
        context.successMetric
      )}`
    : ""
}

${objectiveSentence}

${additionalDetails}`,
      };

    case "re-engagement":
      return {
        subject: `Reconnecting about ${context.dealName}`,
        content: `Hi ${context.contactFirstName},

${opening}

It has been a while since we discussed ${context.dealName}, and I wanted to check whether this initiative is still relevant for ${context.companyName}.

${objectiveSentence}

${businessValue}

${additionalDetails}

${closing}

Best regards,`,
      };

    default:
      return {
        subject: "Generated content",
        content:
          "Select a content type to generate a response.",
      };
  }
};

function AIWriter() {
  const toast = useToast();

  const objectiveInputRef = useRef(null);
  const detailsInputRef = useRef(null);

  const contacts = useMemo(
    () =>
      readStoredArray(STORAGE_KEYS.contacts),
    []
  );

  const companies = useMemo(
    () =>
      readStoredArray(STORAGE_KEYS.companies),
    []
  );

  const deals = useMemo(
    () =>
      readStoredArray(STORAGE_KEYS.deals),
    []
  );

  const settings = useMemo(
    () =>
      readStoredObject(STORAGE_KEYS.settings),
    []
  );

  const workspaceCurrency =
    settings.workspace?.currency || "USD";

  const [language, setLanguage] =
    useState(
      () =>
        localStorage.getItem(
          STORAGE_KEYS.language
        ) || "en"
    );

  const [writerType, setWriterType] =
    useState("sales-email");

  const [tone, setTone] =
    useState("professional");

  const [
    selectedContactId,
    setSelectedContactId,
  ] = useState("");

  const [
    selectedCompanyId,
    setSelectedCompanyId,
  ] = useState("");

  const [
    selectedDealId,
    setSelectedDealId,
  ] = useState("");

  const [objective, setObjective] =
    useState("");

  const [details, setDetails] =
    useState("");

  useEffect(() => {
    const handoffContext = readStoredObject(
      STORAGE_KEYS.context
    );

    if (
      !handoffContext ||
      Object.keys(handoffContext).length === 0
    ) {
      return;
    }

    if (handoffContext.contactId) {
      setSelectedContactId(
        String(handoffContext.contactId)
      );
    }

    if (handoffContext.companyId) {
      setSelectedCompanyId(
        String(handoffContext.companyId)
      );
    }

    if (handoffContext.dealId) {
      setSelectedDealId(
        String(handoffContext.dealId)
      );
    }

    if (
      handoffContext.writerType &&
      writerTypes.some(
        (type) =>
          type.id === handoffContext.writerType
      )
    ) {
      setWriterType(handoffContext.writerType);
    }

    if (handoffContext.objective) {
      setObjective(handoffContext.objective);
    }

    localStorage.removeItem(STORAGE_KEYS.context);
  }, []);

  const [activeVariableField, setActiveVariableField] =
    useState("details");

  const [
    generatedSubject,
    setGeneratedSubject,
  ] = useState("");

  const [
    generatedContent,
    setGeneratedContent,
  ] = useState("");

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const [
    savedTemplates,
    setSavedTemplates,
  ] = useState(() =>
    readStoredArray(STORAGE_KEYS.templates)
  );

  const [
    favoriteTemplateIds,
    setFavoriteTemplateIds,
  ] = useState(() =>
    readStoredArray(STORAGE_KEYS.favorites)
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");

  const [
    templateSearch,
    setTemplateSearch,
  ] = useState("");

  const selectedContact = contacts.find(
    (contact) =>
      String(contact.id) ===
      String(selectedContactId)
  );

  const selectedCompany = companies.find(
    (company) =>
      String(company.id) ===
      String(selectedCompanyId)
  );

  const selectedDeal = deals.find(
    (deal) =>
      String(deal.id) ===
      String(selectedDealId)
  );

  const currentWriterType =
    writerTypes.find(
      (type) => type.id === writerType
    ) || writerTypes[0];

  const currentContext = buildContext({
    contact: selectedContact,
    company: selectedCompany,
    deal: selectedDeal,
    currency: workspaceCurrency,
    language,
  });

  const currentVariables = useMemo(
    () =>
      buildTemplateVariables({
        contact: selectedContact,
        company: selectedCompany,
        deal: selectedDeal,
        currency:
          selectedDeal?.currency ||
          workspaceCurrency,
        language,
      }),
    [
      selectedContact,
      selectedCompany,
      selectedDeal,
      workspaceCurrency,
      language,
    ]
  );

  const filteredVariables = useMemo(
    () =>
      availableTemplateVariables.filter(
        (variable) => {
          const resolvedValue =
            currentVariables[variable.key];

          return (
            resolvedValue !== undefined &&
            resolvedValue !== null &&
            String(resolvedValue).trim() !== ""
          );
        }
      ),
    [currentVariables]
  );

  const groupedVariables = useMemo(
    () =>
      variableGroupDefinitions
        .map((group) => ({
          ...group,
          variables:
            filteredVariables.filter(
              (variable) =>
                group.prefixes.some(
                  (prefix) =>
                    variable.key === prefix ||
                    variable.key.startsWith(
                      prefix
                    )
                )
            ),
        }))
        .filter(
          (group) =>
            group.variables.length > 0
        ),
    [filteredVariables]
  );

  const filteredBuiltInTemplates =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearchText(templateSearch);

      return builtInTemplates
        .filter((template) => {
          if (
            selectedCategory !== "all" &&
            template.category !==
              selectedCategory
          ) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const category =
            getTemplateCategory(
              template.category
            );

          const searchableText =
            normalizeSearchText(
              [
                template.name,
                template.nameEs,
                template.description,
                template.descriptionEs,
                category?.label,
                category?.labelEs,
                template.writerType,
              ].join(" ")
            );

          return searchableText.includes(
            normalizedSearch
          );
        })
        .sort(
          (
            firstTemplate,
            secondTemplate
          ) => {
            const firstIsFavorite =
              favoriteTemplateIds.includes(
                firstTemplate.id
              );

            const secondIsFavorite =
              favoriteTemplateIds.includes(
                secondTemplate.id
              );

            if (
              firstIsFavorite !==
              secondIsFavorite
            ) {
              return firstIsFavorite ? -1 : 1;
            }

            return getTemplateDisplayName(
              firstTemplate,
              language
            ).localeCompare(
              getTemplateDisplayName(
                secondTemplate,
                language
              )
            );
          }
        );
    }, [
      selectedCategory,
      templateSearch,
      favoriteTemplateIds,
      language,
    ]);

  const contentScore = useMemo(
    () =>
      calculateContentScore({
        content: generatedContent,
        context: currentContext,
        language,
      }),
    [
      generatedContent,
      currentContext,
      language,
    ]
  );

  const toggleFavoriteTemplate = (
    templateId
  ) => {
    const updatedFavorites =
      favoriteTemplateIds.includes(templateId)
        ? favoriteTemplateIds.filter(
            (id) => id !== templateId
          )
        : [
            ...favoriteTemplateIds,
            templateId,
          ];

    setFavoriteTemplateIds(
      updatedFavorites
    );

    localStorage.setItem(
      STORAGE_KEYS.favorites,
      JSON.stringify(updatedFavorites)
    );
  };

  const handleUseBuiltInTemplate = (
    template
  ) => {
    const resolvedTemplate =
      resolveTemplate({
        subject: getTemplateSubject(
          template,
          language
        ),
        content: getTemplateContent(
          template,
          language
        ),
        contact: selectedContact,
        company: selectedCompany,
        deal: selectedDeal,
        currency:
          selectedDeal?.currency ||
          workspaceCurrency,
        language,
        keepUnknownVariables: true,
      });

    setWriterType(template.writerType);
    setTone(template.tone);
    setGeneratedSubject(
      resolvedTemplate.subject
    );
    setGeneratedContent(
      resolvedTemplate.content
    );

    toast.success(
      language === "es"
        ? "Plantilla aplicada"
        : "Template applied",
      language === "es"
        ? "Los datos disponibles del CRM fueron insertados automáticamente."
        : "Available CRM data was inserted automatically."
    );
  };

  const insertVariableAtCursor = (
    variable
  ) => {
    const isObjective =
      activeVariableField === "objective";

    const ref = isObjective
      ? objectiveInputRef
      : detailsInputRef;

    const currentValue = isObjective
      ? objective
      : details;

    const setValue = isObjective
      ? setObjective
      : setDetails;

    const element = ref.current;

    // Keep template tokens internal. In the editor, insert a clean,
    // human-readable CRM value so users never have to work with
    // developer-style {{variable}} syntax.
    const resolvedValue =
      currentVariables[variable.key];

    const variableLabel =
      language === "es"
        ? variable.labelEs
        : variable.label;

    const cleanValue =
      resolvedValue === undefined ||
      resolvedValue === null
        ? ""
        : String(resolvedValue).trim();

    const insertionValue = isObjective
      ? cleanValue
      : cleanValue
        ? `${variableLabel}: ${cleanValue}`
        : variableLabel;

    const token = insertionValue;

    const start =
      element?.selectionStart ??
      currentValue.length;

    const end =
      element?.selectionEnd ??
      currentValue.length;

    const prefix =
      start > 0 &&
      !/\s/.test(
        currentValue.charAt(start - 1)
      )
        ? " "
        : "";

    const suffix =
      end < currentValue.length &&
      !/\s/.test(
        currentValue.charAt(end)
      )
        ? " "
        : "";

    const nextValue =
      currentValue.slice(0, start) +
      prefix +
      token +
      suffix +
      currentValue.slice(end);

    setValue(nextValue);

    window.requestAnimationFrame(() => {
      const nextElement = ref.current;

      if (!nextElement) {
        return;
      }

      const cursorPosition =
        start +
        prefix.length +
        token.length +
        suffix.length;

      nextElement.focus();
      nextElement.setSelectionRange(
        cursorPosition,
        cursorPosition
      );
    });

    toast.success(
      language === "es"
        ? "Variable insertada"
        : "Variable inserted",
      `${variableLabel}${
        cleanValue ? `: ${cleanValue}` : ""
      } → ${
        isObjective
          ? language === "es"
            ? "Objetivo principal"
            : "Primary objective"
          : language === "es"
            ? "Detalles adicionales"
            : "Additional details"
      }`
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);

    window.setTimeout(() => {
      const resolvedObjective =
        resolveTemplateVariables(
          objective,
          currentVariables,
          {
            keepUnknownVariables: true,
          }
        );

      const rawResolvedDetails =
        resolveTemplateVariables(
          details,
          currentVariables,
          {
            keepUnknownVariables: true,
          }
        );

      const detailVariableKeys =
        getInsertedDetailVariableKeys(
          details,
          currentVariables,
          language
        );

      // Every Smart Variable is structured CRM data. Once selected, it is
      // either woven into the narrative by generateContent or intentionally
      // kept as internal context. It should never fall through as a raw
      // "Label: value" dump in Additional details.
      const autoIntegratedDetailKeys = detailVariableKeys;

      const resolvedDetails =
        sanitizeAdditionalDetails(
          details,
          rawResolvedDetails,
          currentVariables,
          language,
          detailVariableKeys.filter((key) =>
            autoIntegratedDetailKeys.includes(key)
          )
        );

      const result = generateContent({
        type: writerType,
        language,
        tone,
        objective: resolvedObjective,
        details: resolvedDetails,
        context: currentContext,
        detailVariableKeys,
        variables: currentVariables,
      });

      setGeneratedSubject(result.subject);
      let polishedContent = result.content
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      // If the deal owner was explicitly selected, use it as the signature
      // instead of exposing it as a CRM field in the body.
      if (
        detailVariableKeys.includes("deal_owner") &&
        currentVariables?.deal_owner
      ) {
        const ownerName = String(
          currentVariables.deal_owner
        ).trim();

        if (ownerName) {
          polishedContent =
            language === "es"
              ? polishedContent.replace(
                  /Saludos,\s*$/,
                  `Saludos,\n${ownerName}`
                )
              : polishedContent.replace(
                  /Best regards,\s*$/,
                  `Best regards,\n${ownerName}`
                );
        }
      }

      setGeneratedContent(polishedContent);
      setIsGenerating(false);

      toast.success(
        language === "es"
          ? "Contenido generado"
          : "Content generated",
        language === "es"
          ? `Se generó un texto ${getToneInstruction(
              tone,
              "es"
            )}.`
          : `A ${getToneInstruction(
              tone,
              "en"
            )} draft is ready.`
      );
    }, 650);
  };

  const handleCopy = async () => {
    if (!generatedContent) {
      return;
    }

    const fullContent = generatedSubject
      ? `${generatedSubject}\n\n${generatedContent}`
      : generatedContent;

    try {
      await navigator.clipboard.writeText(
        fullContent
      );

      toast.success(
        language === "es"
          ? "Contenido copiado"
          : "Content copied",
        language === "es"
          ? "El texto está listo para usar."
          : "The text is ready to use."
      );
    } catch {
      toast.error(
        language === "es"
          ? "No se pudo copiar"
          : "Could not copy",
        language === "es"
          ? "Selecciona el contenido manualmente."
          : "Please select the content manually."
      );
    }
  };

  const handleSaveTemplate = () => {
    if (!generatedContent) {
      return;
    }

    const newTemplate = {
      id: createId(),
      type: writerType,
      language,
      tone,
      contactId: selectedContactId,
      companyId: selectedCompanyId,
      dealId: selectedDealId,
      objective,
      details,
      subject: generatedSubject,
      content: generatedContent,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [
      newTemplate,
      ...savedTemplates,
    ];

    setSavedTemplates(updatedTemplates);

    localStorage.setItem(
      STORAGE_KEYS.templates,
      JSON.stringify(updatedTemplates)
    );

    toast.success(
      language === "es"
        ? "Plantilla guardada"
        : "Template saved",
      language === "es"
        ? "Puedes reutilizarla desde esta página."
        : "You can reuse it from this page."
    );
  };

  const handleDeleteTemplate = (
    templateId
  ) => {
    const updatedTemplates =
      savedTemplates.filter(
        (template) =>
          template.id !== templateId
      );

    setSavedTemplates(updatedTemplates);

    localStorage.setItem(
      STORAGE_KEYS.templates,
      JSON.stringify(updatedTemplates)
    );
  };

  const handleLoadTemplate = (
    template
  ) => {
    setWriterType(template.type);
    setLanguage(template.language);
    setTone(template.tone);

    setSelectedContactId(
      template.contactId || ""
    );
    setSelectedCompanyId(
      template.companyId || ""
    );
    setSelectedDealId(
      template.dealId || ""
    );

    setObjective(template.objective || "");
    setDetails(template.details || "");

    setGeneratedSubject(
      template.subject || ""
    );
    setGeneratedContent(
      template.content || ""
    );
  };

  const clearOutput = () => {
    setGeneratedSubject("");
    setGeneratedContent("");
  };

  const handleLanguageChange = () => {
    const nextLanguage =
      language === "en" ? "es" : "en";

    setLanguage(nextLanguage);

    localStorage.setItem(
      STORAGE_KEYS.language,
      nextLanguage
    );
  };

  return (
    <div className="ai-writer-page">
      <header className="ai-writer-page__header">
        <div>
          <span className="ai-writer-page__eyebrow">
            <Sparkles size={15} />
            FlowCRM AI
          </span>

          <h1>AI Writer</h1>

          <p>
            {language === "es"
              ? "Crea correos, mensajes, propuestas y resúmenes comerciales utilizando datos reales del CRM."
              : "Create emails, messages, proposals, and commercial summaries using real CRM data."}
          </p>
        </div>

        <button
          type="button"
          className="ai-writer-page__language"
          onClick={handleLanguageChange}
        >
          <Languages size={18} />

          {language === "en"
            ? "Español"
            : "English"}
        </button>
      </header>

      <section className="ai-writer-templates">
        <div className="ai-writer-templates__header">
          <div>
            <BriefcaseBusiness size={18} />

            <span>
              <strong>
                {language === "es"
                  ? "Plantillas profesionales"
                  : "Professional templates"}
              </strong>

              <small>
                {
                  filteredBuiltInTemplates.length
                }{" "}
                {language === "es"
                  ? "plantillas"
                  : "templates"}
              </small>
            </span>
          </div>
        </div>

        <div className="ai-writer-toolbar">
          <input
            type="text"
            value={templateSearch}
            placeholder={
              language === "es"
                ? "Buscar plantilla..."
                : "Search template..."
            }
            onChange={(event) =>
              setTemplateSearch(
                event.target.value
              )
            }
          />

          <div className="ai-writer-select">
            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value
                )
              }
            >
              <option value="all">
                {language === "es"
                  ? "Todas las categorías"
                  : "All categories"}
              </option>

              {templateCategories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {language === "es"
                      ? category.labelEs
                      : category.label}
                  </option>
                )
              )}
            </select>

            <ChevronDown size={16} />
          </div>
        </div>

        <div className="ai-writer-template-grid">
          {filteredBuiltInTemplates.map(
            (template) => {
              const category =
                getTemplateCategory(
                  template.category
                );

              const favorite =
                favoriteTemplateIds.includes(
                  template.id
                );

              return (
                <article
                  key={template.id}
                  className="ai-writer-template-card"
                >
                  <div>
                    <span>
                      {language === "es"
                        ? category?.labelEs
                        : category?.label}
                    </span>

                    <strong>
                      {getTemplateDisplayName(
                        template,
                        language
                      )}
                    </strong>

                    <p>
                      {getTemplateDescription(
                        template,
                        language
                      )}
                    </p>
                  </div>

                  <div className="ai-writer-template-card__actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleUseBuiltInTemplate(
                          template
                        )
                      }
                    >
                      {language === "es"
                        ? "Usar"
                        : "Use"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleFavoriteTemplate(
                          template.id
                        )
                      }
                    >
                      {favorite ? "★" : "☆"}
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>

      <section className="ai-writer-type-grid">
        {writerTypes.map((type) => {
          const Icon = type.icon;
          const isSelected =
            type.id === writerType;

          return (
            <button
              type="button"
              key={type.id}
              className={`ai-writer-type-card ${
                isSelected
                  ? "ai-writer-type-card--selected"
                  : ""
              }`}
              onClick={() =>
                setWriterType(type.id)
              }
            >
              <span className="ai-writer-type-card__icon">
                <Icon size={19} />
              </span>

              <span>
                <strong>
                  {language === "es"
                    ? type.labelEs
                    : type.label}
                </strong>

                <small>
                  {language === "es"
                    ? type.descriptionEs
                    : type.description}
                </small>
              </span>

              {isSelected && (
                <Check size={17} />
              )}
            </button>
          );
        })}
      </section>

      <div className="ai-writer-layout">
        <section className="ai-writer-panel">
          <div className="ai-writer-panel__heading">
            <div>
              <WandSparkles size={18} />

              <span>
                <strong>
                  {language === "es"
                    ? "Configurar contenido"
                    : "Configure content"}
                </strong>

                <small>
                  {language === "es"
                    ? "Selecciona información del CRM para personalizar el resultado."
                    : "Select CRM information to personalize the result."}
                </small>
              </span>
            </div>
          </div>

          <div className="ai-writer-form">
            <label>
              <span>
                {language === "es"
                  ? "Contacto"
                  : "Contact"}
              </span>

              <div className="ai-writer-select">
                <select
                  value={selectedContactId}
                  disabled={
                    contacts.length === 0
                  }
                  onChange={(event) =>
                    setSelectedContactId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    {contacts.length === 0
                      ? language === "es"
                        ? "No hay contactos disponibles"
                        : "No contacts available"
                      : language === "es"
                        ? "Seleccionar contacto"
                        : "Select contact"}
                  </option>

                  {contacts.map(
                    (contact) => (
                      <option
                        key={contact.id}
                        value={contact.id}
                      >
                        {getContactName(
                          contact
                        )}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown size={16} />
              </div>
            </label>

            <label>
              <span>
                {language === "es"
                  ? "Empresa"
                  : "Company"}
              </span>

              <div className="ai-writer-select">
                <select
                  value={selectedCompanyId}
                  disabled={
                    companies.length === 0
                  }
                  onChange={(event) =>
                    setSelectedCompanyId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    {companies.length === 0
                      ? language === "es"
                        ? "No hay empresas disponibles"
                        : "No companies available"
                      : language === "es"
                        ? "Seleccionar empresa"
                        : "Select company"}
                  </option>

                  {companies.map(
                    (company) => (
                      <option
                        key={company.id}
                        value={company.id}
                      >
                        {getCompanyName(
                          company
                        )}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown size={16} />
              </div>
            </label>

            <label>
              <span>
                {language === "es"
                  ? "Negocio"
                  : "Deal"}
              </span>

              <div className="ai-writer-select">
                <select
                  value={selectedDealId}
                  disabled={
                    deals.length === 0
                  }
                  onChange={(event) =>
                    setSelectedDealId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    {deals.length === 0
                      ? language === "es"
                        ? "No hay negocios disponibles"
                        : "No deals available"
                      : language === "es"
                        ? "Seleccionar negocio"
                        : "Select deal"}
                  </option>

                  {deals.map((deal) => (
                    <option
                      key={deal.id}
                      value={deal.id}
                    >
                      {getDealName(deal)}
                    </option>
                  ))}
                </select>

                <ChevronDown size={16} />
              </div>
            </label>

            <label>
              <span>
                {language === "es"
                  ? "Tono"
                  : "Tone"}
              </span>

              <div className="ai-writer-select">
                <select
                  value={tone}
                  onChange={(event) =>
                    setTone(
                      event.target.value
                    )
                  }
                >
                  {toneOptions.map(
                    (toneOption) => (
                      <option
                        key={
                          toneOption.value
                        }
                        value={
                          toneOption.value
                        }
                      >
                        {language === "es"
                          ? toneOption.labelEs
                          : toneOption.label}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown size={16} />
              </div>
            </label>

            <label className="ai-writer-form__full">
              <span>
                {language === "es"
                  ? "Objetivo principal"
                  : "Primary objective"}
              </span>

              <input
                ref={objectiveInputRef}
                type="text"
                value={objective}
                placeholder={
                  language === "es"
                    ? "Ej. Agendar una llamada para revisar la propuesta"
                    : "Example: Schedule a call to review the proposal"
                }
                onFocus={() =>
                  setActiveVariableField(
                    "objective"
                  )
                }
                onChange={(event) =>
                  setObjective(
                    event.target.value
                  )
                }
              />

              <div className="ai-writer-objective-chips">
                {quickObjectives.map(
                  (item) => {
                    const label =
                      language === "es"
                        ? item.es
                        : item.en;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={
                          objective === label
                            ? "ai-writer-objective-chip ai-writer-objective-chip--active"
                            : "ai-writer-objective-chip"
                        }
                        onClick={() =>
                          setObjective(label)
                        }
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>
            </label>

            <label className="ai-writer-form__full">
              <span>
                {language === "es"
                  ? "Detalles adicionales"
                  : "Additional details"}
              </span>

              <textarea
                ref={detailsInputRef}
                rows="4"
                value={details}
                placeholder={
                  language === "es"
                    ? "Incluye condiciones, fechas, beneficios o contexto adicional."
                    : "Include conditions, dates, benefits, or additional context."
                }
                onFocus={() =>
                  setActiveVariableField(
                    "details"
                  )
                }
                onChange={(event) =>
                  setDetails(
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <section className="ai-writer-variables">
            <div className="ai-writer-variables__header">
              <div>
                <Sparkles size={15} />

                <span>
                  <strong>
                    {language === "es"
                      ? "Variables inteligentes del CRM"
                      : "CRM smart variables"}
                  </strong>

                  <small>
                    {language === "es"
                      ? `Haz clic para insertar en ${
                          activeVariableField ===
                          "objective"
                            ? "Objetivo principal"
                            : "Detalles adicionales"
                        }`
                      : `Click to insert into ${
                          activeVariableField ===
                          "objective"
                            ? "Primary objective"
                            : "Additional details"
                        }`}
                  </small>
                </span>
              </div>
            </div>

            <div className="ai-writer-variable-groups">
              {groupedVariables.map(
                (group) => (
                  <div
                    className="ai-writer-variable-group"
                    key={group.id}
                  >
                    <div className="ai-writer-variable-group__title">
                      {language === "es"
                        ? group.labelEs
                        : group.label}
                    </div>

                    <div className="ai-writer-variables__grid">
                      {group.variables.map(
                        (variable) => {
                          const resolvedValue =
                            currentVariables[
                              variable.key
                            ];

                          return (
                            <button
                              type="button"
                              key={variable.key}
                              title={`${
                                language ===
                                "es"
                                  ? "Insertar"
                                  : "Insert"
                              } ${
                                language === "es"
                                  ? variable.labelEs
                                  : variable.label
                              }${
                                resolvedValue
                                  ? `: ${resolvedValue}`
                                  : ""
                              }`}
                              onClick={() =>
                                insertVariableAtCursor(
                                  variable
                                )
                              }
                            >
                              <span className="ai-writer-variable-card__label">
                                {language === "es"
                                  ? variable.labelEs
                                  : variable.label}
                              </span>

                              <small>
                                {resolvedValue}
                              </small>

                              <span
                                className="ai-writer-variable-card__insert"
                                aria-hidden="true"
                              >
                                +
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          <button
            type="button"
            className="ai-writer-generate"
            disabled={isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <RefreshCw
                size={18}
                className="ai-writer-spin"
              />
            ) : (
              <Sparkles size={18} />
            )}

            {isGenerating
              ? language === "es"
                ? "Generando..."
                : "Generating..."
              : language === "es"
                ? "Generar contenido"
                : "Generate content"}
          </button>
        </section>

        <section className="ai-writer-output">
          <div className="ai-writer-output__header">
            <div>
              <FileText size={18} />

              <span>
                <strong>
                  {language === "es"
                    ? "Resultado"
                    : "Generated output"}
                </strong>

                <small>
                  {language === "es"
                    ? currentWriterType.labelEs
                    : currentWriterType.label}
                </small>
              </span>
            </div>

            <div className="ai-writer-output__actions">
              <button
                type="button"
                title={
                  language === "es"
                    ? "Copiar"
                    : "Copy"
                }
                disabled={!generatedContent}
                onClick={handleCopy}
              >
                <Clipboard size={16} />
              </button>

              <button
                type="button"
                title={
                  language === "es"
                    ? "Guardar plantilla"
                    : "Save template"
                }
                disabled={!generatedContent}
                onClick={
                  handleSaveTemplate
                }
              >
                <Save size={16} />
              </button>

              <button
                type="button"
                title={
                  language === "es"
                    ? "Limpiar"
                    : "Clear"
                }
                disabled={!generatedContent}
                onClick={clearOutput}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {generatedContent ? (
            <>
              <div className="ai-writer-score">
                <div className="ai-writer-score__top">
                  <div>
                    <span>
                      {language === "es"
                        ? "Puntuación del contenido"
                        : "Content score"}
                    </span>

                    <strong>
                      {contentScore.score}/100
                    </strong>
                  </div>

                  <div
                    className="ai-writer-score__bar"
                    aria-label={`Content score ${contentScore.score} out of 100`}
                  >
                    <span
                      style={{
                        width: `${contentScore.score}%`,
                      }}
                    />
                  </div>
                </div>

                {contentScore.suggestions.length >
                  0 && (
                  <div className="ai-writer-score__suggestions">
                    {contentScore.suggestions.map(
                      (suggestion) => (
                        <span key={suggestion}>
                          {suggestion}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="ai-writer-document">
                <label>
                  {language === "es"
                    ? "Asunto o título"
                    : "Subject or title"}

                  <input
                    type="text"
                    value={generatedSubject}
                    onChange={(event) =>
                      setGeneratedSubject(
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  {language === "es"
                    ? "Contenido"
                    : "Content"}

                  <textarea
                    value={generatedContent}
                    onChange={(event) =>
                      setGeneratedContent(
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            </>
          ) : (
            <div className="ai-writer-empty">
              <span>
                <WandSparkles size={30} />
              </span>

              <strong>
                {language === "es"
                  ? "Tu contenido aparecerá aquí"
                  : "Your content will appear here"}
              </strong>

              <p>
                {language === "es"
                  ? "Selecciona una plantilla o genera un borrador con los datos del CRM."
                  : "Select a template or generate a draft using CRM data."}
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="ai-writer-templates">
        <div className="ai-writer-templates__header">
          <div>
            <Save size={18} />

            <span>
              <strong>
                {language === "es"
                  ? "Mis plantillas"
                  : "My templates"}
              </strong>

              <small>
                {language === "es"
                  ? `${savedTemplates.length} plantillas guardadas`
                  : `${savedTemplates.length} saved templates`}
              </small>
            </span>
          </div>
        </div>

        {savedTemplates.length > 0 ? (
          <div className="ai-writer-template-grid">
            {savedTemplates.map(
              (template) => {
                const type =
                  writerTypes.find(
                    (item) =>
                      item.id ===
                      template.type
                  );

                return (
                  <article
                    className="ai-writer-template-card"
                    key={template.id}
                  >
                    <div>
                      <span>
                        {template.language ===
                        "es"
                          ? type?.labelEs
                          : type?.label}
                      </span>

                      <strong>
                        {template.subject ||
                          (language === "es"
                            ? "Sin título"
                            : "Untitled")}
                      </strong>

                      <p>
                        {template.content}
                      </p>
                    </div>

                    <div className="ai-writer-template-card__actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleLoadTemplate(
                            template
                          )
                        }
                      >
                        {language === "es"
                          ? "Usar"
                          : "Use"}
                      </button>

                      <button
                        type="button"
                        aria-label={
                          language === "es"
                            ? "Eliminar"
                            : "Delete"
                        }
                        onClick={() =>
                          handleDeleteTemplate(
                            template.id
                          )
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <div className="ai-writer-templates__empty">
            {language === "es"
              ? "Todavía no has guardado plantillas."
              : "You have not saved any templates yet."}
          </div>
        )}
      </section>
    </div>
  );
}

export default AIWriter;
