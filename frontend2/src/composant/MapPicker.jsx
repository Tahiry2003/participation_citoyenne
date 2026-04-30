import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

// Import icônes par défaut
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Icône pour la position utilisateur
const userIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red-2x.png",
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Gestion clic carte
function LocationMarker({ setCoords, onSelect, setSearch, setFromSearch }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const newCoords = { lat, lng };

      setCoords(newCoords);
      onSelect(newCoords);
      setFromSearch(false);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        if (data?.display_name) {
          setSearch(data.display_name);
          onSelect({ lat, lng, address: data.display_name });
        }
      } catch (err) {
        console.warn("Erreur reverse geocoding", err);
      }
    },
  });

  return null;
}

// FlyTo
function FlyToLocation({ coords, fromSearch }) {
  const map = useMap();
  if (coords) {
    map.flyTo(coords, fromSearch ? 15 : map.getZoom());
  }
  return null;
}

export default function MapPicker({ onSelect }) {
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState(null);
  const [fromSearch, setFromSearch] = useState(false);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => console.warn("Erreur position", err)
    );
  }, []);

  // Recherche
  const handleSearch = async () => {
    if (!search) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        search
      )}&limit=1`
    );
    const data = await res.json();

    if (data[0]) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      const newCoords = { lat, lng: lon, address: data[0].display_name };

      setCoords(newCoords);
      onSelect(newCoords);
      setFromSearch(true);
    } else {
      alert("Adresse introuvable !");
    }
  };

  return (
    <div className="relative">
      {/* BARRE DE RECHERCHE */}
      <div className="absolute top-2 right-2 z-[9999] flex gap-2">
        <input
          type="text"
          placeholder="Rechercher un lieu..."
          className="border w-64 border-gray-300 rounded-xl px-4 py-2 bg-white shadow focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors duration-200 hover:border-blue-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
        >
          Chercher
        </button>
    </div>

      {/* MAP */}
      <MapContainer
        center={userPosition || [-21.4527, 47.0842]} // utiliser userPosition si disponible
        zoom={13}
        style={{
          height: "385px",
          width: "100%",
          borderRadius: "12px",
        }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <LocationMarker
          setCoords={setCoords}
          onSelect={onSelect}
          setSearch={setSearch}
          setFromSearch={setFromSearch}
        />

        <FlyToLocation coords={coords} fromSearch={fromSearch} />

        {coords && <Marker position={coords} />}

        {userPosition && <Marker position={userPosition} icon={userIcon} />}
      </MapContainer>
    </div>
  );
}
