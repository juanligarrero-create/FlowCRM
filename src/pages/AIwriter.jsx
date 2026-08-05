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
  Search,
  Sparkles,
  Trash2,
  UserRound,
  WandSparkles,
} from "lucide-react";
import {
  useMemo,
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
      "Create a concise and natural message for WhatsApp.",
    descriptionEs:
      "Crea un mensaje breve y natural para WhatsApp.",
    icon: MessageCircle,
  },
  {
    id: "meeting",
    label: "Meeting invitation",
    labelEs: "Invitación a reunión",
    description:
      "Invite a prospect or customer to a meeting.",
    descriptionEs:
      "Invita a un prospecto o cliente a una reunión.",
    icon: CalendarDays,
  },
  {
    id: "proposal",
    label: "Commercial proposal",
    labelEs: "Propuesta comercial",
    description:
      "Generate a structured proposal with value, pricing, and next steps.",
    descriptionEs:
      "Genera una propuesta estructurada con valor, precio y próximos pasos.",
    icon: FileText,
  },
  {
    id: "re-engagement",
    label: "Re-engagement",
    labelEs: "Reactivación",
    description:
      "Reconnect with a cold or inactive lead.",
    descriptionEs:
      "Retoma el contacto con un prospecto frío o inactivo.",
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
    es: "Agendar reunión",
  },
  {
    id: "followup",
    en: "Follow up",
    es: "Hacer seguimiento",
  },
  {
    id: "close",
    en: "Close the deal",
    es: "Cerrar el negocio",
  },
  {
    id: "proposal",
    en: "Send a proposal",
    es: "Enviar propuesta",
  },
  {
    id: "recover",
    en: "Recover inactive customer",
    es: "Recuperar cliente",
  },
  {
    id: "intro",
    en: "Introduce our company",
    es: "Presentar la empresa",
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
    return String(value || 0);
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

const buildContext = ({
  contact,
  company,
  deal,
  currency,
  language,
}) => ({
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

  dealValue: deal
    ? formatCurrency(
        deal.value,
        currency,
        language
      )
    : null,

  dealStage:
    deal?.stage ||
    (language === "es"
      ? "en proceso"
      : "in progress"),
});

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
    const generateContent = ({
  type,
  language,
  tone,
  objective,
  details,
  context,
}) => {
  const toneInstruction =
    getToneInstruction(tone, language);

  const objectiveText =
    normalizeText(objective);

  const additionalDetails =
    normalizeText(details);

  if (language === "es") {
    switch (type) {
      case "sales-email":
        return {
          subject: `Una idea para ${context.companyName}`,
          content: `Hola ${context.contactFirstName},

Espero que estés muy bien.

Quería contactarte porque creo que podemos ayudar a ${context.companyName} a mejorar sus procesos comerciales y reducir el trabajo manual del equipo.

Nuestra solución centraliza contactos, oportunidades, tareas, campañas y seguimientos en una sola plataforma, con herramientas de inteligencia que ayudan a identificar prioridades y próximos pasos.

${objectiveText || "Me gustaría conocer mejor sus necesidades actuales y mostrarte cómo podríamos aportar valor."}

${
  additionalDetails
    ? `Información adicional:\n${additionalDetails}\n`
    : ""
}
¿Tendrías disponibilidad para una conversación breve esta semana?

Quedo atento.

Saludos,`,
        };

      case "follow-up":
        return {
          subject: `Seguimiento: ${context.dealName}`,
          content: `Hola ${context.contactFirstName},

Quería hacer seguimiento a nuestra conversación sobre ${context.dealName}.

${
  context.dealValue
    ? `La oportunidad actualmente tiene un valor estimado de ${context.dealValue} y se encuentra en la etapa ${context.dealStage}.`
    : ""
}

${objectiveText || "Quería confirmar si tuviste la oportunidad de revisar la información que compartimos."}

${
  additionalDetails
    ? `Información adicional:\n${additionalDetails}\n`
    : ""
}
Quedo atento a cualquier pregunta. También podemos coordinar una llamada breve para revisar los próximos pasos.

Saludos,`,
        };

      case "whatsapp":
  return {
    subject: "Mensaje de WhatsApp",
    content: `Hola ${context.contactFirstName}, ¿cómo estás?

Quería hacer seguimiento a ${context.dealName}. ${
      objectiveText ||
      "¿Tuviste la oportunidad de revisar la información?"
    }

${
  additionalDetails
    ? `${additionalDetails}`
    : ""
}

Quedo atento a cualquier pregunta y con gusto coordinamos los próximos pasos.`,
  };

      case "meeting":
        return {
          subject: `Reunión sobre ${context.dealName}`,
          content: `Hola ${context.contactFirstName},

Me gustaría invitarte a una reunión breve para revisar ${context.dealName} y resolver cualquier pregunta pendiente.

Objetivo de la reunión:

${objectiveText || "Revisar necesidades, propuesta y próximos pasos."}

${
  additionalDetails
    ? `Información adicional:\n${additionalDetails}\n`
    : ""
}
Duración sugerida: 30 minutos.

Por favor, indícame qué día y hora te resulta más conveniente.

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

1. Resumen ejecutivo

Esta propuesta presenta una solución para mejorar la gestión comercial, centralizar la información de clientes y fortalecer el seguimiento de oportunidades.

2. Objetivo

${
  objectiveText ||
  "Implementar una herramienta sencilla y eficiente que permita al equipo comercial trabajar con mayor organización, visibilidad y velocidad."
}

3. Solución propuesta

• Gestión centralizada de contactos y empresas
• Pipeline visual de oportunidades
• Tareas, recordatorios y seguimiento comercial
• Campañas y automatizaciones
• Inteligencia comercial y recomendaciones
• Generación asistida de mensajes y propuestas

4. Valor de la propuesta

${
  context.dealValue ||
  "El valor final se definirá según el alcance, número de usuarios e integraciones requeridas."
}

5. Cronograma sugerido

Semana 1: configuración y personalización

Semana 2: migración de datos y capacitación

Semana 3: pruebas y ajustes

Semana 4: lanzamiento y seguimiento

6. Próximos pasos

• Confirmar alcance
• Definir responsables
• Aprobar propuesta
• Programar implementación

${additionalDetails}`,
        };

      case "re-engagement":
        return {
          subject: "¿Retomamos la conversación?",
          content: `Hola ${context.contactFirstName},

Hace un tiempo conversamos sobre ${context.dealName} y quería retomar el contacto.

Entiendo que las prioridades pueden cambiar, por eso quería preguntarte si este proyecto sigue siendo relevante para ${context.companyName}.

${objectiveText || "Si todavía existe interés, podemos revisar nuevamente las necesidades y adaptar la propuesta."}

${
  additionalDetails
    ? `Información adicional:\n${additionalDetails}\n`
    : ""
}
Quedo atento.

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
    subject: `An idea for ${context.companyName}`,
    content: `Hi ${context.contactFirstName},

I hope you are doing well.

I am reaching out because I believe we could help ${context.companyName} improve its sales processes and reduce manual work.

Our solution brings contacts, opportunities, tasks, campaigns, and follow-ups into one platform, supported by intelligent recommendations that help teams identify priorities and next actions.

${objectiveText || "I would like to understand your current needs and show you how we could add value."}

${
  additionalDetails
    ? `Additional details:\n${additionalDetails}\n`
    : ""
}
Would you be available for a short conversation this week?

Best regards,`,
  };

    case "follow-up":
  return {
    subject: `Following up on ${context.dealName}`,
    content: `Hi ${context.contactFirstName},

I hope you're doing well.

I'm following up regarding ${context.dealName}.

${objectiveText || "I wanted to check whether you had a chance to review the information we shared."}

${
  additionalDetails
    ? `Additional details:\n${additionalDetails}\n`
    : ""
}

Please let me know if you have any questions or would like to schedule a quick call.

Best regards,`,
  };

  case "whatsapp":
  return {
    subject: "WhatsApp message",
    content: `Hi ${context.contactFirstName}, how are you?

I wanted to follow up regarding ${context.dealName}. ${
      objectiveText ||
      "Have you had a chance to review the information?"
    }

${
  additionalDetails
    ? `${additionalDetails}`
    : ""
}

I'm looking forward to your feedback and would be happy to discuss the next steps.`,
  };

    case "meeting":
  return {
    subject: `Meeting about ${context.dealName}`,
    content: `Hi ${context.contactFirstName},

I would like to invite you to a brief meeting to discuss ${context.dealName}.

Meeting objective:
${objectiveText || "Review current needs and discuss possible next steps."}

${
  additionalDetails
    ? `Additional details:\n${additionalDetails}\n`
    : ""
}

Suggested duration: 30 minutes.

Please let me know what time works best for you.

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

1. Executive summary

This proposal presents a solution designed to improve commercial management, centralize customer information, and strengthen opportunity follow-up.

2. Objective

${
  objectiveText ||
  "Implement a simple and efficient platform that helps the sales team work with greater organization, visibility, and speed."
}

3. Proposed solution

• Centralized contact and company management
• Visual opportunity pipeline
• Tasks, reminders, and sales follow-up
• Campaigns and automations
• Commercial intelligence and recommendations
• Assisted message and proposal generation

4. Proposal value

${
  context.dealValue ||
  "Final pricing will depend on scope, users, and required integrations."
}

5. Suggested timeline

Week 1: configuration and customization

Week 2: data migration and training

Week 3: testing and adjustments

Week 4: launch and follow-up

6. Next steps

• Confirm scope
• Define stakeholders
• Approve proposal
• Schedule implementation

${additionalDetails}`,
      };

    case "re-engagement":
  return {
    subject: `Reconnecting with ${context.companyName}`,
    content: `Hi ${context.contactFirstName},

I hope you're doing well.

It's been a while since we last spoke, and I wanted to reconnect.

${objectiveText || "If you're still interested, I'd be happy to revisit your needs and discuss how we can help."}

${
  additionalDetails
    ? `Additional details:\n${additionalDetails}\n`
    : ""
}

Looking forward to hearing from you.

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
    useState("en");

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
        currency: workspaceCurrency,
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
        .sort((firstTemplate, secondTemplate) => {
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
        });
    }, [
      selectedCategory,
      templateSearch,
      favoriteTemplateIds,
      language,
    ]);

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
    const templateLanguage = language;

    const resolvedTemplate =
      resolveTemplate({
        subject: getTemplateSubject(
          template,
          templateLanguage
        ),
        content: getTemplateContent(
          template,
          templateLanguage
        ),
        contact: selectedContact,
        company: selectedCompany,
        deal: selectedDeal,
        currency: workspaceCurrency,
        language: templateLanguage,
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

const resolvedDetails =
  resolveTemplateVariables(
    details,
    currentVariables,
    {
      keepUnknownVariables: true,
    }
  );

const result = generateContent({
  type: writerType,
  language,
  tone,
  objective: resolvedObjective,
  details: resolvedDetails,
  context: currentContext,
});

      setGeneratedSubject(result.subject);
      setGeneratedContent(result.content);
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

  const handleDeleteTemplate = (templateId) => {
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

 const handleLoadTemplate = (template) => {
  setWriterType(template.type);
  setLanguage(template.language);
  setTone(template.tone);

  setSelectedContactId(template.contactId || "");
  setSelectedCompanyId(template.companyId || "");
  setSelectedDealId(template.dealId || "");

  setObjective(template.objective || "");
  setDetails(template.Details || "");

  setGeneratedSubject(template.subject);
  setGeneratedContent(template.content);
};

  const clearOutput = () => {
    setGeneratedSubject("");
    setGeneratedContent("");
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
              ? "Crea correos, mensajes y propuestas utilizando IA y los datos del CRM."
              : "Create emails, WhatsApp messages and proposals using AI and CRM data."}
          </p>

        </div>

        <button
          type="button"
          className="ai-writer-page__language"
          onClick={() =>
            setLanguage((currentLanguage) =>
              currentLanguage === "en"
                ? "es"
                : "en"
            )
          }
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
                {filteredBuiltInTemplates.length}
                {" "}
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
  disabled={contacts.length === 0}
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

                  {contacts.map((contact) => (
                    <option
                      key={contact.id}
                      value={contact.id}
                    >
                      {getContactName(contact)}
                    </option>
                  ))}
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
  disabled={companies.length === 0}
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

                  {companies.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {getCompanyName(company)}
                    </option>
                  ))}
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
  disabled={deals.length === 0}
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
                    setTone(event.target.value)
                  }
                >
                  {toneOptions.map(
                    (toneOption) => (
                      <option
                        key={toneOption.value}
                        value={toneOption.value}
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
                type="text"
                value={objective}
                placeholder={
                  language === "es"
                    ? "Ej. Agendar una llamada para revisar la propuesta"
                    : "Example: Schedule a call to review the proposal"
                }
                onChange={(event) =>
                  setObjective(
                    event.target.value
                  )
                }
              />
              <div className="ai-writer-objective-chips">
  {quickObjectives.map((item) => (
    <button
      type="button"
      key={item.id}
      className={
        objective ===
        (language === "es"
          ? item.es
          : item.en)
          ? "ai-writer-objective-chip ai-writer-objective-chip--active"
          : "ai-writer-objective-chip"
      }
      onClick={() =>
        setObjective(
          language === "es"
            ? item.es
            : item.en
        )
      }
    >
      {language === "es"
        ? item.es
        : item.en}
    </button>
  ))}
</div>
            </label>

            <label className="ai-writer-form__full">
              <span>
                {language === "es"
                  ? "Detalles adicionales"
                  : "Additional details"}
              </span>

              <textarea
                rows="4"
                value={details}
                placeholder={
                  language === "es"
                    ? "Incluye condiciones, fechas, beneficios o contexto adicional."
                    : "Include conditions, dates, benefits, or additional context."
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

                <strong>
                  {language === "es"
                    ? "Variables disponibles"
                    : "Available variables"}
                </strong>
              </div>

              <small>
                {language === "es"
                  ? "Haz clic para copiar"
                  : "Click to copy"}
              </small>
            </div>

            <div className="ai-writer-variables__grid">
              {availableTemplateVariables.map(
                (variable) => {
                  const resolvedValue =
                    currentVariables[
                      variable.key
                    ];

                  return (
                    <button
                      type="button"
                      key={variable.key}
                      title={
                        resolvedValue ||
                        variable.token
                      }
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            variable.token
                          );

                          toast.success(
                            language === "es"
                              ? "Variable copiada"
                              : "Variable copied",
                            variable.token
                          );
                        } catch {
                          toast.error(
                            language === "es"
                              ? "No se pudo copiar"
                              : "Could not copy",
                            variable.token
                          );
                        }
                      }}
                    >
                      <code>
                        {variable.token}
                      </code>

                      <span>
                        {language === "es"
                          ? variable.labelEs
                          : variable.label}
                      </span>

                      {resolvedValue && (
                        <small>
                          {resolvedValue}
                        </small>
                      )}
                    </button>
                  );
                }
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
                onClick={handleSaveTemplate}
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