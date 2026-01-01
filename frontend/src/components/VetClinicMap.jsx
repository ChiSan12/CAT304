import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix marker icon (REQUIRED for Leaflet + React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapEvents({ onMove }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onMove(center.lat, center.lng);
    },
  });
  return null;
}

function FlyToClinic({ clinic }) {
  const map = useMap();

  useEffect(() => {
    if (clinic) {
      map.flyTo(
        [clinic.location.lat, clinic.location.lng],
        16,
        { animate: true }
      );
    }
  }, [clinic, map]);

  return null;
}


export default function VetClinicMap() {
  const [location, setLocation] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClinics = async (lat, lng) => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/vet-clinics/nearby',
        { params: { lat, lng } }
      );
      setClinics(res.data || []);
    } catch (err) {
      console.error(err);
      setClinics([]);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setLocation(coords);

        try {
          await fetchClinics(coords[0], coords[1]);

        } catch (err) {
          setError('Failed to load nearby clinics');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Unable to access your location');
        setLoading(false);
      }
    );
  }, []);

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
      {/* 🗺️ Map */}
      <div className="h-[320px] rounded-xl overflow-hidden border">
        <MapContainer
  center={location}
  zoom={14}
  className="h-full w-full"
>
  {/* ✅ ADD THESE TWO LINES HERE */}
  <MapEvents onMove={fetchClinics} />
  <FlyToClinic clinic={selectedClinic} />

  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

  <Marker position={location}>
    <Popup>You are here</Popup>
  </Marker>

  {clinics.map(c => (
    <Marker
      key={c._id}
      position={[c.location.lat, c.location.lng]}
      eventHandlers={{
        click: () => setSelectedClinic(c),
      }}
    >
      <Popup>
        <strong>{c.name}</strong><br />
        {c.address}<br />
        {c.distance} km
      </Popup>
    </Marker>
  ))}
</MapContainer>

      </div>

      {/* 🏥 Clinic List */}
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
    ${selectedClinic?._id === c._id ? 'border-orange-400 bg-orange-50' : ''}
  `}
>
              <div>
                <p className="font-semibold text-gray-800">{c.name}</p>
                <p className="text-sm text-gray-500">{c.address}</p>
              </div>

              <span className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                {c.distance} km
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}