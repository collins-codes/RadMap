import Sidebar from "@/components/sidebar";
import MapWrapper from "@/components/map-wrapper";
import {
  Radio,
  Activity,
  AlertTriangle,
  MapPin,
  Wifi,
  Clock
} from "lucide-react";

const stations = [
  {
    id: "RM-024",
    name: "Nairobi Station",
    location: "Nairobi County",
    reading: "0.18 µSv/h",
    status: "Review required",
    color: "#ffb454",
    updated: "2 minutes ago"
  },
  {
    id: "RM-018",
    name: "Mombasa Station",
    location: "Mombasa County",
    reading: "0.12 µSv/h",
    status: "Normal demo reading",
    color: "#39e0d0",
    updated: "5 minutes ago"
  },
  {
    id: "RM-031",
    name: "Kisumu Station",
    location: "Kisumu County",
    reading: "0.14 µSv/h",
    status: "Normal demo reading",
    color: "#39e0d0",
    updated: "8 minutes ago"
  },
  {
    id: "RM-009",
    name: "Nakuru Station",
    location: "Nakuru County",
    reading: "0.11 µSv/h",
    status: "Normal demo reading",
    color: "#39e0d0",
    updated: "12 minutes ago"
  },
  {
    id: "RM-042",
    name: "Garissa Station",
    location: "Garissa County",
    reading: "Unavailable",
    status: "No recent data",
    color: "#9275ff",
    updated: "No recent update"
  }
];

const metrics = [
  {
    label: "Total Stations",
    value: "128",
    icon: Radio,
    color: "#39e0d0"
  },
  {
    label: "Active Stations",
    value: "124",
    icon: Wifi,
    color: "#39e0d0"
  },
  {
    label: "Flagged Stations",
    value: "03",
    icon: AlertTriangle,
    color: "#ffb454"
  },
  {
    label: "Coverage Areas",
    value: "64",
    icon: MapPin,
    color: "#9275ff"
  }
];

export default function MonitoringPage() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Monitoring Network</h1>
            <p className="subtitle">
              Geographic overview of environmental monitoring stations.
            </p>
          </div>

          <div className="status">
            <span>●</span> SYSTEM ONLINE
          </div>
        </header>

        {/* Network statistics */}
        <section className="stats">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div className="panel" key={metric.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span className="stat-label">{metric.label}</span>
                  <Icon size={19} color={metric.color} />
                </div>

                <div className="stat-value">{metric.value}</div>
                <div className="stat-note">Illustrative demo data</div>
              </div>
            );
          })}
        </section>

        {/* Interactive map */}
        <section className="panel" style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 15
            }}
          >
            <div>
              <h2>Geographic Monitoring Map</h2>
              <p className="panel-description">
                Explore station locations and their reported status.
              </p>
            </div>

            <span
              style={{
                color: "#39e0d0",
                fontSize: 12,
                background: "rgba(57,224,208,0.08)",
                padding: "7px 11px",
                borderRadius: 7
              }}
            >
              <Activity size={13} style={{ display: "inline", marginRight: 5 }} />
              Network overview
            </span>
          </div>

          <div style={{ marginTop: 20 }}>
            <MapWrapper />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              marginTop: 18
            }}
          >
            {[
              { color: "#39e0d0", label: "Normal demo reading" },
              { color: "#ffb454", label: "Review required" },
              { color: "#9275ff", label: "No recent data" }
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#aab6c8",
                  fontSize: 12
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: item.color
                  }}
                />
                {item.label}
              </div>
            ))}
          </div>
        </section>

        {/* Station directory */}
        <section className="panel" style={{ marginTop: 18 }}>
          <div>
            <h2>Monitoring Stations</h2>
            <p className="panel-description">
              Station directory and latest illustrative observations.
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            {stations.map((station) => (
              <div
                className="reading"
                key={station.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  padding: "16px 0"
                }}
              >
                <div>
                  <strong style={{ display: "block", color: "#e7edf7" }}>
                    {station.id}
                  </strong>
                  <span style={{ color: "#8492a8", fontSize: 12 }}>
                    {station.name}
                  </span>
                  <span
                    style={{
                      display: "block",
                      color: "#8492a8",
                      fontSize: 11,
                      marginTop: 3
                    }}
                  >
                    {station.location}
                  </span>
                </div>

                <div>
                  <strong style={{ color: "#e7edf7" }}>
                    {station.reading}
                  </strong>
                  <span
                    style={{
                      display: "block",
                      color: station.color,
                      fontSize: 11,
                      marginTop: 5
                    }}
                  >
                    {station.status}
                  </span>
                </div>

                <div
                  style={{
                    color: "#8492a8",
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Clock size={13} />
                  {station.updated}
                </div>
              </div>
            ))}
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
          Illustrative demonstration data. Station readings are not verified
          environmental measurements.
        </p>
      </main>
    </div>
  );
}
