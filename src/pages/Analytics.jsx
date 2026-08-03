import { useMemo, useState } from "react";
import {
  Activity,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Analytics.css";

const pipelineStages = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const chartColors = [
  "#6366f1",
  "#0ea5e9",
  "#f59e0b",
  "#f97316",
  "#10b981",
  "#ef4444",
];

const readStoredArray = (key) => {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);

    return Array.isArray(parsedData) ? parsedData : [];
  } catch {
    return [];
  }
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCompactCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const getMonthKey = (date) => {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return `${parsedDate.getFullYear()}-${String(
    parsedDate.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
};

function Analytics() {
  const [periodFilter, setPeriodFilter] =
    useState("All time");

  const contacts = useMemo(
    () => readStoredArray("flowcrm-contacts"),
    []
  );

  const companies = useMemo(
    () => readStoredArray("flowcrm-companies"),
    []
  );

  const deals = useMemo(
    () => readStoredArray("flowcrm-deals"),
    []
  );

  const tasks = useMemo(
    () => readStoredArray("flowcrm-tasks"),
    []
  );

  const filteredDeals = useMemo(() => {
    if (periodFilter === "All time") {
      return deals;
    }

    const now = new Date();

    const monthsToSubtract =
      periodFilter === "Last 3 months"
        ? 3
        : periodFilter === "Last 6 months"
          ? 6
          : 12;

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthsToSubtract,
      1
    );

    return deals.filter((deal) => {
      if (!deal.closeDate) {
        return false;
      }

      const dealDate = new Date(
        `${deal.closeDate}T00:00:00`
      );

      return dealDate >= startDate;
    });
  }, [deals, periodFilter]);

  const totalPipeline = useMemo(
    () =>
      filteredDeals
        .filter((deal) => deal.stage !== "Lost")
        .reduce(
          (total, deal) =>
            total + Number(deal.value || 0),
          0
        ),
    [filteredDeals]
  );

  const weightedPipeline = useMemo(
    () =>
      filteredDeals
        .filter(
          (deal) =>
            deal.stage !== "Lost" &&
            deal.stage !== "Won"
        )
        .reduce(
          (total, deal) =>
            total +
            Number(deal.value || 0) *
              (Number(deal.probability || 0) / 100),
          0
        ),
    [filteredDeals]
  );

  const wonRevenue = useMemo(
    () =>
      filteredDeals
        .filter((deal) => deal.stage === "Won")
        .reduce(
          (total, deal) =>
            total + Number(deal.value || 0),
          0
        ),
    [filteredDeals]
  );

  const wonDeals = filteredDeals.filter(
    (deal) => deal.stage === "Won"
  ).length;

  const lostDeals = filteredDeals.filter(
    (deal) => deal.stage === "Lost"
  ).length;

  const closedDeals = wonDeals + lostDeals;

  const winRate =
    closedDeals === 0
      ? 0
      : Math.round((wonDeals / closedDeals) * 100);

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const taskCompletionRate =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / tasks.length) * 100
        );

  const averageDealValue =
    filteredDeals.length === 0
      ? 0
      : totalPipeline / filteredDeals.length;

  const pipelineData = useMemo(
    () =>
      pipelineStages.map((stage) => {
        const stageDeals = filteredDeals.filter(
          (deal) => deal.stage === stage
        );

        return {
          stage,
          deals: stageDeals.length,
          value: stageDeals.reduce(
            (total, deal) =>
              total + Number(deal.value || 0),
            0
          ),
          expected: stageDeals.reduce(
            (total, deal) =>
              total +
              Number(deal.value || 0) *
                (Number(deal.probability || 0) / 100),
            0
          ),
        };
      }),
    [filteredDeals]
  );

  const dealOutcomeData = useMemo(
    () => [
      {
        name: "Won",
        value: wonDeals,
      },
      {
        name: "Lost",
        value: lostDeals,
      },
      {
        name: "Open",
        value: filteredDeals.filter(
          (deal) =>
            deal.stage !== "Won" &&
            deal.stage !== "Lost"
        ).length,
      },
    ],
    [filteredDeals, wonDeals, lostDeals]
  );

  const taskStatusData = useMemo(() => {
    const statuses = [
      "To Do",
      "In Progress",
      "Completed",
    ];

    return statuses.map((status) => ({
      name: status,
      value: tasks.filter(
        (task) => task.status === status
      ).length,
    }));
  }, [tasks]);

  const contactStatusData = useMemo(() => {
    const statusCounts = contacts.reduce(
      (counts, contact) => {
        const status =
          contact.status || "Unspecified";

        counts[status] = (counts[status] || 0) + 1;

        return counts;
      },
      {}
    );

    return Object.entries(statusCounts).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [contacts]);

  const monthlyRevenueData = useMemo(() => {
    const monthlyValues = filteredDeals.reduce(
      (months, deal) => {
        const monthKey = getMonthKey(
          deal.closeDate
        );

        if (!monthKey) {
          return months;
        }

        if (!months[monthKey]) {
          months[monthKey] = {
            month: getMonthLabel(monthKey),
            pipeline: 0,
            won: 0,
            expected: 0,
          };
        }

        const dealValue = Number(deal.value || 0);
        const probability = Number(
          deal.probability || 0
        );

        months[monthKey].pipeline += dealValue;
        months[monthKey].expected +=
          dealValue * (probability / 100);

        if (deal.stage === "Won") {
          months[monthKey].won += dealValue;
        }

        return months;
      },
      {}
    );

    return Object.entries(monthlyValues)
      .sort(([monthA], [monthB]) =>
        monthA.localeCompare(monthB)
      )
      .map(([, values]) => values);
  }, [filteredDeals]);

  const companyStatusData = useMemo(() => {
    const statusCounts = companies.reduce(
      (counts, company) => {
        const status =
          company.status || "Unspecified";

        counts[status] = (counts[status] || 0) + 1;

        return counts;
      },
      {}
    );

    return Object.entries(statusCounts).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [companies]);

  const tooltipFormatter = (value, name) => {
    if (
      name === "value" ||
      name === "pipeline" ||
      name === "expected" ||
      name === "won"
    ) {
      return [formatCurrency(value), name];
    }

    return [value, name];
  };
  return (
    <div className="analytics-page">
      <section className="analytics-page__header">
        <div>
          <h1>Analytics</h1>

          <p>
            Review pipeline performance, revenue,
            productivity, and CRM growth.
          </p>
        </div>

        <select
          value={periodFilter}
          onChange={(event) =>
            setPeriodFilter(event.target.value)
          }
        >
          <option value="All time">All time</option>

          <option value="Last 3 months">
            Last 3 months
          </option>

          <option value="Last 6 months">
            Last 6 months
          </option>

          <option value="Last 12 months">
            Last 12 months
          </option>
        </select>
      </section>

      <section className="analytics-page__stats">
        <article className="analytics-stat">
          <div className="analytics-stat__icon">
            <CircleDollarSign size={21} />
          </div>

          <div>
            <span>Total pipeline</span>

            <strong>
              {formatCurrency(totalPipeline)}
            </strong>

            <small>
              {filteredDeals.length} deals
            </small>
          </div>
        </article>

        <article className="analytics-stat">
          <div className="analytics-stat__icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Weighted pipeline</span>

            <strong>
              {formatCurrency(weightedPipeline)}
            </strong>

            <small>Expected open revenue</small>
          </div>
        </article>

        <article className="analytics-stat">
          <div className="analytics-stat__icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Won revenue</span>

            <strong>
              {formatCurrency(wonRevenue)}
            </strong>

            <small>{wonDeals} won deals</small>
          </div>
        </article>

        <article className="analytics-stat">
          <div className="analytics-stat__icon">
            <Target size={21} />
          </div>

          <div>
            <span>Win rate</span>

            <strong>{winRate}%</strong>

            <small>
              Based on closed opportunities
            </small>
          </div>
        </article>
      </section>

      <section className="analytics-page__secondary-stats">
        <article>
          <Users size={19} />

          <div>
            <span>Contacts</span>
            <strong>{contacts.length}</strong>
          </div>
        </article>

        <article>
          <Building2 size={19} />

          <div>
            <span>Companies</span>
            <strong>{companies.length}</strong>
          </div>
        </article>

        <article>
          <Activity size={19} />

          <div>
            <span>Task completion</span>
            <strong>{taskCompletionRate}%</strong>
          </div>
        </article>

        <article>
          <CircleDollarSign size={19} />

          <div>
            <span>Average deal</span>

            <strong>
              {formatCurrency(averageDealValue)}
            </strong>
          </div>
        </article>
      </section>

      <section className="analytics-page__grid">
        <article className="analytics-panel analytics-panel--wide">
          <div className="analytics-panel__header">
            <div>
              <h2>Revenue performance</h2>

              <p>
                Pipeline, expected revenue, and won
                revenue by close month.
              </p>
            </div>

            <TrendingUp size={20} />
          </div>

          <div className="analytics-chart analytics-chart--large">
            {monthlyRevenueData.length === 0 ? (
              <div className="analytics-chart__empty">
                <TrendingUp size={31} />

                <p>No monthly revenue data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={monthlyRevenueData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="pipelineGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.32}
                      />

                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>

                    <linearGradient
                      id="wonGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tickFormatter={formatCompactCurrency}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />

                  <Tooltip
                    formatter={tooltipFormatter}
                  />

                  <Legend />

                  <Area
                    type="monotone"
                    dataKey="pipeline"
                    name="Pipeline"
                    stroke="#6366f1"
                    fill="url(#pipelineGradient)"
                    strokeWidth={2}
                  />

                  <Area
                    type="monotone"
                    dataKey="expected"
                    name="Expected"
                    stroke="#f59e0b"
                    fillOpacity={0}
                    strokeWidth={2}
                  />

                  <Area
                    type="monotone"
                    dataKey="won"
                    name="Won"
                    stroke="#10b981"
                    fill="url(#wonGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="analytics-panel analytics-panel--wide">
          <div className="analytics-panel__header">
            <div>
              <h2>Pipeline by stage</h2>

              <p>
                Deal value and expected revenue across
                the sales funnel.
              </p>
            </div>

            <Target size={20} />
          </div>

          <div className="analytics-chart analytics-chart--large">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={pipelineData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tickFormatter={formatCompactCurrency}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />

                <Tooltip
                  formatter={tooltipFormatter}
                />

                <Legend />

                <Bar
                  dataKey="value"
                  name="Deal value"
                  fill="#6366f1"
                  radius={[7, 7, 0, 0]}
                />

                <Bar
                  dataKey="expected"
                  name="Expected revenue"
                  fill="#f59e0b"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel__header">
            <div>
              <h2>Deal outcomes</h2>
              <p>Won, lost, and open opportunities.</p>
            </div>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={dealOutcomeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {dealOutcomeData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index]}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel__header">
            <div>
              <h2>Task status</h2>
              <p>Current productivity distribution.</p>
            </div>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={taskStatusData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Tasks"
                  fill="#6366f1"
                  radius={[0, 7, 7, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel__header">
            <div>
              <h2>Contact lifecycle</h2>
              <p>Contacts grouped by CRM status.</p>
            </div>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={contactStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={4}
                >
                  {contactStatusData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          chartColors[
                            index %
                              chartColors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel__header">
            <div>
              <h2>Company status</h2>
              <p>Organizations grouped by status.</p>
            </div>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={companyStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={82}
                  paddingAngle={4}
                >
                  {companyStatusData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          chartColors[
                            index %
                              chartColors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Analytics;