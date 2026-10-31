"use client";

import dynamic from "next/dynamic";

const MonitoringMap = dynamic(
  () => import("./monitoring-map"),
  {
    ssr: false,
    loading: () => (
      <div className="map-placeholder">
        Loading monitoring map...
      </div>
    )
  }
);

export default function MapWrapper() {
  return <MonitoringMap />;
}
