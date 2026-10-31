"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const stations = [
  { id: "RM-024", name: "Nairobi Station", position: [-1.2864, 36.8172] as [number, number], reading: "0.18 µSv/h", status: "Review required", color: "#ffb454" },
  { id: "RM-018", name: "Mombasa Station", position: [-4.0435, 39.6682] as [number, number], reading: "0.12 µSv/h", status: "Normal demo reading", color: "#39e0d0" },
  { id: "RM-031", name: "Kisumu Station", position: [-0.0917, 34.7680] as [number, number], reading: "0.14 µSv/h", status: "Normal demo reading", color: "#39e0d0" },
  { id: "RM-009", name: "Nakuru Station", position: [-0.3031, 36.0800] as [number, number], reading: "0.11 µSv/h", status: "Normal demo reading", color: "#39e0d0" },
  { id: "RM-042", name: "Garissa Station", position: [-0.4532, 39.6461] as [number, number], reading: "No recent reading", status: "Data unavailable", color: "#9275ff" }
];

export default function MonitoringMap() {
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

        {stations.map((station) => (
          <CircleMarker
            key={station.id}
            center={station.position}
            radius={9}
            pathOptions={{
              color: station.color,
              fillColor: station.color,
              fillOpacity: 0.85,
              weight: 2
            }}
          >
            <Popup>
              <strong>{station.name}</strong>
              <br />
              Station: {station.id}
              <br />
              Reading: {station.reading}
              <br />
              Status: {station.status}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
