"use client";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo } from "react";

type LatLng = {
  lat: number;
  lon: number;
};

type WalkMapProps = {
  start: LatLng;
  destination: LatLng;
};

// Configure default marker icon using images from /public
const DefaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function WalkMap({ start, destination }: WalkMapProps) {
  const startPos: [number, number] = [start.lat, start.lon];
  const destPos: [number, number] = [destination.lat, destination.lon];

  const center = useMemo<[number, number]>(() => {
    return [(start.lat + destination.lat) / 2, (start.lon + destination.lon) / 2];
  }, [start.lat, start.lon, destination.lat, destination.lon]);

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={startPos} />
        <Marker position={destPos} />
        <Polyline positions={[startPos, destPos]} />
      </MapContainer>
    </div>
  );
}
