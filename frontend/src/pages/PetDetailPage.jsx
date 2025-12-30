import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Sparkles,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PetDetailPage({
  pet,
  onBack,
  onRequestSubmitted,
  onNavigateToLogin
}) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Smart Pet Matching detection
  const matchScore = pet?.compatibilityScore;
  const isAIMatch = pet?._fromAI || (matchScore !== undefined && matchScore > 0);

  const [isRequested, setIsRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Match message logic
  const getMatchMessage = (score) => {
    if (score >= 80) {
      return {
        title: "Great Match!",
        description: "is highly compatible with your lifestyle preferences."
      };
    }
    if (score >= 50) {
      return {
        title: "Good Match",
        description: "matches reasonably well with your lifestyle preferences."
      };
    }
    return {
      title: "Low Match",
      description: "may not be the best fit for your current lifestyle preferences."
    };
  };

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
            req => req.petId?._id === pet._id || req.petId === pet._id
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
    if (!user) {
      const goLogin = window.confirm(
        "Please login to adopt. Would you like to go to the login page?"
      );
      if (goLogin && onNavigateToLogin) onNavigateToLogin();
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
        ? `http://localhost:5000/api/adopters/${user.id}/request/${pet._id}`
        : `http://localhost:5000/api/adopters/${user.id}/request`;

      const method = isRequested ? 'DELETE' : 'POST';
      const body = isRequested ? null : JSON.stringify({ petId: pet._id });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await res.json();

      if (data.success) {
        setIsRequested(!isRequested);
        if (!isRequested) setShowConfirmModal(true);
        if (onRequestSubmitted) onRequestSubmitted();
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
          <button onClick={onBack} className="btn-back flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Browse
          </button>
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
                Smart Pet Matching suggests that <strong>{pet.name}</strong>{" "}
                {getMatchMessage(matchScore).description}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <img
              src={pet.images?.[0]?.url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1"}
              alt={pet.name}
              className="w-full h-[500px] object-cover rounded-2xl"
            />

            <div className="section-card">
              <h2 className="text-2xl font-bold mb-4">About {pet.name}</h2>
              <p className="text-gray-700">
                {pet.description || "No description available."}
              </p>

              {pet.specialNeeds && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex gap-3">
                  <AlertCircle className="text-yellow-600" />
                  <div>
                    <p className="font-semibold">Special Needs</p>
                    <p className="text-sm">{pet.specialNeeds}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="section-card sticky top-24">
              <h3 className="text-2xl font-bold mb-2">{pet.name}</h3>
              <p className="text-gray-600 mb-6">
                {pet.breed} • {pet.species}
              </p>

              {pet.adoptionStatus === "Available" ? (
                <button
                  onClick={handleToggleRequest}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold flex justify-center gap-2
                  ${isRequested
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
                  {pet.shelterId?.phone || "Not provided"}
                </div>
                <div className="flex gap-2">
                  <Mail className="w-4 h-4" />
                  {pet.shelterId?.email || "Not provided"}
                </div>
              </div>

            </div>
          </div>
        </div>
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
