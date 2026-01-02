import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Sparkles,
  XCircle,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate, useParams, useLocation  } from "react-router-dom";

export default function PetDetailPage() {
  const { user } = useAuth();
  const { petId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state || {};
  const [pet, setPet] = useState(null);

  // Smart Pet Matching detection
  const matchScore = navState.compatibilityScore ?? pet?.compatibilityScore;
  const isAIMatch =
    navState.fromAIMatch || pet?._fromAI || (matchScore !== undefined && matchScore > 0);

  const [isRequested, setIsRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Format pet age to a readable string (supports object, number, or string formats)
  // Example outputs: "2 yrs 3 mo", "3 yrs", "8 mo"
  const formatAge = (age) => {
    // If no age data exists, return nothing
    if (!age) return null;

    // If age is already a formatted string (e.g., from virtual "fullAge")
    if (typeof age === "string") {
      return age;
    }

    // If age is stored as an object { years, months }
    const years = age.years ?? 0;
    const months = age.months ?? 0;

    // If both are zero or missing, do not display age
    if (!years && !months) return null;

    // Build formatted age string based on available values
    if (years && months) return `${years} year(s) ${months} month(s)`;
    if (years) return `${years} year(s)`;
    return `${months} month(s)`;
  };

  // Match message logic
  const getMatchMessage = (score) => {
    if (score >= 80) {
      return {
        title: "Great Match!",
        description: "is highly compatible with your lifestyle preferences.",
      };
    }
    if (score >= 50) {
      return {
        title: "Good Match",
        description: "matches reasonably well with your lifestyle preferences.",
      };
    }
    return {
      title: "Low Match",
      description:
        "may not be the best fit for your current lifestyle preferences.",
    };
  };

  useEffect(() => {
    // Get Pet Detail
    const fetchPet = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/adopters/pets/${petId}`
        );
        const data = await response.json();
        if (data.success) {
          setPet({
          ...data.pet,
          compatibilityScore: navState.compatibilityScore ?? data.pet.compatibilityScore,
          _fromAI: navState.fromAIMatch ?? data.pet._fromAI
          });
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPet();
  }, [petId, navState.compatibilityScore, navState.fromAIMatch]);

  // Check request status
  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/adopters/${user.id}/requests`
        );
        const data = await res.json();

        if (data.success) {
          const requested = data.requests.some(
            (req) => req.petId?._id === pet?._id || req.petId === pet?._id
          );
          setIsRequested(requested);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkRequestStatus();
  }, [user, pet]);

  // Request or cancel
  const handleToggleRequest = async () => {
    if (!user|| !user.id) {
      const goLogin = window.confirm(
        "Please login to adopt. Would you like to go to the login page?"
      );
      if (goLogin) navigate("/login");
      return;
    }

    if (isRequested) {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel your request?"
      );
      if (!confirmCancel) return;
    }

    setLoading(true);

    try {
      const url = isRequested
        ? `http://localhost:5000/api/adopters/${user.id}/request/${pet?._id}`
        : `http://localhost:5000/api/adopters/${user.id}/request`;

      const method = isRequested ? "DELETE" : "POST";
      const body = isRequested ? null : JSON.stringify({ petId: pet?._id });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (data.success) {
        setIsRequested(!isRequested);
        if (!isRequested) setShowConfirmModal(true);
        // if (onRequestSubmitted) onRequestSubmitted();
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="content-wrapper py-4">
          <NavLink to="/pets" className="btn-back flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Browse
          </NavLink>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Smart Pet Matching */}
        {isAIMatch && (
          <div className="mb-8 bg-gradient-to-r from-orange-100 to-amber-50 border border-orange-200 rounded-2xl p-6 flex gap-4">
            <div className="p-3 bg-white rounded-full text-[#FF8C42]">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">
                  {getMatchMessage(matchScore).title}
                </h3>

                {matchScore !== undefined && (
                  <span className="bg-[#FF8C42] text-white text-xs font-bold px-2 py-1 rounded-full">
                    {matchScore}% Compatible
                  </span>
                )}
              </div>

              <p className="text-gray-700">
                Smart Pet Matching suggests that <strong>{pet?.name}</strong>{" "}
                {getMatchMessage(matchScore).description}
              </p>
            </div>
          </div>
        )}

        {initialLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF8C42] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !pet ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">
              No pet found
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              <img
                src={
                  pet?.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1543466835-00a7907e9de1"
                }
                alt={pet?.name}
                className="w-full h-[500px] object-cover rounded-2xl"
              />

              <div className="section-card">
                <h2 className="text-2xl font-bold mb-4">About {pet?.name}</h2>
                <p className="text-gray-700">
                  {pet?.description || "No description available."}
                </p>

                {pet?.specialNeeds && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex gap-3">
                    <AlertCircle className="text-yellow-600" />
                    <div>
                      <p className="font-semibold">Special Needs</p>
                      <p className="text-sm">{pet?.specialNeeds}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div>
              <div className="section-card sticky top-24">
                <h3 className="text-2xl font-bold mb-2">{pet?.name}</h3>
                <p className="text-gray-600 mb-6">
                  {pet?.breed} • {pet?.species}
                  {pet?.gender && <> • {pet?.gender}</>}
                  {pet?.size && <> • {pet?.size}</>}
                  {/* Only show age if data exists */}
                  {formatAge(pet?.age) && <> • {formatAge(pet?.age)}</>}
                </p>

                {pet?.adoptionStatus === "Available" ? (
                  <button
                    onClick={handleToggleRequest}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold flex justify-center gap-2
                  ${
                    isRequested
                      ? "bg-red-100 text-red-600"
                      : "bg-[#FF8C42] text-white"
                  }`}
                  >
                    {isRequested ? <XCircle /> : <Heart />}
                    {isRequested ? "Cancel Request" : "Request to Adopt"}
                  </button>
                ) : (
                  <div className="text-center p-4 bg-gray-100 rounded-xl">
                    Not Available
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-600 space-y-2">
                  <div className="flex gap-2">
                    <Phone className="w-4 h-4" />
                    {pet?.shelterId?.phone || "Not provided"}
                  </div>
                  <div className="flex gap-2">
                    <Mail className="w-4 h-4" />
                    {pet?.shelterId?.email || "Not provided"}
                  </div>
                </div>

                {pet?.labels?.temperament?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Temperament</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pet?.labels.temperament.map((t, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pet?.healthStatus && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-xl text-sm">
                    <p>
                      <strong>Vaccinated:</strong>{" "}
                      {pet?.healthStatus.vaccinated ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Neutered:</strong>{" "}
                      {pet?.healthStatus.neutered ? "Yes" : "No"}
                    </p>
                    {pet?.healthStatus.medicalConditions?.length > 0 && (
                      <p>
                        <strong>Conditions:</strong>{" "}
                        {pet?.healthStatus.medicalConditions.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Request Sent</h3>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="mt-4 bg-[#FF8C42] text-white px-6 py-2 rounded-xl"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
