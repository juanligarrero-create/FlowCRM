const DEFAULT_CURRENCY = "USD";

const currencyLocales = {
  USD: {
    en: "en-US",
    es: "es-CO",
  },
  COP: {
    en: "es-CO",
    es: "es-CO",
  },
  EUR: {
    en: "en-IE",
    es: "es-ES",
  },
  GBP: {
    en: "en-GB",
    es: "es-ES",
  },
  AUD: {
    en: "en-AU",
    es: "es-CO",
  },
  CAD: {
    en: "en-CA",
    es: "es-CO",
  },
};

export const availableTemplateVariables = [
  {
    key: "contact_name",
    token: "{{contact_name}}",
    label: "Contact name",
    labelEs: "Nombre del contacto",
  },
  {
    key: "contact_first_name",
    token: "{{contact_first_name}}",
    label: "Contact first name",
    labelEs: "Primer nombre del contacto",
  },
  {
    key: "contact_email",
    token: "{{contact_email}}",
    label: "Contact email",
    labelEs: "Correo del contacto",
  },
  {
    key: "contact_phone",
    token: "{{contact_phone}}",
    label: "Contact phone",
    labelEs: "Teléfono del contacto",
  },
  {
    key: "contact_position",
    token: "{{contact_position}}",
    label: "Contact position",
    labelEs: "Cargo del contacto",
  },
  {
    key: "company_name",
    token: "{{company_name}}",
    label: "Company name",
    labelEs: "Nombre de la empresa",
  },
  {
    key: "company_industry",
    token: "{{company_industry}}",
    label: "Company industry",
    labelEs: "Industria de la empresa",
  },
  {
    key: "company_website",
    token: "{{company_website}}",
    label: "Company website",
    labelEs: "Sitio web de la empresa",
  },
  {
    key: "company_location",
    token: "{{company_location}}",
    label: "Company location",
    labelEs: "Ubicación de la empresa",
  },
  {
    key: "deal_name",
    token: "{{deal_name}}",
    label: "Deal name",
    labelEs: "Nombre del negocio",
  },
  {
    key: "deal_value",
    token: "{{deal_value}}",
    label: "Deal value",
    labelEs: "Valor del negocio",
  },
  {
    key: "deal_currency",
    token: "{{deal_currency}}",
    label: "Deal currency",
    labelEs: "Moneda del negocio",
  },
  {
    key: "deal_probability",
    token: "{{deal_probability}}",
    label: "Deal probability",
    labelEs: "Probabilidad del negocio",
  },
  {
    key: "expected_deal_value",
    token: "{{expected_deal_value}}",
    label: "Expected deal value",
    labelEs: "Valor esperado del negocio",
  },
  {
    key: "deal_stage",
    token: "{{deal_stage}}",
    label: "Deal stage",
    labelEs: "Etapa del negocio",
  },
  {
    key: "deal_close_date",
    token: "{{deal_close_date}}",
    label: "Expected close date",
    labelEs: "Fecha estimada de cierre",
  },
  {
    key: "projected_roi",
    token: "{{projected_roi}}",
    label: "Projected ROI",
    labelEs: "ROI proyectado",
  },
  {
    key: "roi_period",
    token: "{{roi_period}}",
    label: "ROI period",
    labelEs: "Periodo del ROI",
  },
  {
    key: "implementation_cost",
    token: "{{implementation_cost}}",
    label: "Implementation cost",
    labelEs: "Costo de implementación",
  },
  {
    key: "expected_customer_savings",
    token: "{{expected_customer_savings}}",
    label: "Expected customer savings",
    labelEs: "Ahorros esperados del cliente",
  },
  {
    key: "savings_period",
    token: "{{savings_period}}",
    label: "Savings period",
    labelEs: "Periodo de ahorro",
  },
  {
    key: "payback_period",
    token: "{{payback_period}}",
    label: "Payback period",
    labelEs: "Periodo de recuperación",
  },
  {
    key: "contract_duration",
    token: "{{contract_duration}}",
    label: "Contract duration",
    labelEs: "Duración del contrato",
  },
  {
    key: "billing_model",
    token: "{{billing_model}}",
    label: "Billing model",
    labelEs: "Modelo de facturación",
  },
  {
    key: "revenue_type",
    token: "{{revenue_type}}",
    label: "Revenue type",
    labelEs: "Tipo de ingreso",
  },
  {
    key: "expected_annual_value",
    token: "{{expected_annual_value}}",
    label: "Expected annual value",
    labelEs: "Valor anual esperado",
  },
  {
    key: "decision_deadline",
    token: "{{decision_deadline}}",
    label: "Decision deadline",
    labelEs: "Fecha límite de decisión",
  },
  {
    key: "business_problem",
    token: "{{business_problem}}",
    label: "Business problem",
    labelEs: "Problema de negocio",
  },
  {
    key: "solution_summary",
    token: "{{solution_summary}}",
    label: "Solution summary",
    labelEs: "Resumen de la solución",
  },
  {
    key: "success_metric",
    token: "{{success_metric}}",
    label: "Success metric",
    labelEs: "Indicador de éxito",
  },
  {
    key: "deal_owner",
    token: "{{deal_owner}}",
    label: "Deal owner",
    labelEs: "Responsable del negocio",
  },
];

