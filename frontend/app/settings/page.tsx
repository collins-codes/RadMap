"use client";

import { useEffect, useState } from "react";
import { Bell, MapPin, Monitor, RotateCcw, Save, ShieldCheck } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { api, type Preferences } from "@/lib/api";

const defaults: Preferences = {
  region: "East Africa",
  time_zone: "Africa/Nairobi",
  anomaly_alerts: true,
  coverage_alerts: true,
  data_quality_alerts: true,
  email_notifications: false,
  compact_cards: false,
  show_station_ids: true,
};

type ToggleKey = Exclude<keyof Preferences, "region" | "time_zone">;

export default function SettingsPage() {
  const [preferences, setPreferences] = useState(defaults);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Preferences>("/settings").then(setPreferences).catch((reason: Error) => setError(reason.message));
  }, []);

  function toggle(key: ToggleKey) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  }

  async function persist(value: Preferences) {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const savedPreferences = await api<Preferences>("/settings", { method: "PUT", body: JSON.stringify(value) });
      setPreferences(savedPreferences);
      setSaved(true);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const toggleRow = (title: string, description: string, key: ToggleKey) => (
    <div className="setting-row" key={key}>
      <div><div className="setting-title">{title}</div><div className="setting-description">{description}</div></div>
      <button type="button" role="switch" aria-label={title} aria-checked={preferences[key]} onClick={() => toggle(key)} className={`setting-switch ${preferences[key] ? "on" : ""}`}><span /></button>
    </div>
  );

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <header className="topbar"><div><div className="eyebrow">SYSTEM CONFIGURATION</div><h1>Settings</h1><p className="page-description">Manage persistent RadMap workspace preferences.</p></div><div className="status-badge"><span className="status-dot" />Workspace active</div></header>
        {error && <p role="alert" className="error-message">{error}</p>}
        <section className="settings-card">
          <div className="settings-heading"><div className="settings-icon"><Bell size={19} /></div><div><h2>Notifications</h2><p>Choose which monitoring events to track.</p></div></div>
          {toggleRow("Anomaly alerts", "Flagged changes in station readings.", "anomaly_alerts")}
          {toggleRow("Coverage alerts", "Updates about station coverage.", "coverage_alerts")}
          {toggleRow("Data quality alerts", "Missing or inconsistent observations.", "data_quality_alerts")}
          {toggleRow("Email notifications", "Enable email notification preferences.", "email_notifications")}
        </section>
        <section className="settings-card">
          <div className="settings-heading"><div className="settings-icon"><Monitor size={19} /></div><div><h2>Display preferences</h2><p>Adjust how monitoring information appears.</p></div></div>
          {toggleRow("Compact station cards", "Use a more condensed station layout.", "compact_cards")}
          {toggleRow("Show station IDs", "Display unique station identifiers.", "show_station_ids")}
        </section>
        <section className="settings-card">
          <div className="settings-heading"><div className="settings-icon"><MapPin size={19} /></div><div><h2>Regional preferences</h2><p>Set the region and time zone used by the workspace.</p></div></div>
          <div className="settings-form-grid">
            <label className="settings-field"><span>Monitoring region</span><select value={preferences.region} onChange={(event) => { setPreferences((value) => ({ ...value, region: event.target.value })); setSaved(false); }}><option>East Africa</option><option>West Africa</option><option>Central Africa</option><option>Southern Africa</option><option>Global</option></select></label>
            <label className="settings-field"><span>Time zone</span><select value={preferences.time_zone} onChange={(event) => { setPreferences((value) => ({ ...value, time_zone: event.target.value })); setSaved(false); }}><option value="Africa/Nairobi">Africa/Nairobi (EAT)</option><option value="Africa/Lagos">Africa/Lagos (WAT)</option><option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option><option value="UTC">UTC</option></select></label>
          </div>
        </section>
        <section className="settings-card">
          <div className="settings-heading"><div className="settings-icon"><ShieldCheck size={19} /></div><div><h2>Workspace configuration</h2><p>Current saved preferences.</p></div></div>
          <div className="setting-row"><div><div className="setting-title">Monitoring region</div><div className="setting-description">{preferences.region}</div></div><span className="status-badge">Configured</span></div>
          <div className="setting-row"><div><div className="setting-title">Time zone</div><div className="setting-description">{preferences.time_zone}</div></div><span className="status-badge">Configured</span></div>
          <div className="setting-row"><div><div className="setting-title">Notification preferences</div><div className="setting-description">{Object.entries(preferences).filter(([key, value]) => key !== "region" && key !== "time_zone" && value).length} enabled</div></div><span className="status-badge">Active</span></div>
        </section>
        <div className="settings-actions">
          <button type="button" className="secondary-button" disabled={saving} onClick={() => { setPreferences(defaults); void persist(defaults); }}><RotateCcw size={16} />Reset defaults</button>
          <button type="button" className="primary-button" disabled={saving} onClick={() => void persist(preferences)}><Save size={16} />{saving ? "Saving…" : "Save preferences"}</button>
        </div>
        {saved && <p className="success-message"><ShieldCheck size={15} />Preferences saved to the backend.</p>}
      </main>
    </div>
  );
}
