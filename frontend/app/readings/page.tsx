"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import { Activity, Clock, Download, Filter, Radio, Search } from "lucide-react";
import { api, displayTime, type Reading } from "@/lib/api";

export default function ReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stationFilter, setStationFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    api<Reading[]>("/readings").then(setReadings).catch((reason: Error) => setError(reason.message));
  }, []);

  const filtered = useMemo(() => readings.filter((reading) => {
    const matchesSearch = `${reading.id} ${reading.station} ${reading.location}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch &&
      (statusFilter === "All" || reading.status === statusFilter) &&
      (stationFilter === "All" || reading.station === stationFilter);
  }), [readings, search, statusFilter, stationFilter]);

  function exportCSV() {
    const rows = [
      ["Observation ID", "Station", "Location", "Reading (uSv/h)", "Timestamp", "Status"],
      ...filtered.map((item) => [item.id, item.station, item.location, item.value ?? "Unavailable", item.time, item.status]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = "radmap-readings.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const available = readings.filter((item) => item.value !== null).length;
  const review = readings.filter((item) => item.status === "Review required").length;
  const stations = [...new Set(readings.map((item) => item.station))];

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div><h1>Station Readings</h1><p className="subtitle">Search, filter and review environmental observations.</p></div>
          <div className="status"><span>●</span> BACKEND DATA</div>
        </header>
        {error && <p role="alert" className="error-message">{error}</p>}
        <section className="stats">
          {[
            { label: "Total Observations", value: readings.length, icon: Activity },
            { label: "Available Readings", value: available, icon: Radio },
            { label: "Review Required", value: review, icon: Filter },
          ].map((stat) => {
            const Icon = stat.icon;
            return <div className="panel" key={stat.label}><div style={{ display: "flex", justifyContent: "space-between" }}><span className="stat-label">{stat.label}</span><Icon size={19} color="#39e0d0" /></div><div className="stat-value">{stat.value}</div><div className="stat-note">Database observations</div></div>;
          })}
        </section>
        <section className="panel" style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div><h2>Observation Records</h2><p className="panel-description">Browse and export stored observations.</p></div>
            <button type="button" className="primary-button" onClick={exportCSV}><Download size={16} />Export CSV</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "22px 0 20px" }}>
            <label style={{ flex: "2 1 220px", position: "relative" }}>
              <Search size={17} color="#8492a8" style={{ position: "absolute", left: 12, top: 13 }} />
              <input aria-label="Search observations" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search observation, station or location..." className="data-input" style={{ paddingLeft: 38 }} />
            </label>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="data-input" style={{ flex: "1 1 170px" }}>
              <option value="All">All statuses</option>
              {[...new Set(readings.map((item) => item.status))].map((value) => <option key={value}>{value}</option>)}
            </select>
            <select aria-label="Filter by station" value={stationFilter} onChange={(event) => setStationFilter(event.target.value)} className="data-input" style={{ flex: "1 1 150px" }}>
              <option value="All">All stations</option>
              {stations.map((station) => <option key={station}>{station}</option>)}
            </select>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720, textAlign: "left" }}>
              <thead><tr style={{ color: "#8492a8", fontSize: 12 }}>{["OBSERVATION", "STATION", "LOCATION", "READING", "TIMESTAMP", "STATUS"].map((heading) => <th key={heading} style={{ padding: 14, borderBottom: "1px solid #243247", fontWeight: 500 }}>{heading}</th>)}</tr></thead>
              <tbody>{filtered.map((reading) => (
                <tr key={reading.id} style={{ fontSize: 13 }}>
                  <td style={{ padding: 14, borderBottom: "1px solid #192538", color: "#39e0d0" }}>{reading.id}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid #192538" }}>{reading.station}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid #192538" }}>{reading.location}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid #192538" }}>{reading.value === null ? "Unavailable" : `${reading.value.toFixed(2)} µSv/h`}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid #192538", color: "#8492a8" }}><Clock size={12} style={{ display: "inline", marginRight: 5 }} />{displayTime(reading.time)}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid #192538" }}>{reading.status}</td>
                </tr>
              ))}</tbody>
            </table>
            {filtered.length === 0 && <p style={{ textAlign: "center", color: "#8492a8", padding: 30 }}>No observations match your search.</p>}
          </div>
          <p className="panel-description" style={{ marginTop: 18 }}>Showing {filtered.length} of {readings.length} backend records.</p>
        </section>
        <p style={{ color: "#8492a8", fontSize: 11, marginTop: 18, textAlign: "center" }}>Seeded demonstration measurements are not verified environmental data.</p>
      </main>
    </div>
  );
}
