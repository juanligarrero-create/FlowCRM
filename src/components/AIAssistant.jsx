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
import { useNavigate } from "react-router-dom";
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

const getDaysDifference = (dateString) => {
  if (!dateString) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(targetDate.getTime())) {
    return null;
  }

  return Math.round(
    (targetDate.getTime() - today.getTime()) /
      86400000
  );
};

const formatCurrency = (
  value,
  currency = "USD"
) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const createMessageId = () =>
  typeof crypto !== "undefined" &&
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const languageCopy = {
  en: {
    assistantName: "FlowCRM Copilot",
    status: "Local CRM intelligence",
    greeting: "Good to see you",
    greetingBody:
      "I analyzed your current CRM data. Ask me about deals, tasks, contacts, campaigns, or your priorities.",
    placeholder: "Ask FlowCRM Copilot...",
    send: "Send message",
    close: "Close AI Copilot",
    minimize: "Minimize AI Copilot",
    clear: "Clear conversation",
    thinking: "Analyzing your CRM...",
    health: "CRM health",
    priorities: "Today's priorities",
    quickActions: "Suggested questions",
    localNotice:
      "Portfolio mode: responses are generated locally from your CRM data.",
    noData:
      "I do not have enough CRM data to answer that yet.",
    cleared: "Conversation cleared",
    copied: "Response copied",
    switchLanguage: "Switch language",
  },
  es: {
    assistantName: "Copiloto de FlowCRM",
    status: "Inteligencia local del CRM",
    greeting: "Qué bueno verte",
    greetingBody:
      "Analicé los datos actuales de tu CRM. Pregúntame por negocios, tareas, contactos, campañas o prioridades.",
    placeholder:
      "Pregúntale al Copiloto de FlowCRM...",
    send: "Enviar mensaje",
    close: "Cerrar el copiloto",
    minimize: "Minimizar el copiloto",
    clear: "Borrar conversación",
    thinking: "Analizando tu CRM...",
    health: "Salud del CRM",
    priorities: "Prioridades de hoy",
    quickActions: "Preguntas sugeridas",
    localNotice:
      "Modo portafolio: las respuestas se generan localmente con los datos del CRM.",
    noData:
      "Todavía no tengo suficientes datos en el CRM para responder eso.",
    cleared: "Conversación borrada",
    copied: "Respuesta copiada",
    switchLanguage: "Cambiar idioma",
  },
};

const quickPrompts = {
  en: [
    {
      id: "summary",
      label: "Summarize my CRM",
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
      id: "deals",
      label: "Largest deals",
      icon: CircleDollarSign,
      prompt: "Show my largest deals",
    },
    {
      id: "tasks",
      label: "Overdue tasks",
      icon: ClipboardList,
      prompt: "Which tasks are overdue?",
    },
    {
      id: "follow-up",
      label: "Write follow-up",
      icon: MessageCircle,
      prompt:
        "Write a WhatsApp follow-up message",
    },
    {
      id: "health",
      label: "Pipeline health",
      icon: TrendingUp,
      prompt:
        "How healthy is my sales pipeline?",
    },
  ],
  es: [
    {
      id: "summary",
      label: "Resumir mi CRM",
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
      id: "deals",
      label: "Negocios más grandes",
      icon: CircleDollarSign,
      prompt:
        "Muéstrame los negocios más grandes",
    },
    {
      id: "tasks",
      label: "Tareas vencidas",
      icon: ClipboardList,
      prompt:
        "¿Qué tareas están vencidas?",
    },
    {
      id: "follow-up",
      label: "Crear seguimiento",
      icon: MessageCircle,
      prompt:
        "Escribe un seguimiento para WhatsApp",
    },
    {
      id: "health",
      label: "Salud del pipeline",
      icon: TrendingUp,
      prompt:
        "¿Qué tan saludable está mi pipeline?",
    },
  ],
};

const getInitialMessages = (language, userName) => [
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
        ? "Estoy listo para analizar tu CRM y ayudarte a decidir qué hacer después."
        : "I am ready to analyze your CRM and help you decide what to do next.",
  },
];

