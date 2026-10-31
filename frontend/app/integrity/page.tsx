
"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  FileCheck,
  Activity,
} from "lucide-react";
import Sidebar from "@/components/sidebar";

const initialChecks = [
  {
    id: "CHK-001",
    title: "Observation ID uniqueness",
    description: "Checks whether observation identifiers are duplicated.",
    category: "Identity",
    status: "Passed",
    details: "No duplicate IDs found in the demonstration dataset.",
  },
  {
    id: "CHK-002",
    title: "Timestamp validation",
    description: "Checks whether observation timestamps are valid.",
    category: "Time",
    status: "Passed",
    details: "All demonstration timestamps have valid formats.",
  },
  {
    id: "CHK-003",
    title: "Missing station readings",
    description: "Identifies stations without recent observations.",
    category: "Completeness",
    status: "Warning",
    details: "One demonstration station has no recent reading.",
  },
  {
    id: "CHK-004",
    title: "Source metadata",
    description: "Checks whether readings include source information.",
    category: "Traceability",
    status: "Passed",
    details: "Source metadata is present in the sample records.",
  },
  {
    id: "CHK-005",
    title: "Synthetic data identification",
    description: "Checks whether demonstration records are labelled.",
    category: "Transparency",
    status: "Passed",
    details: "Sample observations are identified as illustrative data.",
  },
  {
    id: "CHK-006",
    title: "Reading completeness",
    description: "Checks for missing values in observation records.",
    category: "Completeness",
    status: "Warning",
    details: "Some sample station records have incomplete information.",
  },
];

type CheckStatus = "Passed" | "Warning" | "Failed";

export default function IntegrityPage() {
  const [checks, setChecks] = useState(initialChecks);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(initialChecks[0].id);
  const [lastChecked, setLastChecked] = useState("Demo session");

  const filteredChecks = useMemo(() => {
    return checks.filter((check) => {
      const matchesSearch =
        check.title.toLowerCase().includes(search.toLowerCase()) ||
        check.id.toLowerCase().includes(search.toLowerCase()) ||
        check.category.toLowerCase().includes(search.toLowerCase());

      return matchesSearch &&
        (filter === "All" || check.status === filter);
    });
  }, [checks, search, filter]);

  const selected = checks.find((check) => check.id === selectedId) ?? checks[0];

  const passed = checks.filter((c) => c.status === "Passed").length;
  const warnings = checks.filter((c) => c.status === "Warning").length;
  const failed = checks.filter((c) => c.status === "Failed").length;

  function rerunChecks() {
    setChecks(initialChecks);
    setSelectedId(initialChecks[0].id);
    setLastChecked(new Date().toLocaleString());
    setSearch("");
    setFilter("All");
  }

  function updateStatus(id: string, status: CheckStatus) {
    setChecks((current) =>
      current.map((check) =>
        check.id === id ? { ...check, status } : check
      )
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">SYSTEM MONITORING</div>
            <h1>Data Integrity</h1>
            <p className="page-description">
              Inspect the quality, consistency and traceability of monitoring records.
            </p>
          </div>

          <button className="primary-button" onClick={rerunChecks}>
            <RefreshCw size={16} />
            Run checks
          </button>
        </header>

        <section className="integrity-stats">
          <div className="integrity-stat">
            <div className="integrity-stat-icon purple">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span>Checks performed</span>
              <h2>{checks.length}</h2>
            </div>
          </div>

          <div className="integrity-stat">
            <div className="integrity-stat-icon green">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span>Passed</span>
              <h2>{passed}</h2>
            </div>
          </div>

          <div className="integrity-stat">
            <div className="integrity-stat-icon orange">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span>Warnings</span>
              <h2>{warnings}</h2>
            </div>
          </div>

          <div className="integrity-stat">
            <div className="integrity-stat-icon red">
              <Activity size={20} />
            </div>
            <div>
              <span>Failed</span>
              <h2>{failed}</h2>
            </div>
          </div>
        </section>

        <section className="integrity-overview">
          <div>
            <div className="integrity-overview-title">
              <Database size={18} />
              Data quality overview
            </div>
            <p>
              {passed} of {checks.length} validation checks currently pass
              in this demonstration dataset.
            </p>
          </div>

          <div className="integrity-progress">
            <div
              className="integrity-progress-fill"
              style={{
                width: `${(passed / checks.length) * 100}%`,
              }}
            />
          </div>
        </section>

        <section className="panel integrity-panel">
          <div className="integrity-toolbar">
            <div>
              <h2>Validation checks</h2>
              <p>Review individual data quality checks.</p>
            </div>

            <div className="integrity-filters">
              <div className="integrity-search">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search checks..."
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>
                <option>Passed</option>
                <option>Warning</option>
                <option>Failed</option>
              </select>
            </div>
          </div>

          <div className="integrity-list">
            {filteredChecks.map((check) => (
              <button
                key={check.id}
                className={`integrity-check ${
                  selectedId === check.id ? "selected" : ""
                }`}
                onClick={() => setSelectedId(check.id)}
              >
                <div className={`integrity-check-icon ${check.status.toLowerCase()}`}>
                  {check.status === "Passed" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                </div>

                <div className="integrity-check-info">
                  <strong>{check.title}</strong>
                  <span>{check.description}</span>
                  <small>{check.id} · {check.category}</small>
                </div>

                <span className={`integrity-status ${check.status.toLowerCase()}`}>
                  {check.status}
                </span>
              </button>
            ))}

            {filteredChecks.length === 0 && (
              <div className="integrity-empty">
                No matching validation checks found.
              </div>
            )}
          </div>
        </section>

        {selected && (
          <section className="settings-card integrity-detail">
            <div className="settings-heading">
              <div className="settings-icon">
                <FileCheck size={19} />
              </div>
              <div>
                <h2>Check details</h2>
                <p>Selected validation record: {selected.id}</p>
              </div>
            </div>

            <div className="integrity-detail-content">
              <h3>{selected.title}</h3>
              <p>{selected.details}</p>

              <div className="integrity-detail-meta">
                <span>
                  <Database size={14} /> {selected.category}
                </span>
                <span>
                  <Clock size={14} /> {lastChecked}
                </span>
              </div>
            </div>

            <div className="integrity-review-actions">
              <span>Review status</span>

              <select
                value={selected.status}
                onChange={(e) =>
                  updateStatus(selected.id, e.target.value as CheckStatus)
                }
              >
                <option>Passed</option>
                <option>Warning</option>
                <option>Failed</option>
              </select>
            </div>
          </section>
        )}

        <p className="integrity-disclaimer">
          <ShieldCheck size={15} />
          Demonstration validation results only. These checks are not connected
          to live station data or a production data-integrity service.
        </p>
      </main>
    </div>
  );
}
