import Sidebar from "@/components/sidebar";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Globe2,
  Radio,
  Zap
} from "lucide-react";

import MapWrapper from "@/components/map-wrapper";

const stats = [
  {
    label: "Monitoring Stations",
    value: "128",
    note: "+8 this month",
    icon: Radio
  },
  {
    label: "Active Readings",
    value: "2,846",
    note: "Live data stream",
    icon: Activity
  },
  {
    label: "Anomalies Detected",
    value: "07",
    note: "3 require review",
    icon: AlertTriangle
  },
  {
    label: "Coverage Areas",
    value: "64",
    note: "Across monitored regions",
    icon: Globe2
  }
];

const alerts = [
  {
    title: "Unusual reading detected",
    detail:
      "Station RM-024 · Reading differs from its historical baseline.",
    tag: "REVIEW REQUIRED"
  },
  {
    title: "Monitoring coverage gap",
    detail:
      "A region has limited recent station observations.",
    tag: "COVERAGE NOTICE"
  },
  {
    title: "Station data received",
    detail:
      "Station RM-018 successfully submitted a new reading.",
    tag: "INFORMATION"
  }
];

const readings = [
  { station: "RM-024", value: "0.18 µSv/h", time: "2 min ago" },
  { station: "RM-018", value: "0.12 µSv/h", time: "5 min ago" },
  { station: "RM-031", value: "0.14 µSv/h", time: "8 min ago" },
  { station: "RM-009", value: "0.11 µSv/h", time: "12 min ago" }
];

export default function Home() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Environmental Overview</h1>
            <p className="subtitle">
              Monitor environmental readings, station activity and emerging
              signals.
            </p>
          </div>

          <div className="status">
            <span>●</span> SYSTEM ONLINE
          </div>
        </header>

        {/* Statistics */}
        <section className="stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="panel" key={stat.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <span className="stat-label">{stat.label}</span>
                  <Icon size={19} color="#39e0d0" />
                </div>

                <div className="stat-value">{stat.value}</div>
                <div className="stat-note">{stat.note}</div>
              </div>
            );
          })}
        </section>

        {/* Monitoring Network and Sentinel */}
        <section className="content-grid">
          <div className="panel">
            <h2>Monitoring Network</h2>
            <p className="panel-description">
              Geographic overview of monitoring activity
            </p>

            <div style={{ marginTop: "22px" }}>
              <MapWrapper />
            </div>
          </div>

          <div className="panel">
            <h2>RadMap Sentinel</h2>
            <p className="panel-description">
              Environmental intelligence and event monitoring
            </p>

            {alerts.map((alert) => (
              <div className="alert" key={alert.title}>
                <div className="alert-tag">{alert.tag}</div>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Readings */}
        <section className="panel" style={{ marginTop: 18 }}>
          <h2>Recent Station Readings</h2>
          <p className="panel-description">
            Latest incoming observations
          </p>

          {readings.map((reading) => (
            <div className="reading" key={reading.station}>
              <span>{reading.station}</span>
              <span>{reading.value}</span>
              <span style={{ color: "#8492a8" }}>
                {reading.time}
              </span>
            </div>
          ))}
        </section>

        <p
          style={{
            color: "#8492a8",
            fontSize: "11px",
            marginTop: "18px",
            textAlign: "center"
          }}
        >
          Demonstration data · Not verified environmental measurements
        </p>
      </main>
    </div>
  );
}