function AIAssistant() {
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const settings = useMemo(
    () => readStoredObject(STORAGE_KEYS.settings),
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

  const crmData = useMemo(
    () => ({
      contacts: readStoredArray(
        STORAGE_KEYS.contacts
      ),
      companies: readStoredArray(
        STORAGE_KEYS.companies
      ),
      deals: readStoredArray(STORAGE_KEYS.deals),
      tasks: readStoredArray(STORAGE_KEYS.tasks),
      campaigns: readStoredArray(
        STORAGE_KEYS.campaigns
      ),
      automations: readStoredArray(
        STORAGE_KEYS.automations
      ),
    }),
    [isOpen, messages.length]
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

    const activeDeals = deals.filter(
      (deal) =>
        deal.stage !== "Won" &&
        deal.stage !== "Lost"
    );

    const wonDeals = deals.filter(
      (deal) => deal.stage === "Won"
    );

    const lostDeals = deals.filter(
      (deal) => deal.stage === "Lost"
    );

    const activePipeline = activeDeals.reduce(
      (total, deal) =>
        total + Number(deal.value || 0),
      0
    );

    const weightedPipeline =
      activeDeals.reduce((total, deal) => {
        const probability = Number(
          deal.probability || 0
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

    const overdueTasks = tasks.filter((task) => {
      const daysDifference = getDaysDifference(
        task.dueDate
      );

      return (
        task.status !== "Completed" &&
        daysDifference !== null &&
        daysDifference < 0
      );
    });

    const dueTodayTasks = tasks.filter(
      (task) =>
        task.status !== "Completed" &&
        task.dueDate === getDateString()
    );

    const highPriorityTasks = tasks.filter(
      (task) =>
        task.status !== "Completed" &&
        task.priority === "High"
    );

    const closingSoonDeals = activeDeals
      .filter((deal) => {
        const daysDifference = getDaysDifference(
          deal.closeDate
        );

        return (
          daysDifference !== null &&
          daysDifference >= 0 &&
          daysDifference <= 7
        );
      })
      .sort(
        (firstDeal, secondDeal) =>
          Number(secondDeal.value || 0) -
          Number(firstDeal.value || 0)
      );

    const largestDeals = [...activeDeals]
      .sort(
        (firstDeal, secondDeal) =>
          Number(secondDeal.value || 0) -
          Number(firstDeal.value || 0)
      )
      .slice(0, 5);

    const activeCampaigns = campaigns.filter(
      (campaign) =>
        campaign.status === "Active"
    );

    const activeAutomations =
      automations.filter(
        (automation) =>
          automation.status === "Active"
      );

    const taskCompletionRate =
      tasks.length === 0
        ? 0
        : Math.round(
            (tasks.filter(
              (task) =>
                task.status === "Completed"
            ).length /
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

    let healthScore = 100;

    healthScore -= Math.min(
      overdueTasks.length * 7,
      28
    );

    healthScore -= Math.min(
      highPriorityTasks.length * 2,
      12
    );

    if (activeDeals.length === 0) {
      healthScore -= 20;
    }

    if (
      activeDeals.length > 0 &&
      closingSoonDeals.length === 0
    ) {
      healthScore -= 4;
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
      activePipeline,
      weightedPipeline,
      wonRevenue,
      overdueTasks,
      dueTodayTasks,
      highPriorityTasks,
      closingSoonDeals,
      largestDeals,
      activeCampaigns,
      activeAutomations,
      taskCompletionRate,
      winRate,
      healthScore,
    };
  }, [crmData]);

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
  const createAssistantResponse = (
    userPrompt
  ) => {
    const prompt = normalizeText(userPrompt);
    const insights = crmInsights;

    const isSpanishPrompt =
      /[¿¡]|\b(que|cual|cuales|negocio|negocios|tarea|tareas|cliente|clientes|resumen|priorizar|vencida|vencidas|seguimiento|salud|ventas)\b/.test(
        prompt
      );

    const responseLanguage = isSpanishPrompt
      ? "es"
      : language;

    const isSpanish =
      responseLanguage === "es";

    const currency = workspaceCurrency;

    if (
      prompt.includes("resume") ||
      prompt.includes("summary") ||
      prompt.includes("resumen")
    ) {
      return {
        title: isSpanish
          ? "Resumen del CRM"
          : "CRM summary",
        content: isSpanish
          ? `Actualmente tienes ${insights.contacts.length} contactos, ${insights.companies.length} empresas, ${insights.activeDeals.length} negocios activos y ${insights.tasks.length} tareas. El pipeline activo vale ${formatCurrency(
              insights.activePipeline,
              currency
            )}, con un valor ponderado de ${formatCurrency(
              insights.weightedPipeline,
              currency
            )}. Hay ${insights.overdueTasks.length} tareas vencidas y ${insights.closingSoonDeals.length} negocios que cierran durante los próximos siete días.`
          : `You currently have ${insights.contacts.length} contacts, ${insights.companies.length} companies, ${insights.activeDeals.length} active deals, and ${insights.tasks.length} tasks. Your active pipeline is worth ${formatCurrency(
              insights.activePipeline,
              currency
            )}, with a weighted value of ${formatCurrency(
              insights.weightedPipeline,
              currency
            )}. There are ${insights.overdueTasks.length} overdue tasks and ${insights.closingSoonDeals.length} deals closing within the next seven days.`,
        route: "/",
        routeLabel: isSpanish
          ? "Abrir dashboard"
          : "Open dashboard",
      };
    }

    if (
      prompt.includes("largest") ||
      prompt.includes("biggest") ||
      prompt.includes("mayor") ||
      prompt.includes("grande") ||
      prompt.includes("mas grandes")
    ) {
      if (insights.largestDeals.length === 0) {
        return {
          title: isSpanish
            ? "No hay negocios activos"
            : "No active deals",
          content: languageCopy[
            responseLanguage
          ].noData,
          route: "/deals",
          routeLabel: isSpanish
            ? "Abrir negocios"
            : "Open deals",
        };
      }

      const dealList = insights.largestDeals
        .map(
          (deal, index) =>
            `${index + 1}. ${deal.title} — ${formatCurrency(
              deal.value,
              currency
            )} · ${deal.stage}${
              deal.probability
                ? ` · ${deal.probability}%`
                : ""
            }`
        )
        .join("\n");

      return {
        title: isSpanish
          ? "Negocios más grandes"
          : "Largest opportunities",
        content: dealList,
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

      const taskList = insights.overdueTasks
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
        .join("\n");

      return {
        title: isSpanish
          ? "Tareas vencidas"
          : "Overdue tasks",
        content: taskList,
        route: "/tasks",
        routeLabel: isSpanish
          ? "Gestionar tareas"
          : "Manage tasks",
      };
    }

    if (
      prompt.includes("priorit") ||
      prompt.includes("today") ||
      prompt.includes("hoy")
    ) {
      const priorityItems = [];

      if (insights.overdueTasks.length > 0) {
        priorityItems.push(
          isSpanish
            ? `Resolver ${insights.overdueTasks.length} tareas vencidas.`
            : `Resolve ${insights.overdueTasks.length} overdue tasks.`
        );
      }

      if (
        insights.closingSoonDeals.length > 0
      ) {
        const topClosingDeal =
          insights.closingSoonDeals[0];

        priorityItems.push(
          isSpanish
            ? `Contactar a ${topClosingDeal.company || topClosingDeal.contact || topClosingDeal.title} por el negocio "${topClosingDeal.title}" de ${formatCurrency(
                topClosingDeal.value,
                currency
              )}.`
            : `Contact ${topClosingDeal.company || topClosingDeal.contact || topClosingDeal.title} about the "${topClosingDeal.title}" opportunity worth ${formatCurrency(
                topClosingDeal.value,
                currency
              )}.`
        );
      }

      if (insights.highPriorityTasks.length > 0) {
        priorityItems.push(
          isSpanish
            ? `Revisar ${insights.highPriorityTasks.length} tareas de prioridad alta.`
            : `Review ${insights.highPriorityTasks.length} high-priority tasks.`
        );
      }

      if (priorityItems.length === 0) {
        priorityItems.push(
          isSpanish
            ? "No hay alertas urgentes. Enfócate en avanzar los negocios activos y hacer seguimiento a prospectos."
            : "There are no urgent alerts. Focus on advancing active deals and following up with prospects."
        );
      }

      return {
        title: isSpanish
          ? "Prioridades recomendadas"
          : "Recommended priorities",
        content: priorityItems
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
      prompt.includes("follow") ||
      prompt.includes("seguimiento") ||
      prompt.includes("whatsapp") ||
      prompt.includes("message") ||
      prompt.includes("mensaje")
    ) {
      const topDeal = insights.largestDeals[0];
      const contactName =
        topDeal?.contact?.split(" ")[0] ||
        "Carlos";

      return {
        title: isSpanish
          ? "Seguimiento para WhatsApp"
          : "WhatsApp follow-up",
        content: isSpanish
          ? `Hola ${contactName},\n\nQuería hacer seguimiento a la propuesta que te compartimos. ¿Tuviste la oportunidad de revisarla?\n\nQuedo atento a cualquier pregunta y con gusto podemos coordinar una llamada para revisar los próximos pasos.`
          : `Hi ${contactName},\n\nI wanted to follow up on the proposal we shared. Did you have a chance to review it?\n\nI am available to answer any questions, and we can schedule a short call to discuss the next steps.`,
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

      if (
        insights.closingSoonDeals.length === 0 &&
        insights.activeDeals.length > 0
      ) {
        warnings.push(
          isSpanish
            ? "No hay negocios programados para cerrar durante los próximos siete días."
            : "No deals are scheduled to close within the next seven days."
        );
      }

      const healthDescription =
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
              : "Your CRM needs immediate attention.";

      return {
        title: isSpanish
          ? `Salud del CRM: ${insights.healthScore}%`
          : `CRM health: ${insights.healthScore}%`,
        content: [
          healthDescription,
          isSpanish
            ? `Pipeline activo: ${formatCurrency(
                insights.activePipeline,
                currency
              )}`
            : `Active pipeline: ${formatCurrency(
                insights.activePipeline,
                currency
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
      prompt.includes("campana")
    ) {
      return {
        title: isSpanish
          ? "Estado de campañas"
          : "Campaign status",
        content: isSpanish
          ? `Tienes ${insights.campaigns.length} campañas en total y ${insights.activeCampaigns.length} activas. Revisa las campañas pausadas o programadas para asegurarte de que cada una tenga una audiencia y un objetivo claros.`
          : `You have ${insights.campaigns.length} campaigns in total and ${insights.activeCampaigns.length} active campaigns. Review paused or scheduled campaigns to ensure each one has a clear audience and objective.`,
        route: "/campaigns",
        routeLabel: isSpanish
          ? "Abrir campañas"
          : "Open campaigns",
      };
    }

    if (
      prompt.includes("automation") ||
      prompt.includes("automatizacion")
    ) {
      return {
        title: isSpanish
          ? "Estado de automatizaciones"
          : "Automation status",
        content: isSpanish
          ? `Hay ${insights.automations.length} automatizaciones configuradas y ${insights.activeAutomations.length} activas. Las automatizaciones pueden reducir trabajo manual en seguimientos, asignación de tareas y actualización de contactos.`
          : `There are ${insights.automations.length} configured automations and ${insights.activeAutomations.length} active. Automations can reduce manual work across follow-ups, task assignment, and contact updates.`,
        route: "/automations",
        routeLabel: isSpanish
          ? "Abrir automatizaciones"
          : "Open automations",
      };
    }

    return {
      title: isSpanish
        ? "Análisis del CRM"
        : "CRM analysis",
      content: isSpanish
        ? `Puedo ayudarte con negocios, tareas, contactos, campañas, automatizaciones, salud del pipeline y mensajes de seguimiento. Intenta preguntar: “¿Qué debería priorizar hoy?”`
        : `I can help with deals, tasks, contacts, campaigns, automations, pipeline health, and follow-up messages. Try asking: “What should I prioritize today?”`,
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
    const initialMessages = getInitialMessages(
      language,
      userName
    );

    setMessages(initialMessages);
    setShowQuickActions(true);

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
                      ? `${crmInsights.activeDeals.length} negocios activos · ${crmInsights.overdueTasks.length} tareas vencidas`
                      : `${crmInsights.activeDeals.length} active deals · ${crmInsights.overdueTasks.length} overdue tasks`}
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
                  {crmInsights.healthScore >= 85 ? (
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
                    {quickPrompts[language].map(
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

export default AIAssistant