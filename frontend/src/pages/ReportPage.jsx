import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { MapPin, Camera, FileText, Heart, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Component to place pin
function LocationMarker({ pin, setPin }) {
  useMapEvents({
    click(e) {
      setPin(e.latlng);
    },
  });
  return pin ? (
    <Marker position={pin}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

// Smoothly recenter map
function RecenterMap({ coords }) {
  const map = useMap();
  if (coords) {
    map.flyTo(coords, 17);
  }
  return null;
}

// ===================== Submission Modal =====================
function SubmissionModal({ onClose, redirectTo }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
  const timer = setInterval(() => {
    setBounce(true); // trigger bounce animation
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        navigate(redirectTo);
        window.scrollTo({ top: 0, behavior: "smooth" }); // <-- scroll to top
        return 0;
      }
      return prev - 1;
    });
    setTimeout(() => setBounce(false), 300); // reset bounce
  }, 1000);

  return () => clearInterval(timer);
}, [navigate, redirectTo]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold"
        >
          ✖
        </button>
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <h2 className="text-2xl font-bold text-orange-500 mb-2">
          Report Submitted!
        </h2>
        <p className="text-gray-700 mb-4">
          Thank you for helping animals in need. 🐾
        </p>
        <p className="text-gray-600 text-xl">
          Redirecting to My Reports in{" "}
          <span
            className={`font-bold inline-block transition-transform ${
              bounce ? "scale-125" : "scale-100"
            }`}
          >
            {countdown}
          </span>{" "}
          seconds...
        </p>
      </div>
    </div>
  );
}

