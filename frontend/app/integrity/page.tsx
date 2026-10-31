"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock, Database, FileCheck, RefreshCw, Search, ShieldCheck } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { api, displayTime, type IntegrityCheck } from "@/lib/api";

export default function IntegrityPage() {
  const [checks, setChecks] = useState<IntegrityCheck[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api<IntegrityCheck[]>("/integrity").then((items) => {
      setChecks(items);
      setSelectedId(items[0]?.id ?? "");
    }).catch((reason: Error) => setError(reason.message));
  }, []);

  const filtered = useMemo(() => checks.filter((check) =>
    `${check.title} ${check.id} ${check.category}`.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "All" || check.status === filter)
  ), [checks, search, filter]);
  const selected = checks.find((check) => check.id === selectedId);
  const passed = checks.filter((check) => check.status === "Passed").length;
  const warnings = checks.filter((check) => check.status === "Warning").length;
  const failed = checks.filter((check) => check.status === "Failed").length;

  async function runChecks() {
    setRunning(true);
    setError("");
    try {
      const items = await api<IntegrityCheck[]>("/integrity/run", { method: "POST" });
      setChecks(items);
      setSelectedId(items[0]?.id ?? "");
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setRunning(false);
    }
  }

  async function updateStatus(status: IntegrityCheck["status"]) {
    if (!selected) return;
    setError("");
    try {
      await api(`/integrity/${selected.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setChecks((current) => current.map((item) => item.id === selected.id ? { ...item, status, checked_at: new Date().toISOString() } : item));
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <header className="topbar"><div><div className="eyebrow">SYSTEM MONITORING</div><h1>Data Integrity</h1><p className="page-description">Inspect quality, consistency and traceability of database records.</p></div><button type="button" className="primary-button" onClick={runChecks} disabled={running}><RefreshCw size={16} />{running ? "Running…" : "Run checks"}</button></header>
        {error && <p role="alert" className="error-message">{error}</p>}
        <section className="integrity-stats">
          {[{ name: "Checks performed", value: checks.length, icon: ShieldCheck, color: "purple" }, { name: "Passed", value: passed, icon: CheckCircle2, color: "green" }, { name: "Warnings", value: warnings, icon: AlertTriangle, color: "orange" }, { name: "Failed", value: failed, icon: Activity, color: "red" }].map((item) => { const Icon = item.icon; return <div className="integrity-stat" key={item.name}><div className={`integrity-stat-icon ${item.color}`}><Icon size={20} /></div><div><span>{item.name}</span><h2>{item.value}</h2></div></div>; })}
        </section>
        <section className="integrity-overview">
          <div><div className="integrity-overview-title"><Database size={18} />Data quality overview</div><p>{passed} of {checks.length} database validation checks currently pass.</p></div>
          <div className="integrity-progress"><div className="integrity-progress-fill" style={{ width: `${checks.length ? (passed / checks.length) * 100 : 0}%` }} /></div>
        </section>
        <section className="panel integrity-panel">
          <div className="integrity-toolbar"><div><h2>Validation checks</h2><p>Results are computed against stored records.</p></div><div className="integrity-filters"><div className="integrity-search"><Search size={15} /><input aria-label="Search checks" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search checks..." /></div><select aria-label="Filter check status" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Passed</option><option>Warning</option><option>Failed</option></select></div></div>
          <div className="integrity-list">{filtered.map((check) => <button key={check.id} type="button" className={`integrity-check ${selectedId === check.id ? "selected" : ""}`} onClick={() => setSelectedId(check.id)}>
            <div className={`integrity-check-icon ${check.status.toLowerCase()}`}>{check.status === "Passed" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}</div>
            <div className="integrity-check-info"><strong>{check.title}</strong><span>{check.description}</span><small>{check.id} · {check.category}</small></div>
            <span className={`integrity-status ${check.status.toLowerCase()}`}>{check.status}</span>
          </button>)}</div>
          {filtered.length === 0 && <div className="integrity-empty">No matching validation checks found.</div>}
        </section>
        {selected && <section className="settings-card integrity-detail">
          <div className="settings-heading"><div className="settings-icon"><FileCheck size={19} /></div><div><h2>Check details</h2><p>Selected validation record: {selected.id}</p></div></div>
          <div className="integrity-detail-content"><h3>{selected.title}</h3><p>{selected.details}</p><div className="integrity-detail-meta"><span><Database size={14} />{selected.category}</span><span><Clock size={14} />{displayTime(selected.checked_at)}</span></div></div>
          <div className="integrity-review-actions"><span>Review status</span><select value={selected.status} onChange={(event) => void updateStatus(event.target.value as IntegrityCheck["status"])}><option>Passed</option><option>Warning</option><option>Failed</option></select></div>
        </section>}
        <p className="integrity-disclaimer"><ShieldCheck size={15} />Validation is limited to the data currently stored in this application.</p>
      </main>
    </div>
  );
}