const normalizeText = (value = "") =>
  String(value).trim();

const hasValue = (value) =>
  value !== undefined &&
  value !== null &&
  normalizeText(value) !== "";

const getFirstAvailableValue = (
  object,
  keys,
  fallback = ""
) => {
  if (!object) {
    return fallback;
  }

  for (const key of keys) {
    if (hasValue(object[key])) {
      return object[key];
    }
  }

  return fallback;
};

const getContactName = (contact) =>
  getFirstAvailableValue(
    contact,
    [
      "name",
      "fullName",
      "contactName",
    ],
    ""
  );

const getContactFirstName = (contact) => {
  const fullName = getContactName(contact);

  if (!fullName) {
    return "";
  }

  return fullName.split(/\s+/)[0];
};

const getCompanyName = (company, deal) =>
  getFirstAvailableValue(
    company,
    [
      "name",
      "companyName",
    ],
    getFirstAvailableValue(
      deal,
      [
        "company",
        "companyName",
      ],
      ""
    )
  );

const getDealName = (deal) =>
  getFirstAvailableValue(
    deal,
    [
      "title",
      "name",
      "dealName",
    ],
    ""
  );

const getDealCurrency = (
  deal,
  fallbackCurrency
) =>
  String(
    getFirstAvailableValue(
      deal,
      ["currency"],
      fallbackCurrency ||
        DEFAULT_CURRENCY
    )
  ).toUpperCase();

const getCurrencyLocale = (
  currency,
  language
) => {
  const normalizedCurrency =
    String(
      currency || DEFAULT_CURRENCY
    ).toUpperCase();

  return (
    currencyLocales[
      normalizedCurrency
    ]?.[language] ||
    (language === "es"
      ? "es-CO"
      : "en-US")
  );
};

