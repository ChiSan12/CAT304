import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

/* ================= LEAFLET MARKER FIX ================= */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* ================= MAP CLICK HANDLER ================= */
function MapEvents({ enabled, onPickLocation }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      const { lat, lng } = e.latlng;
      onPickLocation(lat, lng);
    },
  });
  return null;
}

/* ================= FLY TO CLINIC ================= */
function FlyToClinic({ clinic }) {
  const map = useMap();

  useEffect(() => {
    if (!clinic) return;

    map.flyTo(
      [
        clinic.location.coordinates[1], // lat
        clinic.location.coordinates[0], // lng
      ],
      16,
      { animate: true }
    );
  }, [clinic, map]);

  return null;
}

/* ================= MAIN COMPONENT ================= */
export default function VetClinicMap() {
  /* 🔹 MODIFIED: state moved INSIDE component */
  const [location, setLocation] = useState(null); // [lat, lng]
  const [mode, setMode] = useState("auto"); // auto | manual
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH CLINICS ================= */
  const fetchClinics = async (lat, lng) => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/vet-clinics/nearby",
        { params: { lat, lng } }
      );
      setClinics(res.data || []);
    } catch (err) {
      console.error(err);
      setClinics([]);
    }
  };

  /* ================= AUTO LOCATE ================= */
  const locateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMode("auto");
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => {
        setError("Unable to access your location");
        setLoading(false);
      }
    );
  };

  /* 🔹 MODIFIED: auto locate on first load */
  useEffect(() => {
    locateMe();
  }, []);

  /* 🔹 MODIFIED: fetch clinics when location changes */
  useEffect(() => {
    if (!location) return;
    fetchClinics(location[0], location[1]);
  }, [location]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        📍 Finding veterinary clinics near you...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 text-center py-8">
        ❌ {error}
      </div>
    );
  }

  if (!location) return null;

  /* ================= UI ================= */
  return (
    <div className="space-y-4 max-w-5xl mx-auto">

      {/* 🔹 MODIFIED: MODE TOGGLE BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={locateMe}
          className={`px-4 py-2 rounded-lg text-sm border
            ${mode === "auto"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700"}
          `}
        >
          📍 Use My Location
        </button>

        <button
          onClick={() => setMode("manual")}
          className={`px-4 py-2 rounded-lg text-sm border
            ${mode === "manual"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700"}
          `}
        >
          📌 Choose on Map
        </button>
      </div>

      {/* 🗺️ MAP */}
      <div className="h-[320px] rounded-xl overflow-hidden border">
        <MapContainer center={location} zoom={14} className="h-full w-full">
          <MapEvents
            enabled={mode === "manual"}
            onPickLocation={(lat, lng) => {
              setLocation([lat, lng]);
              fetchClinics(lat, lng);
            }}
          />

          <FlyToClinic clinic={selectedClinic} />

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={location}>
            <Popup>
              {mode === "auto" ? "Your location" : "Selected location"}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* 🏥 CLINIC LIST */}
      {clinics.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-4">
          🐾 No veterinary clinics found nearby
        </div>
      ) : (
        <div className="space-y-3">
          {clinics.map((c) => (
            <div
              key={c._id}
              onClick={() => setSelectedClinic(c)}
              className={`p-4 border rounded-xl flex justify-between cursor-pointer
                ${
                  selectedClinic?._id === c._id
                    ? "border-orange-400 bg-orange-50"
                    : ""
                }
              `}
            >
              <div>
                <p className="font-semibold text-gray-800">{c.name}</p>
                <p className="text-sm text-gray-500">{c.address}</p>
              </div>

              <span className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                {c.distance ? `${(c.distance / 1000).toFixed(1)} km` : "-- km"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}