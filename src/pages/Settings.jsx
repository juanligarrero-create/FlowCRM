import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  Database,
  Download,
  Globe2,
  Languages,
  LayoutDashboard,
  Mail,
  Moon,
  Palette,
  Phone,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import "./Settings.css";

const defaultSettings = {
  profile: {
    fullName: "Juan Ligarrero",
    email: "juan@example.com",
    jobTitle: "Administrator",
    company: "FlowCRM",
    phone: "+57 300 000 0000",
  },

  workspace: {
    name: "FlowCRM Workspace",
    timezone: "America/Bogota",
    currency: "USD",
    language: "English",
  },

  notifications: {
    emailNotifications: true,
    desktopNotifications: true,
    whatsappAlerts: true,
    marketingReports: false,
    taskReminders: true,
    dealAlerts: true,
  },

  appearance: {
    theme: "system",
    compactMode: false,
    reducedMotion: false,
    collapsedSidebar: false,
  },
};

const settingsSections = [
  {
    id: "profile",
    label: "Profile",
    description: "Personal information",
    icon: UserRound,
  },
  {
    id: "workspace",
    label: "Workspace",
    description: "Organization preferences",
    icon: Building2,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and reports",
    icon: Bell,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and layout",
    icon: Palette,
  },
  {
    id: "data",
    label: "Data management",
    description: "Export and reset data",
    icon: Database,
  },
];

