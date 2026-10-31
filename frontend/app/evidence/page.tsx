"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock, Database, Download, FileSearch, MapPin, Search, ShieldCheck } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { api, displayTime, type Evidence } from "@/lib/api";

export default function EvidencePage() {
  const [records, setRecords] = useState<Evidence[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<Evidence[]>("/evidence").then((items) => {
      setRecords(items);
      setSelectedId(items[0]?.id ?? "");
    }).catch((reason: Error) => setError(reason.message));
  }, []);

  const filtered = useMemo(() => records.filter((record) =>
    `${record.id} ${record.observation} ${record.station} ${record.location}`.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "All" || record.status === filter)
  ), [records, search, filter]);
  const selected = records.find((item) => item.id === selectedId);

  function exportRecords() {
    const header = ["Evidence ID", "Observation", "Anomaly", "Station", "Location", "Reading", "Timestamp", "Source", "Status"];
    const rows = filtered.map((item) => [item.id, item.observation, item.anomaly, item.station, item.location, item.reading, item.timestamp, item.source, item.status]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "radmap-evidence-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const pending = records.filter((item) => item.status === "Under review").length;
  const reviewed = records.length - pending;

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div><div className="eyebrow">INTELLIGENCE ARCHIVE</div><h1>Evidence Records</h1><p className="page-description">Explore observation history, anomaly references and evidence provenance.</p></div>
          <button type="button" className="primary-button" onClick={exportRecords}><Download size={16} />Export records</button>
        </header>
        {error && <p role="alert" className="error-message">{error}</p>}
        <section className="stats">
          {[{ label: "Total records", count: records.length, icon: Database }, { label: "Under review", count: pending, icon: FileSearch }, { label: "Reviewed", count: reviewed, icon: ShieldCheck }].map((item) => {
            const Icon = item.icon;
            return <div className="stat-card" key={item.label}><Icon size={20} /><span>{item.label}</span><h2>{item.count}</h2></div>;
          })}
        </section>
        <section className="panel evidence-panel">
          <div className="evidence-toolbar">
            <div><h2>Evidence archive</h2><p>Search and inspect recorded evidence from PostgreSQL.</p></div>
            <div className="evidence-filters">
              <div className="integrity-search"><Search size={15} /><input aria-label="Search evidence" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records..." /></div>
              <select aria-label="Filter evidence status" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Reviewed</option><option>Under review</option></select>
            </div>
          </div>
          <div className="evidence-list">
            {filtered.map((record) => <button key={record.id} type="button" className={`evidence-record ${selectedId === record.id ? "selected" : ""}`} onClick={() => setSelectedId(record.id)}>
              <div className="evidence-record-icon"><Database size={18} /></div>
              <div className="evidence-record-info"><strong>{record.id}</strong><span>{record.station} · {record.location}</span><small>{record.observation} · {displayTime(record.timestamp)}</small></div>
              <span className={`evidence-status ${record.status === "Reviewed" ? "reviewed" : "pending"}`}>{record.status}</span>
            </button>)}
            {filtered.length === 0 && <p className="evidence-empty">No matching evidence records.</p>}
          </div>
        </section>
        {selected && <section className="settings-card evidence-detail">
          <div className="settings-heading"><div className="settings-icon"><FileSearch size={19} /></div><div><h2>Evidence details</h2><p>{selected.id}</p></div></div>
          <p className="evidence-description">{selected.description}</p>
          <div className="evidence-detail-grid">
            <div><span>Observation</span><strong>{selected.observation}</strong></div><div><span>Anomaly reference</span><strong>{selected.anomaly}</strong></div><div><span>Station</span><strong>{selected.station}</strong></div><div><span>Location</span><strong>{selected.location}</strong></div><div><span>Reading</span><strong>{selected.reading}</strong></div><div><span>Timestamp</span><strong>{displayTime(selected.timestamp)}</strong></div>
          </div>
          <div className="evidence-source"><div><Activity size={16} /> Source information</div><p>{selected.source}</p><span><Clock size={13} /> Stored record timestamp</span><span><MapPin size={13} /> {selected.location}</span></div>
        </section>}
        <p className="evidence-disclaimer"><ShieldCheck size={15} />Seeded readings are illustrative demonstration data and do not provide cryptographic verification.</p>
      </main>
    </div>
  );
}
