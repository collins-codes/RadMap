"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import MapWrapper from "@/components/map-wrapper";
import { Activity, AlertTriangle, Globe2, Radio } from "lucide-react";
import { api, relativeTime, type Station } from "@/lib/api";

type DashboardData = {
  stats: { label: string; value: number; note: string }[];
  stations: Station[];
  alerts: { title: string; detail: string; tag: string }[];
  readings: { id: string; station: string; value: number | null; time: string }[];
  is_demo: boolean;
};

const icons = [Radio, Activity, AlertTriangle, Globe2];

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardData>("/dashboard").then(setData).catch((reason: Error) => setError(reason.message));
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div>
            <h1>Environmental Overview</h1>
            <p className="subtitle">Monitor environmental readings, station activity and emerging signals.</p>
          </div>
          <div className="status"><span>●</span> {data?.is_demo ? "DEMO DATA" : "SYSTEM ONLINE"}</div>
        </header>

        {error && <p role="alert" className="error-message">{error}</p>}
        {!data && !error && <p className="panel-description">Loading monitoring data…</p>}

        {data && (
          <>
            <section className="stats">
              {data.stats.map((stat, index) => {
                const Icon = icons[index];
                return (
                  <div className="panel" key={stat.label}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="stat-label">{stat.label}</span>
                      <Icon size={19} color="#39e0d0" />
                    </div>
                    <div className="stat-value">{stat.value.toLocaleString()}</div>
                    <div className="stat-note">{stat.note}</div>
                  </div>
                );
              })}
            </section>

            <section className="content-grid">
              <div className="panel">
                <h2>Monitoring Network</h2>
                <p className="panel-description">Geographic overview of monitoring activity</p>
                <div style={{ marginTop: 22 }}><MapWrapper stations={data.stations} /></div>
              </div>
              <div className="panel">
                <h2>RadMap Sentinel</h2>
                <p className="panel-description">Environmental intelligence and event monitoring</p>
                {data.alerts.map((alert) => (
                  <div className="alert" key={`${alert.tag}-${alert.title}`}>
                    <div className="alert-tag">{alert.tag}</div>
                    <strong>{alert.title}</strong>
                    <p>{alert.detail}</p>
                  </div>
                ))}
                {data.alerts.length === 0 && <p className="panel-description">No active alerts.</p>}
              </div>
            </section>

            <section className="panel" style={{ marginTop: 18 }}>
              <h2>Recent Station Readings</h2>
              <p className="panel-description">Latest observations stored by the backend</p>
              {data.readings.map((reading) => (
                <div className="reading" key={reading.id}>
                  <span>{reading.station}</span>
                  <span>{reading.value === null ? "Unavailable" : `${reading.value.toFixed(2)} µSv/h`}</span>
                  <span style={{ color: "#8492a8" }}>{relativeTime(reading.time)}</span>
                </div>
              ))}
            </section>
            <p style={{ color: "#8492a8", fontSize: 11, marginTop: 18, textAlign: "center" }}>
              {data.is_demo ? "Seeded demonstration data · Not verified environmental measurements" : "Measurements require qualified human interpretation"}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
