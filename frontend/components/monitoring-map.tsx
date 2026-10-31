"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import type { Station } from "@/lib/api";

export default function MonitoringMap({ stations }: { stations: Station[] }) {
  return (
    <div style={{ height: "330px", width: "100%", overflow: "hidden", borderRadius: "11px" }}>
      <MapContainer
        center={[-0.0236, 37.9062]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => {
          const color = station.status === "Review required"
            ? "#ffb454"
            : station.status === "No recent data"
              ? "#9275ff"
              : "#39e0d0";
          return (
          <CircleMarker
            key={station.id}
            center={[station.latitude, station.longitude] as [number, number]}
            radius={9}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: 2
            }}
          >
            <Popup>
              <strong>{station.name}</strong>
              <br />
              Station: {station.id}
              <br />
              Reading: {station.value === null ? "Unavailable" : `${station.value.toFixed(2)} µSv/h`}
              <br />
              Status: {station.status}
            </Popup>
          </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
