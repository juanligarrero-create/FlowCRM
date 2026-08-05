import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  HeartHandshake,
  Mail,
  Megaphone,
  MessageCircle,
  RefreshCw,
  UserRoundCheck,
} from "lucide-react";

export const templateCategories = [
  {
    id: "sales",
    label: "Sales",
    labelEs: "Ventas",
    icon: BriefcaseBusiness,
  },
  {
    id: "marketing",
    label: "Marketing",
    labelEs: "Marketing",
    icon: Megaphone,
  },
  {
    id: "support",
    label: "Customer support",
    labelEs: "Atención al cliente",
    icon: HeartHandshake,
  },
  {
    id: "hr",
    label: "Human resources",
    labelEs: "Recursos humanos",
    icon: UserRoundCheck,
  },
  {
    id: "business",
    label: "Business",
    labelEs: "Negocios",
    icon: FileText,
  },
];

export const builtInTemplates = [
  {
    id: "sales-cold-email",
    category: "sales",
    writerType: "sales-email",
    tone: "professional",
    icon: Mail,
    name: "Cold sales email",
    nameEs: "Correo de venta en frío",
    description:
      "Introduce your solution to a new prospect and request a short meeting.",
    descriptionEs:
      "Presenta tu solución a un nuevo prospecto y solicita una reunión breve.",
    subject:
      "An idea to help {{company_name}} improve its sales process",
    subjectEs:
      "Una idea para ayudar a {{company_name}} a mejorar su proceso comercial",
    content: `Hi {{contact_first_name}},

I hope you are doing well.

I am reaching out because I believe we could help {{company_name}} improve its commercial processes and reduce manual work.

Our solution centralizes contacts, opportunities, tasks, campaigns, and follow-ups in one platform.

Would you be available for a short conversation this week?

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Espero que estés muy bien.

Quería contactarte porque creo que podemos ayudar a {{company_name}} a mejorar sus procesos comerciales y reducir el trabajo manual.

Nuestra solución centraliza contactos, oportunidades, tareas, campañas y seguimientos en una sola plataforma.

¿Tendrías disponibilidad para una conversación breve esta semana?

Saludos,`,
  },
  {
    id: "sales-warm-follow-up",
    category: "sales",
    writerType: "follow-up",
    tone: "friendly",
    icon: RefreshCw,
    name: "Warm follow-up",
    nameEs: "Seguimiento amigable",
    description:
      "Reconnect naturally after a previous conversation.",
    descriptionEs:
      "Retoma el contacto de forma natural después de una conversación.",
    subject: "Following up on {{deal_name}}",
    subjectEs:
      "Seguimiento sobre {{deal_name}}",
    content: `Hi {{contact_first_name}},

I wanted to follow up on our conversation about {{deal_name}}.

Did you have a chance to review the information we shared?

I am available to answer any questions, and we can schedule a short call to discuss the next steps.

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Quería hacer seguimiento a nuestra conversación sobre {{deal_name}}.

¿Tuviste la oportunidad de revisar la información que compartimos?

Quedo atento a cualquier pregunta y podemos coordinar una llamada breve para revisar los próximos pasos.

Saludos,`,
  },
  {
    id: "sales-proposal-follow-up",
    category: "sales",
    writerType: "follow-up",
    tone: "consultative",
    icon: FileText,
    name: "Proposal follow-up",
    nameEs: "Seguimiento de propuesta",
    description:
      "Follow up after sending a commercial proposal.",
    descriptionEs:
      "Haz seguimiento después de enviar una propuesta comercial.",
    subject:
      "Next steps for the {{deal_name}} proposal",
    subjectEs:
      "Próximos pasos para la propuesta {{deal_name}}",
    content: `Hi {{contact_first_name}},

I wanted to follow up on the proposal for {{deal_name}}, valued at {{deal_value}}.

I would be happy to clarify any questions related to the scope, timeline, or implementation process.

Would it be useful to schedule a short call to review the proposal together?

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Quería hacer seguimiento a la propuesta de {{deal_name}}, con un valor de {{deal_value}}.

Con gusto puedo aclarar cualquier pregunta relacionada con el alcance, cronograma o proceso de implementación.

¿Te parecería útil coordinar una llamada breve para revisar la propuesta?

Saludos,`,
  },
  {
    id: "sales-meeting-reminder",
    category: "sales",
    writerType: "meeting",
    tone: "concise",
    icon: CalendarDays,
    name: "Meeting reminder",
    nameEs: "Recordatorio de reunión",
    description:
      "Send a concise reminder before a scheduled meeting.",
    descriptionEs:
      "Envía un recordatorio breve antes de una reunión programada.",
    subject:
      "Reminder: meeting about {{deal_name}}",
    subjectEs:
      "Recordatorio: reunión sobre {{deal_name}}",
    content: `Hi {{contact_first_name}},

This is a quick reminder about our meeting regarding {{deal_name}}.

I look forward to reviewing the opportunity and agreeing on the next steps.

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Este es un recordatorio breve de nuestra reunión sobre {{deal_name}}.

Quedo atento para revisar la oportunidad y definir los próximos pasos.

Saludos,`,
  },
  {
    id: "sales-whatsapp-follow-up",
    category: "sales",
    writerType: "whatsapp",
    tone: "friendly",
    icon: MessageCircle,
    name: "WhatsApp follow-up",
    nameEs: "Seguimiento por WhatsApp",
    description:
      "Create a short follow-up message for WhatsApp.",
    descriptionEs:
      "Crea un mensaje breve de seguimiento para WhatsApp.",
    subject: "WhatsApp follow-up",
    subjectEs: "Seguimiento por WhatsApp",
    content: `Hi {{contact_first_name}}, how are you?

I wanted to follow up on {{deal_name}}. Did you have a chance to review the information?

I am available if you have any questions.`,
    contentEs: `Hola {{contact_first_name}}, ¿cómo estás?

Quería hacer seguimiento a {{deal_name}}. ¿Tuviste la oportunidad de revisar la información?

Quedo atento a cualquier pregunta.`,
  },
  {
    id: "marketing-product-launch",
    category: "marketing",
    writerType: "sales-email",
    tone: "persuasive",
    icon: Megaphone,
    name: "Product launch email",
    nameEs: "Correo de lanzamiento",
    description:
      "Announce a new product or service to customers.",
    descriptionEs:
      "Anuncia un nuevo producto o servicio a tus clientes.",
    subject:
      "Introducing a new solution for {{company_name}}",
    subjectEs:
      "Presentamos una nueva solución para {{company_name}}",
    content: `Hi {{contact_first_name}},

We are excited to introduce a new solution designed to help teams work with greater speed, visibility, and organization.

It brings customer information, sales opportunities, tasks, and automation into one streamlined workspace.

We would be pleased to show you how it could support {{company_name}}.

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Nos complace presentarte una nueva solución diseñada para ayudar a los equipos a trabajar con mayor velocidad, visibilidad y organización.

Centraliza información de clientes, oportunidades, tareas y automatizaciones en un solo espacio.

Nos gustaría mostrarte cómo podría ayudar a {{company_name}}.

Saludos,`,
  },
  {
    id: "marketing-newsletter",
    category: "marketing",
    writerType: "sales-email",
    tone: "friendly",
    icon: Mail,
    name: "Customer newsletter",
    nameEs: "Boletín para clientes",
    description:
      "Share company updates, insights, or product improvements.",
    descriptionEs:
      "Comparte novedades, información o mejoras del producto.",
    subject:
      "What is new this month",
    subjectEs:
      "Novedades de este mes",
    content: `Hi {{contact_first_name}},

Here are the latest updates from our team:

• New product improvements
• Better workflow automation
• New reporting capabilities
• Faster customer support

Thank you for being part of our community.

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Estas son las novedades más recientes de nuestro equipo:

• Nuevas mejoras del producto
• Mejores automatizaciones
• Nuevas capacidades de análisis
• Atención al cliente más rápida

Gracias por ser parte de nuestra comunidad.

Saludos,`,
  },
  {
    id: "support-apology",
    category: "support",
    writerType: "follow-up",
    tone: "professional",
    icon: HeartHandshake,
    name: "Customer apology",
    nameEs: "Disculpa al cliente",
    description:
      "Respond professionally after a service issue.",
    descriptionEs:
      "Responde profesionalmente después de un inconveniente.",
    subject:
      "Our apologies and next steps",
    subjectEs:
      "Nuestras disculpas y próximos pasos",
    content: `Hi {{contact_first_name}},

We sincerely apologize for the inconvenience you experienced.

We understand the impact this may have caused, and our team is reviewing the situation carefully.

We will keep you informed and work to resolve the issue as quickly as possible.

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Lamentamos sinceramente el inconveniente que experimentaste.

Entendemos el impacto que pudo generar y nuestro equipo está revisando la situación cuidadosamente.

Te mantendremos informado y trabajaremos para resolverlo lo antes posible.

Saludos,`,
  },
  {
    id: "support-ticket-update",
    category: "support",
    writerType: "follow-up",
    tone: "concise",
    icon: RefreshCw,
    name: "Support ticket update",
    nameEs: "Actualización de soporte",
    description:
      "Provide a clear update about an open support case.",
    descriptionEs:
      "Comparte una actualización clara sobre un caso abierto.",
    subject:
      "Update regarding your support request",
    subjectEs:
      "Actualización sobre tu solicitud de soporte",
    content: `Hi {{contact_first_name}},

We wanted to provide an update regarding your support request.

Our team is currently reviewing the issue and working toward a resolution.

We will contact you again as soon as we have additional information.

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Queríamos compartir una actualización sobre tu solicitud de soporte.

Nuestro equipo está revisando el caso y trabajando en una solución.

Te contactaremos nuevamente tan pronto tengamos más información.

Saludos,`,
  },
  {
    id: "hr-interview-invitation",
    category: "hr",
    writerType: "meeting",
    tone: "professional",
    icon: UserRoundCheck,
    name: "Interview invitation",
    nameEs: "Invitación a entrevista",
    description:
      "Invite a candidate to a job interview.",
    descriptionEs:
      "Invita a un candidato a una entrevista laboral.",
    subject:
      "Interview invitation",
    subjectEs:
      "Invitación a entrevista",
    content: `Hi {{contact_first_name}},

Thank you for your interest in joining our team.

We would like to invite you to an interview to learn more about your experience and discuss the opportunity.

Please share your availability for the next few days.

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Gracias por tu interés en formar parte de nuestro equipo.

Queremos invitarte a una entrevista para conocer mejor tu experiencia y conversar sobre la oportunidad.

Por favor, compártenos tu disponibilidad para los próximos días.

Saludos,`,
  },
  {
    id: "hr-rejection",
    category: "hr",
    writerType: "follow-up",
    tone: "professional",
    icon: UserRoundCheck,
    name: "Candidate rejection",
    nameEs: "Rechazo de candidato",
    description:
      "Send a respectful application outcome message.",
    descriptionEs:
      "Envía un mensaje respetuoso sobre el resultado del proceso.",
    subject:
      "Update regarding your application",
    subjectEs:
      "Actualización sobre tu postulación",
    content: `Hi {{contact_first_name}},

Thank you for the time and effort you invested in our selection process.

After careful consideration, we have decided to continue with another candidate whose experience more closely matches our current needs.

We appreciate your interest and wish you success in your professional journey.

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Gracias por el tiempo y esfuerzo que dedicaste a nuestro proceso de selección.

Después de una revisión cuidadosa, decidimos continuar con otro candidato cuyo perfil se ajusta mejor a nuestras necesidades actuales.

Agradecemos tu interés y te deseamos muchos éxitos profesionales.

Saludos,`,
  },
  {
    id: "business-executive-summary",
    category: "business",
    writerType: "proposal",
    tone: "consultative",
    icon: FileText,
    name: "Executive summary",
    nameEs: "Resumen ejecutivo",
    description:
      "Summarize a commercial opportunity or project.",
    descriptionEs:
      "Resume una oportunidad comercial o proyecto.",
    subject:
      "Executive summary — {{deal_name}}",
    subjectEs:
      "Resumen ejecutivo — {{deal_name}}",
    content: `EXECUTIVE SUMMARY

Company
{{company_name}}

Opportunity
{{deal_name}}

Estimated value
{{deal_value}}

Current stage
{{deal_stage}}

Objective

Provide a clear solution that addresses the client's priorities while improving efficiency, visibility, and commercial execution.

Recommended next step

Confirm scope, stakeholders, implementation requirements, and decision timeline.`,
    contentEs: `RESUMEN EJECUTIVO

Empresa
{{company_name}}

Oportunidad
{{deal_name}}

Valor estimado
{{deal_value}}

Etapa actual
{{deal_stage}}

Objetivo

Proporcionar una solución clara que responda a las prioridades del cliente y mejore la eficiencia, visibilidad y ejecución comercial.

Próximo paso recomendado

Confirmar alcance, responsables, requisitos de implementación y cronograma de decisión.`,
  },
  {
    id: "business-project-update",
    category: "business",
    writerType: "follow-up",
    tone: "professional",
    icon: FileText,
    name: "Project update",
    nameEs: "Actualización de proyecto",
    description:
      "Share progress, risks, and next actions with stakeholders.",
    descriptionEs:
      "Comparte avances, riesgos y próximas acciones.",
    subject:
      "Project update — {{deal_name}}",
    subjectEs:
      "Actualización del proyecto — {{deal_name}}",
    content: `Hi {{contact_first_name}},

Here is the latest update regarding {{deal_name}}.

Progress
• Key activities are moving forward
• Main requirements have been reviewed
• Stakeholders remain aligned

Next actions
• Confirm outstanding decisions
• Complete the next deliverables
• Schedule the next progress review

Best regards,`,
    contentEs: `Hola {{contact_first_name}},

Esta es la actualización más reciente sobre {{deal_name}}.

Avances
• Las actividades principales continúan avanzando
• Los requisitos clave fueron revisados
• Los responsables se mantienen alineados

Próximas acciones
• Confirmar decisiones pendientes
• Completar los siguientes entregables
• Programar la próxima revisión

Saludos,`,
  },
];

export const getTemplateCategory = (
  categoryId
) =>
  templateCategories.find(
    (category) => category.id === categoryId
  );