const readJson = (key, fallback = []) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const conditionMatches = (automation, payload) => {
  switch (automation.condition) {
    case "No condition":
      return true;
    case "Contact status is Lead":
      return payload.contact?.status === "Lead";
    case "Deal value is above $10,000":
      return Number(payload.deal?.value || 0) > 10000;
    case "Task priority is High":
      return payload.task?.priority === "High";
    case "Campaign conversion is above 5%":
      return Number(payload.campaign?.conversion || 0) > 5;
    default:
      return false;
  }
};

const createContactTask = (automation, contact) => {
  if (!contact) return false;

  const tasks = readJson("flowcrm-tasks", []);
  const alreadyCreated = tasks.some(
    (task) =>
      String(task.automationSource) === String(automation.id) &&
      String(task.contactId) === String(contact.id)
  );

  if (alreadyCreated) return false;

  const today = new Date().toISOString().slice(0, 10);
  const task = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: `Follow up: ${contact.name}`,
    description: `Automated follow-up created when ${contact.name} was added to the CRM.`,
    status: "To Do",
    priority: "Medium",
    dueDate: today,
    relatedType: "Contact",
    relatedId: String(contact.id),
    relatedName: contact.name,
    contactId: contact.id,
    contactName: contact.name,
    companyName: contact.company || "",
    automationSource: automation.id,
    createdAt: new Date().toISOString(),
  };

  writeJson("flowcrm-tasks", [...tasks, task]);
  return true;
};

const createDealTask = (automation, deal) => {
  if (!deal) return false;

  const tasks = readJson("flowcrm-tasks", []);
  const alreadyCreated = tasks.some(
    (task) =>
      String(task.automationSource) === String(automation.id) &&
      String(task.dealId) === String(deal.id)
  );

  if (alreadyCreated) return false;

  const task = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: `Follow up: ${deal.title}`,
    description: `Automated follow-up created after ${deal.title} moved to ${deal.stage}.`,
    status: "To Do",
    priority: deal.priority || "High",
    dueDate: deal.closeDate || new Date().toISOString().slice(0, 10),
    relatedType: deal.company ? "Company" : "None",
    relatedId: "",
    relatedName: deal.company || "",
    dealId: deal.id,
    dealTitle: deal.title,
    contactName: deal.contact || "",
    companyName: deal.company || "",
    automationSource: automation.id,
    createdAt: new Date().toISOString(),
  };

  writeJson("flowcrm-tasks", [...tasks, task]);
  return true;
};

const createTaskCompletionFollowUp = (automation, completedTask) => {
  if (!completedTask) return false;

  const tasks = readJson("flowcrm-tasks", []);
  const alreadyCreated = tasks.some(
    (task) =>
      String(task.automationSource) === String(automation.id) &&
      String(task.completedTaskId) === String(completedTask.id)
  );

  if (alreadyCreated) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const followUpTask = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: `Next step: ${completedTask.title}`,
    description: `Automated follow-up created after completing “${completedTask.title}”.`,
    status: "To Do",
    priority: completedTask.priority || "Medium",
    dueDate: tomorrow.toISOString().slice(0, 10),
    relatedType: completedTask.relatedType || "None",
    relatedId: String(completedTask.relatedId || ""),
    relatedName:
      completedTask.relatedName || completedTask.relatedTo || "",
    completedTaskId: completedTask.id,
    automationSource: automation.id,
    createdAt: new Date().toISOString(),
  };

  writeJson("flowcrm-tasks", [...tasks, followUpTask]);
  return true;
};

const createCampaignFollowUpTask = (automation, campaign) => {
  if (!campaign) return false;

  const tasks = readJson("flowcrm-tasks", []);
  const alreadyCreated = tasks.some(
    (task) =>
      String(task.automationSource) === String(automation.id) &&
      String(task.campaignId) === String(campaign.id)
  );

  if (alreadyCreated) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const task = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: `Review campaign: ${campaign.name}`,
    description: `Automated follow-up created after the campaign “${campaign.name}” was completed. Conversion: ${Number(campaign.conversion || 0)}%.`,
    status: "To Do",
    priority: "Medium",
    dueDate: tomorrow.toISOString().slice(0, 10),
    relatedType: "None",
    relatedId: "",
    relatedName: campaign.name || "",
    campaignId: campaign.id,
    campaignName: campaign.name || "",
    automationSource: automation.id,
    createdAt: new Date().toISOString(),
  };

  writeJson("flowcrm-tasks", [...tasks, task]);
  return true;
};


