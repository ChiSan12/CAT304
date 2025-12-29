import React from 'react';
import { Heart, MapPin, Star, Check, ArrowRight } from 'lucide-react';

export default function PetCard({ pet, showScore, isRequested, onToggleRequest, onViewDetails }) {
  
  const statusClass = pet.adoptionStatus === 'Available' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white';
  
  const actionBtnClass = pet.adoptionStatus !== 'Available'
    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
    : isRequested
      ? 'bg-green-100 text-green-700 border-2 border-green-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500'
      : 'bg-[#FF8C42] hover:bg-[#e67e3b] text-white';

  return (
    <div className="pet-card">
      {/* Image section */}
      <div className="pet-card-image-wrapper group">
        <img
          src={pet.images?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
          alt={pet.name}
          className="pet-card-image"
        />
        
        {showScore && pet.compatibilityScore && (
          <div className="badge-ai">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{pet.compatibilityScore}% Match</span>
            </div>
            <span className="text-[10px] text-white/80">AI Recommended</span>
          </div>
        )}

        <span className={`badge-status ${statusClass}`}>
          {pet.adoptionStatus}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pet.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
           <span className="tag-pill bg-orange-100 text-orange-800">
             {pet.size}
           </span>
           {pet.labels?.temperament?.slice(0, 2).map((trait, idx) => (
             <span key={idx} className="tag-pill bg-yellow-100 text-yellow-800">
               {trait}
             </span>
           ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 mt-auto">
          <MapPin className="w-4 h-4" />
          <span>
            {pet.shelterId?.name || 'Unknown Shelter'}
            {pet.shelterId?.location?.city && `, ${pet.shelterId.location.city}`}
          </span>
        </div>

        <div className="space-y-2">
          <button onClick={onViewDetails} className="btn-secondary">
            View Details <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleRequest(pet._id, isRequested)}
            disabled={pet.adoptionStatus !== 'Available'}
            className={`btn-action-sm ${actionBtnClass}`}
          >
            {pet.adoptionStatus !== 'Available' ? 'Not Available' 
             : isRequested ? <><Check className="w-5 h-5" /> Requested</> 
             : <><Heart className="w-5 h-5" /> Adopt Me</>}
          </button>
        </div>
      </div>
    </div>
  );
}