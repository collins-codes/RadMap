"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import {
  Activity,
  Search,
  Download,
  Clock,
  Radio,
  Filter
} from "lucide-react";

const demoReadings = [
  { id: "OBS-1024", station: "RM-024", location: "Nairobi", value: 0.18, time: "2026-10-31 02:10", status: "Review required" },
  { id: "OBS-1023", station: "RM-018", location: "Mombasa", value: 0.12, time: "2026-10-31 02:05", status: "Normal demo reading" },
  { id: "OBS-1022", station: "RM-031", location: "Kisumu", value: 0.14, time: "2026-10-31 02:02", status: "Normal demo reading" },
  { id: "OBS-1021", station: "RM-009", location: "Nakuru", value: 0.11, time: "2026-10-31 01:58", status: "Normal demo reading" },
  { id: "OBS-1020", station: "RM-042", location: "Garissa", value: null, time: "2026-10-31 01:45", status: "No recent data" },
  { id: "OBS-1019", station: "RM-024", location: "Nairobi", value: 0.13, time: "2026-10-31 01:40", status: "Normal demo reading" },
  { id: "OBS-1018", station: "RM-018", location: "Mombasa", value: 0.12, time: "2026-10-31 01:35", status: "Normal demo reading" },
  { id: "OBS-1017", station: "RM-031", location: "Kisumu", value: 0.15, time: "2026-10-31 01:30", status: "Normal demo reading" }
];

export default function ReadingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stationFilter, setStationFilter] = useState("All");

  const filteredReadings = useMemo(() => {
    return demoReadings.filter((reading) => {
      const matchesSearch = [
        reading.id,
        reading.station,
        reading.location
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );

      const matchesStatus =
        statusFilter === "All" || reading.status === statusFilter;

      const matchesStation =
        stationFilter === "All" || reading.station === stationFilter;

      return matchesSearch && matchesStatus && matchesStation;
    });
  }, [search, statusFilter, stationFilter]);

  const exportCSV = () => {
    const headers = ["Observation ID", "Station", "Location", "Reading (uSv/h)", "Timestamp", "Status"];

    const rows = filteredReadings.map((reading) => [
      reading.id,
      reading.station,
      reading.location,
      reading.value ?? "Unavailable",
      reading.time,
      reading.status
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "radmap-readings-demo.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const reviewCount = demoReadings.filter(
    (reading) => reading.status === "Review required"
  ).length;

  const availableCount = demoReadings.filter(
    (reading) => reading.value !== null
  ).length;

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Station Readings</h1>
            <p className="subtitle">
              Search, filter and review environmental observations.
            </p>
          </div>

          <div className="status">
            <span>●</span> DEMO DATA
          </div>
        </header>

        <section className="stats">
          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="stat-label">Total Observations</span>
              <Activity size={19} color="#39e0d0" />
            </div>
            <div className="stat-value">{demoReadings.length}</div>
            <div className="stat-note">Illustrative records</div>
          </div>

          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="stat-label">Available Readings</span>
              <Radio size={19} color="#39e0d0" />
            </div>
            <div className="stat-value">{availableCount}</div>
            <div className="stat-note">With recorded values</div>
          </div>

          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="stat-label">Review Required</span>
              <Filter size={19} color="#ffb454" />
            </div>
            <div className="stat-value">{reviewCount}</div>
            <div className="stat-note">Requires further investigation</div>
          </div>
        </section>

        <section className="panel" style={{ marginTop: 18 }}>
          <div>
            <h2>Observation Records</h2>
            <p className="panel-description">
              Browse the available demonstration observations.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 22,
              marginBottom: 20
            }}
          >
            <div style={{ flex: "2 1 220px", position: "relative" }}>
              <Search
                size={17}
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
                placeholder="Search observation, station or location..."
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 38px",
                  background: "#070b14",
                  border: "1px solid #243247",
                  borderRadius: 8,
                  color: "#e7edf7",
                  outline: "none"
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                flex: "1 1 170px",
                padding: 12,
                background: "#070b14",
                border: "1px solid #243247",
                borderRadius: 8,
                color: "#e7edf7"
              }}
            >
              <option value="All">All statuses</option>
              <option value="Normal demo reading">Normal demo reading</option>
              <option value="Review required">Review required</option>
              <option value="No recent data">No recent data</option>
            </select>

            <select
              value={stationFilter}
              onChange={(event) => setStationFilter(event.target.value)}
              style={{
                flex: "1 1 150px",
                padding: 12,
                background: "#070b14",
                border: "1px solid #243247",
                borderRadius: 8,
                color: "#e7edf7"
              }}
            >
              <option value="All">All stations</option>
              <option value="RM-024">RM-024</option>
              <option value="RM-018">RM-018</option>
              <option value="RM-031">RM-031</option>
              <option value="RM-009">RM-009</option>
              <option value="RM-042">RM-042</option>
            </select>

            <button
              onClick={exportCSV}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                background: "rgba(57,224,208,0.1)",
                border: "1px solid rgba(57,224,208,0.3)",
                borderRadius: 8,
                color: "#39e0d0",
                cursor: "pointer"
              }}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 720,
                textAlign: "left"
              }}
            >
              <thead>
                <tr style={{ color: "#8492a8", fontSize: 12 }}>
                  {["OBSERVATION", "STATION", "LOCATION", "READING", "TIMESTAMP", "STATUS"].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "14px 12px",
                        borderBottom: "1px solid #243247",
                        fontWeight: 500
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredReadings.map((reading) => (
                  <tr key={reading.id} style={{ fontSize: 13 }}>
                    <td style={{ padding: 14, borderBottom: "1px solid #192538", color: "#39e0d0" }}>
                      {reading.id}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid #192538" }}>
                      {reading.station}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid #192538" }}>
                      {reading.location}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid #192538" }}>
                      {reading.value === null ? "Unavailable" : `${reading.value.toFixed(2)} µSv/h`}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid #192538", color: "#8492a8" }}>
                      <Clock size={12} style={{ display: "inline", marginRight: 5 }} />
                      {reading.time}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid #192538" }}>
                      <span
                        style={{
                          color:
                            reading.status === "Review required"
                              ? "#ffb454"
                              : reading.status === "No recent data"
                              ? "#9275ff"
                              : "#39e0d0",
                          fontSize: 11
                        }}
                      >
                        ● {reading.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReadings.length === 0 && (
              <p style={{ textAlign: "center", color: "#8492a8", padding: 30 }}>
                No observations match your search.
              </p>
            )}
          </div>

          <p className="panel-description" style={{ marginTop: 18 }}>
            Showing {filteredReadings.length} of {demoReadings.length} demonstration records.
          </p>
        </section>

        <p
          style={{
            color: "#8492a8",
            fontSize: 11,
            marginTop: 18,
            textAlign: "center"
          }}
        >
          All observations on this page are illustrative demo data, not verified
          environmental measurements.
        </p>
      </main>
    </div>
  );
}