const createAutomatedWhatsAppMessage = (automation, contact) => {
  if (!contact) return false;

  const conversations = readJson("flowcrm-whatsapp-messages", {});
  const contactKey = String(contact.id);
  const contactMessages =
    conversations?.[contactKey] ||
    conversations?.[contact.id] ||
    [];

  const alreadySent = contactMessages.some(
    (message) =>
      String(message.automationSource) === String(automation.id)
  );

  if (alreadySent) return false;

  const firstName =
    String(contact.name || "there").trim().split(/\s+/)[0] ||
    "there";

  const automatedMessage = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    sender: "user",
    text: `Hi ${firstName}! Thanks for connecting with us. We received your information and will be in touch shortly.`,
    timestamp: new Date().toISOString(),
    status: "sent",
    automated: true,
    automationSource: automation.id,
    automationName: automation.name || "",
  };

  writeJson("flowcrm-whatsapp-messages", {
    ...(conversations && typeof conversations === "object"
      ? conversations
      : {}),
    [contactKey]: [...contactMessages, automatedMessage],
  });

  window.dispatchEvent(
    new CustomEvent("flowcrm-whatsapp-message-created", {
      detail: {
        contactId: contact.id,
        message: automatedMessage,
      },
    })
  );

  return true;
};


const createAutomatedEmail = (automation, contact, context = {}) => {
  if (!contact?.email) return false;

  const emails = readJson("flowcrm-email-activities", []);
  const sourceRecordId =
    context.sourceRecordId !== undefined && context.sourceRecordId !== null
      ? String(context.sourceRecordId)
      : String(contact.id);

  const alreadySent = emails.some(
    (email) =>
      String(email.automationSource) === String(automation.id) &&
      String(email.sourceRecordId) === sourceRecordId
  );

  if (alreadySent) return false;

  const firstName =
    String(contact.name || "there").trim().split(/\s+/)[0] || "there";

  const subject =
    context.subject ||
    `Welcome to our CRM, ${firstName}`;

  const body =
    context.body ||
    `Hi ${firstName},\n\nThanks for connecting with us. We received your information and will follow up shortly.\n\nBest regards,\nCRM Team`;

  const email = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    contactId: contact.id,
    contactName: contact.name || "",
    to: contact.email,
    subject,
    body,
    status: "sent",
    sentAt: new Date().toISOString(),
    automated: true,
    automationSource: automation.id,
    automationName: automation.name || "",
    trigger: context.trigger || "",
    sourceRecordId,
  };

  writeJson("flowcrm-email-activities", [...emails, email]);

  window.dispatchEvent(
    new CustomEvent("flowcrm-email-created", {
      detail: {
        contactId: contact.id,
        email,
      },
    })
  );

  return true;
};

const findContactForTask = (task) => {
  if (!task) return null;

  const contacts = readJson("flowcrm-contacts", []);

  if (task.relatedType === "Contact" && task.relatedId) {
    const byId = contacts.find(
      (contact) => String(contact.id) === String(task.relatedId)
    );
    if (byId) return byId;
  }

  const taskContactName =
    task.contactName || task.relatedName || task.relatedTo || "";

  if (taskContactName) {
    return contacts.find(
      (contact) =>
        String(contact.name || "").trim().toLowerCase() ===
        String(taskContactName).trim().toLowerCase()
    ) || null;
  }

  return null;
};


const updateContactStatus = (automation, contact) => {
  if (!contact) return false;

  const contacts = readJson("flowcrm-contacts", []);
  const targetStatus = automation.targetContactStatus || "Customer";

  const contactIndex = contacts.findIndex(
    (storedContact) =>
      String(storedContact.id) === String(contact.id)
  );

  if (contactIndex === -1) return false;

  if (contacts[contactIndex].status === targetStatus) {
    return false;
  }

  const updatedContact = {
    ...contacts[contactIndex],
    status: targetStatus,
  };

  const updatedContacts = [...contacts];
  updatedContacts[contactIndex] = updatedContact;

  writeJson("flowcrm-contacts", updatedContacts);

  window.dispatchEvent(
    new CustomEvent("flowcrm-contact-updated", {
      detail: {
        contact: updatedContact,
        automationId: automation.id,
        field: "status",
        value: targetStatus,
      },
    })
  );

  return true;
};


