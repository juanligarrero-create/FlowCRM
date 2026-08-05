const normalizeValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value);
};

const getFirstName = (fullName = "") =>
  normalizeValue(fullName)
    .trim()
    .split(/\s+/)[0] || "";

const getContactName = (contact) =>
  contact?.name ||
  contact?.fullName ||
  contact?.contactName ||
  "";

const getCompanyName = (company, deal) =>
  company?.name ||
  company?.companyName ||
  deal?.company ||
  deal?.companyName ||
  "";

const getDealName = (deal) =>
  deal?.title || deal?.name || "";

const formatCurrency = (
  value,
  currency = "USD",
  language = "en"
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

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
    ).format(Number(value));
  } catch {
    return normalizeValue(value);
  }
};

const formatToday = (language = "en") =>
  new Intl.DateTimeFormat(
    language === "es"
      ? "es-CO"
      : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(new Date());

export const buildTemplateVariables = ({
  contact = null,
  company = null,
  deal = null,
  currency = "USD",
  language = "en",
} = {}) => {
  const contactName = getContactName(contact);

  return {
    contact_name: contactName,
    contact_first_name:
      getFirstName(contactName),
    contact_email:
      contact?.email || "",
    contact_phone:
      contact?.phone || "",
    company_name:
      getCompanyName(company, deal),
    deal_name:
      getDealName(deal),
    deal_value:
      formatCurrency(
        deal?.value,
        currency,
        language
      ),
    deal_stage:
      deal?.stage || "",
    deal_probability:
      deal?.probability !== undefined &&
      deal?.probability !== null &&
      deal?.probability !== ""
        ? `${deal.probability}%`
        : "",
    today:
      formatToday(language),
    current_year:
      String(new Date().getFullYear()),
  };
};

export const resolveTemplateVariables = (
  template = "",
  variables = {},
  options = {}
) => {
  const {
    keepUnknownVariables = true,
    emptyFallback = "",
  } = options;

  return String(template).replace(
    /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
    (match, variableName) => {
      if (
        Object.prototype.hasOwnProperty.call(
          variables,
          variableName
        )
      ) {
        const value =
          variables[variableName];

        return value === null ||
          value === undefined ||
          value === ""
          ? emptyFallback
          : String(value);
      }

      return keepUnknownVariables
        ? match
        : emptyFallback;
    }
  );
};

export const resolveTemplate = ({
  subject = "",
  content = "",
  contact = null,
  company = null,
  deal = null,
  currency = "USD",
  language = "en",
  keepUnknownVariables = true,
} = {}) => {
  const variables =
    buildTemplateVariables({
      contact,
      company,
      deal,
      currency,
      language,
    });

  return {
    subject:
      resolveTemplateVariables(
        subject,
        variables,
        {
          keepUnknownVariables,
        }
      ),
    content:
      resolveTemplateVariables(
        content,
        variables,
        {
          keepUnknownVariables,
        }
      ),
    variables,
  };
};

export const availableTemplateVariables = [
  {
    key: "contact_name",
    token: "{{contact_name}}",
    label: "Contact name",
    labelEs: "Nombre del contacto",
    group: "contact",
  },
  {
    key: "contact_first_name",
    token: "{{contact_first_name}}",
    label: "Contact first name",
    labelEs: "Primer nombre",
    group: "contact",
  },
  {
    key: "contact_email",
    token: "{{contact_email}}",
    label: "Contact email",
    labelEs: "Correo del contacto",
    group: "contact",
  },
  {
    key: "contact_phone",
    token: "{{contact_phone}}",
    label: "Contact phone",
    labelEs: "Teléfono del contacto",
    group: "contact",
  },
  {
    key: "company_name",
    token: "{{company_name}}",
    label: "Company name",
    labelEs: "Nombre de la empresa",
    group: "company",
  },
  {
    key: "deal_name",
    token: "{{deal_name}}",
    label: "Deal name",
    labelEs: "Nombre del negocio",
    group: "deal",
  },
  {
    key: "deal_value",
    token: "{{deal_value}}",
    label: "Deal value",
    labelEs: "Valor del negocio",
    group: "deal",
  },
  {
    key: "deal_stage",
    token: "{{deal_stage}}",
    label: "Deal stage",
    labelEs: "Etapa del negocio",
    group: "deal",
  },
  {
    key: "deal_probability",
    token: "{{deal_probability}}",
    label: "Deal probability",
    labelEs: "Probabilidad del negocio",
    group: "deal",
  },
  {
    key: "today",
    token: "{{today}}",
    label: "Current date",
    labelEs: "Fecha actual",
    group: "date",
  },
  {
    key: "current_year",
    token: "{{current_year}}",
    label: "Current year",
    labelEs: "Año actual",
    group: "date",
  },
];