"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import MapWrapper from "@/components/map-wrapper";
import { Activity, AlertTriangle, MapPin, Radio, Wifi } from "lucide-react";
import { api, relativeTime, type Station } from "@/lib/api";

export default function MonitoringPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Station[]>("/stations").then(setStations).catch((reason: Error) => setError(reason.message));
  }, []);

  const active = stations.filter((station) => station.active).length;
  const flagged = stations.filter((station) => station.status === "Review required").length;
  const areas = new Set(stations.map((station) => station.coverage_area)).size;
  const metrics = [
    { label: "Total Stations", value: stations.length, icon: Radio, color: "#39e0d0" },
    { label: "Active Stations", value: active, icon: Wifi, color: "#39e0d0" },
    { label: "Flagged Stations", value: flagged, icon: AlertTriangle, color: "#ffb454" },
    { label: "Coverage Areas", value: areas, icon: MapPin, color: "#9275ff" },
  ];

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div>
            <h1>Monitoring Network</h1>
            <p className="subtitle">Geographic overview of environmental monitoring stations.</p>
          </div>
          <div className="status"><span>●</span> {error ? "API UNAVAILABLE" : "BACKEND DATA"}</div>
        </header>
        {error && <p role="alert" className="error-message">{error}</p>}
        <section className="stats">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div className="panel" key={metric.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="stat-label">{metric.label}</span><Icon size={19} color={metric.color} />
                </div>
                <div className="stat-value">{metric.value}</div>
                <div className="stat-note">From the monitoring database</div>
              </div>
            );
          })}
        </section>
        <section className="panel" style={{ marginTop: 18 }}>
          <h2>Geographic Monitoring Map</h2>
          <p className="panel-description">Station locations and latest reported status from the API.</p>
          <div style={{ marginTop: 20 }}><MapWrapper stations={stations} /></div>
        </section>
        <section className="panel" style={{ marginTop: 18 }}>
          <h2>Monitoring Stations</h2>
          <p className="panel-description">Station directory and latest observations.</p>
          {stations.map((station) => (
            <div className="reading" key={station.id} style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <strong>{station.id}</strong><br />
                <span style={{ color: "#8492a8" }}>{station.name} · {station.location}</span>
              </div>
              <div>
                <strong>{station.value === null ? "Unavailable" : `${station.value.toFixed(2)} µSv/h`}</strong><br />
                <span style={{ color: station.status === "Review required" ? "#ffb454" : "#39e0d0" }}>{station.status}</span>
              </div>
              <div style={{ color: "#8492a8", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={13} />{relativeTime(station.recorded_at)}
              </div>
            </div>
          ))}
          {!stations.length && !error && <p className="panel-description">Loading stations…</p>}
        </section>
      </main>
    </div>
  );
}