const assignDealOwner = (automation, deal) => {
  if (!deal) return false;

  const deals = readJson("flowcrm-deals", []);
  const targetOwner =
    automation.targetDealOwner || "Juan Ligarrero";

  const dealIndex = deals.findIndex(
    (storedDeal) =>
      String(storedDeal.id) === String(deal.id)
  );

  if (dealIndex === -1) return false;

  if (deals[dealIndex].owner === targetOwner) {
    return false;
  }

  const updatedDeal = {
    ...deals[dealIndex],
    owner: targetOwner,
  };

  const updatedDeals = [...deals];
  updatedDeals[dealIndex] = updatedDeal;

  writeJson("flowcrm-deals", updatedDeals);

  window.dispatchEvent(
    new CustomEvent("flowcrm-deal-updated", {
      detail: {
        deal: updatedDeal,
        automationId: automation.id,
        field: "owner",
        value: targetOwner,
      },
    })
  );

  return true;
};

const executeAction = (automation, trigger, payload) => {
  if (
    automation.action === "Assign deal owner" &&
    trigger === "Deal stage changed"
  ) {
    return assignDealOwner(
      automation,
      payload.deal
    );
  }


  if (
    automation.action === "Update contact status" &&
    trigger === "Contact created"
  ) {
    return updateContactStatus(
      automation,
      payload.contact
    );
  }


  if (
    automation.action === "Send email" &&
    trigger === "Contact created"
  ) {
    return createAutomatedEmail(
      automation,
      payload.contact,
      {
        trigger,
        sourceRecordId: payload.contact?.id,
      }
    );
  }

  if (
    automation.action === "Send email" &&
    trigger === "Task completed"
  ) {
    const contact = findContactForTask(payload.task);
    if (!contact) return false;

    return createAutomatedEmail(
      automation,
      contact,
      {
        trigger,
        sourceRecordId: payload.task?.id,
        subject: `Task completed: ${payload.task?.title || "CRM task"}`,
        body: `Hi ${String(contact.name || "there").trim().split(/\s+/)[0] || "there"},\n\nThe CRM task “${payload.task?.title || "CRM task"}” has been completed. This automated email was generated by the workflow “${automation.name || "Automation"}”.\n\nBest regards,\nCRM Team`,
      }
    );
  }


  if (
    automation.action === "Send WhatsApp message" &&
    trigger === "Contact created"
  ) {
    return createAutomatedWhatsAppMessage(
      automation,
      payload.contact
    );
  }

  if (automation.action === "Create task" && trigger === "Contact created") {
    return createContactTask(automation, payload.contact);
  }

  if (automation.action === "Create task" && trigger === "Deal stage changed") {
    return createDealTask(automation, payload.deal);
  }

  if (automation.action === "Create task" && trigger === "Task completed") {
    return createTaskCompletionFollowUp(automation, payload.task);
  }

  if (automation.action === "Create task" && trigger === "Campaign completed") {
    return createCampaignFollowUpTask(automation, payload.campaign);
  }

  // Actions that have not been wired into a real CRM surface yet remain
  // simulated. Their matching automation still counts as executed.
  return true;
};

export const fireAutomationTrigger = (trigger, payload = {}) => {
  const automations = readJson("flowcrm-automations", []);
  if (!automations.length) return { matched: 0, executed: 0 };

  let matched = 0;
  let executed = 0;
  const now = new Date().toISOString();

  const updatedAutomations = automations.map((automation) => {
    if (
      automation.status !== "Active" ||
      automation.trigger !== trigger ||
      !conditionMatches(automation, payload)
    ) {
      return automation;
    }

    matched += 1;
    const succeeded = executeAction(automation, trigger, payload);
    if (!succeeded) return automation;

    executed += 1;
    return {
      ...automation,
      executions: Number(automation.executions || 0) + 1,
      successfulExecutions: Number(automation.successfulExecutions || 0) + 1,
      lastRun: now,
    };
  });

  if (executed > 0) {
    writeJson("flowcrm-automations", updatedAutomations);
  }

  return { matched, executed };
};
