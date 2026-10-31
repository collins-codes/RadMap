"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { Activity, AlertTriangle, Radio, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { api } from "@/lib/api";

type AnalyticsData = {
  summary: { observations: number; stations: number; highest_reading: number; flagged: number };
  trend: Record<string, string | number | undefined>[];
  stations: { station: string; value: number }[];
  distribution: { name: string; value: number }[];
};
const colors = ["#39e0d0", "#ffb454", "#9275ff"];
const tooltipStyle = { backgroundColor: "#0d1522", border: "1px solid #243247", borderRadius: 8, color: "#e7edf7" };

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<AnalyticsData>("/analytics").then(setData).catch((reason: Error) => setError(reason.message));
  }, []);

  const series = data?.stations.slice(0, 3).map((item) => ({
    name: item.station,
    key: item.station.toLowerCase(),
  })) ?? [];

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <header className="topbar"><div><h1>Environmental Analytics</h1><p className="subtitle">Explore trends and patterns across stored monitoring observations.</p></div><div className="status"><span>●</span> BACKEND DATA</div></header>
        {error && <p role="alert" className="error-message">{error}</p>}
        {!data && !error && <p className="panel-description">Loading analytics…</p>}
        {data && <>
          <section className="stats">
            {[{ label: "Observations", value: data.summary.observations.toLocaleString(), note: "Stored records", icon: Activity }, { label: "Monitoring stations", value: data.summary.stations.toLocaleString(), note: "Configured network", icon: Radio }, { label: "Highest reading", value: data.summary.highest_reading.toFixed(2), note: "µSv/h · stored data", icon: TrendingUp }, { label: "Flagged observations", value: data.summary.flagged.toLocaleString(), note: "Requires review", icon: AlertTriangle }].map((item) => { const Icon = item.icon; return <div className="panel" key={item.label}><Icon size={19} color="#39e0d0" /><div className="stat-value">{item.value}</div><div className="stat-label">{item.label}</div><div className="stat-note">{item.note}</div></div>; })}
          </section>
          <section className="panel" style={{ marginTop: 18 }}>
            <h2>Observation Trends</h2><p className="panel-description">Recorded values by station and time.</p>
            <div style={{ width: "100%", height: 330, marginTop: 24 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={data.trend}><CartesianGrid stroke="#243247" strokeDasharray="3 3" /><XAxis dataKey="time" stroke="#8492a8" /><YAxis stroke="#8492a8" tickFormatter={(value: number) => value.toFixed(2)} /><Tooltip contentStyle={tooltipStyle} /><Legend />{series.map((item, index) => <Line key={item.key} type="monotone" dataKey={item.key} name={item.name} stroke={colors[index]} strokeWidth={2} dot />)}</LineChart></ResponsiveContainer></div>
          </section>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginTop: 18 }}>
            <div className="panel"><h2>Station Comparison</h2><p className="panel-description">Latest recorded value by station (µSv/h).</p><div style={{ width: "100%", height: 280, marginTop: 20 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={data.stations}><CartesianGrid stroke="#243247" strokeDasharray="3 3" /><XAxis dataKey="station" stroke="#8492a8" tick={{ fontSize: 10 }} /><YAxis stroke="#8492a8" /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="value" name="Reading (µSv/h)" fill="#39e0d0" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
            <div className="panel"><h2>Observation Distribution</h2><p className="panel-description">Categories calculated from stored readings.</p><div style={{ width: "100%", height: 240, marginTop: 15 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>{data.distribution.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></div><div style={{ display: "grid", gap: 12 }}>{data.distribution.map((item, index) => <div key={item.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aab6c8" }}><span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[index % colors.length], marginRight: 8 }} />{item.name}</span><strong>{item.value}%</strong></div>)}</div></div>
          </section>
          <p style={{ color: "#8492a8", fontSize: 11, marginTop: 18, textAlign: "center" }}>Charts reflect database records; seeded demonstration readings are not verified measurements.</p>
        </>}
      </main>
    </div>
  );
}
