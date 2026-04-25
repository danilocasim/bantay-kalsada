import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Coordinates = { lat: number; lng: number };

export function MapPicker({
  value,
  onChange,
  center,
}: {
  value?: Coordinates;
  onChange: (coords: Coordinates) => void;
  center: Coordinates;
}) {
  return (
    <div className="rounded-3xl overflow-hidden border border-border bg-surface h-72">
      <MapContainer center={[center.lat, center.lng]} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer attribution="© OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapCenterUpdater center={center} />
        <MapClickHandler onChange={onChange} />
        {value && (
          <CircleMarker
            center={[value.lat, value.lng]}
            radius={11}
            pathOptions={{ color: "hsl(var(--primary))", fillColor: "hsl(var(--primary))", fillOpacity: 0.35, weight: 2 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

function MapCenterUpdater({ center }: { center: Coordinates }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center.lat, center.lng, map]);

  return null;
}

function MapClickHandler({ onChange }: { onChange: (coords: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}
