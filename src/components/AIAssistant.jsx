import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Languages,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useToast } from "./ToastProvider.jsx";
import "./AIAssistant.css";

const STORAGE_KEYS = {
  contacts: "flowcrm-contacts",
  companies: "flowcrm-companies",
  deals: "flowcrm-deals",
  tasks: "flowcrm-tasks",
  campaigns: "flowcrm-campaigns",
  automations: "flowcrm-automations",
  settings: "flowcrm-settings",
  messages: "flowcrm-ai-messages",
  language: "flowcrm-ai-language",
};

const ACTIVE_DEAL_STAGES = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
];

const PAGE_CONFIG = [
  {
    key: "dashboard",
    match: (pathname) => pathname === "/",
    route: "/",
    labels: {
      en: "Dashboard",
      es: "Dashboard",
    },
  },
  {
    key: "contacts",
    match: (pathname) =>
      pathname.startsWith("/contacts"),
    route: "/contacts",
    labels: {
      en: "Contacts",
      es: "Contactos",
    },
  },
  {
    key: "companies",
    match: (pathname) =>
      pathname.startsWith("/companies"),
    route: "/companies",
    labels: {
      en: "Companies",
      es: "Empresas",
    },
  },
  {
    key: "deals",
    match: (pathname) =>
      pathname.startsWith("/deals"),
    route: "/deals",
    labels: {
      en: "Deals",
      es: "Negocios",
    },
  },
  {
    key: "tasks",
    match: (pathname) =>
      pathname.startsWith("/tasks"),
    route: "/tasks",
    labels: {
      en: "Tasks",
      es: "Tareas",
    },
  },
  {
    key: "whatsapp",
    match: (pathname) =>
      pathname.startsWith("/whatsapp"),
    route: "/whatsapp",
    labels: {
      en: "WhatsApp",
      es: "WhatsApp",
    },
  },
  {
    key: "campaigns",
    match: (pathname) =>
      pathname.startsWith("/campaigns"),
    route: "/campaigns",
    labels: {
      en: "Campaigns",
      es: "Campañas",
    },
  },
  {
    key: "automations",
    match: (pathname) =>
      pathname.startsWith("/automations"),
    route: "/automations",
    labels: {
      en: "Automations",
      es: "Automatizaciones",
    },
  },
  {
    key: "analytics",
    match: (pathname) =>
      pathname.startsWith("/analytics"),
    route: "/analytics",
    labels: {
      en: "Analytics",
      es: "Analítica",
    },
  },
  {
    key: "settings",
    match: (pathname) =>
      pathname.startsWith("/settings"),
    route: "/settings",
    labels: {
      en: "Settings",
      es: "Configuración",
    },
  },
];

const readStoredArray = (key) => {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(savedValue);

    return Array.isArray(parsedValue)
      ? parsedValue
      : [];
  } catch {
    return [];
  }
};

const readStoredObject = (key) => {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(savedValue);

    return parsedValue &&
      typeof parsedValue === "object" &&
      !Array.isArray(parsedValue)
      ? parsedValue
      : {};
  } catch {
    return {};
  }
};

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeStatus = (value = "") =>
  normalizeText(value);

const createMessageId = () =>
  typeof crypto !== "undefined" &&
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const parseDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
};

const getDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}`;
};

const getDaysDifference = (dateValue) => {
  const parsedDate = parseDate(dateValue);

  if (!parsedDate) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);

  return Math.round(
    (parsedDate.getTime() -
      startOfToday().getTime()) /
      86400000
  );
};

const getDaysSince = (dateValue) => {
  const parsedDate = parseDate(dateValue);

  if (!parsedDate) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);

  return Math.floor(
    (startOfToday().getTime() -
      parsedDate.getTime()) /
      86400000
  );
};

const getFirstAvailableDate = (
  record,
  fields
) => {
  for (const field of fields) {
    if (record?.[field]) {
      return record[field];
    }
  }

  return null;
};

const getContactName = (record) =>
  record?.name ||
  record?.fullName ||
  record?.contact ||
  record?.contactName ||
  record?.title ||
  "Unknown";

const getCompanyName = (record) =>
  record?.company ||
  record?.companyName ||
  record?.name ||
  "Unknown";

const getDealContactName = (deal) =>
  deal?.contact ||
  deal?.contactName ||
  deal?.customer ||
  deal?.company ||
  deal?.companyName ||
  deal?.title ||
  "Customer";

const isCompletedTask = (task) => {
  const status = normalizeStatus(task?.status);

  return (
    status === "completed" ||
    status === "complete" ||
    status === "done" ||
    status === "completada" ||
    status === "completado"
  );
};

const isActiveStatus = (statusValue) => {
  const status = normalizeStatus(statusValue);

  return (
    status === "active" ||
    status === "activo" ||
    status === "activa" ||
    status === "running"
  );
};

const isActiveDeal = (deal) => {
  const stage = normalizeStatus(deal?.stage);

  if (!stage) {
    return true;
  }

  return ![
    "won",
    "lost",
    "ganado",
    "ganada",
    "perdido",
    "perdida",
  ].includes(stage);
};

const isWonDeal = (deal) =>
  ["won", "ganado", "ganada"].includes(
    normalizeStatus(deal?.stage)
  );

const isLostDeal = (deal) =>
  ["lost", "perdido", "perdida"].includes(
    normalizeStatus(deal?.stage)
  );

const formatCurrency = (
  value,
  currency = "USD",
  language = "en"
) => {
  const locale =
    language === "es" ? "es-CO" : "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  } catch {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }
};

const formatPercentage = (value) =>
  `${Math.round(Number(value || 0))}%`;

const detectSpanishPrompt = (prompt) =>
  /[¿¡]|\b(que|qué|cual|cuál|cuales|cuáles|como|cómo|negocio|negocios|tarea|tareas|cliente|clientes|empresa|empresas|resumen|resume|priorizar|prioridad|vencida|vencidas|seguimiento|salud|ventas|campana|campaña|automatizacion|automatización|ingresos|riesgo|estancado|inactivo|contacto|hoy|hora)\b/i.test(
    prompt
  );

const languageCopy = {
  en: {
    assistantName: "FlowCRM Copilot",
    status: "Context-aware CRM intelligence",
    placeholder: "Ask FlowCRM Copilot...",
    send: "Send message",
    close: "Close AI Copilot",
    minimize: "Minimize AI Copilot",
    clear: "Clear conversation",
    thinking: "Analyzing your CRM...",
    health: "CRM health",
    quickActions: "Suggested for this page",
    localNotice:
      "Portfolio mode: insights are generated locally from your CRM data.",
    noData:
      "I do not have enough CRM data to answer that yet.",
    cleared: "Conversation cleared",
    copied: "Response copied",
    switchLanguage: "Switch language",
    pageContext: "Current page",
  },
  es: {
    assistantName: "Copiloto de FlowCRM",
    status: "Inteligencia contextual del CRM",
    placeholder:
      "Pregúntale al Copiloto de FlowCRM...",
    send: "Enviar mensaje",
    close: "Cerrar el copiloto",
    minimize: "Minimizar el copiloto",
    clear: "Borrar conversación",
    thinking: "Analizando tu CRM...",
    health: "Salud del CRM",
    quickActions:
      "Sugerencias para esta página",
    localNotice:
      "Modo portafolio: los análisis se generan localmente con los datos del CRM.",
    noData:
      "Todavía no tengo suficientes datos en el CRM para responder eso.",
    cleared: "Conversación borrada",
    copied: "Respuesta copiada",
    switchLanguage: "Cambiar idioma",
    pageContext: "Página actual",
  },
};

const baseQuickPrompts = {
  en: [
    {
      id: "summary",
      label: "Summarize CRM",
      icon: Sparkles,
      prompt: "Summarize my CRM",
    },
    {
      id: "priority",
      label: "Today's priorities",
      icon: Target,
      prompt:
        "What should I prioritize today?",
    },
    {
      id: "one-hour",
      label: "Plan one hour",
      icon: Clock3,
      prompt:
        "I only have one hour today. What should I do?",
    },
    {
      id: "health",
      label: "CRM health",
      icon: TrendingUp,
      prompt: "How healthy is my CRM?",
    },
  ],
  es: [
    {
      id: "summary",
      label: "Resumir CRM",
      icon: Sparkles,
      prompt: "Resume mi CRM",
    },
    {
      id: "priority",
      label: "Prioridades de hoy",
      icon: Target,
      prompt:
        "¿Qué debería priorizar hoy?",
    },
    {
      id: "one-hour",
      label: "Planear una hora",
      icon: Clock3,
      prompt:
        "Solo tengo una hora hoy. ¿Qué debería hacer?",
    },
    {
      id: "health",
      label: "Salud del CRM",
      icon: TrendingUp,
      prompt:
        "¿Qué tan saludable está mi CRM?",
    },
  ],
};

const pageQuickPrompts = {
  dashboard: {
    en: [
      {
        id: "briefing",
        label: "Morning briefing",
        icon: Zap,
        prompt: "Give me today's briefing",
      },
      {
        id: "forecast",
        label: "Revenue forecast",
        icon: BarChart3,
        prompt: "Show my revenue forecast",
      },
    ],
    es: [
      {
        id: "briefing",
        label: "Resumen del día",
        icon: Zap,
        prompt: "Dame el resumen de hoy",
      },
      {
        id: "forecast",
        label: "Pronóstico de ingresos",
        icon: BarChart3,
        prompt:
          "Muéstrame el pronóstico de ingresos",
      },
    ],
  },
  deals: {
    en: [
      {
        id: "risk",
        label: "Deals at risk",
        icon: AlertTriangle,
        prompt: "Which deals are at risk?",
      },
      {
        id: "stalled",
        label: "Stalled deals",
        icon: Clock3,
        prompt: "Show stalled deals",
      },
      {
        id: "largest",
        label: "Largest deals",
        icon: CircleDollarSign,
        prompt: "Show my largest deals",
      },
      {
        id: "forecast",
        label: "Revenue forecast",
        icon: BarChart3,
        prompt: "Show my revenue forecast",
      },
    ],
    es: [
      {
        id: "risk",
        label: "Negocios en riesgo",
        icon: AlertTriangle,
        prompt:
          "¿Qué negocios están en riesgo?",
      },
      {
        id: "stalled",
        label: "Negocios estancados",
        icon: Clock3,
        prompt:
          "Muéstrame los negocios estancados",
      },
      {
        id: "largest",
        label: "Negocios más grandes",
        icon: CircleDollarSign,
        prompt:
          "Muéstrame los negocios más grandes",
      },
      {
        id: "forecast",
        label: "Pronóstico de ingresos",
        icon: BarChart3,
        prompt:
          "Muéstrame el pronóstico de ingresos",
      },
    ],
  },
  contacts: {
    en: [
      {
        id: "inactive",
        label: "Inactive contacts",
        icon: UserRound,
        prompt: "Show inactive contacts",
      },
      {
        id: "valuable-contact",
        label: "Most valuable contact",
        icon: CircleDollarSign,
        prompt:
          "Which contact has the highest deal value?",
      },
      {
        id: "follow-up",
        label: "Write follow-up",
        icon: MessageCircle,
        prompt:
          "Write a WhatsApp follow-up message",
      },
    ],
    es: [
      {
        id: "inactive",
        label: "Contactos inactivos",
        icon: UserRound,
        prompt:
          "Muéstrame los contactos inactivos",
      },
      {
        id: "valuable-contact",
        label: "Contacto más valioso",
        icon: CircleDollarSign,
        prompt:
          "¿Qué contacto tiene el mayor valor en negocios?",
      },
      {
        id: "follow-up",
        label: "Crear seguimiento",
        icon: MessageCircle,
        prompt:
          "Escribe un seguimiento para WhatsApp",
      },
    ],
  },
  companies: {
    en: [
      {
        id: "companies-summary",
        label: "Company summary",
        icon: BriefcaseBusiness,
        prompt: "Summarize my companies",
      },
      {
        id: "companies-no-contacts",
        label: "Missing contacts",
        icon: Users,
        prompt:
          "Which companies have no contacts?",
      },
    ],
    es: [
      {
        id: "companies-summary",
        label: "Resumen de empresas",
        icon: BriefcaseBusiness,
        prompt: "Resume mis empresas",
      },
      {
        id: "companies-no-contacts",
        label: "Sin contactos",
        icon: Users,
        prompt:
          "¿Qué empresas no tienen contactos?",
      },
    ],
  },
  tasks: {
    en: [
      {
        id: "overdue",
        label: "Overdue tasks",
        icon: ClipboardList,
        prompt: "Which tasks are overdue?",
      },
      {
        id: "today-tasks",
        label: "Due today",
        icon: Clock3,
        prompt: "Which tasks are due today?",
      },
      {
        id: "task-plan",
        label: "Prioritize tasks",
        icon: Target,
        prompt:
          "Prioritize my active tasks",
      },
    ],
    es: [
      {
        id: "overdue",
        label: "Tareas vencidas",
        icon: ClipboardList,
        prompt:
          "¿Qué tareas están vencidas?",
      },
      {
        id: "today-tasks",
        label: "Vencen hoy",
        icon: Clock3,
        prompt:
          "¿Qué tareas vencen hoy?",
      },
      {
        id: "task-plan",
        label: "Priorizar tareas",
        icon: Target,
        prompt:
          "Prioriza mis tareas activas",
      },
    ],
  },
};
const getInitialMessages = (
  language,
  userName
) => [
  {
    id: createMessageId(),
    role: "assistant",
    type: "welcome",
    createdAt: new Date().toISOString(),
    title:
      language === "es"
        ? `Hola, ${userName}.`
        : `Hello, ${userName}.`,
    content:
      language === "es"
        ? "Estoy listo para analizar tu CRM y recomendarte la siguiente mejor acción."
        : "I am ready to analyze your CRM and recommend the next best action.",
  },
];

function AIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const briefingShownRef = useRef(false);

  const settings = useMemo(
    () =>
      readStoredObject(STORAGE_KEYS.settings),
    []
  );

  const userName =
    settings.profile?.fullName
      ?.trim()
      ?.split(" ")[0] || "Juan";

  const workspaceCurrency =
    settings.workspace?.currency || "USD";

  const [language, setLanguage] = useState(
    () =>
      localStorage.getItem(
        STORAGE_KEYS.language
      ) || "en"
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] =
    useState(false);
  const [inputValue, setInputValue] =
    useState("");
  const [isThinking, setIsThinking] =
    useState(false);
  const [showQuickActions, setShowQuickActions] =
    useState(true);

  const [messages, setMessages] = useState(
    () => {
      const savedMessages = localStorage.getItem(
        STORAGE_KEYS.messages
      );

      if (savedMessages) {
        try {
          const parsedMessages =
            JSON.parse(savedMessages);

          if (
            Array.isArray(parsedMessages) &&
            parsedMessages.length > 0
          ) {
            return parsedMessages;
          }
        } catch {
          return getInitialMessages(
            "en",
            userName
          );
        }
      }

      return getInitialMessages(
        language,
        userName
      );
    }
  );

  const currentPage = useMemo(
    () =>
      PAGE_CONFIG.find((page) =>
        page.match(location.pathname)
      ) || PAGE_CONFIG[0],
    [location.pathname]
  );

  const crmData = useMemo(
    () => ({
      contacts: readStoredArray(
        STORAGE_KEYS.contacts
      ),
      companies: readStoredArray(
        STORAGE_KEYS.companies
      ),
      deals: readStoredArray(
        STORAGE_KEYS.deals
      ),
      tasks: readStoredArray(
        STORAGE_KEYS.tasks
      ),
      campaigns: readStoredArray(
        STORAGE_KEYS.campaigns
      ),
      automations: readStoredArray(
        STORAGE_KEYS.automations
      ),
    }),
    [
      isOpen,
      messages.length,
      location.pathname,
    ]
  );

  const crmInsights = useMemo(() => {
    const {
      contacts,
      companies,
      deals,
      tasks,
      campaigns,
      automations,
    } = crmData;

    const activeDeals =
      deals.filter(isActiveDeal);
    const wonDeals = deals.filter(isWonDeal);
    const lostDeals =
      deals.filter(isLostDeal);

    const activeTasks = tasks.filter(
      (task) => !isCompletedTask(task)
    );

    const completedTasks = tasks.filter(
      isCompletedTask
    );

    const activePipeline = activeDeals.reduce(
      (total, deal) =>
        total + Number(deal.value || 0),
      0
    );

    const weightedPipeline =
      activeDeals.reduce((total, deal) => {
        const probability = Math.max(
          0,
          Math.min(
            100,
            Number(deal.probability || 0)
          )
        );

        return (
          total +
          Number(deal.value || 0) *
            (probability / 100)
        );
      }, 0);

    const wonRevenue = wonDeals.reduce(
      (total, deal) =>
        total + Number(deal.value || 0),
      0
    );

    const overdueTasks = activeTasks
      .filter((task) => {
        const difference = getDaysDifference(
          task.dueDate
        );

        return (
          difference !== null &&
          difference < 0
        );
      })
      .sort(
        (firstTask, secondTask) =>
          getDaysDifference(firstTask.dueDate) -
          getDaysDifference(secondTask.dueDate)
      );

    const dueTodayTasks = activeTasks.filter(
      (task) =>
        task.dueDate === getDateString()
    );

    const dueSoonTasks = activeTasks
      .filter((task) => {
        const difference = getDaysDifference(
          task.dueDate
        );

        return (
          difference !== null &&
          difference >= 0 &&
          difference <= 3
        );
      })
      .sort(
        (firstTask, secondTask) =>
          getDaysDifference(firstTask.dueDate) -
          getDaysDifference(secondTask.dueDate)
      );

    const highPriorityTasks =
      activeTasks.filter((task) =>
        ["high", "alta", "alto"].includes(
          normalizeStatus(task.priority)
        )
      );

    const closingSoonDeals = activeDeals
      .filter((deal) => {
        const difference = getDaysDifference(
          deal.closeDate
        );

        return (
          difference !== null &&
          difference >= 0 &&
          difference <= 7
        );
      })
      .sort(
        (firstDeal, secondDeal) =>
          Number(secondDeal.value || 0) -
          Number(firstDeal.value || 0)
      );

    const overdueDeals = activeDeals.filter(
      (deal) => {
        const difference = getDaysDifference(
          deal.closeDate
        );

        return (
          difference !== null &&
          difference < 0
        );
      }
    );

    const stalledDeals = activeDeals
      .map((deal) => {
        const activityDate =
          getFirstAvailableDate(deal, [
            "lastActivity",
            "lastActivityAt",
            "updatedAt",
            "modifiedAt",
            "createdAt",
          ]);

        const daysInactive =
          getDaysSince(activityDate);

        return {
          ...deal,
          daysInactive:
            daysInactive === null
              ? 0
              : daysInactive,
        };
      })
      .filter(
        (deal) => deal.daysInactive >= 7
      )
      .sort(
        (firstDeal, secondDeal) =>
          secondDeal.daysInactive -
          firstDeal.daysInactive
      );

    const atRiskDeals = activeDeals
      .map((deal) => {
        const closeDifference =
          getDaysDifference(deal.closeDate);

        const activityDate =
          getFirstAvailableDate(deal, [
            "lastActivity",
            "lastActivityAt",
            "updatedAt",
            "modifiedAt",
            "createdAt",
          ]);

        const daysInactive =
          getDaysSince(activityDate) || 0;

        const probability = Number(
          deal.probability || 0
        );

        let riskScore = 0;
        const riskReasons = [];

        if (
          closeDifference !== null &&
          closeDifference < 0
        ) {
          riskScore += 40;
          riskReasons.push("overdue close date");
        } else if (
          closeDifference !== null &&
          closeDifference <= 7
        ) {
          riskScore += 15;
          riskReasons.push("closing soon");
        }

        if (daysInactive >= 14) {
          riskScore += 35;
          riskReasons.push(
            `${daysInactive} days inactive`
          );
        } else if (daysInactive >= 7) {
          riskScore += 20;
          riskReasons.push(
            `${daysInactive} days inactive`
          );
        }

        if (probability < 25) {
          riskScore += 20;
          riskReasons.push("low probability");
        } else if (probability < 50) {
          riskScore += 10;
        }

        if (
          normalizeStatus(deal.priority) ===
          "high"
        ) {
          riskScore += 5;
        }

        return {
          ...deal,
          riskScore,
          riskReasons,
          daysInactive,
        };
      })
      .filter((deal) => deal.riskScore >= 25)
      .sort(
        (firstDeal, secondDeal) =>
          secondDeal.riskScore -
          firstDeal.riskScore
      );

    const largestDeals = [...activeDeals]
      .sort(
        (firstDeal, secondDeal) =>
          Number(secondDeal.value || 0) -
          Number(firstDeal.value || 0)
      )
      .slice(0, 5);

    const inactiveContacts = contacts
      .map((contact) => {
        const activityDate =
          getFirstAvailableDate(contact, [
            "lastActivity",
            "lastActivityAt",
            "lastContacted",
            "updatedAt",
            "modifiedAt",
            "createdAt",
          ]);

        const daysInactive =
          getDaysSince(activityDate);

        return {
          ...contact,
          daysInactive:
            daysInactive === null
              ? 0
              : daysInactive,
        };
      })
      .filter(
        (contact) =>
          contact.daysInactive >= 14
      )
      .sort(
        (firstContact, secondContact) =>
          secondContact.daysInactive -
          firstContact.daysInactive
      );

    const contactsWithDealValue =
      contacts
        .map((contact) => {
          const contactName = normalizeText(
            getContactName(contact)
          );

          const relatedDeals = deals.filter(
            (deal) =>
              normalizeText(
                getDealContactName(deal)
              ) === contactName
          );

          return {
            ...contact,
            totalDealValue:
              relatedDeals.reduce(
                (total, deal) =>
                  total +
                  Number(deal.value || 0),
                0
              ),
            relatedDeals,
          };
        })
        .sort(
          (firstContact, secondContact) =>
            secondContact.totalDealValue -
            firstContact.totalDealValue
        );

    const companiesWithoutContacts =
      companies.filter((company) => {
        const companyName = normalizeText(
          getCompanyName(company)
        );

        return !contacts.some(
          (contact) =>
            normalizeText(
              contact.company ||
                contact.companyName
            ) === companyName
        );
      });

    const activeCampaigns =
      campaigns.filter((campaign) =>
        isActiveStatus(campaign.status)
      );

    const activeAutomations =
      automations.filter((automation) =>
        isActiveStatus(automation.status)
      );

    const taskCompletionRate =
      tasks.length === 0
        ? 0
        : Math.round(
            (completedTasks.length /
              tasks.length) *
              100
          );

    const winRate =
      wonDeals.length + lostDeals.length === 0
        ? 0
        : Math.round(
            (wonDeals.length /
              (wonDeals.length +
                lostDeals.length)) *
              100
          );

    const forecast30Days =
      activeDeals.reduce((total, deal) => {
        const difference = getDaysDifference(
          deal.closeDate
        );

        if (
          difference === null ||
          difference < 0 ||
          difference > 30
        ) {
          return total;
        }

        const probability = Math.max(
          0,
          Math.min(
            100,
            Number(deal.probability || 0)
          )
        );

        return (
          total +
          Number(deal.value || 0) *
            (probability / 100)
        );
      }, 0);

    let healthScore = 100;

    healthScore -= Math.min(
      overdueTasks.length * 7,
      28
    );

    healthScore -= Math.min(
      atRiskDeals.length * 5,
      20
    );

    healthScore -= Math.min(
      stalledDeals.length * 3,
      15
    );

    if (activeDeals.length === 0) {
      healthScore -= 20;
    }

    if (
      tasks.length > 0 &&
      taskCompletionRate < 50
    ) {
      healthScore -= 10;
    }

    if (
      activeDeals.length > 0 &&
      weightedPipeline === 0
    ) {
      healthScore -= 8;
    }

    healthScore = Math.max(
      0,
      Math.min(100, healthScore)
    );

    return {
      contacts,
      companies,
      deals,
      tasks,
      campaigns,
      automations,
      activeDeals,
      wonDeals,
      lostDeals,
      activeTasks,
      completedTasks,
      activePipeline,
      weightedPipeline,
      wonRevenue,
      overdueTasks,
      dueTodayTasks,
      dueSoonTasks,
      highPriorityTasks,
      closingSoonDeals,
      overdueDeals,
      stalledDeals,
      atRiskDeals,
      largestDeals,
      inactiveContacts,
      contactsWithDealValue,
      companiesWithoutContacts,
      activeCampaigns,
      activeAutomations,
      taskCompletionRate,
      winRate,
      forecast30Days,
      healthScore,
    };
  }, [crmData]);

  const contextualQuickPrompts =
    useMemo(() => {
      const pagePrompts =
        pageQuickPrompts[currentPage.key]?.[
          language
        ] || [];

      return [
        ...pagePrompts,
        ...baseQuickPrompts[language],
      ].slice(0, 6);
    }, [currentPage.key, language]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.messages,
      JSON.stringify(messages)
    );
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.language,
      language
    );
  }, [language]);

  useEffect(() => {
    if (!isOpen || isMinimized) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    isThinking,
    isOpen,
    isMinimized,
  ]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 240);
    }
  }, [isOpen, isMinimized]);

  const copy = languageCopy[language];

  const buildPriorityItems = (
    isSpanish,
    oneHourMode = false
  ) => {
    const items = [];

    if (crmInsights.overdueTasks.length > 0) {
      const topTask =
        crmInsights.overdueTasks[0];

      items.push(
        isSpanish
          ? `Resolver primero "${topTask.title}". Es la tarea vencida más urgente.`
          : `Resolve "${topTask.title}" first. It is your most urgent overdue task.`
      );
    }

    if (crmInsights.atRiskDeals.length > 0) {
      const deal =
        crmInsights.atRiskDeals[0];

      items.push(
        isSpanish
          ? `Hacer seguimiento al negocio "${deal.title}" por ${formatCurrency(
              deal.value,
              workspaceCurrency,
              "es"
            )}. Su nivel de riesgo es ${deal.riskScore}/100.`
          : `Follow up on "${deal.title}" worth ${formatCurrency(
              deal.value,
              workspaceCurrency,
              "en"
            )}. Its risk score is ${deal.riskScore}/100.`
      );
    } else if (
      crmInsights.closingSoonDeals.length > 0
    ) {
      const deal =
        crmInsights.closingSoonDeals[0];

      items.push(
        isSpanish
          ? `Avanzar el negocio "${deal.title}", que cierra pronto y vale ${formatCurrency(
              deal.value,
              workspaceCurrency,
              "es"
            )}.`
          : `Advance "${deal.title}", which closes soon and is worth ${formatCurrency(
              deal.value,
              workspaceCurrency,
              "en"
            )}.`
      );
    }

    if (
      crmInsights.inactiveContacts.length > 0
    ) {
      const contact =
        crmInsights.inactiveContacts[0];

      items.push(
        isSpanish
          ? `Contactar a ${getContactName(
              contact
            )}, sin actividad durante ${contact.daysInactive} días.`
          : `Contact ${getContactName(
              contact
            )}, inactive for ${contact.daysInactive} days.`
      );
    }

    if (items.length === 0) {
      items.push(
        isSpanish
          ? "No hay alertas urgentes. Dedica el tiempo a mover oportunidades activas hacia la siguiente etapa."
          : "There are no urgent alerts. Use the time to move active opportunities to their next stage."
      );
    }

    return oneHourMode
      ? items.slice(0, 3)
      : items;
  };
  const createAssistantResponse = (
    userPrompt
  ) => {
    const prompt = normalizeText(userPrompt);
    const responseLanguage =
      detectSpanishPrompt(userPrompt)
        ? "es"
        : language;
    const isSpanish =
      responseLanguage === "es";
    const insights = crmInsights;
    const currency = workspaceCurrency;

    const money = (value) =>
      formatCurrency(
        value,
        currency,
        responseLanguage
      );

    if (
      prompt.includes("briefing") ||
      prompt.includes("resumen de hoy") ||
      prompt.includes("today's briefing") ||
      prompt.includes("todays briefing")
    ) {
      const recommendations =
        buildPriorityItems(isSpanish).slice(
          0,
          3
        );

      return {
        title: isSpanish
          ? `Resumen de hoy para ${userName}`
          : `Today's briefing for ${userName}`,
        content: [
          isSpanish
            ? `Salud del CRM: ${insights.healthScore}/100`
            : `CRM health: ${insights.healthScore}/100`,
          isSpanish
            ? `Pipeline activo: ${money(
                insights.activePipeline
              )}`
            : `Active pipeline: ${money(
                insights.activePipeline
              )}`,
          isSpanish
            ? `Pronóstico ponderado a 30 días: ${money(
                insights.forecast30Days
              )}`
            : `Weighted 30-day forecast: ${money(
                insights.forecast30Days
              )}`,
          isSpanish
            ? `Tareas vencidas: ${insights.overdueTasks.length}`
            : `Overdue tasks: ${insights.overdueTasks.length}`,
          isSpanish
            ? `Negocios en riesgo: ${insights.atRiskDeals.length}`
            : `Deals at risk: ${insights.atRiskDeals.length}`,
          "",
          isSpanish
            ? "Recomendaciones:"
            : "Recommendations:",
          ...recommendations.map(
            (item, index) =>
              `${index + 1}. ${item}`
          ),
        ].join("\n"),
        route:
          insights.overdueTasks.length > 0
            ? "/tasks"
            : "/deals",
        routeLabel: isSpanish
          ? "Abrir prioridad"
          : "Open priority",
      };
    }

    if (
      prompt.includes("summary") ||
      prompt.includes("resumen") ||
      prompt.includes("resume mi crm") ||
      prompt.includes("summarize")
    ) {
      return {
        title: isSpanish
          ? "Resumen del CRM"
          : "CRM summary",
        content: isSpanish
          ? `Tienes ${insights.contacts.length} contactos, ${insights.companies.length} empresas, ${insights.activeDeals.length} negocios activos y ${insights.activeTasks.length} tareas pendientes. El pipeline activo vale ${money(
              insights.activePipeline
            )}, con un valor ponderado de ${money(
              insights.weightedPipeline
            )}. Hay ${insights.atRiskDeals.length} negocios en riesgo, ${insights.stalledDeals.length} estancados y ${insights.overdueTasks.length} tareas vencidas.`
          : `You have ${insights.contacts.length} contacts, ${insights.companies.length} companies, ${insights.activeDeals.length} active deals, and ${insights.activeTasks.length} pending tasks. Your active pipeline is worth ${money(
              insights.activePipeline
            )}, with a weighted value of ${money(
              insights.weightedPipeline
            )}. There are ${insights.atRiskDeals.length} deals at risk, ${insights.stalledDeals.length} stalled deals, and ${insights.overdueTasks.length} overdue tasks.`,
        route: "/",
        routeLabel: isSpanish
          ? "Abrir dashboard"
          : "Open dashboard",
      };
    }

    if (
      prompt.includes("one hour") ||
      prompt.includes("una hora") ||
      prompt.includes("solo tengo una hora")
    ) {
      const items = buildPriorityItems(
        isSpanish,
        true
      );

      return {
        title: isSpanish
          ? "Plan de trabajo para una hora"
          : "One-hour action plan",
        content: items
          .map((item, index) => {
            const minutes =
              index === 0
                ? 25
                : index === 1
                  ? 20
                  : 15;

            return `${minutes} min — ${item}`;
          })
          .join("\n"),
        route:
          insights.overdueTasks.length > 0
            ? "/tasks"
            : "/deals",
        routeLabel: isSpanish
          ? "Comenzar"
          : "Start now",
      };
    }

    if (
      prompt.includes("priorit") ||
      prompt.includes("what should i do") ||
      prompt.includes("que deberia hacer") ||
      prompt.includes("qué debería hacer")
    ) {
      const items =
        buildPriorityItems(isSpanish);

      return {
        title: isSpanish
          ? "Prioridades recomendadas"
          : "Recommended priorities",
        content: items
          .map(
            (item, index) =>
              `${index + 1}. ${item}`
          )
          .join("\n"),
        route:
          insights.overdueTasks.length > 0
            ? "/tasks"
            : "/deals",
        routeLabel: isSpanish
          ? "Abrir prioridad"
          : "Open priority",
      };
    }

    if (
      prompt.includes("forecast") ||
      prompt.includes("pronostico") ||
      prompt.includes("pronóstico") ||
      prompt.includes("revenue")
    ) {
      return {
        title: isSpanish
          ? "Pronóstico de ingresos"
          : "Revenue forecast",
        content: [
          isSpanish
            ? `Pipeline activo: ${money(
                insights.activePipeline
              )}`
            : `Active pipeline: ${money(
                insights.activePipeline
              )}`,
          isSpanish
            ? `Pipeline ponderado: ${money(
                insights.weightedPipeline
              )}`
            : `Weighted pipeline: ${money(
                insights.weightedPipeline
              )}`,
          isSpanish
            ? `Pronóstico ponderado a 30 días: ${money(
                insights.forecast30Days
              )}`
            : `Weighted 30-day forecast: ${money(
                insights.forecast30Days
              )}`,
          isSpanish
            ? `Ingresos ganados: ${money(
                insights.wonRevenue
              )}`
            : `Won revenue: ${money(
                insights.wonRevenue
              )}`,
          isSpanish
            ? `Tasa de cierre: ${insights.winRate}%`
            : `Win rate: ${insights.winRate}%`,
        ].join("\n"),
        route: "/analytics",
        routeLabel: isSpanish
          ? "Abrir analítica"
          : "Open analytics",
      };
    }

    if (
      prompt.includes("at risk") ||
      prompt.includes("en riesgo") ||
      prompt.includes("riesgo")
    ) {
      if (insights.atRiskDeals.length === 0) {
        return {
          title: isSpanish
            ? "No hay negocios en riesgo"
            : "No deals at risk",
          content: isSpanish
            ? "No detecté oportunidades con una combinación preocupante de inactividad, baja probabilidad o fecha de cierre vencida."
            : "I found no opportunities with a concerning combination of inactivity, low probability, or an overdue close date.",
          route: "/deals",
          routeLabel: isSpanish
            ? "Abrir negocios"
            : "Open deals",
        };
      }

      const list = insights.atRiskDeals
        .slice(0, 5)
        .map((deal, index) => {
          const reasons = deal.riskReasons
            .join(", ")
            .replace(
              "overdue close date",
              isSpanish
                ? "fecha de cierre vencida"
                : "overdue close date"
            )
            .replace(
              "low probability",
              isSpanish
                ? "baja probabilidad"
                : "low probability"
            )
            .replace(
              "closing soon",
              isSpanish
                ? "cierre próximo"
                : "closing soon"
            );

          return `${index + 1}. ${
            deal.title
          } — ${money(
            deal.value
          )} · ${
            isSpanish
              ? "riesgo"
              : "risk"
          } ${deal.riskScore}/100 · ${reasons}`;
        })
        .join("\n");

      return {
        title: isSpanish
          ? "Negocios en riesgo"
          : "Deals at risk",
        content: list,
        route: "/deals",
        routeLabel: isSpanish
          ? "Revisar pipeline"
          : "Review pipeline",
      };
    }

    if (
      prompt.includes("stalled") ||
      prompt.includes("estancad")
    ) {
      if (insights.stalledDeals.length === 0) {
        return {
          title: isSpanish
            ? "No hay negocios estancados"
            : "No stalled deals",
          content: isSpanish
            ? "No detecté negocios activos con siete días o más sin actividad."
            : "I found no active deals with seven or more days without activity.",
          route: "/deals",
          routeLabel: isSpanish
            ? "Abrir negocios"
            : "Open deals",
        };
      }

      return {
        title: isSpanish
          ? "Negocios estancados"
          : "Stalled deals",
        content: insights.stalledDeals
          .slice(0, 5)
          .map(
            (deal, index) =>
              `${index + 1}. ${
                deal.title
              } — ${deal.daysInactive} ${
                isSpanish
                  ? "días sin actividad"
                  : "days inactive"
              } · ${money(deal.value)}`
          )
          .join("\n"),
        route: "/deals",
        routeLabel: isSpanish
          ? "Abrir pipeline"
          : "Open pipeline",
      };
    }

    if (
      prompt.includes("largest") ||
      prompt.includes("biggest") ||
      prompt.includes("mas grandes") ||
      prompt.includes("más grandes") ||
      prompt.includes("mayor valor")
    ) {
      if (insights.largestDeals.length === 0) {
        return {
          title: isSpanish
            ? "No hay negocios activos"
            : "No active deals",
          content:
            languageCopy[responseLanguage]
              .noData,
          route: "/deals",
          routeLabel: isSpanish
            ? "Abrir negocios"
            : "Open deals",
        };
      }

      return {
        title: isSpanish
          ? "Negocios más grandes"
          : "Largest opportunities",
        content: insights.largestDeals
          .map(
            (deal, index) =>
              `${index + 1}. ${
                deal.title
              } — ${money(
                deal.value
              )} · ${deal.stage || "—"} · ${formatPercentage(
                deal.probability
              )}`
          )
          .join("\n"),
        route: "/deals",
        routeLabel: isSpanish
          ? "Ver pipeline"
          : "View pipeline",
      };
    }

    if (
      prompt.includes("overdue") ||
      prompt.includes("vencid")
    ) {
      if (insights.overdueTasks.length === 0) {
        return {
          title: isSpanish
            ? "No hay tareas vencidas"
            : "No overdue tasks",
          content: isSpanish
            ? "Excelente. Todas las tareas activas están dentro de su fecha límite."
            : "Excellent. All active tasks are currently within their deadlines.",
          route: "/tasks",
          routeLabel: isSpanish
            ? "Abrir tareas"
            : "Open tasks",
        };
      }

      return {
        title: isSpanish
          ? "Tareas vencidas"
          : "Overdue tasks",
        content: insights.overdueTasks
          .slice(0, 6)
          .map((task, index) => {
            const daysLate = Math.abs(
              getDaysDifference(task.dueDate)
            );

            return `${index + 1}. ${
              task.title
            } — ${daysLate} ${
              isSpanish
                ? daysLate === 1
                  ? "día vencida"
                  : "días vencida"
                : daysLate === 1
                  ? "day overdue"
                  : "days overdue"
            }`;
          })
          .join("\n"),
        route: "/tasks",
        routeLabel: isSpanish
          ? "Gestionar tareas"
          : "Manage tasks",
      };
    }

    if (
      prompt.includes("due today") ||
      prompt.includes("vencen hoy") ||
      prompt.includes("para hoy")
    ) {
      if (insights.dueTodayTasks.length === 0) {
        return {
          title: isSpanish
            ? "No hay tareas para hoy"
            : "No tasks due today",
          content: isSpanish
            ? "No tienes tareas activas con fecha límite hoy."
            : "You have no active tasks due today.",
          route: "/tasks",
          routeLabel: isSpanish
            ? "Abrir tareas"
            : "Open tasks",
        };
      }

      return {
        title: isSpanish
          ? "Tareas que vencen hoy"
          : "Tasks due today",
        content: insights.dueTodayTasks
          .map(
            (task, index) =>
              `${index + 1}. ${
                task.title
              } · ${
                task.priority ||
                (isSpanish
                  ? "Sin prioridad"
                  : "No priority")
              }`
          )
          .join("\n"),
        route: "/tasks",
        routeLabel: isSpanish
          ? "Abrir tareas"
          : "Open tasks",
      };
    }

    if (
      prompt.includes("inactive contact") ||
      prompt.includes("contactos inactivos") ||
      prompt.includes("contacto inactivo")
    ) {
      if (
        insights.inactiveContacts.length === 0
      ) {
        return {
          title: isSpanish
            ? "No hay contactos inactivos"
            : "No inactive contacts",
          content: isSpanish
            ? "No detecté contactos con catorce días o más sin actividad."
            : "I found no contacts with fourteen or more days without activity.",
          route: "/contacts",
          routeLabel: isSpanish
            ? "Abrir contactos"
            : "Open contacts",
        };
      }

      return {
        title: isSpanish
          ? "Contactos inactivos"
          : "Inactive contacts",
        content: insights.inactiveContacts
          .slice(0, 6)
          .map(
            (contact, index) =>
              `${index + 1}. ${getContactName(
                contact
              )} — ${
                contact.daysInactive
              } ${
                isSpanish
                  ? "días sin actividad"
                  : "days inactive"
              }`
          )
          .join("\n"),
        route: "/contacts",
        routeLabel: isSpanish
          ? "Abrir contactos"
          : "Open contacts",
      };
    }

    if (
      prompt.includes(
        "highest deal value"
      ) ||
      prompt.includes(
        "contacto tiene el mayor"
      ) ||
      prompt.includes(
        "most valuable contact"
      )
    ) {
      const topContact =
        insights.contactsWithDealValue[0];

      if (
        !topContact ||
        topContact.totalDealValue === 0
      ) {
        return {
          title: isSpanish
            ? "Sin valor asociado"
            : "No associated value",
          content: isSpanish
            ? "No pude relacionar contactos con negocios usando los datos actuales."
            : "I could not match contacts to deals using the current data.",
          route: "/contacts",
          routeLabel: isSpanish
            ? "Abrir contactos"
            : "Open contacts",
        };
      }

      return {
        title: isSpanish
          ? "Contacto más valioso"
          : "Most valuable contact",
        content: isSpanish
          ? `${getContactName(
              topContact
            )} está relacionado con ${
              topContact.relatedDeals.length
            } negocios por un valor total de ${money(
              topContact.totalDealValue
            )}.`
          : `${getContactName(
              topContact
            )} is associated with ${
              topContact.relatedDeals.length
            } deals worth a total of ${money(
              topContact.totalDealValue
            )}.`,
        route: "/contacts",
        routeLabel: isSpanish
          ? "Abrir contactos"
          : "Open contacts",
      };
    }

    if (
      prompt.includes("no contacts") ||
      prompt.includes("sin contactos") ||
      prompt.includes(
        "no tienen contactos"
      )
    ) {
      if (
        insights.companiesWithoutContacts
          .length === 0
      ) {
        return {
          title: isSpanish
            ? "Todas tienen contactos"
            : "All companies have contacts",
          content: isSpanish
            ? "Todas las empresas registradas tienen al menos un contacto relacionado."
            : "Every registered company has at least one related contact.",
          route: "/companies",
          routeLabel: isSpanish
            ? "Abrir empresas"
            : "Open companies",
        };
      }

      return {
        title: isSpanish
          ? "Empresas sin contactos"
          : "Companies without contacts",
        content:
          insights.companiesWithoutContacts
            .slice(0, 8)
            .map(
              (company, index) =>
                `${index + 1}. ${getCompanyName(
                  company
                )}`
            )
            .join("\n"),
        route: "/companies",
        routeLabel: isSpanish
          ? "Abrir empresas"
          : "Open companies",
      };
    }

    if (
      prompt.includes("follow") ||
      prompt.includes("seguimiento") ||
      prompt.includes("whatsapp") ||
      prompt.includes("message") ||
      prompt.includes("mensaje")
    ) {
      const targetDeal =
        insights.atRiskDeals[0] ||
        insights.largestDeals[0];

      const firstName = getDealContactName(
        targetDeal
      )
        .split(" ")[0]
        .trim();

      return {
        title: isSpanish
          ? "Seguimiento para WhatsApp"
          : "WhatsApp follow-up",
        content: isSpanish
          ? `Hola ${firstName},\n\nQuería hacer seguimiento a la propuesta relacionada con “${
              targetDeal?.title ||
              "nuestra conversación"
            }”. ¿Tuviste la oportunidad de revisarla?\n\nQuedo atento a cualquier pregunta y con gusto podemos coordinar una llamada para definir los próximos pasos.`
          : `Hi ${firstName},\n\nI wanted to follow up on the proposal regarding “${
              targetDeal?.title ||
              "our conversation"
            }.” Did you have a chance to review it?\n\nI am available to answer any questions, and we can schedule a short call to agree on the next steps.`,
        route: "/whatsapp",
        routeLabel: isSpanish
          ? "Abrir WhatsApp"
          : "Open WhatsApp",
        copyable: true,
      };
    }

    if (
      prompt.includes("health") ||
      prompt.includes("healthy") ||
      prompt.includes("salud") ||
      prompt.includes("saludable") ||
      prompt.includes("pipeline")
    ) {
      const warnings = [];

      if (insights.overdueTasks.length > 0) {
        warnings.push(
          isSpanish
            ? `${insights.overdueTasks.length} tareas vencidas reducen la salud operativa.`
            : `${insights.overdueTasks.length} overdue tasks are reducing operational health.`
        );
      }

      if (insights.atRiskDeals.length > 0) {
        warnings.push(
          isSpanish
            ? `${insights.atRiskDeals.length} negocios requieren atención por riesgo.`
            : `${insights.atRiskDeals.length} deals require attention because of risk.`
        );
      }

      if (insights.stalledDeals.length > 0) {
        warnings.push(
          isSpanish
            ? `${insights.stalledDeals.length} negocios llevan al menos siete días sin actividad.`
            : `${insights.stalledDeals.length} deals have had no activity for at least seven days.`
        );
      }

      return {
        title: isSpanish
          ? `Salud del CRM: ${insights.healthScore}%`
          : `CRM health: ${insights.healthScore}%`,
        content: [
          insights.healthScore >= 85
            ? isSpanish
              ? "El CRM está en muy buen estado."
              : "Your CRM is in very good condition."
            : insights.healthScore >= 65
              ? isSpanish
                ? "El CRM está saludable, pero requiere algunas acciones."
                : "Your CRM is healthy, but a few actions are required."
              : isSpanish
                ? "El CRM necesita atención prioritaria."
                : "Your CRM needs immediate attention.",
          isSpanish
            ? `Pipeline activo: ${money(
                insights.activePipeline
              )}`
            : `Active pipeline: ${money(
                insights.activePipeline
              )}`,
          isSpanish
            ? `Tasa de cierre: ${insights.winRate}%`
            : `Win rate: ${insights.winRate}%`,
          isSpanish
            ? `Tareas completadas: ${insights.taskCompletionRate}%`
            : `Task completion: ${insights.taskCompletionRate}%`,
          ...warnings,
        ].join("\n"),
        route: "/analytics",
        routeLabel: isSpanish
          ? "Abrir analítica"
          : "Open analytics",
      };
    }

    if (
      prompt.includes("campaign") ||
      prompt.includes("campana") ||
      prompt.includes("campaña")
    ) {
      return {
        title: isSpanish
          ? "Estado de campañas"
          : "Campaign status",
        content: isSpanish
          ? `Tienes ${insights.campaigns.length} campañas en total y ${insights.activeCampaigns.length} activas. Revisa las campañas pausadas o programadas y confirma que cada una tenga una audiencia, un mensaje y un objetivo medible.`
          : `You have ${insights.campaigns.length} campaigns in total and ${insights.activeCampaigns.length} active campaigns. Review paused or scheduled campaigns and confirm that each has a target audience, clear message, and measurable objective.`,
        route: "/campaigns",
        routeLabel: isSpanish
          ? "Abrir campañas"
          : "Open campaigns",
      };
    }

    if (
      prompt.includes("automation") ||
      prompt.includes("automatizacion") ||
      prompt.includes("automatización")
    ) {
      return {
        title: isSpanish
          ? "Estado de automatizaciones"
          : "Automation status",
        content: isSpanish
          ? `Hay ${insights.automations.length} automatizaciones configuradas y ${insights.activeAutomations.length} activas. Prioriza automatizaciones para seguimientos, creación de tareas y actualización de contactos.`
          : `There are ${insights.automations.length} configured automations and ${insights.activeAutomations.length} active. Prioritize automations for follow-ups, task creation, and contact updates.`,
        route: "/automations",
        routeLabel: isSpanish
          ? "Abrir automatizaciones"
          : "Open automations",
      };
    }

    return {
      title: isSpanish
        ? `Análisis de ${currentPage.labels.es}`
        : `${currentPage.labels.en} analysis`,
      content: isSpanish
        ? `Sé que actualmente estás en ${currentPage.labels.es}. Puedo analizar riesgos, negocios estancados, ingresos, tareas, contactos inactivos, campañas y prioridades. Intenta preguntar: “¿Qué debería priorizar hoy?”`
        : `I know you are currently viewing ${currentPage.labels.en}. I can analyze risk, stalled deals, revenue, tasks, inactive contacts, campaigns, and priorities. Try asking: “What should I prioritize today?”`,
      route: currentPage.route,
      routeLabel: isSpanish
        ? `Abrir ${currentPage.labels.es}`
        : `Open ${currentPage.labels.en}`,
    };
  };

  const submitPrompt = (promptValue) => {
    const trimmedPrompt = promptValue.trim();

    if (!trimmedPrompt || isThinking) {
      return;
    }

    const userMessage = {
      id: createMessageId(),
      role: "user",
      type: "text",
      content: trimmedPrompt,
      createdAt: new Date().toISOString(),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setInputValue("");
    setShowQuickActions(false);
    setIsThinking(true);

    window.setTimeout(() => {
      const response =
        createAssistantResponse(trimmedPrompt);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          type: "insight",
          createdAt: new Date().toISOString(),
          ...response,
        },
      ]);

      setIsThinking(false);
    }, 650);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitPrompt(inputValue);
  };

  const toggleLanguage = () => {
    const nextLanguage =
      language === "en" ? "es" : "en";

    setLanguage(nextLanguage);

    toast.info(
      nextLanguage === "es"
        ? "Idioma actualizado"
        : "Language updated",
      nextLanguage === "es"
        ? "El Copiloto ahora responderá en español."
        : "Copilot will now respond in English."
    );
  };

  const clearConversation = () => {
    const initialMessages =
      getInitialMessages(language, userName);

    setMessages(initialMessages);
    setShowQuickActions(true);
    briefingShownRef.current = false;

    toast.info(
      copy.cleared,
      language === "es"
        ? "Puedes comenzar una nueva consulta."
        : "You can start a new conversation."
    );
  };

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(
        content
      );

      toast.success(
        copy.copied,
        language === "es"
          ? "El texto quedó listo para usar."
          : "The text is ready to use."
      );
    } catch {
      toast.error(
        language === "es"
          ? "No se pudo copiar"
          : "Could not copy",
        language === "es"
          ? "Selecciona el texto manualmente."
          : "Please select the text manually."
      );
    }
  };

  const openAssistant = () => {
    setIsOpen(true);
    setIsMinimized(false);

    if (
      !briefingShownRef.current &&
      messages.length <= 1
    ) {
      briefingShownRef.current = true;

      window.setTimeout(() => {
        const response =
          createAssistantResponse(
            language === "es"
              ? "Dame el resumen de hoy"
              : "Give me today's briefing"
          );

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            role: "assistant",
            type: "briefing",
            createdAt:
              new Date().toISOString(),
            ...response,
          },
        ]);
      }, 350);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="ai-assistant-launcher"
          aria-label={copy.assistantName}
          onClick={openAssistant}
        >
          <span className="ai-assistant-launcher__glow" />

          <Bot size={24} />

          <span className="ai-assistant-launcher__label">
            AI
          </span>
        </button>
      )}

      {isOpen && (
        <aside
          className={`ai-assistant ${
            isMinimized
              ? "ai-assistant--minimized"
              : ""
          }`}
        >
          <header className="ai-assistant__header">
            <div className="ai-assistant__identity">
              <div className="ai-assistant__logo">
                <Sparkles size={20} />
              </div>

              <div>
                <strong>
                  {copy.assistantName}
                </strong>

                <span>
                  <i />
                  {copy.status}
                </span>
              </div>
            </div>

            <div className="ai-assistant__header-actions">
              <button
                type="button"
                aria-label={copy.switchLanguage}
                title={copy.switchLanguage}
                onClick={toggleLanguage}
              >
                <Languages size={18} />
                <span>
                  {language === "en"
                    ? "ES"
                    : "EN"}
                </span>
              </button>

              <button
                type="button"
                aria-label={copy.clear}
                title={copy.clear}
                onClick={clearConversation}
              >
                <Trash2 size={17} />
              </button>

              <button
                type="button"
                aria-label={copy.minimize}
                title={copy.minimize}
                onClick={() =>
                  setIsMinimized(
                    (currentValue) =>
                      !currentValue
                  )
                }
              >
                {isMinimized ? (
                  <ChevronDown size={18} />
                ) : (
                  <Minimize2 size={17} />
                )}
              </button>

              <button
                type="button"
                aria-label={copy.close}
                title={copy.close}
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {!isMinimized && (
            <>
              <section className="ai-assistant__health">
                <div className="ai-assistant__health-score">
                  <span>
                    {crmInsights.healthScore}
                  </span>

                  <small>/100</small>
                </div>

                <div>
                  <strong>{copy.health}</strong>

                  <p>
                    {language === "es"
                      ? `${currentPage.labels.es} · ${crmInsights.activeDeals.length} negocios activos · ${crmInsights.overdueTasks.length} tareas vencidas`
                      : `${currentPage.labels.en} · ${crmInsights.activeDeals.length} active deals · ${crmInsights.overdueTasks.length} overdue tasks`}
                  </p>
                </div>

                <div
                  className={`ai-assistant__health-status ai-assistant__health-status--${
                    crmInsights.healthScore >= 85
                      ? "good"
                      : crmInsights.healthScore >= 65
                        ? "warning"
                        : "danger"
                  }`}
                >
                  {crmInsights.healthScore >=
                  85 ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                </div>
              </section>

              <div className="ai-assistant__messages">
                {messages.map((message) => (
                  <article
                    className={`ai-message ai-message--${message.role}`}
                    key={message.id}
                  >
                    {message.role ===
                      "assistant" && (
                      <div className="ai-message__avatar">
                        <Bot size={17} />
                      </div>
                    )}

                    <div className="ai-message__bubble">
                      {message.title && (
                        <strong>
                          {message.title}
                        </strong>
                      )}

                      <p>{message.content}</p>

                      {message.route && (
                        <button
                          type="button"
                          className="ai-message__route"
                          onClick={() => {
                            navigate(message.route);
                            setIsOpen(false);
                          }}
                        >
                          {message.routeLabel}
                          <ArrowRight size={14} />
                        </button>
                      )}

                      {message.copyable && (
                        <button
                          type="button"
                          className="ai-message__copy"
                          onClick={() =>
                            copyMessage(
                              message.content
                            )
                          }
                        >
                          {language === "es"
                            ? "Copiar mensaje"
                            : "Copy message"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}

                {isThinking && (
                  <article className="ai-message ai-message--assistant">
                    <div className="ai-message__avatar">
                      <Bot size={17} />
                    </div>

                    <div className="ai-message__bubble ai-message__bubble--thinking">
                      <span />
                      <span />
                      <span />

                      <small>
                        {copy.thinking}
                      </small>
                    </div>
                  </article>
                )}

                <div ref={messagesEndRef} />
              </div>

              {showQuickActions && (
                <section className="ai-assistant__quick-actions">
                  <div>
                    <Sparkles size={15} />
                    <strong>
                      {copy.quickActions}
                    </strong>
                  </div>

                  <div className="ai-assistant__quick-grid">
                    {contextualQuickPrompts.map(
                      (quickPrompt) => {
                        const Icon =
                          quickPrompt.icon;

                        return (
                          <button
                            type="button"
                            key={quickPrompt.id}
                            onClick={() =>
                              submitPrompt(
                                quickPrompt.prompt
                              )
                            }
                          >
                            <Icon size={15} />

                            <span>
                              {quickPrompt.label}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </section>
              )}

              <footer className="ai-assistant__composer">
                <form onSubmit={handleSubmit}>
                  <textarea
                    ref={inputRef}
                    rows="1"
                    value={inputValue}
                    placeholder={copy.placeholder}
                    onChange={(event) =>
                      setInputValue(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();
                        submitPrompt(inputValue);
                      }
                    }}
                  />

                  <button
                    type="submit"
                    aria-label={copy.send}
                    disabled={
                      !inputValue.trim() ||
                      isThinking
                    }
                  >
                    <Send size={18} />
                  </button>
                </form>

                <p>{copy.localNotice}</p>
              </footer>
            </>
          )}
        </aside>
      )}
    </>
  );
}

export default AIAssistant;