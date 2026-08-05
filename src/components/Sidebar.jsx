import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckSquare,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Settings,
  Sparkles,
  Users,
  Clock3,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Contacts",
      path: "/contacts",
      icon: Users,
    },
    {
      name: "Companies",
      path: "/companies",
      icon: Building2,
    },
    {
      name: "Deals",
      path: "/deals",
      icon: BriefcaseBusiness,
    },
    {
  name: "Follow-ups",
  path: "/follow-ups",
  icon: Clock3,
},
    {
      name: "Tasks",
      path: "/tasks",
      icon: CheckSquare,
    },
    {
      name: "WhatsApp",
      path: "/whatsapp",
      icon: MessageCircle,
    },
    {
      name: "Campaigns",
      path: "/campaigns",
      icon: Megaphone,
    },
    {
      name: "Automations",
      path: "/automations",
      icon: Bot,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      name: "AI Writer",
      path: "/ai-writer",
      icon: Sparkles,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">CRM</div>

        <div>
          <h1 className="sidebar__title">FlowCRM</h1>
          <p className="sidebar__subtitle">
            Automation System
          </p>
        </div>
      </div>

      <nav className="sidebar__navigation">
        <p className="sidebar__section-title">
          Workspace
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link ${
                  isActive
                    ? "sidebar__link--active"
                    : ""
                }`
              }
            >
              <span className="sidebar__link-icon">
                <Icon size={18} />
              </span>

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__profile">
          <div className="sidebar__avatar">
            JL
          </div>

          <div>
            <p className="sidebar__profile-name">
              Juan Ligarrero
            </p>

            <p className="sidebar__profile-role">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;