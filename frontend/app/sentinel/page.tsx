import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Database,
  FileSearch,
  ShieldAlert,
  TrendingUp
} from "lucide-react";

const observations = [
  { id: "OBS-1024", station: "RM-024", value: "0.18 µSv/h", time: "10:42 AM", status: "Flagged" },
  { id: "OBS-1018", station: "RM-018", value: "0.12 µSv/h", time: "10:38 AM", status: "Normal" },
  { id: "OBS-1031", station: "RM-031", value: "0.14 µSv/h", time: "10:31 AM", status: "Normal" },
  { id: "OBS-1009", station: "RM-009", value: "0.11 µSv/h", time: "10:25 AM", status: "Normal" }
];

export default function SentinelPage() {
  return (
    <main style={{ padding: "35px", maxWidth: "1500px", margin: "auto" }}>
      <a href="/" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "#8293a8",
        textDecoration: "none",
        fontSize: "13px",
        marginBottom: "30px"
      }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </a>

      <header style={{ marginBottom: "32px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "9px",
          color: "#39e0d0",
          fontSize: "11px",
          letterSpacing: "2px",
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          <BrainCircuit size={17} /> ENVIRONMENTAL INTELLIGENCE ENGINE
        </div>

        <h1 style={{ fontSize: "30px", margin: "0 0 10px" }}>
          RadMap Sentinel
        </h1>

        <p style={{ color: "#8293a8", fontSize: "13px" }}>
          Investigate environmental signals, compare historical baselines and review evidence.
        </p>
      </header>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "16px",
        marginBottom: "22px"
      }}>
        {[
          { label: "Signals detected", value: "07", icon: Activity },
          { label: "Awaiting review", value: "03", icon: Clock },
          { label: "Baseline comparisons", value: "128", icon: TrendingUp },
          { label: "Evidence records", value: "246", icon: Database }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div className="panel" key={item.label}>
              <Icon size={20} color="#39e0d0" />
              <p className="stat-label">{item.label}</p>
              <div className="stat-value">{item.value}</div>
            </div>
          );
        })}
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, 1fr)",
        gap: "18px",
        marginBottom: "20px"
      }}>
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldAlert color="#ffb454" size={20} />
            <h2>Signal investigation</h2>
          </div>

          <p className="panel-description">
            Station RM-024 · Observation OBS-1024
          </p>

          <div style={{
            background: "#172333",
            border: "1px solid #354256",
            borderRadius: "10px",
            padding: "20px",
            marginTop: "20px"
          }}>
            <p className="stat-label">OBSERVED READING</p>
            <div style={{ fontSize: "32px", fontWeight: 700, margin: "10px 0" }}>
              0.18 <span style={{ fontSize: "14px", color: "#8293a8" }}>µSv/h</span>
            </div>
            <span style={{ color: "#ffb454", fontSize: "11px" }}>
              FLAGGED FOR BASELINE REVIEW
            </span>
          </div>

          <div style={{ marginTop: "22px" }}>
            <h3 style={{ fontSize: "14px" }}>Investigation checklist</h3>

            {[
              "Compare against station historical baseline",
              "Check nearby station observations",
              "Review timestamp and data quality",
              "Record reviewer decision"
            ].map((task) => (
              <div key={task} style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #1b2a3b",
                color: "#aab9ca",
                fontSize: "12px"
              }}>
                <CheckCircle2 size={16} color="#8293a8" />
                {task}
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <BrainCircuit size={20} color="#9275ff" />
            <h2>AI Evidence Investigator</h2>
          </div>

          <p className="panel-description">
            Evidence-grounded analysis interface
          </p>

          <div style={{
            background: "#17162a",
            border: "1px solid #383052",
            padding: "18px",
            borderRadius: "10px",
            marginTop: "20px"
          }}>
            <p style={{ color: "#b8a5ff", fontSize: "11px", fontWeight: 700 }}>
              INVESTIGATION STATUS
            </p>
            <h3 style={{ fontSize: "14px" }}>Awaiting evidence analysis</h3>
            <p style={{ color: "#a4a2b8", fontSize: "12px", lineHeight: 1.7 }}>
              AI explanations will use retrieved station observations,
              historical comparisons and recorded evidence.
            </p>
          </div>

          <div style={{ marginTop: "20px" }}>
            <p className="stat-label">EVIDENCE SOURCES</p>
            <p style={{ fontSize: "12px", color: "#aab9ca" }}>
              <Database size={14} style={{ display: "inline", marginRight: "8px" }} />
              Station observations
            </p>
            <p style={{ fontSize: "12px", color: "#aab9ca" }}>
              <TrendingUp size={14} style={{ display: "inline", marginRight: "8px" }} />
              Historical baseline
            </p>
            <p style={{ fontSize: "12px", color: "#aab9ca" }}>
              <FileSearch size={14} style={{ display: "inline", marginRight: "8px" }} />
              Evidence records
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Observation evidence log</h2>
        <p className="panel-description">
          Recent station observations used for investigation
        </p>

        {observations.map((observation) => (
          <div key={observation.id} className="reading">
            <span>{observation.id}</span>
            <span>{observation.station}</span>
            <span>{observation.value}</span>
            <span>{observation.time}</span>
            <span style={{
              color: observation.status === "Flagged" ? "#ffb454" : "#39e0d0"
            }}>
              {observation.status}
            </span>
          </div>
        ))}
      </section>

      <p style={{
        color: "#8293a8",
        fontSize: "11px",
        lineHeight: 1.7,
        marginTop: "20px"
      }}>
        DEMONSTRATION DATA: All readings and investigation records on this page
        are illustrative. A flagged observation is a screening signal, not proof
        of danger. Human review and verified measurements are required.
      </p>
    </main>
  );
}
