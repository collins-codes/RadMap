const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export type Station = {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  coverage_area: string;
  active: boolean;
  value: number | null;
  recorded_at: string | null;
  status: string;
};

export type Reading = {
  id: string;
  station: string;
  location: string;
  value: number | null;
  time: string;
  status: string;
  source: string;
  is_demo: boolean;
};

export type Anomaly = {
  id: string;
  observation: string;
  station: string;
  location: string;
  reading: string;
  baseline: string;
  difference: string;
  severity: string;
  status: string;
  time: string;
  reviewer_note: string | null;
};

export type Evidence = {
  id: string;
  observation: string;
  anomaly: string;
  station: string;
  location: string;
  reading: string;
  timestamp: string;
  source: string;
  status: string;
  description: string;
  is_demo: boolean;
};

export type IntegrityCheck = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "Passed" | "Warning" | "Failed";
  details: string;
  checked_at: string | null;
};

export type Preferences = {
  region: string;
  time_zone: string;
  anomaly_alerts: boolean;
  coverage_alerts: boolean;
  data_quality_alerts: boolean;
  email_notifications: boolean;
  compact_cards: boolean;
  show_station_ids: boolean;
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot reach the RadMap API. Start the backend and check NEXT_PUBLIC_API_URL.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function displayTime(value: string | null): string {
  if (!value) return "No recent update";
  return new Date(value).toLocaleString();
}

export function relativeTime(value: string | null): string {
  if (!value) return "No recent update";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}