export const formatTemplateCurrency = (
  value,
  currency = DEFAULT_CURRENCY,
  language = "en"
) => {
  if (!hasValue(value)) {
    return "";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  const normalizedCurrency =
    String(
      currency || DEFAULT_CURRENCY
    ).toUpperCase();

  try {
    return new Intl.NumberFormat(
      getCurrencyLocale(
        normalizedCurrency,
        language
      ),
      {
        style: "currency",
        currency:
          normalizedCurrency,
        maximumFractionDigits: 0,
      }
    ).format(numericValue);
  } catch {
    return `${normalizedCurrency} ${numericValue.toLocaleString()}`;
  }
};
const localizeDuration = (
  value,
  language = "en"
) => {
  if (!hasValue(value)) {
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
    return isMonth
      ? `${amount} ${
          numericAmount === 1
            ? "mes"
            : "meses"
        }`
      : `${amount} ${
          numericAmount === 1
            ? "año"
            : "años"
        }`;
  }

  return isMonth
    ? `${amount} ${
        numericAmount === 1
          ? "month"
          : "months"
      }`
    : `${amount} ${
        numericAmount === 1
          ? "year"
          : "years"
      }`;
};

const formatPercentage = (value) => {
  if (!hasValue(value)) {
    return "";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return `${numericValue}%`;
};

const formatDate = (
  value,
  language = "en"
) => {
  if (!hasValue(value)) {
    return "";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    language === "es"
      ? "es-CO"
      : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
};

export const buildTemplateVariables = ({
  contact,
  company,
  deal,
  currency = DEFAULT_CURRENCY,
  language = "en",
} = {}) => {
  const dealCurrency =
    getDealCurrency(
      deal,
      currency
    );

  const dealValue =
    hasValue(deal?.value)
      ? Number(deal.value)
      : null;

  const probability =
    hasValue(deal?.probability)
      ? Number(deal.probability)
      : null;

  const expectedDealValue =
    dealValue !== null &&
    probability !== null &&
    !Number.isNaN(dealValue) &&
    !Number.isNaN(probability)
      ? dealValue *
        (probability / 100)
      : null;

  return {
    contact_name:
      getContactName(contact),

    contact_first_name:
      getContactFirstName(contact),

    contact_email:
      getFirstAvailableValue(
        contact,
        ["email"],
        ""
      ),

    contact_phone:
      getFirstAvailableValue(
        contact,
        [
          "phone",
          "phoneNumber",
          "mobile",
        ],
        ""
      ),

    contact_position:
      getFirstAvailableValue(
        contact,
        [
          "position",
          "jobTitle",
          "role",
        ],
        ""
      ),

    company_name:
      getCompanyName(
        company,
        deal
      ),

    company_industry:
      getFirstAvailableValue(
        company,
        [
          "industry",
          "sector",
        ],
        ""
      ),

    company_website:
      getFirstAvailableValue(
        company,
        [
          "website",
          "url",
        ],
        ""
      ),

    company_location:
      getFirstAvailableValue(
        company,
        [
          "location",
          "city",
          "country",
          "address",
        ],
        ""
      ),

    deal_name:
      getDealName(deal),

    deal_value:
      dealValue !== null
        ? formatTemplateCurrency(
            dealValue,
            dealCurrency,
            language
          )
        : "",

    deal_currency:
      dealCurrency,

    deal_probability:
      probability !== null &&
      !Number.isNaN(probability)
        ? formatPercentage(
            probability
          )
        : "",

    expected_deal_value:
      expectedDealValue !== null
        ? formatTemplateCurrency(
            expectedDealValue,
            dealCurrency,
            language
          )
        : "",

    deal_stage:
      getFirstAvailableValue(
        deal,
        ["stage"],
        ""
      ),

    deal_close_date:
      formatDate(
        getFirstAvailableValue(
          deal,
          ["closeDate"],
          ""
        ),
        language
      ),

    projected_roi:
      hasValue(
        deal?.projectedRoi
      )
        ? formatPercentage(
            deal.projectedRoi
          )
        : "",

    roi_period:
  localizeDuration(
    getFirstAvailableValue(
      deal,
      ["roiPeriod"],
      ""
    ),
    language
  ),

    implementation_cost:
      hasValue(
        deal?.implementationCost
      )
        ? formatTemplateCurrency(
            deal.implementationCost,
            dealCurrency,
            language
          )
        : "",

    expected_customer_savings:
      hasValue(
        deal?.expectedCustomerSavings
      )
        ? formatTemplateCurrency(
            deal.expectedCustomerSavings,
            dealCurrency,
            language
          )
        : "",

    savings_period:
  localizeDuration(
    getFirstAvailableValue(
      deal,
      ["savingsPeriod"],
      ""
    ),
    language
  ),

    payback_period:
  localizeDuration(
    getFirstAvailableValue(
      deal,
      ["paybackPeriod"],
      ""
    ),
    language
  ),

    contract_duration:
  localizeDuration(
    getFirstAvailableValue(
      deal,
      ["contractDuration"],
      ""
    ),
    language
  ),

    billing_model:
      getFirstAvailableValue(
        deal,
        ["billingModel"],
        ""
      ),

    revenue_type:
      getFirstAvailableValue(
        deal,
        ["revenueType"],
        ""
      ),

    expected_annual_value:
      hasValue(
        deal?.expectedAnnualValue
      )
        ? formatTemplateCurrency(
            deal.expectedAnnualValue,
            dealCurrency,
            language
          )
        : "",

    decision_deadline:
      formatDate(
        getFirstAvailableValue(
          deal,
          ["decisionDeadline"],
          ""
        ),
        language
      ),

    business_problem:
      getFirstAvailableValue(
        deal,
        ["businessProblem"],
        ""
      ),

    solution_summary:
      getFirstAvailableValue(
        deal,
        ["solutionSummary"],
        ""
      ),

    success_metric:
      getFirstAvailableValue(
        deal,
        ["successMetric"],
        ""
      ),

    deal_owner:
      getFirstAvailableValue(
        deal,
        ["owner"],
        ""
      ),
  };
};

const variablePattern =
  /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

export const resolveTemplateVariables = (
  template = "",
  variables = {},
  options = {}
) => {
  const {
    keepUnknownVariables = false,
  } = options;

  return String(template).replace(
    variablePattern,
    (
      completeMatch,
      variableKey
    ) => {
      const value =
        variables[variableKey];

      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        return keepUnknownVariables
          ? completeMatch
          : "";
      }

      return String(value);
    }
  );
};

const removeEmptyLines = (
  value = ""
) =>
  String(value)
    .split("\n")
    .map((line) =>
      line.replace(/[ \t]+$/g, "")
    )
    .filter(
      (line, index, lines) => {
        if (line.trim() !== "") {
          return true;
        }

        const previousLine =
          lines[index - 1];

        return (
          previousLine &&
          previousLine.trim() !== ""
        );
      }
    )
    .join("\n")
    .trim();

export const resolveTemplate = ({
  subject = "",
  content = "",
  contact,
  company,
  deal,
  currency = DEFAULT_CURRENCY,
  language = "en",
  keepUnknownVariables = false,
} = {}) => {
  const variables =
    buildTemplateVariables({
      contact,
      company,
      deal,
      currency,
      language,
    });

  const resolvedSubject =
    resolveTemplateVariables(
      subject,
      variables,
      {
        keepUnknownVariables,
      }
    );

  const resolvedContent =
    resolveTemplateVariables(
      content,
      variables,
      {
        keepUnknownVariables,
      }
    );

  return {
    subject:
      removeEmptyLines(
        resolvedSubject
      ),

    content:
      removeEmptyLines(
        resolvedContent
      ),

    variables,
  };
};