const readSavedSettings = () => {
  const savedSettings = localStorage.getItem(
    "flowcrm-settings"
  );

  if (!savedSettings) {
    return defaultSettings;
  }

  try {
    const parsedSettings = JSON.parse(savedSettings);

    return {
      profile: {
        ...defaultSettings.profile,
        ...(parsedSettings.profile || {}),
      },

      workspace: {
        ...defaultSettings.workspace,
        ...(parsedSettings.workspace || {}),
      },

      notifications: {
        ...defaultSettings.notifications,
        ...(parsedSettings.notifications || {}),
      },

      appearance: {
        ...defaultSettings.appearance,
        ...(parsedSettings.appearance || {}),
      },
    };
  } catch {
    return defaultSettings;
  }
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function Settings() {
  const toast = useToast();

  const [settings, setSettings] = useState(
    readSavedSettings
  );

  const [savedSettings, setSavedSettings] =
    useState(readSavedSettings);

  const [activeSection, setActiveSection] =
    useState("profile");

  const [confirmationAction, setConfirmationAction] =
    useState(null);

  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(settings) !==
      JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [hasUnsavedChanges]);

  const updateProfile = (field, value) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      profile: {
        ...currentSettings.profile,
        [field]: value,
      },
    }));
  };

  const updateWorkspace = (field, value) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      workspace: {
        ...currentSettings.workspace,
        [field]: value,
      },
    }));
  };

  const updateNotification = (field) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      notifications: {
        ...currentSettings.notifications,
        [field]:
          !currentSettings.notifications[field],
      },
    }));
  };

  const updateAppearance = (field, value) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      appearance: {
        ...currentSettings.appearance,
        [field]: value,
      },
    }));

    if (field === "theme") {
      applyTheme(value);
    }
  };

  const applyTheme = (theme) => {
    const prefersDark =
      window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches;

    const resolvedTheme =
      theme === "system"
        ? prefersDark
          ? "dark"
          : "light"
        : theme;

    document.documentElement.setAttribute(
      "data-theme",
      resolvedTheme
    );

    localStorage.setItem(
      "flowcrm-theme",
      resolvedTheme
    );
  };

  const handleSaveSettings = () => {
    const normalizedSettings = {
      ...settings,

      profile: {
        ...settings.profile,
        fullName:
          settings.profile.fullName.trim(),
        email: settings.profile.email.trim(),
        jobTitle:
          settings.profile.jobTitle.trim(),
        company: settings.profile.company.trim(),
        phone: settings.profile.phone.trim(),
      },

      workspace: {
        ...settings.workspace,
        name: settings.workspace.name.trim(),
      },
    };

    if (
      !normalizedSettings.profile.fullName ||
      !normalizedSettings.profile.email ||
      !normalizedSettings.workspace.name
    ) {
      toast.error(
        "Required fields missing",
        "Name, email, and workspace name are required."
      );
      return;
    }

    localStorage.setItem(
      "flowcrm-settings",
      JSON.stringify(normalizedSettings)
    );

    setSettings(normalizedSettings);
    setSavedSettings(normalizedSettings);

    applyTheme(
      normalizedSettings.appearance.theme
    );

    toast.success(
      "Settings saved",
      "Your profile and workspace preferences were updated."
    );
  };

  const discardChanges = () => {
    setSettings(savedSettings);

    applyTheme(
      savedSettings.appearance.theme
    );

    toast.info(
      "Changes discarded",
      "Your unsaved settings were restored."
    );
  };

  const exportCRMData = () => {
    const exportData = {};

    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {
      const key = localStorage.key(index);

      if (!key?.startsWith("flowcrm-")) {
        continue;
      }

      const storedValue = localStorage.getItem(key);

      try {
        exportData[key] = JSON.parse(storedValue);
      } catch {
        exportData[key] = storedValue;
      }
    }

    const exportFile = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            application: "FlowCRM",
            data: exportData,
          },
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const fileUrl = URL.createObjectURL(exportFile);
    const downloadLink =
      document.createElement("a");

    const dateString = new Date()
      .toISOString()
      .split("T")[0];

    downloadLink.href = fileUrl;
    downloadLink.download =
      `flowcrm-export-${dateString}.json`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(fileUrl);

    toast.success(
      "CRM data exported",
      "Your FlowCRM JSON backup was downloaded."
    );
  };

  const requestRestoreDefaults = () => {
    setConfirmationAction({
      type: "restore",
      title: "Restore default settings?",
      message:
        "Your profile, workspace, notification, and appearance preferences will return to their default values.",
      confirmLabel: "Restore defaults",
      variant: "warning",
    });
  };

  const requestClearData = () => {
    setConfirmationAction({
      type: "clear",
      title: "Clear all CRM data?",
      message:
        "This will permanently remove contacts, companies, deals, tasks, campaigns, automations, conversations, notifications, and settings stored in this browser.",
      confirmLabel: "Clear all data",
      variant: "danger",
    });
  };

  const confirmSettingsAction = () => {
    if (!confirmationAction) {
      return;
    }

    if (confirmationAction.type === "restore") {
      setSettings(defaultSettings);
      setSavedSettings(defaultSettings);

      localStorage.setItem(
        "flowcrm-settings",
        JSON.stringify(defaultSettings)
      );

      applyTheme(
        defaultSettings.appearance.theme
      );

      toast.success(
        "Defaults restored",
        "Your settings were returned to their original values."
      );
    }

    if (confirmationAction.type === "clear") {
      const keysToRemove = [];

      for (
        let index = 0;
        index < localStorage.length;
        index += 1
      ) {
        const key = localStorage.key(index);

        if (key?.startsWith("flowcrm-")) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      setSettings(defaultSettings);
      setSavedSettings(defaultSettings);

      applyTheme(
        defaultSettings.appearance.theme
      );

      toast.success(
        "CRM data cleared",
        "Local CRM records were removed. Refresh to restore demo data."
      );
    }

    setConfirmationAction(null);
  };

  const profileInitials = getInitials(
    settings.profile.fullName
  );
  return (
    <div className="settings-page">
      <section className="settings-page__header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your profile, workspace, alerts,
            appearance, and CRM data.
          </p>
        </div>

        <div className="settings-page__header-actions">
          {hasUnsavedChanges && (
            <button
              type="button"
              className="settings-page__discard"
              onClick={discardChanges}
            >
              Discard
            </button>
          )}

          <button
            type="button"
            className="settings-page__save"
            disabled={!hasUnsavedChanges}
            onClick={handleSaveSettings}
          >
            <Save size={17} />
            Save Changes
          </button>
        </div>
      </section>

      {hasUnsavedChanges && (
        <section className="settings-page__unsaved">
          <span />

          <div>
            <strong>Unsaved changes</strong>

            <p>
              Save your updates before leaving this
              page.
            </p>
          </div>
        </section>
      )}

      <section className="settings-layout">
        <aside className="settings-navigation">
          <div className="settings-navigation__profile">
            <div className="settings-avatar">
              {profileInitials || "JL"}
            </div>

            <div>
              <strong>
                {settings.profile.fullName ||
                  "FlowCRM User"}
              </strong>

              <span>
                {settings.profile.email ||
                  "No email"}
              </span>
            </div>
          </div>

          <nav>
            {settingsSections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  type="button"
                  className={
                    activeSection === section.id
                      ? "settings-navigation__item settings-navigation__item--active"
                      : "settings-navigation__item"
                  }
                  key={section.id}
                  onClick={() =>
                    setActiveSection(section.id)
                  }
                >
                  <div>
                    <Icon size={18} />
                  </div>

                  <span>
                    <strong>{section.label}</strong>

                    <small>
                      {section.description}
                    </small>
                  </span>

                  <ChevronRight size={16} />
                </button>
              );
            })}
          </nav>

          <div className="settings-navigation__security">
            <ShieldCheck size={18} />

            <div>
              <strong>Local portfolio demo</strong>

              <p>
                CRM data is stored only in this
                browser.
              </p>
            </div>
          </div>
        </aside>

        <main className="settings-content">
          {activeSection === "profile" && (
            <section className="settings-panel">
              <header className="settings-panel__header">
                <div>
                  <h2>Profile information</h2>

                  <p>
                    Update the user details displayed
                    throughout FlowCRM.
                  </p>
                </div>

                <UserRound size={21} />
              </header>

              <div className="settings-profile-preview">
                <div className="settings-avatar settings-avatar--large">
                  {profileInitials || "JL"}
                </div>

                <div>
                  <strong>
                    {settings.profile.fullName ||
                      "FlowCRM User"}
                  </strong>

                  <span>
                    {settings.profile.jobTitle ||
                      "CRM user"}
                  </span>
                </div>
              </div>

              <div className="settings-form-grid">
                <label>
                  <span>
                    <UserRound size={15} />
                    Full name
                  </span>

                  <input
                    type="text"
                    value={
                      settings.profile.fullName
                    }
                    onChange={(event) =>
                      updateProfile(
                        "fullName",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    <Mail size={15} />
                    Email address
                  </span>

                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(event) =>
                      updateProfile(
                        "email",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    <BriefcaseBusiness size={15} />
                    Job title
                  </span>

                  <input
                    type="text"
                    value={
                      settings.profile.jobTitle
                    }
                    onChange={(event) =>
                      updateProfile(
                        "jobTitle",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    <Building2 size={15} />
                    Company
                  </span>

                  <input
                    type="text"
                    value={
                      settings.profile.company
                    }
                    onChange={(event) =>
                      updateProfile(
                        "company",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="settings-form-grid__wide">
                  <span>
                    <Phone size={15} />
                    Phone number
                  </span>

                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(event) =>
                      updateProfile(
                        "phone",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            </section>
          )}

          {activeSection === "workspace" && (
            <section className="settings-panel">
              <header className="settings-panel__header">
                <div>
                  <h2>Workspace preferences</h2>

                  <p>
                    Configure regional and organizational
                    defaults.
                  </p>
                </div>

                <Building2 size={21} />
              </header>

              <div className="settings-form-grid">
                <label className="settings-form-grid__wide">
                  <span>
                    <LayoutDashboard size={15} />
                    Workspace name
                  </span>

                  <input
                    type="text"
                    value={
                      settings.workspace.name
                    }
                    onChange={(event) =>
                      updateWorkspace(
                        "name",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    <Globe2 size={15} />
                    Time zone
                  </span>

                  <select
                    value={
                      settings.workspace.timezone
                    }
                    onChange={(event) =>
                      updateWorkspace(
                        "timezone",
                        event.target.value
                      )
                    }
                  >
                    <option value="America/Bogota">
                      Bogotá — GMT-5
                    </option>

                    <option value="America/New_York">
                      New York
                    </option>

                    <option value="Europe/London">
                      London
                    </option>

                    <option value="Australia/Melbourne">
                      Melbourne
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    <Settings2 size={15} />
                    Currency
                  </span>

                  <select
                    value={
                      settings.workspace.currency
                    }
                    onChange={(event) =>
                      updateWorkspace(
                        "currency",
                        event.target.value
                      )
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="COP">COP</option>
                    <option value="AUD">AUD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </label>

                <label>
                  <span>
                    <Languages size={15} />
                    Language
                  </span>

                  <select
                    value={
                      settings.workspace.language
                    }
                    onChange={(event) =>
                      updateWorkspace(
                        "language",
                        event.target.value
                      )
                    }
                  >
                    <option value="English">
                      English
                    </option>

                    <option value="Spanish">
                      Spanish
                    </option>
                  </select>
                </label>
              </div>
            </section>
          )}

          {activeSection === "notifications" && (
            <section className="settings-panel">
              <header className="settings-panel__header">
                <div>
                  <h2>Notification preferences</h2>

                  <p>
                    Choose which CRM events should alert
                    you.
                  </p>
                </div>

                <Bell size={21} />
              </header>

              <div className="settings-options">
                {[
                  {
                    key: "emailNotifications",
                    title: "Email notifications",
                    description:
                      "Receive important CRM activity by email.",
                    icon: Mail,
                  },
                  {
                    key: "desktopNotifications",
                    title: "Desktop notifications",
                    description:
                      "Display browser alerts while FlowCRM is open.",
                    icon: Bell,
                  },
                  {
                    key: "whatsappAlerts",
                    title: "WhatsApp alerts",
                    description:
                      "Receive simulated WhatsApp workflow alerts.",
                    icon: Phone,
                  },
                  {
                    key: "marketingReports",
                    title: "Marketing reports",
                    description:
                      "Receive periodic campaign-performance summaries.",
                    icon: BriefcaseBusiness,
                  },
                  {
                    key: "taskReminders",
                    title: "Task reminders",
                    description:
                      "Alert me about overdue and upcoming tasks.",
                    icon: Check,
                  },
                  {
                    key: "dealAlerts",
                    title: "Deal alerts",
                    description:
                      "Notify me when opportunities approach their close date.",
                    icon: BriefcaseBusiness,
                  },
                ].map((option) => {
                  const Icon = option.icon;

                  return (
                    <article
                      className="settings-option"
                      key={option.key}
                    >
                      <div className="settings-option__icon">
                        <Icon size={18} />
                      </div>

                      <div className="settings-option__copy">
                        <strong>{option.title}</strong>

                        <p>{option.description}</p>
                      </div>

                      <button
                        type="button"
                        className={
                          settings.notifications[
                            option.key
                          ]
                            ? "settings-switch settings-switch--active"
                            : "settings-switch"
                        }
                        aria-pressed={
                          settings.notifications[
                            option.key
                          ]
                        }
                        onClick={() =>
                          updateNotification(
                            option.key
                          )
                        }
                      >
                        <span />
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {activeSection === "appearance" && (
            <section className="settings-panel">
              <header className="settings-panel__header">
                <div>
                  <h2>Appearance</h2>

                  <p>
                    Personalize how FlowCRM looks and
                    behaves.
                  </p>
                </div>

                <Palette size={21} />
              </header>

              <div className="settings-theme-options">
                {[
                  {
                    value: "light",
                    label: "Light",
                    icon: Sun,
                  },
                  {
                    value: "dark",
                    label: "Dark",
                    icon: Moon,
                  },
                  {
                    value: "system",
                    label: "System",
                    icon: Settings2,
                  },
                ].map((themeOption) => {
                  const Icon = themeOption.icon;

                  return (
                    <button
                      type="button"
                      className={
                        settings.appearance.theme ===
                        themeOption.value
                          ? "settings-theme-card settings-theme-card--active"
                          : "settings-theme-card"
                      }
                      key={themeOption.value}
                      onClick={() =>
                        updateAppearance(
                          "theme",
                          themeOption.value
                        )
                      }
                    >
                      <div>
                        <Icon size={22} />
                      </div>

                      <strong>
                        {themeOption.label}
                      </strong>

                      {settings.appearance.theme ===
                        themeOption.value && (
                        <Check size={16} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="settings-options settings-options--appearance">
                {[
                  {
                    key: "compactMode",
                    title: "Compact mode",
                    description:
                      "Reduce spacing to display more CRM records.",
                  },
                  {
                    key: "reducedMotion",
                    title: "Reduce motion",
                    description:
                      "Minimize interface animations and transitions.",
                  },
                  {
                    key: "collapsedSidebar",
                    title: "Collapsed sidebar",
                    description:
                      "Prefer a smaller navigation sidebar.",
                  },
                ].map((option) => (
                  <article
                    className="settings-option"
                    key={option.key}
                  >
                    <div className="settings-option__copy">
                      <strong>{option.title}</strong>

                      <p>{option.description}</p>
                    </div>

                    <button
                      type="button"
                      className={
                        settings.appearance[
                          option.key
                        ]
                          ? "settings-switch settings-switch--active"
                          : "settings-switch"
                      }
                      aria-pressed={
                        settings.appearance[
                          option.key
                        ]
                      }
                      onClick={() =>
                        updateAppearance(
                          option.key,
                          !settings.appearance[
                            option.key
                          ]
                        )
                      }
                    >
                      <span />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeSection === "data" && (
            <section className="settings-panel">
              <header className="settings-panel__header">
                <div>
                  <h2>Data management</h2>

                  <p>
                    Export or reset records stored in this
                    browser.
                  </p>
                </div>

                <Database size={21} />
              </header>

              <div className="settings-data-actions">
                <article>
                  <div className="settings-data-actions__icon">
                    <Download size={20} />
                  </div>

                  <div>
                    <strong>Export CRM data</strong>

                    <p>
                      Download contacts, companies, deals,
                      tasks, campaigns, and settings as
                      JSON.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={exportCRMData}
                  >
                    Export data
                  </button>
                </article>

                <article>
                  <div className="settings-data-actions__icon">
                    <RefreshCcw size={20} />
                  </div>

                  <div>
                    <strong>Restore default settings</strong>
                    <p>
                      Reset profile, workspace,
                      notifications, and appearance only.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      requestRestoreDefaults
                    }
                  >
                    Restore defaults
                  </button>
                </article>

                <article className="settings-data-actions__danger">
                  <div className="settings-data-actions__icon">
                    <Trash2 size={20} />
                  </div>

                  <div>
                    <strong>Clear all CRM data</strong>

                    <p>
                      Permanently remove all FlowCRM data
                      stored in this browser.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={requestClearData}
                  >
                    Clear all data
                  </button>
                </article>
              </div>
            </section>
          )}
        </main>
      </section>

      <ConfirmDialog
        isOpen={confirmationAction !== null}
        title={
          confirmationAction?.title ||
          "Confirm action"
        }
        message={
          confirmationAction?.message || ""
        }
        confirmLabel={
          confirmationAction?.confirmLabel ||
          "Confirm"
        }
        variant={
          confirmationAction?.variant ||
          "warning"
        }
        onCancel={() =>
          setConfirmationAction(null)
        }
        onConfirm={confirmSettingsAction}
      />
    </div>
  );
}

export default Settings;