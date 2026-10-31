"use client";

import dynamic from "next/dynamic";
import type { Station } from "@/lib/api";

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

export default function MapWrapper({ stations }: { stations: Station[] }) {
  return <MonitoringMap stations={stations} />;
}
