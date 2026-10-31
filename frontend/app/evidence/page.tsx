
"use client";

import { useMemo, useState } from "react";
import {
  Database,
  Search,
  FileSearch,
  ShieldCheck,
  Clock,
  MapPin,
  Activity,
  Download,
} from "lucide-react";
import Sidebar from "@/components/sidebar";

const records = [
  {
    id: "EV-2026-001",
    observation: "OBS-1024",
    anomaly: "ANM-001",
    station: "RM-024",
    location: "Nairobi",
    reading: "0.18 µSv/h",
    timestamp: "2026-10-30 14:32",
    source: "Demonstration sensor feed",
    status: "Under review",
    description: "Illustrative observation flagged for comparison against its station baseline.",
  },
  {
    id: "EV-2026-002",
    observation: "OBS-1018",
    anomaly: "ANM-002",
    station: "RM-018",
    location: "Mombasa",
    reading: "0.12 µSv/h",
    timestamp: "2026-10-30 13:45",
    source: "Demonstration sensor feed",
    status: "Reviewed",
    description: "Illustrative observation retained for historical comparison.",
  },
  {
    id: "EV-2026-003",
    observation: "OBS-1031",
    anomaly: "ANM-003",
    station: "RM-031",
    location: "Kisumu",
    reading: "0.14 µSv/h",
    timestamp: "2026-10-30 12:20",
    source: "Demonstration sensor feed",
    status: "Under review",
    description: "Illustrative observation awaiting human review.",
  },
  {
    id: "EV-2026-004",
    observation: "OBS-1009",
    anomaly: "None",
    station: "RM-009",
    location: "Nakuru",
    reading: "0.11 µSv/h",
    timestamp: "2026-10-30 11:10",
    source: "Demonstration sensor feed",
    status: "Reviewed",
    description: "Illustrative observation included in the station history.",
  },
];

export default function EvidencePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(records[0].id);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = [
        record.id,
        record.observation,
        record.station,
        record.location,
      ].some((value) => value.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter =
        filter === "All" || record.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const selected = records.find((record) => record.id === selectedId);

  function exportRecords() {
    const headers = [
      "Evidence ID",
      "Observation",
      "Anomaly",
      "Station",
      "Location",
      "Reading",
      "Timestamp",
      "Source",
      "Status",
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      record.observation,
      record.anomaly,
      record.station,
      record.location,
      record.reading,
      record.timestamp,
      record.source,
      record.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "radmap-evidence-records-demo.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">INTELLIGENCE ARCHIVE</div>
            <h1>Evidence Records</h1>
            <p className="page-description">
              Explore observation history, anomaly references and evidence provenance.
            </p>
          </div>

          <button className="primary-button" onClick={exportRecords}>
            <Download size={16} />
            Export records
          </button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <Database size={20} />
            <span>Total records</span>
            <h2>{records.length}</h2>
          </div>
          <div className="stat-card">
            <FileSearch size={20} />
            <span>Under review</span>
            <h2>{records.filter((r) => r.status === "Under review").length}</h2>
          </div>
          <div className="stat-card">
            <ShieldCheck size={20} />
            <span>Reviewed</span>
            <h2>{records.filter((r) => r.status === "Reviewed").length}</h2>
          </div>
        </section>

        <section className="panel evidence-panel">
          <div className="evidence-toolbar">
            <div>
              <h2>Evidence archive</h2>
              <p>Search and inspect recorded demonstration evidence.</p>
            </div>

            <div className="evidence-filters">
              <div className="integrity-search">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search records..."
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>
                <option>Reviewed</option>
                <option>Under review</option>
              </select>
            </div>
          </div>

          <div className="evidence-list">
            {filteredRecords.map((record) => (
              <button
                key={record.id}
                className={`evidence-record ${
                  selectedId === record.id ? "selected" : ""
                }`}
                onClick={() => setSelectedId(record.id)}
              >
                <div className="evidence-record-icon">
                  <Database size={18} />
                </div>

                <div className="evidence-record-info">
                  <strong>{record.id}</strong>
                  <span>{record.station} · {record.location}</span>
                  <small>{record.observation} · {record.timestamp}</small>
                </div>

                <span className={`evidence-status ${
                  record.status === "Reviewed" ? "reviewed" : "pending"
                }`}>
                  {record.status}
                </span>
              </button>
            ))}

            {filteredRecords.length === 0 && (
              <p className="evidence-empty">No matching evidence records.</p>
            )}
          </div>
        </section>

        {selected && (
          <section className="settings-card evidence-detail">
            <div className="settings-heading">
              <div className="settings-icon">
                <FileSearch size={19} />
              </div>
              <div>
                <h2>Evidence details</h2>
                <p>{selected.id}</p>
              </div>
            </div>

            <p className="evidence-description">{selected.description}</p>

            <div className="evidence-detail-grid">
              <div><span>Observation</span><strong>{selected.observation}</strong></div>
              <div><span>Anomaly reference</span><strong>{selected.anomaly}</strong></div>
              <div><span>Station</span><strong>{selected.station}</strong></div>
              <div><span>Location</span><strong>{selected.location}</strong></div>
              <div><span>Displayed reading</span><strong>{selected.reading}</strong></div>
              <div><span>Timestamp</span><strong>{selected.timestamp}</strong></div>
            </div>

            <div className="evidence-source">
              <div><Activity size={16} /> Source information</div>
              <p>{selected.source}</p>
              <span><Clock size={13} /> Demonstration record timestamp</span>
              <span><MapPin size={13} /> Illustrative location</span>
            </div>
          </section>
        )}

        <p className="evidence-disclaimer">
          <ShieldCheck size={15} />
          All records and measurements shown are illustrative demonstration data.
          This archive does not yet provide cryptographic verification or a permanent audit trail.
        </p>
      </main>
    </div>
  );
}
