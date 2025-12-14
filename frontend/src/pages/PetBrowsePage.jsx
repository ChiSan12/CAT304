import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Filter, Sparkles, Search, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Pet Browsing Component with AI-Powered Matching
 * Displays all available pets, allows filtering, and supports AI recommendations.
 */
export default function PetBrowsePage() {
  const { user } = useAuth();
  
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIMatch, setShowAIMatch] = useState(false);
  
  // State to store the IDs of pets the current user has already requested
  const [myRequests, setMyRequests] = useState([]); 

  const [filters, setFilters] = useState({
    species: 'All',
    size: 'All',
    temperament: 'All'
  });

  // Fetch initial data: all pets and user's requests (if logged in)
  useEffect(() => {
    fetchPets();
    // Only attempt to fetch requests if the user is available and has an ID
    if (user && user.id) {
      fetchMyRequests(user.id);
    } else {
      // Clear requests if user logs out
      setMyRequests([]); 
    }
  }, [user]); // Dependency on user ensures re-fetching upon login/logout

  // Fetch all available pets from the backend
  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/adopters/pets/all');
      const data = await response.json();
      if (data.success) {
        setPets(data.pets);
        setFilteredPets(data.pets);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the current user's submitted adoption requests
  const fetchMyRequests = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/adopters/${userId}/requests`);
      const data = await response.json();
      if (data.success) {
        // Extract pet IDs for checking requested status on PetCard
        const requestIds = data.requests.map(req => 
           // Compatibility: use _id if populated, otherwise use the raw ID string
           typeof req.petId === 'object' ? req.petId._id : req.petId
        );
        setMyRequests(requestIds);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Apply filtering based on selected options
  const applyFilters = () => {
    let result = [...pets];
    if (filters.species !== 'All') result = result.filter(pet => pet.species === filters.species);
    if (filters.size !== 'All') result = result.filter(pet => pet.size === filters.size);
    if (filters.temperament !== 'All') result = result.filter(pet => pet.labels.temperament.includes(filters.temperament));
    setFilteredPets(result);
  };

  // Fetch AI-matched pets (requires user preferences and ID)
  const getAIMatches = async () => {
    if (!user || !user.id) { alert("Please login to use AI Matching! 🤖"); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/adopters/pets/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adopterId: user.id }) // Pass authenticated user ID
      });
      const data = await response.json();
      if (data.success) { setFilteredPets(data.pets); setShowAIMatch(true); }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // Reset all filters and show all pets
  const resetFilters = () => {
    setFilters({ species: 'All', size: 'All', temperament: 'All' });
    setFilteredPets(pets);
    setShowAIMatch(false);
  };

  // Toggle adoption request status (Submit or Cancel)
  const toggleAdoptionStatus = async (petId, isAlreadyRequested) => {
    if (!user || !user.id) {
      alert("Please login to adopt!");
      return;
    }

    try {
      if (isAlreadyRequested) {
        // === Case A: Cancel Request ===
        const confirmCancel = window.confirm("Are you sure you want to cancel this request?");
        if (!confirmCancel) return;

        const res = await fetch(`http://localhost:5000/api/adopters/${user.id}/request/${petId}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
          alert("Request cancelled.");
          // Update local state: remove this ID
          setMyRequests(prev => prev.filter(id => id !== petId));
        }

      } else {
        // === Case B: Submit Request ===
        const res = await fetch(`http://localhost:5000/api/adopters/${user.id}/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ petId })
        });
        const data = await res.json();

        if (data.success) {
          alert("Request submitted! 🎉");
          // Update local state: add this ID
          setMyRequests(prev => [...prev, petId]);
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Pet</h1>
          <p className="text-gray-600 mt-2">Browse available pets or use AI matching</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* AI Match Button - Using Brand Orange Gradient */}
          <div className="mb-6">
            <button
              onClick={getAIMatches}
              // Using Brand Orange Gradient (FF8C42 to FFA726)
              className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FFA726] hover:from-[#e67e3b] hover:to-[#f59e0b] text-white font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-6 h-6" /> Get AI-Powered Recommendations
            </button>
          </div>
          
          {/* Filters (UI kept simple here, assume Tailwind classes) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filter Dropdowns (Example: Focus ring color updated) */}
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Species</label><select value={filters.species} onChange={(e) => setFilters(prev => ({ ...prev, species: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent"><option value="All">All Species</option><option value="Dog">Dogs</option><option value="Cat">Cats</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Size</label><select value={filters.size} onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent"><option value="All">All Sizes</option><option value="Small">Small</option><option value="Medium">Medium</option><option value="Large">Large</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Temperament</label><select value={filters.temperament} onChange={(e) => setFilters(prev => ({ ...prev, temperament: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent"><option value="All">All Temperaments</option><option value="Calm">Calm</option><option value="Playful">Playful</option><option value="Energetic">Energetic</option><option value="Friendly">Friendly</option></select></div>

            {/* Action Buttons - Using Brand Orange */}
            <div className="flex flex-col gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-[#FF8C42] hover:bg-[#e67e3b] text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" /> Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Info - Using Brand Orange Tints */}
        {showAIMatch && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Star className="w-5 h-5 text-[#FF8C42]" />
            <p className="text-orange-900 font-medium">
              Showing AI-matched pets based on your preferences (sorted by compatibility score)
            </p>
          </div>
        )}

        {/* Loading State - Using Brand Orange Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF8C42] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Pet Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <PetCard 
                key={pet._id} 
                pet={pet} 
                showScore={showAIMatch}
                isRequested={myRequests.includes(pet._id)}
                onToggleRequest={toggleAdoptionStatus}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredPets.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No pets found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new arrivals</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual Pet Card Component
 */
function PetCard({ pet, showScore, isRequested, onToggleRequest }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      {/* Top Section: Image and Badge */}
      <div className="relative h-64 bg-gray-200">
        <img
          src={pet.images?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
          alt={pet.name}
          className="w-full h-full object-cover"
        />
        
        {/* Compatibility Score - Using Brand Orange Gradient */}
        {showScore && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#FF8C42] to-[#FFA726] text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{pet.compatibilityScore}% Match</span>
          </div>
        )}

        {/* Status Badge (Kept Green/Yellow for standard status visibility) */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            pet.adoptionStatus === 'Available' 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {pet.adoptionStatus}
          </span>
        </div>
      </div>

      {/* Bottom Section: Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pet.description}</p>
        
        {/* Tags - Using Brand Orange Tints */}
        <div className="flex flex-wrap gap-2 mb-4">
           <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
             {pet.size}
           </span>
           {pet.labels.temperament.slice(0, 2).map((trait, idx) => (
             <span 
               key={idx} 
               className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"
             >
               {trait}
             </span>
           ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 mt-auto">
          <MapPin className="w-4 h-4" />
          <span>{pet.shelterId?.name || 'SPCA Penang'}</span>
        </div>

        {/* Action Button - Main Orange Button */}
        <button
          onClick={() => onToggleRequest(pet._id, isRequested)}
          disabled={pet.adoptionStatus !== 'Available'}
          className={`w-full font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
            ${pet.adoptionStatus !== 'Available'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' // Not Available -> Gray
              : isRequested
                ? 'bg-green-100 text-green-700 border-2 border-green-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500' // Requested -> Green (Hover to Cancel)
                : 'bg-[#FF8C42] hover:bg-[#e67e3b] text-white' // Available -> Brand Orange
            }
          `}
        >
          {pet.adoptionStatus !== 'Available' ? (
             'Not Available'
          ) : isRequested ? (
             // If requested, show Check Icon + Requested
             <> <Check className="w-5 h-5" /> Requested </> 
          ) : (
             // Default state
             <> <Heart className="w-5 h-5" /> Adopt Me </>
          )}
        </button>
      </div>
    </div>
  );
}