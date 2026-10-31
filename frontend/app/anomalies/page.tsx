"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import { Activity, AlertTriangle, ChevronRight, Clock, Search, ShieldCheck } from "lucide-react";
import { api, type Anomaly } from "@/lib/api";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Anomaly[]>("/anomalies").then((items) => {
      setAnomalies(items);
      setSelectedId(items[0]?.id ?? "");
    }).catch((reason: Error) => setError(reason.message));
  }, []);

  const filtered = useMemo(() => anomalies.filter((item) =>
    `${item.id} ${item.station} ${item.location} ${item.observation}`.toLowerCase().includes(search.toLowerCase())
  ), [anomalies, search]);
  const selected = anomalies.find((item) => item.id === selectedId);
  const pending = anomalies.filter((item) => item.status !== "Reviewed").length;

  async function markReviewed() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const updated = await api<Anomaly>(`/anomalies/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Reviewed", reviewer_note: "Reviewed in RadMap." }),
      });
      setAnomalies((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <header className="topbar"><div><h1>Anomaly Monitoring</h1><p className="subtitle">Investigate observations that differ from station baselines.</p></div><div className="status"><span>●</span> BACKEND DATA</div></header>
        {error && <p role="alert" className="error-message">{error}</p>}
        <section className="stats">
          {[
            { label: "Detected signals", value: anomalies.length, icon: AlertTriangle },
            { label: "Awaiting review", value: pending, icon: Clock },
            { label: "Baseline comparisons", value: anomalies.length, icon: Activity },
            { label: "Reviewed", value: anomalies.length - pending, icon: ShieldCheck },
          ].map((item) => { const Icon = item.icon; return <div className="panel" key={item.label}><Icon size={19} color="#39e0d0" /><div className="stat-value">{item.value}</div><div className="stat-label">{item.label}</div><div className="stat-note">Persisted anomaly records</div></div>; })}
        </section>
        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)", gap: 18, marginTop: 18 }}>
          <div className="panel">
            <h2>Detected Signals</h2><p className="panel-description">Choose a signal to inspect its evidence.</p>
            <div style={{ position: "relative", marginTop: 18 }}>
              <Search size={16} color="#8492a8" style={{ position: "absolute", left: 12, top: 13 }} />
              <input aria-label="Search anomalies" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search signals..." className="data-input" style={{ paddingLeft: 38 }} />
            </div>
            <div style={{ marginTop: 18 }}>
              {filtered.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} style={{ width: "100%", textAlign: "left", padding: 14, marginBottom: 10, borderRadius: 9, border: selectedId === item.id ? "1px solid #39e0d0" : "1px solid #243247", background: "#0a111d", color: "#e7edf7", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{item.id}</strong><ChevronRight size={16} color="#8492a8" /></div>
                <p style={{ color: "#8492a8", fontSize: 12 }}>{item.station} · {item.location} · {item.observation}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}><span style={{ fontSize: 12, color: "#ffb454" }}>{item.severity}</span><span style={{ fontSize: 11, color: "#8492a8" }}>{item.difference}</span></div>
              </button>)}
              {filtered.length === 0 && <p className="panel-description">No matching signals found.</p>}
            </div>
          </div>
          {selected ? <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div><div className="alert-tag">SIGNAL INVESTIGATION</div><h2 style={{ marginTop: 8 }}>{selected.id}</h2><p className="panel-description">Observation {selected.observation} · {selected.station} · {selected.location}</p></div>
              <span style={{ color: selected.status === "Reviewed" ? "#39e0d0" : "#ffb454", fontSize: 11 }}>● {selected.status}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 22 }}>
              <div className="panel"><span className="stat-label">Observed reading</span><div className="stat-value" style={{ fontSize: 22 }}>{selected.reading}</div></div>
              <div className="panel"><span className="stat-label">Historical baseline</span><div className="stat-value" style={{ fontSize: 22 }}>{selected.baseline}</div></div>
            </div>
            <div style={{ background: "rgba(255,180,84,0.07)", border: "1px solid rgba(255,180,84,0.2)", padding: 15, borderRadius: 9, marginTop: 16 }}>
              <div style={{ color: "#ffb454", fontSize: 12 }}>BASELINE DEVIATION</div><div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{selected.difference}</div>
              <p style={{ color: "#aab6c8", fontSize: 12, lineHeight: 1.6 }}>A deviation is a screening signal, not proof of hazardous conditions. Qualified human review is required.</p>
            </div>
            <div style={{ marginTop: 24 }}><h2>Investigation Checklist</h2>{["Confirm observation source and station ID", "Compare with station history", "Check timestamp and data completeness", "Review nearby observations"].map((item, index) => <div key={item} className="reading" style={{ display: "flex", gap: 12 }}><span>{String(index + 1).padStart(2, "0")}</span><span>{item}</span></div>)}</div>
            <button type="button" onClick={markReviewed} disabled={saving || selected.status === "Reviewed"} className="primary-button" style={{ width: "100%", justifyContent: "center", marginTop: 20 }}>
              <ShieldCheck size={17} />{saving ? "Saving…" : selected.status === "Reviewed" ? "Reviewed" : "Mark as reviewed"}
            </button>
            <p className="panel-description" style={{ textAlign: "center" }}>Reviewer status is saved to PostgreSQL.</p>
          </div> : <div className="panel"><p className="panel-description">Select a signal to inspect it.</p></div>}
        </section>
        <p style={{ color: "#8492a8", fontSize: 11, marginTop: 18, textAlign: "center" }}>A screening anomaly does not establish radiation danger or health risk.</p>
      </main>
    </div>
  );
}