// ===================== Main Component =====================
export default function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [userLocation, setUserLocation] = useState([5.4141, 100.3294]);

  // Form states
  const [animalType, setAnimalType] = useState("");
  const [number, setNumber] = useState("");
  const [condition, setCondition] = useState("");
  const [otherCondition, setOtherCondition] = useState("");
  const [animalDesc, setAnimalDesc] = useState("");
  const [placeDesc, setPlaceDesc] = useState("");
  const [photo, setPhoto] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Track Me button
  const trackUser = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        alert(`You are here:\nLat: ${coords[0]}\nLng: ${coords[1]}`);
      },
      () => alert("Unable to get your location")
    );
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!pin) return alert("Place a pin on the map first!");
    if (!animalDesc || !placeDesc || !animalType || !condition)
      return alert("Please fill in all the required fields!");
    if (!photo) return alert("Please upload a photo of the animal! 🐾");
    if (condition === "Other" && !otherCondition)
      return alert("Please describe the animal's condition!");

    const finalCondition = condition === "Other" ? otherCondition : condition;

    const formData = new FormData();
    formData.append("animalType", animalType);
    formData.append("number", number);
    formData.append("condition", finalCondition);
    formData.append("animalDesc", animalDesc);
    formData.append("placeDesc", placeDesc);
    formData.append("pinLat", pin.lat);
    formData.append("pinLng", pin.lng);
    formData.append("email", user?.email); // Automatically use logged-in user's email
    formData.append("photoUrl", photo);

    try {
      await axios.post("http://localhost:5000/api/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Reset all form fields
      setAnimalType("");
      setNumber("");
      setCondition("");
      setOtherCondition("");
      setAnimalDesc("");
      setPlaceDesc("");
      setPhoto(null);
      setPin(null);

      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit report");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            📍 Report a Stray Animal
          </h1>
          <p className="text-lg md:text-xl text-orange-50 max-w-2xl mx-auto">
            Help us rescue animals in need. Your report can save a life and make
            our community safer for everyone.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Step 1: Location */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 text-white px-6 py-4 flex items-center gap-3">
            <MapPin size={28} />
            <div>
              <h2 className="text-2xl font-bold">Step 1: Mark the Location</h2>
              <p className="text-orange-50 text-sm">
                Pin the exact spot where you found the animal
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <button
              onClick={trackUser}
              className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-md"
            >
              📍 Use My Current Location
            </button>

            <div className="rounded-xl overflow-hidden border-4 border-orange-100 relative z-0">
              <MapContainer
                center={userLocation}
                zoom={15}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={userLocation}>
                  <Popup>You are here</Popup>
                </Marker>
                <LocationMarker pin={pin} setPin={setPin} />
                <RecenterMap coords={userLocation} />
              </MapContainer>
            </div>

            {pin && (
              <div className="bg-orange-50 p-4 rounded-xl">
                <p className="text-gray-800 font-semibold">
                  ✅ Pin Placed:{" "}
                  <span className="font-normal">
                    Lat {pin.lat.toFixed(6)}, Lng {pin.lng.toFixed(6)}
                  </span>
                </p>
              </div>
            )}

            {!pin && (
              <p className="text-gray-500 text-sm italic">
                👆 Click anywhere on the map to drop a pin
              </p>
            )}
          </div>
        </div>

        {/* Step 2: Animal Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 text-white px-6 py-4 flex items-center gap-3">
            <Heart size={28} />
            <div>
              <h2 className="text-2xl font-bold">Step 2: Animal Details</h2>
              <p className="text-orange-50 text-sm">
                Tell us about the animal you found
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Type of Animal
                </label>
                <select
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-400 focus:outline-none transition"
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                >
                  <option value="">Select type</option>
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Number of Animals
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-400 focus:outline-none transition"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-400 focus:outline-none transition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="">Select condition</option>
                  <option>Healthy</option>
                  <option>Injured</option>
                  <option>Sick</option>
                  <option>Other</option>
                </select>

                {condition === "Other" && (
                  <input
                    type="text"
                    placeholder="Please describe the condition"
                    className="mt-2 w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-400 focus:outline-none transition"
                    value={otherCondition}
                    onChange={(e) => setOtherCondition(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Description of Animal
              </label>
              <textarea
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-orange-400 focus:outline-none transition"
                rows={4}
                placeholder="Describe the animal's appearance, behavior, color, size, any distinguishing features..."
                value={animalDesc}
                onChange={(e) => setAnimalDesc(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Location Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 text-white px-6 py-4 flex items-center gap-3">
            <FileText size={28} />
            <div>
              <h2 className="text-2xl font-bold">Step 3: Location Details</h2>
              <p className="text-orange-50 text-sm">
                Help us find the exact spot
              </p>
            </div>
          </div>

          <div className="p-6">
            <label className="block font-semibold text-gray-700 mb-2">
              Description of Place
            </label>
            <textarea
              className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-orange-400 focus:outline-none transition"
              rows={4}
              placeholder="E.g., 'Behind the coffee shop on Main Street'..."
              value={placeDesc}
              onChange={(e) => setPlaceDesc(e.target.value)}
            />
          </div>
        </div>

        {/* Step 4: Photo Upload */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 text-white px-6 py-4 flex items-center gap-3">
            <Camera size={28} />
            <div>
              <h2 className="text-2xl font-bold">
                Step 4: Upload a Photo 🐾
              </h2>
              <p className="text-orange-50 text-sm">
                A cute photo will help us find and rescue the animal faster! 📸
              </p>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-orange-400 transition ${
                !photo ? "border-red-300" : "border-green-300"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full cursor-pointer"
                id="photo-upload"
              />
              {!photo && (
                <p className="mt-3 text-red-400 font-semibold">
                  Please upload a photo 🐶🐱
                </p>
              )}
              {photo && (
                <p className="mt-3 text-green-600 font-semibold">
                  ✅ Yay! Photo selected: {photo.name} 🎉
                </p>
              )}
            </div>

            {/* Note about reporter */}
            <p className="text-gray-700 text-sm italic text-center">
              This report will be recorded under <strong>{user?.email}</strong>
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-4 pb-8">
          <button
            onClick={handleSubmit}
            className="px-12 py-4 bg-orange-500 text-white text-lg rounded-xl font-bold hover:bg-orange-600 transition shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🚀 Submit Report
          </button>

          <div className="text-center pt-4 pb-12">
            <button
              onClick={() => navigate("/my-reports")}
              className="px-12 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-lg rounded-xl font-bold hover:from-orange-500 hover:to-orange-600 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📋 Check My Report Status
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SubmissionModal
          onClose={() => setShowModal(false)}
          redirectTo="/my-reports"
        />
      )}
    </div>
  );
}
