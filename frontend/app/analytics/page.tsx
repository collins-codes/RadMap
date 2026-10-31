"use client";

import Sidebar from "@/components/sidebar";
import {
  Activity,
  TrendingUp,
  Radio,
  AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const trendData = [
  { time: "08:00", nairobi: 0.12, mombasa: 0.11, kisumu: 0.13 },
  { time: "09:00", nairobi: 0.13, mombasa: 0.12, kisumu: 0.13 },
  { time: "10:00", nairobi: 0.12, mombasa: 0.12, kisumu: 0.14 },
  { time: "11:00", nairobi: 0.14, mombasa: 0.11, kisumu: 0.13 },
  { time: "12:00", nairobi: 0.15, mombasa: 0.13, kisumu: 0.14 },
  { time: "13:00", nairobi: 0.13, mombasa: 0.12, kisumu: 0.15 },
  { time: "14:00", nairobi: 0.18, mombasa: 0.12, kisumu: 0.14 },
  { time: "15:00", nairobi: 0.16, mombasa: 0.13, kisumu: 0.14 }
];

const stationData = [
  { station: "Nairobi", value: 0.18 },
  { station: "Mombasa", value: 0.12 },
  { station: "Kisumu", value: 0.14 },
  { station: "Nakuru", value: 0.11 },
  { station: "Garissa", value: 0.13 }
];

const distributionData = [
  { name: "Normal demo readings", value: 85 },
  { name: "Flagged for review", value: 10 },
  { name: "Unavailable data", value: 5 }
];

const chartColors = ["#39e0d0", "#ffb454", "#9275ff"];

const tooltipStyle = {
  backgroundColor: "#0d1522",
  border: "1px solid #243247",
  borderRadius: 8,
  color: "#e7edf7"
};

export default function AnalyticsPage() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Environmental Analytics</h1>
            <p className="subtitle">
              Explore illustrative trends and patterns across monitoring stations.
            </p>
          </div>

          <div className="status">
            <span>●</span> DEMO DATA
          </div>
        </header>

        {/* Summary metrics */}
        <section className="stats">
          <div className="panel">
            <Activity size={19} color="#39e0d0" />
            <div className="stat-value">2,846</div>
            <div className="stat-label">Observations</div>
            <div className="stat-note">Illustrative dataset</div>
          </div>

          <div className="panel">
            <Radio size={19} color="#39e0d0" />
            <div className="stat-value">128</div>
            <div className="stat-label">Monitoring stations</div>
            <div className="stat-note">Demo network figure</div>
          </div>

          <div className="panel">
            <TrendingUp size={19} color="#ffb454" />
            <div className="stat-value">0.18</div>
            <div className="stat-label">Highest displayed reading</div>
            <div className="stat-note">µSv/h · Demo data</div>
          </div>

          <div className="panel">
            <AlertTriangle size={19} color="#ffb454" />
            <div className="stat-value">07</div>
            <div className="stat-label">Flagged observations</div>
            <div className="stat-note">Requires further review</div>
          </div>
        </section>

        {/* Reading trends */}
        <section className="panel" style={{ marginTop: 18 }}>
          <h2>Observation Trends</h2>
          <p className="panel-description">
            Illustrative readings across three monitoring stations.
          </p>

          <div style={{ width: "100%", height: 330, marginTop: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="#243247" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#8492a8" />
                <YAxis
                  stroke="#8492a8"
                  domain={[0, 0.2]}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="nairobi"
                  name="Nairobi"
                  stroke="#39e0d0"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="mombasa"
                  name="Mombasa"
                  stroke="#9275ff"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="kisumu"
                  name="Kisumu"
                  stroke="#ffb454"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Station comparison */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
            marginTop: 18
          }}
        >
          <div className="panel">
            <h2>Station Comparison</h2>
            <p className="panel-description">
              Displayed reading by station.
            </p>

            <div style={{ width: "100%", height: 280, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stationData}>
                  <CartesianGrid stroke="#243247" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="station"
                    stroke="#8492a8"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="#8492a8" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="value"
                    name="Reading (µSv/h)"
                    fill="#39e0d0"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <h2>Observation Distribution</h2>
            <p className="panel-description">
              Illustrative record categories.
            </p>

            <div style={{ width: "100%", height: 220, marginTop: 15 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {distributionData.map((item, index) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#aab6c8"
                  }}
                >
                  <span>
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: chartColors[index],
                        marginRight: 8
                      }}
                    />
                    {item.name}
                  </span>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p
          style={{
            color: "#8492a8",
            fontSize: 11,
            marginTop: 18,
            textAlign: "center"
          }}
        >
          All charts use illustrative demonstration data. They do not represent
          verified environmental measurements or establish safety levels.
        </p>
      </main>
    </div>
  );
}
