import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MapPin, CheckCircle, AlertCircle, Phone, Mail, Sparkles, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PetDetailPage({ pet, onBack, onRequestSubmitted }) {
  const { user } = useAuth();
  
  // 1. Smart Pet Matching detection (compatible with old and new data)
  const matchScore = pet?.compatibilityScore;
  // If coming from Smart Pet Matching list or has a valid score greater than 0, treat as a smart match
  const isAIMatch = pet?._fromAI || (matchScore !== undefined && matchScore > 0);
  
  const [isRequested, setIsRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 2. Check whether the user has already requested this pet
  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/adopters/${user.id}/requests`);
        const data = await res.json();
        
        if (data.success) {
          // Check if this pet ID exists in the request list
          const requested = data.requests.some(
            req => (req.petId._id === pet._id) || (req.petId === pet._id)
          );
          setIsRequested(requested);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    checkRequestStatus();
  }, [user, pet]);

  // 3. Handle request or cancel request
  const handleToggleRequest = async () => {
    if (!user) {
      alert('Please login to adopt!');
      return;
    }

    // Show confirmation dialog when cancelling
    if (isRequested) {
      const confirmCancel = window.confirm("Are you sure you want to cancel your request?");
      if (!confirmCancel) return;
    }

    setLoading(true);

    try {
      // Dynamically determine API endpoint and HTTP method
      const url = isRequested 
        ? `http://localhost:5000/api/adopters/${user.id}/request/${pet._id}` // Delete
        : `http://localhost:5000/api/adopters/${user.id}/request`;           // Post
      
      const method = isRequested ? 'DELETE' : 'POST';
      const body = isRequested ? null : JSON.stringify({ petId: pet._id });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await res.json();

      if (data.success) {
        const newStatus = !isRequested;
        setIsRequested(newStatus);
        
        // Show modal only when request is successfully submitted
        if (newStatus) {
          setShowConfirmModal(true);
        } else {
          alert("Request cancelled.");
        }

        // Notify parent page to refresh data
        if (onRequestSubmitted) onRequestSubmitted();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error(error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="content-wrapper py-4 flex justify-between items-center">
          <button onClick={onBack} className="btn-back">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Browse</span>
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        
        {/* Smart Pet Matching banner (shown only for matched pets) */}
        {isAIMatch && (
          <div className="mb-8 bg-gradient-to-r from-orange-100 to-amber-50 border border-orange-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-fade-in">
            <div className="p-3 bg-white rounded-full shadow-sm text-[#FF8C42] mt-1">
               <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-xl font-bold text-gray-900">Great Match!</h3>
                 {matchScore && <span className="bg-[#FF8C42] text-white text-xs font-bold px-2 py-1 rounded-full">{matchScore}% Compatible</span>}
              </div>
              <p className="text-gray-700">
                Smart Pet Matching suggests that <strong>{pet.name}</strong> is highly compatible with your lifestyle preferences.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left section: image and details */}
          <div className="lg:col-span-2 space-y-6">
            <img 
              src={pet.images?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
              alt={pet.name} 
              className="w-full h-[500px] object-cover rounded-2xl shadow-lg"
            />

            <div className="section-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {pet.name}</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                {pet.description || 'No description available for this pet yet.'}
              </p>
              
              {pet.specialNeeds && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Special Needs</h4>
                    <p className="text-yellow-800 text-sm">{pet.specialNeeds}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="section-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Characteristics</h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <InfoItem label="Species" value={pet.species} />
                <InfoItem label="Breed" value={pet.breed || 'Mixed'} />
                <InfoItem label="Gender" value={pet.gender} />
                <InfoItem label="Age" value={`${pet.age?.years || 0} yrs ${pet.age?.months || 0} mo`} />
              </div>
              <TagGroup title="Temperament" tags={pet.labels?.temperament} color="bg-orange-100 text-orange-700" />
              <TagGroup title="Good With" tags={pet.labels?.goodWith} color="bg-green-100 text-green-700" />
            </div>
          </div>

          {/* Right section: action card */}
          <div className="lg:col-span-1">
            <div className="section-card sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</h3>
              <p className="text-gray-600 mb-6">{pet.breed} • {pet.species}</p>

              {/* Shelter information with safe fallback */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex gap-3">
                <MapPin className="w-5 h-5 text-[#FF8C42] shrink-0" />
                <div>
                   <p className="font-medium">{pet.shelterId?.name || 'Shelter Info Unavailable'}</p>
                   <p className="text-sm text-gray-600">{pet.shelterId?.location?.city || 'Location not provided'}</p>
                </div>
              </div>

              {/* Action button with state-based styling */}
              {pet.adoptionStatus === 'Available' ? (
                 <button 
                    onClick={handleToggleRequest} 
                    disabled={loading} 
                    className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-0.5 
                    ${isRequested 
                        ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100' // 取消状态 (红色)
                        : 'bg-gradient-to-r from-[#FF8C42] to-[#FFA726] text-white hover:from-[#e67e3b] hover:to-[#f59e0b]' // 申请状态 (橙色)
                    }`}
                 >
                    {loading ? (
                        'Processing...' 
                    ) : isRequested ? (
                        <><XCircle className="w-6 h-6" /> Cancel Request</>
                    ) : (
                        <><Heart className="w-6 h-6" /> Request to Adopt</>
                    )}
                 </button>
              ) : (
                <div className="p-4 bg-gray-100 rounded-xl text-center font-semibold text-gray-500">
                  Not Available for Adoption
                </div>
              )}

              {/* Contact information with fallback display */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 text-[#FF8C42]"/> 
                  {pet.shelterId?.phone ? pet.shelterId.phone : <span className="text-gray-400 italic">Not provided</span>}
                </div>
                <div className="flex gap-3 items-center">
                  <Mail className="w-4 h-4 text-[#FF8C42]"/> 
                  {pet.shelterId?.email ? pet.shelterId.email : <span className="text-gray-400 italic">Not provided</span>}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      
      {/* Success confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Request Sent!</h3>
            <p className="text-gray-600 mb-6 text-sm">The shelter has received your interest in {pet.name}.</p>
            <button onClick={() => setShowConfirmModal(false)} className="w-full bg-[#FF8C42] text-white py-3 rounded-xl font-semibold">Okay</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const TagGroup = ({ title, tags, color }) => {
  if (!tags?.length) return null;
  return (
    <div className="mt-6">
      <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((t, i) => <span key={i} className={`px-4 py-2 rounded-full text-sm font-medium ${color}`}>{t}</span>)}
      </div>
    </div>
  );
};