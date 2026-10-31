
"use client";

import { useState } from "react";
import {
  Bell,
  ShieldCheck,
  Monitor,
  MapPin,
  Save,
  RotateCcw,
} from "lucide-react";
import Sidebar from "@/components/sidebar";

export default function SettingsPage() {
  const defaultPreferences = {
    anomalyAlerts: true,
    coverageAlerts: true,
    dataQualityAlerts: true,
    emailNotifications: false,
    compactCards: false,
    showStationIds: true,
  };

  const [preferences, setPreferences] = useState(defaultPreferences);
  const [region, setRegion] = useState("East Africa");
  const [timeZone, setTimeZone] = useState("Africa/Nairobi");
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof typeof defaultPreferences) {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setSaved(false);
  }

  function resetSettings() {
    setPreferences(defaultPreferences);
    setRegion("East Africa");
    setTimeZone("Africa/Nairobi");
    setSaved(false);
  }

  const toggleRow = (
    title: string,
    description: string,
    key: keyof typeof defaultPreferences
  ) => (
    <div className="setting-row" key={key}>
      <div>
        <div className="setting-title">{title}</div>
        <div className="setting-description">{description}</div>
      </div>

      <button
        type="button"
        role="switch"
        aria-label={title}
        aria-checked={preferences[key]}
        onClick={() => toggle(key)}
        className={`setting-switch ${preferences[key] ? "on" : ""}`}
      >
        <span />
      </button>
    </div>
  );

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">SYSTEM CONFIGURATION</div>
            <h1>Settings</h1>
            <p className="page-description">
              Manage your RadMap workspace preferences.
            </p>
          </div>

          <div className="status-badge">
            <span className="status-dot" />
            Workspace active
          </div>
        </header>

        {/* NOTIFICATION SETTINGS */}
        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <Bell size={19} />
            </div>
            <div>
              <h2>Notifications</h2>
              <p>Choose which monitoring events you want to track.</p>
            </div>
          </div>

          {toggleRow(
            "Anomaly alerts",
            "Flagged changes in station readings.",
            "anomalyAlerts"
          )}

          {toggleRow(
            "Coverage alerts",
            "Updates about monitoring station coverage.",
            "coverageAlerts"
          )}

          {toggleRow(
            "Data quality alerts",
            "Missing, incomplete or inconsistent readings.",
            "dataQualityAlerts"
          )}

          {toggleRow(
            "Email notifications",
            "Enable email notification preferences.",
            "emailNotifications"
          )}
        </section>

        {/* DISPLAY SETTINGS */}
        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <Monitor size={19} />
            </div>
            <div>
              <h2>Display preferences</h2>
              <p>Adjust how monitoring information appears.</p>
            </div>
          </div>

          {toggleRow(
            "Compact station cards",
            "Use a more condensed station layout.",
            "compactCards"
          )}

          {toggleRow(
            "Show station IDs",
            "Display unique station identifiers.",
            "showStationIds"
          )}
        </section>

        {/* REGIONAL SETTINGS */}
        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <MapPin size={19} />
            </div>
            <div>
              <h2>Regional preferences</h2>
              <p>Set the region and time zone used by the workspace.</p>
            </div>
          </div>

          <div className="settings-form-grid">
            <label className="settings-field">
              <span>Monitoring region</span>

              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setSaved(false);
                }}
              >
                <option>East Africa</option>
                <option>West Africa</option>
                <option>Central Africa</option>
                <option>Southern Africa</option>
                <option>Global</option>
              </select>
            </label>

            <label className="settings-field">
              <span>Time zone</span>

              <select
                value={timeZone}
                onChange={(e) => {
                  setTimeZone(e.target.value);
                  setSaved(false);
                }}
              >
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Johannesburg">
                  Africa/Johannesburg (SAST)
                </option>
                <option value="UTC">UTC</option>
              </select>
            </label>
          </div>
        </section>

        {/* WORKSPACE CONFIGURATION */}
        <section className="settings-card">
          <div className="settings-heading">
            <div className="settings-icon">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2>Workspace configuration</h2>
              <p>Overview of your current workspace preferences.</p>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-title">Monitoring region</div>
              <div className="setting-description">{region}</div>
            </div>
            <span className="status-badge">Configured</span>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-title">Time zone</div>
              <div className="setting-description">{timeZone}</div>
            </div>
            <span className="status-badge">Configured</span>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-title">Notification preferences</div>
              <div className="setting-description">
                {Object.values(preferences).filter(Boolean).length} preferences enabled
              </div>
            </div>
            <span className="status-badge">Active</span>
          </div>
        </section>

        {/* ACTIONS */}
        <div className="settings-actions">
          <button
            className="secondary-button"
            onClick={resetSettings}
          >
            <RotateCcw size={16} />
            Reset defaults
          </button>

          <button
            className="primary-button"
            onClick={() => setSaved(true)}
          >
            <Save size={16} />
            Save preferences
          </button>
        </div>

        {saved && (
          <p className="success-message">
            <ShieldCheck size={15} />
            Preferences saved for this session.
          </p>
        )}
      </main>
    </div>
  );
}