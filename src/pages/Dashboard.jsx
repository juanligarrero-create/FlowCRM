import "./Dashboard.css";
import {
  Users,
  DollarSign,
  MessageCircle,
  Bot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const stats = [
    {
      title: "Total Contacts",
      value: "245",
      change: "+12% this month",
      icon: Users,
    },
    {
      title: "Sales Revenue",
      value: "$18,400",
      change: "+8.4% this month",
      icon: DollarSign,
    },
    {
      title: "WhatsApp Messages",
      value: "83",
      change: "+21% this week",
      icon: MessageCircle,
    },
    {
      title: "Active Automations",
      value: "12",
      change: "3 running today",
      icon: Bot,
    },
  ];
  return (
    <div className="dashboard">
      <section className="dashboard__header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Juan. Here is what is happening today.</p>
        </div>

        <button
          type="button"
          className="dashboard__button"
          onClick={() => navigate("/contacts")}
        >
          + New Contact
        </button>
      </section>

      <section className="dashboard__stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="dashboard__card" key={stat.title}>
              <div className="dashboard__card-icon">
                <Icon size={22} />
              </div>

              <p className="dashboard__card-title">{stat.title}</p>
              <h2>{stat.value}</h2>
              <p className="dashboard__card-change">{stat.change}</p>
            </article>
          );
        })}
      </section>
      <section className="dashboard__content">
        <article className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest updates from your CRM</p>
            </div>

            <button className="dashboard__text-button">View all</button>
          </div>

          <div className="dashboard__activity-list">
            <div className="dashboard__activity">
              <div className="dashboard__activity-icon">JM</div>

              <div>
                <p>
                  <strong>James Miller</strong> replied on WhatsApp
                </p>
                <span>10 minutes ago</span>
              </div>
            </div>

            <div className="dashboard__activity">
              <div className="dashboard__activity-icon">AL</div>

              <div>
                <p>
                  <strong>Anna Lopez</strong> was added as a new lead
                </p>
                <span>35 minutes ago</span>
              </div>
            </div>

            <div className="dashboard__activity">
              <div className="dashboard__activity-icon">CRM</div>

              <div>
                <p>
                  Follow-up automation completed for <strong>12 contacts</strong>
                </p>
                <span>1 hour ago</span>
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard__panel">
          <div className="dashboard__panel-header">
            <div>
              <h2>Upcoming Tasks</h2>
              <p>Your priorities for today</p>
            </div>

            <button className="dashboard__text-button">+ Add task</button>
          </div>

          <div className="dashboard__task-list">
            <label className="dashboard__task">
              <input type="checkbox" />
              <span>
                Call Sarah Johnson
                <small>10:30 AM</small>
              </span>
            </label>

            <label className="dashboard__task">
              <input type="checkbox" />
              <span>
                Send proposal to GreenTech
                <small>1:00 PM</small>
              </span>
            </label>

            <label className="dashboard__task">
              <input type="checkbox" />
              <span>
                Review campaign performance
                <small>3:30 PM</small>
              </span>
            </label>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;