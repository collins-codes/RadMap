"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowLeft, BrainCircuit, Clock, Database, ShieldAlert, ShieldCheck, TrendingUp } from "lucide-react";
import { api, displayTime, type Anomaly } from "@/lib/api";

export default function SentinelPage() {
  const [signals, setSignals] = useState<Anomaly[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [prompt, setPrompt] = useState("Summarize this observation against its supplied baseline and list appropriate follow-up checks.");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Anomaly[]>("/anomalies").then((items) => {
      setSignals(items);
      setSelectedId(items[0]?.id ?? "");
    }).catch((reason: Error) => setError(reason.message));
  }, []);

  const selected = signals.find((item) => item.id === selectedId);
  const pending = signals.filter((item) => item.status !== "Reviewed").length;

  async function review() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api<Anomaly>(`/anomalies/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Reviewed", reviewer_note: "Reviewed in RadMap Sentinel." }),
      });
      setSignals((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setAnswer("");
    try {
      const result = await api<{ answer: string; model: string; evidence_count: number }>("/ai/analyze", {
        method: "POST",
        body: JSON.stringify({ prompt, reading_id: selected.observation }),
      });
      setAnswer(result.answer);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 35, maxWidth: 1500, margin: "auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8293a8", textDecoration: "none", fontSize: 13, marginBottom: 30 }}><ArrowLeft size={16} />Back to Dashboard</Link>
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#39e0d0", fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}><BrainCircuit size={17} />ENVIRONMENTAL INTELLIGENCE ENGINE</div>
        <h1 style={{ fontSize: 30, margin: "0 0 10px" }}>RadMap Sentinel</h1>
        <p style={{ color: "#8293a8", fontSize: 13 }}>Investigate backend signals, compare supplied baselines and ask Gemma to summarize evidence.</p>
      </header>
      {error && <p role="alert" className="error-message">{error}</p>}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 22 }}>
        {[{ label: "Signals detected", value: signals.length, icon: Activity }, { label: "Awaiting review", value: pending, icon: Clock }, { label: "Baseline comparisons", value: signals.length, icon: TrendingUp }, { label: "Evidence records", value: signals.length, icon: Database }].map((item) => { const Icon = item.icon; return <div className="panel" key={item.label}><Icon size={20} color="#39e0d0" /><p className="stat-label">{item.label}</p><div className="stat-value">{item.value}</div></div>; })}
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, 1fr)", gap: 18, marginBottom: 20 }}>
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><ShieldAlert color="#ffb454" size={20} /><h2>Signal investigation</h2></div>
          <label className="settings-field" style={{ marginTop: 16 }}><span>Select signal</span><select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setAnswer(""); }}><option value="">Select a signal</option>{signals.map((signal) => <option key={signal.id} value={signal.id}>{signal.id} · {signal.station} · {signal.status}</option>)}</select></label>
          {selected && <>
            <p className="panel-description">{selected.station} · Observation {selected.observation} · {selected.location}</p>
            <div style={{ background: "#172333", border: "1px solid #354256", borderRadius: 10, padding: 20, marginTop: 20 }}>
              <p className="stat-label">OBSERVED READING</p><div style={{ fontSize: 32, fontWeight: 700, margin: "10px 0" }}>{selected.reading}</div><span style={{ color: "#ffb454", fontSize: 11 }}>BASELINE DEVIATION {selected.difference}</span>
              <p style={{ color: "#aab9ca", fontSize: 12, marginTop: 10 }}>Baseline: {selected.baseline} · {selected.severity}</p>
              <p style={{ color: "#8293a8", fontSize: 11 }}>Recorded {displayTime(selected.time)}</p>
            </div>
            <div style={{ marginTop: 22 }}><h3 style={{ fontSize: 14 }}>Investigation checklist</h3>{["Confirm the observation source and station ID", "Compare with station historical baseline", "Review timestamp and data quality", "Check nearby observations"].map((item) => <div key={item} className="reading" style={{ display: "flex", gap: 10, color: "#aab9ca", fontSize: 12 }}><ShieldCheck size={16} color="#39e0d0" />{item}</div>)}</div>
            <button type="button" className="primary-button" disabled={busy || selected.status === "Reviewed"} onClick={review} style={{ marginTop: 18, width: "100%", justifyContent: "center" }}><ShieldCheck size={16} />{selected.status === "Reviewed" ? "Reviewed" : "Mark as reviewed"}</button>
          </>}
        </div>
        <div className="panel">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><BrainCircuit size={20} color="#9275ff" /><h2>Gemma Evidence Investigator</h2></div>
          <p className="panel-description">Analysis runs on the configured Gemma endpoint using server-side credentials.</p>
          <label className="settings-field" style={{ marginTop: 18 }}><span>Question</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} maxLength={2000} /></label>
          <button type="button" className="primary-button" disabled={busy || !selected || prompt.trim().length < 3} onClick={analyze} style={{ width: "100%", justifyContent: "center", marginTop: 14 }}><BrainCircuit size={16} />{busy ? "Working…" : "Analyze evidence"}</button>
          {answer && <div style={{ background: "#17162a", border: "1px solid #383052", padding: 18, borderRadius: 10, marginTop: 18, whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 13 }}>{answer}</div>}
          {!answer && <div style={{ background: "#17162a", border: "1px solid #383052", padding: 18, borderRadius: 10, marginTop: 18, color: "#a4a2b8", fontSize: 12, lineHeight: 1.7 }}>Gemma responses use the selected database observation as evidence. Configure the provider URL, model and optional key in the backend .env file.</div>}
        </div>
      </section>
      <section className="panel"><h2>Observation evidence log</h2><p className="panel-description">Anomaly observations from the database.</p>{signals.map((item) => <div key={item.id} className="reading"><span>{item.observation}</span><span>{item.station}</span><span>{item.reading}</span><span>{displayTime(item.time)}</span><span style={{ color: item.status === "Reviewed" ? "#39e0d0" : "#ffb454" }}>{item.status}</span></div>)}</section>
      <p style={{ color: "#8293a8", fontSize: 11, lineHeight: 1.7, marginTop: 20 }}>Demonstration records are illustrative; anomaly flags are screening signals, not proof of danger. Qualified human review is required.</p>
    </main>
  );
}
