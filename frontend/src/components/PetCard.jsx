import React from "react";
import { Heart, MapPin, Star, Check, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function PetCard({
  pet,
  showScore,
  isRequested,
  onToggleRequest,
}) {
  const statusClass =
    pet.adoptionStatus === "Available"
      ? "bg-green-500 text-white"
      : "bg-yellow-500 text-white";

  const actionBtnClass =
    pet.adoptionStatus !== "Available"
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : isRequested
      ? "bg-green-100 text-green-700 border-2 border-green-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500"
      : "bg-[#FF8C42] hover:bg-[#e67e3b] text-white";

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
    if (years && months) return `${years} yrs ${months} mo`;
    if (years) return `${years} yrs`;
    return `${months} mo`;
  };

  return (
    <div className="pet-card">
      {/* Image section */}
      <div className="pet-card-image-wrapper group">
        <img
          src={
            pet.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80"
          }
          alt={pet.name}
          className="pet-card-image"
        />

        {showScore && pet.compatibilityScore > 0 && (
          <div className="badge-ai">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{pet.compatibilityScore}% Match</span>
            </div>
            <span className="text-[10px] text-white/80">Smart Match</span>
          </div>
        )}

        <span className={`badge-status ${statusClass}`}>
          {pet.adoptionStatus}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {pet.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {/* Show age tag if available */}
          {formatAge(pet.age) && (
            <span className="tag-pill bg-blue-100 text-blue-800">
              {formatAge(pet.age)}
            </span>
          )}

          {/* Pet size */}
          <span className="tag-pill bg-orange-100 text-orange-800">
            {pet.size}
          </span>

          {/* Show up to two temperament labels */}
          {pet.labels?.temperament?.slice(0, 2).map((trait, idx) => (
            <span key={idx} className="tag-pill bg-yellow-100 text-yellow-800">
              {trait}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 mt-auto">
          <MapPin className="w-4 h-4" />
          <span>
            {pet.shelterId?.name || "Unknown Shelter"}
            {pet.shelterId?.location?.city &&
              `, ${pet.shelterId.location.city}`}
          </span>
        </div>

        <div className="space-y-2">
          <NavLink 
            to={`/pets/${pet._id}`}
            state={{ 
              compatibilityScore: pet.compatibilityScore,
              fromAIMatch: showScore && pet.compatibilityScore > 0
            }}

            onClick={() => {
              sessionStorage.setItem('browseScrollPosition', window.scrollY.toString());
            }}
            className="btn-secondary"
          >
            View Details <ArrowRight className="w-4 h-4" />
          </NavLink>

          <button
            onClick={() => onToggleRequest(pet._id, isRequested)}
            disabled={pet.adoptionStatus !== "Available"}
            className={`btn-action-sm ${actionBtnClass}`}
          >
            {pet.adoptionStatus !== "Available" ? (
              "Not Available"
            ) : isRequested ? (
              <>
                <Check className="w-5 h-5" /> Requested
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" /> Adopt Me
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
