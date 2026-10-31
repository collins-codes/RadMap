"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import {
  AlertTriangle,
  Activity,
  Clock,
  Search,
  ShieldCheck,
  Eye,
  FileSearch,
  ChevronRight
} from "lucide-react";

const anomalies = [
  {
    id: "ANM-1024",
    observation: "OBS-1024",
    station: "RM-024",
    location: "Nairobi",
    reading: "0.18 µSv/h",
    baseline: "0.12 µSv/h",
    difference: "+50%",
    severity: "Elevated deviation",
    status: "Awaiting review",
    time: "02:10 AM"
  },
  {
    id: "ANM-1016",
    observation: "OBS-1016",
    station: "RM-031",
    location: "Kisumu",
    reading: "0.16 µSv/h",
    baseline: "0.13 µSv/h",
    difference: "+23%",
    severity: "Moderate deviation",
    status: "Under investigation",
    time: "12:45 AM"
  },
  {
    id: "ANM-1008",
    observation: "OBS-1008",
    station: "RM-018",
    location: "Mombasa",
    reading: "0.15 µSv/h",
    baseline: "0.12 µSv/h",
    difference: "+25%",
    severity: "Moderate deviation",
    status: "Reviewed",
    time: "Yesterday"
  }
];

export default function AnomaliesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(anomalies[0]);
  const [reviewed, setReviewed] = useState<string[]>([]);

  const filtered = anomalies.filter((item) =>
    `${item.id} ${item.station} ${item.location} ${item.observation}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const isReviewed = reviewed.includes(selected.id);

  function markReviewed() {
    if (!reviewed.includes(selected.id)) {
      setReviewed((previous) => [...previous, selected.id]);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Anomaly Monitoring</h1>
            <p className="subtitle">
              Investigate observations that differ from station-specific
              historical patterns.
            </p>
          </div>

          <div className="status">
            <span>●</span> DEMO DATA
          </div>
        </header>

        {/* Overview */}
        <section className="stats">
          <div className="panel">
            <AlertTriangle size={19} color="#ffb454" />
            <div className="stat-value">03</div>
            <div className="stat-label">Detected signals</div>
            <div className="stat-note">Illustrative records</div>
          </div>

          <div className="panel">
            <Clock size={19} color="#ffb454" />
            <div className="stat-value">01</div>
            <div className="stat-label">Awaiting review</div>
            <div className="stat-note">Requires human review</div>
          </div>

          <div className="panel">
            <Activity size={19} color="#39e0d0" />
            <div className="stat-value">03</div>
            <div className="stat-label">Baseline comparisons</div>
            <div className="stat-note">Station-specific examples</div>
          </div>

          <div className="panel">
            <ShieldCheck size={19} color="#9275ff" />
            <div className="stat-value">{reviewed.length}</div>
            <div className="stat-label">Reviewed in this session</div>
            <div className="stat-note">Local demonstration state</div>
          </div>
        </section>

        {/* Investigation workspace */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)",
            gap: 18,
            marginTop: 18
          }}
        >
          {/* Signal list */}
          <div className="panel">
            <h2>Detected Signals</h2>
            <p className="panel-description">
              Select a signal to inspect its evidence.
            </p>

            <div style={{ position: "relative", marginTop: 18 }}>
              <Search
                size={16}
                color="#8492a8"
                style={{
                  position: "absolute",
                  left: 12,
                  top: 13
                }}
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search signals..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 12px 12px 38px",
                  background: "#070b14",
                  border: "1px solid #243247",
                  borderRadius: 8,
                  color: "#e7edf7",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 14,
                    marginBottom: 10,
                    borderRadius: 9,
                    border:
                      selected.id === item.id
                        ? "1px solid #39e0d0"
                        : "1px solid #243247",
                    background:
                      selected.id === item.id
                        ? "rgba(57,224,208,0.07)"
                        : "#0a111d",
                    color: "#e7edf7",
                    cursor: "pointer"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8
                    }}
                  >
                    <strong>{item.id}</strong>
                    <ChevronRight size={16} color="#8492a8" />
                  </div>

                  <p
                    style={{
                      color: "#8492a8",
                      fontSize: 12,
                      marginTop: 7
                    }}
                  >
                    {item.station} · {item.location}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 12,
                      gap: 8
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#ffb454" }}>
                      {item.severity}
                    </span>
                    <span style={{ fontSize: 11, color: "#8492a8" }}>
                      {item.difference}
                    </span>
                  </div>
                </button>
              ))}

              {filtered.length === 0 && (
                <p style={{ color: "#8492a8", fontSize: 13, padding: 15 }}>
                  No matching signals found.
                </p>
              )}
            </div>
          </div>

          {/* Investigation details */}
          <div className="panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12
              }}
            >
              <div>
                <div className="alert-tag">SIGNAL INVESTIGATION</div>
                <h2 style={{ marginTop: 8 }}>{selected.id}</h2>
                <p className="panel-description">
                  Observation {selected.observation}
                </p>
              </div>

              <span
                style={{
                  color: isReviewed ? "#39e0d0" : "#ffb454",
                  fontSize: 11
                }}
              >
                ● {isReviewed ? "Reviewed this session" : selected.status}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 22
              }}
            >
              <div className="panel">
                <span className="stat-label">Observed reading</span>
                <div className="stat-value" style={{ fontSize: 22 }}>
                  {selected.reading}
                </div>
              </div>

              <div className="panel">
                <span className="stat-label">Historical baseline</span>
                <div className="stat-value" style={{ fontSize: 22 }}>
                  {selected.baseline}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,180,84,0.07)",
                border: "1px solid rgba(255,180,84,0.2)",
                padding: 15,
                borderRadius: 9,
                marginTop: 16
              }}
            >
              <div style={{ color: "#ffb454", fontSize: 12 }}>
                BASELINE DEVIATION
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  marginTop: 6
                }}
              >
                {selected.difference}
              </div>
              <p
                style={{
                  color: "#aab6c8",
                  fontSize: 12,
                  marginTop: 6,
                  lineHeight: 1.6
                }}
              >
                The illustrative observation differs from the supplied
                historical baseline. This is a screening signal, not proof of
                a hazardous condition.
              </p>
            </div>

            <div style={{ marginTop: 24 }}>
              <h2>Investigation Checklist</h2>

              {[
                "Confirm the observation source and station ID",
                "Compare with the station's historical baseline",
                "Check timestamps and data completeness",
                "Review nearby station observations",
                "Record a human reviewer decision"
              ].map((step, index) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "13px 0",
                    borderBottom: "1px solid #192538"
                  }}
                >
                  <span style={{ color: "#39e0d0", fontSize: 12 }}>
                    0{index + 1}
                  </span>
                  <span style={{ color: "#c5cfdd", fontSize: 12 }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22 }}>
              <button
                onClick={markReviewed}
                disabled={isReviewed}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  width: "100%",
                  padding: 13,
                  border: "none",
                  borderRadius: 8,
                  background: isReviewed ? "#263647" : "#39e0d0",
                  color: isReviewed ? "#aab6c8" : "#07111a",
                  fontWeight: 700,
                  cursor: isReviewed ? "not-allowed" : "pointer"
                }}
              >
                <ShieldCheck size={17} />
                {isReviewed ? "Reviewed in this session" : "Mark as reviewed"}
              </button>

              <p
                style={{
                  fontSize: 11,
                  color: "#8492a8",
                  textAlign: "center",
                  marginTop: 10
                }}
              >
                Demo action only. No permanent review record is saved.
              </p>
            </div>
          </div>
        </section>

        {/* Evidence note */}
        <section className="panel" style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <FileSearch color="#39e0d0" size={22} />
            <div>
              <h2>Evidence Investigation</h2>
              <p className="panel-description">
                Future integration: trace observations, baseline calculations,
                station metadata and reviewer decisions.
              </p>
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
          Illustrative demonstration records only. Anomaly flags do not
          establish radiation danger or health risk. Verified measurements
          and qualified human review are required.
        </p>
      </main>
    </div>
  );
}
